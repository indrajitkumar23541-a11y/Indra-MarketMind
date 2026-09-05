import logging
from .risk_manager import calculate_position_size
from .brokers.broker_factory import get_active_broker

logger = logging.getLogger(__name__)

def get_current_price(symbol: str) -> float:
    return 150.0

def process_trade_signal(symbol: str, signal_type: str, confidence: float):
    logger.info(f"Received trade signal: {signal_type} for {symbol} (Conf: {confidence})")
    
    if confidence < 0.80:
        return {"status": "ignored", "reason": "Low confidence"}
        
    current_price = get_current_price(symbol)
    
    broker = get_active_broker()
    if not broker:
        # SIGNAL-ONLY MODE
        return {
            "status": "signal_only",
            "symbol": symbol,
            "action": "BUY" if signal_type == "BULLISH" else "SELL",
            "price": current_price
        }

    qty = calculate_position_size(symbol, current_price)
    if qty <= 0:
        return {"status": "ignored", "reason": "Insufficient risk capital"}
    
    return {
        "status": "pending_approval",
        "symbol": symbol,
        "action": "BUY" if signal_type == "BULLISH" else "SELL",
        "qty": qty,
        "price": current_price
    }

def execute_approved_trade(symbol: str, action: str, qty: float):
    broker = get_active_broker()
    if not broker:
        logger.error("Cannot execute trade: No Active Broker.")
        return None
    return broker.place_order(symbol, qty, action=action)
