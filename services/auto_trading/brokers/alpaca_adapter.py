from .base import BaseBroker
import os

class AlpacaAdapter(BaseBroker):
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv("ALPACA_API_KEY")
        
    def connect(self) -> bool:
        if not self.api_key:
            self.logger.error("ALPACA_API_KEY missing.")
            return False
        self.is_connected = True
        return True
        
    def get_account_balance(self) -> float:
        self.logger.info("Fetching balance from Alpaca...")
        return 20000.0  # Mock
        
    def place_order(self, symbol: str, qty: float, action: str) -> dict:
        self.logger.info(f"Placing Alpaca Order: {action} {qty} {symbol}")
        return {"status": "success", "broker": "alpaca", "order_id": "alp_123"}
