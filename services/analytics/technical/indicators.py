import pandas as pd
import ta
from typing import Dict, Any

def calculate_all_indicators(df: pd.DataFrame, close_col: str = 'close', high_col: str = 'high', low_col: str = 'low') -> Dict[str, Any]:
    """
    Calculates standard technical indicators used for ML features.
    """
    if df.empty or len(df) < 50:
        return {"error": "Not enough data (minimum 50 periods required)"}
        
    results = {}
    
    # RSI (14)
    rsi = ta.momentum.rsi(df[close_col], window=14)
    results['rsi_14'] = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else None
        
    # MACD
    macd = ta.trend.macd(df[close_col], window_fast=12, window_slow=26)
    macd_signal = ta.trend.macd_signal(df[close_col], window_fast=12, window_slow=26, window_sign=9)
    macd_diff = ta.trend.macd_diff(df[close_col], window_fast=12, window_slow=26, window_sign=9)
    
    results['macd_line'] = float(macd.iloc[-1]) if not pd.isna(macd.iloc[-1]) else None
    results['macd_histogram'] = float(macd_diff.iloc[-1]) if not pd.isna(macd_diff.iloc[-1]) else None
    results['macd_signal'] = float(macd_signal.iloc[-1]) if not pd.isna(macd_signal.iloc[-1]) else None
        
    # Moving Averages
    sma_20 = ta.trend.sma_indicator(df[close_col], window=20)
    ema_20 = ta.trend.ema_indicator(df[close_col], window=20)
    
    results['sma_20'] = float(sma_20.iloc[-1]) if not pd.isna(sma_20.iloc[-1]) else None
    results['ema_20'] = float(ema_20.iloc[-1]) if not pd.isna(ema_20.iloc[-1]) else None
        
    return results
