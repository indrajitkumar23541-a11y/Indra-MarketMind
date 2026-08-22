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
    SECRET_KEY: str

    # API Keys
    NEWSAPI_KEY: str | None = None
    FINNHUB_API_KEY: str | None = None
    REDDIT_CLIENT_ID: str | None = None
    REDDIT_CLIENT_SECRET: str | None = None
    REDDIT_USER_AGENT: str = "IndraMarketMind Bot v1.0"
    SEC_EDGAR_USER_AGENT: str = "IndraMarketMind indrajitkumar23541@gmail.com"
    TELEGRAM_BOT_TOKEN: str | None = None

    # Database URLs
    POSTGRES_USER: str = "indra_admin"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "marketmind_db"
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
