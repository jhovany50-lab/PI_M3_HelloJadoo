import { getUserProfile } from "./welcome.js";

export function initChat() {
  const userProfile = getUserProfile();
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const messagesContainer = document.getElementById("messages");

  if (!chatForm || !messageInput || !messagesContainer) {
    return;
  }

  // Memoria de la conversación actual
  const conversationHistory = [];

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
      return;
    }

    // Mostrar mensaje del usuario
    addUserMessage(message);

    // Guardar mensaje en el historial
    conversationHistory.push({
      role: "user",
      content: message
    });

    // Limpiar input
    messageInput.value = "";

    // Mostrar estado de escritura
    showTypingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          history: conversationHistory,
          userProfile
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el servidor");
      }

      // Ocultar estado de escritura
      hideTypingIndicator();

      // Mostrar respuesta de Jadoo
      addJadooMessage(data.reply);

      // Guardar respuesta de Jadoo en el historial
      conversationHistory.push({
        role: "model",
        content: data.reply
      });

    } catch (error) {
      // Ocultar estado de escritura
      hideTypingIndicator();

      console.error("Error al comunicarse con la API:", error);

      addJadooMessage(
        "Ups 💗 No pude comunicarme con el servidor."
      );
    }
  });

  function addUserMessage(message) {
    const messageElement = document.createElement("div");

    messageElement.className = "message message-user";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = userProfile?.name || "Tú";

    const text = document.createElement("p");
    text.textContent = message;

    content.appendChild(name);
    content.appendChild(text);

    messageElement.appendChild(content);

    messagesContainer.appendChild(messageElement);

    scrollToBottom();
  }

  function showTypingIndicator() {
    const typingElement = document.createElement("div");

    typingElement.className = "message message-jadoo";
    typingElement.id = "typing-indicator";

    typingElement.innerHTML = `
      <div class="message-avatar">
        🐱
      </div>

      <div class="message-content">
        <span class="message-name">Jadoo</span>
        <p>escribiendo...</p>
      </div>
    `;

    messagesContainer.appendChild(typingElement);

    scrollToBottom();
  }

  function hideTypingIndicator() {
    const typingElement = document.getElementById("typing-indicator");

    if (typingElement) {
      typingElement.remove();
    }
  }

  function addJadooMessage(message) {
    const messageElement = document.createElement("div");

    messageElement.className = "message message-jadoo";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "🐱";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = "Jadoo";

    const text = document.createElement("p");
    text.textContent = message;

    content.appendChild(name);
    content.appendChild(text);

    messageElement.appendChild(avatar);
    messageElement.appendChild(content);

    messagesContainer.appendChild(messageElement);

    scrollToBottom();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}