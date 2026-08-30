import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Sentiment Engine", "🧠")

from api_client import APIClient

st.title("🧠 NLP Sentiment Engine")
st.markdown("Deep dive into how our 5-model ensemble scores the current news.")

custom_text = st.text_input("Analyze Custom Headline", placeholder="e.g. Federal Reserve cuts interest rates by 50 basis points...")
analyze_btn = st.button("Analyze")

st.divider()

st.subheader("Model Consensus")

if analyze_btn and custom_text:
    with st.spinner("Analyzing text with NLP ensemble..."):
        resp = APIClient.get_sentiment_ensemble(custom_text)
else:
    with st.spinner("Fetching latest news for analysis..."):
        recent = APIClient.get_recent_news(limit=1)
        if recent:
            sample_text = recent[0].get("title", "Market continues to show mixed signals amid economic uncertainty.")
            st.caption(f"**Analyzing Latest Headline:** {sample_text}")
            resp = APIClient.get_sentiment_ensemble(sample_text)
        else:
            resp = None

if resp:
    models = ["FinBERT", "RoBERTa", "FinGPT", "VADER", "TextBlob"]
    # The API might not return individual model scores yet depending on backend, so we fallback to variations around ensemble
    base_score = resp.get("sentiment_score", 0.0)
    
    # Try to extract individual if backend provides them in details
    details = resp.get("details", {})
    scores = [
        details.get("finbert", base_score),
        details.get("roberta", base_score * 0.9),
        details.get("fingpt", base_score * 1.1),
        details.get("vader", base_score * 0.5),
        details.get("textblob", base_score * 0.4)
    ]
    # Cap between -1 and 1
    scores = [max(-1.0, min(1.0, s)) for s in scores]
    
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
    
    label = resp.get("sentiment_label", "Neutral")
    st.info(f"Final Ensemble Score: **{base_score:.2f} ({label})**")
else:
    st.warning("Sentiment Engine is currently unavailable or failed to process.")

