import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

import {
  getStudent,
  getStudentSchedule,
  getPendingTasks,
  getStudentExams,
  getAssessmentResults,
  saveAssessmentResult,
  createPracticeSession
} from "../db/queries.js";

const app = express();
const PORT = 3000;

const evaluations = new Map();

app.use(express.json());
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    message: "Hello Jadoo API funcionando 💗"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
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

    // Por ahora trabajamos con el estudiante 1.
    const studentId = 1;

    // ==========================================
    // 1. OBTENER MEMORIA ACADÉMICA
    // ==========================================

    const student = await getStudent(studentId);
    const schedule = await getStudentSchedule(studentId);
    const tasks = await getPendingTasks(studentId);
    const exams = await getStudentExams(studentId);
    const results = await getAssessmentResults(studentId);

    const academicContext = `
DATOS DEL ESTUDIANTE:
${JSON.stringify(student, null, 2)}

HORARIO:
${JSON.stringify(schedule, null, 2)}

TAREAS PENDIENTES:
${JSON.stringify(tasks, null, 2)}

EXÁMENES:
${JSON.stringify(exams, null, 2)}

RESULTADOS DE EVALUACIONES:
${JSON.stringify(results, null, 2)}
`;

    // ==========================================
    // 2. PREPARAR HISTORIAL DE CONVERSACIÓN
    // ==========================================

    // chat.js ya incluye el mensaje actual dentro
    // del historial, por eso quitamos el último elemento.
    const previousHistory = Array.isArray(history)
      ? history.slice(0, -1)
      : [];

    // Limitamos el historial para evitar enviar
    // conversaciones demasiado largas a Gemini.
    const recentHistory = previousHistory.slice(-10);

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
    // 3. INSTRUCCIONES DE JADOO
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

MEMORIA ACADÉMICA:

Puedes utilizar la información académica proporcionada desde PostgreSQL.

Nunca inventes:
- tareas
- clases
- exámenes
- fechas
- resultados
- calificaciones
- fortalezas
- debilidades

Si un dato no está disponible, dilo claramente.

APOYO CON TAREAS:

Cuando el estudiante pregunte qué tareas tiene pendientes,
puedes decirle directamente cuáles son.

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

Adapta la dificultad según las respuestas del estudiante.

Si después de varios intentos el estudiante solicita explícitamente
la solución completa, puedes explicarla, pero procurando que comprenda
el procedimiento.

FORMATO DE MATEMÁTICAS:

No utilices LaTeX, MathML ni expresiones como:
\\frac{}{}

Escribe las fracciones utilizando el formato normal:

1/2
3/4
2/4

Escribe las operaciones matemáticas de forma sencilla y legible.

Por ejemplo:

3/4 + 2/4 = 5/4

No escribas expresiones matemáticas utilizando código LaTeX.

MEMORIA CONVERSACIONAL:

Debes utilizar el historial de conversación para comprender
el contexto actual.

Si el estudiante responde con algo breve como:
"4"
"Sí"
"No"
"Por 2"
"Creo que es 5"

interpreta la respuesta utilizando la conversación anterior.

No inventes información que no aparezca en el historial.

EVALUACIONES:

Puedes ayudar al estudiante a prepararse para sus exámenes.

Puedes:
- explicar temas;
- crear ejercicios;
- hacer preguntas;
- realizar pequeñas evaluaciones;
- detectar errores;
- recomendar qué practicar.

RESULTADOS:

Utiliza los resultados anteriores para identificar fortalezas
y áreas de oportunidad.

Nunca presentes una debilidad como un fracaso.

Utiliza expresiones como:
"Esto es algo que podemos practicar."
"Vamos a reforzarlo."
"Ya sabemos en qué podemos mejorar."

CONVERSACIÓN GENERAL:

También puedes conversar sobre temas cotidianos.

No conviertas cualquier conversación en una clase.

SEGURIDAD:

Utiliza lenguaje apropiado para adolescentes.

No proporciones contenido sexual, ofensivo o peligroso.

Si una situación requiere intervención de un adulto,
recomienda hablar con un adulto de confianza.

