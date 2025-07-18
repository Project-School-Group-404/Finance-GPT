"""
FastAPI server with LangGraph integration, SQLite checkpointing, and session management
Compatible with GCP deployment - No Redis required!
"""

import os
import uuid
import sqlite3
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from datetime import datetime

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# LangGraph imports
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph

# Import your graph
from Graph import buildGraph, GraphState

# Configuration
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "checkpoints.sqlite")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "50000000"))  # 50MB default

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global variables for storing compiled graphs per session
compiled_graphs: Dict[str, Any] = {}
sqlite_checkpointer = None

class ChatRequest(BaseModel):
    userId: str
    message: str
    history: Optional[list] = []
    documentName: Optional[str] = None
    documentType: Optional[str] = None
    documentSize: Optional[int] = None
    documentPath: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    status: str = "success"

class UploadResponse(BaseModel):
    filename: str
    filepath: str
    size: int
    status: str = "success"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan manager for FastAPI app initialization and cleanup
    """
    global sqlite_checkpointer

    # Startup
    print("🚀 Starting FastAPI server with SQLite checkpointer...")

    try:
        # Create SQLite connection
        sqlite_conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)

        # Initialize SQLite checkpointer
        sqlite_checkpointer = SqliteSaver(sqlite_conn)

        # Setup SQLite tables (creates tables if they don't exist)
        sqlite_checkpointer.setup()

        print(f"✅ SQLite checkpointer initialized successfully!")
        print(f"📁 Database file: {SQLITE_DB_PATH}")
        print(f"💾 Persistent storage ready - your conversations will be saved!")

        yield

    except Exception as e:
        print(f"❌ Failed to initialize SQLite checkpointer: {e}")
        raise

    finally:
        # Shutdown
        print("🛑 Shutting down FastAPI server...")
        compiled_graphs.clear()

        if sqlite_checkpointer and hasattr(sqlite_checkpointer, 'conn'):
            try:
                sqlite_checkpointer.conn.close()
                print("✅ SQLite connection closed")
            except Exception as e:
                print(f"⚠️ Error closing SQLite connection: {e}")

# Create FastAPI app
app = FastAPI(
    title="LangGraph FastAPI Server with SQLite",
    description="FastAPI server with LangGraph integration and SQLite checkpointing",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure according to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_or_create_session_id(user_id: str) -> str:
    """
    Generate a unique session ID for each user session
    """
    return f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

def get_compiled_graph(session_id: str) -> Any:
    """
    Get or create a compiled graph for the session
    Each session gets its own compiled graph instance
    """
    global compiled_graphs, sqlite_checkpointer

    if session_id not in compiled_graphs:
        print(f"📊 Compiling new graph for session: {session_id}")

        # Build and compile the graph with SQLite checkpointer
        graph_builder = buildGraph()
        compiled_graph = graph_builder.compile(checkpointer=sqlite_checkpointer)

        # Store the compiled graph for this session
        compiled_graphs[session_id] = compiled_graph
        print(f"✅ Graph compiled and cached for session: {session_id}")

    return compiled_graphs[session_id]

@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Handle file uploads - Files are stored and their paths returned
    """
    try:
        # Generate unique filename to avoid conflicts
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        print(f"📁 File uploaded: {file.filename} -> {file_path}")

        return UploadResponse(
            filename=file.filename or unique_filename,
            filepath=file_path,
            size=len(content)
        )

    except Exception as e:
        print(f"❌ File upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint that processes user messages through the LangGraph
    """
    try:
        # Generate session ID for this user
        session_id = get_or_create_session_id(request.userId)

        # Get compiled graph for this session (compiles once per session)
        compiled_graph = get_compiled_graph(session_id)

        # Prepare the input state for the graph
        graph_input = {
            "input": request.message,
            "user_id": request.userId,
            "session_id": session_id,
            "messages": [],
        }

        # Add uploaded document information if present
        if request.documentPath:
            graph_input["uploaded_doc"] = request.documentPath
            print(f"📄 Document attached: {request.documentName} at {request.documentPath}")

        # Configure the graph execution with thread_id for checkpointing
        config = {
            "configurable": {
                "thread_id": session_id
            }
        }

        print(f"🤖 Processing message for user {request.userId}, session {session_id}")

        # Invoke the graph with user query, user id, session id
        result = compiled_graph.invoke(graph_input, config)

        # Extract the final response
        final_response = result.get("final_response", "I'm sorry, I couldn't process your request.")

        print(f"✅ Response generated for session {session_id}")
        print(f"💾 State automatically saved to SQLite database")

        return ChatResponse(reply=final_response)

    except Exception as e:
        print(f"❌ Chat processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """
    Comprehensive health check for monitoring
    """
    try:
        # Check if SQLite database file exists and is accessible
        if os.path.exists(SQLITE_DB_PATH):
            # Try to connect to SQLite database
            test_conn = sqlite3.connect(SQLITE_DB_PATH)
            test_conn.execute("SELECT 1")
            test_conn.close()
            sqlite_status = "healthy"
        else:
            sqlite_status = "database file not found"
    except Exception as e:
        sqlite_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "database": "SQLite",
        "sqlite_status": sqlite_status,
        "database_path": SQLITE_DB_PATH,
        "upload_dir": UPLOAD_DIR,
        "active_sessions": len(compiled_graphs),
        "persistence": "enabled"
    }

@app.get("/sessions")
async def list_sessions():
    """
    List all active sessions (for debugging)
    """
    return {
        "active_sessions": len(compiled_graphs),
        "session_ids": list(compiled_graphs.keys())
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True
    )
