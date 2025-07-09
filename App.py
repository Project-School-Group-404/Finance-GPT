import os
import shutil
from langgraph.prebuilt import create_react_agent 
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv
from fastapi import FastAPI, File, Request, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests

# Load environment variables
load_dotenv()

print(f"##### Main App Initialization #####")
try:
    from Doc_QnA_RAG import rag_qa_tool, setup_rag_system
    from News import financial_news_search
    print("Successfully imported the tools\n\n")
except ImportError as e:
    print(f"ERROR: Could not import a tool. {e}")
    raise

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

@tool
def news_tool(ques: str) -> str:
    """
    Use this tool ONLY for CURRENT, BREAKING financial news, market updates, or stock prices.
    If the question requires information from a specific document, DO NOT use this tool.
    If the question is about historical data or general financial concepts, DO NOT use this tool.
    Examples:
    - "What is the current price of NVDA?"
    - "Is there any breaking news about the Fed?"
    - "What are the latest market updates?"
    """
    return financial_news_search(ques)

@tool
def doc_qna_tool(ques: str) -> str:
    """
    Use this tool when the user asks a question that requires retrieving information from an uploaded document or PDF.
    This tool can extract answers directly from the content of user-provided files.
    Do NOT use this tool for general finance knowledge or web search queries.
    """
    return rag_qa_tool(ques)

system_message = SystemMessage(content="""
You are Finance GPT, a helpful financial assistant.

You have access to:
- A user-uploaded document (if available)
- A tool called doc_qna_tool for answering questions based on that document
- A tool called news_tool for retrieving current market news or stock prices

Instructions:
1. If a document is available and the user's question could reasonably be related to it (e.g. it asks about data, policies, values, definitions, or anything likely to be found in a report), use `doc_qna_tool` even if the document is not explicitly mentioned.
2. Use `news_tool` only for **current or live** financial news or market updates.
3. For general financial knowledge, answer directly.
4. Be conversational and professional.
5. If you use a tool, embed its output naturally in your answer.
6. If no document is uploaded, do not use doc_qna_tool.

Remember: You always prefer using the document if a document is uploaded and the user asks a related question.
""")

tools = [doc_qna_tool, news_tool]
agent = create_react_agent(model=llm, tools=tools, prompt=system_message)
print("LangGraph ReAct agent created.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from typing import List, Optional

class QueryRequest(BaseModel):
    userId: int
    message: str
    history: Optional[List[str]] = []

@app.post("/chat")
def chat_endpoint(request: QueryRequest):
    print(f"Received message from user {request.userId}: {request.message}")
    messages = [HumanMessage(content=msg) if i % 2 == 0 else AIMessage(content=msg)
                for i, msg in enumerate(request.history)]
    messages.append(HumanMessage(content=request.message))

    try:
        result = agent.invoke({"messages": messages})
        response = next((msg.content for msg in reversed(result["messages"]) if isinstance(msg, AIMessage)),
                        "I apologize, but I couldn't generate a proper response.")
        
        # ✅ Save chat to Node.js backend (or whatever handles DB)
        try:
            r = requests.post("http://localhost:3000/api/chat", json={
                "userId": request.userId,
                "userMessage": request.message,
                "assistantReply": response
            })
            print(f"SaveChat Response: {r.status_code} - {r.text}")
        except Exception as save_err:
            print(f" SaveChat Error: {save_err}")

        return {"reply": response, "history": [msg.content for msg in result["messages"]]}
    
    except Exception as e:
        print(f"Error: {e}")
        return {"reply": f"Error: {e}", "history": request.history}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        setup_rag_system(temp_path)
        print(f"Document {file.filename} processed successfully.")
        return {"message": "Document processed successfully"}
    except Exception as e:
        print(f"Error processing document: {e}")
        return {"error": str(e)}