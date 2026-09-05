import os
import logging
from groq import Groq

logger = logging.getLogger(__name__)

# Initialize Groq client using the API key from environment
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(file_path: str) -> str:
    """
    Transcribe an audio file using Groq's whisper-large-v3 model.
    """
    logger.info(f"Transcribing audio file: {file_path}")
    try:
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(file_path, file.read()),
                model="whisper-large-v3",
                response_format="text",
                language="en"
            )
        return transcription
    except Exception as e:
        logger.error(f"Error transcribing audio with Groq: {e}")
        return ""
