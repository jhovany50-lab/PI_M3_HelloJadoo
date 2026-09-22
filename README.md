# Hello Jadoo 💗

## Proyecto Integrador - Módulo 3

Hello Jadoo es una aplicación web tipo SPA que permite interactuar con **Jadoo**, una compañera virtual educativa para estudiantes de secundaria.

La aplicación utiliza **Google Gemini** para generar respuestas de manera conversacional y cuenta con una función serverless desplegada en **Vercel**, manteniendo la clave de acceso protegida mediante variables de entorno.

---

## 📚 Descripción del proyecto

Hello Jadoo fue desarrollada como una aplicación web orientada a acompañar a estudiantes de secundaria durante sus actividades de aprendizaje.

Jadoo puede:

- Resolver dudas académicas.
- Orientar al estudiante en sus tareas.
- Explicar conceptos de forma sencilla.
- Ayudar con ejercicios de matemáticas.
- Apoyar la preparación académica.
- Mantener el contexto de la conversación durante la sesión.
- Conversar de manera natural sobre diferentes temas.

La aplicación utiliza una arquitectura SPA para la navegación y una función serverless para comunicarse con Google Gemini sin exponer la clave de API en el frontend.

---

## ✨ Características

- SPA (Single Page Application).
- Navegación mediante History API.
- Navegación sin recargar la página.
- Soporte para los botones Atrás y Adelante del navegador.
- Rutas:
  - `/home`
  - `/chat`
  - `/about`
- Chat interactivo con Jadoo.
- Historial de conversación durante la sesión.
- Indicador de estado `escribiendo...`.
- Manejo de errores de comunicación con la API.
- Auto-scroll del área de conversación.
- Diseño responsive.
- Enfoque mobile-first.
- Integración con Google Gemini.
- Función serverless en Vercel.
- Variables de entorno para información sensible.
- Pruebas unitarias con Vitest.

---

## 🧠 Jadoo

Jadoo es una compañera virtual educativa dirigida principalmente a estudiantes de secundaria.

Su personalidad está diseñada para ser:

- Alegre.
- Amable.
- Paciente.
- Cercana.
- Motivadora.
- Divertida.

Jadoo busca acompañar al estudiante durante su aprendizaje.

Cuando el estudiante solicita ayuda con una actividad académica, Jadoo está configurada para orientar el proceso y favorecer la comprensión, en lugar de limitarse a proporcionar una respuesta inmediata.

---

## 🛠️ Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Vite
- History API
- Fetch API
- Flexbox
- CSS Grid
- Media Queries

### Inteligencia artificial

- Google Gemini
- Google GenAI SDK

### Backend y API

- Node.js
- Express
- Vercel Functions

### Pruebas

- Vitest

### Control de versiones

- Git
- GitHub

### Despliegue

- Vercel

### Entorno local

El proyecto conserva componentes de PostgreSQL utilizados durante el desarrollo y pruebas de funcionalidades académicas.

---

## 📁 Estructura del proyecto

```text
PI_M3_HelloJadoo/
│
├── api/
│   ├── app.js
│   ├── chat.js
│   ├── server.js
│   └── server-pi-local.js
│
├── db/
│   ├── config.js
│   ├── queries.js
│   └── archivos de prueba
│
├── src/
│   ├── app.js
│   ├── chat.js
│   ├── evaluation.js
│   ├── index.html
│   ├── styles.css
│   └── utils.js
│
├── tests/
│   └── prueba.test.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
├── vercel.json
└── vite.config.js