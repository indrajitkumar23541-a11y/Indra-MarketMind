import logging
import os
from typing import List
from datetime import datetime, timezone
from bs4 import BeautifulSoup

from sec_edgar_downloader import Downloader
from shared.config import settings
from services.data_ingestion.schemas import RawArticle

logger = logging.getLogger(__name__)

class SecEdgarFetcher:
    def __init__(self):
        # We need a download directory for EDGAR
        self.download_dir = os.path.join(settings.BASE_DIR, "data", "raw", "sec_edgar")
        os.makedirs(self.download_dir, exist_ok=True)
        
        user_agent = settings.SEC_EDGAR_USER_AGENT
        if not user_agent or "user@domain.com" in user_agent:
            logger.warning("SEC EDGAR User-Agent is not properly configured. Fetches might be blocked.")
            user_agent = "IndraMarketMind default@example.com"
            
        company_name, email = user_agent.rsplit(" ", 1) if " " in user_agent else (user_agent, "default@example.com")
        
        self.downloader = Downloader(company_name, email, self.download_dir)

    def _extract_text_from_html(self, file_path: str) -> str:
        """Extract plain text from an EDGAR HTML filing."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                soup = BeautifulSoup(content, "html.parser")
                return soup.get_text(separator=" ", strip=True)
        except Exception as e:
            logger.error(f"Error reading EDGAR file {file_path}: {e}")
            return ""

    def fetch_recent_filings(self, ticker: str, limit: int = 5) -> List[RawArticle]:
        """Fetch recent 8-K (Current Report) and 4 (Insider Trading) filings."""
        articles = []
        search_ticker = ticker.split(".")[0].upper() # Extract base ticker
        
        filing_types = ["8-K", "4"]
        
        for filing_type in filing_types:
            try:
                # This downloads files to self.download_dir / sec-edgar-filings / TICKER / FILING_TYPE / ...
                # limit is per filing type
                num_downloaded = self.downloader.get(filing_type, search_ticker, limit=limit, download_details=True)
                logger.info(f"Downloaded {num_downloaded} {filing_type} filings for {search_ticker}")
                
                # Parse downloaded files
                ticker_dir = os.path.join(self.download_dir, "sec-edgar-filings", search_ticker, filing_type)
                
                if os.path.exists(ticker_dir):
                    for accession_dir in os.listdir(ticker_dir):
                        filing_path = os.path.join(ticker_dir, accession_dir, "primary-document.html")
                        
                        if os.path.exists(filing_path):
                            text_content = self._extract_text_from_html(filing_path)
                            
                            if text_content:
                                # We don't have exact published_at easily without parsing the index header, 
                                # but for now we default to now or extract from metadata if available.
                                # Using UTC now for simplicity as a placeholder.
                                published_at = datetime.now(timezone.utc)
                                
                                title = f"SEC Filing {filing_type} - {search_ticker}"
                                url = f"https://www.sec.gov/Archives/edgar/data/{search_ticker}/{accession_dir.replace('-', '')}/{accession_dir}.txt"
                                
                                articles.append(RawArticle(
                                    title=title,
                                    body=text_content[:5000], # Limit body size
                                    url=url,
                                    source=f"SEC EDGAR - {filing_type}",
                                    ticker=ticker,
                                    published_at=published_at,
                                    language_orig="en",
                                    external_id=accession_dir
                                ))
                                
            except Exception as e:
                logger.error(f"Error fetching SEC EDGAR {filing_type} for {search_ticker}: {e}")
                
        return articles
