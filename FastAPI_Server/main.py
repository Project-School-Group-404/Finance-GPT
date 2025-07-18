import os
import uuid
import tempfile
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from langgraph.checkpoint.redis import RedisSaver
from langchain_core.messages import HumanMessage
from google.cloud import storage
from dotenv import load_dotenv

# Import your graph building function
# Make sure your Graph.py is in the same directory or accessible
from Graph import BuildGraph, GraphState

# Load environment variables from .env file
load_dotenv()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="LangGraph Agent API",
    description="An API to interact with a LangGraph agent, with support for file uploads and persistent state.",
    version="1.0.0"
)

# --- Google Cloud Storage Configuration ---
try:
    storage_client = storage.Client()
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise ValueError("GCS_BUCKET_NAME environment variable not set.")
    bucket = storage_client.bucket(bucket_name)
except Exception as e:
    print(f"Error initializing Google Cloud Storage client: {e}")
    # You might want to handle this more gracefully depending on your needs
    storage_client = None
    bucket = None



# --- Redis Checkpointer Configuration ---
# For Cloud Run, you'll typically use a managed Redis instance like MemoryStore.
# The connection details should be stored as environment variables.
redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis_password = os.getenv("REDIS_PASSWORD")

if not redis_host:
    raise ValueError("REDIS_HOST environment variable not set.")

# The checkpointer is what allows the graph to be stateful
try:
    checkpointer = RedisSaver(
        conn_url=f"redis://:{redis_password}@{redis_host}:{redis_port}" if redis_password else f"redis://{redis_host}:{redis_port}"
    )
except Exception as e:
    raise RuntimeError(f"Could not connect to Redis. Please check your connection details. Error: {e}")


# --- Graph Initialization ---
# We build the graph once when the application starts
graph = BuildGraph(checkpointer)


# --- Pydantic Models for Request Bodies ---
class MessageRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

class FileUploadRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

# --- Helper Functions ---
def generate_thread_id(user_id: str, session_id: str) -> str:
    """Generates a consistent thread_id for the graph."""
    return f"{user_id}-{session_id}"

async def upload_files_to_gcs(files: List[UploadFile]) -> dict:
    """
    Uploads files to GCS and returns their paths.
    Handles document and image files separately.
    """
    if not bucket:
        raise HTTPException(status_code=500, detail="Google Cloud Storage is not configured.")

    file_paths = {"uploaded_doc": "", "uploaded_img": ""}
    temp_dir = tempfile.mkdtemp()

    try:
        for file in files:
            # Create a unique filename to avoid collisions in GCS
            unique_filename = f"{uuid.uuid4()}-{file.filename}"
            temp_file_path = os.path.join(temp_dir, file.filename)

            # Save file to a temporary local path
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Upload to GCS
            blob = bucket.blob(unique_filename)
            blob.upload_from_filename(temp_file_path)
            gcs_path = f"gs://{bucket_name}/{unique_filename}"

            # Simple logic to distinguish doc from image based on content type
            if 'image' in file.content_type:
                file_paths["uploaded_img"] = gcs_path
            else: # Assume document for others
                file_paths["uploaded_doc"] = gcs_path

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {e}")
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir)

    return file_paths


# --- API Endpoints ---

@app.post("/invoke", summary="Invoke agent with a message")
async def invoke_agent(request: MessageRequest):
    """
    This endpoint receives a message, user_id, and session_id.
    It invokes the agent and streams the final response.
    """
    thread_id = generate_thread_id(request.user_id, request.session_id)
    config = {"configurable": {"thread_id": thread_id}}

    initial_state: GraphState = {
        "input": request.message,
        "user_id": request.user_id,
        "session_id": request.session_id,
        "messages": [HumanMessage(content=request.message)]
    }

    try:
        # The `stream` method will automatically save the state at each step.
        final_state = None
        async for event in graph.astream(initial_state, config=config):
             if "Aggregator" in event:
                final_state = event["Aggregator"]


        if not final_state or "final_response" not in final_state:
             raise HTTPException(status_code=500, detail="Graph did not produce a final response.")

        return {"response": final_state["final_response"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during graph execution: {e}")


@app.post("/invoke_with_files", summary="Invoke agent with a message and files")
async def invoke_agent_with_files(
    user_id: str = Form(...),
    session_id: str = Form(...),
    message: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    This endpoint handles file uploads along with the message.
    1. Files are uploaded to Google Cloud Storage.
    2. The GCS paths are passed into the graph's state.
    3. The agent is invoked.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")

    # Upload files and get their GCS paths
    gcs_file_paths = await upload_files_to_gcs(files)

    thread_id = generate_thread_id(user_id, session_id)
    config = {"configurable": {"thread_id": thread_id}}

    # Prepare the initial state for the graph
    initial_state: GraphState = {
        "input": message,
        "user_id": user_id,
        "session_id": session_id,
        "uploaded_doc": gcs_file_paths.get("uploaded_doc"),
        "uploaded_img": gcs_file_paths.get("uploaded_img"),
        "messages": [HumanMessage(content=message)]
    }

    try:
        final_state = None
        async for event in graph.astream(initial_state, config=config):
            if "Aggregator" in event:
                final_state = event["Aggregator"]

        if not final_state or "final_response" not in final_state:
             raise HTTPException(status_code=500, detail="Graph did not produce a final response.")

        return {"response": final_state["final_response"]}

    except Exception as e:
        # This will catch errors from file upload or graph execution
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # This is for local testing. On Cloud Run, you'll use gunicorn.
    uvicorn.run(app, host="0.0.0.0", port=8080)
