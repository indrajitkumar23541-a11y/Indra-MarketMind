# ──────────────────────────────────────────────────────────
# services/analytics/main.py — Analytics Engine Service
# ──────────────────────────────────────────────────────────
from fastapi import FastAPI, Depends, HTTPException
import uvicorn
import sys
from pathlib import Path
from datetime import datetime

# Add project root to python path so we can import shared
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from shared.config import settings
from services.analytics.schemas import (
    FearGreedResponse, 
    CorrelationResponse, 
    GrangerCausalityResponse,
    IndicatorResponse,
    SectorRotationResponse,
    InsiderSignalResponse
)

app = FastAPI(
    title="Analytics Engine Service",
    description="Calculates correlations, technical indicators, and market signals.",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "analytics-engine",
        "endpoints": [
            "/analyze/correlation/{ticker}",
            "/analyze/granger/{ticker}",
            "/signals/fear-greed",
            "/signals/sector-rotation",
            "/technical/indicators/{ticker}"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Placeholder endpoints - these will be wired up to actual logic in subsequent steps

@app.get("/analyze/correlation/{ticker}", response_model=CorrelationResponse)
async def get_correlation(ticker: str, window_days: int = 30):
    # TODO: Implement Pearson correlation logic
    return CorrelationResponse(
        ticker=ticker,
        window_days=window_days,
        pearson_r=0.85,
        is_significant=True,
        timestamp=datetime.utcnow()
    )

@app.get("/analyze/granger/{ticker}", response_model=GrangerCausalityResponse)
async def get_granger_causality(ticker: str, lag_days: int = 1):
    # TODO: Implement Granger causality logic
    return GrangerCausalityResponse(
        ticker=ticker,
        lag_days=lag_days,
        f_statistic=4.21,
        p_value=0.03,
        is_significant=True,
        timestamp=datetime.utcnow()
    )

@app.get("/signals/fear-greed", response_model=FearGreedResponse)
async def get_fear_greed_index():
    # TODO: Implement Fear & Greed logic
    return FearGreedResponse(
        score=65.5,
        label="GREED",
        timestamp=datetime.utcnow(),
        factors={
            "market_momentum": 70.0,
            "sentiment_score": 65.0,
            "volatility": 60.0
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
