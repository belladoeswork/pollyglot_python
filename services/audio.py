import os
import requests
from dotenv import load_dotenv
load_dotenv()

ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
VOICE_ID = 'XB0fDUnXU5powFXDhCwa'

def text_to_speech(text):
    try:
        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
            headers={
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            json={
                'text': text,
                'model_id': 'eleven_monolingual_v1',
                'voice_settings': {
                    'stability': 0.7,
                    'similarity_boost': 0.75,
                }
            }
        )
        
        if response.status_code != 200:
            raise Exception("Failed to convert text to speech")
            
        return response.content
    except Exception as e:
        return {"error": str(e)}
    