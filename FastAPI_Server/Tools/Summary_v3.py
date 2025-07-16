import os
import time
import hashlib
from dotenv import load_dotenv
from unstract.llmwhisperer import LLMWhispererClientV2
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI



load_dotenv()

# Model & Embedding setup
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/static-retrieval-mrl-en-v1"
)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=8000, chunk_overlap=800)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY")
)
llm_whisperer = LLMWhispererClientV2(
    base_url="https://llmwhisperer-api.us-central.unstract.com/api/v2",
    api_key=os.getenv("LLM_WHISPERER_API_KEY"),
)

# Prompt template
final_prompt = PromptTemplate(
    input_variables=["context", "num_points"],
    template="""
    You are a senior financial analyst.

    Summarize the following corporate financial content into exactly {num_points} factual bullet points.

    --- BEGIN DOCUMENT ---
        {context}
    --- END DOCUMENT ---

    Instructions:
    - Use only the information from the context.
    - Do NOT hallucinate or fabricate numbers.
    - Each bullet must be concise, meaningful, and unique.
    - Include specific details like revenue changes, margins, segment performance, executive quotes, and future outlooks.
    - Do not add any introduction, heading, summary sentence, or title. Only return the bullet points.

    Return only:
    1. [Category]: [Summary point]
    2. ...
    """,
)

# Cache directories
FAISS_CACHE_DIR = "./faiss_cache"
TEXT_CACHE_DIR = "./text_cache"
os.makedirs(FAISS_CACHE_DIR, exist_ok=True)
os.makedirs(TEXT_CACHE_DIR, exist_ok=True)


def get_file_hash(file_path: str) -> str:
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()


def get_cached_text_path(file_hash: str):
    return os.path.join(TEXT_CACHE_DIR, f"{file_hash}.txt")


def pdf_to_text_cached(file_path: str, file_hash: str) -> str:
    text_path = get_cached_text_path(file_hash)
    if os.path.exists(text_path):
        print("Using cached extracted PDF text.")
        return open(text_path, "r", encoding="utf-8").read()

    print("Calling Whisperer to extract PDF text...")
    result = llm_whisperer.whisper(file_path=file_path)
    while True:
        status = llm_whisperer.whisper_status(result["whisper_hash"])
        if status["status"] == "processed":
            result = llm_whisperer.whisper_retrieve(result["whisper_hash"])
            extracted_text = result["extraction"]["result_text"]
            with open(text_path, "w", encoding="utf-8") as f:
                f.write(extracted_text)
            print("✅ PDF text extracted and cached.")
            return extracted_text
        time.sleep(5)


def build_faiss_index(file_hash: str, chunks: list):
    index_dir = os.path.join(FAISS_CACHE_DIR, file_hash)
    if os.path.exists(os.path.join(index_dir, "index.faiss")):
        print("FAISS index already exists.")
        return

    print("Creating FAISS index...")
    os.makedirs(index_dir, exist_ok=True)
    vectorstore = FAISS.from_texts(texts=chunks, embedding=embedding_model)
    vectorstore.save_local(index_dir)
    print(f"FAISS index saved at: {index_dir}")


def summarize_pdf(
    file_path: str,
    user_query: str = "summarize the full document",
    num_points: int = 8,
    page_range: tuple = None,
) -> str:
    file_hash = get_file_hash(file_path)

    # Step 1: Get text from cache or Whisperer
    full_text = pdf_to_text_cached(file_path, file_hash)

    # Step 2: Build FAISS index (if missing)
    chunks = text_splitter.split_text(full_text)
    build_faiss_index(file_hash, chunks)

    # Step 3: Optional slicing
    if page_range:
        pages = full_text.split("\f")
        start, end = page_range
        selected_text = "\n".join(pages[start - 1 : end])
    else:
        selected_text = full_text

    # Step 4: Summarize
    prompt = final_prompt.format(context=selected_text, num_points=num_points)
    response = llm.invoke(prompt).content
    return response


# Example usage
# print(summarize_pdf("temp_temp_microsoftFY 2024.pdf")
