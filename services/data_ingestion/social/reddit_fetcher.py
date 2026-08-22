import logging
from typing import List, Optional
from datetime import datetime, timezone
import praw
from prawcore.exceptions import ResponseException

from shared.config import settings
from services.data_ingestion.schemas import RawArticle

logger = logging.getLogger(__name__)

class RedditFetcher:
    def __init__(self):
        if not settings.REDDIT_CLIENT_ID or not settings.REDDIT_CLIENT_SECRET:
            logger.warning("Reddit API credentials missing. RedditFetcher will not work.")
            self.reddit = None
        else:
            try:
                self.reddit = praw.Reddit(
                    client_id=settings.REDDIT_CLIENT_ID,
                    client_secret=settings.REDDIT_CLIENT_SECRET,
                    user_agent=settings.REDDIT_USER_AGENT
                )
            except Exception as e:
                logger.error(f"Failed to initialize Reddit client: {e}")
                self.reddit = None
                
    def fetch_for_ticker(self, ticker: str, subreddits: List[str] = ["wallstreetbets", "stocks", "investing"], limit: int = 20) -> List[RawArticle]:
        """Fetch reddit posts mentioning a specific ticker."""
        if not self.reddit:
            return []

        articles = []
        search_query = ticker.split(".")[0]  # E.g. AAPL instead of AAPL.US

        for sub in subreddits:
            try:
                subreddit = self.reddit.subreddit(sub)
                # Search within the subreddit
                for submission in subreddit.search(search_query, time_filter='week', limit=limit):
                    # Filter out stickied posts
                    if submission.stickied:
                        continue
                        
                    published_at = datetime.fromtimestamp(submission.created_utc, tz=timezone.utc)
                    url = f"https://www.reddit.com{submission.permalink}"
                    
                    articles.append(RawArticle(
                        title=submission.title,
                        body=submission.selftext,
                        url=url,
                        source=f"Reddit - r/{sub}",
                        ticker=ticker,
                        published_at=published_at,
                        language_orig="en",
                        external_id=submission.id
                    ))
            except ResponseException as e:
                logger.error(f"Reddit API response error for r/{sub}: {e}")
            except Exception as e:
                logger.error(f"Error fetching from r/{sub}: {e}")

        logger.info(f"Reddit: Fetched {len(articles)} posts for {ticker}")
        return articles
