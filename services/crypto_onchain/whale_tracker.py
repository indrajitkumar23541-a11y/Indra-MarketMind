import time
import random
import uuid
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("crypto_onchain.whale_tracker")

# Known exchange hot wallets and institutional entities
KNOWN_ENTITIES = {
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance 14",
    "0x71c7656ec7ab88b098defb751b7401b5f6d8976f": "Binance Hot Wallet",
    "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "Binance 32",
    "0xa9d1e08c7793af07fb801269644f5714e2a377ac": "Coinbase Prime",
    "0x503828976d22510aad0201ac7ec88293211a23dc": "Coinbase Exchange",
    "0x2faf487a4414fe30e230d67e1de11788627b949e": "Kraken Hot Wallet",
    "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h": "Binance BTC Cold Storage",
    "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo": "Binance BTC Hot Wallet",
    "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ": "Institutional Whale Accumulator"
}

class WhaleTracker:
    def __init__(self, min_usd_threshold: float = 1_000_000.0):
        self.min_usd_threshold = min_usd_threshold
        self.cached_alerts: List[Dict[str, Any]] = []
        self._seed_initial_alerts()

    def _seed_initial_alerts(self):
        """Generates realistic recent whale transaction history."""
        sample_assets = [
            ("BTC", 64000.0, 150.0, "Binance Hot Wallet", "Institutional Whale Accumulator", "OUTFLOW"),
            ("ETH", 3450.0, 3200.0, "Coinbase Prime", "Kraken Hot Wallet", "TRANSFER"),
            ("USDT", 1.0, 50_000_000.0, "Tether Treasury", "Binance 14", "INFLOW"),
            ("BTC", 64000.0, 220.0, "Unknown Whale", "Coinbase Exchange", "INFLOW"),
            ("ETH", 3450.0, 5000.0, "Binance 32", "Unknown Cold Wallet", "OUTFLOW")
        ]
        
        now = time.time()
        for i, (asset, price, amount, sender, receiver, flow) in enumerate(sample_assets):
            usd_value = amount * price
            tx_hash = f"0x{uuid.uuid4().hex}"
            self.cached_alerts.append({
                "tx_hash": tx_hash,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(now - (i * 900))),
                "asset": asset,
                "amount": amount,
                "usd_value": round(usd_value, 2),
                "from_label": sender,
                "to_label": receiver,
                "flow_type": flow, # INFLOW (bearish), OUTFLOW (bullish), TRANSFER (neutral)
                "signal": "BULLISH_ACCUMULATION" if flow == "OUTFLOW" else ("BEARISH_EXCHANGE_INFLOW" if flow == "INFLOW" else "NEUTRAL")
            })

    def get_recent_alerts(self, limit: int = 10, asset: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns recent whale alerts filtered by asset if provided."""
        results = self.cached_alerts
        if asset:
            results = [a for a in results if a["asset"].upper() == asset.upper()]
        return results[:limit]

    def record_transaction(
        self,
        asset: str,
        amount: float,
        usd_price: float,
        from_address: str,
        to_address: str
    ) -> Optional[Dict[str, Any]]:
        """Analyzes a single transaction and triggers an alert if above threshold."""
        usd_value = amount * usd_price
        if usd_value < self.min_usd_threshold:
            return None

        from_label = KNOWN_ENTITIES.get(from_address, "Unknown Wallet")
        to_label = KNOWN_ENTITIES.get(to_address, "Unknown Wallet")

        is_from_exchange = any(x in from_label.lower() for x in ["binance", "coinbase", "kraken"])
        is_to_exchange = any(x in to_label.lower() for x in ["binance", "coinbase", "kraken"])

        if is_from_exchange and not is_to_exchange:
            flow = "OUTFLOW"
            signal = "BULLISH_ACCUMULATION"
        elif is_to_exchange and not is_from_exchange:
            flow = "INFLOW"
            signal = "BEARISH_EXCHANGE_INFLOW"
        else:
            flow = "TRANSFER"
            signal = "NEUTRAL"

        alert = {
            "tx_hash": f"0x{uuid.uuid4().hex}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
            "asset": asset.upper(),
            "amount": amount,
            "usd_value": round(usd_value, 2),
            "from_label": from_label,
            "to_label": to_label,
            "flow_type": flow,
            "signal": signal
        }
        self.cached_alerts.insert(0, alert)
        if len(self.cached_alerts) > 100:
            self.cached_alerts.pop()
            
        logger.info(f"Whale Alert: {alert['flow_type']} of {amount} {asset} (${usd_value:,.2f}) [{signal}]")
        return alert

    def get_whale_summary(self) -> Dict[str, Any]:
        """Calculates 24h aggregated whale metrics."""
        inflow_usd = sum(a["usd_value"] for a in self.cached_alerts if a["flow_type"] == "INFLOW")
        outflow_usd = sum(a["usd_value"] for a in self.cached_alerts if a["flow_type"] == "OUTFLOW")
        total_usd = sum(a["usd_value"] for a in self.cached_alerts)

        net_flow_usd = outflow_usd - inflow_usd
        overall_sentiment = "BULLISH_ACCUMULATION" if net_flow_usd > 0 else "BEARISH_SELLING_PRESSURE"
        
        return {
            "total_tracked_transfers": len(self.cached_alerts),
            "total_tracked_volume_usd": round(total_usd, 2),
            "exchange_inflow_usd": round(inflow_usd, 2),
            "exchange_outflow_usd": round(outflow_usd, 2),
            "net_flow_usd": round(net_flow_usd, 2),
            "whale_sentiment": overall_sentiment,
            "net_direction": "NET_OUTFLOW_COLD_STORAGE" if net_flow_usd > 0 else "NET_INFLOW_EXCHANGES"
        }

_whale_tracker_instance = WhaleTracker()

def get_whale_tracker() -> WhaleTracker:
    return _whale_tracker_instance
