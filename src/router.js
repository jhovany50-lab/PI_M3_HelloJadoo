import { initChat } from "./chat.js";
import { initEvaluation } from "./evaluation.js";
import {
  initWelcome,
  applyUserTheme
} from "./welcome.js";

const app = document.querySelector("#app");

// ==========================================
// VISTAS DE NUESTRA APLICACIÓN
// ==========================================

const routes = {
  "/welcome": `
  <section class="welcome-page page">

    <div class="welcome-content">

      <span class="home-badge">
        ✨ ¡Bienvenida/o!
      </span>

      <h1>
        ¡Hola! 👋
        <span>Soy Jadoo</span>
      </h1>

      <p class="welcome-description">
        Antes de comenzar, quiero conocerte un poquito.
      </p>

      <form id="welcome-form" class="welcome-form">

        <fieldset>
          <legend>¿Cómo quieres que me dirija a ti?</legend>

          <div class="welcome-options">

            <label class="welcome-option">
              <input
                type="radio"
                name="gender"
                value="female"
                required
              />
              <span>🩷 Femenino</span>
            </label>

            <label class="welcome-option">
              <input
                type="radio"
                name="gender"
                value="male"
              />
              <span>💙 Masculino</span>
            </label>

            <label class="welcome-option">
              <input
                type="radio"
                name="gender"
                value="neutral"
              />
              <span>💜 De forma neutral</span>
            </label>

          </div>
        </fieldset>

        <label class="welcome-name">
          ¿Cómo te llamas? <small>(opcional)</small>

          <input
            id="student-name"
            type="text"
            maxlength="30"
            placeholder="Escribe tu nombre..."
            autocomplete="given-name"
          />
        </label>

        <button
          type="submit"
          class="btn btn-primary"
        >
          ✨ Comenzar
        </button>

      </form>

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
          Cuéntame algo y platicamos.
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
        Vamos a practicar. Tú puedes. ✨
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
  <section class="page about-page">
    <h1>ℹ️ Acerca de Hello Jadoo</h1>

    <p>
      Jadoo es una compañera virtual diseñada para estudiantes de secundaria.
      Su objetivo es acompañar, conversar y apoyar el aprendizaje de una forma
      cercana, sencilla y divertida.
    </p>

    <div class="about-grid">

      <article class="about-card">
        <h2>💗 ¿Quién es Jadoo?</h2>

        <p>
          Jadoo es una compañera virtual alegre, paciente y motivadora.
          Puede conversar con los estudiantes y acompañarlos durante sus
          actividades de aprendizaje.
        </p>
      </article>

      <article class="about-card">
        <h2>📚 ¿Cómo puede ayudar?</h2>

        <p>
          Puede explicar conceptos, ayudar a comprender tareas, practicar
          matemáticas y preparar ejercicios o pequeñas evaluaciones.
          Su objetivo es ayudar al estudiante a aprender paso a paso.
        </p>
      </article>

      <article class="about-card">
        <h2>🤖 ¿Cómo funciona?</h2>

        <p>
          Hello Jadoo utiliza JavaScript y una arquitectura SPA para la
          navegación. Las respuestas de Jadoo son generadas mediante Gemini AI
          a través de una función serverless desplegada en Vercel.
        </p>
      </article>

    </div>
  </section>
`
};


// ==========================================
// RENDERIZAR LA VISTA
// ==========================================

function renderRoute() {
  const path = window.location.pathname;

  app.innerHTML = routes[path] || routes["/home"];

  applyUserTheme();

  if (path === "/chat") {
    initChat();
  }

  if (path === "/evaluation") {
    initEvaluation();
  }

  if (path === "/welcome") {
    initWelcome();
  }
}


// ==========================================
// NAVEGACIÓN SPA
// ==========================================

function navigate(path) {
  window.history.pushState({}, "", path);
  renderRoute();
}


// ==========================================
// INTERCEPTAR ENLACES INTERNOS
// ==========================================

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");

  if (!link) return;

  event.preventDefault();

  const path = link.getAttribute("href");

  navigate(path);
});


// ==========================================
// BOTONES ATRÁS Y ADELANTE
// ==========================================

window.addEventListener("popstate", renderRoute);


// ==========================================
// RUTA INICIAL
// ==========================================

if (window.location.pathname === "/") {
  window.history.replaceState({}, "", "/welcome");
}


// ==========================================
// RENDER INICIAL
// ==========================================

renderRoute();