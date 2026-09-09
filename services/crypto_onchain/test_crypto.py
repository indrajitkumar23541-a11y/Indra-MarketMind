import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.crypto_onchain.whale_tracker import WhaleTracker
from services.crypto_onchain.metrics_fetcher import get_network_metrics, get_gas_metrics, get_fear_and_greed_index
from services.crypto_onchain.main import app
from fastapi.testclient import TestClient

class TestCryptoOnChain(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.tracker = WhaleTracker(min_usd_threshold=1_000_000.0)

    def test_whale_tracker_flows(self):
        # 1. Test Inflow: Whale deposits 500 BTC to Binance
        inflow_alert = self.tracker.record_transaction(
            asset="BTC",
            amount=500.0,
            usd_price=64000.0,
            from_address="0x1111111111111111111111111111111111111111",
            to_address="0x28c6c06298d514db089934071355e5743bf21d60" # Binance 14
        )
        self.assertIsNotNone(inflow_alert)
        self.assertEqual(inflow_alert["flow_type"], "INFLOW")
        self.assertEqual(inflow_alert["signal"], "BEARISH_EXCHANGE_INFLOW")

        # 2. Test Outflow: Coinbase Prime transfers 10,000 ETH to Cold Storage
        outflow_alert = self.tracker.record_transaction(
            asset="ETH",
            amount=10000.0,
            usd_price=3500.0,
            from_address="0xa9d1e08c7793af07fb801269644f5714e2a377ac", # Coinbase Prime
            to_address="0x2222222222222222222222222222222222222222"
        )
        self.assertIsNotNone(outflow_alert)
        self.assertEqual(outflow_alert["flow_type"], "OUTFLOW")
        self.assertEqual(outflow_alert["signal"], "BULLISH_ACCUMULATION")

        # 3. Test summary calculation
        summary = self.tracker.get_whale_summary()
        self.assertIn("total_tracked_transfers", summary)
        self.assertGreater(summary["total_tracked_volume_usd"], 0)

    def test_metrics_fetcher(self):
        metrics = get_network_metrics()
        self.assertIn("bitcoin", metrics)
        self.assertIn("ethereum", metrics)
        self.assertIn("stablecoins", metrics)
        self.assertIn("fear_and_greed", metrics)
        self.assertGreater(metrics["bitcoin"]["hashrate_eh_s"], 0)

        gas = get_gas_metrics()
        self.assertIn("ethereum_mainnet", gas)
        self.assertGreater(gas["ethereum_mainnet"]["normal_gwei"], 0)

    def test_api_endpoints(self):
        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)

        res_net = self.client.get("/metrics/network")
        self.assertEqual(res_net.status_code, 200)

        res_alerts = self.client.get("/whales/alerts?limit=5")
        self.assertEqual(res_alerts.status_code, 200)
        self.assertGreaterEqual(len(res_alerts.json()["alerts"]), 1)

        res_sum = self.client.get("/whales/summary")
        self.assertEqual(res_sum.status_code, 200)

        res_gas = self.client.get("/gas")
        self.assertEqual(res_gas.status_code, 200)

        # Simulate whale transaction
        sim_payload = {
            "asset": "BTC",
            "amount": 300.0,
            "usd_price": 65000.0,
            "from_address": "0x28c6c06298d514db089934071355e5743bf21d60",
            "to_address": "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ"
        }
        res_sim = self.client.post("/whales/simulate", json=sim_payload)
        self.assertEqual(res_sim.status_code, 200)
        self.assertEqual(res_sim.json()["alert"]["flow_type"], "OUTFLOW")
        print(f"[Phase 12 Test] Whale Alert: {res_sim.json()['alert']['amount']} BTC (${res_sim.json()['alert']['usd_value']:,.2f}) -> {res_sim.json()['alert']['signal']}")

if __name__ == "__main__":
    unittest.main()
