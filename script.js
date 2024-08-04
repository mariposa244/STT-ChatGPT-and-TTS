// Speech-to-Text (STT) and Text-to-Speech (TTS) functionality
const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSynthesis = window.SpeechSynthesis;

const recordBtn = document.getElementById('record-btn');
const sendBtn = document.getElementById('send-btn');
const speakBtn = document.getElementById('speak-btn');
const chatInput = document.getElementById('chat-input');
const chatDisplay = document.getElementById('chat-display');
const languageSelect = document.getElementById('language-select');

let recognition, synthesizer;
let isRecording = false;

// Initialize speech recognition and synthesis
function initSpeech() {
  recognition = new speechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  synthesizer = speechSynthesis;
}

// Handle speech recognition
function startRecording() {
  isRecording = true;
  recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
  recognition.lang = languageSelect.value;
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    chatInput.value = transcript;
  };

  recognition.onend = () => {
    isRecording = false;
    recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';
  };
}

function stopRecording() {
  isRecording = false;
  recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';
  recognition.stop();
}

// Handle sending messages to ChatGPT
async function sendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    const { ChatGPTAPI } = await import('chatgpt-api');
    const chatGPT = new ChatGPTAPI({
      apiKey: 'your-api-key-here'
    });

    const response = await chatGPT.sendMessage(message);
    displayMessage(message, response.text, 'user');
    displayMessage(response.text, response.text, 'assistant');
    chatInput.value = '';
    speakText(response.text);
  }
}

// Handle text-to-speech
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSelect.value;
  synthesizer.speak(utterance);
}

// Display messages in the chat area
function displayMessage(text, response, sender) {
  const messageElement = document.createElement('p');
  messageElement.textContent = `${sender === 'user' ? 'You: ' : 'Assistant: '}${text}`;
  messageElement.classList.add(sender);
  chatDisplay.appendChild(messageElement);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Event listeners
recordBtn.addEventListener('click', () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

sendBtn.addEventListener('click', sendMessage);

speakBtn.addEventListener('click', () => {
  speakText(chatInput.value);
});

languageSelect.addEventListener('change', () => {
  if (isRecording) {
    stopRecording();
    startRecording();
  }
});

document.getElementById('start-btn').addEventListener('click', function() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const selectedLanguage = document.getElementById('languageSelect').value;
  recognition.lang = selectedLanguage; 
  recognition.interimResults = false; 

  recognition.onstart = function() {
      console.log('Speech recognition started');
      document.getElementById('start-btn').innerText = 'Listening...';
  };

  recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById('inputText').value = transcript;
      console.log('Recognized transcript:', transcript);
  };

  recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
          alert('No speech was detected. Please try again.');
      }
  };

  recognition.onend = function() {
      console.log('Speech recognition ended');
      document.getElementById('start-btn').innerText = 'Start Recording';
  };

  console.log('Starting speech recognition');
  recognition.start();
});

document.getElementById('submitButton').addEventListener('click', async () => {
  const inputText = document.getElementById('inputText').value;
  const chatContainer = document.getElementById('chat');
  const apiKey = 'YOUR API'; // Replace with your OpenAI API key

  if (!inputText.trim()) {
      return;
  }

  // Add user's message to chat
  const userMessage = document.createElement('div');
  userMessage.className = 'message user-message';
  userMessage.innerText = inputText;
  chatContainer.appendChild(userMessage);

  // Clear input
  document.getElementById('inputText').value = '';

  try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: inputText }],
              max_tokens: 150
          })
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
          // Add bot's response to chat
          const botMessage = document.createElement('div');
          botMessage.className = 'message bot-message';
          botMessage.innerText = data.choices[0].message.content.trim();
          chatContainer.appendChild(botMessage);

          // Scroll to bottom of chat
          chatContainer.scrollTop = chatContainer.scrollHeight;

          // Set text to be read out loud
          document.getElementById('inputText').value = data.choices[0].message.content.trim();
      } else {
          console.error('No response from API.');
      }
  } catch (error) {
      console.error('Error:', error);
  }
});

document.getElementById('speak-btn').addEventListener('click', function() {
  const text = document.getElementById('inputText').value;
  const selectedLanguage = document.getElementById('languageSelect').value;

  if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      speechSynthesis.speak(utterance);
  } else {
      alert('Please enter text to convert to speech.');
  }
});
