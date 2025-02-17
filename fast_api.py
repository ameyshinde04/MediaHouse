from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import uvicorn
import os
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()  # Load environment variables from .env file

# CORS Middleware (Allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AZURE_SEARCH_INDEX = os.getenv("AZURE_SEARCH_INDEX")
AZURE_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")

LLM_API_URL = os.getenv("LLM_API_URL")
LLM_MODEL = os.getenv("LLM_MODEL")

def query_azure_search(query):
    """ Queries Azure Cognitive Search with semantic ranking """
    url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{AZURE_SEARCH_INDEX}/docs/search?api-version=2023-07-01-Preview"
    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_SEARCH_KEY
    }
    body = {
    "search": query,
    "queryType": "simple",  
    "top": 3,
    "select": "title, url, info"
    }
    
    response = requests.post(url, headers=headers, json=body)
    
    if response.status_code != 200:
        print("Azure Search Error:", response.text)  # Debugging
        return []

    results = response.json().get("value", [])

    formatted_results = []
    for r in results:
        title = r.get("title", "Unknown Title")
        info = r.get("info", "").strip()
        if info:
            formatted_results.append(f"{title}: {info}")

    return formatted_results

def generate_response(context, user_query):
    """ Calls an LLM (DeepSeek) to generate a human-like response """
    prompt = f"""You are Media Assist, an AI chatbot that helps users based on the provided information.

    Context: {context}
    
    User Query: {user_query}

    Response:"""
    
    payload = {"model": LLM_MODEL, "prompt": prompt, "stream": False}

    try:
        response = requests.post(LLM_API_URL, json=payload)
        response_json = response.json()
        
        if response.status_code != 200:
            print("Ollama API Error:", response.text)  # Debugging
            return "I'm sorry, I encountered an issue while processing your request."
        
        return response_json.get("response", "No valid response received from LLM.")

    except requests.exceptions.RequestException as e:
        print("Request Error:", e)  # Debugging
        return "I'm sorry, but the AI service is currently unavailable."

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    # Handle greetings separately
    if user_message.lower() in ["hi", "hello", "hey"]:
        return {"response": "Hey there! I'm Media Assist Bot. How can I help you today?"}

    # Get relevant information from Azure Cognitive Search
    search_results = query_azure_search(user_message)

    if search_results:
        context = "\n".join(search_results)
        bot_response = generate_response(context, user_message)
    else:
        bot_response = "I'm sorry, but I couldn't find relevant information."

    return {"response": bot_response}

@app.get("/")
def home():
    return {"message": "FastAPI is running successfully!"}

if __name__ == "__main__": 
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)


# Run the fast_api.py : uvicorn fast_api:app --reload --host 127.0.0.1 --port 8001
# ollama run deepseek-r1:1.5b