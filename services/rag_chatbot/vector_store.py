import os
from sqlalchemy import create_engine, text
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import PGVector

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://indra:marketmind@postgres:5432/marketmind")

# Ensure the database has the pgvector extension enabled
def ensure_pgvector_extension():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

def get_vector_store():
    # Use HuggingFace sentence transformers for generating embeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vector_store = PGVector(
        connection_string=DATABASE_URL,
        embedding_function=embeddings,
        collection_name="market_sentiment_collection",
        pre_delete_collection=False
    )
    return vector_store

# Initialize on import
ensure_pgvector_extension()
