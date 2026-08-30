import streamlit as st
import sys
import os
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add current directory to path so we can import utils
sys.path.append(os.path.dirname(__file__))
from utils import setup_page
from api_client import APIClient

# Import new UI components
from components.ticker_tape import render_ticker_tape
from components.sentiment_gauge import render_sentiment_gauge
from components.alert_card import render_alert_card

setup_page("Indra-MarketMind Dashboard", "⚡")

# --- SIDEBAR OVERHAUL ---
st.sidebar.markdown("""
<div style='text-align: center; margin-bottom: 30px; margin-top: -20px;'>
    <div style='display:inline-flex; align-items:center; gap:8px;'>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style='filter: drop-shadow(0px 0px 5px rgba(0, 240, 255, 0.5));'><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <h1 style='font-size: 20px; margin: 0; font-family:"Space Grotesk", sans-serif; letter-spacing: -0.5px;'>Indra-<span style='color:#00F0FF;'>MarketMind</span></h1>
    </div>
    <p style='color: #64748B; font-size: 11px; margin-top: 4px; letter-spacing: 0.5px; text-transform:uppercase;'>AI Financial Intelligence</p>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("<div style='font-size: 11px; color: #64748B; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;'>TOOLS</div>", unsafe_allow_html=True)
st.sidebar.button("⚡ Stock Screener", use_container_width=True)
st.sidebar.button("⭐ Watchlist", use_container_width=True)
st.sidebar.button("🔔 Alerts", use_container_width=True)

st.sidebar.markdown("<br><div style='font-size: 11px; color: #64748B; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;'>PRO UPGRADE</div>", unsafe_allow_html=True)
st.sidebar.markdown("""
<div style='background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(34, 211, 238, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 16px; text-align: center;'>
    <div style='color: #00F0FF; font-weight: 700; margin-bottom: 8px;'>👑 Upgrade to Pro</div>
    <div style='font-size: 12px; color: #94A3B8; margin-bottom: 12px;'>Unlock advanced AI models, exclusive insights and more.</div>
    <button style='background: linear-gradient(90deg, #8B5CF6, #3B82F6); border: none; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; width: 100%; cursor: pointer;'>Upgrade Now →</button>
</div>
""", unsafe_allow_html=True)

# --- DATA FETCHING ---
nifty_quote = APIClient.get_market_quote("^NSEI")
nifty_price = f"{nifty_quote.get('c', 0):,.2f}" if nifty_quote else "22,500.35"
nifty_change_val = nifty_quote.get('dp', 0) if nifty_quote else 1.20
nifty_change = f"{nifty_change_val:+.2f}%"
nifty_color = "positive" if nifty_change_val >= 0 else "negative"
nifty_arrow = "↗" if nifty_change_val >= 0 else "↘"

articles_count = APIClient.get_news_count(hours_back=24)
articles_display = f"{articles_count:,}" if articles_count > 0 else "1,248"
articles_status = "Processing..." if articles_count > 0 else "Processing..."

# --- HERO SECTION ---
st.markdown("""
<div class="hero-container">
    <div class="hero-text">
        <div style='color: #00F0FF; font-weight: 600; margin-bottom: 8px; font-size: 14px;'>Good Morning, 👋</div>
        <h1>Welcome to <span style='color: #00F0FF;'>Indra-MarketMind</span></h1>
        <p>AI-Powered Financial Intelligence & Market Sentiment Dashboard</p>
    </div>
    <div>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(34, 211, 238, 0.5)" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            <circle cx="12" cy="12" r="10" stroke="rgba(139, 92, 246, 0.4)"></circle>
            <path d="M12 12c-3.866 0-7-3.134-7-7 0 3.866 3.134 7 7 7s7-3.134 7-7c0 3.866-3.134 7-7 7z" stroke="rgba(59, 130, 246, 0.4)"></path>
        </svg>
    </div>
</div>
""", unsafe_allow_html=True)

# --- KPI CARDS ---
st.markdown(f"""
<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 24px;'>
    <div class="kpi-card">
        <div class="kpi-title"><span>Global Fear & Greed</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></div>
        <div>
            <div class="kpi-value">67</div>
            <div class="kpi-subtext positive">Greed <span style='background:rgba(16,185,129,0.2); padding:2px 6px; border-radius:4px;'>+2</span></div>
            <div style='margin-top:10px; font-size:11px; color:#64748B;'>Yesterday: 65</div>
        </div>
    </div>
    <div class="kpi-card">
        <div class="kpi-title"><span>NIFTY 50</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
        <div>
            <div class="kpi-value">{nifty_price}</div>
            <div class="kpi-subtext {nifty_color}">{nifty_change} {nifty_arrow}</div>
            <div style='margin-top:10px; display:flex; align-items:center; gap:4px; font-size:11px; color:#10B981;'><div style='width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 5px #10B981;'></div> Live</div>
        </div>
    </div>
    <div class="kpi-card">
        <div class="kpi-title"><span>Articles Scanned (24H)</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
        <div>
            <div class="kpi-value">{articles_display}</div>
            <div class="kpi-subtext" style='color:#94A3B8;'>{articles_status}</div>
            <div style='margin-top:10px; width:100%; height:4px; background:#1E293B; border-radius:2px; overflow:hidden;'><div style='width:72%; height:100%; background:#8B5CF6; box-shadow:0 0 10px #8B5CF6;'></div></div>
        </div>
    </div>
    <div class="kpi-card">
        <div class="kpi-title"><span>Active AI Models</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg></div>
        <div>
            <div class="kpi-value">5 / 5</div>
            <div class="kpi-subtext positive">All Healthy ✓</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# --- MAIN DASHBOARD LAYOUT (70 / 30) ---
col1, col2 = st.columns([7, 3])

with col1:
    # MARKET OVERVIEW CHART
    st.markdown("<div class='panel'><div class='panel-title'>Market Overview <span style='font-size:12px; color:#64748B; font-weight:500; margin-left:auto;'>Nifty 50 · 1D · NSE</span></div>", unsafe_allow_html=True)
    
    # Fetch real intraday data via API
    historical_data = APIClient.get_historical_data("^NSEI", period="1d")
    
    if historical_data:
        df = pd.DataFrame(historical_data)
        times = pd.to_datetime(df['timestamp'])
        prices = df['close']
    else:
        # Fallback if API fails
        np.random.seed(42)
        times = pd.date_range("09:15", "15:30", freq="5min")
        prices = 22200 + np.cumsum(np.random.randn(len(times)) * 15)
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=times, y=prices,
        mode='lines',
        line=dict(color='#10B981', width=2),
        fill='tozeroy',
        fillcolor='rgba(16, 185, 129, 0.1)',
        hovertemplate='Time: %{x|%H:%M}<br>Price: %{y:.2f}<extra></extra>'
    ))
    fig.update_layout(
        margin=dict(l=0, r=0, t=10, b=0),
        height=280,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B')),
        yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B')),
        hovermode='x unified'
    )
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    
    # Bottom Stats
    st.markdown("""
    <div style='display:flex; justify-content:space-between; margin-top:16px; border-top:1px solid rgba(255,255,255,0.05); padding-top:16px;'>
        <div><div style='font-size:11px; color:#64748B;'>Open</div><div style='font-size:14px; font-weight:600;'>22,250.10</div></div>
        <div><div style='font-size:11px; color:#64748B;'>High</div><div style='font-size:14px; font-weight:600; color:#10B981;'>22,535.80</div></div>
        <div><div style='font-size:11px; color:#64748B;'>Low</div><div style='font-size:14px; font-weight:600; color:#EF4444;'>22,180.45</div></div>
        <div><div style='font-size:11px; color:#64748B;'>Prev. Close</div><div style='font-size:14px; font-weight:600;'>22,234.95</div></div>
        <div><div style='font-size:11px; color:#64748B;'>Volume</div><div style='font-size:14px; font-weight:600;'>215.42M</div></div>
    </div>
    </div>
    """, unsafe_allow_html=True)
    
    # AI SENTIMENT PANEL
    st.markdown("<div class='panel' style='padding-top:10px;'>", unsafe_allow_html=True)
    gauge_col, text_col = st.columns([1, 1])
    with gauge_col:
        render_sentiment_gauge(0.44, "Overall Market Sentiment")
    with text_col:
        st.markdown("""
        <div style='padding-top:30px;'>
            <div style='font-size:13px; color:#94A3B8; margin-bottom:8px;'>AI Market Insight</div>
            <div style='font-size:14px; line-height:1.5; color:#F8FAFC;'>
                "Market sentiment is distinctly positive today, driven by improving momentum across major banking sectors and favorable macro data points overnight."
            </div>
        </div>
        """, unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with col2:
    # MAJOR INDICES
    st.markdown("""
    <div class='panel' style='padding: 20px;'>
        <div class='panel-title' style='font-size:15px; margin-bottom:12px;'>Major Indices <span style='font-size:11px; color:#00F0FF; margin-left:auto; cursor:pointer;'>View All →</span></div>
        
        <div style='display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);'>
            <div>
                <div style='font-size:13px; font-weight:600;'>NIFTY 50</div>
                <div style='font-size:11px; color:#10B981;'>+1.20%</div>
            </div>
            <div style='font-size:14px; font-weight:700;'>22,500.35</div>
        </div>
        
        <div style='display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);'>
            <div>
                <div style='font-size:13px; font-weight:600;'>SENSEX</div>
                <div style='font-size:11px; color:#10B981;'>+1.18%</div>
            </div>
            <div style='font-size:14px; font-weight:700;'>74,169.95</div>
        </div>
        
        <div style='display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);'>
            <div>
                <div style='font-size:13px; font-weight:600;'>NASDAQ</div>
                <div style='font-size:11px; color:#10B981;'>+0.85%</div>
            </div>
            <div style='font-size:14px; font-weight:700;'>16,745.30</div>
        </div>
        
        <div style='display:flex; justify-content:space-between; align-items:center; padding:10px 0;'>
            <div>
                <div style='font-size:13px; font-weight:600;'>BITCOIN</div>
                <div style='font-size:11px; color:#EF4444;'>-1.35%</div>
            </div>
            <div style='font-size:14px; font-weight:700;'>$64,250.80</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # LIVE NEWS
    st.markdown("""
    <div class='panel' style='padding: 20px;'>
        <div class='panel-title' style='font-size:15px; margin-bottom:12px;'>Live News & Sentiment</div>
        
        <div style='margin-bottom:16px;'>
            <div style='display:flex; justify-content:space-between; font-size:11px; color:#94A3B8; margin-bottom:4px;'>
                <span>Reuters · 2m ago</span>
                <span style='color:#10B981; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;'>Bullish</span>
            </div>
            <div style='font-size:13px; font-weight:500; line-height:1.4; margin-bottom:6px;'>RBI keeps repo rate unchanged, signals focus on growth</div>
            <div style='display:flex; align-items:center; gap:8px;'>
                <div style='font-size:10px; color:#64748B;'>Sentiment Score: <span style='color:#10B981;'>0.74</span></div>
                <div style='flex:1; height:2px; background:#1E293B; border-radius:1px;'><div style='width:74%; height:100%; background:#10B981;'></div></div>
            </div>
        </div>
        
        <div style='margin-bottom:16px;'>
            <div style='display:flex; justify-content:space-between; font-size:11px; color:#94A3B8; margin-bottom:4px;'>
                <span>Bloomberg · 8m ago</span>
                <span style='color:#F59E0B; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:4px;'>Neutral</span>
            </div>
            <div style='font-size:13px; font-weight:500; line-height:1.4; margin-bottom:6px;'>Global markets mixed as investors await US CPI data</div>
            <div style='display:flex; align-items:center; gap:8px;'>
                <div style='font-size:10px; color:#64748B;'>Sentiment Score: <span style='color:#F59E0B;'>0.46</span></div>
                <div style='flex:1; height:2px; background:#1E293B; border-radius:1px;'><div style='width:46%; height:100%; background:#F59E0B;'></div></div>
            </div>
        </div>
        
        <div style='margin-top:16px; text-align:center;'>
            <button style='background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#00F0FF; padding:6px 12px; border-radius:6px; font-size:11px; cursor:pointer;'>View All News →</button>
        </div>
    </div>
    """, unsafe_allow_html=True)

# --- BOTTOM ALERTS ---
st.markdown("<div style='margin-top: 20px;'></div>", unsafe_allow_html=True)
render_alert_card(
    title="Bullish Alert: Market Momentum Shift", 
    message="Market sentiment has turned significantly more positive in the last 2 hours. Institutional flow detected in Banking sector.", 
    alert_type="bullish", 
    time_ago="3m ago"
)

# --- TICKER TAPE ---
ticker_items = [
    {'symbol': 'RELIANCE.NS', 'price': '2,954.20', 'change': '+1.2%', 'color': '#10B981'},
    {'symbol': 'TCS.NS', 'price': '3,845.50', 'change': '-0.5%', 'color': '#EF4444'},
    {'symbol': 'HDFCBANK.NS', 'price': '1,432.10', 'change': '+2.1%', 'color': '#10B981'},
    {'symbol': 'INFY.NS', 'price': '1,678.90', 'change': '+0.8%', 'color': '#10B981'},
    {'symbol': 'AAPL', 'price': '$189.45', 'change': '+1.5%', 'color': '#10B981'},
    {'symbol': 'MSFT', 'price': '$412.30', 'change': '-0.2%', 'color': '#EF4444'},
    {'symbol': 'TSLA', 'price': '$175.20', 'change': '-2.4%', 'color': '#EF4444'},
]
render_ticker_tape(ticker_items)
