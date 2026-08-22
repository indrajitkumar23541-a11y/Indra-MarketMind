from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RawArticle(BaseModel):
    title: str
    body: Optional[str] = None
    url: str
    source: str
    ticker: Optional[str] = None
    published_at: datetime
    language_orig: str = "en"
    external_id: str

class RawMarketData(BaseModel):
    ticker: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    exchange: str
