import {
  createPracticeSession,
  savePracticeAnswer,
  finishPracticeSession
} from "./queries.js";

async function testPractice() {

  console.log("\n==============================");
  console.log("PRUEBA DE PRÁCTICA JADOO");
  console.log("==============================\n");


  // ========================================
  // 1. CREAR SESIÓN
  // ========================================

  console.log("1. CREANDO SESIÓN...\n");

  const session =
    await createPracticeSession({
      studentId: 1,
      subjectId: 1,
      topic: "Operaciones combinadas",
      subtopic: "Jerarquía de operaciones",
      initialLevel: "básica"
    });

  console.log(session);


  // ========================================
  // 2. GUARDAR RESPUESTA
  // ========================================

  console.log("\n2. GUARDANDO RESPUESTA...\n");

  const answer =
    await savePracticeAnswer({
      sessionId: session.id,
      questionNumber: 1,
      question: "5 + 3 × 2",
      studentAnswer: "11",
      correctAnswer: "11",
      correct: true,
      difficulty: "básica"
    });

  console.log(answer);


  // ========================================
  // 3. FINALIZAR SESIÓN
  // ========================================

  console.log("\n3. FINALIZANDO SESIÓN...\n");

  const finishedSession =
    await finishPracticeSession({
      sessionId: session.id,
      totalExercises: 1,
      correctAnswers: 1,
      percentage: 100,
      finalLevel: "básica"
    });

  console.log(finishedSession);


  console.log("\n==============================");
  console.log("PRUEBA TERMINADA");
  console.log("==============================\n");

  process.exit(0);
}

testPractice().catch((error) => {

  console.error(
    "\nERROR EN LA PRUEBA:\n",
    error
  );

  process.exit(1);
});