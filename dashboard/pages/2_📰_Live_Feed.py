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

from api_client import APIClient

# Real Feed Data
def get_real_feed():
    articles = APIClient.get_recent_news(limit=15)
    feed = []
    
    if not articles:
        # Fallback empty state
        return pd.DataFrame([{"Time": "-", "Source": "System", "Headline": "No real data found. Please check API keys.", "Sentiment": "⚪ NEUTRAL"}])
        
    for article in articles:
        sentiment = article.get("sentiment_score", 0.0)
        if sentiment > 0.3:
            badge = "🟢 BULLISH"
        elif sentiment < -0.3:
            badge = "🔴 BEARISH"
        else:
            badge = "⚪ NEUTRAL"
            
        pub_time_raw = article.get("published_at")
        if pub_time_raw:
            try:
                # Handle isoformat or similar
                pub_time = datetime.fromisoformat(pub_time_raw.replace('Z', '+00:00')).strftime("%H:%M")
            except:
                pub_time = pub_time_raw[:5] # Fallback
        else:
            pub_time = "N/A"
            
        feed.append({
            "Time": pub_time,
            "Source": article.get("source", "Unknown"),
            "Headline": article.get("title", "Untitled"),
            "Sentiment": f"{sentiment:.2f} {badge}"
        })
    return pd.DataFrame(feed)

st.spinner("Fetching latest news...")
feed_df = get_real_feed()

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
