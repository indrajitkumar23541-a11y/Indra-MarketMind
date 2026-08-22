import pandas as pd
from statsmodels.tsa.stattools import grangercausalitytests
from typing import Dict, Any
import warnings

def calculate_granger_causality(
    df: pd.DataFrame, 
    sentiment_col: str = 'ensemble_score', 
    price_col: str = 'close',
    max_lag: int = 3
) -> Dict[str, Any]:
    """
    Performs Granger Causality test to see if sentiment time series can predict price.
    
    Args:
        df: DataFrame containing the data, aligned by date.
        sentiment_col: Name of the sentiment score column.
        price_col: Name of the price column.
        max_lag: Maximum number of lags (days) to test.
        
    Returns:
        Dict containing causality test results per lag.
    """
    if df.empty or len(df) <= max_lag:
        return {"error": "Not enough data points to calculate Granger causality"}
        
    # Granger test needs the variables in a specific order: [Target (caused), Predictor (causing)]
    # We want to test if Sentiment causes Price
    work_df = df[[price_col, sentiment_col]].copy()
    work_df = work_df.dropna()
    
    if len(work_df) <= max_lag * 3:
        return {"error": "Not enough valid data points after cleaning (need at least 3x max_lag)"}
        
    results_dict = {}
    
    # Run test, suppress the print output by setting verbose=False
    # Note: older versions of statsmodels might warn or print anyway, so we catch warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        gc_res = grangercausalitytests(work_df, maxlag=max_lag, verbose=False)
        
    for lag, test_res in gc_res.items():
        # Using SSR based F-test as the primary metric
        f_test = test_res[0]['ssr_ftest']
        f_stat = f_test[0]
        p_val = f_test[1]
        
        results_dict[f"lag_{lag}"] = {
            "f_statistic": float(f_stat),
            "p_value": float(p_val),
            "is_significant": bool(p_val < 0.05)
        }
        
    return {
        "results": results_dict,
        "n_samples": len(work_df),
        "tested_lags": max_lag,
        # Find the most significant lag (lowest p-value)
        "most_significant": min(results_dict.items(), key=lambda x: x[1]['p_value']) if any(r['is_significant'] for r in results_dict.values()) else None
    }
