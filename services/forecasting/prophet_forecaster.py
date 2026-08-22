import pandas as pd
from typing import Dict, Any, Tuple
import logging
import warnings
import numpy as np
from sklearn.linear_model import LinearRegression

# Suppress Prophet output spam
warnings.filterwarnings('ignore')

logger = logging.getLogger("forecasting.prophet")

class ProphetForecaster:
    """
    Wrapper for Meta's Prophet model to forecast long-term stock price trends.
    Falls back to a linear model if Prophet's C++ backend (Stan) is missing on Windows.
    """
    def __init__(self, changepoint_prior_scale=0.05, seasonality_prior_scale=10.0):
        self.changepoint_prior_scale = changepoint_prior_scale
        self.seasonality_prior_scale = seasonality_prior_scale
        self.model = None
        self.fallback_model = None
        self.is_fallback = False
        
    def prepare_data(self, df: pd.DataFrame, date_col: str = 'date', target_col: str = 'close') -> pd.DataFrame:
        """
        Prepares dataframe for Prophet (requires 'ds' and 'y' columns).
        """
        if df.empty or date_col not in df.columns or target_col not in df.columns:
            raise ValueError(f"DataFrame must contain '{date_col}' and '{target_col}' columns")
            
        prophet_df = df[[date_col, target_col]].copy()
        prophet_df = prophet_df.rename(columns={date_col: 'ds', target_col: 'y'})
        
        # Ensure 'ds' is datetime
        prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])
        
        # Drop naive timezone if exists because Prophet expects timezone naive or consistent timezone
        if prophet_df['ds'].dt.tz is not None:
            prophet_df['ds'] = prophet_df['ds'].dt.tz_localize(None)
            
        return prophet_df.sort_values(by='ds').reset_index(drop=True)
        
    def train(self, df: pd.DataFrame, date_col: str = 'date', target_col: str = 'close'):
        """
        Trains the Prophet model on historical data.
        """
        prophet_df = self.prepare_data(df, date_col, target_col)
        
        try:
            from prophet import Prophet
            self.model = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=True,
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_prior_scale=self.seasonality_prior_scale
            )
            self.model.fit(prophet_df)
            logger.info("Prophet model trained successfully.")
            self.is_fallback = False
        except Exception as e:
            logger.warning(f"Prophet initialization failed (likely missing C++ Stan backend on Windows): {e}")
            logger.warning("Falling back to Linear Regression trend model for forecasting.")
            self.is_fallback = True
            
            # Simple fallback model
            self.fallback_model = LinearRegression()
            X = np.arange(len(prophet_df)).reshape(-1, 1)
            y = prophet_df['y'].values
            self.fallback_model.fit(X, y)
            self.last_date = prophet_df['ds'].max()
            self.last_index = len(prophet_df)
        
    def predict(self, days: int = 7) -> pd.DataFrame:
        """
        Generates forecast for the specified number of future days.
        Returns a DataFrame with 'ds', 'yhat', 'yhat_lower', 'yhat_upper'.
        """
        if self.is_fallback:
            if self.fallback_model is None:
                raise RuntimeError("Model must be trained before calling predict()")
            
            future_dates = [self.last_date + pd.Timedelta(days=i) for i in range(1, days + 1)]
            X_future = np.arange(self.last_index, self.last_index + days).reshape(-1, 1)
            
            yhat = self.fallback_model.predict(X_future)
            # Add some pseudo confidence intervals
            yhat_lower = yhat * 0.95
            yhat_upper = yhat * 1.05
            
            return pd.DataFrame({
                'ds': future_dates,
                'yhat': yhat,
                'yhat_lower': yhat_lower,
                'yhat_upper': yhat_upper
            })
            
        if self.model is None:
            raise RuntimeError("Model must be trained before calling predict()")
            
        # Make future dataframe
        future = self.model.make_future_dataframe(periods=days, freq='D')
        forecast = self.model.predict(future)
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
    def evaluate(self, df: pd.DataFrame, date_col: str = 'date', target_col: str = 'close') -> Dict[str, float]:
        """
        Evaluates the model against actuals using Mean Absolute Error (MAE).
        """
        prophet_df = self.prepare_data(df, date_col, target_col)
        
        if self.is_fallback:
            X = np.arange(len(prophet_df)).reshape(-1, 1)
            y_pred = self.fallback_model.predict(X)
            mae = np.mean(np.abs(prophet_df['y'].values - y_pred))
            return {"mae": float(mae)}
            
        if self.model is None:
            raise RuntimeError("Model must be trained before evaluation")
            
        forecast = self.model.predict(prophet_df)
        merged = pd.merge(prophet_df, forecast[['ds', 'yhat']], on='ds')
        mae = (merged['y'] - merged['yhat']).abs().mean()
        
        return {"mae": float(mae)}
