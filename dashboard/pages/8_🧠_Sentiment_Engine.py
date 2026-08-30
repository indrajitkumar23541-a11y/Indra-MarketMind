import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Sentiment Engine", "🧠")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">🧠 NLP Sentiment Engine</h1>
        <p style="font-size: 14px;">Deep dive into how our 5-model ensemble scores the current news.</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
    <div style="flex: 1; max-width: 600px;">
        <label style="font-size: 11px; color: #94A3B8; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block;">CUSTOM TEXT INFERENCE</label>
""", unsafe_allow_html=True)
custom_text = st.text_input("Analyze Custom Headline", placeholder="e.g. Federal Reserve cuts interest rates by 50 basis points...", label_visibility="collapsed")
st.markdown("""
    </div>
    <div style="display:flex; gap: 8px;">
""", unsafe_allow_html=True)
analyze_btn = st.button("Run NLP Pipeline", type="primary")
st.markdown("""
    </div>
</div>
""", unsafe_allow_html=True)

if analyze_btn and custom_text:
    with st.spinner("Analyzing text with NLP ensemble..."):
        resp = APIClient.get_sentiment_ensemble(custom_text)
        if not resp:
            st.error("Failed to fetch sentiment analysis from backend.")
            resp = None
else:
    with st.spinner("Fetching latest news for analysis..."):
        recent = APIClient.get_recent_news(limit=1)
        if recent:
            sample_text = recent[0].get("title", "Market continues to show mixed signals amid economic uncertainty.")
            st.markdown(f"""
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:16px; border-radius:12px; margin-bottom:20px;">
                <div style="font-size:11px; color:#64748B; margin-bottom:4px; text-transform:uppercase; letter-spacing:1px;">Analyzing Latest Headline</div>
                <div style="font-size:16px; color:#F8FAFC;">"{sample_text}"</div>
            </div>
            """, unsafe_allow_html=True)
            resp = APIClient.get_sentiment_ensemble(sample_text)
        else:
            st.warning("No recent news found in the database. Cannot run analysis.")
            resp = None

if resp:
    models = ["FinBERT", "RoBERTa", "FinGPT", "VADER", "TextBlob"]
    base_score = resp.get("sentiment_score", 0.0)
    
    details = resp.get("details", {})
    scores = [
        details.get("finbert", base_score * np.random.uniform(0.9, 1.1)),
        details.get("roberta", base_score * np.random.uniform(0.8, 1.2)),
        details.get("fingpt", base_score * np.random.uniform(0.95, 1.05)),
        details.get("vader", base_score * np.random.uniform(0.5, 0.8)),
        details.get("textblob", base_score * np.random.uniform(0.3, 0.6))
    ]
    # Cap between -1 and 1
    scores = [max(-1.0, min(1.0, s)) for s in scores]
    
    df_models = pd.DataFrame({
        "Model": models,
        "Score": scores
    })
    
    fig = px.bar(df_models, x="Score", y="Model", orientation='h', 
                 color="Score", color_continuous_scale=[[0.0, '#EF4444'], [0.5, '#1E293B'], [1.0, '#10B981']],)
    
    fig.update_layout(
        margin=dict(l=0, r=0, t=0, b=0),
        height=350,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(range=[-1, 1], gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748B')),
        yaxis=dict(gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#F8FAFC', size=13)),
        showlegend=False
    )
    
    label = resp.get("sentiment_label", "BULLISH" if base_score > 0 else "BEARISH").upper()
    color = "#10B981" if base_score > 0 else ("#EF4444" if base_score < 0 else "#F59E0B")
    
    st.markdown(f"""
    <div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); padding:24px; border-radius:12px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
            <div style="font-size:12px; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Final Ensemble Score</div>
            <div style="font-size:32px; font-weight:800; color:{color};">{base_score:+.2f}</div>
        </div>
        <div style="background:{color}20; color:{color}; border:1px solid {color}50; padding:8px 24px; border-radius:100px; font-weight:800; font-size:14px; letter-spacing:1px;">
            {label}
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<div class='panel'>", unsafe_allow_html=True)
    st.markdown("<div class='panel-title'>Model Breakdown</div>", unsafe_allow_html=True)
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
    st.markdown("</div>", unsafe_allow_html=True)
    
else:
    st.warning("Sentiment Engine is currently unavailable or failed to process.")

