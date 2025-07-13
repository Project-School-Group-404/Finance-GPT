import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage,HumanMessage
from langchain.tools import tool

load_dotenv(override=True)
api_key = os.getenv('GROQ_API_KEY')
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY")
)

@tool
def gen_qna(question: str)->str:
    """this tool is used for answering general questions"""
    Messages = [SystemMessage(content="You are a tool being used by an agent. Your job is to deliver a proper detailed answer for any question being asked."),
                HumanMessage(content=question)]
    result = llm.invoke(Messages).content
    return result


# print(gen_qna.invoke({"question" : "what is blockchain?"}))