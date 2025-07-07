import streamlit as st
import boto3
from PIL import Image
import io
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize AWS & Groq Clients
textract = boto3.client('textract', region_name='us-east-1')
client = OpenAI(api_key=os.getenv('GROQ_API_KEY'), base_url="https://api.groq.com/openai/v1")

def image_llm(uploaded_file):
    st.title("📄 FinTech Document Q&A (Textract + LLaMA3)")

    if uploaded_file is None:
        st.info("Please upload a document to get started.")
        return

    file_bytes = uploaded_file.read()

    # Display image if applicable
    if uploaded_file.type.startswith("image/"):
        image = Image.open(io.BytesIO(file_bytes))
        st.image(image, caption="Uploaded Image", width=700)

    # Step 1: Extract Text via Textract
    with st.spinner("🔍 Extracting text from document..."):
        response = textract.analyze_document(
            Document={'Bytes': file_bytes},
            FeatureTypes=['FORMS', 'TABLES']
        )
        extracted_text = ''
        for block in response['Blocks']:
            if block['BlockType'] == 'LINE':
                extracted_text += block['Text'] + '\n'

    # Show extracted text
    # st.subheader("📜 Extracted Text:")
    # st.text_area("Textract Output", value=extracted_text, height=300)

    # Step 2: Get User Question
    user_question = st.text_input("💬 Ask a question about this document:")

    # Step 3: Send to LLM
    if user_question:
        with st.spinner("🧠 Thinking..."):
            system_prompt = (
                "You are a tool being used by an agent. You will be given the extracted text from an image. "
                "It could be any legal document related to finance, in the form of a fill-up form or just bank statements. "
                "Your job is to take this info given to you in the form of text, process it and give answers to the questions asked about the text you have analysed."
            )

            user_prompt = extracted_text + "\n\nQuestion: " + user_question

            response = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5
            )

            st.subheader("🤖Answer:")
            st.markdown(response.choices[0].message.content)
