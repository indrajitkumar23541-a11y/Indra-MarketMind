import os
import logging
from typing import Dict, Any, Optional
from .risk_manager import calculate_position_size, calculate_brackets, check_drawdown_limit
from .brokers.broker_factory import get_active_broker

logger = logging.getLogger("auto_trading.trade_logic")

AUTO_EXECUTE = os.getenv("AUTO_EXECUTE", "false").lower() in ("true", "1", "yes")

def get_current_price(symbol: str) -> float:
    """Mock or dynamic price lookup. Defaults to realistic equity prices."""
    # In live system, yfinance or AlphaVantage or cached redis ticker price can be used
    mock_prices = {
        "AAPL": 182.50,
        "NVDA": 128.40,
        "MSFT": 448.20,
        "TSLA": 254.10,
        "BTCUSDT": 64200.0,
        "ETHUSDT": 3450.0,
        "SPY": 545.80,
    }
    return mock_prices.get(symbol.upper(), 150.0)

def process_trade_signal(
    symbol: str,
    signal_type: str,
    confidence: float,
    auto_execute: Optional[bool] = None
) -> Dict[str, Any]:
    """Processes an incoming analytics signal, runs risk filters, and either executes or queues approval."""
    symbol = symbol.upper()
    signal_type = signal_type.upper()
    logger.info(f"Processing signal: {signal_type} for {symbol} (Confidence: {confidence:.2f})")
    
    if confidence < 0.75:
        return {
            "status": "ignored",
            "reason": f"Signal confidence {confidence:.2f} is below minimum threshold 0.75",
            "symbol": symbol
        }
        
    current_price = get_current_price(symbol)
    broker = get_active_broker()
    
    if not broker:
        # Signal-only mode
        return {
            "status": "signal_only",
            "symbol": symbol,
            "action": "BUY" if "BULL" in signal_type else "SELL",
            "price": current_price,
            "confidence": confidence
        }

    # Check drawdown circuit breaker
    if not check_drawdown_limit() and "BULL" in signal_type:
        return {
            "status": "rejected",
            "reason": "Max portfolio drawdown limit reached. New BUY trades are temporarily disabled.",
            "symbol": symbol
        }

    action = "BUY" if "BULL" in signal_type else "SELL"
    
    # Calculate position size
    qty = calculate_position_size(symbol, current_price)
    if qty <= 0 and action == "BUY":
        return {
            "status": "ignored",
            "reason": "Risk manager allocated 0 shares (insufficient risk capital).",
            "symbol": symbol
        }
    elif qty <= 0 and action == "SELL":
        qty = 10.0  # Default sell lot if closing

    # Compute risk brackets
    stop_loss, take_profit = calculate_brackets(current_price, action)
    
    # Decide between immediate auto-execution vs human approval
    should_auto_execute = auto_execute if auto_execute is not None else AUTO_EXECUTE
    
    trade_plan = {
        "symbol": symbol,
        "action": action,
        "qty": qty,
        "price": current_price,
        "stop_loss": stop_loss,
        "take_profit": take_profit,
        "confidence": confidence,
        "risk_reward_ratio": "1:2"
    }

    if should_auto_execute:
        logger.info(f"Auto-execution active: Executing {action} {qty} {symbol} immediately...")
        exec_result = execute_approved_trade(
            symbol=symbol,
            action=action,
            qty=qty,
            price=current_price,
            stop_loss=stop_loss,
            take_profit=take_profit
        )
        trade_plan["status"] = "executed"
        trade_plan["execution"] = exec_result
        return trade_plan

    trade_plan["status"] = "pending_approval"
    return trade_plan

def execute_approved_trade(
    symbol: str,
    action: str,
    qty: float,
    price: Optional[float] = None,
    stop_loss: Optional[float] = None,
    take_profit: Optional[float] = None
) -> Dict[str, Any]:
    """Executes an approved trade directly through the active broker."""
    broker = get_active_broker()
    if not broker:
        logger.error("Cannot execute trade: No Active Broker.")
        return {"status": "error", "message": "No active broker configured"}
        
    try:
        if hasattr(broker, "place_order"):
            # Check if broker supports extra kwargs (like PaperBroker)
            import inspect
            sig = inspect.signature(broker.place_order)
            if "stop_loss" in sig.parameters:
                return broker.place_order(symbol, qty, action=action, price=price, stop_loss=stop_loss, take_profit=take_profit)
            else:
                return broker.place_order(symbol, qty, action=action)
        return {"status": "error", "message": "Broker missing place_order method"}
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        return {"status": "error", "message": str(e)}
