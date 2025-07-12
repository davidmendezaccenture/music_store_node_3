// chatbot.js

// HTML del chatbot
const chatbotHTML = `
<div id="zonaHoverChatbot">
  <button id="chatbotToggle" class="btn btn-primary rounded-pill position-fixed shadow-lg chatbot-toggle">
    <i class="bi bi-chat-text fs-4 me-2"></i>¿Necesitas ayuda?
  </button>
</div>
  <div id="chatbotContainer" class="position-fixed shadow-lg rounded-top-4 overflow-hidden chatbot-container" style="display:none; bottom: 70px; right: 20px; width: 320px; max-height: 500px; background: white; z-index: 1060; box-shadow: 0 4px 15px rgba(0,0,0,0.3); flex-direction: column; display: flex;">
    <div class="chatbot-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <i class="bi bi-chat-text-fill fs-4 me-2"></i>
        <h5 class="mb-0">Asistente FUZZR</h5>
      </div>
      <button id="closeChatbot" class="btn btn-sm btn-outline-light">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div id="chatbotBody" class="chatbot-body p-3 flex-grow-1 overflow-auto" style="background:#f9f9f9;">
      <div class="chat-message bot-message mb-3">
        <div class="message-bubble bg-white p-3 rounded-3 shadow-sm text-dark">
          <p class="mb-0">¡Hola! 👋 Soy el asistente de FUZZR. ¿En qué puedo ayudarte?</p>
        </div>
        <small class="text-muted d-block mt-1">Justo ahora</small>
      </div>
    </div>

    <div class="chatbot-input bg-light p-3 border-top">
      <div class="input-group">
        <input id="userMessage" type="text" class="form-control" placeholder="Escribe tu mensaje..." autocomplete="off" aria-label="Escribe tu mensaje">
        <button id="sendMessage" class="btn btn-primary" aria-label="Enviar mensaje">
          <i class="bi bi-send-fill"></i>
        </button>
      </div>
      <small class="text-muted d-block mt-2">Presiona Enter para enviar</small>
    </div>
  </div>
`;

// Inicializa el chatbot una vez que el wrapper esté disponible
function initChatbot() {
  const wrapper = document.getElementById('chatbotWrapper');
  if (!wrapper) return false;

  // Insertar HTML del chatbot
  wrapper.innerHTML = chatbotHTML;

  const toggleBtn = document.getElementById('chatbotToggle');
  const chatbotContainer = document.getElementById('chatbotContainer');
  const closeBtn = document.getElementById('closeChatbot');
  const sendBtn = document.getElementById('sendMessage');
  const userInput = document.getElementById('userMessage');
  const chatbotBody = document.getElementById('chatbotBody');

  // Estado inicial: solo mostrar el botón
  chatbotContainer.style.display = 'none';
  toggleBtn.style.display = 'inline-block';

  // Mostrar chatbot
  toggleBtn.addEventListener('click', () => {
    chatbotContainer.style.display = 'flex';
    userInput.focus();
  });

  // Cerrar chatbot
  closeBtn.addEventListener('click', () => {
    chatbotContainer.style.display = 'none';
    toggleBtn.style.display = 'inline-block';
  });

  // Añadir mensajes al chat
  function addMessage(content, sender = 'bot') {
    const time = 'Justo ahora';
    const message = `
      <div class="chat-message ${sender === 'user' ? 'user-message text-end' : 'bot-message text-start'} mb-3">
        <div class="message-bubble ${sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'} p-3 rounded-3 shadow-sm d-inline-block">
          <p class="mb-0">${content}</p>
        </div>
        <small class="text-muted d-block mt-1">${time}</small>
      </div>
    `;
    chatbotBody.insertAdjacentHTML('beforeend', message);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  // Enviar mensaje
  function sendMessage() {
    const msg = userInput.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    userInput.value = '';

    // Respuesta simulada (puedes reemplazar por llamada a API real)
    setTimeout(() => {
      addMessage(`Estoy procesando tu mensaje: "${msg}"`);
    }, 500);
  }

  // Eventos
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  return true;
}

// Espera a que el footer dinámico haya sido cargado
document.addEventListener('DOMContentLoaded', () => {
  const interval = setInterval(() => {
    const ready = initChatbot();
    if (ready) clearInterval(interval);
  }, 100);
});
