# ──────────────────────────────────────────────────────────
# shared/models.py — SQLAlchemy ORM Models
# ──────────────────────────────────────────────────────────
from sqlalchemy import Column, Integer, String, Boolean, DateTime, DECIMAL, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from shared.database import Base

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(BigInteger, primary_key=True, index=True)
    ticker = Column(String(20), unique=True, index=True, nullable=False) # e.g. RELIANCE.NS
    name = Column(String(200), nullable=False)
    exchange = Column(String(20), nullable=False)
    exchange_code = Column(String(10), nullable=False, index=True) # For sharding/filtering
    sector = Column(String(100), index=True)
    country = Column(String(2), nullable=False, index=True)
    currency = Column(String(3), nullable=False)
    market_cap_usd = Column(BigInteger)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    articles = relationship("Article", back_populates="stock")
    sentiment_scores = relationship("SentimentScore", back_populates="stock")

class Article(Base):
    __tablename__ = "articles"

    id = Column(BigInteger, primary_key=True, index=True)
    external_id = Column(String(64), unique=True, index=True) # Source deduplication
    ticker = Column(String(20), ForeignKey("stocks.ticker"), index=True)
    source = Column(String(50), nullable=False, index=True) # newsapi, reddit, etc.
    title = Column(String, nullable=False)
    body = Column(String)
    url = Column(String(500))
    language_orig = Column(String(5))
    language_norm = Column(String(5), default="en")
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    content_hash = Column(String(64), unique=True) # SHA256 for dedup

    # Relationships
    stock = relationship("Stock", back_populates="articles")
    sentiment_scores = relationship("SentimentScore", back_populates="article")

class SentimentScore(Base):
    __tablename__ = "sentiment_scores"

    id = Column(BigInteger, primary_key=True, index=True)
    article_id = Column(BigInteger, ForeignKey("articles.id"))
    ticker = Column(String(20), ForeignKey("stocks.ticker"), index=True)
    scored_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Individual model scores
    finbert_score = Column(DECIMAL(5, 4))
    finbert_label = Column(String(10))
    roberta_score = Column(DECIMAL(5, 4))
    roberta_label = Column(String(10))
    fingpt_score = Column(DECIMAL(5, 4))
    fingpt_label = Column(String(10))
    vader_score = Column(DECIMAL(5, 4))
    textblob_score = Column(DECIMAL(5, 4))
    textblob_subj = Column(DECIMAL(5, 4))
    
    # Ensemble output
    ensemble_score = Column(DECIMAL(5, 4), nullable=False, index=True)
    ensemble_label = Column(String(15), nullable=False)
    confidence = Column(DECIMAL(5, 4), nullable=False)
    model_agreement = Column(Boolean, nullable=False)
    processing_ms = Column(Integer)

    # Relationships
    article = relationship("Article", back_populates="sentiment_scores")
    stock = relationship("Stock", back_populates="sentiment_scores")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    ticker = Column(String(20), ForeignKey("stocks.ticker"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    alert_bullish = Column(DECIMAL(3, 2), default=0.75)
    alert_bearish = Column(DECIMAL(3, 2), default=-0.60)

class SignalEvent(Base):
    """Event Sourcing Table - Immutable Audit Trail"""
    __tablename__ = "signal_events"

    id = Column(BigInteger, primary_key=True, index=True)
    event_id = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True)
    event_type = Column(String(50), nullable=False, index=True) # e.g. SIGNAL_GENERATED
    ticker = Column(String(20), ForeignKey("stocks.ticker"), index=True)
    event_payload = Column(JSONB, nullable=False)
    ensemble_score = Column(DECIMAL(5, 4))
    signal_label = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
