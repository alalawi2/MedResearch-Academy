import Database from 'better-sqlite3';

const db = new Database('./db.sqlite');
const result = db.prepare("SELECT zoomLink FROM lectures WHERE title LIKE '%Beyond PubMed%' LIMIT 1").get();

if (result && result.zoomLink) {
  console.log(result.zoomLink);
} else {
  console.log("No Zoom link found");
}

db.close();
