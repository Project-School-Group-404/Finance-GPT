import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.tools import tool

load_dotenv(override=True)
api_key = os.getenv("GROQ_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY")
)


@tool
def gen_qna(question: str) -> str:
    """this tool is used for answering general questions"""
    Messages = [
        SystemMessage(
            content="""
        You are a tool being used by an agent to answer general questions.

        You may receive:
        - A direct question
        - Additional background context (which may include previous analysis, user preferences, or related information)

        Your task:
        1. Use the context if it is present to improve the relevance and accuracy of your answer.
        2. If no context is given, answer the question to the best of your ability.
        3. Be clear, concise, and informative.
        4. Avoid unnecessary repetition or filler.
        5. Keep the response under 200 words

        Focus on delivering a detailed and helpful response tailored to the input.
        """
        ),
        HumanMessage(content=question),
    ]
    result = llm.invoke(Messages).content
    return result


# print(gen_qna.invoke({"question" : "what is blockchain?"}))


# print(gen_qna.invoke({
#     "question": "What is blockchain?, context: This is for a fintech investor report focusing on decentralization.",
# }))
