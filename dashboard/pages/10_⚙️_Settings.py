import streamlit as st

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Settings", "⚙️")

st.title("⚙️ Settings & Configuration")
st.markdown("Customize your Indra-MarketMind experience.")

st.subheader("🔔 Alert Preferences")
st.toggle("Email Alerts", value=True)
st.toggle("Telegram Bot Alerts", value=True)
st.toggle("Browser Push Notifications", value=False)

st.divider()

st.subheader("🎯 Alert Thresholds")
st.slider("Notify when Sentiment is greater than (Bullish):", min_value=0.0, max_value=1.0, value=0.7)
st.slider("Notify when Sentiment is less than (Bearish):", min_value=-1.0, max_value=0.0, value=-0.6)

st.divider()

st.subheader("🔑 API Keys (Local Storage)")
st.text_input("NewsAPI Key", type="password", value="**********")
st.text_input("Finnhub API Key", type="password", value="**********")
st.text_input("Telegram Bot Token", type="password")

st.button("Save Settings")
