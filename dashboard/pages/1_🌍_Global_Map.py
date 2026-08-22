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

# Generate mock data for the world map
countries = ['USA', 'IND', 'GBR', 'CAN', 'AUS', 'JPN', 'CHN', 'DEU', 'FRA', 'BRA', 'ZAF', 'MEX', 'RUS']
sentiment_scores = np.random.uniform(-1, 1, size=len(countries))

df_map = pd.DataFrame({
    'Country': countries,
    'Sentiment': sentiment_scores,
    'Status': ['Bullish' if s > 0 else 'Bearish' for s in sentiment_scores]
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
