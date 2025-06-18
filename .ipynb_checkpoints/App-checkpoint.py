# import os
# from langgraph.prebuilt import create_react_agent
# from langchain_core.tools import tool
# from langchain_groq import ChatGroq
# from langchain_core.messages import HumanMessage, AIMessage
# import streamlit as st
# import re
# from dotenv import load_dotenv
# load_dotenv()


# # Import your RAG tool from the other file
# print(f"##### Main App Initialization #####")
# try: 
#     #from Doc_QnA_RAG import rag_qa_tool, setup_rag_system
#     from News import financial_news_search
#     from GeneralQnA import GeneralQnA
#     print("Successfully imported the tools")
# except ImportError as e:
#     print(f"ERROR: Could not import a tool. Make sure the file is in the correct directory. {e}")
#     st.error("Fatal Error: Could not load certain tools. Please check server logs.")
#     st.stop()




# print(f"GROQ_API_KEY set: {'GROQ_API_KEY' in os.environ}")
# # Initialize LLM
# llm = ChatGroq(model="llama-3.3-70b-versatile")



# # Create list of all tools
# tools = [financial_news_search,GeneralQnA]
# #tools = [rag_qa_tool,financial_news_search,GeneralQnA]
# print(f" tools defined: {tools}")


# # tools = [rag_qa_tool, general_qa_tool, web_search_tool]

# # Create the LangGraph agent
# agent = create_react_agent(llm, tools)
# print("LangGraph ReAct agent created.")




# def process_query(user_input, chat_history=None):
#     """Process user query through the LangGraph agent"""
#     print(f"\n--- Entering process_query ---")


#     if chat_history is None:
#         chat_history = []
    
#     # Add user message to history
#     messages = chat_history + [HumanMessage(content=user_input)]
#     print(f"Messages to be sent to the llm (current + history): {len(messages)} messages.")

#     try:
#         # Invoke the agent
#         print(f"Invoking the agent with messages...")
#         result = agent.invoke({"messages": messages})

#         # Extract the final response
#         final_response = result["messages"][-1]
#         if hasattr(final_response,'content'):
#             final_response=final_response.content
#         else:
#             final_response = str(final_response)

#         print(f"Extracted final_response (last message from agent): {final_response[:100]}...") # Print first 100 chars

        
#         return final_response, result["messages"]
        
#     except Exception as e:
#         return f"Error processing query: {str(e)}", messages

# import streamlit as st
# import time
# from langchain.schema import HumanMessage, AIMessage  # or your message classes

# def main():
#     st.set_page_config(page_title="Finance GPT", page_icon="💰")
#     st.title("💬 Finance GPT")

#     # Initialize chat history and file status
#     if "chat_history" not in st.session_state:
#         st.session_state.chat_history = []
#     if "processed_file" not in st.session_state:
#         st.session_state.processed_file = None

#     # Tools section like ChatGPT's +
#     with st.expander("➕ Tools", expanded=False):
#         uploaded_file = st.file_uploader("Upload PDF", type=['pdf'], label_visibility="collapsed")

#         if uploaded_file:
#             if st.session_state.processed_file != uploaded_file.name:
#                 with open(f"temp_{uploaded_file.name}", "wb") as f:
#                     f.write(uploaded_file.getbuffer())
#                 print(f"Saved uploaded file to: temp_{uploaded_file.name}")

#                 with st.spinner("🔄 Processing document..."):
#                     try:
#                         #setup_rag_system([f"temp_{uploaded_file.name}"])
#                         st.success("✅ Document processed successfully!")
#                         #st.session_state.processed_file = uploaded_file.name
#                         print("setup_rag_system completed successfully.")
#                     except Exception as e:
#                         st.error(f"❌ Error processing document: {str(e)}")
#             else:
#                 st.info(f"ℹ️ '{uploaded_file.name}' already processed!")

#     # Chat input
#     user_input = st.chat_input("Ask a question...")

#     if user_input:
#         # Append user message to history
#         st.session_state.chat_history.append(HumanMessage(content=user_input))

#         # Re-render entire history (user + previous assistant)
#         for message in st.session_state.chat_history[:-1]:  # exclude new one
#             role = "user" if isinstance(message, HumanMessage) else "assistant"
#             with st.chat_message(role):
#                 st.markdown(message.content, unsafe_allow_html=True)

#         # Render new user input
#         with st.chat_message("user"):
#             st.markdown(user_input)

#         # Generate assistant response (streaming)
#         with st.chat_message("assistant"):
#             with st.spinner("Thinking..."):
#                 response, updated_history = process_query(
#                     user_input,
#                     st.session_state.chat_history
#                 )

