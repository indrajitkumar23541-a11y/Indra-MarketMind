import pandas as pd
from typing import Dict, Any, List
import logging

from services.forecasting.prophet_forecaster import ProphetForecaster
from services.forecasting.lstm_forecaster import LSTMForecaster
from services.forecasting.schemas import ForecastPoint

logger = logging.getLogger("forecasting.hybrid")

class HybridForecaster:
    """
    Combines Prophet for base trend and LSTM for short-term sentiment/technical residual prediction.
    """
    def __init__(self, prophet_model: ProphetForecaster, lstm_model: LSTMForecaster):
        self.prophet = prophet_model
        self.lstm = lstm_model
        
    def train(self, df: pd.DataFrame, date_col: str = 'date', target_col: str = 'close', feature_cols: List[str] = None):
        """
        Trains both models.
        """
        if feature_cols is None:
            feature_cols = ['open', 'high', 'low', 'volume', 'ensemble_score']
            
        # 1. Train Prophet on the base target
        logger.info("Training Prophet model...")
        self.prophet.train(df, date_col, target_col)
        
        # 2. Get Prophet's in-sample predictions to calculate residuals
        prophet_df = self.prophet.prepare_data(df, date_col, target_col)
        
        if self.prophet.is_fallback:
            import numpy as np
            X = np.arange(len(prophet_df)).reshape(-1, 1)
            yhat = self.prophet.fallback_model.predict(X)
            forecast = pd.DataFrame({'ds': prophet_df['ds'], 'yhat': yhat})
        else:
            forecast = self.prophet.model.predict(prophet_df)
            
        # Merge back to calculate residuals
        merged = pd.merge(prophet_df, forecast[['ds', 'yhat']], on='ds', how='inner')
        merged['residual'] = merged['y'] - merged['yhat']
        
        # Add residual to the original dataframe so LSTM can use it as a target
        # Assuming original df is aligned or can be mapped by date
        df_lstm = df.copy()
        df_lstm['date_ds'] = pd.to_datetime(df_lstm[date_col]).dt.tz_localize(None)
        
        merged_res = merged[['ds', 'residual']].rename(columns={'ds': 'date_ds'})
        df_lstm = pd.merge(df_lstm, merged_res, on='date_ds', how='inner')
        
        # 3. Train LSTM on the residuals
        logger.info("Training LSTM model on residuals...")
        self.lstm.train(df_lstm, feature_cols, target_col='residual')
        
        logger.info("Hybrid model training complete.")
        
    def predict(self, df: pd.DataFrame, days: int = 7, date_col: str = 'date', feature_cols: List[str] = None) -> List[ForecastPoint]:
        """
        Generates a forecast for N days.
        """
        if feature_cols is None:
            feature_cols = ['open', 'high', 'low', 'volume', 'ensemble_score']
            
        # 1. Get Prophet future forecast
        prophet_forecast = self.prophet.predict(days=days)
        # prophet_forecast includes the historical dates too if we just call predict() on future df
        # We need to extract just the last 'days' rows
        future_forecast = prophet_forecast.tail(days).reset_index(drop=True)
        
        # 2. Predict next residual using LSTM
        # We iteratively predict to get multiple days of residuals if needed, or 
        # just apply the next step residual over the short term.
        # For a true multi-step LSTM we'd need to predict feature_cols too.
        # A simpler approach: Predict the next 1 day residual, and let it decay, or just use Prophet for >1 day.
        # Here we'll predict the t+1 residual and apply it.
        
        predicted_residual = self.lstm.predict_next(df)
        
        results = []
        for i, row in future_forecast.iterrows():
            # Decay the residual influence over time (e.g., impact fades out after a few days)
            decay_factor = max(0, 1 - (i * 0.2)) # Decays to 0 in 5 days
            adjusted_pred = row['yhat'] + (predicted_residual * decay_factor)
            
            results.append(ForecastPoint(
                date=row['ds'].strftime('%Y-%m-%d'),
                predicted_price=round(adjusted_pred, 2),
                lower_bound=round(row['yhat_lower'], 2),
                upper_bound=round(row['yhat_upper'], 2)
            ))
            
        return results
