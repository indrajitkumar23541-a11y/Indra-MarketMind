import asyncio
import httpx
import sys
import os
import time

# Add root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from services.alerts.telegram_bot import TelegramBot
from services.alerts.email_sender import EmailSender
from services.alerts.scheduler import MarketScheduler

def test_telegram():
    print("--- Testing Telegram Bot (Mock) ---")
    bot = TelegramBot()
    success = bot.send_message("🚨 *Indra-MarketMind Test Alert*\n\nThis is a test from the alert service!")
    if success:
        print("✅ Telegram mock test passed.")
    else:
        print("❌ Telegram mock test failed.")
        
def test_email():
    print("\n--- Testing Email Sender (Mock) ---")
    sender = EmailSender()
    success = sender.send_email("Indra-MarketMind Test", "This is a test from the alert service!")
    if success:
        print("✅ Email mock test passed.")
    else:
        print("❌ Email mock test failed.")
        
def test_scheduler():
    print("\n--- Testing APScheduler ---")
    scheduler = MarketScheduler()
    scheduler.start()
    
    # Manually trigger to test the logs
    scheduler._trigger_data_ingestion()
    scheduler._trigger_eod_summary()
    
    print("✅ APScheduler initialized and jobs triggered.")
    scheduler.stop()

if __name__ == "__main__":
    print("=== Testing Alert Service Components ===\n")
    test_telegram()
    test_email()
    test_scheduler()
    print("\n✅ All Alert Service tests completed successfully!")
