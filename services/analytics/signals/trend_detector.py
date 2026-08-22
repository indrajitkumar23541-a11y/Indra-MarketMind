import pandas as pd
import ta
from typing import Dict, Any

def detect_trend(df: pd.DataFrame, close_col: str = 'close') -> Dict[str, Any]:
    """
    Detects the current price trend using moving average crossovers.
    """
    if df.empty or len(df) < 50:
        return {"signal": "NEUTRAL", "reason": "Not enough data"}
        
    # Calculate SMAs
    sma_20 = ta.trend.sma_indicator(df[close_col], window=20)
    sma_50 = ta.trend.sma_indicator(df[close_col], window=50)
    
    if sma_20 is None or sma_50 is None:
        return {"signal": "NEUTRAL", "reason": "Failed to calculate MAs"}
        
    latest_close = df[close_col].iloc[-1]
    latest_sma20 = sma_20.iloc[-1]
    latest_sma50 = sma_50.iloc[-1]
    
    # Simple trend logic
    if latest_sma20 > latest_sma50 and latest_close > latest_sma20:
        signal = "STRONG_BULLISH"
    elif latest_sma20 > latest_sma50:
        signal = "BULLISH"
    elif latest_sma20 < latest_sma50 and latest_close < latest_sma20:
        signal = "STRONG_BEARISH"
    elif latest_sma20 < latest_sma50:
        signal = "BEARISH"
    else:
        signal = "NEUTRAL"
        
    return {
        "signal": signal,
        "sma_20": float(latest_sma20) if not pd.isna(latest_sma20) else None,
        "sma_50": float(latest_sma50) if not pd.isna(latest_sma50) else None,
        "current_price": float(latest_close)
    }
