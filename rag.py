import os
from unstract.llmwhisperer import LLMWhispererClientV2
import time
from dotenv import load_dotenv
load_dotenv()
client = LLMWhispererClientV2(base_url="https://llmwhisperer-api.us-central.unstract.com/api/v2", api_key=os.getenv("LLM_WHISPERER_API_KEY"))
result = client.whisper(file_path="C:/Users/ehsaa/OneDrive/Desktop/finance gpt/Finance-GPT/temp_microsoftFY 2024.pdf")

while True:
    status = client.whisper_status(whisper_hash=result['whisper_hash'])
    if status['status']=='processed':
        resultx= client.whisper_retrieve(
            whisper_hash=result['whisper_hash']
        )
        break
    time.sleep(5)

extracted_text = resultx['extraction']['result_text']

print(extracted_text)