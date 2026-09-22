import { pool } from "./config.js";

// ==========================================
// OBTENER INFORMACIÓN DEL ESTUDIANTE
// ==========================================

export async function getStudent(studentId) {
  const result = await pool.query(
    `
    SELECT
        id,
        name,
        age,
        grade,
        school
    FROM students
    WHERE id = $1;
    `,
    [studentId]
  );

  return result.rows[0];
}


// ==========================================
// OBTENER HORARIO DEL ESTUDIANTE
// ==========================================

export async function getStudentSchedule(studentId) {
  const result = await pool.query(
    `
    SELECT
        schedules.day_of_week,
        subjects.name AS subject,
        schedules.start_time,
        schedules.end_time
    FROM schedules
    JOIN subjects
        ON schedules.subject_id = subjects.id
    WHERE schedules.student_id = $1
    ORDER BY schedules.start_time;
    `,
    [studentId]
  );

  return result.rows;
}


// ==========================================
// OBTENER TAREAS PENDIENTES
// ==========================================

export async function getPendingTasks(studentId) {
  const result = await pool.query(
    `
    SELECT
        tasks.id,
        subjects.name AS subject,
        tasks.title,
        tasks.description,
        tasks.due_date,
        tasks.completed
    FROM tasks
    JOIN subjects
        ON tasks.subject_id = subjects.id
    WHERE tasks.student_id = $1
      AND tasks.completed = false
    ORDER BY tasks.due_date;
    `,
    [studentId]
  );

  return result.rows;
}


// ==========================================
// OBTENER EXÁMENES
// ==========================================

export async function getStudentExams(studentId) {
  const result = await pool.query(
    `
    SELECT
        exams.id,
        exams.subject_id,
        subjects.name AS subject,
        exams.title,
        exams.exam_date,
        exams.topics
    FROM exams
    JOIN subjects
        ON exams.subject_id = subjects.id
    WHERE exams.student_id = $1
    ORDER BY exams.exam_date;
    `,
    [studentId]
  );

  return result.rows;
}


// ==========================================
// OBTENER RESULTADOS DE EVALUACIONES
// ==========================================

export async function getAssessmentResults(studentId) {
  const result = await pool.query(
    `
    SELECT
        exams.title AS exam,
        subjects.name AS subject,
        exams.exam_date,
        exams.topics,
        assessment_results.score,
        assessment_results.total_questions,
        assessment_results.strengths,
        assessment_results.weaknesses,
        assessment_results.created_at
    FROM assessment_results
    JOIN subjects
        ON assessment_results.subject_id = subjects.id
    LEFT JOIN exams
        ON assessment_results.exam_id = exams.id
    WHERE assessment_results.student_id = $1
    ORDER BY assessment_results.created_at DESC;
    `,
    [studentId]
  );

  return result.rows;
}


// ==========================================
// GUARDAR RESULTADO DE EVALUACIÓN
// ==========================================

export async function saveAssessmentResult({
  studentId,
  subjectId,
  examId,
  score,
  totalQuestions,
  strengths,
  weaknesses
}) {
  const result = await pool.query(
    `
    INSERT INTO assessment_results (
      student_id,
      subject_id,
      exam_id,
      score,
      total_questions,
      strengths,
      weaknesses
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
    [
      studentId,
      subjectId,
      examId,
      score,
      totalQuestions,
      strengths,
      weaknesses
    ]
  );

  return result.rows[0];
}


// ==========================================
// CREAR SESIÓN DE PRÁCTICA
// ==========================================

export async function createPracticeSession({
  studentId,
  subjectId,
  topic,
  subtopic,
  initialLevel
}) {
  const result = await pool.query(
    `
    INSERT INTO practice_sessions (
      student_id,
      subject_id,
      topic,
      subtopic,
      initial_level,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'in_progress')
    RETURNING *;
    `,
    [
      studentId,
      subjectId,
      topic,
      subtopic,
      initialLevel
    ]
  );

  return result.rows[0];
}


// ==========================================
// GUARDAR RESPUESTA DE PRÁCTICA
// ==========================================

export async function savePracticeAnswer({
  sessionId,
  questionNumber,
  question,
  studentAnswer,
  correctAnswer,
  correct,
  difficulty
}) {
  const result = await pool.query(
    `
    INSERT INTO practice_answers (
      session_id,
      question_number,
      question,
      student_answer,
      correct_answer,
      correct,
      difficulty
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
    [
      sessionId,
      questionNumber,
      question,
      studentAnswer,
      correctAnswer,
      correct,
      difficulty
    ]
  );

  return result.rows[0];
}


// ==========================================
// FINALIZAR SESIÓN DE PRÁCTICA
// ==========================================

export async function finishPracticeSession({
  sessionId,
  totalExercises,
  correctAnswers,
  percentage,
  finalLevel
}) {
  const result = await pool.query(
    `
    UPDATE practice_sessions
    SET
      completed_at = CURRENT_TIMESTAMP,
      total_exercises = $2,
      correct_answers = $3,
      percentage = $4,
      final_level = $5,
      status = 'completed'
    WHERE id = $1
    RETURNING *;
    `,
    [
      sessionId,
      totalExercises,
      correctAnswers,
      percentage,
      finalLevel
    ]
  );

  return result.rows[0];
}