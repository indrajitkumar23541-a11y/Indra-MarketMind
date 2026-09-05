from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging
from contextlib import asynccontextmanager

from .telegram_bot import TelegramBot
from .email_sender import EmailSender
from .scheduler import MarketScheduler

logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger(__name__)

telegram_bot = TelegramBot()
email_sender = EmailSender()
scheduler = MarketScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Alert Service & Scheduler...")
    scheduler.start()
    yield
    logger.info("Shutting down Alert Service & Scheduler...")
    scheduler.stop()

app = FastAPI(title="Indra-MarketMind Alert Service", version="1.0.0", lifespan=lifespan)

class AlertRequest(BaseModel):
    title: str
    message: str
    priority: str = "normal"
    channels: list[str] = ["telegram"]

class TradePlanRequest(BaseModel):
    symbol: str
    action: str
    qty: float = 0
    price: float = 0
    status: str = "pending_approval"

class MessageRequest(BaseModel):
    message: str

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "alerts",
        "scheduler_running": scheduler.scheduler.running,
        "telegram_enabled": telegram_bot.is_enabled
    }

def process_alert(alert: AlertRequest):
    """Background task to send alerts."""
    formatted_message = f"🚨 *{alert.title}*\n\n{alert.message}"
    if "telegram" in alert.channels:
        telegram_bot.send_message(formatted_message)
    if "email" in alert.channels:
        email_sender.send_email(alert.title, alert.message)

@app.post("/alerts/trigger")
def trigger_alert(alert: AlertRequest, background_tasks: BackgroundTasks):
    """Trigger a new alert to configured channels."""
    background_tasks.add_task(process_alert, alert)
    return {"status": "Alert queued successfully", "channels": alert.channels}

@app.post("/send_approval_message")
def send_approval_message(trade_plan: TradePlanRequest, background_tasks: BackgroundTasks):
    """Called by auto-trading service to send Approve/Reject buttons to Telegram."""
    background_tasks.add_task(
        telegram_bot.send_approval_message,
        trade_plan.dict()
    )
    return {"status": "Approval message queued"}

@app.post("/send_message")
def send_message(req: MessageRequest, background_tasks: BackgroundTasks):
    """Send a plain text message to Telegram."""
    background_tasks.add_task(telegram_bot.send_message, req.message)
    return {"status": "Message queued"}

@app.post("/webhook/telegram")
async def telegram_webhook(update: dict):
    """Handle Telegram callback queries (Approve/Reject button clicks)."""
    import requests as req_lib
    import os
    callback = update.get("callback_query")
    if not callback:
        return {"status": "ignored"}

    data = callback.get("data", "")
    chat_id = callback["from"]["id"]
    AUTO_TRADING_URL = os.getenv("AUTO_TRADING_URL", "http://localhost:8007")

    if data.startswith("APPROVE_"):
        parts = data.split("_")  # APPROVE_AAPL_BUY_10
        symbol = parts[1] if len(parts) > 1 else ""
        action = parts[2] if len(parts) > 2 else "BUY"
        qty = float(parts[3]) if len(parts) > 3 else 1.0
        try:
            req_lib.post(
                f"{AUTO_TRADING_URL}/webhook/telegram_callback",
                json={"symbol": symbol, "action": action, "qty": qty},
                timeout=10
            )
            telegram_bot.send_message(f"✅ Trade APPROVED: {action} {qty} {symbol}")
        except Exception as e:
            logger.error(f"Failed to forward approval to auto-trading: {e}")
            telegram_bot.send_message(f"❌ Failed to execute trade: {e}")
    elif data.startswith("REJECT_"):
        parts = data.split("_")
        symbol = parts[1] if len(parts) > 1 else ""
        telegram_bot.send_message(f"❌ Trade REJECTED for {symbol}")

    return {"status": "processed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.alerts.main:app", host="0.0.0.0", port=8005, reload=True)
