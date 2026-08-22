import logging
import feedparser
from typing import List, Dict
from datetime import datetime, timezone
import time

from services.data_ingestion.schemas import RawArticle

logger = logging.getLogger(__name__)

# Predefined financial RSS feeds
DEFAULT_RSS_FEEDS = {
    "Reuters Business": "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    "Economic Times Market": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "Mint Markets": "https://www.livemint.com/rss/markets",
    "Moneycontrol": "https://www.moneycontrol.com/rss/MCtopnews.xml"
}

class RSSFetcher:
    def __init__(self, feeds: Dict[str, str] = DEFAULT_RSS_FEEDS):
        self.feeds = feeds

    def _parse_published_date(self, entry) -> datetime:
        """Parse RSS date to UTC datetime."""
        # feedparser standardizes dates in entry.published_parsed
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            return datetime.fromtimestamp(time.mktime(entry.published_parsed), tz=timezone.utc)
        return datetime.now(timezone.utc)

    def fetch_all(self, limit_per_feed: int = 50) -> List[RawArticle]:
        """Fetch general market news from all configured RSS feeds."""
        articles = []
        
        for source_name, feed_url in self.feeds.items():
            try:
                logger.info(f"Fetching RSS feed from {source_name}...")
                feed = feedparser.parse(feed_url)
                
                # Check for parsing errors
                if feed.bozo and getattr(feed.bozo_exception, 'getMessage', lambda: "")() != "":
                    logger.warning(f"Feed parser issue for {source_name}: {feed.bozo_exception}")
                
                count = 0
                for entry in feed.entries:
                    if count >= limit_per_feed:
                        break
                        
                    published_at = self._parse_published_date(entry)
                    title = getattr(entry, 'title', '')
                    body = getattr(entry, 'summary', '') or getattr(entry, 'description', '')
                    url = getattr(entry, 'link', '')
                    
                    # Deduplicate using the link as external_id
                    external_id = url
                    
                    articles.append(RawArticle(
                        title=title,
                        body=body,
                        url=url,
                        source=source_name,
                        ticker=None,  # RSS is usually general market news, not ticker specific unless processed further
                        published_at=published_at,
                        language_orig="en",
                        external_id=external_id
                    ))
                    count += 1
                    
            except Exception as e:
                logger.error(f"Error fetching RSS from {source_name}: {e}")
                
        logger.info(f"RSS: Fetched {len(articles)} articles total from {len(self.feeds)} feeds")
        return articles
