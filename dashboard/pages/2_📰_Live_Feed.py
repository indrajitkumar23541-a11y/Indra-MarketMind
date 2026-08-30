import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import random
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Live Feed", "📰")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">📰 Live Market Feed</h1>
        <p style="font-size: 14px;">Real-time stream of news, social media posts, and SEC filings with instant AI sentiment analysis.</p>
    </div>
</div>
""", unsafe_allow_html=True)

# Auto refresh toggle
st.markdown("""
<div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
    <div style="background:rgba(34, 211, 238, 0.1); border:1px solid rgba(34, 211, 238, 0.3); color:#00F0FF; padding:6px 12px; border-radius:100px; font-size:12px; font-weight:600; display:flex; align-items:center; gap:8px;">
        <div style="width:8px; height:8px; background:#00F0FF; border-radius:50%; box-shadow: 0 0 8px #00F0FF;"></div> Auto-Sync Active
    </div>
</div>
""", unsafe_allow_html=True)

def get_real_feed():
    articles = APIClient.get_recent_news(limit=15)
    feed = []
    
    if not articles:
        # Fallback empty state
        return [{"Time": "Just now", "Source": "System", "Headline": "No real data found. Please check API keys or Database connection.", "Sentiment": "NEUTRAL", "Score": 0.0}]
        
    for article in articles:
        sentiment = article.get("sentiment_score", 0.0)
        if sentiment > 0.3:
            badge = "BULLISH"
        elif sentiment < -0.3:
            badge = "BEARISH"
        else:
            badge = "NEUTRAL"
            
        pub_time_raw = article.get("published_at")
        if pub_time_raw:
            try:
                pub_time = datetime.fromisoformat(pub_time_raw.replace('Z', '+00:00')).strftime("%H:%M")
            except:
                pub_time = pub_time_raw[:5]
        else:
            pub_time = "N/A"
            
        feed.append({
            "Time": pub_time,
            "Source": article.get("source", "Unknown"),
            "Headline": article.get("title", "Untitled"),
            "Sentiment": badge,
            "Score": sentiment
        })
    return feed

with st.spinner("Fetching latest news..."):
    feed_data = get_real_feed()

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>Latest Ingested Articles & Signals</div>", unsafe_allow_html=True)

for item in feed_data:
    if item['Sentiment'] == "BULLISH":
        color = "#10B981"
        bg = "rgba(16, 185, 129, 0.1)"
    elif item['Sentiment'] == "BEARISH":
        color = "#EF4444"
        bg = "rgba(239, 68, 68, 0.1)"
    else:
        color = "#F59E0B"
        bg = "rgba(245, 158, 11, 0.1)"
        
    # Scale width of sentiment bar (0 to 1) -> 0 to 100%
    score_width = min(100, max(0, abs(item['Score']) * 100))
    if score_width == 0:
        score_width = 10 # Min width for visibility

    st.markdown(f"""
    <div style='padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; gap:16px; align-items:center;'>
        <div style='width:80px; flex-shrink:0;'>
            <div style='font-size:12px; color:#94A3B8; font-weight:600;'>{item['Time']}</div>
            <div style='font-size:11px; color:#64748B;'>{item['Source']}</div>
        </div>
        
        <div style='flex:1;'>
            <div style='font-size:14px; font-weight:500; color:#F8FAFC; margin-bottom:6px;'>{item['Headline']}</div>
        </div>
        
        <div style='width:150px; flex-shrink:0; text-align:right;'>
            <div style='display:inline-block; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:700; color:{color}; background:{bg}; margin-bottom:6px;'>
                {item['Sentiment']}
            </div>
            <div style='display:flex; align-items:center; gap:6px; justify-content:flex-end;'>
                <div style='font-size:10px; color:#64748B;'>Score: <span style='color:{color}; font-weight:600;'>{item['Score']:.2f}</span></div>
                <div style='width:50px; height:2px; background:#1E293B; border-radius:1px; overflow:hidden;'>
                    <div style='width:{score_width}%; height:100%; background:{color};'></div>
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)
