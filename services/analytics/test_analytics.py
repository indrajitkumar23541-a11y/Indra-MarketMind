import sys
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from services.analytics.correlation.pearson_correlation import calculate_pearson_correlation
from services.analytics.correlation.granger_causality import calculate_granger_causality
from services.analytics.correlation.rolling_correlation import calculate_rolling_correlation
from services.analytics.signals.fear_greed_index import calculate_fear_greed_index
from services.analytics.signals.insider_signal import analyze_insider_activity
from services.analytics.signals.sector_rotation import analyze_sector_rotation
from services.analytics.signals.trend_detector import detect_trend
from services.analytics.signals.volatility_analyzer import analyze_volatility
from services.analytics.technical.indicators import calculate_all_indicators
from services.analytics.technical.pattern_detector import detect_candlestick_patterns

def generate_mock_data(days=100):
    """Generates mock price and sentiment data for testing."""
    dates = [datetime.now() - timedelta(days=i) for i in range(days)]
    dates.reverse()
    
    # Generate random walk for price
    price = 100
    close_prices = []
    high_prices = []
    low_prices = []
    open_prices = []
    
    for i in range(days):
        change = np.random.normal(0, 2)
        open_p = price + np.random.normal(0, 0.5)
        high_p = max(open_p, price + change) + abs(np.random.normal(0, 1))
        low_p = min(open_p, price + change) - abs(np.random.normal(0, 1))
        
        close_prices.append(price + change)
        high_prices.append(high_p)
        low_prices.append(low_p)
        open_prices.append(open_p)
        price += change
        
    # Generate sentiment (slightly correlated to next day's price change)
    sentiments = []
    for i in range(days):
        if i < days - 1:
            next_day_change = close_prices[i+1] - close_prices[i]
            # Add some noise
            sentiment = (next_day_change / 5) + np.random.normal(0, 0.2)
            # bound between -1 and 1
            sentiment = max(-1.0, min(1.0, sentiment))
        else:
            sentiment = np.random.normal(0, 0.5)
        sentiments.append(sentiment)
        
    df = pd.DataFrame({
        'date': dates,
        'open': open_prices,
        'high': high_prices,
        'low': low_prices,
        'close': close_prices,
        'ensemble_score': sentiments
    })
    return df

def test_all():
    print("=== Testing Analytics Engine ===")
    df = generate_mock_data(100)
    
    print("\n--- Correlation Engine ---")
    pearson = calculate_pearson_correlation(df)
    print("Pearson Correlation:", pearson)
    
    granger = calculate_granger_causality(df, max_lag=3)
    print("Granger Causality:", {k: v for k, v in granger.items() if k != 'results'} )
    
    rolling = calculate_rolling_correlation(df)
    print("Rolling Correlation (Window 7):", {k:v for k,v in rolling.get('window_7', {}).items() if k != 'historical_values'})
    
    print("\n--- Signal Engine ---")
    factors = {
        "market_momentum": 80.0,
        "sentiment_score": 60.0,
        "volatility_proxy": 30.0,
        "safe_haven_demand": 40.0,
        "put_call_ratio_proxy": 50.0,
        "social_media_volume": 70.0,
        "sec_insider_activity": 65.0
    }
    fgi = calculate_fear_greed_index(factors)
    print("Fear & Greed Index:", fgi.get('score'), "->", fgi.get('label'))
    
    trend = detect_trend(df)
    print("Trend Detector:", trend)
    
    volatility = analyze_volatility(df)
    print("Volatility Analyzer:", volatility)
    
    # Mock insider data
    insider_df = pd.DataFrame({
        'officer_title': ['CEO', 'CFO', 'COO'],
        'transaction_type': ['BUY', 'BUY', 'BUY'],
        'value': [1000000, 500000, 750000],
        'date': ['2023-10-01', '2023-10-02', '2023-10-03']
    })
    insider = analyze_insider_activity(insider_df)
    print("Insider Signal:", insider.get('signal'))
    
    # Mock sector data
    sector_df = pd.DataFrame({
        'sector': ['Technology', 'Healthcare', 'Energy'],
        'sentiment_score': [0.8, 0.4, -0.6]
    })
    rotation = analyze_sector_rotation(sector_df)
    print("Sector Rotation (Top):", rotation.get('top_sector'))
    
    print("\n--- Technical Indicators ---")
    indicators = calculate_all_indicators(df)
    print("Indicators:", {k: round(v, 2) for k, v in indicators.items() if isinstance(v, float)})
    
    patterns = detect_candlestick_patterns(df)
    print("Candlestick Patterns:", patterns)
    
    print("\n✅ All tests completed without crashing!")

if __name__ == "__main__":
    test_all()
