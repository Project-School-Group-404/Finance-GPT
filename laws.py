import os
from langchain_core.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
from pprint import pprint
from IPython.display import Markdown, display
import trafilatura
from openai import OpenAI

load_dotenv()
api_key= os.getenv('GROQ_API_KEY')

def law_qna(question: str)->str:
    MODEL = "llama3-70b-8192"
    client = OpenAI(api_key= os.getenv('GROQ_API_KEY'), base_url="https://api.groq.com/openai/v1") 
    system_prompt= "You are a tool being used by an agent. You will be asked questions about legal framework of india, including acts, rules , and reulations. You job is to give the answer properly using proper accurate information, such as section number, etc."
    response= client.chat.completions.create(
        model=MODEL,
        messages= [
            {'role':'system', 'content':system_prompt},
            {'role':'user', 'content':question}
        ],
        temperature= 0.5
    )
    return display(Markdown(response.choices[0].message.content))

