import os
import requests
import logging

logger = logging.getLogger(__name__)

# Base URLs for the internal docker network
# If running outside docker for dev, these might need to be localhost
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://data-service:8001")
SENTIMENT_SERVICE_URL = os.getenv("SENTIMENT_SERVICE_URL", "http://sentiment-service:8002")
FORECAST_SERVICE_URL = os.getenv("FORECAST_SERVICE_URL", "http://forecast-service:8004")
ALERT_SERVICE_URL = os.getenv("ALERT_SERVICE_URL", "http://alert-service:8005")
ANALYTICS_SERVICE_URL = os.getenv("ANALYTICS_SERVICE_URL", "http://analytics-service:8003")

TIMEOUT = 10  # seconds

class APIClient:
    @staticmethod
    def get_market_quote(ticker: str):
        try:
            response = requests.get(f"{DATA_SERVICE_URL}/fetch/market/{ticker}/quote", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Error fetching quote for {ticker}: {e}")
            return None

    @staticmethod
    def get_historical_data(ticker: str, period: str = "1mo"):
        try:
            response = requests.get(f"{DATA_SERVICE_URL}/fetch/market/{ticker}/historical?period={period}", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json().get("data", [])
            return []
        except Exception as e:
            logger.error(f"Error fetching historical data for {ticker}: {e}")
            return []

    @staticmethod
    def trigger_news_fetch(ticker: str, days_back: int = 7):
        try:
            response = requests.post(f"{DATA_SERVICE_URL}/fetch/news/{ticker}?days_back={days_back}", timeout=TIMEOUT)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error triggering news fetch for {ticker}: {e}")
            return False

    @staticmethod
    def get_sentiment_ensemble(text: str):
        try:
            response = requests.post(f"{SENTIMENT_SERVICE_URL}/analyze/ensemble", json={"text": text}, timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Error fetching sentiment: {e}")
            return None

    @staticmethod
    def get_forecast_hybrid(ticker: str, days: int = 30):
        try:
            response = requests.post(f"{FORECAST_SERVICE_URL}/forecast/hybrid", json={"ticker": ticker, "days_ahead": days}, timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Error fetching forecast for {ticker}: {e}")
            return None

    @staticmethod
    def get_recent_news(limit: int = 15):
        try:
            response = requests.get(f"{DATA_SERVICE_URL}/news/recent?limit={limit}", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Error fetching recent news: {e}")
            return []

    @staticmethod
    def get_news_count(hours_back: int = 24):
        try:
            response = requests.get(f"{DATA_SERVICE_URL}/news/count?hours_back={hours_back}", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json().get("count", 0)
            return 0
        except Exception as e:
            logger.error(f"Error fetching news count: {e}")
            return 0

    @staticmethod
    def get_fear_greed_index():
        try:
            response = requests.get(f"{ANALYTICS_SERVICE_URL}/signals/fear-greed", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Error fetching fear greed: {e}")
            return None

    @staticmethod
    def get_sector_rotation():
        try:
            response = requests.get(f"{ANALYTICS_SERVICE_URL}/signals/sector-rotation", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Error fetching sector rotation: {e}")
            return []

    @staticmethod
    def get_insider_signals(limit: int = 10):
        try:
            response = requests.get(f"{ANALYTICS_SERVICE_URL}/signals/insider?limit={limit}", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Error fetching insider signals: {e}")
            return []
            
    @staticmethod
    def get_correlation_stats(ticker: str):
        try:
            response = requests.get(f"{ANALYTICS_SERVICE_URL}/analyze/correlation/{ticker}", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Error fetching correlation for {ticker}: {e}")
            return None

    @staticmethod
    def get_granger_causality(ticker: str):
        try:
            response = requests.get(f"{ANALYTICS_SERVICE_URL}/analyze/granger/{ticker}", timeout=TIMEOUT)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error(f"Error fetching granger causality for {ticker}: {e}")
            return None
