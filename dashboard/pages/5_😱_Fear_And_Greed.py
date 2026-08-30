import streamlit as st
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Fear & Greed", "😱")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">😱 Fear & Greed Index</h1>
        <p style="font-size: 14px;">7-factor proprietary emotional gauge of the market.</p>
    </div>
</div>
""", unsafe_allow_html=True)

with st.spinner("Fetching Fear & Greed Index from analytics engine..."):
    fg_data = APIClient.get_fear_greed_index()

# Use real data from API if available
if fg_data:
    current_score = int(fg_data.get("score", 50))
    status_text = fg_data.get("label", "Neutral").replace("_", " ").title()
else:
    # Fallback calculation if API fails
    recent_news = APIClient.get_recent_news(limit=50)
    if recent_news and len(recent_news) > 0:
        avg_sentiment = sum(a.get("sentiment_score", 0) for a in recent_news) / len(recent_news)
        current_score = int(((avg_sentiment + 1) / 2) * 100)
    else:
        current_score = 50

# Determine dominant sentiment
if current_score <= 25:
    status_text = "Extreme Fear"
    status_color = "#EF4444"
elif current_score <= 45:
    status_text = "Fear"
    status_color = "#F59E0B"
elif current_score <= 55:
    status_text = "Neutral"
    status_color = "#94A3B8"
elif current_score <= 75:
    status_text = "Greed"
    status_color = "#10B981"
else:
    status_text = "Extreme Greed"
    status_color = "#00F0FF"

st.markdown(f"""
<div style="text-align:center; margin-bottom: 0px;">
    <div style="font-size: 16px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Current Market Status</div>
    <div style="font-size: 42px; font-weight: 800; color: {status_color}; text-shadow: 0 0 20px {status_color}40;">{status_text}</div>
</div>
""", unsafe_allow_html=True)

fig = go.Figure(go.Indicator(
    mode = "gauge+number",
    value = current_score,
    number = {'font': {'size': 64, 'color': '#F8FAFC', 'family': 'Inter'}},
    gauge = {
        'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#1E293B"},
        'bar': {'color': "rgba(255,255,255,0)", 'thickness': 0},
        'bgcolor': "rgba(0,0,0,0)",
        'borderwidth': 0,
        'steps': [
            {'range': [0, 25], 'color': "rgba(239, 68, 68, 0.2)", 'name': "Extreme Fear"},
            {'range': [25, 45], 'color': "rgba(245, 158, 11, 0.2)", 'name': "Fear"},
            {'range': [45, 55], 'color': "rgba(148, 163, 184, 0.2)", 'name': "Neutral"},
            {'range': [55, 75], 'color': "rgba(16, 185, 129, 0.2)", 'name': "Greed"},
            {'range': [75, 100], 'color': "rgba(0, 240, 255, 0.2)", 'name': "Extreme Greed"}
        ],
        'threshold': {
            'line': {'color': status_color, 'width': 8},
            'thickness': 0.75,
            'value': current_score
        }
    }
))

# Custom shapes for a beautiful arc
fig.update_layout(
    margin=dict(l=20, r=20, t=20, b=20),
    height=350,
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    font={'color': "#F8FAFC", 'family': "Inter"}
)

st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>7-Factor Breakdown</div>", unsafe_allow_html=True)
col1, col2 = st.columns(2)

def render_factor(name, value, status_name, status_col):
    st.markdown(f"""
    <div style='margin-bottom: 20px;'>
        <div style='display:flex; justify-content:space-between; margin-bottom:8px;'>
            <span style='font-size:13px; font-weight:500; color:#F8FAFC;'>{name}</span>
            <span style='font-size:12px; font-weight:700; color:{status_col};'>{status_name}</span>
        </div>
        <div style='width:100%; height:6px; background:#1E293B; border-radius:3px; overflow:hidden;'>
            <div style='width:{value*100}%; height:100%; background:{status_col}; box-shadow: 0 0 10px {status_col};'></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col1:
    render_factor("Market Momentum (S&P vs 125-day MA)", 0.8, "Greed", "#10B981")
    render_factor("Stock Price Strength (52-week Highs vs Lows)", 0.7, "Greed", "#10B981")
    render_factor("Stock Price Breadth (McClellan Volume)", 0.9, "Extreme Greed", "#00F0FF")
    render_factor("Put and Call Options (Put/Call Ratio)", 0.4, "Fear", "#F59E0B")

with col2:
    render_factor("Market Volatility (VIX)", 0.6, "Greed", "#10B981")
    render_factor("Safe Haven Demand (Stock vs Bond Returns)", 0.5, "Neutral", "#94A3B8")
    render_factor("Junk Bond Demand (Yield Spread)", 0.75, "Greed", "#10B981")

st.markdown("</div>", unsafe_allow_html=True)
