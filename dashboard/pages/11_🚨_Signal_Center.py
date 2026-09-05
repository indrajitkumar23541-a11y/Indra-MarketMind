import streamlit as st
import pandas as pd
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from components.alert_card import render_alert_card

setup_page("Signal Center", "🚨")

st.markdown("""
<div>
    <h1>🚨 Signal <span style='color: #00F0FF;'>Center</span></h1>
    <p style='color: #94A3B8;'>Real-time AI alerts, trend shifts, and institutional flow signals.</p>
</div>
""", unsafe_allow_html=True)

st.markdown("### 🔔 Live Alerts Stream")

col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("<div class='panel'>", unsafe_allow_html=True)
    
    render_alert_card(
        title="Bullish Alert: Market Momentum Shift", 
        message="Market sentiment has turned significantly more positive in the last 2 hours. Institutional flow detected in Banking sector.", 
        alert_type="bullish", 
        time_ago="3m ago"
    )
    
    render_alert_card(
        title="Bearish Alert: VIX Spike", 
        message="Volatility index proxy is showing a sudden 15% spike. AI models predict short-term downward pressure.", 
        alert_type="bearish", 
        time_ago="45m ago"
    )
    
    render_alert_card(
        title="Sector Rotation: Tech to Healthcare", 
        message="Money flow algorithm detects sustained capital movement out of IT and into defensive Healthcare stocks over the last 48 hours.", 
        alert_type="warning", 
        time_ago="2h ago"
    )
    
    render_alert_card(
        title="Earnings Beat: RELIANCE.NS", 
        message="Reliance Industries reported Q3 earnings 12% above estimates. Sentiment models reached 0.94 (Extreme Bullish).", 
        alert_type="bullish", 
        time_ago="4h ago"
    )
    
    st.markdown("</div>", unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class='panel' style='padding: 20px;'>
        <div class='panel-title'>Signal Filters</div>
        <div style='margin-bottom: 15px;'>
            <label style='font-size: 13px; color: #94A3B8;'>Signal Type</label>
            <div style='display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;'>
                <button style='background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #10B981; padding: 4px 12px; border-radius: 4px; font-size: 12px;'>Bullish</button>
                <button style='background: rgba(239, 68, 68, 0.2); border: 1px solid #EF4444; color: #EF4444; padding: 4px 12px; border-radius: 4px; font-size: 12px;'>Bearish</button>
                <button style='background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #F59E0B; padding: 4px 12px; border-radius: 4px; font-size: 12px;'>Warnings</button>
            </div>
        </div>
        
        <div style='margin-bottom: 15px;'>
            <label style='font-size: 13px; color: #94A3B8;'>Source</label>
            <div style='display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;'>
                <button style='background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;'>News AI</button>
                <button style='background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;'>Social</button>
                <button style='background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;'>Price/Vol</button>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
