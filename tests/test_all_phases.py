"""
Indra-MarketMind — Master Test Suite for Phases 9 through 14
Validates:
  - Phase 9: LLM RAG Chatbot
  - Phase 10: Auto-Execution & Paper Trading Engine
  - Phase 11: Multi-Modal Audio Sentiment
  - Phase 12: Crypto On-Chain Whale Tracker & Network Metrics
  - Phase 13: Alternative Data, Trends, and Retail FOMO Index
  - Phase 14: Kubernetes Orchestration Manifests Validation
"""

import sys
import os
import unittest
import glob

# Ensure workspace root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, WORKSPACE_ROOT)

# Phase 9 Imports
from services.rag_chatbot.vector_store import add_texts_to_vector_store, search_similar_documents, get_store_status
from services.rag_chatbot.langchain_engine import answer_query

# Phase 10 Imports
from services.auto_trading.brokers.paper_broker import PaperBroker
from services.auto_trading.risk_manager import calculate_brackets, calculate_position_size, check_drawdown_limit
from services.auto_trading.trade_logic import process_trade_signal, execute_approved_trade

# Phase 11 Imports
from services.multimodal.audio_processor import transcribe_audio
from services.multimodal.main import fallback_sentiment_analysis

# Phase 12 Imports
from services.crypto_onchain.whale_tracker import WhaleTracker
from services.crypto_onchain.metrics_fetcher import get_network_metrics, get_gas_metrics, get_fear_and_greed_index

# Phase 13 Imports
from services.alternative_data.trends_fetcher import fetch_google_trends
from services.alternative_data.social_volume import get_social_volume_for_ticker, calculate_fomo_index, get_trending_social_tickers


