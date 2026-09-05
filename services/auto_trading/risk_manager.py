import os
import logging
from .brokers.broker_factory import get_active_broker

logger = logging.getLogger(__name__)

MAX_RISK_PER_TRADE = float(os.getenv("MAX_RISK_PER_TRADE", "0.05"))

def calculate_position_size(symbol: str, current_price: float) -> float:
    """Calculate position size. Returns 0 if Signal-Only mode."""
    try:
        broker = get_active_broker()
        if not broker:
            # Signal-Only Mode
            logger.info("Signal-Only Mode Active. Skipping position sizing.")
            return 0.0
            
        account_balance = broker.get_account_balance()
        if account_balance <= 0:
            logger.warning("Account balance is 0. Rejecting trade.")
            return 0.0
        
        allowed_capital = account_balance * MAX_RISK_PER_TRADE
        shares_to_buy = int(allowed_capital / current_price)
        
        return float(shares_to_buy)
        
    except Exception as e:
        logger.error(f"Risk manager calculation failed: {e}")
        return 0.0
