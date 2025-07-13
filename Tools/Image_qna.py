import streamlit as st
import boto3
import io
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage
import pprint

load_dotenv()

textract = boto3.client("textract", region_name="us-east-1")
llm = ChatGroq(model="llama3-70b-8192", temperature=0.0)


@tool
def image_qna(uploaded_file, query: str):
    """Use this tool to answer questions from the uploaded image"""
    if isinstance(uploaded_file, str):
        with open(uploaded_file, "rb") as file:
            file_bytes = file.read()
    else:
        file_bytes = uploaded_file.read()

    response = textract.analyze_document(
        Document={"Bytes": file_bytes}, FeatureTypes=["FORMS", "TABLES"]
    )
    extracted_text = ""
    for block in response["Blocks"]:
        if block["BlockType"] == "LINE":
            extracted_text += block["Text"] + "\n"

    system_prompt = """You are a tool being used by an agent. You will be given the extracted text from an image. 
        It could be any legal document related to finance, in the form of a fill-up form or just bank statements.
        Your job is to take this info given to you in the form of text, process it and give answers to the questions asked about the text you have analyzed."""

    user_prompt = extracted_text + "\n\nQuestion: " + query

    messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
    response = llm.invoke(messages)
    return response.content


# result = Image_qna.invoke({
#     "uploaded_file": "/home/saikrishnanair/balancesheet.png",
#     "query": "What document is this?"
# })
