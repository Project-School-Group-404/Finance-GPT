import os
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
import streamlit as st
import re
from dotenv import load_dotenv
load_dotenv()


# Import your RAG tool from the other file
print(f"##### Main App Initialization #####")
try: 
    from Doc_QnA_RAG import rag_qa_tool, setup_rag_system
    from News import financial_news_search
    print("Successfully imported the tools")
except ImportError as e:
    print(f"ERROR: Could not import a tool. Make sure the file is in the correct directory. {e}")
    st.error("Fatal Error: Could not load certain tools. Please check server logs.")
    st.stop()




print(f"GROQ_API_KEY set: {'GROQ_API_KEY' in os.environ}")
# Initialize LLM
llm = ChatGroq(model="llama-3.1-8b-instant")



# Create list of all tools
tools = [rag_qa_tool,financial_news_search]
print(f" tools defined: {[t.name for t in tools]}")


# tools = [rag_qa_tool, general_qa_tool, web_search_tool]

# Create the LangGraph agent
agent = create_react_agent(llm, tools)
print("LangGraph ReAct agent created.")




def process_query(user_input, chat_history=None):
    """Process user query through the LangGraph agent"""
    print(f"\n--- Entering process_query ---")


    if chat_history is None:
        chat_history = []
    
    # Add user message to history
    messages = chat_history + [HumanMessage(content=user_input)]
    print(f"Messages to be sent to the llm (current + history): {len(messages)} messages.")

    try:
        # Invoke the agent
        print(f"Invoking the agent with messages...")
        result = agent.invoke({"messages": messages})

        # Extract the final response
        final_response = result["messages"][-1]
        if hasattr(final_response,'content'):
            final_response=final_response.content
        else:
            final_response = str(final_response)

        print(f"Extracted final_response (last message from agent): {final_response[:100]}...") # Print first 100 chars

        
        return final_response, result["messages"]
        
    except Exception as e:
        return f"Error processing query: {str(e)}", messages

# # Streamlit Interface
# def main():
#     st.title("Finance GPT")
    
#     # Initialize chat history
#     if "chat_history" not in st.session_state:
#         st.session_state.chat_history = []
    
    
#     # File upload section
#     st.sidebar.header("Document Upload")
#     uploaded_file = st.sidebar.file_uploader("Upload PDF", type=['pdf'])
    
#     if uploaded_file is not None:
#         if "processed_file" not in st.session_state or st.session_state.processed_file != uploaded_file.name:
#             # Save uploaded file
#             with open(f"temp_{uploaded_file.name}", "wb") as f:
#                 f.write(uploaded_file.getbuffer())
#             print(f"Saved uploaded file to: {uploaded_file.name}")

            
#             # Setup RAG system
#             print("Calling setup_rag_system...")
#             with st.spinner("Processing document... This may take a moment. Check terminal for progress."):
#                 try:
#                     setup_rag_system([f"temp_{uploaded_file.name}"])
#                     st.sidebar.success("Document processed successfully!")
#                     st.session_state.processed_file = uploaded_file.name
#                     print("setup_rag_system completed successfully.")
#                 except Exception as e:
#                     st.sidebar.error(f"Error processing document: {str(e)}")
#         else:
#             st.sidebar.info(f"Document '{uploaded_file.name}' already processed!")

#     # Display chat history
#     for message in st.session_state.chat_history:
#         role = "user" if isinstance(message, HumanMessage) else "assistant"
#         with st.chat_message(role):
#             st.markdown(message.content,unsafe_allow_html=True)  

#         # if isinstance(message, HumanMessage):
#         #     st.chat_message("user").write(message.content)
#         # elif isinstance(message, AIMessage):
#         #     st.chat_message("assistant").write(message.content)
    
#     # Chat input
#     if user_input := st.chat_input("Ask a question..."):
#         # Adding user message to chat
#         # st.chat_message("user").write(user_input)
#         st.session_state.chat_history.append(HumanMessage(content=user_input))
        
#         # Process query
#         with st.chat_message("assistant"):
#             with st.spinner("Thinking..."):
#                 response, updated_history = process_query(
#                     user_input, 
#                     st.session_state.chat_history
#                 )
                
#                 # st.write(response)
                
#                 # Update chat history with AI response
#                 st.session_state.chat_history = updated_history

# if __name__ == "__main__":
#     main()





# import streamlit as st
# from langchain.schema import HumanMessage, AIMessage  # Assuming you're using LangChain or similar

# # Streamlit Interface
# def main():
#     st.set_page_config(page_title="Finance GPT", page_icon="💰")
#     st.title("💬 Finance GPT")

#     # Initialize chat history
#     if "chat_history" not in st.session_state:
#         st.session_state.chat_history = []

#     if "processed_file" not in st.session_state:
#         st.session_state.processed_file = None

