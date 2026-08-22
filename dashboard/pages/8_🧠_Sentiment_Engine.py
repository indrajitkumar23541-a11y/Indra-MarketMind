import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Sentiment Engine", "🧠")

st.title("🧠 NLP Sentiment Engine")
st.markdown("Deep dive into how our 5-model ensemble scores the current news.")

st.text_input("Analyze Custom Headline", placeholder="e.g. Federal Reserve cuts interest rates by 50 basis points...")
st.button("Analyze")

st.divider()

st.subheader("Model Consensus (Last 24h)")

models = ["FinBERT", "RoBERTa", "FinGPT", "VADER", "TextBlob"]
scores = [0.85, 0.72, 0.90, 0.45, 0.30]

df_models = pd.DataFrame({
    "Model": models,
    "Score": scores
})

fig = px.bar(df_models, x="Score", y="Model", orientation='h', 
             color="Score", color_continuous_scale="RdYlGn",
             title="Ensemble Model Breakdown")

fig.update_layout(
    template="plotly_dark",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    xaxis=dict(range=[-1, 1])
)

st.plotly_chart(fig, use_container_width=True)

st.info("Final Ensemble Score: **0.78 (Strong Bullish)** - Weighted average favoring FinBERT and FinGPT.")
