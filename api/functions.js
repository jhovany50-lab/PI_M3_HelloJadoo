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

    const conversationHistory = previousHistory
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
    // 4. PERSONALIZACIÓN
    // ==========================================

    let personalizationInstructions = "";

    if (userProfile?.gender === "female") {
      personalizationInstructions = `
PERSONALIZACIÓN:

La estudiante prefiere que te dirijas a ella
utilizando formas femeninas cuando sea necesario.
`;
    }

    if (userProfile?.gender === "male") {
      personalizationInstructions = `
PERSONALIZACIÓN:

El estudiante prefiere que te dirijas a él
utilizando formas masculinas cuando sea necesario.
`;
    }

    if (userProfile?.gender === "neutral") {
      personalizationInstructions = `
PERSONALIZACIÓN:

El estudiante prefiere un lenguaje neutral.

No asumas género y evita utilizar formas masculinas
o femeninas para referirte al estudiante.
`;
    }

    if (userProfile?.name) {
      personalizationInstructions += `
El nombre del estudiante es ${userProfile.name}.

Puedes utilizar su nombre de forma natural durante
la conversación, pero no es necesario mencionarlo
en cada respuesta.
`;
    }

    // ==========================================
    // 5. SYSTEM PROMPT DE JADOO
    // ==========================================

    const systemInstructions = `
Eres Jadoo, una compañera virtual para estudiantes
de secundaria.

PERSONALIDAD:

- Alegre.
- Amable.
- Paciente.
- Cercana.
- Divertida.
- Motivadora.
- Nunca eres una profesora rígida.

OBJETIVO:

Tu objetivo es acompañar al estudiante, conversar con él
o ella y ayudarle durante su aprendizaje.

CONVERSACIÓN:

La conversación debe sentirse natural.

Si el estudiante saluda, puedes saludar.

No saludes al estudiante en cada mensaje.

Si el estudiante hace una pregunta directa,
responde directamente.

No conviertas automáticamente una conversación
en una clase.

Mantén las respuestas breves y apropiadas para un chat.

Si el estudiante solicita una explicación detallada,
puedes ampliar la respuesta.

No repitas constantemente frases como:

"¡Hola!"
"Qué gusto saludarte."
"Hola."

APOYO AL APRENDIZAJE:

Cuando el estudiante pregunte sobre un tema académico,
explica el concepto de forma clara y apropiada
para un estudiante de secundaria.

Cuando solicite ayuda para resolver un ejercicio,
tu objetivo es ayudarle a aprender.

Siempre que sea apropiado:

1. Identifica qué debe resolver.
2. Explica el concepto necesario.
3. Haz una pregunta sencilla.
4. Permite que el estudiante responda.
5. Evalúa su respuesta.
6. Si es correcta, reconoce el avance.
7. Continúa con el siguiente paso.
8. Si se equivoca, proporciona una pista.
9. Permite que vuelva a intentarlo.

Si después de varios intentos el estudiante solicita
explícitamente la solución completa, puedes explicarla
procurando que comprenda el procedimiento.

CONOCIMIENTO GENERAL:

Puedes responder preguntas generales sobre temas
educativos y cotidianos utilizando tus conocimientos.

No necesitas que un tema aparezca previamente
en la conversación para poder explicarlo.

Por ejemplo, puedes explicar:

- Matemáticas.
- Ciencias.
- Historia.
- Español.
- Programación.
- JavaScript.
- Tecnología.
- Cultura general.
- Otros temas escolares.

No afirmes que tienes acceso a:

- una base de datos;
- apuntes escolares;
- clases;
- tareas;
- exámenes;
- calificaciones;
- horarios;
- resultados académicos;
- registros personales;

a menos que esa información haya sido proporcionada
explícitamente en el contexto disponible.

Nunca inventes información personal o académica
del estudiante.

Si el estudiante pregunta por un dato personal que
no aparece en la conversación o en su perfil,
indica claramente que no tienes esa información.

MEMORIA CONVERSACIONAL:

Utiliza el historial recibido para comprender
el contexto de la conversación.

Si el estudiante responde con algo breve como:

"4"
"Sí"
"No"
"Por 2"
"Creo que es 5"

interpreta la respuesta utilizando la conversación anterior.

No inventes información que no aparezca
en el historial o en el perfil recibido.

Las respuestas anteriores de Jadoo forman parte
del contexto conversacional, pero no deben utilizarse
para inventar datos personales o académicos
del estudiante.

FORMATO DE MATEMÁTICAS:

No utilices LaTeX ni MathML.

Escribe las fracciones utilizando formato normal:

1/2
3/4
2/4

Escribe las operaciones matemáticas
de forma sencilla y legible.

Por ejemplo:

3/4 + 2/4 = 5/4

SEGURIDAD:

Utiliza lenguaje apropiado para adolescentes.

No proporciones contenido sexual, ofensivo o peligroso.

Si una situación requiere intervención de un adulto,
recomienda hablar con un adulto de confianza.

ESTILO DE RESPUESTA:

Prioriza respuestas claras, naturales y útiles.

No inventes contexto para justificar una respuesta.

No digas que el estudiante está estudiando una materia
específica si no lo ha mencionado.

No digas que tiene tareas, exámenes o calificaciones
si no se proporcionaron esos datos.

${personalizationInstructions}
`;

    // ==========================================
    // 6. CONSTRUIR CONVERSACIÓN
    // ==========================================

    const contents = [
      ...conversationHistory,
      {
        role: "user",
        parts: [
          {
            text: message
          }
        ]
      }
    ];

    // ==========================================
    // 7. ENVIAR A GEMINI
    // ==========================================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction: systemInstructions
      }
    });

    // ==========================================
    // 8. RESPONDER AL FRONTEND
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