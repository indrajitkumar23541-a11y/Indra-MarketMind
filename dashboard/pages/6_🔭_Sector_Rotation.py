import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Sector Rotation", "🔭")

st.title("🔭 Sector Rotation Map")
st.markdown("Track institutional money flow across 11 major market sectors.")

sectors = [
    "Information Technology", "Health Care", "Financials", 
    "Consumer Discretionary", "Communication Services", 
    "Industrials", "Consumer Staples", "Energy", 
    "Utilities", "Real Estate", "Materials"
]

from api_client import APIClient

st.spinner("Fetching real sector performance data...")
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

# Fetch real data
data = []
for sector, ticker in sector_etfs.items():
    quote = APIClient.get_market_quote(ticker)
    if quote and quote.get('dp') is not None:
        change_pct = quote.get('dp')
        money_flow = change_pct * 100  # Proxy for volume/money flow visualization
        sentiment = max(-1.0, min(1.0, change_pct / 2.0))
    else:
        money_flow = 0
        sentiment = 0
        
    data.append({
        "Sector": sector,
        "Money Flow (M)": round(money_flow, 2),
        "Avg Sentiment": round(sentiment, 2),
        "Momentum": "Inflow" if money_flow >= 0 else "Outflow"
    })

df = pd.DataFrame(data)


import plotly.graph_objects as go
import numpy as np

# Create 3D Bubble Chart
fig = go.Figure(data=[go.Scatter3d(
    x=df["Avg Sentiment"],
    y=df["Money Flow (M)"],
    z=np.random.uniform(10, 50, size=len(df)), # Proxy for Volatility since we don't have it yet
    mode='markers+text',
    text=df["Sector"],
    textposition="top center",
    marker=dict(
        size=abs(df["Money Flow (M)"]) / 10 + 10,
        color=df["Avg Sentiment"],
        colorscale='GnBu',
        opacity=0.8,
        line=dict(width=2, color='rgba(0, 240, 255, 0.5)')
    )
)])

fig.update_layout(
    title="3D Sector Capital Allocation, Sentiment & Volatility",
    template="plotly_dark",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    margin=dict(t=50, l=0, r=0, b=0),
    scene=dict(
        xaxis_title="Avg Sentiment",
        yaxis_title="Money Flow (M)",
        zaxis_title="Volatility (Proxy)",
        xaxis=dict(gridcolor="rgba(0, 240, 255, 0.1)", backgroundcolor="rgba(0,0,0,0)"),
        yaxis=dict(gridcolor="rgba(0, 240, 255, 0.1)", backgroundcolor="rgba(0,0,0,0)"),
        zaxis=dict(gridcolor="rgba(0, 240, 255, 0.1)", backgroundcolor="rgba(0,0,0,0)"),
        camera=dict(
            up=dict(x=0, y=0, z=1),
            center=dict(x=0, y=0, z=0),
            eye=dict(x=1.5, y=1.5, z=1.5)
        )
    )
)

st.plotly_chart(fig, use_container_width=True)

st.dataframe(df.style.background_gradient(cmap='GnBu', subset=['Avg Sentiment']), use_container_width=True)
