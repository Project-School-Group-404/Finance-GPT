#!/usr/bin/env python3
"""
Test script for the updated FastAPI server with SQLite checkpointer
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_upload():
    """Test file upload"""
    print("\n📁 Testing file upload...")

    # Create a test file
    test_content = "This is a test document for SQLite checkpointer testing"
    with open("test_document.txt", "w") as f:
        f.write(test_content)

    # Upload the file
    with open("test_document.txt", "rb") as f:
        files = {"file": ("test_document.txt", f, "text/plain")}
        response = requests.post(f"{BASE_URL}/upload", files=files)

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Upload successful: {result['filename']}")
        print(f"File path: {result['filepath']}")
        return result['filepath']
    else:
        print(f"Upload failed: {response.text}")
        return None

def test_chat(document_path=None):
    """Test chat endpoint"""
    print("\n🤖 Testing chat endpoint...")

    chat_data = {
        "userId": "test_user_sqlite",
        "message": "Hello! This is a test message for SQLite persistence.",
        "history": []
    }

    if document_path:
        chat_data.update({
            "documentName": "test_document.txt",
            "documentPath": document_path
        })

    response = requests.post(f"{BASE_URL}/chat", json=chat_data)
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Chat response: {result['reply']}")
        return True
    else:
        print(f"Chat failed: {response.text}")
        return False

def test_persistence():
    """Test that conversations are persisted"""
    print("\n💾 Testing persistence...")

    # First conversation
    chat_data = {
        "userId": "persistence_test_user",
        "message": "Remember that my favorite color is blue",
        "history": []
    }
    response = requests.post(f"{BASE_URL}/chat", json=chat_data)
    print(f"First message status: {response.status_code}")

    # Wait a moment
    time.sleep(2)

    # Second conversation to test memory
    chat_data["message"] = "What is my favorite color?"
    response = requests.post(f"{BASE_URL}/chat", json=chat_data)
    print(f"Second message status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Memory test response: {result['reply']}")
        return True
    return False

def main():
    """Run all tests"""
    print("🚀 Starting SQLite FastAPI Server Tests")
    print("=" * 50)

    # Test health
    if not test_health():
        print("❌ Health check failed - make sure server is running")
        return

    # Test upload
    uploaded_file_path = test_upload()

    # Test chat without document
    test_chat()

    # Test chat with document
    if uploaded_file_path:
        test_chat(uploaded_file_path)

    # Test persistence
    test_persistence()

    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("💾 Check the checkpoints.sqlite file in your project directory")
    print("📁 Check the uploads/ directory for uploaded files")

if __name__ == "__main__":
    main()
