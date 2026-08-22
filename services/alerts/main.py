from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging
from contextlib import asynccontextmanager

from .telegram_bot import TelegramBot
from .email_sender import EmailSender
from .scheduler import MarketScheduler

logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger(__name__)

# Initialize components
telegram_bot = TelegramBot()
email_sender = EmailSender()
scheduler = MarketScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Alert Service & Scheduler...")
    scheduler.start()
    yield
    # Shutdown
    logger.info("Shutting down Alert Service & Scheduler...")
    scheduler.stop()

app = FastAPI(title="Indra-MarketMind Alert Service", version="1.0.0", lifespan=lifespan)

class AlertRequest(BaseModel):
    title: str
    message: str
    priority: str = "normal"  # "high", "normal", "low"
    channels: list[str] = ["telegram"] # "telegram", "email"

@app.get("/")
def health_check():
    return {"status": "ok", "service": "alerts", "scheduler_running": scheduler.scheduler.running}

def process_alert(alert: AlertRequest):
    """Background task to actually send the alerts"""
    formatted_message = f"🚨 *{alert.title}*\n\n{alert.message}"
    
    if "telegram" in alert.channels:
        telegram_bot.send_message(formatted_message)
        
    if "email" in alert.channels:
        email_sender.send_email(alert.title, alert.message)

@app.post("/alerts/trigger")
def trigger_alert(alert: AlertRequest, background_tasks: BackgroundTasks):
    """Endpoint to trigger a new alert"""
    background_tasks.add_task(process_alert, alert)
    return {"status": "Alert queued successfully", "channels": alert.channels}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.alerts.main:app", host="0.0.0.0", port=8005, reload=True)
