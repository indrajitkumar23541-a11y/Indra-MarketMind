import streamlit as st

def render_alert_card(title: str, message: str, alert_type: str = "info", time_ago: str = "Just now"):
    \"\"\"
    Render a styled alert card using HTML/CSS.
    alert_type: "bullish", "bearish", "info", "warning"
    \"\"\"
    
    if alert_type == "bullish":
        bg_color = "rgba(16, 185, 129, 0.1)"
        border_color = "rgba(16, 185, 129, 0.3)"
        icon_color = "#10B981"
        icon_svg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>'
    elif alert_type == "bearish":
        bg_color = "rgba(239, 68, 68, 0.1)"
        border_color = "rgba(239, 68, 68, 0.3)"
        icon_color = "#EF4444"
        icon_svg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>'
    elif alert_type == "warning":
        bg_color = "rgba(245, 158, 11, 0.1)"
        border_color = "rgba(245, 158, 11, 0.3)"
        icon_color = "#F59E0B"
        icon_svg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    else:
        bg_color = "rgba(59, 130, 246, 0.1)"
        border_color = "rgba(59, 130, 246, 0.3)"
        icon_color = "#3B82F6"
        icon_svg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'

    html = f\"\"\"
    <div style="
        background: {bg_color}; 
        border: 1px solid {border_color}; 
        border-radius: 8px; 
        padding: 16px; 
        margin-bottom: 12px;
        display: flex;
        gap: 16px;
        align-items: flex-start;
    ">
        <div style="color: {icon_color}; margin-top: 2px;">
            {icon_svg}
        </div>
        <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <div style="font-weight: 600; color: {icon_color}; font-size: 14px;">{title}</div>
                <div style="font-size: 11px; color: #64748B;">{time_ago}</div>
            </div>
            <div style="font-size: 13px; color: #E2E8F0; line-height: 1.5;">
                {message}
            </div>
        </div>
    </div>
    \"\"\"
    
    st.markdown(html, unsafe_allow_html=True)
