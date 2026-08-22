import logging
import os

logger = logging.getLogger(__name__)

class FinGPTAnalyzer:
    """
    FinGPT v3 (LLaMA/ChatGLM based) requires significant GPU memory (8GB+).
    For edge devices or standard laptops, we use a hybrid approach:
    1. Check for API key (like OpenAI/Groq for proxy LLM inference).
    2. If no API key, gracefully degrade (return neutral/mock, let Ensemble re-weight).
    """
    def __init__(self):
        # In the future, load api key from settings
        # e.g., self.api_key = settings.LLM_API_KEY
        self.api_key = os.environ.get("LLM_API_KEY")
        self.is_loaded = bool(self.api_key)
        
        if not self.is_loaded:
            logger.warning("FinGPT: No LLM API Key found. Running in Fallback/Mock mode. The Ensemble Scorer will automatically redistribute its 20% weight to FinBERT and RoBERTa.")
            
    def analyze(self, text: str) -> dict:
        if not text.strip():
            return {"score": 0.0, "label": "Neutral", "confidence": 0.0}
            
        if not self.is_loaded:
            # Fallback mode: return exactly 0.0 so the ensemble can ignore it
            return {
                "score": 0.0,
                "label": "Neutral",
                "confidence": 0.0,
                "is_fallback": True
            }
            
        # TODO: Implement actual LLM API call here (e.g., OpenAI API)
        # Mocking an API response for now
        return {
            "score": 0.5,
            "label": "Bullish",
            "confidence": 0.8,
            "is_fallback": False
        }
