import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("rag_chatbot.vector_store")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://indra:marketmind@postgres:5432/marketmind")

# In-memory fallback storage when PostgreSQL/pgvector is unavailable
_in_memory_docs: List[Dict[str, Any]] = []

def init_vector_db():
    """Attempt to verify or initialize PostgreSQL pgvector extension lazily."""
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        logger.info("Successfully connected to PostgreSQL and verified pgvector extension.")
        return True
    except Exception as e:
        logger.warning(f"PostgreSQL/pgvector not available ({e}). Using in-memory resilient vector store.")
        return False

def get_vector_store():
    """Returns PGVector if accessible, otherwise None (falling back to memory store)."""
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_community.vectorstores import PGVector
        
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_store = PGVector(
            connection_string=DATABASE_URL,
            embedding_function=embeddings,
            collection_name="market_sentiment_collection",
            pre_delete_collection=False
        )
        return vector_store
    except Exception as e:
        logger.debug(f"Falling back to in-memory vector store: {e}")
        return None

def add_texts_to_vector_store(texts: List[str], metadatas: Optional[List[dict]] = None) -> int:
    """Adds texts to PGVector if available, or saves to resilient in-memory store."""
    if not texts:
        return 0
    
    if metadatas is None:
        metadatas = [{} for _ in texts]
    
    vs = get_vector_store()
    if vs is not None:
        try:
            vs.add_texts(texts=texts, metadatas=metadatas)
            return len(texts)
        except Exception as e:
            logger.warning(f"Failed to add to PGVector ({e}), appending to in-memory store.")
            
    # In-memory store fallback
    for text_content, meta in zip(texts, metadatas):
        _in_memory_docs.append({
            "text": text_content,
            "metadata": meta or {}
        })
    return len(texts)

def search_similar_documents(query: str, k: int = 5) -> List[Dict[str, Any]]:
    """Retrieves top-k relevant documents from PGVector or in-memory store."""
    vs = get_vector_store()
    if vs is not None:
        try:
            docs = vs.similarity_search(query, k=k)
            return [{"text": doc.page_content, "metadata": doc.metadata} for doc in docs]
        except Exception as e:
            logger.warning(f"PGVector search failed ({e}), falling back to in-memory search.")

    # In-memory heuristic search
    if not _in_memory_docs:
        # Default seed knowledge base if empty
        return [
            {
                "text": "Market indices are hovering near historic highs with strong semiconductor and tech sector earnings.",
                "metadata": {"source": "MarketMind News Feed", "ticker": "SPY", "timestamp": "latest"}
            },
            {
                "text": "Federal Reserve minutes signal a cautious approach to monetary policy, balancing inflation data and labor market resilience.",
                "metadata": {"source": "Macro Economic Review", "ticker": "FED", "timestamp": "latest"}
            }
        ]

    query_words = set(query.lower().split())
    scored = []
    for doc in _in_memory_docs:
        doc_words = set(doc["text"].lower().split())
        score = len(query_words.intersection(doc_words))
        scored.append((score, doc))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    results = [item[1] for item in scored[:k]]
    return results

def get_store_status() -> Dict[str, Any]:
    """Returns vector store health and document count."""
    vs = get_vector_store()
    return {
        "backend": "pgvector" if vs is not None else "in_memory",
        "in_memory_docs_count": len(_in_memory_docs),
        "db_connected": vs is not None
    }
