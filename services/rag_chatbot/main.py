from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .langchain_engine import answer_query
from .vector_store import add_texts_to_vector_store, get_store_status, init_vector_db

app = FastAPI(
    title="Indra-MarketMind RAG Chatbot API",
    description="Intelligent RAG Assistant for Financial Analytics, Macro News, and Multi-Agent Market Queries",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    # Attempt lazy vector DB connection without crashing if DB is pending
    init_vector_db()

class ChatRequest(BaseModel):
    query: str = Field(..., description="User financial inquiry or market question")
    k: int = Field(default=5, description="Number of context documents to retrieve")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Metadata filters for vector search")

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    model_used: str
    latency_ms: float

class IngestRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, description="List of textual documents to ingest")
    metadatas: Optional[List[Dict[str, Any]]] = Field(default=None, description="Metadata dictionaries corresponding to texts")

class IngestResponse(BaseModel):
    status: str
    message: str
    ingested_count: int

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        result = answer_query(query=request.query, filters=request.filters, k=request.k)
        return ChatResponse(
            answer=result["answer"],
            sources=result.get("sources", []),
            model_used=result.get("model_used", "unknown"),
            latency_ms=result.get("latency_ms", 0.0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest", response_model=IngestResponse)
async def ingest_endpoint(request: IngestRequest):
    try:
        count = add_texts_to_vector_store(request.texts, request.metadatas)
        return IngestResponse(
            status="success",
            message=f"Successfully ingested {count} documents into knowledge base",
            ingested_count=count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def status_endpoint():
    return {
        "service": "rag_chatbot",
        "store": get_store_status()
    }

@app.get("/health")
async def health_check():
    store_status = get_store_status()
    return {
        "status": "healthy",
        "service": "rag_chatbot",
        "vector_backend": store_status["backend"]
    }
