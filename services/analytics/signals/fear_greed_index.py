from typing import Dict, Any

# Weights based on the 7-factor model in Indra-MarketMind-Plan.md
# Total = 100
FACTOR_WEIGHTS = {
    "market_momentum": 0.20,
    "sentiment_score": 0.20,
    "volatility_proxy": 0.15,
    "safe_haven_demand": 0.15,
    "put_call_ratio_proxy": 0.10,
    "social_media_volume": 0.10,
    "sec_insider_activity": 0.10
}

def calculate_fear_greed_index(factor_scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculates the 7-factor Fear and Greed Index.
    
    Args:
        factor_scores: Dict containing a 0-100 score for each of the 7 factors.
                       0 = Extreme Fear, 100 = Extreme Greed.
                       
    Returns:
        Dict containing the final score, label, and factor breakdown.
    """
    total_score = 0.0
    valid_weight = 0.0
    
    for factor, weight in FACTOR_WEIGHTS.items():
        if factor in factor_scores and factor_scores[factor] is not None:
            total_score += factor_scores[factor] * weight
            valid_weight += weight
            
    if valid_weight == 0:
        return {"error": "No valid factor scores provided"}
        
    # Normalize if some factors are missing
    normalized_score = total_score / valid_weight
    
    # Determine label
    if normalized_score <= 25:
        label = "EXTREME_FEAR"
    elif normalized_score <= 45:
        label = "FEAR"
    elif normalized_score <= 55:
        label = "NEUTRAL"
    elif normalized_score <= 75:
        label = "GREED"
    else:
        label = "EXTREME_GREED"
        
    return {
        "score": round(normalized_score, 2),
        "label": label,
        "valid_factors": list(factor_scores.keys()),
        "missing_factors": list(set(FACTOR_WEIGHTS.keys()) - set(factor_scores.keys())),
        "normalized_weight": round(valid_weight, 2)
    }