INFORMACIÓN ACADÉMICA DISPONIBLE:
${academicContext}
`;

const finalSystemInstructions = `
${systemInstructions}

${personalizationInstructions}
`;

    // ==========================================
    // 4. CONSTRUIR LA CONVERSACIÓN PARA GEMINI
    // ==========================================

    const contents = [
      ...conversationHistory,
      {
        role: "user",
        parts: [
          {
            text: `
${finalSystemInstructions}

MENSAJE ACTUAL DEL ESTUDIANTE:
${message}
`
          }
        ]
      }
    ];

    // ==========================================
    // 5. ENVIAR TODO A GEMINI
    // ==========================================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents
    });

    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error("Error Jadoo:", error);

    res.status(500).json({
      error: "No pude responder en este momento."
    });
  }
});

// ==========================================
// 6. GENERAR EVALUACIÓN PERSONALIZADA
// ==========================================

// ==========================================
// 6. GENERAR EVALUACIÓN PERSONALIZADA
// ==========================================

// ==========================================
// 6. GENERAR EVALUACIÓN PERSONALIZADA
// ==========================================

app.post("/api/evaluation", async (req, res) => {
  try {
    // ==========================================
    // ESTUDIANTE
    // ==========================================

    const studentId = 1;

    // ==========================================
    // OBTENER INFORMACIÓN ACADÉMICA
    // ==========================================

    const student =
      await getStudent(studentId);

    const exams =
      await getStudentExams(studentId);

    const results =
      await getAssessmentResults(studentId);

    // ==========================================
    // BUSCAR PRÓXIMO EXAMEN
    // ==========================================

    const nextExam = exams[0];

    if (!nextExam) {
      return res.status(404).json({
        error:
          "No hay exámenes registrados para este estudiante."
      });
    }

    // ==========================================
    // CONTEXTO ACADÉMICO
    // ==========================================

    const evaluationContext = `
ESTUDIANTE:
${JSON.stringify(student, null, 2)}

PRÓXIMO EXAMEN:
${JSON.stringify(nextExam, null, 2)}

RESULTADOS DE EVALUACIONES ANTERIORES:
${JSON.stringify(results, null, 2)}
`;

    // ==========================================
    // PROMPT PARA GEMINI
    // ==========================================

    const prompt = `
Eres Jadoo, una compañera virtual educativa
para estudiantes de secundaria.

Debes crear una evaluación de práctica
personalizada para preparar al estudiante
para su próximo examen.

OBJETIVO:

La evaluación debe medir los conocimientos
del estudiante sobre los temas principales
del examen.

También debes prestar especial atención
a las áreas de oportunidad detectadas
en evaluaciones anteriores.

TEMAS PRINCIPALES:

Los temas principales deben salir
ÚNICAMENTE de los temas indicados
en el próximo examen.

No inventes nuevos temas principales.

IMPORTANTE:

El campo "topic" debe contener solamente
el nombre de un tema principal del examen.

El campo "subtopic" puede indicar una habilidad
o contenido específico relacionado con ese tema.

Ejemplo:

"topic": "Fracciones",
"subtopic": "Fracciones mixtas"

Otro ejemplo:

"topic": "Operaciones combinadas",
"subtopic": "Jerarquía de operaciones"

REGLAS DE LA EVALUACIÓN:

- Crea exactamente 5 preguntas.
- Todas deben estar relacionadas con el examen.
- Las preguntas deben ser apropiadas para secundaria.
- No repitas exactamente preguntas anteriores.
- Utiliza diferentes niveles de dificultad.
- Las preguntas deben evaluar realmente el conocimiento.
- No incluyas la respuesta dentro de la pregunta.
- Utiliza las evaluaciones anteriores para detectar
  qué contenidos necesitan mayor práctica.
- Da mayor peso a las áreas de oportunidad anteriores.
- Mantén variedad entre los temas del examen.
- Da mayor peso a los subtemas que aparezcan como áreas de oportunidad
  en evaluaciones anteriores.
