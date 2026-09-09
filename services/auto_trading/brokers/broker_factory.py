import os
import logging
from .base import BaseBroker
from .paper_broker import get_paper_broker
from .ibkr_adapter import IBKRAdapter
from .zerodha_adapter import ZerodhaAdapter
from .alpaca_adapter import AlpacaAdapter

logger = logging.getLogger("auto_trading.broker_factory")

def get_active_broker() -> BaseBroker:
    """Returns the initialized broker adapter based on .env config. Defaults to PaperBroker."""
    broker_name = os.getenv("ACTIVE_BROKER", "paper").strip().lower()
    
    if broker_name == "ibkr":
        return IBKRAdapter()
    elif broker_name == "zerodha":
        return ZerodhaAdapter()
    elif broker_name == "alpaca":
        return AlpacaAdapter()
    elif broker_name in ("paper", "mock", "simulated", ""):
        logger.info("Using PaperBroker with virtual capital for simulated execution.")
        return get_paper_broker()
    elif broker_name == "signal_only":
        logger.info("ACTIVE_BROKER set to signal_only. No execution.")
        return None
    else:
        logger.warning(f"Unknown broker '{broker_name}'. Defaulting to PaperBroker.")
        return get_paper_broker()
