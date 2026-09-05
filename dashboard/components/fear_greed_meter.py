import streamlit as st
import plotly.graph_objects as go

def render_fear_greed_meter(score: int, previous_score: int = None):
    """
    Render a custom circular dial for the Fear & Greed index (0-100).
    """
    if score <= 25:
        category = "Extreme Fear"
        color = "#EF4444"
    elif score <= 45:
        category = "Fear"
        color = "#F97316"
    elif score <= 55:
        category = "Neutral"
        color = "#F59E0B"
    elif score <= 75:
        category = "Greed"
        color = "#84CC16"
    else:
        category = "Extreme Greed"
        color = "#10B981"
        
    delta = None
    if previous_score is not None:
        delta = {'reference': previous_score, 'position': "bottom"}

    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta" if delta else "gauge+number",
        value=score,
        title={'text': category, 'font': {'size': 20, 'color': color}},
        delta=delta,
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#1E293B"},
            'bar': {'color': "rgba(255,255,255,0.8)", 'thickness': 0.2},
            'bgcolor': "rgba(0,0,0,0)",
            'borderwidth': 0,
            'steps': [
                {'range': [0, 25], 'color': '#EF4444'},
                {'range': [25, 45], 'color': '#F97316'},
                {'range': [45, 55], 'color': '#F59E0B'},
                {'range': [55, 75], 'color': '#84CC16'},
                {'range': [75, 100], 'color': '#10B981'}
            ],
            'threshold': {
                'line': {'color': "white", 'width': 4},
                'thickness': 0.75,
                'value': score
            }
        }
    ))

    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        font={'color': "white", 'family': "Arial"},
        margin=dict(l=10, r=10, t=50, b=10),
        height=250
    )

    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
