import os
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage,HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from tavily import TavilyClient
from dotenv import load_dotenv
from pprint import pprint
import trafilatura 

load_dotenv()

tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

@tool
def financial_news_search(query: str) -> str:
    """
    this tool is used to answer queries which needs latest news feed
    """
    print("news tool invoked")
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    try:
        print(f"Searching financial news for: {query}")
        enhanced_query = f"latest financial news on {query}"
        response = tavily_client.search(
            query=enhanced_query,
            topic="finance",
            time_range="month",
            max_results=3,
            country="India",
            include_domains=[
                # "coindesk.com",
                "financialexpress.com",
                "economictimes.indiatimes.com",
                "livemint.com",
                "thehindu.com",
                "wionews.com"

            ],
            exclude_domains=[
                "reddit.com",
                "twitter.com",
                "facebook.com",
                "X.com",
                "twitter.com",
                "instagram.com"
            ]
        )
        if not response.get('results'):
            return f"No recent financial news found for: {query}"
        urls = [result.get('url') for result in response['results'] if result.get('url')]
        extracted_text=""
        for url in urls:
            downloaded= trafilatura.fetch_url(url)
            if not downloaded:
                return f"❌ Could not fetch: {url}"
        
            text = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=False,
                include_formatting=False,
                date_extraction_params={"extensive_search": True}
            )
            extracted_text+= text
        Messages = [SystemMessage(content="You will be given contents of 3 articles, your job is to remove any irrelevant information from it, and analyse the content and present it in a presentable and understandable manner."),
                    HumanMessage(content=extracted_text)]
        result= llm.invoke(Messages).content
        final_result= result + "\n\n" + '\n'.join(urls)
        return final_result
    except Exception as e:
        error_msg = f"Error searching financial news: {str(e)}"
        print(f"{error_msg}")
        return error_msg
    
# print(financial_news_search.invoke({"query" : "what is the current price of solana?"}))