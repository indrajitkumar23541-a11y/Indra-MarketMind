import streamlit as st
import pandas as pd
import random
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Insider Signals", "👔")

st.title("👔 SEC Insider Trading Signals")
st.markdown("Track what CEOs, CFOs, and major shareholders are doing with their own money.")

from api_client import APIClient

st.spinner("Fetching real SEC Edgar filings from database...")
articles = APIClient.get_recent_news(limit=50)

data = []
# Filter for SEC filings
sec_articles = [a for a in articles if "SEC" in a.get("source", "").upper()]

if not sec_articles:
    st.warning("No SEC filings found in recent data. Please trigger ingestion or wait for data.")
    # Fallback empty state
    data = [{
        "Date": "-",
        "Ticker": "-",
        "Insider Name": "-",
        "Title": "No Data",
        "Transaction Type": "-",
        "Shares": "-",
        "Value ($)": "-",
        "Signal": "⚪ Neutral"
    }]
else:
    for a in sec_articles:
        pub_time = a.get("published_at", "")[:10]
        title = a.get("title", "")
        # Very basic parsing/inference (since full Form 4 XML parsing isn't implemented in backend yet)
        txn_type = "BUY" if "purchase" in title.lower() else ("SELL" if "sale" in title.lower() else "OPTION EXERCISE")
        
        data.append({
            "Date": pub_time,
            "Ticker": "Multiple", # Not parsed from title yet
            "Insider Name": "See Filing",
            "Title": title,
            "Transaction Type": txn_type,
            "Shares": "N/A",
            "Value ($)": "N/A",
            "Signal": "🟢 Bullish" if txn_type == "BUY" else ("🔴 Bearish" if txn_type == "SELL" else "⚪ Neutral")
        })

df = pd.DataFrame(data)

# Filters
col1, col2 = st.columns(2)
with col1:
    unique_tickers = df["Ticker"].unique().tolist() if not df.empty else []
    filter_ticker = st.selectbox("Filter by Ticker", ["All"] + unique_tickers)
with col2:
    filter_type = st.selectbox("Transaction Type", ["All", "BUY", "SELL", "OPTION EXERCISE", "-"])

# Apply filters
if filter_ticker != "All":
    df = df[df["Ticker"] == filter_ticker]
if filter_type != "All":
    df = df[df["Transaction Type"] == filter_type]

def color_signal(val):
    if "Bullish" in val:
        color = '#10B981' # Green
    elif "Bearish" in val:
        color = '#EF4444' # Red
    else:
        color = '#6B7280' # Gray
    return f'color: {color}; font-weight: bold'

st.dataframe(df.style.map(color_signal, subset=['Signal']), use_container_width=True, height=600)