- Si existe un área de oportunidad previa, al menos dos preguntas
  deben evaluar ese subtema o una habilidad directamente relacionada.
- No concentres las cinco preguntas exclusivamente en un solo tema.
- No inventes información académica.

DISTRIBUCIÓN:

Pregunta 1:
dificultad básica.

Pregunta 2:
dificultad básica.

Pregunta 3:
dificultad intermedia.

Pregunta 4:
dificultad intermedia.

Pregunta 5:
dificultad mayor.

ÁREAS DE OPORTUNIDAD:

Si los resultados anteriores muestran
áreas de oportunidad específicas,
utilízalas principalmente como "subtopic".

Por ejemplo:

Si el área de oportunidad es:

"Fracciones mixtas"

utiliza:

"topic": "Fracciones"
"subtopic": "Fracciones mixtas"

Si el área de oportunidad es:

"Operaciones combinadas"

utiliza:

"topic": "Operaciones combinadas"
"subtopic": "Jerarquía de operaciones"

No conviertas una habilidad específica
en un nuevo tema principal.

FORMATO DE MATEMÁTICAS:

No utilices LaTeX, MathML ni código matemático.

Escribe las fracciones utilizando texto normal:

1/2
3/4
2 1/2

Utiliza siempre los símbolos matemáticos explícitos:

+
-
×
÷
=
(
)
[
]

REGLAS IMPORTANTES PARA LAS OPERACIONES:

- Nunca utilices multiplicación implícita.
- Siempre escribe el símbolo × cuando exista una multiplicación.
- Nunca escribas expresiones como:
  5(-3)
  2(4+1)
  3/4(2)

- En su lugar escribe:
  5 × (-3)
  2 × (4 + 1)
  3/4 × 2

- Cuando utilices números negativos, coloca el número negativo
  entre paréntesis cuando pueda existir confusión.

Ejemplo:

-8 + 5 × (-3)

NO:

-8 + 5(-3)

- Respeta siempre la jerarquía de operaciones.
- Utiliza paréntesis o corchetes de forma explícita.
- No omitas ningún operador.
- No combines dos números sin indicar qué operación existe entre ellos.
- Cada expresión debe poder interpretarse de una sola manera.

CONTROL DE CALIDAD:

Antes de responder, revisa cada pregunta y verifica:

1. Que todos los operadores estén escritos.
2. Que los signos negativos sean claros.
3. Que los paréntesis y corchetes estén correctamente cerrados.
4. Que la pregunta tenga una única interpretación matemática.
5. Que la respuesta indicada en "answer" corresponda exactamente
   a la pregunta.
6. Que las fracciones estén correctamente simplificadas cuando se solicite.
7. Que no exista ningún dato contradictorio dentro de la pregunta.

Si detectas un problema, corrige la pregunta antes de devolver el JSON.

No escribas explicaciones fuera del JSON.

FORMATO DE RESPUESTA:

Responde ÚNICAMENTE con JSON válido.

La estructura debe ser exactamente:

{
  "title": "Práctica de Matemáticas",
  "subject": "Matemáticas",
  "exam": "nombre del examen",
  "questions": [
    {
      "number": 1,
      "topic": "tema principal",
      "subtopic": "habilidad específica",
      "difficulty": "básica",
      "question": "texto de la pregunta",
      "answer": "respuesta correcta"
    }
  ]
}

IMPORTANTE SOBRE "answer":

La propiedad "answer" debe contener
la respuesta correcta correspondiente
a cada pregunta.

Para respuestas numéricas utiliza
preferentemente el resultado simplificado.

Ejemplo:

Pregunta:
"Convierte 17/4 en un número mixto."

Respuesta:

"4 1/4"

No agregues explicaciones.

No agregues texto fuera del JSON.

INFORMACIÓN ACADÉMICA:

