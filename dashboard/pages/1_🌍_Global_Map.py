import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np
import sys
import os

# Add current directory to path so we can import utils
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page

setup_page("Global Sentiment Map", "🌍")

st.title("🌍 Global Market Sentiment")
st.markdown("Real-time sentiment aggregation across major global indices and stocks.")

from api_client import APIClient

# Generate data for the world map by fetching real indices
country_index_map = {
    'USA': '^GSPC',   # S&P 500
    'IND': '^NSEI',   # Nifty 50
    'GBR': '^FTSE',   # FTSE 100
    'CAN': '^GSPTSE', # S&P/TSX
    'AUS': '^AXJO',   # ASX 200
    'JPN': '^N225',   # Nikkei 225
    'DEU': '^GDAXI',  # DAX
    'FRA': '^FCHI',   # CAC 40
    'BRA': '^BVSP'    # Bovespa
}

countries = []
sentiment_scores = []
statuses = []

st.spinner("Fetching global market data...")
for country, ticker in country_index_map.items():
    quote = APIClient.get_market_quote(ticker)
    countries.append(country)
    if quote and quote.get('dp') is not None:
        # Use daily percentage change as a proxy for sentiment (-2% to +2% mapped to -1 to 1)
        score = max(-1.0, min(1.0, quote.get('dp') / 2.0))
        sentiment_scores.append(score)
        statuses.append(f"Bullish ({quote.get('dp'):+.2f}%)" if score > 0 else f"Bearish ({quote.get('dp'):+.2f}%)")
    else:
        sentiment_scores.append(0.0)
        statuses.append("Neutral (No Data)")

df_map = pd.DataFrame({
    'Country': countries,
    'Sentiment': sentiment_scores,
    'Status': statuses
})

# Create Choropleth map using Plotly
fig = px.choropleth(
    df_map, 
    locations="Country", 
    color="Sentiment",
    hover_name="Country",
    hover_data=["Status", "Sentiment"],
    color_continuous_scale=px.colors.diverging.RdYlGn,
    range_color=[-1, 1],
    title="Global Market Sentiment Map (Real-time)"
)

# Dark theme layout for Plotly
fig.update_layout(
    geo=dict(
        showframe=False,
        showcoastlines=True,
        projection_type='equirectangular',
        bgcolor='rgba(0,0,0,0)',
        lakecolor='#0D1117',
        landcolor='#161B22'
    ),
    paper_bgcolor='rgba(0,0,0,0)',
    font=dict(color='#FFFFFF')
)

st.plotly_chart(fig, use_container_width=True)

# Detail Table
st.subheader("Top Movers by Country")
st.dataframe(
    df_map.sort_values(by="Sentiment", ascending=False).style.background_gradient(cmap='RdYlGn', subset=['Sentiment']),
    use_container_width=True
)
