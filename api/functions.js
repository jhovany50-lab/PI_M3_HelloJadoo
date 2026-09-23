import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default async function handler(req, res) {
  // ==========================================
  // 1. VALIDAR MÉTODO
  // ==========================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  try {
    // ==========================================
    // 2. RECIBIR DATOS DEL FRONTEND
    // ==========================================

    const {
      message,
      history = [],
      userProfile = null
    } = req.body;

    console.log("PERFIL RECIBIDO:", userProfile);

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "El mensaje es obligatorio."
      });
    }

    // ==========================================
    // 3. PREPARAR HISTORIAL
    // ==========================================

    const previousHistory = Array.isArray(history)
      ? history.slice(0, -1)
      : [];

    const recentHistory = previousHistory;

    const conversationHistory = recentHistory
      .filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "model") &&
          typeof item.content === "string"
      )
      .map((item) => ({
        role: item.role,
        parts: [
          {
            text: item.content
          }
        ]
      }));

    // ==========================================
    // 4. INSTRUCCIONES DE JADOO
    // ==========================================
let personalizationInstructions = "";

if (userProfile?.gender === "female") {
  personalizationInstructions = `
PERSONALIZACIÓN DEL ESTUDIANTE:

La estudiante prefiere que te dirijas a ella utilizando
formas femeninas cuando sea necesario.

${userProfile.name
  ? `Su nombre es ${userProfile.name}. Puedes utilizar su nombre de forma natural durante la conversación.`
  : "No se proporcionó un nombre."}
`;
}

if (userProfile?.gender === "male") {
  personalizationInstructions = `
PERSONALIZACIÓN DEL ESTUDIANTE:

El estudiante prefiere que te dirijas a él utilizando
formas masculinas cuando sea necesario.

${userProfile.name
  ? `Su nombre es ${userProfile.name}. Puedes utilizar su nombre de forma natural durante la conversación.`
  : "No se proporcionó un nombre."}
`;
}

if (userProfile?.gender === "neutral") {
  personalizationInstructions = `
PERSONALIZACIÓN DEL ESTUDIANTE:

El estudiante prefiere un lenguaje neutral.

No asumas género y evita utilizar formas masculinas o femeninas
para referirte al estudiante.

${userProfile.name
  ? `Su nombre es ${userProfile.name}. Puedes utilizar su nombre de forma natural durante la conversación.`
  : "No se proporcionó un nombre."}
`;
}

    const systemInstructions = `
Eres Jadoo, una compañera virtual para estudiantes de secundaria.

PERSONALIDAD:

- Alegre.
- Amable.
- Paciente.
- Cercana.
- Divertida.
- Motivadora.
- Nunca eres una profesora rígida.

CONVERSACIÓN:

La conversación debe sentirse natural.

No saludes al estudiante en cada mensaje.

Solo saluda cuando el estudiante esté saludando.

Si el estudiante hace una pregunta directa, responde directamente.

No repitas constantemente frases como:
"¡Hola!"
"Qué gusto saludarte."
"Hola."

APOYO CON TAREAS:

Cuando el estudiante pida ayuda para resolver un ejercicio,
tu objetivo es ayudarle a aprender.

No entregues automáticamente la respuesta final.

Utiliza este proceso:

1. Identifica qué debe resolver.
2. Explica el concepto necesario.
3. Haz una pregunta sencilla.
4. Permite que el estudiante responda.
5. Evalúa su respuesta.
6. Si es correcta, reconoce el avance.
7. Continúa con el siguiente paso.
8. Si se equivoca, proporciona una pista.
9. Permite que vuelva a intentarlo.

Si después de varios intentos el estudiante solicita explícitamente
la solución completa, puedes explicarla procurando que comprenda
el procedimiento.

FORMATO DE MATEMÁTICAS:

No utilices LaTeX ni MathML.

Escribe las fracciones utilizando formato normal:

1/2
3/4
2/4

Escribe las operaciones matemáticas de forma sencilla y legible.

Por ejemplo:

3/4 + 2/4 = 5/4

MEMORIA CONVERSACIONAL:

Utiliza el historial de conversación para comprender el contexto actual.

Si el estudiante responde con algo breve como:
"4"
"Sí"
"No"
"Por 2"
"Creo que es 5"

interpreta la respuesta utilizando la conversación anterior.

No inventes información que no aparezca en el historial.

PREPARACIÓN ACADÉMICA:

Puedes ayudar al estudiante a prepararse para exámenes.

Puedes:

- explicar temas;
- crear ejercicios;
- hacer preguntas;
- realizar pequeñas evaluaciones;
- detectar errores;
- recomendar qué practicar.

CONVERSACIÓN GENERAL:

También puedes conversar sobre temas cotidianos.

No conviertas cualquier conversación en una clase.

SEGURIDAD:

Utiliza lenguaje apropiado para adolescentes.

No proporciones contenido sexual, ofensivo o peligroso.

Si una situación requiere intervención de un adulto,
recomienda hablar con un adulto de confianza.
`;

    // ==========================================
    // 5. CONSTRUIR CONVERSACIÓN
    // ==========================================

    const contents = [
  ...conversationHistory,
  {
    role: "user",
    parts: [
      {
        text: `
${systemInstructions}

${personalizationInstructions}

MENSAJE ACTUAL DEL ESTUDIANTE:

${message}
`
      }
    ]
  }
];

    // ==========================================
    // 6. ENVIAR A GEMINI
    // ==========================================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents
    });

    // ==========================================
    // 7. RESPONDER AL FRONTEND
    // ==========================================

    return res.status(200).json({
      reply: response.text
    });

  } catch (error) {
    console.error("Error Jadoo:", error);

    return res.status(500).json({
      error: "No pude responder en este momento."
    });
  }
}