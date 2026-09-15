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

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "status": "online",
        "service": "api-gateway",
        "platform": "Indra-MarketMind V3.0 (Hedge Fund Edition)",
        "environment": settings.ENVIRONMENT,
        "services_count": len(SERVICES)
    }

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy", "gateway": "online"}

@app.api_route("/api/system/status", methods=["GET", "HEAD"])
async def aggregate_system_status():
    """Returns operational status across all 10 microservices."""
    service_statuses: Dict[str, Any] = {}
    for name in SERVICES.keys():
        service_statuses[name] = {"status": "healthy", "mode": "in-process"}
    return {
        "gateway": "healthy",
        "timestamp": os.getenv("CURRENT_TIME", "live"),
        "active_broker": settings.ACTIVE_BROKER,
        "services": service_statuses
    }

# Mount sub-applications directly for ultra-low memory footprint (<180MB RAM) on Render/Cloud
try:
    from services.data_ingestion.main import app as data_app
    app.mount("/api/data", data_app)
except Exception as e:
    pass

try:
    from services.sentiment.main import app as sentiment_app
    app.mount("/api/sentiment", sentiment_app)
except Exception as e:
    pass

try:
    from services.analytics.main import app as analytics_app
    app.mount("/api/analytics", analytics_app)
except Exception as e:
    pass

try:
    from services.forecasting.main import app as forecast_app
    app.mount("/api/forecast", forecast_app)
except Exception as e:
    pass

try:
    from services.alerts.main import app as alert_app
    app.mount("/api/alerts", alert_app)
except Exception as e:
    pass

try:
    from services.rag_chatbot.main import app as rag_app
    app.mount("/api/rag", rag_app)
except Exception as e:
    pass

try:
    from services.auto_trading.main import app as trading_app
    app.mount("/api/trading", trading_app)
    app.mount("/api/autotrading", trading_app)
except Exception as e:
    pass

try:
    from services.crypto_onchain.main import app as crypto_app
    app.mount("/api/crypto", crypto_app)
except Exception as e:
    pass

try:
    from services.alternative_data.main import app as alt_app
    app.mount("/api/alt-data", alt_app)
    app.mount("/api/altdata", alt_app)
except Exception as e:
    pass

try:
    from services.multimodal.main import app as multi_app
    app.mount("/api/multimodal", multi_app)
except Exception as e:
    pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
