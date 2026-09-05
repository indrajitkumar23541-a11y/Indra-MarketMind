from abc import ABC, abstractmethod
import logging

class BaseBroker(ABC):
    """Abstract Base Class for all Broker Integrations"""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.is_connected = False
        
    @abstractmethod
    def connect(self) -> bool:
        """Authenticate and connect to the broker."""
        pass
        
    @abstractmethod
    def get_account_balance(self) -> float:
        """Return the available trading funds."""
        pass
        
    @abstractmethod
    def place_order(self, symbol: str, qty: float, action: str) -> dict:
        """Place an order. Returns a dictionary with order details or None on failure."""
        pass
