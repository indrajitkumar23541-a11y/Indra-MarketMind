# ──────────────────────────────────────────────────────────
# services/data_ingestion/main.py — Data Fetching Service
# ──────────────────────────────────────────────────────────
from fastapi import FastAPI
import uvicorn
import sys
from pathlib import Path

# Add project root to python path so we can import shared
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from shared.config import settings

app = FastAPI(
    title="Data Ingestion Service",
    description="Service responsible for fetching raw data from APIs (News, Stocks, Reddit).",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "data-ingestion",
        "fetchers_active": 0
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
