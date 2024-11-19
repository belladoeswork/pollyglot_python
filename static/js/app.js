document.addEventListener('DOMContentLoaded', () => {

lucide.createIcons();

let isRecording = false;
let isMuted = false;
let mediaRecorder = null;
let audioElement = new Audio();

const recordButton = document.getElementById('recordButton');
const muteButton = document.getElementById('muteButton');
const translateButton = document.getElementById('translateButton');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const languageSelect = document.getElementById('languageSelect');

// record 
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm' 
        });
        const chunks = [];

        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            try {
                const response = await fetch('/api/speech_to_text', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Speech to text failed');

                const data = await response.json();
                inputText.value = data.text;
                showToast('Speech converted to text');
            } catch (error) {
                console.error('Speech to text error:', error);
                showToast('Failed to convert speech to text', true);
            }
        };

        mediaRecorder.start();
        isRecording = true;
        recordButton.classList.add('recording');
        showToast('Recording started');
    } catch (error) {
        console.error('Recording error:', error);
        showToast('Failed to start recording', true);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        recordButton.classList.remove('recording');
        showToast('Recording stopped');
    }
}

// translate 
async function handleTranslate() {
    const text = inputText.value;
    const sourceLanguage = languageSelect.value;

    if (!text || !sourceLanguage) {
        showToast('Please enter text and select a language', true);
        return;
    }

    translateButton.disabled = true;
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, sourceLanguage })
        });

        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();
        outputText.value = data.translation;
        showToast('Translation complete');
        await playTranslation(data.translation);
    } catch (error) {
        console.error('Translation error:', error);
        showToast('Translation failed', true);
    } finally {
        translateButton.disabled = false;
    }
}

// playback
async function playTranslation(text) {
    if (!text || isMuted) return;

    try {
        audioElement.pause();
        const response = await fetch('/api/text_to_speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error('Text to speech failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioElement.src = url;
        await audioElement.play();
    } catch (error) {
        console.error('Text to speech error:', error);
        showToast('Failed to play translation', true);
    }
}

// upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(file.type)) {
        showToast('Please upload a text or document file (.txt, .pdf, .doc, .docx)', true);
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', true);
        return;
    }

    try {
        if (file.type === 'text/plain') {
            const text = await file.text();
            inputText.value = text;
            showToast('File uploaded successfully');
        } else {
            showToast('PDF and DOC support coming soon', false, true);
        }
    } catch (error) {
        console.error('Error reading file:', error);
        showToast('Error reading file', true);
    }
}

// notifications
function showToast(message, isError = false, isInfo = false) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-md text-white ${
        isError ? 'bg-red-500' : isInfo ? 'bg-blue-500' : 'bg-green-500'
    } transition-opacity duration-300`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

recordButton.addEventListener('click', () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    muteButton.innerHTML = `<i data-lucide="${isMuted ? 'volume-x' : 'volume-2'}" class="h-4 w-4"></i>`;
    lucide.createIcons();
    if (isMuted) {
        audioElement.pause();
    }
});

translateButton.addEventListener('click', handleTranslate);
uploadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
})