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
    import yfinance as yf
    try:
        df = yf.download(request.ticker, period="1y")
        df.reset_index(inplace=True)
        if 'Date' in df.columns:
            df = df.rename(columns={'Date': 'date', 'Close': 'close'})
        elif 'Datetime' in df.columns:
            df = df.rename(columns={'Datetime': 'date', 'Close': 'close'})
            
        prophet_model.train(df, date_col='date', target_col='close')
        forecast_df = prophet_model.predict(days=request.days)
        
        # Only return the future predictions
        future_forecast = forecast_df.tail(request.days)
        
        forecast_points = [
            ForecastPoint(
                date=row['ds'].strftime('%Y-%m-%d'),
                predicted_close=round(float(row['yhat']), 2),
                lower_bound=round(float(row['yhat_lower']), 2),
                upper_bound=round(float(row['yhat_upper']), 2)
            )
            for _, row in future_forecast.iterrows()
        ]
    except Exception as e:
        logger.error(f"Error generating forecast: {e}")
        forecast_points = []
    
    return ForecastResponse(
        ticker=request.ticker,
        forecast_days=request.days,
        model_used="Prophet",
        forecast=forecast_points,
        generated_at=datetime.utcnow().isoformat()
    )

@app.post("/forecast/hybrid", response_model=ForecastResponse)
async def forecast_hybrid(request: ForecastRequest):
    """Generates a forecast using the Hybrid Prophet+LSTM model."""
    import yfinance as yf
    try:
        df = yf.download(request.ticker, period="1y")
        df.reset_index(inplace=True)
        if 'Date' in df.columns:
            df = df.rename(columns={'Date': 'date', 'Close': 'close'})
        elif 'Datetime' in df.columns:
            df = df.rename(columns={'Datetime': 'date', 'Close': 'close'})
            
        hybrid_model.train(df, date_col='date', target_col='close')
        forecast_df = hybrid_model.predict(days=request.days)
        
        # Only return the future predictions
        future_forecast = forecast_df.tail(request.days)
        
        forecast_points = [
            ForecastPoint(
                date=row['ds'].strftime('%Y-%m-%d'),
                predicted_close=round(float(row['yhat']), 2),
                lower_bound=round(float(row['yhat_lower']), 2),
                upper_bound=round(float(row['yhat_upper']), 2)
            )
            for _, row in future_forecast.iterrows()
        ]
    except Exception as e:
        logger.error(f"Error generating hybrid forecast: {e}")
        forecast_points = []
    
    return ForecastResponse(
        ticker=request.ticker,
        forecast_days=request.days,
        model_used="Hybrid",
        forecast=forecast_points,
        generated_at=datetime.utcnow().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.forecasting.main:app", host="0.0.0.0", port=8004, reload=True)
