// chatbot.js
document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotContainer = document.getElementById('chatbotContainer');
  const closeChatbot = document.getElementById('closeChatbot');
  const chatbotBody = document.getElementById('chatbotBody');
  const userMessage = document.getElementById('userMessage');
  const sendMessage = document.getElementById('sendMessage');
  
  // Configuración
  const botConfig = {
    name: "Asistente RaiRock",
    defaultResponses: {
      greeting: ["¡Hola! 😊 ¿Cómo puedo ayudarte hoy?", "¡Hola! Bienvenido a FUZZR. ¿Qué necesitas saber?"],
      price: ["Puedes ver los precios en las páginas de producto.", "¿Te interesa el precio de algún modelo en particular?"],
      shipping: ["Envíos en 2-3 días (gratis en compras >€50)", "Consulta costos de envío en nuestra política."],
      warranty: ["Garantía de 2 años en todos los productos.", "¿De qué producto necesitas información de garantía?"],
      default: ["¿Podrías reformular tu pregunta?", "Puedo ayudarte con: productos, envíos y garantías."]
    },
    responseDelay: 1000 // 1 segundo
  };
  
  // Inicialización
  function initChatbot() {
    // Event listeners
    chatbotToggle.addEventListener('click', toggleChatbot);
    closeChatbot.addEventListener('click', hideChatbot);
    userMessage.addEventListener('keypress', (e) => e.key === 'Enter' && sendUserMessage());
    sendMessage.addEventListener('click', sendUserMessage);
    
    // Posición inicial
    hideChatbot();
  }
  
  // Funciones principales
  function toggleChatbot() {
    chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'block' : 'none';
  }
  
  function hideChatbot() {
    chatbotContainer.style.display = 'none';
  }
  
  function sendUserMessage() {
    const message = userMessage.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userMessage.value = '';
    
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const response = generateResponse(message);
      addMessage(response, 'bot');
    }, botConfig.responseDelay);
  }
  
  // Funciones de ayuda
  function addMessage(text, sender) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message mb-3`;
    messageDiv.innerHTML = `
      <div class="message-bubble ${sender === 'bot' ? 'bg-white text-dark' : 'bg-primary text-white'} p-3 rounded-3 shadow-sm">
        <p class="mb-0">${text}</p>
      </div>
      <small class="text-muted d-block mt-1">${timeString}</small>
    `;
    
    chatbotBody.appendChild(messageDiv);
    scrollToBottom();
  }
  
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot-message mb-3 typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-bubble bg-white p-3 rounded-3 shadow-sm">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatbotBody.appendChild(typingDiv);
    scrollToBottom();
  }
  
  function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  }
  
  function scrollToBottom() {
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }
  
  function generateResponse(userInput) {
    const input = userInput.toLowerCase();
    const { defaultResponses } = botConfig;
    
    if (/hola|buenas|saludos/.test(input)) {
      return getRandomResponse(defaultResponses.greeting);
    } else if (/precio|coste|valor|cuánto cuesta/.test(input)) {
      return getRandomResponse(defaultResponses.price);
    } else if (/envío|entrega|enviar|recibir/.test(input)) {
      return getRandomResponse(defaultResponses.shipping);
    } else if (/garantía|devolución|reembolso/.test(input)) {
      return getRandomResponse(defaultResponses.warranty);
    } else {
      return getRandomResponse(defaultResponses.default);
    }
  }
  
  function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Iniciar el chatbot
  initChatbot();
});