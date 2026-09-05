import streamlit as st
import plotly.graph_objects as go

def render_model_comparison(finbert, roberta, fingpt, vader, textblob):
    """
    Render a radar chart comparing the 5 sentiment models.
    Scores should be between -1.0 and +1.0.
    """
    categories = ['FinBERT', 'RoBERTa', 'FinGPT', 'VADER', 'TextBlob']
    
    # Scale scores from [-1, 1] to [0, 100] for better radar visualization
    scores = [(finbert + 1) * 50, (roberta + 1) * 50, (fingpt + 1) * 50, (vader + 1) * 50, (textblob + 1) * 50]

    fig = go.Figure()

    fig.add_trace(go.Scatterpolar(
        r=scores,
        theta=categories,
        fill='toself',
        fillcolor='rgba(0, 240, 255, 0.2)',
        line=dict(color='#00F0FF', width=2),
        name='Model Consensus'
    ))

    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                showticklabels=False,
                gridcolor='rgba(255, 255, 255, 0.1)',
                linecolor='rgba(255, 255, 255, 0.1)'
            ),
            angularaxis=dict(
                gridcolor='rgba(255, 255, 255, 0.1)',
                linecolor='rgba(255, 255, 255, 0.1)'
            ),
            bgcolor='rgba(0,0,0,0)'
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        showlegend=False,
        margin=dict(l=40, r=40, t=40, b=40),
        height=350,
        font=dict(color='#F8FAFC')
    )

    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
