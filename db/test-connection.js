import { pool } from "./config.js";

try {
  const result = await pool.query("SELECT NOW()");

  console.log("✅ Conexión con PostgreSQL exitosa.");
  console.log("🕐 Hora del servidor:", result.rows[0].now);

} catch (error) {
  console.error("❌ Error al conectar con PostgreSQL:");
  console.error(error.message);

} finally {
  await pool.end();
}