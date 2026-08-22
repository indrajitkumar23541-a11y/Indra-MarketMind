import logging
from textblob import TextBlob

logger = logging.getLogger(__name__)

class TextBlobAnalyzer:
    def __init__(self):
        pass
        
    def analyze(self, text: str) -> dict:
        """
        Analyze text using TextBlob.
        Returns a dict with 'polarity' (-1.0 to 1.0), 'subjectivity' (0.0 to 1.0), and 'label'.
        """
        if not text or not text.strip():
            return {"polarity": 0.0, "subjectivity": 0.0, "label": "Neutral"}
            
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            if polarity > 0.1:
                label = "Bullish"
            elif polarity < -0.1:
                label = "Bearish"
            else:
                label = "Neutral"
                
            return {
                "polarity": polarity,
                "subjectivity": subjectivity,
                "label": label
            }
        except Exception as e:
            logger.error(f"TextBlob analysis failed: {e}")
            return {"polarity": 0.0, "subjectivity": 0.0, "label": "Neutral"}
