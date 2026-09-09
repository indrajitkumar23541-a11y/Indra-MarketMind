import os
import logging
from typing import Dict, Any, Tuple
from .brokers.broker_factory import get_active_broker

logger = logging.getLogger("auto_trading.risk_manager")

MAX_RISK_PER_TRADE = float(os.getenv("MAX_RISK_PER_TRADE", "0.02"))  # 2% default risk
MAX_DRAWDOWN_LIMIT = float(os.getenv("MAX_DRAWDOWN_LIMIT", "0.15"))  # 15% max drawdown guard
DEFAULT_STOP_LOSS_PCT = float(os.getenv("STOP_LOSS_PCT", "0.02"))     # 2% stop loss
DEFAULT_TAKE_PROFIT_PCT = float(os.getenv("TAKE_PROFIT_PCT", "0.04")) # 4% take profit (1:2 R:R)

def calculate_position_size(symbol: str, current_price: float) -> float:
    """Calculate position size based on account balance and risk limits."""
    try:
        if current_price <= 0:
            return 0.0

        broker = get_active_broker()
        if not broker:
            logger.info("No active broker. Skipping position sizing.")
            return 0.0
            
        account_balance = broker.get_account_balance()
        if account_balance <= 0:
            logger.warning("Account balance is 0 or negative. Rejecting trade.")
            return 0.0
        
        # Max capital to deploy for this single position
        allowed_capital = account_balance * MAX_RISK_PER_TRADE
        shares = int(allowed_capital / current_price)
        
        # Minimum of 1 share if allowed_capital is at least 50% of share price
        if shares == 0 and allowed_capital >= (current_price * 0.5):
            shares = 1
            
        return float(shares)
        
    except Exception as e:
        logger.error(f"Risk manager calculation failed: {e}")
        return 0.0

def calculate_brackets(entry_price: float, action: str = "BUY") -> Tuple[float, float]:
    """
    Computes Stop-Loss and Take-Profit price levels based on 1:2 risk/reward ratio.
    """
    if action.upper() == "BUY":
        stop_loss = entry_price * (1.0 - DEFAULT_STOP_LOSS_PCT)
        take_profit = entry_price * (1.0 + DEFAULT_TAKE_PROFIT_PCT)
    else:  # SELL / SHORT
        stop_loss = entry_price * (1.0 + DEFAULT_STOP_LOSS_PCT)
        take_profit = entry_price * (1.0 - DEFAULT_TAKE_PROFIT_PCT)
        
    return round(stop_loss, 2), round(take_profit, 2)

def check_drawdown_limit() -> bool:
    """Returns True if trading is safe, False if max drawdown circuit breaker is triggered."""
    broker = get_active_broker()
    if not broker or not hasattr(broker, "get_portfolio"):
        return True
        
    portfolio = broker.get_portfolio()
    initial = portfolio.get("initial_balance", 100000.0)
    current = portfolio.get("total_portfolio_value", 100000.0)
    drawdown = (initial - current) / initial if initial > 0 else 0.0
    
    if drawdown >= MAX_DRAWDOWN_LIMIT:
        logger.error(f"CIRCUIT BREAKER TRIGGERED: Current Drawdown {drawdown:.1%} exceeds limit {MAX_DRAWDOWN_LIMIT:.1%}. All buying halted!")
        return False
    return True
