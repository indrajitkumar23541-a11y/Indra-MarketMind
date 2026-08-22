from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ForecastRequest(BaseModel):
    ticker: str = Field(..., description="The stock ticker symbol (e.g. RELIANCE.NS)")
    days: int = Field(default=7, description="Number of days to forecast into the future")
    include_sentiment: bool = Field(default=True, description="Whether to include sentiment in the LSTM features")
    
class ForecastPoint(BaseModel):
    date: str
    predicted_price: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    
class ForecastResponse(BaseModel):
    ticker: str
    forecast_days: int
    model_used: str = Field(..., description="e.g. 'Prophet', 'LSTM', 'Hybrid'")
    forecast: List[ForecastPoint]
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Backtesting metrics (MAE, RMSE) if available")
    generated_at: str
