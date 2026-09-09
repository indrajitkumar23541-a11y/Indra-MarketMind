import unittest
import sys
import os
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.multimodal.audio_processor import transcribe_audio
from services.multimodal.earnings_fetcher import download_youtube_audio
from services.multimodal.main import app, fallback_sentiment_analysis
from fastapi.testclient import TestClient

class TestMultiModal(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_audio_processor_transcription(self):
        # Create a temp file
        temp_audio = os.path.join(tempfile.gettempdir(), "test_sample.m4a")
        with open(temp_audio, "wb") as f:
            f.write(b"AUDIO_TEST_BYTES")
            
        try:
            transcript, provider = transcribe_audio(temp_audio)
            self.assertIsInstance(transcript, str)
            self.assertGreater(len(transcript), 20)
            self.assertIn("growth", transcript.lower())
            print(f"[Phase 11 Test] STT Provider: {provider}, Transcript length: {len(transcript)} chars")
        finally:
            if os.path.exists(temp_audio):
                os.remove(temp_audio)

    def test_earnings_fetcher_fallback(self):
        path = download_youtube_audio("https://www.youtube.com/watch?v=mock_video")
        self.assertTrue(os.path.exists(path))
        if os.path.exists(path):
            os.remove(path)

    def test_lexicon_sentiment_analysis(self):
        bullish_sample = "We experienced record revenue growth and expanding operating margins with high demand."
        res_bull = fallback_sentiment_analysis(bullish_sample)
        self.assertEqual(res_bull["label"], "BULLISH")
        self.assertGreater(res_bull["score"], 0)

        bearish_sample = "Severe slowdown in demand led to margin compression and quarterly loss."
        res_bear = fallback_sentiment_analysis(bearish_sample)
        self.assertEqual(res_bear["label"], "BEARISH")
        self.assertLess(res_bear["score"], 0)

    def test_fastapi_endpoints(self):
        # 1. Health check
        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.json()["status"], "healthy")

        # 2. Analyze earnings endpoint
        req = {
            "ticker": "NVDA",
            "quarter": "Q4",
            "year": 2024
        }
        res_earnings = self.client.post("/analyze/earnings", json=req)
        self.assertEqual(res_earnings.status_code, 200)
        data = res_earnings.json()
        self.assertEqual(data["ticker"], "NVDA")
        self.assertIn("sentiment_score", data)
        self.assertIn("key_themes", data)
        print(f"[Phase 11 Test] Earnings Analysis: {data['ticker']} {data['period']} Sentiment={data['sentiment_label']} (Score: {data['sentiment_score']})")

        # 3. YouTube transcribe endpoint
        res_yt = self.client.post("/transcribe/youtube", json={"url": "https://www.youtube.com/watch?v=sample"})
        self.assertEqual(res_yt.status_code, 200)
        self.assertIn("transcription", res_yt.json())

if __name__ == "__main__":
    unittest.main()
