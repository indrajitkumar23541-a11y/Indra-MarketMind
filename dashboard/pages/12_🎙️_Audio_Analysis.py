import streamlit as st
import requests
import json

st.set_page_config(page_title="Audio Analysis", page_icon="🎙️", layout="wide")

st.title("🎙️ Earnings Call & Audio Sentiment")
st.markdown("Upload a corporate earnings call, Fed speech, or paste a YouTube link to transcribe and analyze market sentiment using Groq's Whisper API.")

MULTIMODAL_API_URL = "http://multimodal-service:8008"

def display_sentiment(sentiment_data):
    if "error" in sentiment_data:
        st.error(f"Sentiment Analysis Error: {sentiment_data['error']}")
        return
        
    st.subheader("📊 Sentiment Analysis")
    label = sentiment_data.get("label", "UNKNOWN")
    score = sentiment_data.get("score", 0.0)
    
    if label == "BULLISH":
        color = "green"
    elif label == "BEARISH":
        color = "red"
    else:
        color = "gray"
        
    st.markdown(f"### <span style='color:{color}'>{label}</span>", unsafe_allow_html=True)
    st.progress(score)
    st.caption(f"Confidence Score: {score:.2f}")

tab1, tab2 = st.tabs(["Upload Audio File", "YouTube URL"])

with tab1:
    st.subheader("Upload Audio File (.mp3, .wav, .m4a)")
    uploaded_file = st.file_uploader("Choose a file", type=['mp3', 'wav', 'm4a'])
    
    if uploaded_file is not None:
        if st.button("Transcribe & Analyze Upload", type="primary"):
            with st.spinner("Processing audio with Groq Whisper..."):
                try:
                    files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "audio/mpeg")}
                    response = requests.post(f"{MULTIMODAL_API_URL}/transcribe/upload", files=files, timeout=60)
                    
                    if response.status_code == 200:
                        data = response.json()
                        st.success("Transcription complete!")
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.subheader("📝 Transcription")
                            st.info(data.get("transcription"))
                            
                        with col2:
                            display_sentiment(data.get("sentiment", {}))
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Connection failed: {e}")

with tab2:
    st.subheader("Paste YouTube URL")
    st.markdown("Analyze an earnings call or speech directly from YouTube.")
    yt_url = st.text_input("YouTube URL (e.g., https://youtube.com/watch?v=...)")
    
    if yt_url:
        if st.button("Extract, Transcribe & Analyze", type="primary"):
            with st.spinner("Downloading audio and transcribing... This may take a minute."):
                try:
                    payload = {"url": yt_url}
                    response = requests.post(f"{MULTIMODAL_API_URL}/transcribe/youtube", json=payload, timeout=300)
                    
                    if response.status_code == 200:
                        data = response.json()
                        st.success("Transcription complete!")
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.subheader("📝 Transcription")
                            st.info(data.get("transcription"))
                            
                        with col2:
                            display_sentiment(data.get("sentiment", {}))
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Connection failed: {e}")
