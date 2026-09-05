from .base import BaseBroker
import os

class ZerodhaAdapter(BaseBroker):
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv("ZERODHA_API_KEY")
        
    def connect(self) -> bool:
        if not self.api_key:
            self.logger.error("ZERODHA_API_KEY missing.")
            return False
        self.is_connected = True
        return True
        
    def get_account_balance(self) -> float:
        self.logger.info("Fetching balance from Zerodha Kite...")
        return 50000.0  # Mock
        
    def place_order(self, symbol: str, qty: float, action: str) -> dict:
        self.logger.info(f"Placing Zerodha Order: {action} {qty} {symbol}")
        return {"status": "success", "broker": "zerodha", "order_id": "zrd_123"}
