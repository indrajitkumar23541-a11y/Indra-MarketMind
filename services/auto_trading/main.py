from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import requests
import os
import logging
from .trade_logic import process_trade_signal, execute_approved_trade, get_current_price
from .brokers.broker_factory import get_active_broker
from .risk_manager import MAX_RISK_PER_TRADE, MAX_DRAWDOWN_LIMIT

logger = logging.getLogger("auto_trading.api")

app = FastAPI(
    title="Indra-MarketMind Auto-Execution & Paper Trading API",
    description="Automated and Semi-Automated Trade Execution, Paper Trading Engine, and Risk Management",
    version="1.0.0"
)

TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://alert-service:8005/send_approval_message")
TELEGRAM_MSG_URL = os.getenv("TELEGRAM_MSG_URL", "http://alert-service:8005/send_message")

class SignalRequest(BaseModel):
    symbol: str = Field(..., example="NVDA")
    signal_type: str = Field(..., example="BULLISH")  # BULLISH, BEARISH
    confidence: float = Field(..., example=0.88)
    auto_execute: Optional[bool] = Field(default=None, description="Override global auto-execution flag")

class ApprovalRequest(BaseModel):
    symbol: str
    action: str
    qty: float
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class ManualOrderRequest(BaseModel):
    symbol: str
    qty: float
    action: str  # BUY or SELL
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

@app.post("/webhook/signal")
async def handle_signal(request: SignalRequest):
    """Receive signal from analytics engine, evaluate risk rules, and process trade."""
    trade_plan = process_trade_signal(
        symbol=request.symbol,
        signal_type=request.signal_type,
        confidence=request.confidence,
        auto_execute=request.auto_execute
    )
    
    if trade_plan.get("status") == "pending_approval":
        # Forward to alert service to send Telegram message with Inline Buttons
        try:
            requests.post(TELEGRAM_BOT_URL, json=trade_plan, timeout=2)
        except Exception as e:
            logger.warning(f"Telegram notification skipped/failed: {e}")
            
    elif trade_plan.get("status") == "signal_only":
        try:
            msg = (
                f"🔔 *AI SIGNAL (Manual Trade)* 🔔\n\n"
                f"**Symbol:** {trade_plan.get('symbol')}\n"
                f"**Action:** {trade_plan.get('action')}\n"
                f"**Price:** ${trade_plan.get('price')}\n\n"
                f"_Auto-trading is disabled. Please execute manually on your broker app._"
            )
            requests.post(TELEGRAM_MSG_URL, json={"message": msg}, timeout=2)
        except Exception as e:
            logger.warning(f"Telegram signal notification skipped/failed: {e}")
            
    return trade_plan

@app.post("/webhook/telegram_callback")
async def telegram_callback(request: ApprovalRequest):
    """Endpoint called by the Telegram Bot or UI when user clicks 'Approve'"""
    result = execute_approved_trade(
        symbol=request.symbol,
        action=request.action,
        qty=request.qty,
        price=request.price,
        stop_loss=request.stop_loss,
        take_profit=request.take_profit
    )
    if result and result.get("status") != "rejected" and result.get("status") != "error":
        return {"status": "success", "order": result}
    raise HTTPException(status_code=400, detail=result or "Failed to place order")

@app.post("/orders/place")
async def place_manual_order(request: ManualOrderRequest):
    """Place a direct trade order via the active broker."""
    price = request.price or get_current_price(request.symbol)
    result = execute_approved_trade(
        symbol=request.symbol,
        action=request.action,
        qty=request.qty,
        price=price,
        stop_loss=request.stop_loss,
        take_profit=request.take_profit
    )
    if result and result.get("status") == "rejected":
        raise HTTPException(status_code=400, detail=result.get("reason", "Order rejected"))
    return result

@app.get("/portfolio")
async def get_portfolio_endpoint():
    """Retrieve active broker's current portfolio status, cash, holdings, and PnL."""
    broker = get_active_broker()
    if not broker:
        return {"status": "error", "message": "No active broker"}
    if hasattr(broker, "get_portfolio"):
        return broker.get_portfolio()
    balance = broker.get_account_balance()
    return {"cash": balance, "type": broker.__class__.__name__}

@app.get("/orders")
async def get_orders_endpoint():
    """Retrieve history of placed orders."""
    broker = get_active_broker()
    if hasattr(broker, "get_orders"):
        return {"orders": broker.get_orders()}
    return {"orders": []}

@app.get("/status")
async def status_endpoint():
    broker = get_active_broker()
    return {
        "service": "auto_trading",
        "active_broker": broker.__class__.__name__ if broker else "None",
        "auto_execute": os.getenv("AUTO_EXECUTE", "false"),
        "max_risk_per_trade": MAX_RISK_PER_TRADE,
        "max_drawdown_limit": MAX_DRAWDOWN_LIMIT
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auto_trading"}
