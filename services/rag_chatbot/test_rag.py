import unittest
import sys
import os

# Ensure services directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.rag_chatbot.vector_store import (
    add_texts_to_vector_store,
    search_similar_documents,
    get_store_status
)
from services.rag_chatbot.langchain_engine import answer_query
from services.rag_chatbot.main import app
from fastapi.testclient import TestClient

class TestRAGChatbot(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_vector_store_ingest_and_search(self):
        sample_texts = [
            "NVIDIA reported Q4 revenue of $22.1 billion, up 265% from a year ago on booming AI chip demand.",
            "Apple iPhone shipments contracted slightly in Greater China, offset by strong Services revenue."
        ]
        sample_meta = [
            {"source": "Earnings Release", "ticker": "NVDA"},
            {"source": "10-Q Filing", "ticker": "AAPL"}
        ]
        
        count = add_texts_to_vector_store(sample_texts, sample_meta)
        self.assertEqual(count, 2)
        
        # Test similarity search
        results = search_similar_documents("NVIDIA AI chip demand", k=2)
        self.assertGreater(len(results), 0)
        self.assertTrue(any("NVIDIA" in r["text"] for r in results))

    def test_answer_query(self):
        result = answer_query("What are the latest NVIDIA earnings numbers?")
        self.assertIn("answer", result)
        self.assertIn("sources", result)
        self.assertIn("model_used", result)
        self.assertIn("latency_ms", result)
        self.assertIsInstance(result["answer"], str)
        self.assertGreater(len(result["answer"]), 20)

    def test_api_endpoints(self):
        # Health check
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

        # Ingest endpoint
        ingest_res = self.client.post("/ingest", json={
            "texts": ["Tesla autonomous robotaxi event scheduled for October."],
            "metadatas": [{"ticker": "TSLA", "source": "Press Release"}]
        })
        self.assertEqual(ingest_res.status_code, 200)
        self.assertEqual(ingest_res.json()["status"], "success")

        # Chat endpoint
        chat_res = self.client.post("/chat", json={
            "query": "What is the status of Tesla's autonomous vehicle event?",
            "k": 3
        })
        self.assertEqual(chat_res.status_code, 200)
        data = chat_res.json()
        self.assertIn("answer", data)
        self.assertIn("model_used", data)
        print(f"[Phase 9 Test] RAG Chat Answer: {data['answer'][:100]}... (Model: {data['model_used']})")

if __name__ == "__main__":
    unittest.main()
