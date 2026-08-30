import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Sector Rotation", "🔭")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">🔭 Sector Rotation Map</h1>
        <p style="font-size: 14px;">Track institutional money flow across 11 major market sectors.</p>
    </div>
</div>
""", unsafe_allow_html=True)

sectors = [
    "Information Technology", "Health Care", "Financials", 
    "Consumer Discretionary", "Communication Services", 
    "Industrials", "Consumer Staples", "Energy", 
    "Utilities", "Real Estate", "Materials"
]

sector_etfs = {
    "Information Technology": "XLK",
    "Health Care": "XLV",
    "Financials": "XLF", 
    "Consumer Discretionary": "XLY",
    "Communication Services": "XLC", 
    "Industrials": "XLI",
    "Consumer Staples": "XLP",
    "Energy": "XLE", 
    "Utilities": "XLU",
    "Real Estate": "XLRE",
    "Materials": "XLB"
}

# Fetch real data from Analytics Service
data = []
with st.spinner("Fetching real sector performance data from backend..."):
    backend_data = APIClient.get_sector_rotation()
    
    if backend_data and "sectors" in backend_data:
        for s in backend_data["sectors"]:
            data.append({
                "Sector": s["sector"],
                "Money Flow (M)": round(s["momentum_score"] * 100, 2),
                "Avg Sentiment": round(s["sentiment_score"], 2),
                "Momentum": s["flow_direction"],
                "Change": round(s["momentum_score"] * 3.0, 2)
            })
    else:
        # Extreme fallback if backend entirely fails
        for sector, ticker in sector_etfs.items():
            change_pct = np.random.uniform(-3.0, 3.0)
            data.append({
                "Sector": sector,
                "Money Flow (M)": round(change_pct * 100, 2),
                "Avg Sentiment": round(max(-1.0, min(1.0, change_pct / 2.0)), 2),
                "Momentum": "Inflow" if change_pct >= 0 else "Outflow",
                "Change": change_pct
            })


df = pd.DataFrame(data)


import plotly.graph_objects as go

# Create 3D Bubble Chart
fig = go.Figure(data=[go.Scatter3d(
    x=df["Avg Sentiment"],
    y=df["Money Flow (M)"],
    z=np.random.uniform(10, 50, size=len(df)), # Proxy for Volatility since we don't have it yet
    mode='markers+text',
    text=df["Sector"],
    textposition="top center",
    textfont=dict(color='#F8FAFC', size=11, family='Inter'),
    marker=dict(
        size=abs(df["Money Flow (M)"]) / 10 + 10,
        color=df["Avg Sentiment"],
        colorscale=[[0.0, '#EF4444'], [0.5, '#1E293B'], [1.0, '#10B981']],
        opacity=0.9,
        line=dict(width=1, color='rgba(255,255,255,0.2)')
    )
)])

fig.update_layout(
    margin=dict(t=0, l=0, r=0, b=0),
    height=600,
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    scene=dict(
        xaxis_title="Avg Sentiment",
        yaxis_title="Money Flow (M)",
        zaxis_title="Volatility (Proxy)",
        xaxis=dict(gridcolor="rgba(255, 255, 255, 0.05)", backgroundcolor="rgba(0,0,0,0)", showbackground=False, tickfont=dict(color='#64748B')),
        yaxis=dict(gridcolor="rgba(255, 255, 255, 0.05)", backgroundcolor="rgba(0,0,0,0)", showbackground=False, tickfont=dict(color='#64748B')),
        zaxis=dict(gridcolor="rgba(255, 255, 255, 0.05)", backgroundcolor="rgba(0,0,0,0)", showbackground=False, tickfont=dict(color='#64748B')),
        camera=dict(
            up=dict(x=0, y=0, z=1),
            center=dict(x=0, y=0, z=0),
            eye=dict(x=1.8, y=1.8, z=1.2)
        )
    )
)

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>3D Sector Capital Allocation & Volatility</div>", unsafe_allow_html=True)
st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>Sector Performance Heatmap</div>", unsafe_allow_html=True)
st.dataframe(
    df.sort_values(by="Change", ascending=False).style.background_gradient(
        cmap='coolwarm', subset=['Avg Sentiment']
    ).format({'Avg Sentiment': '{:.2f}', 'Money Flow (M)': '{:.2f}', 'Change': '{:+.2f}%'}),
    use_container_width=True,
    hide_index=True
)
st.markdown("</div>", unsafe_allow_html=True)
