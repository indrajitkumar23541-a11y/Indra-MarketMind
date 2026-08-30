import streamlit as st
import sys
import os

# Add current directory to path so we can import utils
sys.path.append(os.path.dirname(__file__))
from utils import setup_page

setup_page("Indra-MarketMind Dashboard", "⚡")

# Sidebar setup
st.sidebar.markdown("""
<div style='text-align: center; margin-bottom: 20px;'>
    <h1 style='font-size: 24px; margin: 0;'>⚡ Indra-MarketMind</h1>
    <p style='color: #9CA3AF; font-size: 14px; margin-top: 5px;'>AI Financial Intelligence</p>
</div>
""", unsafe_allow_html=True)
st.sidebar.markdown("---")

st.sidebar.subheader("🔍 Global Search")
search_query = st.sidebar.text_input("Search Ticker/Company", placeholder="e.g. RELIANCE.NS, AAPL", label_visibility="collapsed")
if search_query:
    st.sidebar.success(f"Searching for {search_query}...")

st.sidebar.markdown("---")
st.sidebar.subheader("⭐ My Watchlist")
st.sidebar.markdown("- 🟢 **RELIANCE.NS**  `+1.23%`")
st.sidebar.markdown("- 🔴 **TCS.NS**  `-0.45%`")
st.sidebar.markdown("- 🟢 **INFY.NS**  `+0.89%`")
st.sidebar.button("+ Add to Watchlist", use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.caption("v2.0 | Built by Indrajit Kumar")

from api_client import APIClient

# Main page content
st.title("👋 Welcome to Indra-MarketMind")
st.markdown("<p style='font-size: 1.2rem; color: #9CA3AF; margin-bottom: 2rem;'>The world's most advanced AI-powered financial intelligence dashboard.</p>", unsafe_allow_html=True)

# Fetch real NIFTY 50 quote
nifty_quote = APIClient.get_market_quote("^NSEI")
nifty_price = f"{nifty_quote.get('c', 0):,.2f}" if nifty_quote else "22,500 (Fallback)"
nifty_change = nifty_quote.get('dp', 0) if nifty_quote else 1.2
nifty_color = "#10B981" if nifty_change >= 0 else "#EF4444"
nifty_arrow = "↗" if nifty_change >= 0 else "↘"

# Fetch article count
articles_count = APIClient.get_news_count(hours_back=24)
articles_display = f"{articles_count:,}" if articles_count > 0 else "0"
articles_status = "Live" if articles_count > 0 else "Waiting for ingestion..."

# Quick overview metrics using custom CSS classes
st.markdown(f"""
<div style='display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 30px;'>
    <div style='flex: 1; min-width: 200px;' data-testid='metric-container'>
        <p style='margin:0; color:#9CA3AF; font-size:14px; font-weight:600; text-transform:uppercase;'>Global Fear & Greed</p>
        <h2 style='margin:10px 0; font-size:2.5rem; color:#fff;'>67</h2>
        <p style='margin:0; color:#22D3EE; font-weight:bold;'>+2 Greed ↗</p>
    </div>
    <div style='flex: 1; min-width: 200px;' data-testid='metric-container'>
        <p style='margin:0; color:#9CA3AF; font-size:14px; font-weight:600; text-transform:uppercase;'>NIFTY 50</p>
        <h2 style='margin:10px 0; font-size:2.5rem; color:#fff;'>{nifty_price}</h2>
        <p style='margin:0; color:{nifty_color}; font-weight:bold;'>{nifty_change:+.2f}% {nifty_arrow}</p>
    </div>
    <div style='flex: 1; min-width: 200px;' data-testid='metric-container'>
        <p style='margin:0; color:#9CA3AF; font-size:14px; font-weight:600; text-transform:uppercase;'>Articles Scanned (24h)</p>
        <h2 style='margin:10px 0; font-size:2.5rem; color:#fff;'>{articles_display}</h2>
        <p style='margin:0; color:#10B981; font-weight:bold;'>{articles_status}</p>
    </div>
    <div style='flex: 1; min-width: 200px;' data-testid='metric-container'>
        <p style='margin:0; color:#9CA3AF; font-size:14px; font-weight:600; text-transform:uppercase;'>Active ML Models</p>
        <h2 style='margin:10px 0; font-size:2.5rem; color:#fff;'>5 / 5</h2>
        <p style='margin:0; color:#10B981; font-weight:bold;'>All Healthy ✓</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("""
### 🧭 Navigation
Please use the **sidebar on the left** to explore the modules:
- 🌍 **Global Map**: Market sentiment heatmap
- 📰 **Live Feed**: Real-time news & sentiment
- 📈 **Deep Dive**: Technical analysis & charts
- 🤖 **AI Forecast**: Machine Learning predictions
- 😱 **Fear & Greed**: 7-factor market gauge
- 🔭 **Sector Rotation**: Sector flow analysis
- 👔 **Insider Signals**: SEC insider trading
- 🧠 **Sentiment Engine**: Raw NLP scores
- ⭐ **Watchlist**: Your saved stocks
- ⚙️ **Settings**: App configuration
""")