class MasterPhasesTest(unittest.TestCase):

    # ──────────────────────────────────────────────────────────
    # Phase 9: LLM RAG Chatbot
    # ──────────────────────────────────────────────────────────
    def test_phase_09_rag_chatbot(self):
        print("\n--- Testing Phase 9: LLM RAG Chatbot ---")
        # Ingest documents
        texts = [
            "Federal Reserve holds interest rates steady as core inflation cools towards 2% target.",
            "Semiconductor sector records 45% revenue surge on enterprise generative AI infrastructure spending."
        ]
        meta = [{"source": "Fed Minutes", "topic": "macro"}, {"source": "Tech Earnings", "topic": "semis"}]
        added = add_texts_to_vector_store(texts, meta)
        self.assertEqual(added, 2)

        # Similarity search
        results = search_similar_documents("semiconductor revenue AI", k=1)
        self.assertGreaterEqual(len(results), 1)
        self.assertIn("Semiconductor", results[0]["text"])

        # Grounded answer query
        response = answer_query("What is driving semiconductor revenue growth?")
        self.assertIn("answer", response)
        self.assertIn("sources", response)
        self.assertIn("model_used", response)
        self.assertGreater(len(response["answer"]), 30)
        print(f"  [PASS] RAG Retrieval & Synthesis verified (Model: {response['model_used']})")

    # ──────────────────────────────────────────────────────────
    # Phase 10: Auto-Execution & Paper Trading
    # ──────────────────────────────────────────────────────────
    def test_phase_10_auto_trading(self):
        print("\n--- Testing Phase 10: Auto-Execution & Paper Trading ---")
        broker = PaperBroker(initial_balance=100_000.0)
        self.assertEqual(broker.get_account_balance(), 100_000.0)

        # 1. Execute BUY
        order = broker.place_order(symbol="NVDA", qty=10, action="BUY", price=125.0, stop_loss=122.5, take_profit=130.0)
        self.assertEqual(order["status"], "FILLED")
        self.assertEqual(broker.get_account_balance(), 100_000.0 - 1250.0)

        # 2. Portfolio Valuation
        portfolio = broker.get_portfolio(current_prices={"NVDA": 135.0})
        self.assertEqual(portfolio["unrealized_pnl"], 100.0) # (135 - 125) * 10
        self.assertEqual(portfolio["total_portfolio_value"], 100_100.0)

        # 3. Risk brackets calculation (1:2 R:R)
        sl, tp = calculate_brackets(entry_price=200.0, action="BUY")
        self.assertEqual(sl, 196.0) # 2% SL
        self.assertEqual(tp, 208.0) # 4% TP

        # 4. Auto-execute high-confidence signal
        res_trade = process_trade_signal("NVDA", "BULLISH", confidence=0.89, auto_execute=True)
        self.assertEqual(res_trade["status"], "executed")
        print(f"  [PASS] Paper Broker balance, order execution, PnL & Risk Manager verified")

    # ──────────────────────────────────────────────────────────
    # Phase 11: Multi-Modal AI Audio Sentiment
    # ──────────────────────────────────────────────────────────
    def test_phase_11_multimodal(self):
        print("\n--- Testing Phase 11: Multi-Modal Audio Sentiment ---")
        # Test lexicon tone analysis
        bullish_call = "Today we achieved record free cash flow with operating margins expanding across all divisions."
        res_bull = fallback_sentiment_analysis(bullish_call)
        self.assertEqual(res_bull["label"], "BULLISH")
        self.assertGreater(res_bull["score"], 0)

        bearish_call = "We face persistent macroeconomic headwinds resulting in revenue contraction and demand drop."
        res_bear = fallback_sentiment_analysis(bearish_call)
        self.assertEqual(res_bear["label"], "BEARISH")
        self.assertLess(res_bear["score"], 0)

        # Test STT fallback
        import tempfile
        tmp_audio = os.path.join(tempfile.gettempdir(), "test_audio.m4a")
        with open(tmp_audio, "wb") as f:
            f.write(b"AUDIO_TEST")
        try:
            transcript, provider = transcribe_audio(tmp_audio)
            self.assertGreater(len(transcript), 50)
            print(f"  [PASS] Audio STT and Tone Sentiment verified (Provider: {provider})")
        finally:
            if os.path.exists(tmp_audio):
                os.remove(tmp_audio)

    # ──────────────────────────────────────────────────────────
    # Phase 12: Crypto On-Chain Metrics & Whale Tracker
    # ──────────────────────────────────────────────────────────
    def test_phase_12_crypto_onchain(self):
        print("\n--- Testing Phase 12: Crypto On-Chain & Whale Tracker ---")
        tracker = WhaleTracker(min_usd_threshold=1_000_000.0)
        
        # Test Whale Outflow (Bullish Accumulation)
        outflow = tracker.record_transaction(
            asset="BTC",
            amount=500.0,
            usd_price=64000.0,
            from_address="0x28c6c06298d514db089934071355e5743bf21d60", # Binance
            to_address="1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ"
        )
        self.assertEqual(outflow["flow_type"], "OUTFLOW")
        self.assertEqual(outflow["signal"], "BULLISH_ACCUMULATION")

        # Network metrics
        net_metrics = get_network_metrics()
        self.assertIn("bitcoin", net_metrics)
        self.assertIn("ethereum", net_metrics)
        self.assertIn("fear_and_greed", net_metrics)

        gas = get_gas_metrics()
        self.assertIn("ethereum_mainnet", gas)
        print(f"  [PASS] Whale tracker, flow classification & network fundamentals verified")

    # ──────────────────────────────────────────────────────────
    # Phase 13: Alternative Data & Social Volume
    # ──────────────────────────────────────────────────────────
    def test_phase_13_alternative_data(self):
        print("\n--- Testing Phase 13: Alternative Data & Retail FOMO Index ---")
        # Google Trends
        trends = fetch_google_trends("BTC")
        self.assertIn("current_interest", trends)
        self.assertIn("interest_velocity_pct", trends)
        self.assertGreaterEqual(len(trends["history"]), 7)

        # Social Volume & Sentiment
        social = get_social_volume_for_ticker("NVDA")
        self.assertIn("mentions_last_hour", social)
        self.assertIn("sentiment", social)

        # Retail FOMO Index
        fomo = calculate_fomo_index()
        self.assertIn("fomo_index", fomo)
        self.assertIn("classification", fomo)
        self.assertGreaterEqual(fomo["fomo_index"], 0)
        print(f"  [PASS] Google Trends velocity & Social FOMO Index verified ({fomo['fomo_index']}/100: {fomo['classification']})")

    # ──────────────────────────────────────────────────────────
    # Phase 14: Cloud Kubernetes Orchestration Manifests
    # ──────────────────────────────────────────────────────────
    def test_phase_14_k8s_manifests(self):
        print("\n--- Testing Phase 14: Kubernetes Manifests Integrity ---")
        k8s_dir = os.path.join(WORKSPACE_ROOT, "k8s")
        self.assertTrue(os.path.isdir(k8s_dir), "k8s directory must exist")

        yaml_files = glob.glob(os.path.join(k8s_dir, "*.yaml"))
        self.assertGreaterEqual(len(yaml_files), 7, f"Found only {len(yaml_files)} YAML files in k8s/")

        # Verify key manifests exist
        expected_files = [
            "namespace.yaml", "configmap.yaml", "secrets.yaml",
            "postgres.yaml", "redis.yaml", "services-deployment.yaml",
            "ingress.yaml", "hpa.yaml"
        ]
        for fname in expected_files:
            fpath = os.path.join(k8s_dir, fname)
            self.assertTrue(os.path.exists(fpath), f"Missing expected manifest: {fname}")
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
                self.assertIn("apiVersion", content, f"{fname} missing apiVersion")
                self.assertIn("kind", content, f"{fname} missing kind")
                self.assertIn("metadata", content, f"{fname} missing metadata")

        print(f"  [PASS] All {len(yaml_files)} Kubernetes manifests present and syntactically structured")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(MasterPhasesTest)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)
