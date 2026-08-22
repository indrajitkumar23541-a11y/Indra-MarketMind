import logging
import requests
from typing import List, Optional
from datetime import datetime, timezone

from shared.config import settings
from services.data_ingestion.schemas import RawArticle

logger = logging.getLogger(__name__)

class NewsAPIFetcher:
    def __init__(self):
        self.api_key = settings.NEWSAPI_KEY
        self.base_url = "https://newsapi.org/v2"

    def _parse_article(self, item: dict, ticker: Optional[str] = None) -> RawArticle:
        # Convert publishedAt to datetime
        published_at_str = item.get("publishedAt")
        if published_at_str:
            try:
                published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00"))
            except ValueError:
                published_at = datetime.now(timezone.utc)
        else:
            published_at = datetime.now(timezone.utc)
            
        return RawArticle(
            title=item.get("title", ""),
            body=item.get("content") or item.get("description"),
            url=item.get("url", ""),
            source=item.get("source", {}).get("name", "Unknown"),
            ticker=ticker,
            published_at=published_at,
            language_orig="en",
            external_id=item.get("url", "")
        )

    def fetch_for_ticker(self, ticker: str, days_back: int = 7) -> List[RawArticle]:
        """Fetch news specifically for a ticker symbol (e.g., AAPL)."""
        if not self.api_key:
            logger.error("NewsAPI Key is missing!")
            return []

        # Example query: searching for the ticker in title/content
        # Remove suffix like .NS for better text search if needed, but for now use as is
        search_query = ticker.split(".")[0] 
        
        params = {
            "q": search_query,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": 50,
            "apiKey": self.api_key
        }

        try:
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()
            data = response.json()

            articles = []
            for item in data.get("articles", []):
                if item.get("title") != "[Removed]":
                    articles.append(self._parse_article(item, ticker=ticker))
            
            logger.info(f"NewsAPI: Fetched {len(articles)} articles for {ticker}")
            return articles

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching news for {ticker}: {e}")
            return []
