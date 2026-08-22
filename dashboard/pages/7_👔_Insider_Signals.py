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

# Mock Insider Data
insiders = ["Elon Musk", "Tim Cook", "Satya Nadella", "Jensen Huang", "Mark Zuckerberg"]
tickers = ["TSLA", "AAPL", "MSFT", "NVDA", "META"]
types = ["BUY", "SELL", "OPTION EXERCISE"]

data = []
now = datetime.now()
for i in range(20):
    txn_type = random.choice(types)
    shares = random.randint(1000, 500000)
    price = random.uniform(50, 500)
    value = shares * price
    
    data.append({
        "Date": (now - timedelta(days=random.randint(0, 14))).strftime("%Y-%m-%d"),
        "Ticker": random.choice(tickers),
        "Insider Name": random.choice(insiders),
        "Title": random.choice(["CEO", "CFO", "Director", "10% Owner"]),
        "Transaction Type": txn_type,
        "Shares": f"{shares:,}",
        "Value ($)": f"${value:,.2f}",
        "Signal": "🟢 Bullish" if txn_type == "BUY" else ("🔴 Bearish" if txn_type == "SELL" else "⚪ Neutral")
    })

df = pd.DataFrame(data).sort_values(by="Date", ascending=False).reset_index(drop=True)

# Filters
col1, col2 = st.columns(2)
with col1:
    filter_ticker = st.selectbox("Filter by Ticker", ["All"] + tickers)
with col2:
    filter_type = st.selectbox("Transaction Type", ["All", "BUY", "SELL"])

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
