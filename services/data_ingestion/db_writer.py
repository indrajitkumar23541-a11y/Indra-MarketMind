import logging
from sqlalchemy.orm import Session
from shared.models import Article, Stock
from services.data_ingestion.schemas import RawArticle
import hashlib

logger = logging.getLogger(__name__)

def generate_content_hash(text: str) -> str:
    """Generate SHA256 hash for content to prevent duplicates."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

from sqlalchemy import select

async def write_article_to_db(db, raw_article: RawArticle):
    """Write a RawArticle to the database asynchronously if it doesn't already exist."""
    
    # 1. Deduplication Check
    # Check by external_id
    if raw_article.external_id:
        stmt = select(Article).where(Article.external_id == raw_article.external_id)
        result = await db.execute(stmt)
        existing = result.scalars().first()
        if existing:
            logger.debug(f"Article with external_id {raw_article.external_id} already exists.")
            return existing

    # Check by content hash
    content_to_hash = (raw_article.title + (raw_article.body or "")).strip()
    content_hash = generate_content_hash(content_to_hash)
    
    stmt = select(Article).where(Article.content_hash == content_hash)
    result = await db.execute(stmt)
    existing = result.scalars().first()
    if existing:
        logger.debug(f"Article with content hash {content_hash} already exists.")
        return existing

    # 2. Foreign Key Check
    if raw_article.ticker:
        stmt = select(Stock).where(Stock.ticker == raw_article.ticker)
        result = await db.execute(stmt)
        stock = result.scalars().first()
        if not stock:
            raw_article.ticker = None

    # 3. Insert new article
    new_article = Article(
        external_id=raw_article.external_id,
        ticker=raw_article.ticker,
        source=raw_article.source,
        title=raw_article.title,
        body=raw_article.body,
        url=raw_article.url,
        language_orig=raw_article.language_orig,
        published_at=raw_article.published_at,
        content_hash=content_hash
    )

    db.add(new_article)
    
    try:
        await db.commit()
        await db.refresh(new_article)
        logger.info(f"Inserted new article: {new_article.title[:50]}...")
        return new_article
    except Exception as e:
        await db.rollback()
        logger.error(f"Error inserting article: {e}")
        return None
