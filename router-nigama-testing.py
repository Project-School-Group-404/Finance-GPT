from typing import TypedDict, List
from typing import Dict,Any
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

class GraphState(TypedDict, total=False):
    input: str
    uploaded_doc : str
    agent_order: List[Dict[str,str]]
    routing_reasoning : str      
    current_agent_index : int
    processed_agents : List[str]        
    agent_outputs: Dict[str, str]       
    final_response: str 
    
class ToolCalls(BaseModel):
    name: str = Field(description="The name of the tool to be called")
    query: str= Field(description="The specific query or sub-question to pass to the tool")
    dependencies: List[str]= Field(description="List of tool names that must be executed before this tool (for multi-tool queries)")
    
def router(state: GraphState)->List[dict]:
    routing_llm= ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.0
    )
    structured_router_llm= routing_llm.with_structured_output(List[ToolCalls])
    sys_msg= 

    output= structured_router_llm.invoke([SystemMessage(content=sys_msg)]+[HumanMessage(content=input)])
    return output


router()