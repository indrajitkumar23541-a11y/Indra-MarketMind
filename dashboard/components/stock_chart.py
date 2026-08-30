import streamlit as st
import plotly.graph_objects as go
import pandas as pd

def render_stock_chart(df: pd.DataFrame, ticker: str):
    \"\"\"
    Render a candlestick chart with optional sentiment overlay.
    Requires dataframe with columns: 'Date', 'Open', 'High', 'Low', 'Close'
    \"\"\"
    fig = go.Figure(data=[go.Candlestick(x=df['Date'],
                open=df['Open'],
                high=df['High'],
                low=df['Low'],
                close=df['Close'],
                increasing_line_color='#10B981', 
                decreasing_line_color='#EF4444')])

    fig.update_layout(
        title={'text': f"{ticker} Price History", 'font': {'color': '#F8FAFC'}},
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(showgrid=False, color='#94A3B8'),
        yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', color='#94A3B8'),
        margin=dict(l=40, r=40, t=40, b=40),
        height=400,
        xaxis_rangeslider_visible=False
    )
    
    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
