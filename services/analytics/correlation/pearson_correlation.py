import pandas as pd
from scipy.stats import pearsonr
import numpy as np
from typing import Dict, Any, Tuple

def calculate_pearson_correlation(
    df: pd.DataFrame, 
    sentiment_col: str = 'ensemble_score', 
    price_col: str = 'close',
    price_pct_change: bool = True
) -> Dict[str, Any]:
    """
    Calculates Pearson correlation between sentiment scores and price data.
    
    Args:
        df: DataFrame containing the data, aligned by date.
        sentiment_col: Name of the sentiment score column.
        price_col: Name of the price column.
        price_pct_change: If True, calculates correlation against % change of price instead of absolute price.
        
    Returns:
        Dict containing correlation coefficient (r) and p-value.
    """
    if df.empty or len(df) < 2:
        return {"error": "Not enough data points to calculate correlation"}
        
    # Make a copy to avoid SettingWithCopyWarning
    work_df = df.copy()
    
    # Calculate % change if requested
    if price_pct_change:
        target_col = f'{price_col}_pct_change'
        work_df[target_col] = work_df[price_col].pct_change()
    else:
        target_col = price_col
        
    # Drop NaNs
    work_df = work_df.dropna(subset=[sentiment_col, target_col])
    
    if len(work_df) < 2:
        return {"error": "Not enough valid data points after cleaning"}
        
    # Calculate Pearson R
    r_val, p_val = pearsonr(work_df[sentiment_col], work_df[target_col])
    
    return {
        "pearson_r": float(r_val),
        "p_value": float(p_val),
        "is_significant": bool(p_val < 0.05),
        "n_samples": len(work_df)
    }
