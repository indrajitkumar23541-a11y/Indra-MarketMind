# ──────────────────────────────────────────────────────────
# services/gateway/main.py — API Gateway Entry Point
# ──────────────────────────────────────────────────────────
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import uvicorn
import sys
import os
from pathlib import Path
from typing import Dict, Any

# Add project root to python path so we can import shared
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from shared.config import settings

app = FastAPI(
    title="Indra-MarketMind API Gateway",
    description="Central Reverse Proxy, Route Multiplexer, and Service Mesh Gateway for Indra-MarketMind",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "data_ingestion": settings.DATA_SERVICE_URL,
    "sentiment": settings.SENTIMENT_SERVICE_URL,
    "analytics": settings.ANALYTICS_SERVICE_URL,
    "forecasting": settings.FORECAST_SERVICE_URL,
    "alerts": settings.ALERT_SERVICE_URL,
    "rag_chatbot": settings.RAG_CHATBOT_URL,
    "auto_trading": settings.AUTO_TRADING_URL,
    "multimodal": settings.MULTIMODAL_URL,
    "crypto_onchain": settings.CRYPTO_ONCHAIN_URL,
    "alternative_data": settings.ALTERNATIVE_DATA_URL
}

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "api-gateway",
        "platform": "Indra-MarketMind V3.0 (Hedge Fund Edition)",
        "environment": settings.ENVIRONMENT,
        "services_count": len(SERVICES)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "gateway": "online"}

@app.get("/api/system/status")
async def aggregate_system_status():
    """Pings and aggregates operational status across all 10 downstream microservices."""
    service_statuses: Dict[str, Any] = {}
    async with httpx.AsyncClient(timeout=5.0) as client:
        for name, base_url in SERVICES.items():
            try:
                res = await client.get(f"{base_url}/health")
                if res.status_code == 200:
                    service_statuses[name] = {"status": "healthy", "url": base_url}
                else:
                    service_statuses[name] = {"status": "degraded", "code": res.status_code, "url": base_url}
            except Exception:
                service_statuses[name] = {"status": "offline", "url": base_url}
                
    return {
        "gateway": "healthy",
        "timestamp": os.getenv("CURRENT_TIME", "live"),
        "active_broker": settings.ACTIVE_BROKER,
        "services": service_statuses
    }

# Forwarding routes for Phase 9-13 microservices
async def _forward_request(method: str, service_url: str, path: str, request: Request):
    url = f"{service_url}{path}"
    headers = dict(request.headers)
    headers.pop("host", None)
    
    body = await request.body()
    params = dict(request.query_params)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                content=body
            )
            return JSONResponse(status_code=res.status_code, content=res.json() if res.headers.get("content-type") == "application/json" else {"text": res.text})
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

@app.api_route("/api/rag/{path:path}", methods=["GET", "POST"])
async def route_rag(path: str, request: Request):
    return await _forward_request(request.method, settings.RAG_CHATBOT_URL, f"/{path}", request)

@app.api_route("/api/trading/{path:path}", methods=["GET", "POST"])
async def route_trading(path: str, request: Request):
    return await _forward_request(request.method, settings.AUTO_TRADING_URL, f"/{path}", request)

@app.api_route("/api/multimodal/{path:path}", methods=["GET", "POST"])
async def route_multimodal(path: str, request: Request):
    return await _forward_request(request.method, settings.MULTIMODAL_URL, f"/{path}", request)

@app.api_route("/api/crypto/{path:path}", methods=["GET", "POST"])
async def route_crypto(path: str, request: Request):
    return await _forward_request(request.method, settings.CRYPTO_ONCHAIN_URL, f"/{path}", request)

@app.api_route("/api/alt-data/{path:path}", methods=["GET", "POST"])
async def route_alt_data(path: str, request: Request):
    return await _forward_request(request.method, settings.ALTERNATIVE_DATA_URL, f"/{path}", request)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
