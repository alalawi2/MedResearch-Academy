import fs from 'fs';
const journal = JSON.parse(fs.readFileSync('drizzle/meta/_journal.json', 'utf8'));
journal.entries = journal.entries.slice(0, -1); // Remove last entry
fs.writeFileSync('drizzle/meta/_journal.json', JSON.stringify(journal, null, 2));
console.log('✓ Journal fixed');
