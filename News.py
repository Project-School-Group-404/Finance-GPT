import os
from langchain_core.tools import tool
from tavily import TavilyClient
from langchain_tavily import TavilySearch
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

def financial_news_search(query: str) -> str:
    """
    this tool is used to answer queries which needs latest news feed
    """
    print("news tool invoked")
    try:
        tool = TavilySearch(
            max_results=5,
            topic="finance"
        )
        response = tool.invoke(query)
        if not response.get('results'):
            return f"No recent financial news found for: {query}"
        
        formatted_results = []
        for i, result in enumerate(response['results'][:3], 1):
            title = result.get('title', 'No title')
            content = result.get('content', 'No content available')
            url = result.get('url', '')
            published_date = result.get('published_date', 'Date not available')
            
            formatted_results.append(f"""**{i}. {title}** Published: {published_date} Summary: {content[:300]}...Source: {url}""")
        
        final_response = f"## Latest Financial News for '{query}'\n\n" + "\n".join(formatted_results)
        
        print(f"Found {len(response['results'])} financial news results")
        return final_response
        
    except Exception as e:
        error_msg = f"Error searching financial news: {str(e)}"
        print(f"{error_msg}")
        return error_msg
