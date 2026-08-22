import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

logger = logging.getLogger(__name__)

class RobertaAnalyzer:
    def __init__(self):
        # A popular financial RoBERTa model
        self.model_name = "mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        try:
            logger.info(f"Loading Financial-RoBERTa model on {self.device}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Failed to load Financial-RoBERTa: {e}")
            self.is_loaded = False
            
    def analyze(self, text: str) -> dict:
        if not self.is_loaded or not text.strip():
            return {"score": 0.0, "label": "Neutral", "confidence": 0.0}
            
        try:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Output logits order varies by model, but for mrm8488's distilroberta:
                # 0: negative, 1: neutral, 2: positive
                probs = F.softmax(outputs.logits, dim=-1).squeeze().tolist()
                
            neg_prob, neu_prob, pos_prob = probs[0], probs[1], probs[2]
            
            # Map to -1 to +1 score
            score = pos_prob - neg_prob
            
            if score > 0.1:
                label = "Bullish"
                confidence = pos_prob
            elif score < -0.1:
                label = "Bearish"
                confidence = neg_prob
            else:
                label = "Neutral"
                confidence = neu_prob
                
            return {
                "score": score,
                "label": label,
                "confidence": confidence,
                "raw_probs": {"positive": pos_prob, "negative": neg_prob, "neutral": neu_prob}
            }
            
        except Exception as e:
            logger.error(f"Financial-RoBERTa inference error: {e}")
            return {"score": 0.0, "label": "Neutral", "confidence": 0.0}
