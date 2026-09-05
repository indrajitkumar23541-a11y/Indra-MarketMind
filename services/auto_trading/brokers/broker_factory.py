import os
from .base import BaseBroker
from .ibkr_adapter import IBKRAdapter
from .zerodha_adapter import ZerodhaAdapter
from .alpaca_adapter import AlpacaAdapter
import logging

logger = logging.getLogger(__name__)

def get_active_broker() -> BaseBroker:
    """Returns the initialized broker adapter based on .env config."""
    broker_name = os.getenv("ACTIVE_BROKER", "").lower()
    
    if broker_name == "ibkr":
        return IBKRAdapter()
    elif broker_name == "zerodha":
        return ZerodhaAdapter()
    elif broker_name == "alpaca":
        return AlpacaAdapter()
    elif broker_name == "":
        logger.info("No ACTIVE_BROKER specified. Defaulting to Signal-Only Mode.")
        return None
    else:
        logger.warning(f"Unknown broker '{broker_name}'. Defaulting to Signal-Only Mode.")
        return None
