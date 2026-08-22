from pydantic import BaseModel, Field
from typing import Optional, Dict

class SentimentRequest(BaseModel):
    text: str = Field(..., description="The text to analyze")
    ticker: Optional[str] = Field(None, description="The ticker symbol associated with the text (optional)")
    source: Optional[str] = Field(None, description="The source of the text (e.g., 'news', 'twitter')")

class SentimentResponse(BaseModel):
    text: str
    vader_score: float = Field(..., description="VADER compound score (-1.0 to 1.0)")
    vader_label: str = Field(..., description="Bullish, Bearish, or Neutral")
    textblob_polarity: float = Field(..., description="TextBlob polarity score (-1.0 to 1.0)")
    textblob_subjectivity: float = Field(..., description="TextBlob subjectivity score (0.0 to 1.0)")
    textblob_label: str = Field(..., description="Bullish, Bearish, or Neutral")
    
class EnsembleResponse(BaseModel):
    text: str
    ensemble_score: float = Field(..., description="Final weighted ensemble score (-1.0 to 1.0)")
    signal: str = Field(..., description="E.g., STRONG BULLISH, NEUTRAL, etc.")
    models_breakdown: Dict = Field(..., description="Detailed breakdown of each model's score")
    active_weights: Dict = Field(..., description="The weights used for this calculation")
