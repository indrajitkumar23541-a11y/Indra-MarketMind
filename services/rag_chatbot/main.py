from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .langchain_engine import answer_query

app = FastAPI(title="Indra-MarketMind RAG Chatbot API")

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        answer = answer_query(request.query)
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
