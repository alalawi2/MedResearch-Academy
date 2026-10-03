const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/lib/thalassemia.ts', 'utf8');
const start = source.indexOf('export function generateVisitSchedule');
const end = source.indexOf('// ── Investigation file queries', start);
const code = ts.transpileModule(source.slice(start, end).replace('export function', 'function'), {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
for (const timezone of ['Asia/Muscat', 'UTC', 'America/New_York']) {
  process.env.TZ = timezone;
  const context = vm.createContext({Date});
  vm.runInContext(code, context);
  const schedule = vm.runInContext("generateVisitSchedule('2026-08-31')", context);
  assert.equal(schedule[1].expected_date, '2027-02-28');
  assert.equal(schedule[2].expected_date, '2027-08-31');
  assert.equal(schedule[0].window_end, '2026-09-14');
}
console.log('Visit date tests passed in Muscat, UTC and New York.');
