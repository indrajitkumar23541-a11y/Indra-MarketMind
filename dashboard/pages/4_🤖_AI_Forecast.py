import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("AI Forecast", "🤖")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">🤖 AI Forecasting Engine</h1>
        <p style="font-size: 14px;">Machine Learning predictions using a Hybrid Prophet + LSTM architecture.</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
    <div style="flex: 1; max-width: 300px;">
        <label style="font-size: 11px; color: #94A3B8; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block;">TARGET ASSET</label>
""", unsafe_allow_html=True)
ticker = st.text_input("Ticker Symbol", value="RELIANCE.NS", label_visibility="collapsed")
st.markdown("""
    </div>
    <div style="flex: 1; max-width: 300px;">
        <label style="font-size: 11px; color: #94A3B8; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block;">FORECAST HORIZON (DAYS)</label>
""", unsafe_allow_html=True)
days = st.slider("Forecast Horizon (Days)", min_value=1, max_value=30, value=7, label_visibility="collapsed")
st.markdown("""
    </div>
    <div style="display:flex; gap: 8px;">
""", unsafe_allow_html=True)
generate_btn = st.button("Generate AI Forecast", type="primary")
st.markdown("""
    </div>
</div>
""", unsafe_allow_html=True)

if generate_btn:
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
        fig.add_trace(go.Scatter(x=dates, y=hist_prices, mode='lines', name='Historical Data', line=dict(color='#64748B', width=2)))
        
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
            fig.add_trace(go.Scatter(x=future_dates, y=forecast_prices, mode='lines', name='AI Prediction', line=dict(color='#00F0FF', dash='dash', width=3)))
            
            # Confidence Interval
            fig.add_trace(go.Scatter(
                x=future_dates + future_dates[::-1],
                y=upper_bound + lower_bound[::-1],
                fill='toself',
                fillcolor='rgba(0, 240, 255, 0.1)',
                line=dict(color='rgba(255,255,255,0)'),
                hoverinfo="skip",
                showlegend=False,
                name='95% Confidence Interval'
            ))
            
            # Trend calculation
            trend_val = ((forecast_prices[-1] - hist_prices[-1]) / hist_prices[-1]) * 100
            trend_status = "BULLISH" if trend_val >= 0 else "BEARISH"
            trend_color = "#10B981" if trend_val >= 0 else "#EF4444"
            
            st.markdown(f"""
            <div style="background:rgba(16, 185, 129, 0.1) if {trend_val} >= 0 else rgba(239, 68, 68, 0.1); border:1px solid {trend_color}; padding:16px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="color:{trend_color}; font-weight:700; font-size:14px;">Hybrid Model Output</div>
                    <div style="color:#F8FAFC; font-size:18px; font-weight:600;">Expected Trend: {trend_status} ({trend_val:+.2f}%)</div>
                </div>
                <div style="background:{trend_color}; color:#000; font-weight:bold; padding:8px 16px; border-radius:8px;">High Confidence</div>
            </div>
            """, unsafe_allow_html=True)
            
        else:
            st.warning("Forecast engine returned no data. Displaying historical data only. Backend ML training might not be active.")
        
        fig.update_layout(
            margin=dict(l=0, r=0, t=10, b=0),
            height=450,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            xaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B')),
            yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B'), side='right'),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        
        st.markdown("<div class='panel'>", unsafe_allow_html=True)
        st.markdown(f"<div class='panel-title'>Model Inference Chart</div>", unsafe_allow_html=True)
        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
        st.markdown("</div>", unsafe_allow_html=True)
