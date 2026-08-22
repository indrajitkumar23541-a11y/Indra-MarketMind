# ──────────────────────────────────────────────────────────
# services/data_ingestion/main.py — Data Fetching Service
# ──────────────────────────────────────────────────────────
from fastapi import FastAPI
import uvicorn
import sys
from pathlib import Path

# Add project root to python path so we can import shared
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from shared.config import settings

app = FastAPI(
    title="Data Ingestion Service",
    description="Service responsible for fetching raw data from APIs (News, Stocks, Reddit).",
    version="1.0.0"
)
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from shared.database import get_db
from services.data_ingestion.news.newsapi_fetcher import NewsAPIFetcher
from services.data_ingestion.market.yfinance_fetcher import YFinanceFetcher
from services.data_ingestion.market.finnhub_fetcher import FinnhubFetcher
from services.data_ingestion.social.reddit_fetcher import RedditFetcher
from services.data_ingestion.social.stocktwits_fetcher import StockTwitsFetcher
from services.data_ingestion.social.google_trends import GoogleTrendsFetcher
from services.data_ingestion.news.rss_fetcher import RSSFetcher
from services.data_ingestion.news.sec_edgar_fetcher import SecEdgarFetcher
from services.data_ingestion.db_writer import write_article_to_db

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "data-ingestion",
        "fetchers_active": 8
    }

@app.post("/fetch/news/{ticker}")
async def fetch_news_for_ticker(ticker: str, days_back: int = 7, db: Session = Depends(get_db)):
    """Fetch news from NewsAPI for a specific ticker and store in DB."""
    fetcher = NewsAPIFetcher()
    articles = fetcher.fetch_for_ticker(ticker=ticker, days_back=days_back)
    
    saved_count = 0
    for article in articles:
        db_article = write_article_to_db(db, article)
        if db_article:
            saved_count += 1
            
    return {"ticker": ticker, "fetched": len(articles), "saved": saved_count}

@app.post("/fetch/news/rss")
async def fetch_news_rss(db: Session = Depends(get_db)):
    """Fetch general market news from predefined RSS feeds and store in DB."""
    fetcher = RSSFetcher()
    articles = fetcher.fetch_all()
    
    saved_count = 0
    for article in articles:
        db_article = write_article_to_db(db, article)
        if db_article:
            saved_count += 1
            
    return {"fetched": len(articles), "saved": saved_count}

@app.post("/fetch/social/reddit/{ticker}")
async def fetch_social_reddit(ticker: str, db: Session = Depends(get_db)):
    """Fetch recent reddit posts for a ticker and store in DB."""
    fetcher = RedditFetcher()
    articles = fetcher.fetch_for_ticker(ticker=ticker)
    
    saved_count = 0
    for article in articles:
        db_article = write_article_to_db(db, article)
        if db_article:
            saved_count += 1
            
    return {"ticker": ticker, "fetched": len(articles), "saved": saved_count}

@app.post("/fetch/social/stocktwits/{ticker}")
async def fetch_social_stocktwits(ticker: str, db: Session = Depends(get_db)):
    """Fetch recent StockTwits messages for a ticker and store in DB."""
    fetcher = StockTwitsFetcher()
    articles = fetcher.fetch_for_ticker(ticker=ticker)
    
    saved_count = 0
    for article in articles:
        db_article = write_article_to_db(db, article)
        if db_article:
            saved_count += 1
            
    return {"ticker": ticker, "fetched": len(articles), "saved": saved_count}

@app.post("/fetch/news/sec/{ticker}")
async def fetch_news_sec(ticker: str, db: Session = Depends(get_db)):
    """Fetch recent SEC EDGAR filings for a ticker and store in DB."""
    fetcher = SecEdgarFetcher()
    articles = fetcher.fetch_recent_filings(ticker=ticker)
    
    saved_count = 0
    for article in articles:
        db_article = write_article_to_db(db, article)
        if db_article:
            saved_count += 1
            
    return {"ticker": ticker, "fetched": len(articles), "saved": saved_count}

@app.get("/fetch/social/trends/{ticker}")
async def fetch_social_trends(ticker: str, timeframe: str = "today 7-d"):
    """Fetch Google Trends interest over time for a ticker."""
    fetcher = GoogleTrendsFetcher()
    data = fetcher.fetch_interest_over_time(ticker=ticker, timeframe=timeframe)
    return {"ticker": ticker, "timeframe": timeframe, "data": data}

@app.get("/fetch/market/{ticker}/quote")
async def fetch_market_quote(ticker: str):
    """Fetch real-time quote from Finnhub."""
    fetcher = FinnhubFetcher()
    quote = fetcher.fetch_quote(ticker=ticker)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found or error fetching.")
    return quote

@app.get("/fetch/market/{ticker}/historical")
async def fetch_market_historical(ticker: str, period: str = "1mo"):
    """Fetch historical data from YFinance."""
    fetcher = YFinanceFetcher()
    data = fetcher.fetch_historical(ticker=ticker, period=period)
    return {"ticker": ticker, "records_fetched": len(data), "data": data}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
