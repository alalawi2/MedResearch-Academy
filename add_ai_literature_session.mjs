import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'sqlite.db'));

// Session date: January 14, 2026, 20:00 Muscat Time (GMT+4)
// Convert to UTC: 20:00 - 4 hours = 16:00 UTC
const sessionDate = new Date('2026-01-14T16:00:00.000Z');

const session = {
  title: 'Beyond PubMed: AI-Powered Literature Search - Applications and Ethics',
  description: `Join Dr. Mohamed Al Rawahi for an exploration of cutting-edge AI tools revolutionizing medical literature search and research synthesis.

**Learning Objectives:**
• Understand the capabilities and limitations of AI-powered literature search tools beyond traditional databases
• Learn practical applications of AI for efficient evidence synthesis and systematic reviews
• Explore ethical considerations when using AI in medical research and publication
• Discover strategies to integrate AI tools into your research workflow while maintaining academic integrity

**Speaker:** Dr. Mohamed Al Rawahi, MD, MSc, FRCPC, ABIM
Senior Consultant in Cardiac Electrophysiology

Duration: 60 minutes (20:00-21:00 Muscat Time)`,
  sessionDate: sessionDate.getTime(),
  zoomLink: 'https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1',
  videoUrl: null,
  uploadedBy: 1,
  speakerName: 'Dr. Mohamed Al Rawahi',
  speakerPhoto: '/images/dr-rawahi.jpg',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

try {
  const stmt = db.prepare(`
    INSERT INTO lectures (title, description, sessionDate, zoomLink, videoUrl, uploadedBy, speakerName, speakerPhoto, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    session.title,
    session.description,
    session.sessionDate,
    session.zoomLink,
    session.videoUrl,
    session.uploadedBy,
    session.speakerName,
    session.speakerPhoto,
    session.createdAt,
    session.updatedAt
  );
  
  console.log('✅ Session created successfully!');
  console.log('Session ID:', result.lastInsertRowid);
  console.log('Title:', session.title);
  console.log('Date:', new Date(session.sessionDate).toLocaleString('en-US', { timeZone: 'Asia/Muscat' }));
  console.log('Zoom Link:', session.zoomLink);
} catch (error) {
  console.error('❌ Error creating session:', error);
  process.exit(1);
} finally {
  db.close();
}
