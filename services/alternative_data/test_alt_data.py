import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.alternative_data.trends_fetcher import fetch_google_trends
from services.alternative_data.social_volume import (
    get_social_volume_for_ticker,
    get_trending_social_tickers,
    calculate_fomo_index
)
from services.alternative_data.main import app
from fastapi.testclient import TestClient

class TestAlternativeData(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_trends_fetcher(self):
        res = fetch_google_trends("NVDA stock")
        self.assertEqual(res["keyword"], "NVDA stock")
        self.assertIn("current_interest", res)
        self.assertIn("interest_velocity_pct", res)
        self.assertIn("history", res)
        self.assertGreaterEqual(len(res["history"]), 7)

    def test_social_volume(self):
        res = get_social_volume_for_ticker("NVDA")
        self.assertEqual(res["ticker"], "NVDA")
        self.assertIn("mentions_last_hour", res)
        self.assertIn("sentiment", res)
        self.assertIn("bullish_pct", res["sentiment"])
        self.assertIn("breakdown", res)
        self.assertIn("reddit_mentions", res["breakdown"])

    def test_fomo_index(self):
        fomo = calculate_fomo_index()
        self.assertIn("fomo_index", fomo)
        self.assertIn("classification", fomo)
        self.assertIn("tactical_guidance", fomo)
        self.assertGreaterEqual(fomo["fomo_index"], 0)
        self.assertLessEqual(fomo["fomo_index"], 100)

    def test_trending_tickers(self):
        trending = get_trending_social_tickers()
        self.assertGreaterEqual(len(trending), 3)
        self.assertIn("ticker", trending[0])
        self.assertIn("mentions_1h", trending[0])

    def test_api_endpoints(self):
        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)

        res_trends = self.client.get("/trends/interest?keyword=BTC")
        self.assertEqual(res_trends.status_code, 200)
        self.assertEqual(res_trends.json()["keyword"], "BTC")

        res_social = self.client.get("/social/volume?ticker=TSLA")
        self.assertEqual(res_social.status_code, 200)
        self.assertEqual(res_social.json()["ticker"], "TSLA")

        res_trending = self.client.get("/social/trending")
        self.assertEqual(res_trending.status_code, 200)
        self.assertIn("trending", res_trending.json())

        res_fomo = self.client.get("/fomo_index")
        self.assertEqual(res_fomo.status_code, 200)
        data = res_fomo.json()
        print(f"[Phase 13 Test] Retail FOMO Index: {data['fomo_index']} / 100 ({data['classification']})")

if __name__ == "__main__":
    unittest.main()
