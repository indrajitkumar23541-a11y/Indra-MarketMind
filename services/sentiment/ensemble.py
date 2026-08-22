import logging
from services.sentiment.models.finbert_analyzer import FinbertAnalyzer
from services.sentiment.models.roberta_analyzer import RobertaAnalyzer
from services.sentiment.models.fingpt_analyzer import FinGPTAnalyzer
from services.sentiment.models.vader_analyzer import VaderAnalyzer
from services.sentiment.models.textblob_analyzer import TextBlobAnalyzer

logger = logging.getLogger(__name__)

class EnsembleScorer:
    def __init__(self):
        # Base weights as per System Design
        self.base_weights = {
            "finbert": 0.35,
            "roberta": 0.30,
            "fingpt": 0.20,
            "vader": 0.10,
            "textblob": 0.05
        }
        
        logger.info("Initializing all 5 models for Ensemble Scorer (This may take a minute...)")
        self.finbert = FinbertAnalyzer()
        self.roberta = RobertaAnalyzer()
        self.fingpt = FinGPTAnalyzer()
        self.vader = VaderAnalyzer()
        self.textblob = TextBlobAnalyzer()
        
    def _rebalance_weights(self, fingpt_res: dict) -> dict:
        """
        If FinGPT is in fallback mode (no API key/local model), 
        redistribute its 20% weight to FinBERT and RoBERTa proportionally.
        """
        weights = self.base_weights.copy()
        
        if fingpt_res.get("is_fallback", False):
            # FinGPT is missing. Redistribute its 20% to FinBERT and RoBERTa
            fingpt_weight = weights["fingpt"]
            weights["fingpt"] = 0.0
            
            # Proportional redistribution between finbert (35) and roberta (30)
            total_remaining = weights["finbert"] + weights["roberta"]
            finbert_share = weights["finbert"] / total_remaining
            roberta_share = weights["roberta"] / total_remaining
            
            weights["finbert"] += fingpt_weight * finbert_share
            weights["roberta"] += fingpt_weight * roberta_share
            
            logger.debug(f"Rebalanced weights: FinBERT: {weights['finbert']:.2f}, RoBERTa: {weights['roberta']:.2f}")
            
        return weights

    def analyze(self, text: str) -> dict:
        """Run text through all 5 models and calculate ensemble score."""
        
        # 1. Run all models
        # Note: In a production environment, this should ideally be run asynchronously or in batch
        finbert_res = self.finbert.analyze(text)
        roberta_res = self.roberta.analyze(text)
        fingpt_res = self.fingpt.analyze(text)
        vader_res = self.vader.analyze(text)
        textblob_res = self.textblob.analyze(text)
        
        # 2. Check fallback & Rebalance weights
        weights = self._rebalance_weights(fingpt_res)
        
        # 3. Calculate Final Weighted Score
        ensemble_score = (
            (finbert_res["score"] * weights["finbert"]) +
            (roberta_res["score"] * weights["roberta"]) +
            (fingpt_res["score"] * weights["fingpt"]) +
            (vader_res["score"] * weights["vader"]) +
            (textblob_res.get("polarity", 0.0) * weights["textblob"])
        )
        
        # 4. Generate Final Signal
        if ensemble_score > 0.3:
            signal = "STRONG BULLISH"
        elif ensemble_score > 0.1:
            signal = "BULLISH"
        elif ensemble_score < -0.3:
            signal = "STRONG BEARISH"
        elif ensemble_score < -0.1:
            signal = "BEARISH"
        else:
            signal = "NEUTRAL"
            
        return {
            "ensemble_score": ensemble_score,
            "signal": signal,
            "models": {
                "finbert": finbert_res,
                "roberta": roberta_res,
                "fingpt": fingpt_res,
                "vader": vader_res,
                "textblob": textblob_res
            },
            "active_weights": weights
        }
