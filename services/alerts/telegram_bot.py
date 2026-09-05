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

    def send_approval_message(self, trade_plan: dict) -> bool:
        """Sends a trade signal to Telegram with Approve/Reject inline buttons."""
        if not self.is_enabled:
            logger.info(f"[MOCK TELEGRAM] Would have sent approval for: {trade_plan}")
            return True
            
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        
        symbol = trade_plan.get('symbol')
        action = trade_plan.get('action')
        qty = trade_plan.get('qty')
        price = trade_plan.get('price')
        
        message = (
            f"🚨 **NEW TRADE SIGNAL** 🚨\n\n"
            f"**Symbol:** {symbol}\n"
            f"**Action:** {action}\n"
            f"**Quantity:** {qty}\n"
            f"**Current Price:** ${price}\n\n"
            f"Do you want to execute this trade on IBKR?"
        )
        
        # Callback data must be < 64 bytes
        approve_data = f"APPROVE_{symbol}_{action}_{qty}"
        reject_data = f"REJECT_{symbol}"
        
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "✅ Approve Trade", "callback_data": approve_data},
                    {"text": "❌ Reject", "callback_data": reject_data}
                ]
            ]
        }
        
        payload = {
            "chat_id": self.chat_id,
            "text": message,
            "parse_mode": "Markdown",
            "reply_markup": reply_markup
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            logger.info(f"Telegram approval message sent successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram approval message: {str(e)}")
            return False
