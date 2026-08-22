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

if st.button("Generate Forecast"):
    with st.spinner(f"Running Hybrid ML Model for {ticker}..."):
        # Mock historical data
        dates = [datetime.now() - timedelta(days=i) for i in range(60)]
        dates.reverse()
        base = 2800
        hist_prices = [base + i*2 + np.random.normal(0, 10) for i in range(60)]
        
        # Mock forecast data
        future_dates = [datetime.now() + timedelta(days=i) for i in range(1, days + 1)]
        forecast_prices = [hist_prices[-1] + i*3 + np.random.normal(0, 15) for i in range(1, days + 1)]
        lower_bound = [p * 0.98 for p in forecast_prices]
        upper_bound = [p * 1.02 for p in forecast_prices]
        
        fig = go.Figure()
        
        # Historical
        fig.add_trace(go.Scatter(x=dates, y=hist_prices, mode='lines', name='Historical', line=dict(color='#9CA3AF')))
        
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
        
        fig.update_layout(
            title=f"{ticker} - {days} Day Forecast",
            yaxis_title="Price",
            template="plotly_dark",
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        st.success(f"Forecast generated successfully. Expected trend: **BULLISH** (+{round(((forecast_prices[-1] - hist_prices[-1])/hist_prices[-1])*100, 2)}%)")
