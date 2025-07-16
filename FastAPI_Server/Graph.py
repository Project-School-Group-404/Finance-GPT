from typing_extensions import TypedDict
from typing import Dict, List, Any
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama
from IPython.display import Image
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, AnyMessage
from langgraph.graph import StateGraph, START, END
from IPython.display import Image, display
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()
# tools
from Tools.Doc_QnA_RAG import rag_qa_tool
from Tools.News import financial_news_search
from Tools.general_qna import gen_qna
from Tools.Image_qna import image_qna


class GraphState(TypedDict, total=False):
    input: str
    uploaded_doc: str
    uploaded_img: str
    agent_order: List[Dict[str, str]]
    routing_reasoning: str
    current_agent_index: int
    processed_agents: List[str]
    agent_outputs: Dict[str, str]
    final_response: str
    messages: List[AnyMessage]


# llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))


# llm = ChatGroq(
#     model_name="llama-3.3-70b-versatile",
#     temperature=0.0,
# )

# llm = ChatGroq(
#     model_name="gemma2-9b-it",
#     temperature=0.0,
# )

llm = ChatOllama(
    model="llama3.1:8b",
    base_url="https://ollama-gcs-172789587838.us-central1.run.app", # this is the model that we deplyed on our server on gcp 
    temperature=0.7,
)


# testing , lol

# query = "Tell me a short story"
# for chunk in llm.stream(query):
#     print(chunk.content, end="", flush=True)


