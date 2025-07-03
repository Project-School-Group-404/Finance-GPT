from unstract.llmwhisperer import LLMWhispererClientV2
import os
llm_whisperer = LLMWhispererClientV2(
    base_url="https://llmwhisperer-api.us-central.unstract.com/api/v2",
    api_key=os.getenv("LLM_WHISPERER_API_KEY")
)
result = llm_whisperer.whisper(file_path="./temp_NVIDIAAn.pdf")

print(result['extraction']['result_text'])

