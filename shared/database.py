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
connect_args = {}
if "supabase.com" in settings.async_database_url or "pooler.supabase.com" in settings.async_database_url:
    connect_args["ssl"] = "require"
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(
    settings.async_database_url,
    echo=False,           # Set to True for SQL query logging
    future=True,
    pool_size=20,         # Adjust based on expected concurrency
    max_overflow=10,
    connect_args=connect_args
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
