import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.auto_trading.brokers.paper_broker import PaperBroker
from services.auto_trading.risk_manager import calculate_position_size, calculate_brackets, check_drawdown_limit
from services.auto_trading.trade_logic import process_trade_signal, execute_approved_trade
from services.auto_trading.main import app
from fastapi.testclient import TestClient

class TestAutoTrading(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.broker = PaperBroker(initial_balance=100000.0)

    def test_paper_broker_lifecycle(self):
        # 1. Check initial balance
        self.assertEqual(self.broker.get_account_balance(), 100000.0)

        # 2. Execute BUY order: 10 shares of NVDA @ $120
        buy_res = self.broker.place_order("NVDA", 10, "BUY", price=120.0, stop_loss=115.0, take_profit=130.0)
        self.assertEqual(buy_res["status"], "FILLED")
        self.assertEqual(self.broker.get_account_balance(), 100000.0 - (10 * 120.0))

        # 3. Check portfolio state
        portfolio = self.broker.get_portfolio(current_prices={"NVDA": 130.0})
        self.assertEqual(len(portfolio["positions"]), 1)
        self.assertEqual(portfolio["positions"][0]["qty"], 10)
        # Unrealized PnL: 10 * (130 - 120) = $100
        self.assertEqual(portfolio["unrealized_pnl"], 100.0)

        # 4. Execute SELL order: 5 shares @ $130 (realize $50 profit)
        sell_res = self.broker.place_order("NVDA", 5, "SELL", price=130.0)
        self.assertEqual(sell_res["status"], "FILLED")
        self.assertEqual(self.broker.realized_pnl, 50.0)

        # 5. Check order history
        orders = self.broker.get_orders()
        self.assertEqual(len(orders), 2)

    def test_risk_brackets(self):
        entry_price = 100.0
        sl, tp = calculate_brackets(entry_price, action="BUY")
        self.assertEqual(sl, 98.0)   # 2% stop loss
        self.assertEqual(tp, 104.0)  # 4% take profit (1:2 R:R)

    def test_signal_processing(self):
        # Low confidence -> ignored
        res_low = process_trade_signal("AAPL", "BULLISH", confidence=0.60)
        self.assertEqual(res_low["status"], "ignored")

        # High confidence with auto_execute=True -> executed
        res_high = process_trade_signal("AAPL", "BULLISH", confidence=0.92, auto_execute=True)
        self.assertEqual(res_high["status"], "executed")
        self.assertIn("execution", res_high)

    def test_fastapi_endpoints(self):
        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)

        res_status = self.client.get("/status")
        self.assertEqual(res_status.status_code, 200)
        self.assertIn("active_broker", res_status.json())

        # Place direct manual order
        order_req = {
            "symbol": "MSFT",
            "qty": 5,
            "action": "BUY",
            "price": 400.0,
            "stop_loss": 390.0,
            "take_profit": 420.0
        }
        res_order = self.client.post("/orders/place", json=order_req)
        self.assertEqual(res_order.status_code, 200)
        self.assertEqual(res_order.json()["status"], "FILLED")

        # Query portfolio
        res_port = self.client.get("/portfolio")
        self.assertEqual(res_port.status_code, 200)
        port_data = res_port.json()
        self.assertIn("cash", port_data)
        self.assertIn("positions", port_data)
        print(f"[Phase 10 Test] Portfolio Total Value: ${port_data.get('total_portfolio_value', 0):,.2f}")

if __name__ == "__main__":
    unittest.main()
