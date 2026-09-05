import streamlit as st

def render_ticker_tape(items: list):
    """
    Render a CSS-animated scrolling ticker tape.
    items: List of dicts with 'symbol', 'price', 'change', 'color'
    """
    
    ticker_html = ""
    for item in items:
        arrow = "▲" if item['color'] == "#10B981" else "▼"
        ticker_html += f"""
        <div style="display: inline-block; margin-right: 40px; font-family: 'Space Grotesk', sans-serif;">
            <span style="font-weight: 700; color: #F8FAFC;">{item['symbol']}</span>
            <span style="color: #94A3B8; margin-left: 8px;">{item['price']}</span>
            <span style="color: {item['color']}; margin-left: 8px; font-size: 12px;">{arrow} {item['change']}</span>
        </div>
        """

    # We duplicate the content to allow infinite smooth scrolling
    html = f"""
    <style>
    @keyframes scroll {{
        0% {{ transform: translateX(0); }}
        100% {{ transform: translateX(-50%); }}
    }}
    .ticker-container {{
        width: 100%;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.6);
        border-top: 1px solid rgba(255,255,255,0.05);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding: 10px 0;
        white-space: nowrap;
        position: relative;
    }}
    .ticker-wrap {{
        display: inline-block;
        white-space: nowrap;
        animation: scroll 30s linear infinite;
    }}
    .ticker-wrap:hover {{
        animation-play-state: paused;
    }}
    </style>
    
    <div class="ticker-container">
        <div class="ticker-wrap">
            {ticker_html}
            {ticker_html}
        </div>
    </div>
    """
    
    st.markdown(html, unsafe_allow_html=True)
