from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def translate_text(text, source_language):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a professional translator. Translate the following text from {source_language} to English in the style of Google translate."
                },
                {
                    "role": "user",
                    "content": text
                }
            ]
        )
        return {"translation": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
    