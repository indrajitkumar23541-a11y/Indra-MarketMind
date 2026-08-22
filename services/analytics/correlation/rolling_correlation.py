import pandas as pd
from typing import Dict, Any, List
import numpy as np

def calculate_rolling_correlation(
    df: pd.DataFrame, 
    sentiment_col: str = 'ensemble_score', 
    price_col: str = 'close',
    windows: List[int] = [7, 14, 30],
    price_pct_change: bool = True
) -> Dict[str, Any]:
    """
    Calculates rolling Pearson correlation over specified time windows.
    Helps identify periods where market is highly sentiment-driven (r > 0.7).
    
    Args:
        df: DataFrame containing the data, aligned by date.
        sentiment_col: Name of the sentiment score column.
        price_col: Name of the price column.
        windows: List of integer window sizes (in periods/days).
        price_pct_change: If True, uses % change for price.
        
    Returns:
        Dict containing rolling correlation data for each window.
    """
    if df.empty:
        return {"error": "Empty dataframe"}
        
    work_df = df.copy()
    
    if price_pct_change:
        target_col = f'{price_col}_pct_change'
        work_df[target_col] = work_df[price_col].pct_change()
    else:
        target_col = price_col
        
    results = {}
    
    for window in windows:
        if len(work_df) < window:
            results[f"window_{window}"] = {"error": f"Not enough data for window {window}"}
            continue
            
        # Calculate rolling correlation
        rolling_corr = work_df[sentiment_col].rolling(window=window).corr(work_df[target_col])
        
        # Get the latest value
        latest_val = rolling_corr.iloc[-1]
        
        # Drop NaNs to get valid historical values
        valid_corr = rolling_corr.dropna()
        
        if valid_corr.empty:
            results[f"window_{window}"] = {"error": "No valid correlation values calculated"}
            continue
            
        results[f"window_{window}"] = {
            "current_r": float(latest_val) if not np.isnan(latest_val) else None,
            "mean_r": float(valid_corr.mean()),
            "max_r": float(valid_corr.max()),
            "min_r": float(valid_corr.min()),
            "is_sentiment_driven": bool(latest_val > 0.7) if not np.isnan(latest_val) else False,
            "historical_values": valid_corr.tail(30).to_dict() # last 30 valid points for charting
        }
        
    return results
