# Hello Jadoo 💗

Proyecto Integrador - Módulo 3

Aplicación web tipo SPA que permite interactuar con **Jadoo**, una compañera virtual educativa para estudiantes de secundaria, utilizando inteligencia artificial mediante Google Gemini.

---

## 📚 Descripción del proyecto

Hello Jadoo es una aplicación web diseñada para acompañar a estudiantes en sus actividades académicas mediante una conversación natural.

Jadoo puede:

- Resolver dudas académicas.
- Orientar al estudiante en sus tareas.
- Explicar conceptos de forma sencilla.
- Ayudar con ejercicios de matemáticas.
- Apoyar la preparación académica.
- Mantener el contexto de la conversación durante la sesión.

La aplicación utiliza una arquitectura cliente-servidor y consume la API de Google Gemini desde el backend para mantener segura la clave de acceso.

---

## ✨ Características

- SPA (Single Page Application).
- Navegación mediante History API.
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
- Integración con Google Gemini.
- API desarrollada con Node.js y Express.
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

Jadoo busca orientar al estudiante y favorecer el aprendizaje, evitando simplemente proporcionar respuestas sin explicación cuando se trata de actividades académicas.

---

## 🛠️ Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Vite
- History API
- Fetch API

### Backend

- Node.js
- Express
- Google Gemini API
- PostgreSQL

### Pruebas

- Vitest

### Control de versiones

- Git
- GitHub

### Despliegue

- Vercel

---

## 📁 Estructura del proyecto

```text
PI_M3_HelloJadoo/
│
├── api/
│   ├── app.js
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
└── vite.config.js

```

---

## ⚙️ Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/jhovany50-lab/PI_M3_HelloJadoo.git
```

### 2. Entrar al proyecto

```bash
cd PI_M3_HelloJadoo
```

### 3. Instalar dependencias

```bash
npm install
```

---

## 🔐 Variables de entorno

El proyecto utiliza variables de entorno para evitar exponer información sensible.

Crear un archivo:

```text
.env
```

a partir de:

```text
.env.example
```

Las variables utilizadas son:

```env
GEMINI_API_KEY=tu_api_key_aqui

DB_HOST=localhost
DB_PORT=5432
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

### Importante

El archivo `.env` **no debe subirse a GitHub**.

El proyecto incluye `.gitignore` para evitar publicar las credenciales.

---

## ▶️ Ejecutar el proyecto en desarrollo

### Frontend

```bash
npm run dev
```

### Backend

En otra terminal:

```bash
node api/server-pi-local.js
```

El backend estará disponible en:

```text
http://localhost:3000
```

---

## 🧪 Ejecutar las pruebas

Para ejecutar las pruebas unitarias:

```bash
npm test
```

Actualmente el proyecto cuenta con pruebas para:

- Normalización de mensajes.
- Validación de mensajes.
- Mensajes vacíos.
- Construcción del historial.
- Construcción de solicitudes para el chat.

---

## 🏗️ Construcción para producción

Para generar la versión de producción:

```bash
npm run build
```

Los archivos generados se encuentran en:

```text
dist/
```

---

## 🤖 Uso de inteligencia artificial

La aplicación utiliza **Google Gemini** como motor de inteligencia artificial para generar las respuestas de Jadoo.

La comunicación con Gemini se realiza desde el backend.

La clave `GEMINI_API_KEY` **no se encuentra en el frontend** y se obtiene mediante variables de entorno.

El backend utiliza un contexto de sistema para definir:

- Personalidad de Jadoo.
- Público objetivo.
- Forma de comunicación.
- Orientación educativa.
- Manejo del contexto de conversación.
- Restricciones de seguridad.

---

## 🧪 Registro de uso de IA

Durante el desarrollo se utilizó inteligencia artificial como herramienta de apoyo para:

- Análisis de errores.
- Revisión de código.
- Diseño de arquitectura.
- Implementación de funcionalidades.
- Generación y revisión de pruebas.
- Integración con Google Gemini.
- Mejoras de interfaz y experiencia de usuario.
- Documentación del proyecto.

Las decisiones finales, integración, pruebas y validación del código fueron realizadas durante el desarrollo del proyecto.

---

## 📱 Diseño responsive

La aplicación fue desarrollada con enfoque mobile-first y utiliza:

- Flexbox.
- CSS Grid.
- Media queries.

Se contempla la revisión de la interfaz en:

- 📱 Dispositivos móviles.
- 📱 Tablets.
- 💻 Escritorio.

---

## 🚀 Despliegue

El proyecto será desplegado mediante Vercel.

### URL pública

```text
Pendiente de despliegue
```

---

## 📸 Evidencias

Durante la entrega se incluirán capturas de:

- Página de inicio.
- Chat con Jadoo.
- Indicador `escribiendo...`.
- Página About.
- Vista responsive móvil.
- Vista responsive tablet.
- Vista responsive escritorio.
- Ejecución de pruebas.
- Aplicación desplegada.

---

## 👨‍💻 Autor

**Jhovany Rodríguez de la Rosa**

Proyecto Integrador - Módulo 3

Hello Jadoo 💗