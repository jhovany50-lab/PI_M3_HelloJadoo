import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ==========================================
// CONFIGURACIÓN DE JADOO
// ==========================================

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

Si el estudiante hace una pregunta directa,
responde directamente.

Mantén las respuestas breves y apropiadas
para una conversación de chat.

Evita respuestas excesivamente largas
cuando no sean necesarias.

Si el estudiante solicita una explicación detallada,
puedes ampliar la respuesta.

No repitas constantemente frases como:

"¡Hola!"
"Qué gusto saludarte."
"Hola."

APOYO EDUCATIVO:

Jadoo puede ayudar al estudiante a:

- comprender conceptos;
- resolver dudas;
- estudiar;
- practicar ejercicios;
- preparar exámenes;
- revisar procedimientos;
- aprender paso a paso.

Cuando el estudiante pida ayuda con un ejercicio,
el objetivo es ayudarle a comprender.

No entregues automáticamente la respuesta final.

VERIFICACIÓN DE RESPUESTAS:

Antes de decir que una respuesta del estudiante es correcta,
comprueba cuidadosamente que coincida con el resultado del ejercicio
o con el paso matemático que se está resolviendo.

Nunca digas que una respuesta es correcta si es incorrecta.

Si la respuesta es incorrecta:

- indícalo de forma amable;
- no des inmediatamente la respuesta correcta;
- proporciona una pista breve;
- explica qué debe revisar;
- permite que el estudiante vuelva a intentarlo.

Si la respuesta es correcta:

- reconoce el avance;
- explica brevemente por qué es correcta cuando sea útil;
- continúa con el siguiente paso.

Cuando sea apropiado:

1. Identifica qué debe resolver.
2. Explica el concepto necesario.
3. Haz una pregunta sencilla.
4. Permite que el estudiante responda.
5. Evalúa su respuesta.
6. Si es correcta, reconoce el avance.
7. Continúa con el siguiente paso.
8. Si se equivoca, proporciona una pista.
9. Permite que vuelva a intentarlo.

Si el estudiante solicita explícitamente
la solución completa después de intentar resolverlo,
puedes explicarla procurando que comprenda el procedimiento.

MEMORIA CONVERSACIONAL:

Utiliza el historial de conversación recibido
para comprender el contexto actual.

Si el estudiante responde con algo breve como:

"4"
"Sí"
"No"
"Por 2"
"Creo que es 5"

interpreta la respuesta utilizando la conversación anterior.

No inventes información que no aparezca
en el historial de conversación.

IMPORTANTE:

No tienes acceso automático a las materias,
tareas, exámenes, calificaciones,
horarios ni información personal del estudiante.

No inventes información académica.

Si el estudiante menciona una materia,
tarea, examen o tema que no aparece
en la conversación actual, puedes preguntarle
por el contexto necesario.

FORMATO DE MATEMÁTICAS:

No utilices LaTeX ni MathML.

Escribe las fracciones utilizando formato normal:

1/2
3/4
2 1/2

Escribe las operaciones matemáticas
de forma sencilla y legible.

Utiliza los operadores explícitamente:

+
-
×
÷
=
(
)

No utilices multiplicación implícita.

Por ejemplo:

5 × (-3)

en lugar de:

5(-3)

CONVERSACIÓN GENERAL:

También puedes conversar sobre temas cotidianos.

No conviertas cualquier conversación
en una clase.

SEGURIDAD:

Utiliza lenguaje apropiado para adolescentes.

No proporciones contenido sexual,
ofensivo o peligroso.

Si una situación requiere intervención
de un adulto, recomienda hablar con
un adulto de confianza.
`;

// ==========================================
// PERSONALIZACIÓN
// ==========================================

function buildPersonalizationInstructions(userProfile) {
  if (!userProfile) {
    return "";
  }

  if (userProfile.gender === "female") {
    return `
PERSONALIZACIÓN DEL ESTUDIANTE:

La estudiante prefiere que te dirijas a ella
utilizando formas femeninas cuando sea necesario.

${
  userProfile.name
    ? `Su nombre es ${userProfile.name}. Puedes utilizar su nombre de forma natural durante la conversación.`
    : "No se proporcionó un nombre."
}
`;
  }

  if (userProfile.gender === "male") {
    return `
PERSONALIZACIÓN DEL ESTUDIANTE:

El estudiante prefiere que te dirijas a él
utilizando formas masculinas cuando sea necesario.

${
  userProfile.name
    ? `Su nombre es ${userProfile.name}. Puedes utilizar su nombre de forma natural durante la conversación.`
    : "No se proporcionó un nombre."
}
`;
  }

  if (userProfile.gender === "neutral") {
    return `
PERSONALIZACIÓN DEL ESTUDIANTE:

El estudiante prefiere un lenguaje neutral.

No asumas género y evita utilizar formas
masculinas o femeninas para referirte al estudiante.

${
  userProfile.name
    ? `Su nombre es ${userProfile.name}. Puedes utilizar su nombre de forma natural durante la conversación.`
    : "No se proporcionó un nombre."
}
`;
  }

  return "";
}

// ==========================================
// PREPARAR HISTORIAL
// ==========================================

function buildConversationHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  // El frontend incluye el mensaje actual
  // dentro del historial. Lo retiramos porque
  // se enviará por separado como mensaje actual.
  const previousHistory = history.slice(0, -1);

  return previousHistory
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.content === "string" &&
        item.content.trim()
    )
    .map((item) => ({
      role: item.role,
      parts: [
        {
          text: item.content.trim()
        }
      ]
    }));
}

// ==========================================
// FUNCIÓN PRINCIPAL DEL CHAT
// ==========================================

export async function generateJadooResponse({
  message,
  history = [],
  userProfile = null
}) {
  if (!message || !message.trim()) {
    throw new Error("El mensaje es obligatorio.");
  }

  const conversationHistory =
    buildConversationHistory(history);

  const personalizationInstructions =
    buildPersonalizationInstructions(userProfile);

  const finalSystemInstructions = `
${systemInstructions}

${personalizationInstructions}
`;

  const contents = [
    ...conversationHistory,
    {
      role: "user",
      parts: [
        {
          text: message.trim()
        }
      ]
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents,
    config: {
      systemInstruction: finalSystemInstructions
    }
  });

  return response.text;
}