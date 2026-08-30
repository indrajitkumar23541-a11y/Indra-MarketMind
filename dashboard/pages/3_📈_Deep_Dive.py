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

from api_client import APIClient

st.spinner(f"Fetching historical data for {ticker}...")
# Fetch real historical data
historical_data = APIClient.get_historical_data(ticker, "6mo")

if historical_data and len(historical_data) > 0:
    df = pd.DataFrame(historical_data)
    # yfinance output gives: datetime, open, high, low, close, volume (lowercase mostly via our endpoint)
    # the endpoint might return dicts with these keys. Let's ensure standard casing.
    df.columns = [c.capitalize() for c in df.columns]
    if 'Datetime' in df.columns:
        df.rename(columns={'Datetime': 'Date'}, inplace=True)
else:
    st.warning("Could not fetch real historical data. Please check if the ticker is valid or API is up. Using empty state.")
    df = pd.DataFrame(columns=["Date", "Open", "High", "Low", "Close", "Volume"])

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
