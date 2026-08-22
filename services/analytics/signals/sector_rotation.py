import pandas as pd
from typing import Dict, Any

def analyze_sector_rotation(sector_sentiments: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes sentiment across GICS sectors to find where money is flowing.
    
    Args:
        sector_sentiments: DataFrame with columns ['sector', 'sentiment_score']
                           Can also include 'prev_sentiment_score' to track momentum.
                           
    Returns:
        Dict containing top/bottom sectors and overall rotation signal.
    """
    if sector_sentiments.empty or 'sector' not in sector_sentiments or 'sentiment_score' not in sector_sentiments:
        return {"error": "Invalid sector data provided"}
        
    # Sort by sentiment
    sorted_df = sector_sentiments.sort_values(by='sentiment_score', ascending=False)
    
    top_sector = sorted_df.iloc[0].to_dict()
    bottom_sector = sorted_df.iloc[-1].to_dict()
    
    # Calculate momentum if previous scores are available
    momentum_data = {}
    if 'prev_sentiment_score' in sorted_df.columns:
        sorted_df['momentum'] = sorted_df['sentiment_score'] - sorted_df['prev_sentiment_score']
        momentum_df = sorted_df.sort_values(by='momentum', ascending=False)
        momentum_data = {
            "fastest_rising": momentum_df.iloc[0]['sector'],
            "fastest_falling": momentum_df.iloc[-1]['sector']
        }
        
    return {
        "top_sector": top_sector['sector'],
        "top_sector_score": float(top_sector['sentiment_score']),
        "bottom_sector": bottom_sector['sector'],
        "bottom_sector_score": float(bottom_sector['sentiment_score']),
        "momentum": momentum_data,
        "all_sectors": sorted_df[['sector', 'sentiment_score']].set_index('sector')['sentiment_score'].to_dict()
    }
