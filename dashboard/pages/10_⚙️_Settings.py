import streamlit as st
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Settings", "⚙️")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">⚙️ System Configuration</h1>
        <p style="font-size: 14px;">Customize your Indra-MarketMind AI intelligence experience.</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>🔔 Alert Preferences</div>", unsafe_allow_html=True)

st.markdown("""
<div style="font-size: 13px; color: #94A3B8; margin-bottom: 16px;">
    Choose how you want to be notified about high-confidence market signals.
</div>
""", unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)
with col1:
    st.toggle("📧 Email Alerts", value=True)
with col2:
    st.toggle("🤖 Telegram Bot Alerts", value=True)
with col3:
    st.toggle("🌐 Browser Push", value=False)
st.markdown("</div>", unsafe_allow_html=True)


st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>🎯 AI Alert Thresholds</div>", unsafe_allow_html=True)

st.markdown("""
<div style="font-size: 13px; color: #94A3B8; margin-bottom: 16px;">
    Set the sensitivity for AI-driven alerts. Lower sensitivity reduces noise but might miss early signals.
</div>
""", unsafe_allow_html=True)

col1, col2 = st.columns(2)
with col1:
    st.slider("Bullish Sentiment Threshold:", min_value=0.0, max_value=1.0, value=0.7)
with col2:
    st.slider("Bearish Sentiment Threshold:", min_value=-1.0, max_value=0.0, value=-0.6)
st.markdown("</div>", unsafe_allow_html=True)


st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>🔑 API Integrations</div>", unsafe_allow_html=True)

st.markdown("""
<div style="font-size: 13px; color: #94A3B8; margin-bottom: 16px;">
    Manage API keys securely. Keys are encrypted and stored only in your local instance.
</div>
""", unsafe_allow_html=True)

st.text_input("NewsAPI Key", type="password", value="**********")
st.text_input("Finnhub API Key", type="password", value="**********")
st.text_input("Telegram Bot Token", type="password")

st.markdown("""
<div style="display:flex; justify-content:flex-end; margin-top:20px;">
""", unsafe_allow_html=True)
st.button("Save Configuration", type="primary")
st.markdown("</div></div>", unsafe_allow_html=True)