ROUTER_PROMPT = """
You are a routing assistant that decomposes user queries into agent-specific sub-queries for a finance chatbot, using the query, conversation history, and available tools to determine execution order, dependencies, and whether the query is a follow-up.
ONLY GIVE THE OUTPUT NOTHING ELSE 
Available Tools:
1. Document_qna: Answers questions about uploaded documents (e.g., PDFs) using RAG. Requires a document ID from uploaded_docs.
2. News: Fetches and analyzes recent financial news or events.
3. Image_qna: Analyzes uploaded images (e.g., charts, tables).
4. General_qna: Handles general finance or reasoning questions without documents or images.
5. Summarizer: Synthesizes or summarizes prior tool outputs or responses, used for follow-ups (e.g., 'make it shorter').

Inputs:
- Query: The current user query.
- Conversation history: JSON list of messages [{type: 'human'/'ai', content: str}].
- Uploaded documents: JSON list of [path: str].
- Uploaded image: Single path string or empty.

Your Task:
1. Analyze the query and history to identify intent, follow-ups, and referenced documents/images.
2. Select the correct document/image from uploaded_docs or uploaded_img using doc_id or history context (e.g., 'document from earlier'). Default to the latest uploaded_docs/image if ambiguous.
3. Decompose the query into sub-queries for relevant tools, ensuring each is clear and isolated.
4. Specify execution order and dependencies (e.g., Document_qna may depend on News).
5. For follow-ups (e.g., 'make it shorter', 'more details'), route to Summarizer with instructions to use history.
6. For ambiguous queries not requiring tools, route to Summarizer to leverage history.
7. Include 'doc_id' for Document_qna and 'img_id' for Image_qna in agent entries.


Output Format:
{
    "agents": [
        {
            "name": "Document_qna",
            "query": "Specific query for document",
            "dependencies": []
        },
        {
            "name": "News",
            "query": "Specific query for news",
            "dependencies": []
        },
        {
            "name": "General_qna",
            "query": "Specific query for reasoning",
            "dependencies": ["Document_qna", "News"]
        },
        {
            "name": "Image_qna",
            "query": "Specific query for image",
            "dependencies": []
        },
        {
            "name": "Summarizer",
            "query": "Synthesize or summarize outputs",
            "dependencies": ["Document_qna", "News"]
        }
    ],
    "reasoning": "Explain decomposition, document/image selection, and dependency logic"
}

Rules:
- If no document/image is referenced and the query is ambiguous, route to Summarizer or General_qna.
- If no tools are suitable (e.g., non-finance query), return an empty agents list.
- For follow-ups, use history to identify prior outputs or context.
- Ensure dependencies reflect logical order (e.g., News before Document_qna for policy impact).

Examples:
1. Query: "What is the revenue in the document uploaded earlier?"
   History: [{"type": "ai", "content": "Uploaded document: /doc1.pdf with ID doc1", "timestamp": "2025-07-16T10:00:00"}]
   Uploaded_docs: [{"id": "doc1", "path": "/doc1.pdf", "timestamp": "2025-07-16T10:00:00"}]
   Output: {
       "agents": [
           {
               "name": "Document_qna",
               "query": "What is the revenue according to the document?",
               "dependencies": []
           }
       ],
       "reasoning": "Query refers to 'document uploaded earlier', matched to doc1 in history."
   }

2. Query: "How does the latest tax policy affect revenue in the new document?"
   History: [{"type": "ai", "content": "Uploaded document: /doc2.pdf with ID doc2"}]
   Uploaded_docs: [{"id": "doc1", "path": "/doc1.pdf"}, {"id": "doc2", "path": "/doc2.pdf"}]
   Output: {
       "agents": [
           {
               "name": "News",
               "query": "What is the latest tax policy?",
               "dependencies": []
           },
           {
               "name": "Document_qna",
               "query": "How does the latest tax policy affect revenue in the document?",
               "dependencies": ["News"]
           }
       ],
       "reasoning": "Query requires tax policy (News) and revenue impact (Document_qna) using latest document (doc2)."
   }

3. Query: "Make it shorter"
   History: [{"type": "ai", "content": "Final response: Revenue is $4.9T..."}]
   Output: {
       "agents": [
           {
               "name": "Summarizer",
               "query": "Summarize the previous response",
               "dependencies": []
           }
       ],
       "reasoning": "Follow-up query refers to prior response, routed to Summarizer."
   }

4. Query: "What does this chart show?"
   Uploaded_img: "/chart1.jpg"
   Output: {
       "agents": [
           {
               "name": "Image_qna",
               "query": "Describe the content of the chart",
               "dependencies": []
           }
       ],
       "reasoning": "Query targets the uploaded image, routed to Image_qna."
   }

5. Query: "What’s the weather today?"
   Output: {
       "agents": [],
       "reasoning": "Non-finance query, no suitable tools."
   }

6. Query: "What does the old document say about taxes, and how does it relate to recent news?"
   History: [{"type": "ai", "content": "Uploaded document: /doc1.pdf with ID doc1"}, {"type": "ai", "content": "Uploaded document: /doc2.pdf with ID doc2"}]
   Uploaded_docs: [{"id": "doc1", "path": "/doc1.pdf"}, {"id": "doc2", "path": "/doc2.pdf"}]
   Output: {
       "agents": [
           {
               "name": "Document_qna",
               "query": "What does the document say about taxes?",
               "dependencies": []
           },
           {
               "name": "News",
               "query": "What are recent news updates on tax policies?",
               "dependencies": []
           },
           {
               "name": "Summarizer",
               "query": "Relate the document’s tax information to recent news",
               "dependencies": ["Document_qna", "News"]
           }
       ],
       "reasoning": "Query references 'old document' (doc1 from history) for taxes and recent news, with Summarizer to combine outputs."
   }
"""


def Router(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        query = state["input"]

        # print("query received")
        messages = [
            SystemMessage(content=ROUTER_PROMPT),
            HumanMessage(content=f"Query: {query}"),
        ]
        # print("query structured")

        response = llm.invoke(messages)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)

        # print(response.content)
        # print("response generated")
        parsed = json.loads(raw)
        # parsed = json.loads(response.content)
        # print("response parsed!")
        # print(parsed)

        agents = parsed.get(
            "agents", [{"name": "General_qna", "query": f"{query}", "dependencies": []}]
        )
        reasoning = parsed.get("reasoning", "Default routing")

        valid_agents = [agent for agent in agents]

        if not valid_agents:
            valid_agents = [
                {"name": "General_qna", "query": f"{query}", "dependencies": []}
            ]
        state["agent_order"] = valid_agents
        state["routing_reasoning"] = reasoning
        state["agent_outputs"] = {}
        state["processed_agents"] = []
        state["current_agent_index"] = 0

    except Exception as e:
        print(f"Error in Routing : {e}")

    return state


