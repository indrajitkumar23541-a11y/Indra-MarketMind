import streamlit as st
import sys
import os
import pandas as pd

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Multi-Language Feed", "🌐")

st.markdown(\"\"\"
<div>
    <h1>🌐 Multi-Language <span style='color: #00F0FF;'>Global Intelligence</span></h1>
    <p style='color: #94A3B8;'>Real-time AI translation and sentiment analysis across 55 languages.</p>
</div>
\"\"\", unsafe_allow_html=True)

st.markdown(\"\"\"
<div class='panel'>
    <div class='panel-title'>Global Sentiment Flow</div>
    <p style='color: #E2E8F0; font-size: 14px;'>
        Our deep-translator pipeline automatically normalizes global news into English for our transformer models.
    </p>
</div>
\"\"\", unsafe_allow_html=True)

# Fetch dynamic ingestion count
news_count = APIClient.get_news_count(hours_back=24)
st.metric("Total Global Articles Processed (24h)", f"{news_count:,}")

# Supported Languages Capability Matrix
df = pd.DataFrame([
    {"🌐 Language": "🇮🇳 Hindi", "📡 Source": "Indian news portals", "🔄 Auto-Translated": "✅ Yes", "🎯 Model Used": "xlm-roberta"},
    {"🌐 Language": "🇯🇵 Japanese", "📡 Source": "Nikkei RSS", "🔄 Auto-Translated": "✅ Yes", "🎯 Model Used": "xlm-roberta"},
    {"🌐 Language": "🇨🇳 Chinese", "📡 Source": "Sina Finance", "🔄 Auto-Translated": "✅ Yes", "🎯 Model Used": "xlm-roberta"},
    {"🌐 Language": "🇩🇪 German", "📡 Source": "Handelsblatt RSS", "🔄 Auto-Translated": "✅ Yes", "🎯 Model Used": "xlm-roberta"},
    {"🌐 Language": "🇵🇹 Portuguese", "📡 Source": "Brazil B3 news", "🔄 Auto-Translated": "✅ Yes", "🎯 Model Used": "xlm-roberta"},
    {"🌐 Language": "🇬🇧 English", "📡 Source": "All sources", "🔄 Auto-Translated": "❌ Native", "🎯 Model Used": "FinBERT + RoBERTa"}
])

st.markdown("### Supported Languages Capability")
st.dataframe(df, use_container_width=True, hide_index=True)
