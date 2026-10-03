const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = vm.createContext({exports:{}});
vm.runInContext(ts.transpileModule(fs.readFileSync('shared/burnout-calendar.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
const c=context.exports;
const now=new Date('2026-10-03T12:00:00Z');
for (const enrollment of ['2026-05-19','2026-06-11']) {
 assert.equal(c.validateBlockSubmission(1,'2026-2027',enrollment,now),null);
 assert.match(c.validateBlockSubmission(2,'2026-2027',enrollment,now),/2026-10-11/);
 const missed=c.getPastBlocksSinceEnrollment(new Date('2026-09-01T00:00:00Z'),now);
 assert.equal(missed.length,1); assert.equal(missed[0].block,1);
}
assert.ok(c.validateBlockSubmission(2,'2026-2027','2026-06-11',new Date('2026-10-10T19:59:59Z')));
assert.equal(c.validateBlockSubmission(2,'2026-2027','2026-06-11',new Date('2026-10-10T20:00:00Z')),null);
assert.ok(c.validateBlockSubmission(1,'2026-2027','2026-09-27',now));
assert.ok(c.validateBlockSubmission(2,'2026-2028','2026-06-11',now));
assert.equal(c.getCurrentBlock(new Date('2027-01-18T00:00:00Z')).academicYear,'2026-2027');
assert.equal(c.getCurrentBlock(new Date('2027-01-18T00:00:00Z')).block,6);
assert.equal(c.getCurrentBlock(now).canSubmit,false);
assert.equal(c.blocksForYear(2026,now)[1].startDate.toISOString().slice(0,10),'2026-09-27');
console.log('Burnout calendar: named-resident eligibility, opening boundaries, rollover and invalid inputs passed.');
// Exercise the actual endpoint with a synthetic authenticated resident. No network or writes.
(async () => {
 let writes=0;
 const client={auth:{getUser:async()=>({data:{user:{id:'test-user'}}})},from:()=>({
   select(){return this},eq(){return this},limit(){return this},
   single:async()=>({data:{id:'resident',study_id:'study',enrollment_date:'2026-06-11'}}),
   insert(){writes++;throw new Error('Unexpected write before eligibility validation')}
 })};
 const api={exports:{},process:{env:{}},console,require:name=>name==='@supabase/supabase-js'?{createClient:()=>client}:{validateBlockSubmission:(b,ay,en)=>c.validateBlockSubmission(b,ay,en,now)}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('api/submit-block-assessment.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,api);
 for(const mismatch of [false,true]){
  let status,body;
  const res={status(s){status=s;return this},json(b){body=b;return this}};
  await api.exports.default({method:'POST',headers:{authorization:'Bearer synthetic'},body:{blockNumber:2,academicYear:'2026-2027',payload:{resident_id:'resident',study_id:'study',block_number:mismatch?1:2,academic_year:'2026-2027'},cbiData:{},phq9Data:{},gad7Data:{},isiData:{}}},res);
  assert.equal(status,400);assert.match(body.error,mismatch?/must match/:/2026-10-11/);
 }
 assert.equal(writes,0);
 console.log('API rejects early and mismatched submissions before any write.');
})().catch(e=>{console.error(e);process.exitCode=1});
