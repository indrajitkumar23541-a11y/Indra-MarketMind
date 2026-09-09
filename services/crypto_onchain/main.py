from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .whale_tracker import get_whale_tracker
from .metrics_fetcher import get_network_metrics, get_gas_metrics, get_fear_and_greed_index

app = FastAPI(
    title="Indra-MarketMind Crypto On-Chain Metrics API",
    description="Real-Time Blockchain Intelligence, Whale Inflow/Outflow Tracker, Network Fundamentals, and Gas Monitor",
    version="1.0.0"
)

class WhaleSimulateRequest(BaseModel):
    asset: str = Field(default="BTC", example="BTC")
    amount: float = Field(default=250.0, example=250.0)
    usd_price: float = Field(default=64000.0, example=64000.0)
    from_address: str = Field(default="0x28c6c06298d514db089934071355e5743bf21d60", example="0x28c6c06298d514db089934071355e5743bf21d60")
    to_address: str = Field(default="1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ", example="1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ")

@app.get("/metrics/network")
async def network_metrics_endpoint():
    """Returns macroeconomic on-chain metrics for major blockchain networks."""
    return get_network_metrics()

@app.get("/whales/alerts")
async def whale_alerts_endpoint(
    limit: int = Query(default=10, ge=1, le=100, description="Max number of alerts"),
    asset: Optional[str] = Query(default=None, description="Filter by asset symbol (BTC, ETH, USDT)")
):
    """Retrieve high-value on-chain transactions and accumulation/distribution signals."""
    tracker = get_whale_tracker()
    return {
        "count": limit,
        "asset_filter": asset,
        "alerts": tracker.get_recent_alerts(limit=limit, asset=asset)
    }

@app.get("/whales/summary")
async def whale_summary_endpoint():
    """Retrieve aggregate 24h whale flow direction and sentiment."""
    tracker = get_whale_tracker()
    return tracker.get_whale_summary()

@app.post("/whales/simulate")
async def simulate_whale_transaction(request: WhaleSimulateRequest):
    """Simulate or ingest a high-value on-chain transaction for testing and automated triggers."""
    tracker = get_whale_tracker()
    alert = tracker.record_transaction(
        asset=request.asset,
        amount=request.amount,
        usd_price=request.usd_price,
        from_address=request.from_address,
        to_address=request.to_address
    )
    if not alert:
        raise HTTPException(status_code=400, detail="Transaction value below minimum whale threshold ($1,000,000)")
    return {"status": "success", "alert": alert}

@app.get("/gas")
async def gas_endpoint():
    """Retrieve current gas price estimates for Ethereum Mainnet and Layer 2s."""
    return get_gas_metrics()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "crypto_onchain"}
