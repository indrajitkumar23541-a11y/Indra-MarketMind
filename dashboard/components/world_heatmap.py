import streamlit as st
import plotly.graph_objects as go
import pandas as pd

def render_world_heatmap(data: pd.DataFrame):
    """
    Render a choropleth map showing global market sentiment.
    Expected data columns: 'country_code' (ISO 3), 'country_name', 'sentiment_score' (-1 to 1)
    """
    fig = go.Figure(data=go.Choropleth(
        locations=data['country_code'],
        z=data['sentiment_score'],
        text=data['country_name'],
        colorscale=[
            [0, '#EF4444'],    # Bearish - Red
            [0.5, '#F59E0B'],  # Neutral - Yellow
            [1, '#10B981']     # Bullish - Green
        ],
        zmin=-1,
        zmax=1,
        colorbar_title="Sentiment",
        marker_line_color='rgba(255,255,255,0.2)',
        marker_line_width=0.5
    ))

    fig.update_layout(
        geo=dict(
            showframe=False,
            showcoastlines=True,
            coastlinecolor="rgba(255,255,255,0.1)",
            projection_type='equirectangular',
            bgcolor='rgba(0,0,0,0)',
            lakecolor='rgba(0,0,0,0)',
            landcolor='rgba(255,255,255,0.05)'
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        margin=dict(l=0, r=0, t=0, b=0),
        height=400
    )

    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
