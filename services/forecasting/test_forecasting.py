import sys
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from services.forecasting.prophet_forecaster import ProphetForecaster
from services.forecasting.lstm_forecaster import LSTMForecaster
from services.forecasting.hybrid_forecaster import HybridForecaster

def generate_mock_data(days=365):
    """Generates 1 year of mock price and sentiment data for testing."""
    dates = [datetime.now() - timedelta(days=i) for i in range(days)]
    dates.reverse()
    
    # Generate random walk with drift (upward trend) and seasonality
    price = 100
    close_prices = []
    
    for i in range(days):
        # Trend + Seasonality + Noise
        trend = i * 0.05
        seasonality = 5 * np.sin(i / 10.0) 
        noise = np.random.normal(0, 2)
        
        close = price + trend + seasonality + noise
        close_prices.append(close)
        
    df = pd.DataFrame({
        'date': dates,
        'open': [p - np.random.normal(0, 1) for p in close_prices],
        'high': [p + abs(np.random.normal(0, 2)) for p in close_prices],
        'low': [p - abs(np.random.normal(0, 2)) for p in close_prices],
        'close': close_prices,
        'volume': [int(1000 + np.random.normal(0, 500)) for _ in range(days)],
        'ensemble_score': [max(-1.0, min(1.0, np.random.normal(0, 0.5))) for _ in range(days)]
    })
    
    # Simple fix for negative volume
    df['volume'] = df['volume'].apply(lambda x: x if x > 0 else 100)
    
    return df

def test_forecasting():
    print("=== Testing ML Forecasting Engine ===")
    df = generate_mock_data(365)
    
    print("\n--- 1. Prophet Model ---")
    prophet = ProphetForecaster()
    prophet.train(df, target_col='close')
    prophet_forecast = prophet.predict(days=7)
    print("Prophet Forecast (next 7 days):")
    print(prophet_forecast.tail(7))
    
    mae = prophet.evaluate(df)
    print(f"Prophet MAE: {mae['mae']:.2f}")
    
    print("\n--- 2. LSTM Model (Residuals) ---")
    lstm = LSTMForecaster(sequence_length=14, epochs=10) # fewer epochs for fast test
    
    # Let's train LSTM on raw close price for a quick test 
    lstm.train(df, feature_cols=['open', 'high', 'low', 'volume', 'ensemble_score'], target_col='close')
    next_pred = lstm.predict_next(df)
    print(f"LSTM Next Step Prediction: {next_pred:.2f}")
    
    print("\n--- 3. Hybrid Model ---")
    prophet_h = ProphetForecaster()
    lstm_h = LSTMForecaster(sequence_length=14, epochs=10)
    hybrid = HybridForecaster(prophet_h, lstm_h)
    
    hybrid.train(df, feature_cols=['open', 'high', 'low', 'volume', 'ensemble_score'])
    hybrid_forecast = hybrid.predict(df, days=7)
    
    print("Hybrid Forecast Results:")
    for pt in hybrid_forecast:
        print(f"{pt.date}: {pt.predicted_price} (Bound: {pt.lower_bound} - {pt.upper_bound})")
        
    print("\n✅ All forecasting tests completed successfully!")

if __name__ == "__main__":
    test_forecasting()
