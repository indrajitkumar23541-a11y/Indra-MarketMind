# ──────────────────────────────────────────────────────────
# shared/config.py — Common Configuration Settings
# ──────────────────────────────────────────────────────────
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """Global application settings loading from .env"""
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "indra_marketmind_default_secret_key_2026"

    # LLM & AI API Keys (Optional with mock fallbacks)
    GROQ_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None

    # Market Data Feeds
    NEWSAPI_KEY: str | None = None
    FINNHUB_API_KEY: str | None = None
    ALPHA_VANTAGE_KEY: str | None = None
    REDDIT_CLIENT_ID: str | None = None
    REDDIT_CLIENT_SECRET: str | None = None
    REDDIT_USER_AGENT: str = "IndraMarketMind Bot v1.0"
    SEC_EDGAR_USER_AGENT: str = "IndraMarketMind indrajitkumar23541@gmail.com"
    
    # Telegram Alerts
    TELEGRAM_BOT_TOKEN: str | None = None
    TELEGRAM_CHAT_ID: str | None = None

    # Broker Execution & Risk Management
    ACTIVE_BROKER: str = "paper"  # paper, ibkr, zerodha, alpaca, signal_only
    AUTO_EXECUTE: bool = False
    MAX_RISK_PER_TRADE: float = 0.02
    MAX_DRAWDOWN_LIMIT: float = 0.15
    STOP_LOSS_PCT: float = 0.02
    TAKE_PROFIT_PCT: float = 0.04
    ALPACA_API_KEY: str | None = None
    ALPACA_SECRET_KEY: str | None = None
    IBKR_ACCOUNT_ID: str | None = None

    # Downstream Microservice URLs
    GATEWAY_URL: str = "http://localhost:8000"
    DATA_SERVICE_URL: str = "http://localhost:8001"
    SENTIMENT_SERVICE_URL: str = "http://localhost:8002"
    ANALYTICS_SERVICE_URL: str = "http://localhost:8003"
    FORECAST_SERVICE_URL: str = "http://localhost:8004"
    ALERT_SERVICE_URL: str = "http://localhost:8005"
    RAG_CHATBOT_URL: str = "http://localhost:8006"
    AUTO_TRADING_URL: str = "http://localhost:8007"
    MULTIMODAL_URL: str = "http://localhost:8008"
    CRYPTO_ONCHAIN_URL: str = "http://localhost:8009"
    ALTERNATIVE_DATA_URL: str = "http://localhost:8010"

    # Database URLs
    POSTGRES_USER: str = "indra"
    POSTGRES_PASSWORD: str = "marketmind"
    POSTGRES_DB: str = "marketmind"
    POSTGRES_HOST: str = "localhost" # 'postgres' in docker
    POSTGRES_PORT: int = 5432

    @property
    def sync_database_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def async_database_url(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Cache & Vector
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

settings = Settings()
