import streamlit as st
import pandas as pd
import random
from datetime import datetime, timedelta

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Insider Signals", "👔")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">👔 SEC Insider Trading Signals</h1>
        <p style="font-size: 14px;">Track what CEOs, CFOs, and major shareholders are doing with their own money.</p>
    </div>
</div>
""", unsafe_allow_html=True)

with st.spinner("Fetching real SEC Edgar filings from database..."):
    insider_data = APIClient.get_insider_signals(limit=15)

data = []
if insider_data and "signals" in insider_data:
    for sig in insider_data["signals"]:
        txn = sig.get("Transaction Type", "Buy")
        # Format for table
        data.append({
            "Date": sig.get("Date"),
            "Ticker": sig.get("Ticker"),
            "Insider Name": sig.get("Insider Name"),
            "Transaction Type": txn.upper(),
            "Shares": f"{sig.get('Shares', 0):,}",
            "Value ($)": sig.get("Value"),
            "Signal": "BULLISH" if txn.upper() == "BUY" else ("BEARISH" if txn.upper() == "SELL" else "NEUTRAL")
        })
else:
    # Extreme fallback if backend is down
    from datetime import datetime
    data.append({
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Ticker": "UNKNOWN",
        "Insider Name": "API Error",
        "Transaction Type": "UNKNOWN",
        "Shares": "0",
        "Value ($)": "$0",
        "Signal": "NEUTRAL"
    })

df = pd.DataFrame(data)
df = df.sort_values(by="Date", ascending=False)

# Filters
st.markdown("<div class='panel'>", unsafe_allow_html=True)
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

def render_table_html(dataframe):
    html = "<table style='width: 100%; border-collapse: collapse; margin-top: 16px;'>"
    html += "<thead><tr style='border-bottom: 1px solid rgba(255,255,255,0.1);'>"
    for col in dataframe.columns:
        html += f"<th style='text-align: left; padding: 12px 8px; color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase;'>{col}</th>"
    html += "</tr></thead><tbody>"
    
    for _, row in dataframe.iterrows():
        html += "<tr style='border-bottom: 1px solid rgba(255,255,255,0.05);'>"
        for col in dataframe.columns:
            val = row[col]
            if col == "Signal":
                if val == "BULLISH":
                    badge = f"<span style='background:rgba(16,185,129,0.1); color:#10B981; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:700;'>{val}</span>"
                elif val == "BEARISH":
                    badge = f"<span style='background:rgba(239,68,68,0.1); color:#EF4444; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:700;'>{val}</span>"
                else:
                    badge = f"<span style='background:rgba(245,158,11,0.1); color:#F59E0B; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:700;'>{val}</span>"
                html += f"<td style='padding: 12px 8px;'>{badge}</td>"
            elif col == "Transaction Type":
                color = "#10B981" if val == "BUY" else ("#EF4444" if val == "SELL" else "#F8FAFC")
                html += f"<td style='padding: 12px 8px; font-weight:600; color:{color}; font-size:13px;'>{val}</td>"
            elif col == "Ticker":
                html += f"<td style='padding: 12px 8px; font-weight:700; color:#00F0FF; font-size:13px;'>{val}</td>"
            else:
                html += f"<td style='padding: 12px 8px; color:#F8FAFC; font-size:13px;'>{val}</td>"
        html += "</tr>"
    html += "</tbody></table>"
    return html

st.markdown(render_table_html(df), unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)
