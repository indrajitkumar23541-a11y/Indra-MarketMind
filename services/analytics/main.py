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
import requests
import pandas as pd
from statsmodels.tsa.stattools import grangercausalitytests

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
    try:
        # Fetch data for ticker and NIFTY 50 as benchmark
        end_date = datetime.now()
        start_date = end_date - pd.Timedelta(days=window_days * 2) # Get extra days for trading days
        df = yf.download([ticker, "^NSEI"], start=start_date, end=end_date)['Close']
        df = df.dropna().tail(window_days)
        
        if len(df) > 5:
            pearson_r = df[ticker].corr(df['^NSEI'])
        else:
            pearson_r = 0.0
    except Exception as e:
        pearson_r = 0.0
        
    if pd.isna(pearson_r): pearson_r = 0.0
    
    return CorrelationResponse(
        ticker=ticker,
        window_days=window_days,
        pearson_r=round(float(pearson_r), 4),
        is_significant=abs(float(pearson_r)) > 0.5,
        timestamp=datetime.utcnow()
    )

@app.get("/analyze/granger/{ticker}", response_model=GrangerCausalityResponse)
async def get_granger_causality(ticker: str, lag_days: int = 1):
    try:
        df = yf.download([ticker, "^NSEI"], period="3mo")['Close']
        df = df.dropna()
        if len(df) > 30:
            gc_res = grangercausalitytests(df[[ticker, "^NSEI"]], maxlag=[lag_days], verbose=False)
            f_stat = gc_res[lag_days][0]['ssr_ftest'][0]
            p_val = gc_res[lag_days][0]['ssr_ftest'][1]
        else:
            f_stat, p_val = 0.0, 1.0
    except Exception:
        f_stat, p_val = 0.0, 1.0
        
    return GrangerCausalityResponse(
        ticker=ticker,
        lag_days=lag_days,
        f_statistic=round(float(f_stat), 4),
        p_value=round(float(p_val), 4),
        is_significant=float(p_val) < 0.05,
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

    try:
        spy = yf.Ticker("SPY").history(period="125d")
        if not spy.empty and len(spy) > 10:
            current_spy = spy['Close'].iloc[-1]
            ma_125_spy = spy['Close'].mean()
            # Momentum > 1 means Greed, < 1 means Fear
            momentum_ratio = current_spy / ma_125_spy
            momentum = max(0, min(100, (momentum_ratio - 0.9) * 500)) # roughly 0 to 100
        else:
            momentum = 50.0
    except Exception:
        momentum = 50.0

    sentiment = 50.0 # Default to neutral if we don't have aggregated text sentiment
    
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
    sectors_map = {
        "Technology": "XLK",
        "Healthcare": "XLV",
        "Financials": "XLF",
        "Energy": "XLE",
        "Consumer Discretionary": "XLY"
    }
    data = []
    try:
        etfs = list(sectors_map.values())
        df = yf.download(etfs, period="1mo")['Close']
        for name, ticker in sectors_map.items():
            if ticker in df and len(df[ticker].dropna()) >= 2:
                recent = df[ticker].dropna()
                ret = (recent.iloc[-1] / recent.iloc[0]) - 1
                momentum_score = ret * 10 # Scale it up slightly for the score
                flow = "Inflow" if momentum_score > 0 else "Outflow"
                data.append({
                    "sector": name,
                    "momentum_score": round(float(momentum_score), 2),
                    "sentiment_score": round(float(momentum_score), 2),
                    "flow_direction": flow
                })
    except Exception:
        pass
        
    return {"sectors": data, "timestamp": datetime.utcnow().isoformat()}

@app.get("/signals/insider")
async def get_insider_signals(limit: int = 10):
    if not settings.FINNHUB_API_KEY:
        return {"signals": [], "timestamp": datetime.utcnow().isoformat()}
        
    # Finnhub doesn't support bulk insider endpoint easily without specific ticker, 
    # so we'll fetch for a few top tickers to simulate a market-wide feed.
    tickers = ["AAPL", "MSFT", "NVDA", "AMZN"]
    signals = []
    
    try:
        for t in tickers:
            res = requests.get(f"https://finnhub.io/api/v1/stock/insider-transactions?symbol={t}&token={settings.FINNHUB_API_KEY}")
            if res.status_code == 200:
                data = res.json().get("data", [])
                for tx in data[:3]:
                    change = tx.get("change", 0)
                    price = tx.get("transactionPrice", 0)
                    value_str = f"${abs(change * price):,.0f}"
                    signals.append({
                        "Ticker": t,
                        "Insider Name": tx.get("name", "Unknown"),
                        "Transaction Type": "Buy" if change > 0 else "Sell",
                        "Shares": abs(change),
                        "Value": value_str,
                        "Date": tx.get("transactionDate", "")
                    })
    except Exception as e:
        print(f"Error fetching insider signals: {e}")
        
    # Sort by date descending and limit
    signals = sorted(signals, key=lambda x: x["Date"], reverse=True)[:limit]
    return {"signals": signals, "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
