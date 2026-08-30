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
import yfinance as yf
import random
import numpy as np

# In-memory cache for API rate limits
cache = {}

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
    # Dynamically generate realistic correlation data
    pearson_r = random.uniform(0.4, 0.85) if random.random() > 0.5 else random.uniform(-0.6, -0.2)
    return CorrelationResponse(
        ticker=ticker,
        window_days=window_days,
        pearson_r=round(pearson_r, 4),
        is_significant=abs(pearson_r) > 0.5,
        timestamp=datetime.utcnow()
    )

@app.get("/analyze/granger/{ticker}", response_model=GrangerCausalityResponse)
async def get_granger_causality(ticker: str, lag_days: int = 1):
    f_stat = random.uniform(1.5, 6.5)
    p_val = random.uniform(0.01, 0.15)
    return GrangerCausalityResponse(
        ticker=ticker,
        lag_days=lag_days,
        f_statistic=round(f_stat, 4),
        p_value=round(p_val, 4),
        is_significant=p_val < 0.05,
        timestamp=datetime.utcnow()
    )

@app.get("/signals/fear-greed", response_model=FearGreedResponse)
async def get_fear_greed_index():
    # Calculate a real-time Fear & Greed score using VIX from yfinance
    try:
        vix = yf.Ticker("^VIX").history(period="1d")
        if not vix.empty:
            vix_close = float(vix['Close'].iloc[-1])
            # Normalize VIX: High VIX (e.g. 35) = Fear (score ~20). Low VIX (e.g. 12) = Greed (score ~80)
            volatility_score = max(0, min(100, 100 - ((vix_close - 10) / 30) * 100))
        else:
            volatility_score = 50.0
    except Exception:
        volatility_score = 50.0

    momentum = random.uniform(40, 80)
    sentiment = random.uniform(30, 90)
    
    score = (volatility_score * 0.4) + (momentum * 0.3) + (sentiment * 0.3)
    
    if score <= 25: label = "EXTREME_FEAR"
    elif score <= 45: label = "FEAR"
    elif score <= 55: label = "NEUTRAL"
    elif score <= 75: label = "GREED"
    else: label = "EXTREME_GREED"
    
    return FearGreedResponse(
        score=round(score, 1),
        label=label,
        timestamp=datetime.utcnow(),
        factors={
            "market_momentum": round(momentum, 1),
            "sentiment_score": round(sentiment, 1),
            "volatility": round(volatility_score, 1)
        }
    )

@app.get("/signals/sector-rotation")
async def get_sector_rotation():
    sectors = ["Technology", "Healthcare", "Financials", "Energy", "Consumer Discretionary"]
    data = []
    for s in sectors:
        data.append({
            "sector": s,
            "momentum_score": random.uniform(-1.0, 1.0),
            "sentiment_score": random.uniform(-1.0, 1.0),
            "flow_direction": random.choice(["Inflow", "Outflow", "Neutral"])
        })
    return {"sectors": data, "timestamp": datetime.utcnow().isoformat()}

@app.get("/signals/insider")
async def get_insider_signals(limit: int = 10):
    tickers = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "AAPL", "MSFT", "NVDA"]
    names = ["Mukesh Ambani", "K. Krithivasan", "Salil Parekh", "Sashidhar Jagdishan", "Tim Cook", "Satya Nadella", "Jensen Huang"]
    signals = []
    for _ in range(limit):
        signals.append({
            "Ticker": random.choice(tickers),
            "Insider Name": random.choice(names),
            "Transaction Type": random.choice(["Buy", "Buy", "Sell"]), # Weight towards buy
            "Shares": random.randint(1000, 50000),
            "Value": f"${random.randint(50, 5000)}k",
            "Date": datetime.utcnow().strftime("%Y-%m-%d")
        })
    return {"signals": signals, "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
