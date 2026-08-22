import logging
import requests
from typing import List, Optional
from datetime import datetime, timezone

from shared.config import settings
from services.data_ingestion.schemas import RawMarketData

logger = logging.getLogger(__name__)

class FinnhubFetcher:
    def __init__(self):
        self.api_key = settings.FINNHUB_API_KEY
        self.base_url = "https://finnhub.io/api/v1"

    def fetch_quote(self, ticker: str) -> Optional[RawMarketData]:
        """Fetch real-time quote for a ticker."""
        if not self.api_key:
            logger.error("Finnhub API Key is missing!")
            return None

        # Remove suffix like .NS for Finnhub if it's US stock, but Finnhub supports some international
        # For simplicity, passing it as is
        params = {
            "symbol": ticker,
            "token": self.api_key
        }

        try:
            response = requests.get(f"{self.base_url}/quote", params=params)
            response.raise_for_status()
            data = response.json()
            
            # Finnhub returns 'c', 'h', 'l', 'o', 'pc', 't'
            # c: Current price, d: Change, dp: Percent change, h: High, l: Low, o: Open, pc: Previous close
            
            if "c" not in data or data["c"] == 0:
                logger.warning(f"Finnhub: No quote data found for {ticker}")
                return None
                
            return RawMarketData(
                ticker=ticker,
                timestamp=datetime.now(timezone.utc),
                open=float(data.get("o", 0.0)),
                high=float(data.get("h", 0.0)),
                low=float(data.get("l", 0.0)),
                close=float(data.get("c", 0.0)),
                volume=0,  # Finnhub basic quote doesn't provide volume
                exchange="Finnhub"
            )

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Finnhub quote for {ticker}: {e}")
            return None
