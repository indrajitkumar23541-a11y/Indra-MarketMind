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

# Generate mock data
data = []
for sector in sectors:
    money_flow = np.random.uniform(-500, 500)
    sentiment = np.random.uniform(-1, 1)
    data.append({
        "Sector": sector,
        "Money Flow (M)": round(money_flow, 2),
        "Avg Sentiment": round(sentiment, 2),
        "Momentum": "Inflow" if money_flow > 0 else "Outflow"
    })

df = pd.DataFrame(data)

# Create treemap
fig = px.treemap(
    df, 
    path=["Momentum", "Sector"], 
    values=abs(df["Money Flow (M)"]),
    color="Avg Sentiment",
    color_continuous_scale="RdYlGn",
    color_continuous_midpoint=0,
    title="Sector Capital Allocation & Sentiment"
)

fig.update_layout(
    template="plotly_dark",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    margin=dict(t=50, l=25, r=25, b=25)
)

st.plotly_chart(fig, use_container_width=True)

st.dataframe(df.style.background_gradient(cmap='RdYlGn', subset=['Avg Sentiment']), use_container_width=True)
