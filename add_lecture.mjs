import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { lectures } from "./drizzle/schema.ts";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

await db.insert(lectures).values({
  title: "Week 1: From Clinical Observation to Research Question",
  description: "Welcome to the first session of the MedResearch Academy, a 16-week virtual series designed to empower Omani health professionals with essential research skills. In this session, we explore how to transform everyday clinical observations into meaningful research questions.",
  videoUrl: "https://www.youtube.com/watch?v=slJYaAXdG5k",
  fileName: null,
  fileUrl: null,
  fileSize: null,
  uploadedBy: 1,
});

console.log("Lecture added successfully!");
await connection.end();
