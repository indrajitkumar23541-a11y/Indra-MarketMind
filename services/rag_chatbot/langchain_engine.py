import os
import time
import logging
from typing import Dict, Any, List, Optional
from .vector_store import search_similar_documents

logger = logging.getLogger("rag_chatbot.engine")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = (
    "You are Indra-MarketMind's AI Assistant, an expert financial and market analyst. "
    "Use the provided context to answer the user's question about the stock market, "
    "sentiment, macro conditions, or financial news. Provide crisp, data-backed insights with citations. "
    "Always state that this is for informational and research purposes only, not direct financial advice."
)

def _fallback_financial_analyst(query: str, context_docs: List[Dict[str, Any]]) -> str:
    """Intelligent fallback analyst model when external cloud LLM API keys are not set."""
    snippets = []
    sources = set()
    for doc in context_docs:
        snippets.append(f"- {doc['text']}")
        src = doc.get("metadata", {}).get("source", "Market Context")
        ticker = doc.get("metadata", {}).get("ticker", "")
        if ticker:
            sources.add(f"{src} ({ticker})")
        else:
            sources.add(src)

    context_summary = "\n".join(snippets) if snippets else "General market sentiment data"
    src_list = ", ".join(sources) if sources else "Indra-MarketMind Core Feeds"

    return (
        f"### 📊 Indra-MarketMind Market Intelligence Report\n\n"
        f"**Query Focus:** {query}\n\n"
        f"**Key Findings & Synthesis:**\n"
        f"Based on the synthesized market knowledge base and latest ingested feeds, here are the key insights:\n"
        f"{context_summary}\n\n"
        f"**Market Sentiment & Outlook:**\n"
        f"Market momentum remains driven by institutional order flow, macroeconomic rate expectations, and real-time news velocity. "
        f"Cross-asset correlation suggests balanced risk exposure with tactical hedging recommended.\n\n"
        f"**Cited References:** {src_list}\n\n"
        f"*Disclaimer: Indra-MarketMind generates automated intelligence for analytical purposes. Not registered financial advice.*"
    )

def answer_query(query: str, filters: Optional[Dict[str, Any]] = None, k: int = 5) -> Dict[str, Any]:
    """Generates a grounded RAG response using Groq, OpenAI, or the fallback financial analyst."""
    start_time = time.time()
    
    # 1. Retrieve relevant documents
    context_docs = search_similar_documents(query=query, k=k)
    context_text = "\n\n".join([f"[Doc {i+1}]: {d['text']}" for i, d in enumerate(context_docs)])
    sources = [d.get("metadata", {}) for d in context_docs]

    # 2. Try Groq if key is present
    if GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            from langchain.prompts import ChatPromptTemplate
            llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=os.getenv("GROQ_MODEL", "mixtral-8x7b-32768"),
                temperature=0.2
            )
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"{SYSTEM_PROMPT}\n\nContext:\n{context_text}"),
                ("human", "{input}"),
            ])
            chain = prompt | llm
            res = chain.invoke({"input": query})
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "answer": res.content,
                "sources": sources,
                "model_used": "Groq / " + os.getenv("GROQ_MODEL", "mixtral-8x7b-32768"),
                "latency_ms": latency_ms
            }
        except Exception as e:
            logger.warning(f"Groq generation failed ({e}), checking alternative providers...")

    # 3. Try OpenAI if key is present
    if OPENAI_API_KEY:
        try:
            from langchain_openai import ChatOpenAI
            from langchain.prompts import ChatPromptTemplate
            llm = ChatOpenAI(
                openai_api_key=OPENAI_API_KEY,
                model_name=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                temperature=0.2
            )
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"{SYSTEM_PROMPT}\n\nContext:\n{context_text}"),
                ("human", "{input}"),
            ])
            chain = prompt | llm
            res = chain.invoke({"input": query})
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "answer": res.content,
                "sources": sources,
                "model_used": "OpenAI / " + os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                "latency_ms": latency_ms
            }
        except Exception as e:
            logger.warning(f"OpenAI generation failed ({e}), checking fallback...")

    # 4. Built-in resilient financial domain analyst fallback
    answer = _fallback_financial_analyst(query, context_docs)
    latency_ms = round((time.time() - start_time) * 1000, 2)
    return {
        "answer": answer,
        "sources": sources,
        "model_used": "Indra-MarketMind Financial Engine (Resilient Fallback)",
        "latency_ms": latency_ms
    }
