import streamlit as st
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Watchlist", "⭐")

st.title("⭐ My Watchlist")
st.markdown("Track your favorite assets at a glance.")

watchlist = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "AAPL", "MSFT"]

data = []
for ticker in watchlist:
    price = np.random.uniform(100, 3000)
    change = np.random.uniform(-5, 5)
    sentiment = np.random.uniform(-1, 1)
    
    data.append({
        "Ticker": ticker,
        "Price": f"${price:.2f}",
        "Change %": round(change, 2),
        "Sentiment": round(sentiment, 2),
        "Forecast": "Bullish" if sentiment > 0.2 else ("Bearish" if sentiment < -0.2 else "Neutral")
    })

df = pd.DataFrame(data)

def color_change(val):
    color = '#10B981' if val > 0 else '#EF4444'
    return f'color: {color}; font-weight: bold'
    
def color_sentiment(val):
    if val > 0.2: color = '#10B981'
    elif val < -0.2: color = '#EF4444'
    else: color = '#9CA3AF'
    return f'color: {color}; font-weight: bold'

st.dataframe(
    df.style.map(color_change, subset=['Change %'])
            .map(color_sentiment, subset=['Sentiment']),
    use_container_width=True
)

st.text_input("Add Ticker")
st.button("Add to Watchlist")
