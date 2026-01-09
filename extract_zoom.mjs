import Database from 'better-sqlite3';

const db = new Database('./db.sqlite');
const lectures = db.prepare("SELECT id, title, zoomLink FROM lectures ORDER BY id").all();

console.log("All lectures:");
lectures.forEach(lecture => {
  console.log(`\nID: ${lecture.id}`);
  console.log(`Title: ${lecture.title}`);
  console.log(`Zoom Link: ${lecture.zoomLink || 'NULL'}`);
});

db.close();
