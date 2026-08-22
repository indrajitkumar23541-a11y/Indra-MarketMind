import logging
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)

class VaderAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Add custom financial domain lexicons to VADER for better accuracy
        # (VADER is mostly trained on social media, adding finance terms helps)
        new_words = {
            'bullish': 2.0,
            'bearish': -2.0,
            'upgrade': 1.5,
            'downgrade': -1.5,
            'outperform': 1.5,
            'underperform': -1.5,
            'buy': 1.5,
            'sell': -1.5,
            'long': 1.0,
            'short': -1.5,
            'profit': 1.5,
            'loss': -1.5,
            'dividend': 1.0,
            'beat': 1.5,
            'missed': -1.5
        }
        self.analyzer.lexicon.update(new_words)
        
    def analyze(self, text: str) -> dict:
        """
        Analyze text using VADER.
        Returns a dict with 'score' (compound) and 'label'.
        """
        if not text or not text.strip():
            return {"score": 0.0, "label": "Neutral"}
            
        try:
            scores = self.analyzer.polarity_scores(text)
            compound = scores['compound']
            
            if compound >= 0.05:
                label = "Bullish"
            elif compound <= -0.05:
                label = "Bearish"
            else:
                label = "Neutral"
                
            return {
                "score": compound,
                "label": label,
                "details": scores
            }
        except Exception as e:
            logger.error(f"VADER analysis failed: {e}")
            return {"score": 0.0, "label": "Neutral"}
