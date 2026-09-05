import os
import logging
import subprocess

logger = logging.getLogger(__name__)

def download_youtube_audio(url: str, output_path: str = "/tmp/youtube_audio.m4a") -> str:
    """
    Downloads the audio from a YouTube video or stream using yt-dlp.
    Returns the path to the downloaded file.
    """
    logger.info(f"Downloading audio from YouTube URL: {url}")
    try:
        # Construct yt-dlp command to extract best audio
        command = [
            "yt-dlp",
            "-f", "bestaudio[ext=m4a]/bestaudio",
            "--extract-audio",
            "--audio-format", "m4a",
            "-o", output_path,
            url
        ]
        
        result = subprocess.run(command, capture_output=True, text=True)
        
        if result.returncode == 0 and os.path.exists(output_path):
            logger.info("Successfully downloaded YouTube audio.")
            return output_path
        else:
            logger.error(f"Failed to download audio. Error: {result.stderr}")
            return ""
            
    except Exception as e:
        logger.error(f"Exception downloading YouTube audio: {e}")
        return ""
