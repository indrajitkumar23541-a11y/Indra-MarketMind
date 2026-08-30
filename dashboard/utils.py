import streamlit as st
import os

def load_css():
    """Loads the custom CSS for the premium UI."""
    css_path = os.path.join(os.path.dirname(__file__), "style.css")
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def render_top_nav():
    """Renders the premium top navigation bar."""
    st.markdown("""
        <div class="top-nav-bar">
            <div class="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Search stocks, news, sectors...">
                <span class="search-shortcut">Ctrl /</span>
            </div>
            <div class="profile-section">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F8FAFC" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #22D3EE, #3B82F6); display:flex; align-items:center; justify-content:center; font-weight:bold; color:white;">IK</div>
                    <div style="line-height:1.2;">
                        <div style="font-size:13px; font-weight:600; color:#F8FAFC;">Indrajit Kumar</div>
                        <div style="font-size:11px; color:#22D3EE;">Pro Plan 👑</div>
                    </div>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

def setup_page(title: str, icon: str):
    """Standardized page setup for all dashboard pages."""
    st.set_page_config(page_title=title, page_icon=icon, layout="wide", initial_sidebar_state="expanded")
    load_css()
    render_top_nav()
