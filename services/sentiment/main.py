# ──────────────────────────────────────────────────────────
import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
# ──────────────────────────────────────────────────────────
from fastapi import FastAPI, HTTPException
import sys
import logging
from pathlib import Path

# Add project root to python path so we can import shared
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from services.sentiment.schemas import SentimentRequest, SentimentResponse, EnsembleResponse
from services.sentiment.models.vader_analyzer import VaderAnalyzer
from services.sentiment.models.textblob_analyzer import TextBlobAnalyzer
from services.sentiment.ensemble import EnsembleScorer

app = FastAPI(
    title="Sentiment Engine Service",
    description="Service responsible for AI sentiment analysis of market text.",
    version="1.0.0"
)

# Initialize models (singleton)
# Note: Initializing the EnsembleScorer will load FinBERT and RoBERTa into memory (~1.5GB RAM)
logger = logging.getLogger(__name__)
try:
    ensemble_scorer = EnsembleScorer()
    # We can still use the fast ones separately if needed
    vader_analyzer = ensemble_scorer.vader
    textblob_analyzer = ensemble_scorer.textblob
except Exception as e:
    logger.error(f"Failed to initialize models: {e}")
    # Fallbacks
    vader_analyzer = VaderAnalyzer()
    textblob_analyzer = TextBlobAnalyzer()
    ensemble_scorer = None

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "sentiment-engine",
        "models_active": ["vader", "textblob"]
    }

@app.post("/analyze/baseline", response_model=SentimentResponse)
async def analyze_baseline(request: SentimentRequest):
    """
    Analyze text using baseline lightweight models (VADER + TextBlob).
    Returns sentiment scores (P99 < 200ms).
    """
    try:
        vader_res = vader_analyzer.analyze(request.text)
        textblob_res = textblob_analyzer.analyze(request.text)
        
        return SentimentResponse(
            text=request.text,
            vader_score=vader_res["score"],
            vader_label=vader_res["label"],
            textblob_polarity=textblob_res["polarity"],
            textblob_subjectivity=textblob_res["subjectivity"],
            textblob_label=textblob_res["label"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/ensemble", response_model=EnsembleResponse)
async def analyze_ensemble(request: SentimentRequest):
    """
    Run text through all 5 heavy ML models and get the final weighted ensemble score.
    """
    if not ensemble_scorer:
        raise HTTPException(status_code=503, detail="Ensemble scorer models are still loading or failed to load.")
        
    try:
        res = ensemble_scorer.analyze(request.text)
        
        return EnsembleResponse(
            text=request.text,
            ensemble_score=res["ensemble_score"],
            signal=res["signal"],
            models_breakdown=res["models"],
            active_weights=res["active_weights"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Run sentiment service on port 8002
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
