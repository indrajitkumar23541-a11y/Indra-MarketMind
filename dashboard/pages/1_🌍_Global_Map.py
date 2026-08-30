import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np
import sys
import os

# Add current directory to path so we can import utils
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils import setup_page
from api_client import APIClient

setup_page("Global Sentiment Map", "🌍")

st.markdown("""
<div class="hero-container" style="padding: 24px; margin-bottom: 24px;">
    <div class="hero-text">
        <h1 style="font-size: 28px; margin: 0;">🌍 Global Market Sentiment</h1>
        <p style="font-size: 14px;">Real-time sentiment aggregation across major global indices and stocks.</p>
    </div>
</div>
""", unsafe_allow_html=True)

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
    'BRA': '^BVSP',   # Bovespa
    'CHN': '000001.SS' # Shanghai
}

countries = []
sentiment_scores = []
statuses = []
changes = []

with st.spinner("Fetching global market data..."):
    for country, ticker in country_index_map.items():
        quote = APIClient.get_market_quote(ticker)
        countries.append(country)
        if quote and quote.get('dp') is not None:
            score = max(-1.0, min(1.0, quote.get('dp') / 1.5)) # Scale for visibility
            sentiment_scores.append(score)
            changes.append(quote.get('dp'))
            statuses.append(f"Bullish" if score > 0 else f"Bearish")
        else:
            # Fallback to neutral if API fails
            score = 0.0
            sentiment_scores.append(score)
            changes.append(score)
            statuses.append("Unknown")

df_map = pd.DataFrame({
    'Country': countries,
    'Sentiment': sentiment_scores,
    'Status': statuses,
    'Change': changes
})

st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>Global Intensity Heatmap</div>", unsafe_allow_html=True)

# Create Choropleth map using Plotly with custom Fintech colors
fig = px.choropleth(
    df_map, 
    locations="Country", 
    color="Sentiment",
    hover_name="Country",
    hover_data={"Status": True, "Sentiment": False, "Change": ':.2f'},
    color_continuous_scale=[[0.0, '#EF4444'], [0.5, '#1E293B'], [1.0, '#10B981']],
    range_color=[-1, 1]
)

# Dark theme layout for Plotly
fig.update_layout(
    geo=dict(
        showframe=False,
        showcoastlines=True,
        coastlinecolor='rgba(255,255,255,0.1)',
        projection_type='equirectangular',
        bgcolor='rgba(0,0,0,0)',
        lakecolor='#05070D',
        landcolor='#0F172A'
    ),
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    font=dict(color='#F8FAFC', family='Inter'),
    margin=dict(l=0, r=0, t=0, b=0),
    height=500
)

st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
st.markdown("</div>", unsafe_allow_html=True)

# Detail Table
st.markdown("<div class='panel'>", unsafe_allow_html=True)
st.markdown("<div class='panel-title'>Top Movers by Country</div>", unsafe_allow_html=True)
st.dataframe(
    df_map.sort_values(by="Sentiment", ascending=False).style.background_gradient(
        cmap='coolwarm', subset=['Sentiment']
    ).format({'Sentiment': '{:.2f}', 'Change': '{:+.2f}%'}),
    use_container_width=True,
    hide_index=True
)
st.markdown("</div>", unsafe_allow_html=True)
