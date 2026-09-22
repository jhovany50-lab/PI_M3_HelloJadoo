import {
  getStudent,
  getStudentSchedule,
  getPendingTasks,
  getStudentExams,
  getAssessmentResults
} from "./queries.js";

const studentId = 1;

try {
  const student = await getStudent(studentId);
  const schedule = await getStudentSchedule(studentId);
  const tasks = await getPendingTasks(studentId);
  const exams = await getStudentExams(studentId);
  const results = await getAssessmentResults(studentId);

  console.log("\n👧 ESTUDIANTE");
  console.log(student);

  console.log("\n📚 HORARIO");
  console.log(schedule);

  console.log("\n📝 TAREAS PENDIENTES");
  console.log(tasks);

  console.log("\n🧪 EXÁMENES");
  console.log(exams);

  console.log("\n📊 RESULTADOS DE EVALUACIONES");
  console.log(results);

} catch (error) {
  console.error("❌ Error al consultar PostgreSQL:");
  console.error(error.message);
}