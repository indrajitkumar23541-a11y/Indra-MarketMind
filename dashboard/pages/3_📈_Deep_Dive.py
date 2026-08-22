import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Deep Dive", "📈")

st.title("📈 Deep Dive Analysis")
st.markdown("Detailed technical and sentiment analysis for a specific asset.")

ticker = st.text_input("Enter Ticker Symbol", value="RELIANCE.NS")

# Mock historical data
dates = [datetime.now() - timedelta(days=i) for i in range(100)]
dates.reverse()

# Generate realistic looking stock data
base_price = 2500
close_prices = []
for i in range(100):
    change = np.random.normal(0, 20)
    base_price += change
    close_prices.append(base_price)

df = pd.DataFrame({
    'Date': dates,
    'Open': [p - np.random.normal(0, 10) for p in close_prices],
    'High': [p + abs(np.random.normal(0, 15)) for p in close_prices],
    'Low': [p - abs(np.random.normal(0, 15)) for p in close_prices],
    'Close': close_prices,
    'Volume': [int(10000 + np.random.normal(0, 5000)) for _ in range(100)]
})

# Create Candlestick
fig = go.Figure(data=[go.Candlestick(x=df['Date'],
                open=df['Open'],
                high=df['High'],
                low=df['Low'],
                close=df['Close'])])

fig.update_layout(
    title=f"{ticker} - Last 100 Days",
    yaxis_title="Price",
    template="plotly_dark",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    xaxis_rangeslider_visible=False
)

st.plotly_chart(fig, use_container_width=True)

col1, col2, col3 = st.columns(3)
with col1:
    st.metric("RSI (14)", "45.2", "-2.1", delta_color="inverse")
with col2:
    st.metric("MACD", "12.4", "+1.2")
with col3:
    st.metric("Bollinger Band", "Middle", "Neutral", delta_color="off")
