import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("AI Forecast", "🤖")

st.title("🤖 AI Forecasting Engine")
st.markdown("Machine Learning predictions using a Hybrid Prophet + LSTM architecture.")

ticker = st.text_input("Ticker Symbol", value="RELIANCE.NS")
days = st.slider("Forecast Horizon (Days)", min_value=1, max_value=30, value=7)

from api_client import APIClient

if st.button("Generate Forecast"):
    with st.spinner(f"Fetching real historical data and running Hybrid ML Model for {ticker}..."):
        # Fetch historical data
        hist_data = APIClient.get_historical_data(ticker, period="3mo")
        if not hist_data or len(hist_data) == 0:
            st.error(f"Could not fetch historical data for {ticker}. Check API keys.")
            st.stop()
            
        hist_df = pd.DataFrame(hist_data)
        hist_df.columns = [c.capitalize() for c in hist_df.columns]
        if 'Datetime' in hist_df.columns:
            hist_df.rename(columns={'Datetime': 'Date'}, inplace=True)
            
        dates = pd.to_datetime(hist_df['Date']).tolist()
        hist_prices = hist_df['Close'].tolist()
        
        # Call the forecast backend
        forecast_resp = APIClient.get_forecast_hybrid(ticker, days=days)
        forecast_data = forecast_resp.get("forecast", []) if forecast_resp else []
        
        fig = go.Figure()
        
        # Historical
        fig.add_trace(go.Scatter(x=dates, y=hist_prices, mode='lines', name='Historical', line=dict(color='#9CA3AF')))
        
        if forecast_data and len(forecast_data) > 0:
            future_dates = [f["date"] for f in forecast_data]
            forecast_prices = [f["predicted_price"] for f in forecast_data]
            lower_bound = [f["lower_bound"] for f in forecast_data]
            upper_bound = [f["upper_bound"] for f in forecast_data]
            
            # Connect the lines
            future_dates.insert(0, dates[-1])
            forecast_prices.insert(0, hist_prices[-1])
            lower_bound.insert(0, hist_prices[-1])
            upper_bound.insert(0, hist_prices[-1])
            
            # Forecast
            fig.add_trace(go.Scatter(x=future_dates, y=forecast_prices, mode='lines', name='Hybrid Forecast', line=dict(color='#6C63FF', dash='dash')))
            
            # Confidence Interval
            fig.add_trace(go.Scatter(
                x=future_dates + future_dates[::-1],
                y=upper_bound + lower_bound[::-1],
                fill='toself',
                fillcolor='rgba(108, 99, 255, 0.2)',
                line=dict(color='rgba(255,255,255,0)'),
                hoverinfo="skip",
                showlegend=False,
                name='Confidence Interval'
            ))
            
            # Trend calculation
            trend_val = ((forecast_prices[-1] - hist_prices[-1]) / hist_prices[-1]) * 100
            trend_status = "BULLISH" if trend_val >= 0 else "BEARISH"
            trend_str = f"**{trend_status}** ({trend_val:+.2f}%)"
            msg = f"Forecast generated successfully. Expected trend: {trend_str}"
        else:
            msg = "Forecast engine returned no data. Displaying historical data only. Backend ML training might not be active."
        
        fig.update_layout(
            title=f"{ticker} - Analysis & Forecast",
            yaxis_title="Price",
            template="plotly_dark",
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        if forecast_data:
            st.success(msg)
        else:
            st.warning(msg)