#     # ChatGPT-style Tools section (inline upload)
#     with st.expander("➕ Tools", expanded=False):
#         uploaded_file = st.file_uploader("Upload PDF", type=['pdf'], label_visibility="collapsed")

#         if uploaded_file:
#             if st.session_state.processed_file != uploaded_file.name:
#                 with open(f"temp_{uploaded_file.name}", "wb") as f:
#                     f.write(uploaded_file.getbuffer())
#                 print(f"Saved uploaded file to: temp_{uploaded_file.name}")

#                 with st.spinner("🔄 Processing document..."):
#                     try:
#                         setup_rag_system([f"temp_{uploaded_file.name}"])
#                         st.success("✅ Document processed successfully!")
#                         st.session_state.processed_file = uploaded_file.name
#                         print("setup_rag_system completed successfully.")
#                     except Exception as e:
#                         st.error(f"❌ Error processing document: {str(e)}")
#             else:
#                 st.info(f"ℹ️ '{uploaded_file.name}' already processed!")

#     # Chat input
#     user_input = st.chat_input("Ask a question...")

#     if user_input:
#         # Display user message
#         with st.chat_message("user"):
#             st.markdown(user_input)

#         # Add to chat history
#         st.session_state.chat_history.append(HumanMessage(content=user_input))

#         # Generate assistant response
#         with st.chat_message("assistant"):
#             with st.spinner("Thinking..."):
#                 response, updated_history = process_query(
#                     user_input, 
#                     st.session_state.chat_history
#                 )
#                 if hasattr(response, 'content'):
#                     st.markdown(response.content, unsafe_allow_html=True)
#                 else:
#                     st.markdown(response, unsafe_allow_html=True)

#         # Update chat history
#         st.session_state.chat_history = updated_history

#     # Render existing chat history (if no input)
#     else:
#         for message in st.session_state.chat_history:
#             if isinstance(message, HumanMessage):
#                 with st.chat_message("user"):
#                     st.markdown(message.content)
#             elif isinstance(message, AIMessage):
#                 with st.chat_message("assistant"):
#                     st.markdown(message.content, unsafe_allow_html=True)

# if __name__ == "__main__":
#     main()
















import streamlit as st
import time
from langchain.schema import HumanMessage, AIMessage  # or your message classes

def main():
    st.set_page_config(page_title="Finance GPT", page_icon="💰")
    st.title("💬 Finance GPT")

    # Initialize chat history and file status
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "processed_file" not in st.session_state:
        st.session_state.processed_file = None

    # Tools section like ChatGPT's +
    with st.expander("➕ Tools", expanded=False):
        uploaded_file = st.file_uploader("Upload PDF", type=['pdf'], label_visibility="collapsed")

        if uploaded_file:
            if st.session_state.processed_file != uploaded_file.name:
                with open(f"temp_{uploaded_file.name}", "wb") as f:
                    f.write(uploaded_file.getbuffer())
                print(f"Saved uploaded file to: temp_{uploaded_file.name}")

                with st.spinner("🔄 Processing document..."):
                    try:
                        setup_rag_system([f"temp_{uploaded_file.name}"])
                        st.success("✅ Document processed successfully!")
                        st.session_state.processed_file = uploaded_file.name
                        print("setup_rag_system completed successfully.")
                    except Exception as e:
                        st.error(f"❌ Error processing document: {str(e)}")
            else:
                st.info(f"ℹ️ '{uploaded_file.name}' already processed!")

    # Chat input
    user_input = st.chat_input("Ask a question...")

    if user_input:
        # Append user message to history
        st.session_state.chat_history.append(HumanMessage(content=user_input))

        # Re-render entire history (user + previous assistant)
        for message in st.session_state.chat_history[:-1]:  # exclude new one
            role = "user" if isinstance(message, HumanMessage) else "assistant"
            with st.chat_message(role):
                st.markdown(message.content, unsafe_allow_html=True)

        # Render new user input
        with st.chat_message("user"):
            st.markdown(user_input)

        # Generate assistant response (streaming)
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                response, updated_history = process_query(
                    user_input,
                    st.session_state.chat_history
                )

                # Simulate streaming effect
                if hasattr(response, "content"):
                    response_text = response.content
                else:
                    response_text = response

                placeholder = st.empty()
                streamed_text = ""
                for word in response_text.split():
                    streamed_text += word + " "
                    placeholder.markdown(streamed_text + "▌", unsafe_allow_html=True)
                    time.sleep(0.03)  # Simulate typing speed

                placeholder.markdown(streamed_text, unsafe_allow_html=True)

        # Update chat history
        st.session_state.chat_history = updated_history

    else:
        # On first load or no new input, show full history
        for message in st.session_state.chat_history:
            role = "user" if isinstance(message, HumanMessage) else "assistant"
            with st.chat_message(role):
                st.markdown(message.content, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
