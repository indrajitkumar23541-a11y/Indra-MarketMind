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
        # Prefer GROQ_API_KEY, fallback to LLM_API_KEY
        self.api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("LLM_API_KEY")
        self.is_loaded = bool(self.api_key)
        
        if not self.is_loaded:
            logger.warning("FinGPT: No GROQ_API_KEY found. Running in Fallback/Mock mode. The Ensemble Scorer will automatically redistribute its weight.")
            
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
            
        import requests
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama3-8b-8192",
                "messages": [
                    {"role": "system", "content": "You are a financial sentiment analyzer. Analyze the text and return ONLY a single float between -1.0 (bearish) and 1.0 (bullish). Do not include any other text."},
                    {"role": "user", "content": text}
                ],
                "temperature": 0.1
            }
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                result_text = response.json()["choices"][0]["message"]["content"].strip()
                try:
                    score = float(result_text)
                    score = max(-1.0, min(1.0, score))
                    if score > 0.2: label = "Bullish"
                    elif score < -0.2: label = "Bearish"
                    else: label = "Neutral"
                    
                    return {
                        "score": score,
                        "label": label,
                        "confidence": 0.8,
                        "is_fallback": False
                    }
                except ValueError:
                    pass
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            
        return {
            "score": 0.0,
            "label": "Neutral",
            "confidence": 0.0,
            "is_fallback": True
        }
