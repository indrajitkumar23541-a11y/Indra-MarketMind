import streamlit as st
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Fear & Greed", "😱")

st.title("😱 Market Fear & Greed Index")
st.markdown("7-factor proprietary emotional gauge of the market.")

# Gauge Chart
current_score = 67
fig = go.Figure(go.Indicator(
    mode = "gauge+number",
    value = current_score,
    title = {'text': "Fear & Greed Index"},
    gauge = {
        'axis': {'range': [0, 100]},
        'bar': {'color': "white"},
        'steps': [
            {'range': [0, 25], 'color': "#F43F5E", 'name': "Extreme Fear"},
            {'range': [25, 45], 'color': "#FB923C", 'name': "Fear"},
            {'range': [45, 55], 'color': "#9CA3AF", 'name': "Neutral"},
            {'range': [55, 75], 'color': "#34D399", 'name': "Greed"},
            {'range': [75, 100], 'color': "#22D3EE", 'name': "Extreme Greed"}
        ],
    }
))

fig.update_layout(
    template="plotly_dark",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)'
)

st.plotly_chart(fig, use_container_width=True)

st.subheader("7-Factor Breakdown")
col1, col2 = st.columns(2)

with col1:
    st.progress(0.8, text="1. Market Momentum (S&P vs 125-day MA) - Greed")
    st.progress(0.7, text="2. Stock Price Strength (52-week Highs vs Lows) - Greed")
    st.progress(0.9, text="3. Stock Price Breadth (McClellan Volume) - Extreme Greed")
    st.progress(0.4, text="4. Put and Call Options (Put/Call Ratio) - Fear")

with col2:
    st.progress(0.6, text="5. Market Volatility (VIX) - Greed")
    st.progress(0.5, text="6. Safe Haven Demand (Stock vs Bond Returns) - Neutral")
    st.progress(0.75, text="7. Junk Bond Demand (Yield Spread) - Greed")