${evaluationContext}
`;

    // ==========================================
    // GENERAR EVALUACIÓN CON GEMINI
    // ==========================================

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
      });

    // ==========================================
    // LIMPIAR RESPUESTA
    // ==========================================

    let evaluationText =
      response.text.trim();

    evaluationText =
      evaluationText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // ==========================================
    // CONVERTIR JSON
    // ==========================================

    const evaluation =
      JSON.parse(evaluationText);
    
    // ==========================================
// NORMALIZAR TEMAS PRINCIPALES
// ==========================================

const mainTopics = [
  "Fracciones",
  "Números enteros",
  "Operaciones combinadas"
];

for (const question of evaluation.questions) {

  const normalizedTopic =
    mainTopics.find(
      (topic) =>
        topic.toLowerCase() ===
        question.topic.trim().toLowerCase()
    );

  if (!normalizedTopic) {
    throw new Error(
      `Tema no válido generado por Gemini: ${question.topic}`
    );
  }

  question.topic = normalizedTopic;
}

    // ==========================================
    // VALIDAR ESTRUCTURA
    // ==========================================

    if (
      !evaluation.questions ||
      !Array.isArray(evaluation.questions) ||
      evaluation.questions.length !== 5
    ) {
      throw new Error(
        "La evaluación generada no contiene exactamente 5 preguntas."
      );
    }

    // ==========================================
    // VALIDAR CADA PREGUNTA
    // ==========================================

    for (const question of evaluation.questions) {

      if (
        !question.number ||
        !question.topic ||
        !question.subtopic ||
        !question.difficulty ||
        !question.question ||
        !question.answer
      ) {
        throw new Error(
          "Una de las preguntas no contiene todos los campos requeridos."
        );
      }
    }

    // ==========================================
    // GENERAR ID DE EVALUACIÓN
    // ==========================================

    const evaluationId =
      crypto.randomUUID();

    // ==========================================
    // GUARDAR EVALUACIÓN EN MEMORIA
    // ==========================================

    evaluations.set(evaluationId, {
        evaluation,
        answers: [],
        studentId,
        subjectId: nextExam.subject_id,
        examId: nextExam.id
        });

    // ==========================================
    // PREPARAR RESPUESTA PARA FRONTEND
    // ==========================================

    const publicEvaluation = {
      id: evaluationId,
      title: evaluation.title,
      subject: evaluation.subject,
      exam: evaluation.exam,

      questions:
        evaluation.questions.map(
          (question) => ({
            number: question.number,
            topic: question.topic,
            subtopic: question.subtopic,
            difficulty: question.difficulty,
            question: question.question
          })
        )
    };

    // ==========================================
    // DEVOLVER EVALUACIÓN
    // ==========================================

    res.json(publicEvaluation);

  } catch (error) {

    console.error(
      "Error al generar evaluación:",
      error
    );

    res.status(500).json({
      error:
        "No pude generar la evaluación en este momento."
    });
  }
});

// ==========================================
// 7. COMPROBAR RESPUESTA DE UNA EVALUACIÓN
// ==========================================

// ==========================================
// 7. COMPROBAR Y REGISTRAR RESPUESTA
// ==========================================

app.post("/api/evaluation/answer", async (req, res) => {
  try {
    const {
      evaluationId,
      questionNumber,
      answer
    } = req.body;

    // ==========================================
    // VALIDAR DATOS
    // ==========================================

    if (
      !evaluationId ||
      !questionNumber ||
      typeof answer !== "string"
    ) {
      return res.status(400).json({
        error: "Faltan datos para comprobar la respuesta."
      });
    }

    // ==========================================
    // BUSCAR EVALUACIÓN
    // ==========================================

    const evaluationData =
      evaluations.get(evaluationId);

    if (!evaluationData) {
      return res.status(404).json({
        error:
          "La evaluación no existe o ya no está disponible."
      });
    }

    const {
        evaluation,
        answers,
        studentId,
        subjectId,
        examId
    } = evaluationData;

    // ==========================================
    // BUSCAR PREGUNTA
    // ==========================================

    const question =
      evaluation.questions.find(
        (item) =>
          item.number === Number(questionNumber)
      );

    if (!question) {
      return res.status(404).json({
        error: "No se encontró la pregunta."
      });
    }

    // ==========================================
    // NORMALIZAR RESPUESTAS
    // ==========================================

    const studentAnswer =
      answer
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const correctAnswer =
      String(question.answer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    // ==========================================
    // COMPARAR
    // ==========================================

    const correct =
      studentAnswer === correctAnswer;

    // ==========================================
    // REGISTRAR RESULTADO
    // ==========================================

    const existingAnswer =
      answers.find(
        (item) =>
          item.questionNumber ===
          Number(questionNumber)
      );

    if (!existingAnswer) {

      answers.push({
        questionNumber: Number(questionNumber),
        topic: question.topic,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
        studentAnswer,
        correctAnswer,
        correct
        });

    }

    // ==========================================
    // RESPUESTA AL FRONTEND
    // ==========================================

    res.json({
      correct,
      feedback: correct
        ? "¡Muy bien! 🎉 Tu respuesta es correcta."
        : "Casi 💗. Revisa tu procedimiento e inténtalo nuevamente."
    });

  } catch (error) {

    console.error(
      "Error al comprobar respuesta:",
      error
    );

    res.status(500).json({
      error:
        "No pude comprobar la respuesta."
    });
  }
});

// ==========================================
// 8. FINALIZAR EVALUACIÓN Y GENERAR DIAGNÓSTICO
// ==========================================

app.post("/api/evaluation/finish", async (req, res) => {
  try {
    const { evaluationId } = req.body;

    // ==========================================
    // VALIDAR DATOS
    // ==========================================

    if (!evaluationId) {
      return res.status(400).json({
        error: "El evaluationId es obligatorio."
      });
    }

    // ==========================================
    // BUSCAR EVALUACIÓN
    // ==========================================

    const evaluationData =
      evaluations.get(evaluationId);

    if (!evaluationData) {
      return res.status(404).json({
        error:
          "La evaluación no existe o ya no está disponible."
      });
    }

    const {
        evaluation,
        answers,
        studentId,
        subjectId,
        examId
        } = evaluationData;

    // ==========================================
    // VERIFICAR QUE ESTÉ COMPLETA
    // ==========================================

    const totalQuestions =
      evaluation.questions.length;

    if (answers.length !== totalQuestions) {
      return res.status(400).json({
        error:
          "La evaluación todavía no ha sido completada."
      });
    }

    // ==========================================
    // CALCULAR PUNTUACIÓN GENERAL
    // ==========================================

    const score =
      answers.filter(
        (item) => item.correct
      ).length;

    const percentage =
      Math.round(
        (score / totalQuestions) * 100
      );

    // ==========================================
    // ANALIZAR RESULTADOS POR TEMA
    // ==========================================

    const topicMap = new Map();

    for (const answer of answers) {

      if (!topicMap.has(answer.topic)) {

        topicMap.set(answer.topic, {
          topic: answer.topic,
          correct: 0,
          total: 0
        });

      }

      const topicResult =
        topicMap.get(answer.topic);

      topicResult.total++;

      if (answer.correct) {
        topicResult.correct++;
      }
    }

    // ==========================================
    // ANALIZAR RESULTADOS POR SUBTEMA
    // ==========================================

    const subtopicMap = new Map();

    for (const answer of answers) {

      const key =
        `${answer.topic}::${answer.subtopic || "General"}`;

      if (!subtopicMap.has(key)) {

        subtopicMap.set(key, {
          topic: answer.topic,
          subtopic:
            answer.subtopic || "General",
          correct: 0,
          total: 0
        });

      }

      const subtopicResult =
        subtopicMap.get(key);

      subtopicResult.total++;

      if (answer.correct) {
        subtopicResult.correct++;
      }
    }

    // ==========================================
    // CALCULAR RESULTADO POR TEMA
    // ==========================================

    const topics =
      Array.from(topicMap.values())
        .map((topicResult) => {

          const topicPercentage =
            Math.round(
              (topicResult.correct /
                topicResult.total) *
              100
            );

          let level;

          // Con una sola pregunta no afirmamos
          // que sea una fortaleza definitiva.
          if (topicResult.total === 1) {

            level = "resultado inicial";

          } else if (topicPercentage >= 90) {

            level = "fortaleza";

          } else if (topicPercentage >= 70) {

            level = "en desarrollo";

          } else {

            level = "área de oportunidad";

          }

          return {
            topic: topicResult.topic,
            correct: topicResult.correct,
            total: topicResult.total,
            percentage: topicPercentage,
            level
          };
        });

    // ==========================================
    // CALCULAR RESULTADO POR SUBTEMA
    // ==========================================

    const subtopics =
      Array.from(subtopicMap.values())
        .map((subtopicResult) => {

          const subtopicPercentage =
            Math.round(
              (subtopicResult.correct /
                subtopicResult.total) *
              100
            );

          let level;

          if (subtopicResult.total === 1) {

            level = "resultado inicial";

          } else if (subtopicPercentage >= 90) {

            level = "fortaleza";

          } else if (subtopicPercentage >= 70) {

            level = "en desarrollo";

          } else {

            level = "área de oportunidad";

          }

          return {
            topic: subtopicResult.topic,
            subtopic:
              subtopicResult.subtopic,
            correct:
              subtopicResult.correct,
            total:
              subtopicResult.total,
            percentage:
              subtopicPercentage,
            level
          };
        });

    // ==========================================
    // CLASIFICAR TEMAS
    // ==========================================

    const strengths =
      topics.filter(
        (item) =>
          item.level === "fortaleza"
      );

    const developing =
      topics.filter(
        (item) =>
          item.level === "en desarrollo"
      );

    const weaknesses =
      topics.filter(
        (item) =>
          item.level === "área de oportunidad"
      );

    // ==========================================
    // CLASIFICAR SUBTEMAS
    // ==========================================

    const subtopicStrengths =
      subtopics.filter(
        (item) =>
          item.level === "fortaleza"
      );

    const subtopicDeveloping =
      subtopics.filter(
        (item) =>
          item.level === "en desarrollo"
      );

    const subtopicWeaknesses =
      subtopics.filter(
        (item) =>
          item.level === "área de oportunidad"
      );

// ==========================================
// GUARDAR RESULTADO EN POSTGRESQL
// ==========================================

const savedResult = await saveAssessmentResult({
  studentId,
  subjectId,
  examId,
  score,
  totalQuestions,
  strengths: [
    ...strengths.map(
      (item) => item.topic
    ),
    ...subtopicStrengths.map(
      (item) => item.subtopic
    )
  ].join("; "),
  weaknesses: [
    ...weaknesses.map(
      (item) => item.topic
    ),
    ...subtopicWeaknesses.map(
      (item) => item.subtopic
    )
  ].join("; ")
});

    // ==========================================
    // DEVOLVER DIAGNÓSTICO
    // ==========================================

    res.json({

      savedResultId: savedResult.id,

      evaluationId,

      title:
        evaluation.title,

      subject:
        evaluation.subject,

      exam:
        evaluation.exam,

      score,

      totalQuestions,

      percentage,

      topics,

      subtopics,

      strengths,

      developing,

      weaknesses,

      subtopicStrengths,

      subtopicDeveloping,

      subtopicWeaknesses

    });

  } catch (error) {

    console.error(
      "Error al finalizar evaluación:",
      error
    );

    res.status(500).json({
      error:
        "No pude finalizar la evaluación."
    });
  }
});

// ==========================================
// PRÁCTICA ENFOCADA
// ==========================================

app.post("/api/practice", async (req, res) => {
  try {

    const {
      subtopic,
      topic,
      sessionId,
      message,
      history = []
    } = req.body;

    // ==========================================
    // VALIDAR DATOS
    // ==========================================

    if (!subtopic || !subtopic.trim()) {
      return res.status(400).json({
        error: "El subtema es obligatorio."
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "El mensaje es obligatorio."
      });
    }

    // ==========================================
    // DATOS DEL ESTUDIANTE
    // ==========================================

    // Por ahora trabajamos con la estudiante
    // de prueba de Jadoo.
    const studentId = 1;

    // ==========================================
    // OBTENER EXÁMENES
    // ==========================================

    const exams =
      await getStudentExams(studentId);

    if (!exams || exams.length === 0) {
      return res.status(404).json({
        error:
          "No se encontró información académica para iniciar la práctica."
      });
    }

    const currentExam = exams[0];

    // ==========================================
    // CREAR SESIÓN
    // ==========================================

    let currentSessionId = sessionId;

    if (!currentSessionId) {

      const session =
        await createPracticeSession({
          studentId,
          subjectId: currentExam.subject_id,
          topic:
            topic && topic.trim()
              ? topic.trim()
              : subtopic.trim(),
          subtopic: subtopic.trim(),
          initialLevel: "básica"
        });

      currentSessionId = session.id;

      console.log(
        "Sesión de práctica creada:",
        currentSessionId
      );
    }

    // ==========================================
    // HISTORIAL
    // ==========================================

    const recentHistory =
      Array.isArray(history)
        ? history.slice(-10)
        : [];

    const conversationHistory =
      recentHistory
        .filter(
          (item) =>
            item &&
            (item.role === "user" ||
              item.role === "model") &&
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
    // INSTRUCCIONES DE PRÁCTICA
    // ==========================================

    const practiceInstructions = `
