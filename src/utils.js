// Normaliza un mensaje antes de enviarlo
export function normalizeMessage(message) {
  return message.trim();
}

// Comprueba si un mensaje contiene texto
export function isValidMessage(message) {
  return typeof message === "string" && message.trim().length > 0;
}

// Agrega un mensaje al historial de conversación
export function addToHistory(history, role, content) {
  return [
    ...history,
    {
      role,
      content
    }
  ];
}

// Construye el cuerpo que enviaremos a la API de Jadoo
export function buildChatRequest(message, history) {
  return {
    message,
    history
  };
}