import os
import requests
import json
from typing import List
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from IPython.display import Markdown, display, update_display
from openai import OpenAI

load_dotenv(override=True)
api_key = os.getenv('GROQ_API_KEY')

def gen_qna(question: str)->str:
    MODEL = "llama3-70b-8192"
    client = OpenAI(api_key= os.getenv('GROQ_API_KEY'), base_url="https://api.groq.com/openai/v1") 
    system_prompt= "You are a tool being used by an agent. Your job is to deliver a proper detailed answer for any question being asked."
    response= client.chat.completions.create(
        model=MODEL,
        messages= [
            {'role':'system', 'content':system_prompt},
            {'role':'user', 'content':question}
        ],
        temperature= 0.5
    )
    return response.choices[0].message.content
    # response=""
    # display_handle= display(Markdown(""), display_id=True)
    # for chunk in stream:
    #     response+= chunk.choices[0].delta.content or ''
    #     response = response.replace("```","").replace("markdown", "")
    #     update_display(Markdown(response), display_id= display_handle.display_id)
