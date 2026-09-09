from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .trends_fetcher import fetch_google_trends
from .social_volume import get_social_volume_for_ticker, get_trending_social_tickers, calculate_fomo_index

app = FastAPI(
    title="Indra-MarketMind Alternative Data API",
    description="Google Trends Search Velocity, Social Sentiment (Reddit/Twitter/Discord), and Retail FOMO Index",
    version="1.0.0"
)

@app.get("/trends/interest")
async def google_trends_endpoint(
    keyword: str = Query(..., example="NVDA stock", description="Keyword or ticker symbol to evaluate search volume for"),
    timeframe: str = Query(default="today 1-m", example="today 1-m", description="Pytrends timeframe string")
):
    """Retrieve Google search interest velocity and anomaly detection for a financial topic."""
    try:
        return fetch_google_trends(keyword=keyword, timeframe=timeframe)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/social/volume")
async def social_volume_endpoint(
    ticker: str = Query(..., example="NVDA", description="Stock or crypto ticker symbol")
):
    """Retrieve social mention velocity and sentiment breakdown across Reddit, X, and Discord."""
    return get_social_volume_for_ticker(ticker=ticker)

@app.get("/social/trending")
async def trending_social_endpoint():
    """Retrieve ranked leaderboard of tickers dominating retail trader conversations."""
    return {
        "count": len(get_trending_social_tickers()),
        "trending": get_trending_social_tickers()
    }

@app.get("/fomo_index")
async def fomo_index_endpoint():
    """Retrieve real-time aggregate Retail FOMO / Euphoria Index (0-100 scale)."""
    return calculate_fomo_index()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "alternative_data"}
