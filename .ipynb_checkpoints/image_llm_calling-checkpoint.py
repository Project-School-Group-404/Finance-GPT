import streamlit as st
from image_textract import image_llm

uploaded_file = st.file_uploader("Upload a document", type=["png", "jpg", "jpeg", "pdf"])
image_llm(uploaded_file)
