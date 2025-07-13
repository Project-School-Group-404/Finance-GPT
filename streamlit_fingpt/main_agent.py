from langchain.tools import tool
from addition import add
from Tools.general_qna import gen_qna

@tool 
def add_tool(a:int , b:int)->int:
    """Add two given numbers"""
    return add(a,b)

@tool 
def gen_qna_tool(question:str)->str:
    """When a general question is asked by the user, this tool should be used to answer that question."""
    return gen_qna(question)

# import sys
# sys.executable

import os
from dotenv import load_dotenv
load_dotenv()
GROQ_API_KEY=os.environ.get('GROQ_API_KEY')

from langchain_groq import ChatGroq
from langchain.agents import Tool, initialize_agent
from langchain.schema import SystemMessage
from langchain.prompts.chat import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.chains import LLMChain

prompt = ChatPromptTemplate.from_messages([
    SystemMessage(
        content="You are an agent which orchestrates tools given to you , and combines the results from those tools and gives it as the final output."
    ),
    MessagesPlaceholder(variable_name="history"),
])

llm= ChatGroq(
    model="llama3-70b-8192"
)

toolss=[
    add_tool,
    gen_qna_tool
]
#agent= create_tool_calling_agent(llm, toolss, prompt="You are an agent which orchestrates tools given to you , and combines the results from those tools and gives it as the final output.")
agent= initialize_agent(toolss, llm, agent="structured-chat-zero-shot-react-description",verbose=True, handle_parsing_errors=True, prompt=prompt, return_intermediate_steps=True)
#verbose=True
#return_intermediate_steps=True
#prompt=prompt

#from langchain.callbacks.base import BaseCallbackHandler

# class StreamlitCallbackHandler(BaseCallbackHandler):
#     def __init__(self, container):
#         self.container = container
#         self.token_box = container.empty()

#     def on_llm_new_token(self, token: str, **kwargs) -> None:
#         self.token_box.write(token, unsafe_allow_html=True)



from IPython.display import display, Markdown
import streamlit as st

from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

st.markdown("<h1 style='text-align: center;'>🤖🤝🏦</h1>", unsafe_allow_html=True)
st.markdown("<h1 style='text-align: center; font-size: 40px;'>FinTech Demo Agent</h1>", unsafe_allow_html=True)
st.text_input("Type in your Prompt", key="user_prompt")
user_input = st.session_state.user_prompt
user_proompt= analyzer.analyze(text=user_input, entities=[], language='en')
anonymized_result = anonymizer.anonymize(text=user_input, analyzer_results=user_proompt)

if user_input:
    st.write(anonymized_result)
    with st.spinner("Let me think... 💭"):
        # container = st.container()
        # handler = StreamlitCallbackHandler(container)
        
        output= agent.invoke({
            "input": f"{anonymized_result}",
            "chat_history": []
            },
            #callbacks=[handler]
        )
        for step in output['intermediate_steps']:
            action, observation = step
            st.markdown(f"**Thought**: {action.log}")
            st.markdown(f"**Action**: {action.tool}")
            st.markdown(f"**Action Input**: {action.tool_input}")
            st.markdown(f"**Observation**: {observation}")
            st.markdown("---")
        st.write("final_answer")
        st.write(output['output'])

