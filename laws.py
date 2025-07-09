import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()

def law_qna(question: str) -> str:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",  # or "gemini-2.0-flash" for faster, cheaper
        temperature=0.3,
        max_tokens=None
    )

    system_message = SystemMessage(content="""
You are a legal assistant specialized in the financial legal framework of India. 
When asked about Indian laws, acts, or regulations, respond with precise references to sections, clauses, or rules. 
Always ensure legal accuracy in your answers.
""")

    messages = [system_message, HumanMessage(content=question)]
    response = llm.invoke(messages)

    return response.content