#                 # Simulate streaming effect
#                 if hasattr(response, "content"):
#                     response_text = response.content
#                 else:
#                     response_text = response

#                 placeholder = st.empty()
#                 streamed_text = ""
#                 for word in response_text.split():
#                     streamed_text += word + " "
#                     placeholder.markdown(streamed_text + "▌", unsafe_allow_html=True)
#                     time.sleep(0.03)  # Simulate typing speed

#                 placeholder.markdown(streamed_text, unsafe_allow_html=True)

#         # Update chat history
#         st.session_state.chat_history = updated_history

#     else:
#         # On first load or no new input, show full history
#         for message in st.session_state.chat_history:
#             role = "user" if isinstance(message, HumanMessage) else "assistant"
#             with st.chat_message(role):
#                 st.markdown(message.content, unsafe_allow_html=True)

# if __name__ == "__main__":
#     main()

import os
import streamlit as st
import time
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
import tempfile
import uuid

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Finance GPT",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for beautiful styling
st.markdown("""
<style>
    /* Main container styling */
    .main > div {
        padding-top: 2rem;
    }
    
    /* Header styling */
    .header-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }
    
    .header-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .header-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
    }
    
    /* Sidebar styling */
    .sidebar .sidebar-content {
        background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    /* Tool section styling */
    .tool-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #667eea;
        margin-bottom: 1rem;
    }
    
    /* Chat message styling */
    .chat-message {
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        animation: fadeIn 0.5s ease-in;
    }
    
    .user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: 2rem;
    }
    
    .assistant-message {
        background: #f1f3f4;
        color: #333;
        margin-right: 2rem;
    }
    
    /* Status indicators */
    .status-success {
        background: #d4edda;
        color: #155724;
        padding: 0.75rem;
        border-radius: 5px;
        border-left: 4px solid #28a745;
    }
    
    .status-error {
        background: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 5px;
        border-left: 4px solid #dc3545;
    }
    
    .status-info {
        background: #d1ecf1;
        color: #0c5460;
        padding: 0.75rem;
        border-radius: 5px;
        border-left: 4px solid #17a2b8;
    }
    
    /* Animation */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Spinner styling */
    .stSpinner > div {
        border-color: #667eea !important;
    }
    
    /* Button styling */
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
def initialize_session_state():
    """Initialize all session state variables"""
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "processed_files" not in st.session_state:
        st.session_state.processed_files = []
    if "agent_initialized" not in st.session_state:
        st.session_state.agent_initialized = False
    if "agent" not in st.session_state:
        st.session_state.agent = None

# Initialize the agent
@st.cache_resource
def initialize_agent():
    """Initialize the LangGraph agent with tools"""
    print("##### Agent Initialization #####")
    
    try:
        # Import tools
        from News import financial_news_search
        from GeneralQnA import GeneralQnA
        print("Successfully imported tools")
        
        # Check API key
        if 'GROQ_API_KEY' not in os.environ:
            st.error("⚠️ GROQ_API_KEY not found in environment variables")
            return None
        
        # Initialize LLM
        llm = ChatGroq(model="llama-3.3-70b-versatile")
        
        # Create tools list
        tools = [financial_news_search, GeneralQnA]
        
        # Create agent
        agent = create_react_agent(llm, tools)
        print("LangGraph ReAct agent created successfully")
        
        return agent
        
    except ImportError as e:
        st.error(f"❌ Could not import tools: {e}")
        return None
    except Exception as e:
        st.error(f"❌ Error initializing agent: {e}")
        return None

def process_pdf_upload(uploaded_file):
    """Process uploaded PDF file"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(uploaded_file.getbuffer())
            tmp_file_path = tmp_file.name
        
        # Here you would typically process the PDF with your RAG system
        # For now, we'll just simulate the processing
        time.sleep(2)  # Simulate processing time
        
        # Clean up
        os.unlink(tmp_file_path)
        
        return True, "Document processed successfully!"
        
    except Exception as e:
        return False, f"Error processing document: {str(e)}"

def process_query(user_input, agent, chat_history=None):
    """Process user query through the LangGraph agent"""
    if chat_history is None:
        chat_history = []
    
    # Add user message to history
    messages = chat_history + [HumanMessage(content=user_input)]
    
    try:
        # Invoke the agent
        result = agent.invoke({"messages": messages})
        
        # Extract the final response
        final_response = result["messages"][-1]
        if hasattr(final_response, 'content'):
            response_content = final_response.content
        else:
            response_content = str(final_response)
        
        return response_content, result["messages"]
        
    except Exception as e:
        error_msg = f"Error processing query: {str(e)}"
        messages.append(AIMessage(content=error_msg))
        return error_msg, messages

def render_chat_message(message, role):
    """Render a chat message with custom styling"""
    if role == "user":
        st.markdown(f"""
        <div class="chat-message user-message">
            <strong>You:</strong> {message}
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="chat-message assistant-message">
            <strong>Finance GPT:</strong> {message}
        </div>
        """, unsafe_allow_html=True)

def simulate_typing_effect(text, placeholder):
    """Simulate typing effect for responses"""
    words = text.split()
    displayed_text = ""
    
    for i, word in enumerate(words):
        displayed_text += word + " "
        placeholder.markdown(f"""
        <div class="chat-message assistant-message">
            <strong>Finance GPT:</strong> {displayed_text}▌
        </div>
        """, unsafe_allow_html=True)
        time.sleep(0.03)
    
    # Final display without cursor
    placeholder.markdown(f"""
    <div class="chat-message assistant-message">
        <strong>Finance GPT:</strong> {displayed_text}
    </div>
    """, unsafe_allow_html=True)

def main():
    # Initialize session state
    initialize_session_state()
    
    # Header
    st.markdown("""
    <div class="header-container">
        <div class="header-title">💰 Finance GPT</div>
        <div class="header-subtitle">Your AI-Powered Financial Assistant</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.markdown("### 🛠️ Tools & Settings")
        
        # Initialize agent if not done
        if not st.session_state.agent_initialized:
            with st.spinner("Initializing AI Agent..."):
                agent = initialize_agent()
                if agent:
                    st.session_state.agent = agent
                    st.session_state.agent_initialized = True
                    st.success("✅ Agent initialized successfully!")
                else:
                    st.error("❌ Failed to initialize agent")
                    st.stop()
        
        st.markdown("---")
        
        # File upload section
        st.markdown("### 📄 Document Upload")
        uploaded_file = st.file_uploader(
            "Upload PDF Document",
            type=['pdf'],
            help="Upload a PDF document for analysis"
        )
        
        if uploaded_file:
            file_id = f"{uploaded_file.name}_{uploaded_file.size}"
            
            if file_id not in st.session_state.processed_files:
                with st.spinner("🔄 Processing document..."):
                    success, message = process_pdf_upload(uploaded_file)
                    
                    if success:
                        st.session_state.processed_files.append(file_id)
                        st.markdown(f'<div class="status-success">✅ {message}</div>', 
                                  unsafe_allow_html=True)
                    else:
                        st.markdown(f'<div class="status-error">❌ {message}</div>', 
                                  unsafe_allow_html=True)
            else:
                st.markdown(f'<div class="status-info">ℹ️ Document already processed</div>', 
                          unsafe_allow_html=True)
        
        st.markdown("---")
        
        # Chat controls
        st.markdown("### 💬 Chat Controls")
        if st.button("🗑️ Clear Chat History"):
            st.session_state.chat_history = []
            st.rerun()
        
        # Statistics
        st.markdown("### 📊 Statistics")
        st.metric("Messages", len(st.session_state.chat_history))
        st.metric("Documents", len(st.session_state.processed_files))
    
    # Main chat interface
    st.markdown("### 💬 Chat Interface")
    
    # Display chat history
    chat_container = st.container()
    
    with chat_container:
        for message in st.session_state.chat_history:
            if isinstance(message, HumanMessage):
                render_chat_message(message.content, "user")
            else:
                render_chat_message(message.content, "assistant")
    
    # Chat input
    user_input = st.chat_input("Ask me anything about finance...")
    
    if user_input and st.session_state.agent:
        # Add user message to history
        st.session_state.chat_history.append(HumanMessage(content=user_input))
        
        # Display user message
        render_chat_message(user_input, "user")
        
        # Generate and display assistant response
        with st.spinner("🤔 Thinking..."):
            response, updated_history = process_query(
                user_input,
                st.session_state.agent,
                st.session_state.chat_history[:-1]  # Exclude the just-added user message
            )
            
            # Create placeholder for typing effect
            response_placeholder = st.empty()
            simulate_typing_effect(response, response_placeholder)
            
            # Update chat history
            st.session_state.chat_history = updated_history
            
            # Auto-scroll to bottom
            st.rerun()
    
    elif user_input and not st.session_state.agent:
        st.error("❌ Agent not initialized. Please check the sidebar for errors.")

if __name__ == "__main__":
    main()