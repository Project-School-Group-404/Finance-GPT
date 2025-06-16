import os
from langchain_core.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

@tool
def financial_news_search(query: str) -> str:
    """
    Use this tool for general knowledge questions, explanations, how-to questions,
    or any query that doesn't require specific documents or current information
    Search for live financial news, market updates, stock prices, economic data, 
    and financial analysis. Use this tool when users ask about:
    - Current stock prices or market performance
    - Breaking financial news
    - Economic indicators and reports
    - Company earnings or financial results
    - Market trends and analysis
    - Cryptocurrency prices and news
    - Financial regulatory updates
    
    Args:
        query: The financial topic or question to search for
    """

    print("news tool invoked")
    try:
        print(f"Searching financial news for: {query}")
        enhanced_query = f"latest financial news on {query}"
        response = tavily_client.search(
            query=enhanced_query,
            topic="finance",
            time_range="month",
            max_results=1,
            country="India",
            include_domains=[
                "coindesk.com"
                "financialexpress.com"
                "economictimes.indiatimes.com",
                "livemint.com",
                "thehindu.com",
                "wionews.com",

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
