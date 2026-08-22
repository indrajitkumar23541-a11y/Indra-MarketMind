import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import random

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Live Feed", "📰")

st.title("📰 Live Market Feed")
st.markdown("Real-time stream of news, social media posts, and SEC filings with instant AI sentiment analysis.")

# Auto refresh toggle
refresh = st.toggle("Live Auto-Refresh", value=True)
if refresh:
    import time
    # Simulate polling (in real app, use st_autorefresh or similar)
    st.caption("Auto-refreshing every 30 seconds...")

# Mock Feed Data
def get_mock_feed():
    sources = ["Bloomberg", "Reuters", "Reddit /r/wallstreetbets", "Twitter", "SEC EDGAR"]
    feed = []
    now = datetime.now()
    
    for i in range(15):
        sentiment = random.uniform(-1, 1)
        if sentiment > 0.3:
            badge = "🟢 BULLISH"
        elif sentiment < -0.3:
            badge = "🔴 BEARISH"
        else:
            badge = "⚪ NEUTRAL"
            
        feed.append({
            "Time": (now - timedelta(minutes=random.randint(1, 60))).strftime("%H:%M"),
            "Source": random.choice(sources),
            "Headline": f"Mock headline about market event {i+1}...",
            "Sentiment": f"{sentiment:.2f} {badge}"
        })
    return pd.DataFrame(feed).sort_values(by="Time", ascending=False).reset_index(drop=True)

feed_df = get_mock_feed()

# Display Feed
for index, row in feed_df.iterrows():
    with st.container():
        col1, col2, col3 = st.columns([1, 6, 2])
        with col1:
            st.caption(f"{row['Time']} | {row['Source']}")
        with col2:
            st.markdown(f"**{row['Headline']}**")
        with col3:
            if "BULLISH" in row['Sentiment']:
                st.success(row['Sentiment'])
            elif "BEARISH" in row['Sentiment']:
                st.error(row['Sentiment'])
            else:
                st.info(row['Sentiment'])
        st.divider()
