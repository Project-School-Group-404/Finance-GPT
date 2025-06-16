from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from dotenv import load_dotenv

load_dotenv()
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.0,
    max_tokens=200,
)

def GeneralQnA(question: str) -> str:
    """
    Answers a General conversational type questions 
    use when the question can answered from pre existing knowledge

    Args:
        question (str): A user question in natural language.

    Returns:
        str: The model-generated answer to the question.
    """
    try:
        response = llm.invoke([HumanMessage(content=question)])
        return response.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"














# import requests
# HF_API_TOKEN = "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"  # 🔐 keep secret in real apps
# API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
# HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}
# def answer(question: str) -> str:
#     prompt = f"Question: {question}\nAnswer:"

#     payload = {
#         "inputs": prompt,
#         "parameters": {
#             "temperature": 0.5,
#             "max_new_tokens": 100
#         }
#     }
#     try:
#         res = requests.post(API_URL, headers=HEADERS, json=payload)
#         res.raise_for_status()
#         outputs = res.json()
#         # Falcon returns full generated text
#         answer = outputs[0]["generated_text"].replace(prompt, "").strip()
#     except Exception as e:
#         answer = f"Error: {str(e)}"

#     return answer

