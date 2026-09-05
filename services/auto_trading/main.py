from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
from .trade_logic import process_trade_signal, execute_approved_trade

app = FastAPI(title="Indra-MarketMind Auto-Execution API")

TELEGRAM_BOT_URL = os.getenv("TELEGRAM_BOT_URL", "http://alert-service:8005/send_approval_message")
TELEGRAM_MSG_URL = os.getenv("TELEGRAM_MSG_URL", "http://alert-service:8005/send_message")

class SignalRequest(BaseModel):
    symbol: str
    signal_type: str  # BULLISH, BEARISH
    confidence: float

class ApprovalRequest(BaseModel):
    symbol: str
    action: str
    qty: float

@app.post("/webhook/signal")
async def handle_signal(request: SignalRequest):
    """Receive signal from analytics engine"""
    trade_plan = process_trade_signal(request.symbol, request.signal_type, request.confidence)
    
    if trade_plan.get("status") == "pending_approval":
        # Forward to alert service to send Telegram message with Inline Buttons
        try:
            requests.post(TELEGRAM_BOT_URL, json=trade_plan)
        except Exception as e:
            print(f"Failed to send to Telegram: {e}")
            
    elif trade_plan.get("status") == "signal_only":
        try:
            msg = f"🔔 *AI SIGNAL (Manual Trade)* 🔔\n\n**Symbol:** {trade_plan.get('symbol')}\n**Action:** {trade_plan.get('action')}\n**Price:** ${trade_plan.get('price')}\n\n_Auto-trading is disabled. Please execute manually on your broker app._"
            requests.post(TELEGRAM_MSG_URL, json={"message": msg})
        except Exception as e:
            print(f"Failed to send signal_only message to Telegram: {e}")
            
    return trade_plan

@app.post("/webhook/telegram_callback")
async def telegram_callback(request: ApprovalRequest):
    """Endpoint called by the Telegram Bot when user clicks 'Approve'"""
    result = execute_approved_trade(request.symbol, request.action, request.qty)
    if result:
        return {"status": "success", "msg": "Order placed via IBKR"}
    raise HTTPException(status_code=500, detail="Failed to place order on IBKR")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
