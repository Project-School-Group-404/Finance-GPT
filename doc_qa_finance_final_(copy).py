import os
from pathlib import Path
from PIL import Image
from io import BytesIO
import base64
from IPython.display import display, HTML
from langchain_docling import DoclingLoader
from langchain_docling.loader import ExportType
from docling.document_converter import DocumentConverter
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
)
from docling.document_converter import PdfFormatOption
from docling.datamodel.base_models import InputFormat
from transformers import AutoTokenizer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_core.prompts import PromptTemplate
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_huggingface import HuggingFaceEndpoint
from langchain_huggingface import ChatHuggingFace
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

pipeline_options = PdfPipelineOptions(
    generate_page_images=True,
    images_scale = 1.00,
)
# maps the input file type to the specific processing configuration, allowing the converter to know: 1. What type of file it’s dealing with, 2. How it should handle that file type
format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}

converter = DocumentConverter(format_options=format_options)
sources = ["/content/Balance Sheet.pdf",]

# 1. Dictionary comprehension approach
# Dictionary where it loops through each file in the sources, converter.convert(source) to process each document, .document is used to extract only the acutal content representation of the file
# stores it in a dictionary with the file path as the key
conversions = {source: converter.convert(source=source).document for source in sources}

# Good for batch processing if you're dealing with many files.
# {
#     "/content/microsoftFY 2024.pdf": <Document object>,
#     "another_file.pdf": <Document object>,
# }

# Commented out IPython magic to ensure Python compatibility.
# %%time
# document_path = Path("/content/Balance Sheet.pdf")
# #  2. Single conversion with explicit timing
# result = converter.convert(document_path)
# document = result.document

document = result.document
print(document.export_to_text())

def image_to_base64(image: Image.Image) -> str:
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def display_page(content: str, image: Image.Image):
    html_template = f"""
    <div style="display: flex; align-items: flex-start; gap: 40px; font-family: monospace;">
        <div style="flex: 1; max-width: 45%;">
            <img src="data:image/png;base64,{image_to_base64(image)}" style="width: 100%; height: auto; padding: 5px;">
        </div>
        <div style="flex: 1; max-width: 45%; white-space: pre-wrap; padding: 10px;">
            <div style="word-wrap: break-word; max-width: 120ch;">
                {content}
            </div>
        </div>
    </div>
    """
    display(HTML(html_template))

n_pages = len(document.pages)
n_pages

pages = []
for page_num in range(1, n_pages + 1):
  pages.append(
      (
          document.export_to_markdown(page_no=page_num),
          document.pages[page_num].image.pil_image
      )
  )

display_page(*pages[0])

embeddings_model_path = "ibm-granite/granite-embedding-30m-english"
embeddings_model = HuggingFaceEmbeddings(model_name=embeddings_model_path,)
embeddings_tokenizer = AutoTokenizer.from_pretrained(embeddings_model_path)

from langchain_groq import ChatGroq
GROQ_API_KEY = "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"

model = ChatGroq(groq_api_key=GROQ_API_KEY,model="llama-3.3-70b-versatile")

model.invoke("What is the capital of India?")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=200)

all_chunks = {}
for source, document in conversions.items():
    full_text = document.export_to_text()
    chunks = text_splitter.split_text(full_text)
    all_chunks[source] = chunks

for source, chunks in all_chunks.items():
    print(f"{source}: {len(chunks)} chunks")

for source, chunks in all_chunks.items():
    print(f"\n=== Chunks from {source} ===")
    for i, chunk in enumerate(chunks, start=1):
        print(f"\n--- Chunk {i} ---\n{chunk}")

# preparing chunks for use with PineCone
for source, chunks in all_chunks.items():
    docs = [Document(page_content=chunk, metadata={"chunk_id": i}) for i, chunk in enumerate(chunks)]

prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
    You are a highly knowledgeable financial assistant. Use only the information provided in the context below to answer the user's question. Do not use prior knowledge.

    If the context does not contain the information needed, respond with:
    "The answer is not available in the provided document."

    Use the following context to answer the question.
    ---
    Context:
    {context}
    ---

    Question: {question}

    Answer:
    """
)

chain = prompt | model

os.environ["PINECONE_API_KEY"] = "pcsk_2RHjZi_JGNkT8eM8fPTate7MCSPPnz5iuc4rdgd9J3pgzAhUz41YvcaHuZiyzVhGiw3gry"
os.environ["PINECONE_ENVIRONMENT"] = "us-east-1"

pinecone_client = Pinecone(
    api_key=os.environ["PINECONE_API_KEY"],
    environment=os.environ["PINECONE_ENVIRONMENT"],
)

index_name = "tryme"
pinecone = PineconeVectorStore.from_documents(
    documents = docs,
    embedding = embeddings_model,
    index_name = index_name,
)

chain = (
    {"context" : pinecone.as_retriever(), "question":RunnablePassthrough()}
    |prompt
    |model
)

chain.invoke("Who is Atanu Chakraborty?")