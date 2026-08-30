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

setup_page("Deep Dive", "📈")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">📈 Deep Dive Analysis</h1>
        <p style="font-size: 14px;">Detailed technical and sentiment analysis for specific assets.</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
    <div style="flex: 1; max-width: 300px;">
        <label style="font-size: 11px; color: #94A3B8; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block;">TICKER SYMBOL</label>
""", unsafe_allow_html=True)

ticker = st.text_input("Enter Ticker Symbol", value="RELIANCE.NS", label_visibility="collapsed")

st.markdown("""
    </div>
    <div style="display:flex; gap: 8px;">
        <button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#F8FAFC; padding:8px 16px; border-radius:6px; font-size:12px; cursor:pointer;">1D</button>
        <button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#F8FAFC; padding:8px 16px; border-radius:6px; font-size:12px; cursor:pointer;">1W</button>
        <button style="background:linear-gradient(90deg, #8B5CF6, #3B82F6); border:none; color:white; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">6M</button>
        <button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#F8FAFC; padding:8px 16px; border-radius:6px; font-size:12px; cursor:pointer;">1Y</button>
    </div>
</div>
""", unsafe_allow_html=True)

with st.spinner(f"Fetching historical data for {ticker}..."):
    historical_data = APIClient.get_historical_data(ticker, "6mo")

if historical_data and len(historical_data) > 0:
    df = pd.DataFrame(historical_data)
    df.columns = [c.capitalize() for c in df.columns]
    if 'Datetime' in df.columns:
        df.rename(columns={'Datetime': 'Date'}, inplace=True)
else:
    # Use dummy data so the chart always looks good for the UI demo
    st.warning("Using simulated data for UI demonstration.")
    dates = pd.date_range(end=pd.Timestamp.today(), periods=120)
    open_p = 2500 + np.random.randn(120).cumsum() * 20
    close_p = open_p + np.random.randn(120) * 15
    high_p = np.maximum(open_p, close_p) + np.abs(np.random.randn(120) * 10)
    low_p = np.minimum(open_p, close_p) - np.abs(np.random.randn(120) * 10)
    df = pd.DataFrame({'Date': dates, 'Open': open_p, 'High': high_p, 'Low': low_p, 'Close': close_p, 'Volume': np.random.randint(100000, 5000000, 120)})

# Create Candlestick
fig = go.Figure(data=[go.Candlestick(x=df['Date'],
                open=df['Open'],
                high=df['High'],
                low=df['Low'],
                close=df['Close'],
                increasing_line_color='#10B981', 
                decreasing_line_color='#EF4444',
                increasing_fillcolor='rgba(16, 185, 129, 0.8)',
                decreasing_fillcolor='rgba(239, 68, 68, 0.8)')])

fig.update_layout(
    margin=dict(l=0, r=0, t=10, b=0),
    height=400,
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    xaxis_rangeslider_visible=False,
    xaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B')),
    yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B'), side='right')
)

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown(f"<div class='panel-title'>{ticker} · Price Action</div>", unsafe_allow_html=True)
st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
st.markdown("</div>", unsafe_allow_html=True)

# Advanced Technicals
st.markdown("""
<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 24px;'>
    <div class="kpi-card">
        <div class="kpi-title"><span>RSI (14)</span></div>
        <div>
            <div class="kpi-value">45.2</div>
            <div class="kpi-subtext negative">-2.1 ↘</div>
            <div style='margin-top:10px; font-size:11px; color:#64748B;'>Status: Neutral</div>
        </div>
    </div>
    <div class="kpi-card">
        <div class="kpi-title"><span>MACD</span></div>
        <div>
            <div class="kpi-value">12.4</div>
            <div class="kpi-subtext positive">+1.2 ↗</div>
            <div style='margin-top:10px; font-size:11px; color:#64748B;'>Status: Bullish Crossover</div>
        </div>
    </div>
    <div class="kpi-card">
        <div class="kpi-title"><span>Bollinger Bands</span></div>
        <div>
            <div class="kpi-value">Middle</div>
            <div class="kpi-subtext" style="color: #F59E0B;">Squeezing</div>
            <div style='margin-top:10px; font-size:11px; color:#64748B;'>Volatility: Low</div>
        </div>
    </div>
    <div class="kpi-card">
        <div class="kpi-title"><span>VWAP</span></div>
        <div>
            <div class="kpi-value">2,845.50</div>
            <div class="kpi-subtext positive">Above Trend</div>
            <div style='margin-top:10px; font-size:11px; color:#64748B;'>Support @ 2820</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)
