import pandas as pd
from typing import Dict, Any

def analyze_insider_activity(transactions: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes SEC Form 4 insider transactions for cluster buying/selling.
    
    Args:
        transactions: DataFrame with columns ['officer_title', 'transaction_type', 'value', 'date']
                      where transaction_type is 'BUY' or 'SELL'.
                      
    Returns:
        Dict containing signal, confidence, and summary.
    """
    if transactions.empty:
        return {"signal": "NEUTRAL", "confidence": 0.0, "reason": "No transactions found"}
        
    # Count buys and sells
    buys = transactions[transactions['transaction_type'] == 'BUY']
    sells = transactions[transactions['transaction_type'] == 'SELL']
    
    num_buys = len(buys)
    num_sells = len(sells)
    
    # Calculate total value
    buy_value = buys['value'].sum() if 'value' in buys else 0
    sell_value = sells['value'].sum() if 'value' in sells else 0
    
    # Logic for cluster buying
    # e.g., 3+ unique officers buying in a short window
    unique_buyers = buys['officer_title'].nunique() if 'officer_title' in buys else num_buys
    unique_sellers = sells['officer_title'].nunique() if 'officer_title' in sells else num_sells
    
    signal = "NEUTRAL"
    confidence = 0.0
    
    if unique_buyers >= 3 and buy_value > sell_value * 2:
        signal = "STRONG_BULLISH"
        confidence = min(0.95, 0.5 + (unique_buyers * 0.1))
        reason = f"Cluster buy detected: {unique_buyers} insiders bought"
    elif unique_buyers >= 2 and buy_value > sell_value:
        signal = "BULLISH"
        confidence = 0.6
        reason = f"Insider buying detected: {unique_buyers} insiders bought"
    elif unique_sellers >= 4 and sell_value > buy_value * 3:
        signal = "STRONG_BEARISH"
        confidence = min(0.95, 0.5 + (unique_sellers * 0.1))
        reason = f"Cluster sell detected: {unique_sellers} insiders sold"
    elif unique_sellers >= 2 and sell_value > buy_value * 1.5:
        signal = "BEARISH"
        confidence = 0.6
        reason = f"Insider selling detected: {unique_sellers} insiders sold"
    else:
        reason = "Mixed or insignificant insider activity"
        
    return {
        "signal": signal,
        "confidence": round(confidence, 2),
        "reason": reason,
        "summary": {
            "num_buys": int(num_buys),
            "num_sells": int(num_sells),
            "total_buy_value": float(buy_value),
            "total_sell_value": float(sell_value),
            "unique_buyers": int(unique_buyers),
            "unique_sellers": int(unique_sellers)
        }
    }
