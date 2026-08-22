import os
import requests
import logging

logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.is_enabled = bool(self.token and self.chat_id)
        
        if not self.is_enabled:
            logger.warning("Telegram Bot disabled. TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in environment.")
            
    def send_message(self, message: str) -> bool:
        """Sends a message to the configured Telegram chat."""
        if not self.is_enabled:
            logger.info(f"[MOCK TELEGRAM] Would have sent: {message}")
            return True
            
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            logger.info(f"Telegram message sent successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {str(e)}")
            return False
