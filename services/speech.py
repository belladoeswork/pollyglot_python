from openai import OpenAI
import os
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def speech_to_text(audio_file):
    try:
        audio_data = audio_file.read()
        
        audio_bytes = BytesIO(audio_data)
        audio_bytes.name = 'audio.mp3'

        transcription = client.audio.transcriptions.create(
            file=audio_bytes,
            model="whisper-1"
        )
        return {"text": transcription.text}
    except Exception as e:
        return {"error": str(e)}
    