def route_to_agents(state: Dict[str, Any]) -> str:
    agent_order = state.get(
        "agent_order",
        [{"name": "General_qna", "query": f"{state["input"]}", "dependencies": []}],
    )

    if "current_agent_index" not in state:
        state["current_agent_index"] = 0

    current_index = state["current_agent_index"]

    if current_index < len(agent_order):
        agent = agent_order[current_index]["name"]
        print(f"Routing to : {agent}, current index at: {current_index}")
        return agent
    return "Aggregator"


def Document_qna(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        query = state["agent_order"][state["current_agent_index"]]["query"]
        dependencies_list = state["agent_order"][state["current_agent_index"]][
            "dependencies"
        ]

        if dependencies_list:
            for dep in dependencies_list:
                if dep in state["agent_outputs"]:
                    dep_output = state["agent_outputs"][dep]
                    query += f" based on the following {dep} context: {dep_output}"
                else:
                    print(f"Dependency {dep} output not found in agent_outputs")

        # print(query)
        uploaded_doc_path = state["uploaded_doc"]
        # print(uploaded_doc_path)
        result = rag_qa_tool.invoke({"file_path": uploaded_doc_path, "query": query})
        # print(result)
        state["agent_outputs"]["Doc_QnA"] = result
        state["processed_agents"].append("Document_QnA")
        if state["current_agent_index"] + 1 <= len(state["agent_order"]):
            state["current_agent_index"] = state["current_agent_index"] + 1
        else:
            state["current_agent_index"] = 0

        state["messages"].append(AIMessage(content=f"Document_qna output: {result}"))
    except Exception as e:
        print(f"Error in Doc_QnA : {e}")
    return state


def News(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        query = state["agent_order"][state["current_agent_index"]]["query"]
        print(query)
        dependencies_list = state["agent_order"][state["current_agent_index"]][
            "dependencies"
        ]

        if dependencies_list:
            for dep in dependencies_list:
                if dep in state["agent_outputs"]:
                    dep_output = state["agent_outputs"][dep]
                    query += f" based on the following {dep} context: {dep_output}"
                else:
                    print(f"Dependency {dep} output not found in agent_outputs")

        print("entering news tool")
        result = financial_news_search.invoke({"query": query})
        state["agent_outputs"]["News"] = result
        state["processed_agents"].append("NEWS")
        if state["current_agent_index"] + 1 < len(state["agent_order"]):
            state["current_agent_index"] = state["current_agent_index"] + 1
        else:
            state["current_agent_index"] = 0
        state["messages"].append(AIMessage(content=f"News output: {result}"))
    except Exception as e:
        print(f"Error in News : {e}")
    return state


def General_qna(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        query = state["agent_order"][state["current_agent_index"]]["query"]
        dependencies_list = state["agent_order"][state["current_agent_index"]][
            "dependencies"
        ]

        if dependencies_list:
            for dep in dependencies_list:
                if dep in state["agent_outputs"]:
                    dep_output = state["agent_outputs"][dep]
                    query += f" based on the following {dep} context: {dep_output}"
                else:
                    print(f"Dependency {dep} output not found in agent_outputs")

        result = gen_qna.invoke({"question": query})
        state["agent_outputs"]["General_QnA"] = result
        state["processed_agents"].append("General_QnA")
        if state["current_agent_index"] + 1 <= len(state["agent_order"]):
            state["current_agent_index"] = state["current_agent_index"] + 1
        else:
            state["current_agent_index"] = 0
        state["messages"].append(AIMessage(content=f"General_qna output: {result}"))
    except Exception as e:
        print(f"Error in General_qna : {e}")
    return state


def Image_qna(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        query = state["agent_order"][state["current_agent_index"]]["query"]
        dependencies_list = state["agent_order"][state["current_agent_index"]][
            "dependencies"
        ]

        if dependencies_list:
            for dep in dependencies_list:
                if dep in state["agent_outputs"]:
                    dep_output = state["agent_outputs"][dep]
                    query += f" based on the following {dep} context: {dep_output}"
                else:
                    print(f"Dependency {dep} output not found in agent_outputs")

        # print(query)
        uploaded_img = state["uploaded_img"]
        # print(uploaded_doc_path)
        response = image_qna.invoke({"uploaded_file": uploaded_img, "query": query})
        state["agent_outputs"]["Image_qna"] = response
        state["processed_agents"].append("Image_qna")
        if state["current_agent_index"] + 1 <= len(state["agent_order"]):
            state["current_agent_index"] = state["current_agent_index"] + 1
        else:
            state["current_agent_index"] = 0
        state["messages"].append(AIMessage(content=f"Image_qna output: {response}"))

    except Exception as e:
        print(f"Error in Image_qna : {e}")
    return state


def Aggregator(state: Dict[str, Any]) -> Dict[str, Any]:
    try:
        final_agent_outputs = state["agent_outputs"]
        routing_reasoning = state.get("routing_reasoning", "")
        initial_query = state["input"]

        if not final_agent_outputs:
            state["final_response"] = "No agent outputs to aggregate."
            return state

        if len(final_agent_outputs) == 1:
            _, response = next(iter(final_agent_outputs.items()))
            state["final_response"] = response

        else:
            aggregation_prompt = f"""
                        You are an expert output aggregator. Given the initial query , Combine the following responses into a coherent, comprehensive answer , also if needed take into consideration the previous converstation history to answer the initial_query.
                        
                        initial query : {initial_query}
                        Routing reasoning: {routing_reasoning}
                        
                        Responses:
                        {json.dumps(final_agent_outputs, indent=2)}

                        Conversation history: {json.dumps([msg.dict() for msg in state["messages"]], indent=2)}
                        Create a unified response that integrates insights from all the responses and the conversation history if needed, while avoiding redundancy.
            
                        """
            messages = [
                SystemMessage(
                    content="You are an expert at synthesizing information from multiple sources."
                ),
                HumanMessage(content=aggregation_prompt),
            ]

            response = llm(messages)
            state["final_response"] = response.content
            state["messages"].append(AIMessage(content=state["final_response"]))
    except Exception as e:
        print(f"Error in Aggregation : {e}")

    return state


builder = StateGraph(GraphState)

builder.add_node("Router", Router)
builder.add_node("Document_qna", Document_qna)
builder.add_node("General_qna", General_qna)
builder.add_node("News", News)
builder.add_node("Image_qna", Image_qna)

builder.add_node("Aggregator", Aggregator)

builder.set_entry_point("Router")

tool_names = ["Document_qna", "General_qna", "News", "Image_qna", "Aggregator"]

routing_map = {
    "Document_qna": "Document_qna",
    "General_qna": "General_qna",
    "News": "News",
    "Image_qna": "Image_qna",
    "Aggregator": "Aggregator",
}

builder.add_conditional_edges("Router", route_to_agents, routing_map)


builder.add_conditional_edges(
    "Document_qna",
    route_to_agents,
    {
        "General_qna": "General_qna",
        "News": "News",
        "Image_qna": "Image_qna",
        "Aggregator": "Aggregator",
    },
)

builder.add_conditional_edges(
    "General_qna",
    route_to_agents,
    {
        "Document_qna": "Document_qna",
        "News": "News",
        "Image_qna": "Image_qna",
        "Aggregator": "Aggregator",
    },
)

builder.add_conditional_edges(
    "News",
    route_to_agents,
    {
        "Document_qna": "Document_qna",
        "General_qna": "General_qna",
        "Image_qna": "Image_qna",
        "Aggregator": "Aggregator",
    },
)
builder.add_conditional_edges(
    "Image_qna",
    route_to_agents,
    {
        "Document_qna": "Document_qna",
        "General_qna": "General_qna",
        "News": "News",
        "Aggregator": "Aggregator",
    },
)

builder.add_edge("Aggregator", END)

graph = builder.compile()


# DONT UNCOMMENT !!!!, unless in a notebook , yes 
# display(Image(graph.get_graph().draw_mermaid_png()))


# Testing, yes

# query="what is blockchain? and tell me what the given image is?"
# initial_state = {
#         "input": query,
#         "uploaded_doc" : "/home/saikrishnanair/Finance-GPT/2PageNvidia.pdf",
#         "uploaded_img" : "/home/saikrishnanair/balancesheet.png",
#         "agent_order": [],
#         "routing_reasoning" : "",
#         "current_agent_index": 0,
#         "processed_agents": [],
#         "agent_outputs": {},
#         "final_response": "",
#         "messages" : []
#     }

# result = graph.invoke(initial_state)
# import pprint
# pprint.pprint(result)
