from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class FearGreedResponse(BaseModel):
    score: float
    label: str
    timestamp: datetime
    factors: Dict[str, float]

class CorrelationResponse(BaseModel):
    ticker: str
    window_days: int
    pearson_r: float
    is_significant: bool
    timestamp: datetime

class GrangerCausalityResponse(BaseModel):
    ticker: str
    lag_days: int
    f_statistic: float
    p_value: float
    is_significant: bool
    timestamp: datetime

class IndicatorResponse(BaseModel):
    ticker: str
    indicator_type: str
    values: Dict[str, Any]
    timestamp: datetime

class SectorRotationResponse(BaseModel):
    sectors: Dict[str, float]
    top_sector: str
    bottom_sector: str
    timestamp: datetime
    
class InsiderSignalResponse(BaseModel):
    ticker: str
    signal: str
    confidence: float
    recent_transactions_count: int
    timestamp: datetime
