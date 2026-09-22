import { initChat } from "./chat.js";
import { initEvaluation } from "./evaluation.js";

const app = document.querySelector("#app");

// Vistas de nuestra aplicación
const routes = {
  "/home": `
  <section class="home page">

    <div class="home-content">

      <span class="home-badge">
        ✨ ¡Bienvenida!
      </span>

      <h1>
        ¡Hola! 👋
        <span>Soy Jadoo</span>
      </h1>

      <p class="home-description">
        Tu nueva amiga para conversar, aprender
        y pasarla muy bien.
      </p>

      <a href="/chat" class="btn btn-primary" data-link>
        💬 ¡Quiero hablar!
      </a>

    </div>

    <div class="home-character" aria-label="Jadoo">
      <div class="character-card">
        <span class="character-emoji">🐱</span>
        <strong>JADOO</strong>
        <span>¡Annyeong! 💗</span>
      </div>
    </div>

  </section>
`,

  "/chat": `
  <section class="chat-page page">

    <div class="chat-header">
      <div>
        <span class="chat-badge">💬 Chat</span>

        <h1>¡Hola! Soy Jadoo 👋</h1>

        <p>
          Cuéntame algo y platicamos juntas. 💗
        </p>
      </div>

      <div class="chat-avatar">
        🐱
      </div>
    </div>

    <div class="chat-box">

      <div id="messages" class="messages">

        <div class="message message-jadoo">
          <div class="message-avatar">
            🐱
          </div>

          <div class="message-content">
            <span class="message-name">Jadoo</span>

            <p>
              ¡Annyeong! 💗 ¿Qué quieres platicar conmigo?
            </p>
          </div>
        </div>

      </div>

      <form id="chat-form" class="chat-form">

        <input
          id="message-input"
          type="text"
          placeholder="Escribe tu mensaje..."
          autocomplete="off"
        />

        <button type="submit" class="btn btn-primary">
          Enviar ➤
        </button>

      </form>

    </div>

  </section>
`,

    "/evaluation": `
  <section class="evaluation-page page">

    <div class="evaluation-header">
      <span class="chat-badge">📝 Practiquemos</span>

      <h1>Prepárate para tu examen 💗</h1>

      <p>
        Vamos a practicar juntas. Tú puedes. ✨
      </p>
    </div>

    <div id="evaluation-container" class="evaluation-container">

      <div class="evaluation-loading">
        <p>Jadoo está preparando tus preguntas... 🐱</p>
      </div>

    </div>

  </section>
`,

  "/about": `
    <section class="page">
      <h1>ℹ️ Acerca de Hello Jadoo</h1>
      <p>Conoce más sobre nuestro proyecto.</p>
    </section>
  `
};

// Renderiza la vista correspondiente a la ruta
function renderRoute() {
  const path = window.location.pathname;

  app.innerHTML = routes[path] || routes["/home"];

  if (path === "/chat") {
   initChat();
}

 if (path === "/evaluation") {
   initEvaluation();
 }
 }

// Intercepta los enlaces internos de la SPA
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");

  if (!link) return;

  event.preventDefault();

  const path = link.getAttribute("href");

  window.history.pushState({}, "", path);

  renderRoute();
});

// Detecta cuando el usuario utiliza los botones
// Atrás y Adelante del navegador
window.addEventListener("popstate", renderRoute);

if (window.location.pathname === "/") {
  window.history.replaceState({}, "", "/home");
}

// Render inicial
renderRoute();