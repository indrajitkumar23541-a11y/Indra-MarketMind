import pandas as pd
from typing import Dict, Any, List

def detect_candlestick_patterns(df: pd.DataFrame, open_col: str = 'open', high_col: str = 'high', low_col: str = 'low', close_col: str = 'close') -> Dict[str, Any]:
    """
    Detects basic candlestick patterns (Doji, Engulfing) on the latest candles.
    
    Args:
        df: DataFrame containing OHLC data.
        
    Returns:
        Dict containing detected patterns.
    """
    if df.empty or len(df) < 2:
        return {"error": "Not enough data"}
        
    # Get last two candles
    current = df.iloc[-1]
    prev = df.iloc[-2]
    
    patterns = []
    
    # 1. Doji (Open and Close are very close)
    body_size = abs(current[close_col] - current[open_col])
    candle_range = current[high_col] - current[low_col]
    
    if candle_range > 0 and (body_size / candle_range) < 0.1:
        patterns.append("DOJI")
        
    # 2. Bullish Engulfing
    prev_is_red = prev[close_col] < prev[open_col]
    curr_is_green = current[close_col] > current[open_col]
    
    if prev_is_red and curr_is_green:
        if current[open_col] <= prev[close_col] and current[close_col] >= prev[open_col]:
            patterns.append("BULLISH_ENGULFING")
            
    # 3. Bearish Engulfing
    prev_is_green = prev[close_col] > prev[open_col]
    curr_is_red = current[close_col] < current[open_col]
    
    if prev_is_green and curr_is_red:
        if current[open_col] >= prev[close_col] and current[close_col] <= prev[open_col]:
            patterns.append("BEARISH_ENGULFING")
            
    return {
        "patterns": patterns,
        "is_bullish_pattern": "BULLISH_ENGULFING" in patterns,
        "is_bearish_pattern": "BEARISH_ENGULFING" in patterns,
        "is_indecision": "DOJI" in patterns
    }
