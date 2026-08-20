# ──────────────────────────────────────────────────────────
# shared/database.py — Database Connection Management
# ──────────────────────────────────────────────────────────
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from shared.config import settings

# ── SQLAlchemy Base ───────────────────────────────────────
Base = declarative_base()

# ── Async Engine ──────────────────────────────────────────
# We use asyncpg for high performance asynchronous DB access
engine = create_async_engine(
    settings.async_database_url,
    echo=False,           # Set to True for SQL query logging
    future=True,
    pool_size=20,         # Adjust based on expected concurrency
    max_overflow=10
)

# ── Async Session Maker ───────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# ── Dependency for FastAPI ────────────────────────────────
async def get_db():
    """Dependency function to provide DB session per request"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
