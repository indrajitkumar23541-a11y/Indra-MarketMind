import pandas as pd
import ta
from typing import Dict, Any

def analyze_volatility(df: pd.DataFrame, high_col: str = 'high', low_col: str = 'low', close_col: str = 'close') -> Dict[str, Any]:
    """
    Analyzes volatility using ATR and Bollinger Band width.
    """
    if df.empty or len(df) < 20:
        return {"error": "Not enough data"}
        
    # Calculate ATR
    atr_indicator = ta.volatility.AverageTrueRange(high=df[high_col], low=df[low_col], close=df[close_col], window=14)
    atr = atr_indicator.average_true_range()
    
    # Calculate Bollinger Bands
    bbands = ta.volatility.BollingerBands(close=df[close_col], window=20, window_dev=2)
    bb_width_pct = bbands.bollinger_wband()
    
    if atr is None or bb_width_pct is None:
        return {"error": "Failed to calculate volatility indicators"}
        
    latest_atr = atr.iloc[-1]
    latest_bb_width = bb_width_pct.iloc[-1]
    
    # Compare ATR to historical avg to determine if volatility is spiking
    avg_atr = atr.mean()
    is_spiking = latest_atr > (avg_atr * 1.5) if not pd.isna(avg_atr) and not pd.isna(latest_atr) else False
    
    return {
        "atr": float(latest_atr) if not pd.isna(latest_atr) else None,
        "atr_historical_avg": float(avg_atr) if not pd.isna(avg_atr) else None,
        "is_volatility_spiking": bool(is_spiking),
        "bollinger_band_width_pct": float(latest_bb_width) if not pd.isna(latest_bb_width) else None
    }
