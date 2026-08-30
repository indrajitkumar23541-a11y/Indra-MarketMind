import streamlit as st
import plotly.graph_objects as go

def render_sentiment_gauge(score, title="Sentiment Score"):
    \"\"\"
    Render a gauge chart for sentiment scores (-1.0 to 1.0).
    \"\"\"
    # Normalize score for the gauge (0 to 100)
    normalized_score = (score + 1) * 50
    
    if score >= 0.5:
        color = "#10B981" # Bullish (Green)
        label = "Bullish"
    elif score <= -0.5:
        color = "#EF4444" # Bearish (Red)
        label = "Bearish"
    else:
        color = "#F59E0B" # Neutral (Yellow)
        label = "Neutral"

    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=normalized_score,
        title={'text': title, 'font': {'size': 16, 'color': '#94A3B8'}},
        number={'suffix': "/100", 'font': {'size': 24, 'color': color}},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#1E293B"},
            'bar': {'color': color},
            'bgcolor': "rgba(0,0,0,0)",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 25], 'color': 'rgba(239, 68, 68, 0.2)'},
                {'range': [25, 75], 'color': 'rgba(245, 158, 11, 0.2)'},
                {'range': [75, 100], 'color': 'rgba(16, 185, 129, 0.2)'}
            ],
            'threshold': {
                'line': {'color': "white", 'width': 4},
                'thickness': 0.75,
                'value': normalized_score
            }
        }
    ))

    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        font={'color': "white", 'family': "Arial"},
        margin=dict(l=20, r=20, t=30, b=20),
        height=200
    )

    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
