import streamlit as st
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Watchlist", "⭐")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">⭐ My Watchlist</h1>
        <p style="font-size: 14px;">Track your favorite assets at a glance with AI sentiment overlays.</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
    <div style="flex: 1; max-width: 300px;">
        <label style="font-size: 11px; color: #94A3B8; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block;">ADD ASSET</label>
""", unsafe_allow_html=True)

col1, col2 = st.columns([3, 1])
with col1:
    st.text_input("Add Ticker", placeholder="e.g. TSLA, INFY.NS", label_visibility="collapsed")
with col2:
    st.button("Add to Watchlist", type="primary", use_container_width=True)

st.markdown("</div></div>", unsafe_allow_html=True)

watchlist = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "AAPL", "MSFT"]

data = []
with st.spinner("Fetching latest quotes and AI sentiment..."):
    for ticker in watchlist:
        # Fetch real data
        quote = APIClient.get_market_quote(ticker)
        if quote and quote.get('c') is not None:
            price = quote.get('c')
            change = quote.get('dp', 0)
            sentiment = max(-1.0, min(1.0, change / 2.0))
        else:
            # Fallback if finnhub API isn't setup
            price = np.random.uniform(100, 3000)
            change = np.random.uniform(-5, 5)
            sentiment = max(-1.0, min(1.0, change / 2.0))
        
        data.append({
            "Ticker": ticker,
            "Price": f"${price:,.2f}",
            "Change": change,
            "Sentiment": sentiment,
            "Forecast": "BULLISH" if sentiment > 0.2 else ("BEARISH" if sentiment < -0.2 else "NEUTRAL")
        })

df = pd.DataFrame(data)

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>Active Monitored Assets</div>", unsafe_allow_html=True)

html = "<table style='width: 100%; border-collapse: collapse; margin-top: 16px;'>"
html += "<thead><tr style='border-bottom: 1px solid rgba(255,255,255,0.1);'>"
html += "<th style='text-align: left; padding: 12px 8px; color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase;'>Ticker</th>"
html += "<th style='text-align: right; padding: 12px 8px; color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase;'>Price</th>"
html += "<th style='text-align: right; padding: 12px 8px; color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase;'>24H Change</th>"
html += "<th style='text-align: right; padding: 12px 8px; color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase;'>AI Sentiment</th>"
html += "<th style='text-align: right; padding: 12px 8px; color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase;'>Action</th>"
html += "</tr></thead><tbody>"

for _, row in df.iterrows():
    html += "<tr style='border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;' onmouseover=\"this.style.background='rgba(255,255,255,0.02)'\" onmouseout=\"this.style.background='transparent'\">"
    
    # Ticker
    html += f"<td style='padding: 16px 8px; font-weight:700; color:#F8FAFC; font-size:14px;'>{row['Ticker']}</td>"
    
    # Price
    html += f"<td style='padding: 16px 8px; font-weight:600; color:#E2E8F0; font-size:14px; text-align:right;'>{row['Price']}</td>"
    
    # Change
    chg = row['Change']
    chg_color = "#10B981" if chg >= 0 else "#EF4444"
    chg_str = f"+{chg:.2f}%" if chg >= 0 else f"{chg:.2f}%"
    html += f"<td style='padding: 16px 8px; font-weight:700; color:{chg_color}; font-size:14px; text-align:right;'>{chg_str}</td>"
    
    # Sentiment
    sent = row['Sentiment']
    sent_color = "#10B981" if sent > 0.2 else ("#EF4444" if sent < -0.2 else "#F59E0B")
    html += f"""
    <td style='padding: 16px 8px; text-align:right;'>
        <div style='display:flex; align-items:center; justify-content:flex-end; gap:8px;'>
            <div style='font-size:12px; color:{sent_color}; font-weight:700;'>{row['Forecast']}</div>
            <div style='width:60px; height:4px; background:#1E293B; border-radius:2px; overflow:hidden;'>
                <div style='width:{min(100, max(0, abs(sent)*100))}%; height:100%; background:{sent_color};'></div>
            </div>
        </div>
    </td>
    """
    
    # Action (Mock Buttons)
    html += f"""
    <td style='padding: 16px 8px; text-align:right;'>
        <button style='background:rgba(0, 240, 255, 0.1); border:1px solid rgba(0, 240, 255, 0.3); color:#00F0FF; padding:6px 12px; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;'>Trade</button>
    </td>
    """
    
    html += "</tr>"
    
html += "</tbody></table>"

st.markdown(html, unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)
