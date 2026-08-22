import logging
import requests
from typing import List
from datetime import datetime, timezone

from services.data_ingestion.schemas import RawArticle

logger = logging.getLogger(__name__)

class StockTwitsFetcher:
    def __init__(self):
        self.base_url = "https://api.stocktwits.com/api/2"
        # Stocktwits streams API doesn't require auth for basic public stream
        
    def fetch_for_ticker(self, ticker: str, limit: int = 30) -> List[RawArticle]:
        """Fetch StockTwits messages for a specific ticker."""
        articles = []
        # Tickers in stocktwits are typically the symbol without the exchange extension for US
        # e.g., AAPL, TSLA
        search_query = ticker.split(".")[0].upper()
        
        try:
            # We fetch from the symbol stream
            url = f"{self.base_url}/streams/symbol/{search_query}.json"
            response = requests.get(url, params={"limit": limit})
            
            if response.status_code == 404:
                logger.warning(f"StockTwits: Symbol {search_query} not found.")
                return []
                
            response.raise_for_status()
            data = response.json()
            
            messages = data.get("messages", [])
            
            for msg in messages:
                # Convert created_at to datetime
                created_at_str = msg.get("created_at")
                if created_at_str:
                    try:
                        published_at = datetime.strptime(created_at_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
                    except ValueError:
                        published_at = datetime.now(timezone.utc)
                else:
                    published_at = datetime.now(timezone.utc)
                    
                body = msg.get("body", "")
                
                # Check for sentiment if available
                sentiment_data = msg.get("entities", {}).get("sentiment", {})
                sentiment_basic = sentiment_data.get("basic", "") if sentiment_data else ""
                
                title = f"StockTwits Message - {sentiment_basic}" if sentiment_basic else "StockTwits Message"
                
                url = f"https://stocktwits.com/message/{msg.get('id')}"
                
                articles.append(RawArticle(
                    title=title,
                    body=body,
                    url=url,
                    source="StockTwits",
                    ticker=ticker,
                    published_at=published_at,
                    language_orig="en",
                    external_id=str(msg.get("id"))
                ))

            logger.info(f"StockTwits: Fetched {len(articles)} messages for {ticker}")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching from StockTwits for {ticker}: {e}")
            
        return articles
