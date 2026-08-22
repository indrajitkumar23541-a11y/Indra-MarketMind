import streamlit as st
import os

def load_css():
    """Loads the custom CSS for the premium UI."""
    css_path = os.path.join(os.path.dirname(__file__), "style.css")
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def setup_page(title: str, icon: str):
    """Standardized page setup for all dashboard pages."""
    st.set_page_config(page_title=title, page_icon=icon, layout="wide", initial_sidebar_state="expanded")
    load_css()
