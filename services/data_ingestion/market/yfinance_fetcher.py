import logging
import yfinance as yf
from typing import List, Optional
from datetime import datetime, timezone

from services.data_ingestion.schemas import RawMarketData

logger = logging.getLogger(__name__)

class YFinanceFetcher:
    def fetch_historical(self, ticker: str, period: str = "1mo", interval: str = "1d") -> List[RawMarketData]:
        """Fetch historical market data using yfinance."""
        logger.info(f"YFinance: Fetching {period} data for {ticker} at {interval} interval")
        try:
            stock = yf.Ticker(ticker)
            df = stock.history(period=period, interval=interval)
            
            if df.empty:
                logger.warning(f"YFinance: No data found for {ticker}")
                return []

            market_data = []
            for index, row in df.iterrows():
                # index is a pandas Timestamp
                timestamp = index.to_pydatetime()
                if timestamp.tzinfo is None:
                    timestamp = timestamp.replace(tzinfo=timezone.utc)
                
                market_data.append(RawMarketData(
                    ticker=ticker,
                    timestamp=timestamp,
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume']),
                    exchange="YF" # Placeholder, actual exchange would require another call or predefined mapping
                ))
            
            logger.info(f"YFinance: Fetched {len(market_data)} records for {ticker}")
            return market_data

        except Exception as e:
            logger.error(f"Error fetching yfinance data for {ticker}: {e}")
            return []
