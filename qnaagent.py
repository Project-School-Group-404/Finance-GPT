import requests
HF_API_TOKEN = "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"  # 🔐 keep secret in real apps
API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}
def answer(question: str) -> str:
    prompt = f"Question: {question}\nAnswer:"

    payload = {
        "inputs": prompt,
        "parameters": {
            "temperature": 0.5,
            "max_new_tokens": 100
        }
    }

    try:
        res = requests.post(API_URL, headers=HEADERS, json=payload)
        res.raise_for_status()
        outputs = res.json()
        # Falcon returns full generated text
        answer = outputs[0]["generated_text"].replace(prompt, "").strip()
    except Exception as e:
        answer = f"Error: {str(e)}"

    return answer