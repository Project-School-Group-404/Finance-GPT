import os
from pathlib import Path
from PIL import Image
from io import BytesIO
import base64
# from IPython.display import display, HTML
from langchain_docling import DoclingLoader
from langchain_docling.loader import ExportType
from docling.document_converter import DocumentConverter
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
)
from docling.document_converter import PdfFormatOption
from docling.datamodel.base_models import InputFormat
# from transformers import AutoTokenizer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_huggingface import HuggingFaceEndpointEmbeddings
# from langchain_huggingface import HuggingFaceEndpoint
# from langchain_huggingface import ChatHuggingFace
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_groq import ChatGroq
from langchain_core.tools import tool

from dotenv import load_dotenv
load_dotenv()


print("##### API CHECK Begins #####")

if 'HUGGINGFACEHUB_API_KEY' in os.environ:
    print(f"HUGGINGFACEHUB_API_KEY is set")
else:
    print("WARNING: HUGGINGFACEHUB_API_KEY not found in environment variables")


if 'PINECONE_API_KEY' in os.environ:
    print(f"PINECONE_API_KEY is set")
else:
    print("WARNING: PINECONE_API_KEY not found in environment variables.")


if 'PINECONE_ENVIRONMENT' in os.environ:
    print(f"PINECONE_ENVIRONMENT: is set to {os.environ['PINECONE_ENVIRONMENT']}")
else:
    print("WARNING: PINECONE_ENVIRONMENT not found in environment variables.")

print("##### API CHECK ENDS #####")

# Initialize your existing components

pipeline_options = PdfPipelineOptions(
    generate_page_images=True,
    images_scale = 1.00,
)
format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
converter = DocumentConverter(format_options=format_options)
print("Docling DocumentConverter initialized.")

# embeddings_model = HuggingFaceEndpointEmbeddings(
#     huggingfacehub_api_token=os.environ["HUGGINGFACEHUB_API_KEY"], 
#     model="ibm-granite/granite-embedding-30m-english"
# )

embeddings = HuggingFaceEmbeddings(
    model_name="ibm-granite/granite-embedding-30m-english",
    model_kwargs={
        'device': 'cpu',  # Change to 'cuda' if you have GPU
        'trust_remote_code': True  # Important for IBM Granite models
    },
    encode_kwargs={'normalize_embeddings': True}
)
print("HuggingFaceEndpointEmbeddings model initialized.")

model = ChatGroq(model="llama-3.1-8b-instant",temperature=0.0)
print(f"LLM initialized with temperature={model.temperature}.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=200)
print(f"RecursiveCharacterTextSplitter initialized")

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
print("PromptTemplate defined.\n")

pinecone_client = PineconeVectorStore(
    index_name="granite-doc-rag-index",
    embedding=embeddings,
    pinecone_api_key=os.getenv("PINECONE_API_KEY")  # Make sure this is set
)
print("Pinecone initialized.")

# Global variables to store processed data
chain = None
print("RAG chain is initialized to None.")

def setup_rag_system(sources):
    """Setup the RAG system with document sources"""

    global chain
    print(f"\n--- Entering setup_rag_system ---")
    print(f"Sources received for processing: {sources}")


    print(f"Converting document: from {sources}[Feel free to regret life choices]")
    conversions = {source: converter.convert(source=source).document for source in sources}



    
    all_chunks = {}
    for source, document in conversions.items():
        full_text = document.export_to_text()
        print("exporting to text")
        print(f"Text length: {len(full_text)} characters.")

        chunks = text_splitter.split_text(full_text)
        all_chunks[source] = chunks
        print(f"Generated {len(chunks)} chunks for {source}.")

    # Prepare chunks for PineCone
    docs = []
    for source, chunks in all_chunks.items():
        print(f"Preparing {len(chunks)} documents for embedding and Pinecone upload from {source}.")
        docs.extend([Document(page_content=chunk, metadata={"chunk_id": i, "source": source}) for i, chunk in enumerate(chunks)])
        print(f"Total documents prepared for embedding: {len(docs)}")

    # index_name = "financedocs"
    # index = pinecone_client.Index(index_name)
    # vector_store = PineconeVectorStore(index_name=index, embedding=embeddings)
    pinecone_client.add_documents(docs)
    print(f" yayy! Documents uploaded to Pinecone.")





# OUTDATED SHIT
    # print(f"Uploading {len(docs)} documents to Pinecone index '{index_name}'.")
    # pinecone = PineconeVectorStore.from_documents(
    #     documents = docs,
    #     embedding = embeddings_model,
    #     index_name = index_name,
    # )
    # print(f" yayy! Documents uploaded to Pinecone.")


    print("Creating te RAG chain...")
    chain = (
        {"context" : pinecone_client.as_retriever(), "question":RunnablePassthrough()}
        |prompt
        |model
    )
    print("RAG chain created.")

@tool
def rag_qa_tool(query: str) -> str:
    """Use this tool when the user asks questions about an uploaded document or file. 
    This tool can answer questions based on the content of documents the user has provided."""
    
    global chain
    print(f"\nEntering rag_qa_tool")
    print(f"Query received by tool: '{query}'")
    
    if chain is None:
        return "No document has been processed. Please upload and process a document first."
    
    try:
        print(f"Invoking RAG chain with query: '{query}'")
        result = chain.invoke(query)
        print(f"RAG chain invocation successful.")

        print(f"RAG tool returning content: {result.content[:100]}...")
        return result.content if hasattr(result, 'content') else str(result)
    
    except Exception as e:
        return f"Error processing document query: {str(e)}"












