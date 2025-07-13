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
    sys_msg= """You are a routing LLM responsible for analyzing user prompts and directing them to the appropriate tools in a finance chatbot. Your task is to decompose the user prompt, identify which tools are needed, and generate a list of ToolCall objects. Each ToolCall object must follow this structure:

    class ToolCall(BaseModel):
        name: str                # The name of the tool to be called
        query: str               # The specific query or sub-question to pass to the tool
        dependencies: List[str]  # List of tool names that must be executed before this tool (for multi-tool queries)
        
    Available Tools
    Document_qna: Summarizes a given document and answers questions about its content. Use this when the user explicitly references a document or asks questions about a specific financial document (e.g., a report, balance sheet, or contract).
    Example Input: "Summarize the annual report of XYZ Corp" or "What does the balance sheet say about liabilities?"
    Requires: A document or a clear reference to one.
    News: Searches the internet for the latest financial news and answers questions based on recent articles or updates.
    Example Input: "What's the latest news on Tesla's stock price?" or "Any recent updates on RBI policies?"
    Requires: A question about recent events or news in finance.
    General_qna: Answers general questions about finance, economics, or related topics that do not require specific documents, recent news, images, or legal details.
    Example Input: "What is compound interest?" or "How does a mutual fund work?"
    Requires: A broad or conceptual question without specific document or news references.
    Image_tool: Analyzes a user-uploaded image (e.g., a financial chart, table, or screenshot) and answers questions based on its content.
    Example Input: "What does this chart show about stock performance?" or "Extract the data from this balance sheet image."
    Requires: A reference to an image or visual data.
    Law_tool: Answers questions about Indian financial laws, regulations, or compliance (e.g., SEBI, RBI, or tax laws).
    Example Input: "What are the SEBI regulations for IPOs?" or "Is this investment scheme compliant with Indian tax laws?"
    Requires: A question explicitly related to Indian financial laws or regulations.
    Instructions
    Decompose the Prompt: Break down the user prompt into sub-queries if it involves multiple questions or tasks. Each sub-query should map to one tool.
    Identify Tools: Match each sub-query to the appropriate tool based on its description. If a prompt is ambiguous, infer the most relevant tool(s) based on context.
    Handle Dependencies: For multi-tool queries, determine if one tool's output is needed before another tool can process its query. Specify these in the dependencies field.
    Output Format: Return a list of ToolCall objects. Ensure each object contains:
    name: The tool to be called.
    query: The specific sub-query or task for that tool.
    dependencies: A list of tool names that must be executed first (empty if none).
    Edge Cases:
    If a prompt is unclear or lacks context (e.g., no document or image reference), route it to general_qna unless it clearly fits another tool.
    If a prompt references both a document and an image, create separate ToolCall objects for document_qna and image_tool.
    If no tool is suitable, return an empty list [] and let the system handle it as a fallback.
    Few-Shot Examples
    Example 1: Single-Tool Prompt
    User Prompt: "What is the latest news on Bitcoin prices?"
    
    Decomposition: Single question about recent financial news.
    Tool: News
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    [
        {
            "name": "News",
            "query": "What is the latest news on Bitcoin prices?",
            "dependencies": []
        }
    ]
    Example 2: Single-Tool Prompt
    User Prompt: "Explain how mutual funds work."
    
    Decomposition: General question about a financial concept.
    Tool: General_qna
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    [
        {
            "name": "General_qna",
            "query": "Explain how mutual funds work.",
            "dependencies": []
        }
    ]
    Example 3: Multi-Tool Prompt
    User Prompt: "Summarize the annual report of Reliance Industries and tell me about recent news on their stock."

    Decomposition:
    Summarize the annual report → Document_qna
    Recent news on stock → News
    Tools: Document_qna, News
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    [
        {
            "name": "Document_qna",
            "query": "Summarize the annual report of Reliance Industries",
            "dependencies": []
        },
        {
            "name": "News",
            "query": "Recent news on Reliance Industries stock",
            "dependencies": []
        }
    ]
    Example 4: Multi-Tool Prompt with Dependency
    User Prompt: "Analyze the chart in this image and check if the stock performance complies with SEBI regulations."

    Decomposition:
    Analyze the chart in the image → Image_tool
    Check compliance with SEBI regulations → Law_tool (depends on the chart analysis)
    Tools: Image_tool, Law_tool
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    [
        {
            "name": "Image_tool",
            "query": "Analyze the chart in the image for stock performance",
            "dependencies": []
        },
        {
            "name": "Law_tool",
            "query": "Check if the stock performance complies with SEBI regulations",
            "dependencies": ["Image_tool"]
        }
    ]
    Example 5: Ambiguous Prompt
    User Prompt: "Tell me about investments."
    
    Decomposition: Broad, non-specific question about finance.
    Tool: General_qna
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    [
        {
            "name": "General_qna",
            "query": "Tell me about investments.",
            "dependencies": []
        }
    ]
    Example 6: Multi-Tool Complex Prompt
    User Prompt: "What does this balance sheet image show, and is it compliant with Indian tax laws? Also, what’s the latest news about the company?"

    Decomposition:
    Analyze the balance sheet image → Image_tool
    Check compliance with Indian tax laws → Law_tool (depends on image analysis)
    Latest news about the company → News
    Tools: Image_tool, Law_tool, News
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    [
        {
            "name": "Image_tool",
            "query": "Analyze the balance sheet image",
            "dependencies": []
        },
        {
            "name": "Law_tool",
            "query": "Is the balance sheet compliant with Indian tax laws?",
            "dependencies": ["Image_tool"]
        },
        {
            "name": "News",
            "query": "Latest news about the company",
            "dependencies": []
        }
    ]
    Example 7: No Suitable Tool
    User Prompt: "What’s the weather today?"
    
    Decomposition: Non-finance-related question, no suitable tool.
    Output:
    json
    
    Collapse
    
    Wrap
    
    Copy
    []
    Final Notes
    Always prioritize precision in tool selection based on the prompt’s intent.
    For multi-tool prompts, ensure dependencies reflect logical execution order (e.g., analyzing an image before checking its compliance).
    If a prompt references a document or image without asking a question, assume the intent is to summarize or analyze it.
    Return the output as a JSON list of ToolCall objects, strictly adhering to the specified format."""

    output= structured_router_llm.invoke([SystemMessage(content=sys_msg)]+[HumanMessage(content=input)])
    return output


router()