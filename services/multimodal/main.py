from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import shutil
import uuid
import requests
from .audio_processor import transcribe_audio
from .earnings_fetcher import download_youtube_audio

app = FastAPI(title="Indra-MarketMind Multi-Modal API")

SENTIMENT_SERVICE_URL = os.getenv("SENTIMENT_SERVICE_URL", "http://sentiment-service:8001/analyze")

class YouTubeRequest(BaseModel):
    url: str

def analyze_sentiment(text: str) -> dict:
    """Send transcribed text to the sentiment engine."""
    try:
        response = requests.post(SENTIMENT_SERVICE_URL, json={"text": text}, timeout=10)
        if response.status_code == 200:
            return response.json()
        return {"error": "Failed to analyze sentiment"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/transcribe/upload")
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    """Accepts an audio file upload, transcribes it, and analyzes sentiment."""
    if not file.filename.endswith(('.mp3', '.wav', '.m4a')):
        raise HTTPException(status_code=400, detail="Invalid file format. Use mp3, wav, or m4a.")
        
    temp_file = f"/tmp/{uuid.uuid4()}_{file.filename}"
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        transcription = transcribe_audio(temp_file)
        if not transcription:
            raise HTTPException(status_code=500, detail="Transcription failed")
            
        sentiment_result = analyze_sentiment(transcription)
        
        return {
            "transcription": transcription,
            "sentiment": sentiment_result
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/transcribe/youtube")
async def transcribe_youtube(request: YouTubeRequest):
    """Downloads audio from a YouTube URL, transcribes it, and analyzes sentiment."""
    temp_file = f"/tmp/{uuid.uuid4()}_yt_audio.m4a"
    try:
        audio_path = download_youtube_audio(request.url, temp_file)
        if not audio_path:
            raise HTTPException(status_code=500, detail="Failed to download YouTube audio")
            
        transcription = transcribe_audio(audio_path)
        if not transcription:
            raise HTTPException(status_code=500, detail="Transcription failed")
            
        sentiment_result = analyze_sentiment(transcription)
        
        return {
            "transcription": transcription,
            "sentiment": sentiment_result
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
