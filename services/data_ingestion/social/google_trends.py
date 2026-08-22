import logging
import time
from typing import List, Dict
from datetime import datetime, timezone
from pytrends.request import TrendReq

logger = logging.getLogger(__name__)

class GoogleTrendsFetcher:
    def __init__(self):
        # Initialize pytrends
        try:
            self.pytrends = TrendReq(hl='en-US', tz=360)
        except Exception as e:
            logger.error(f"Error initializing pytrends: {e}")
            self.pytrends = None

    def fetch_interest_over_time(self, ticker: str, timeframe: str = 'today 7-d') -> Dict:
        """
        Fetch Google Trends interest over time for a specific ticker.
        timeframe: 'today 7-d', 'today 1-m', etc.
        Returns a dict with dates as keys and interest score as values.
        """
        if not self.pytrends:
            return {}
            
        search_query = ticker.split(".")[0].upper() # Use base ticker symbol
        
        try:
            self.pytrends.build_payload([search_query], cat=0, timeframe=timeframe, geo='', gprop='')
            interest_over_time_df = self.pytrends.interest_over_time()
            
            if interest_over_time_df.empty:
                logger.warning(f"Google Trends: No data for {search_query}")
                return {}
                
            # Drop the isPartial column
            if 'isPartial' in interest_over_time_df.columns:
                interest_over_time_df = interest_over_time_df.drop('isPartial', axis=1)
                
            # Convert to dictionary { date_string: score }
            # Make sure we use strings for datetime to be JSON serializable
            result = {}
            for index, row in interest_over_time_df.iterrows():
                result[index.strftime("%Y-%m-%d %H:%M:%S")] = int(row[search_query])
                
            logger.info(f"Google Trends: Fetched data for {search_query}")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching Google Trends for {search_query}: {e}")
            return {}