Eres Jadoo, una compañera virtual educativa
para estudiantes de secundaria.

La estudiante está realizando una sesión de
PRÁCTICA ENFOCADA.

TEMA:

${topic || subtopic}

SUBTEMA A PRACTICAR:

${subtopic}

OBJETIVO:

Ayudar a la estudiante a mejorar específicamente
en este contenido.

PERSONALIDAD:

- Alegre.
- Amable.
- Paciente.
- Cercana.
- Motivadora.
- Divertida.
- Nunca eres una profesora rígida.

FORMA DE ENSEÑAR:

No entregues automáticamente la respuesta.

Utiliza un proceso de aprendizaje:

1. Explica brevemente el concepto cuando sea necesario.
2. Propón un ejercicio.
3. Permite que la estudiante responda.
4. Analiza su respuesta.
5. Si es correcta, reconoce el avance.
6. Si es incorrecta, explica qué debe revisar.
7. Proporciona una pista antes de dar la solución.
8. Después propone otro ejercicio.
9. Ajusta la dificultad según sus respuestas.

ADAPTACIÓN:

Si la estudiante responde correctamente varias veces,
aumenta gradualmente la dificultad.

Si comete errores, reduce temporalmente la dificultad
y refuerza el concepto.

No cambies de subtema.

No conviertas la sesión en un examen de cinco preguntas.

