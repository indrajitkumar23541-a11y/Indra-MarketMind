import uuid
import time
import logging
from typing import Dict, Any, List
from .base import BaseBroker

logger = logging.getLogger("auto_trading.paper_broker")

class PaperBroker(BaseBroker):
    """
    Simulated Paper Broker with full order book, portfolio holdings,
    cash management, and PnL calculation.
    """
    def __init__(self, initial_balance: float = 100000.0):
        super().__init__()
        self.initial_balance = initial_balance
        self.cash = initial_balance
        # holdings: {symbol: {"qty": float, "avg_cost": float}}
        self.holdings: Dict[str, Dict[str, float]] = {}
        # orders: list of executed and pending orders
        self.orders: List[Dict[str, Any]] = []
        self.realized_pnl: float = 0.0
        self.is_connected = True
        logger.info(f"Initialized PaperBroker with ${initial_balance:,.2f} virtual capital.")

    def connect(self) -> bool:
        self.is_connected = True
        return True

    def get_account_balance(self) -> float:
        return float(self.cash)

    def get_portfolio(self, current_prices: Dict[str, float] = None) -> Dict[str, Any]:
        """Calculates current portfolio value, cash, holdings, and PnL."""
        current_prices = current_prices or {}
        holdings_value = 0.0
        unrealized_pnl = 0.0
        holdings_detail = []

        for symbol, pos in self.holdings.items():
            qty = pos["qty"]
            avg_cost = pos["avg_cost"]
            if qty > 0:
                cur_price = current_prices.get(symbol, avg_cost)
                market_val = qty * cur_price
                cost_basis = qty * avg_cost
                pos_unrealized = market_val - cost_basis
                
                holdings_value += market_val
                unrealized_pnl += pos_unrealized
                
                holdings_detail.append({
                    "symbol": symbol,
                    "qty": qty,
                    "avg_cost": round(avg_cost, 2),
                    "current_price": round(cur_price, 2),
                    "market_value": round(market_val, 2),
                    "unrealized_pnl": round(pos_unrealized, 2),
                    "pnl_pct": round((pos_unrealized / cost_basis) * 100, 2) if cost_basis else 0.0
                })

        total_value = self.cash + holdings_value
        return {
            "cash": round(self.cash, 2),
            "holdings_value": round(holdings_value, 2),
            "total_portfolio_value": round(total_value, 2),
            "initial_balance": self.initial_balance,
            "realized_pnl": round(self.realized_pnl, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "total_pnl": round(self.realized_pnl + unrealized_pnl, 2),
            "total_return_pct": round(((total_value - self.initial_balance) / self.initial_balance) * 100, 2),
            "positions": holdings_detail
        }

    def place_order(
        self,
        symbol: str,
        qty: float,
        action: str,
        price: float = None,
        stop_loss: float = None,
        take_profit: float = None
    ) -> Dict[str, Any]:
        """
        Executes a paper order immediately against simulated market prices.
        """
        symbol = symbol.upper()
        action = action.upper()
        qty = float(qty)
        if qty <= 0:
            return {"status": "rejected", "reason": "Quantity must be > 0"}

        # Default simulated price if not provided
        exec_price = float(price) if price and price > 0 else 150.0
        total_cost = qty * exec_price

        order_id = f"paper-{uuid.uuid4().hex[:8]}"
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        if action == "BUY":
            if self.cash < total_cost:
                logger.warning(f"Paper order rejected: Insufficient funds (Need ${total_cost:,.2f}, have ${self.cash:,.2f})")
                return {
                    "status": "rejected",
                    "reason": f"Insufficient cash (${self.cash:,.2f} available, required ${total_cost:,.2f})",
                    "order_id": order_id
                }
            
            # Deduct cash
            self.cash -= total_cost

            # Update holding
            existing = self.holdings.get(symbol, {"qty": 0.0, "avg_cost": 0.0})
            new_qty = existing["qty"] + qty
            new_avg_cost = ((existing["qty"] * existing["avg_cost"]) + total_cost) / new_qty
            self.holdings[symbol] = {"qty": new_qty, "avg_cost": new_avg_cost}

        elif action == "SELL":
            existing = self.holdings.get(symbol, {"qty": 0.0, "avg_cost": 0.0})
            if existing["qty"] < qty:
                return {
                    "status": "rejected",
                    "reason": f"Insufficient shares to sell ({existing['qty']} available, attempted {qty})",
                    "order_id": order_id
                }

            # Credit cash
            self.cash += total_cost
            
            # Calculate realized PnL
            cost_basis = qty * existing["avg_cost"]
            trade_pnl = total_cost - cost_basis
            self.realized_pnl += trade_pnl

            # Update remaining holding
            rem_qty = existing["qty"] - qty
            if rem_qty <= 0:
                self.holdings.pop(symbol, None)
            else:
                self.holdings[symbol] = {"qty": rem_qty, "avg_cost": existing["avg_cost"]}
        else:
            return {"status": "rejected", "reason": f"Invalid action: {action}"}

        order_record = {
            "order_id": order_id,
            "timestamp": timestamp,
            "symbol": symbol,
            "action": action,
            "qty": qty,
            "price": round(exec_price, 2),
            "total_amount": round(total_cost, 2),
            "stop_loss": round(stop_loss, 2) if stop_loss else None,
            "take_profit": round(take_profit, 2) if take_profit else None,
            "status": "FILLED"
        }
        self.orders.append(order_record)
        logger.info(f"Executed Paper Order: {action} {qty} {symbol} @ ${exec_price:.2f}")
        return order_record

    def get_orders(self) -> List[Dict[str, Any]]:
        return list(reversed(self.orders))

# Singleton instance for consistent paper account state across calls
_paper_broker_singleton = PaperBroker()

def get_paper_broker() -> PaperBroker:
    return _paper_broker_singleton
