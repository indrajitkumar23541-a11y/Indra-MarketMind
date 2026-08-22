from fastapi import FastAPI, HTTPException, Depends
from datetime import datetime
import logging
import pandas as pd

from services.forecasting.schemas import ForecastRequest, ForecastResponse, ForecastPoint
from services.forecasting.prophet_forecaster import ProphetForecaster
from services.forecasting.lstm_forecaster import LSTMForecaster
from services.forecasting.hybrid_forecaster import HybridForecaster

app = FastAPI(title="Indra-MarketMind Forecast Service", version="1.0.0")
logger = logging.getLogger("forecasting")

# In a real scenario, these models might be loaded from disk or cached.
prophet_model = ProphetForecaster()
lstm_model = LSTMForecaster()
hybrid_model = HybridForecaster(prophet_model, lstm_model)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "forecasting"}

@app.post("/forecast/prophet", response_model=ForecastResponse)
async def forecast_prophet(request: ForecastRequest):
    """Generates a forecast using only the Prophet model (Trend & Seasonality)."""
    # TODO: Fetch actual OHLCV data from DB
    # For now, we mock the dataframe fetching
    # df = await get_stock_data(request.ticker)
    
    return ForecastResponse(
        ticker=request.ticker,
        forecast_days=request.days,
        model_used="Prophet",
        forecast=[],
        generated_at=datetime.utcnow().isoformat()
    )

@app.post("/forecast/hybrid", response_model=ForecastResponse)
async def forecast_hybrid(request: ForecastRequest):
    """Generates a forecast using the Hybrid Prophet+LSTM model."""
    # TODO: Fetch actual OHLCV and Sentiment data from DB
    
    return ForecastResponse(
        ticker=request.ticker,
        forecast_days=request.days,
        model_used="Hybrid",
        forecast=[],
        generated_at=datetime.utcnow().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.forecasting.main:app", host="0.0.0.0", port=8004, reload=True)