La sesión debe sentirse como una conversación
de aprendizaje con Jadoo.

IMPORTANTE:

Si la estudiante acaba de recibir un ejercicio
y responde únicamente con algo como:

"5"
"2 1/4"
"Sí"
"No"
"Creo que es 8"

interpreta la respuesta utilizando el historial
de la conversación.

MATEMÁTICAS:

No utilices LaTeX ni MathML.

Utiliza expresiones normales:

1/2
3/4
2 1/2

Para multiplicaciones utiliza siempre:

×

Para divisiones utiliza:

÷

Para números negativos utiliza paréntesis
cuando puedan evitar confusión.

No utilices multiplicación implícita.

SEGURIDAD:

Utiliza lenguaje apropiado para adolescentes.

No proporciones contenido sexual, ofensivo
o peligroso.
`;

    // ==========================================
    // CONSTRUIR CONVERSACIÓN
    // ==========================================

    const contents = [
      ...conversationHistory,

      {
        role: "user",
        parts: [
          {
            text: `
${practiceInstructions}

MENSAJE ACTUAL DE LA ESTUDIANTE:

${message}
`
          }
        ]
      }
    ];

    // ==========================================
    // ENVIAR A GEMINI
    // ==========================================

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents
      });

    // ==========================================
    // RESPONDER
    // ==========================================

    res.json({
      reply: response.text,
      sessionId: currentSessionId
    });

  } catch (error) {

    console.error(
      "Error en práctica enfocada:",
      error
    );

    res.status(500).json({
      error:
        "No pude continuar la práctica en este momento."
    });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

export default app;