from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
import requests
import os
from datetime import datetime

logger = logging.getLogger(__name__)

DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://localhost:8001")
ALERT_SERVICE_URL = os.getenv("ALERT_SERVICE_URL", "http://localhost:8005")

WATCHLIST = ["AAPL", "MSFT", "NVDA", "RELIANCE.NS", "TCS.NS"]

class MarketScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def start(self):
        # Every 15 min during market hours — trigger data ingestion for watchlist
        self.scheduler.add_job(
            self._trigger_data_ingestion,
            CronTrigger(day_of_week='mon-fri', hour='9-15', minute='*/15'),
            id='market_data_ingestion',
            name='Fetch Market Data',
            replace_existing=True
        )

        # Daily EOD summary Mon-Fri at 4:15 PM IST
        self.scheduler.add_job(
            self._trigger_eod_summary,
            CronTrigger(day_of_week='mon-fri', hour='16', minute='15'),
            id='eod_summary',
            name='End of Day Summary',
            replace_existing=True
        )

        self.scheduler.start()
        logger.info("MarketScheduler started successfully.")

    def stop(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
        logger.info("MarketScheduler stopped.")

    def _trigger_data_ingestion(self):
        """Calls data service to refresh quotes for all watchlist tickers."""
        logger.info(f"[{datetime.now()}] SCHEDULER: Triggering Data Ingestion Pipeline...")
        for ticker in WATCHLIST:
            try:
                requests.post(
                    f"{DATA_SERVICE_URL}/fetch/news/{ticker}",
                    params={"days_back": 1},
                    timeout=5
                )
            except Exception as e:
                logger.warning(f"Scheduler: Could not fetch news for {ticker}: {e}")

    def _trigger_eod_summary(self):
        """Sends a daily End-of-Day summary alert via the alert service."""
        logger.info(f"[{datetime.now()}] SCHEDULER: Generating End of Day Summary...")
        try:
            requests.post(
                f"{ALERT_SERVICE_URL}/alerts/trigger",
                json={
                    "title": "📊 End of Day Market Summary",
                    "message": (
                        f"Market session closed. Watchlist monitored: {', '.join(WATCHLIST)}.\n"
                        "Check your Indra-MarketMind dashboard for full analytics."
                    ),
                    "priority": "normal",
                    "channels": ["telegram"]
                },
                timeout=5
            )
        except Exception as e:
            logger.warning(f"Scheduler: Could not send EOD summary: {e}")
