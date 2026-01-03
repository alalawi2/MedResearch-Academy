import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

try {
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("DROP TABLE IF EXISTS reminders");
  await connection.execute("DROP TABLE IF EXISTS sessions");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("✓ Tables dropped successfully");
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await connection.end();
}
