from flask import Flask, render_template, request, jsonify, send_file
from services.translation import translate_text
from services.speech import speech_to_text
from services.audio import text_to_speech
import io
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.json
    result = translate_text(data['text'], data['sourceLanguage'])
    return jsonify(result)

@app.route('/api/speech_to_text', methods=['POST'])
def convert_speech():
    audio_file = request.files.get('audio')
    if not audio_file:
        return jsonify({"error": "No audio file provided"}), 400
    result = speech_to_text(audio_file)
    return jsonify(result)

@app.route('/api/text_to_speech', methods=['POST'])
def convert_text():
    data = request.json
    audio_data = text_to_speech(data['text'])
    if isinstance(audio_data, dict) and 'error' in audio_data:
        return jsonify(audio_data), 500
    return send_file(
        io.BytesIO(audio_data),
        mimetype='audio/mpeg'
    )



if __name__ == '__main__':
    app.run(debug=True)
    