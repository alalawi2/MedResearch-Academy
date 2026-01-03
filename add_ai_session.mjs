import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { lectures } from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const sessionDate = new Date('2026-01-14T20:00:00+04:00'); // 8 PM Muscat time

await db.insert(lectures).values({
  title: 'Week 2: Beyond PubMed: AI-Powered Literature Search',
  description: `Applications and Ethics

Learning Objectives:
1. Understand how AI tools enhance literature search beyond traditional databases.
2. Apply AI-powered methods to efficiently identify, screen, and synthesize scientific evidence.
3. Recognize ethical considerations and best practices when using AI in literature search.

Duration: 60 minutes (20:00-21:00 Muscat Time)`,
  sessionDate: sessionDate,
  zoomLink: 'https://zoom.us/j/example', // Will be updated with actual link
  videoUrl: null,
  uploadedBy: 1,
});

console.log('✅ Session created successfully!');
await connection.end();
