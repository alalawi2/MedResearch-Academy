// Explicit operational rebuild: defaults to read-only. No credentials in output.
// node --env-file=/secure/production.env tests/rebuild-whoop-summaries.cjs [--write]
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {createClient}=require('@supabase/supabase-js');
function load(path,imports={}){const ctx={exports:{},require:n=>imports[n]};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,ctx);return ctx.exports}
const normal=load('shared/whoop-normalize.ts');
const {summarizeWhoop}=load('shared/whoop-summary.ts',{'./whoop-normalize.js':normal});
const db=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
function check(r){if(r.error)throw Error(r.error.message);return r.data}
(async()=>{
 const people=check(await db.from('burnout_participants').select('id,enrollment_date,withdrawal_date,study_participant_id').eq('status','active'));
 const stats={participants:0,source_events:0,summary_days:0,nap_events:0,workout_events:0,overlapping_sleep_days:0,overlapping_workout_days:0,changed_main_sleep_days:0,written:process.argv.includes('--write')};
 for(const p of people){
  if(!/^RES-\d+$/.test(p.study_participant_id)||!p.enrollment_date)continue;
  const selected=process.argv.find(a=>a.startsWith('--participants='))?.split('=')[1].split(',');
  if(selected&&!selected.includes(p.study_participant_id))continue;
  const records=[];
  for(let offset=0;;offset+=1000){const data=check(await db.from('whoop_source_records').select('kind,payload').eq('resident_id',p.id).order('kind').order('source_id').range(offset,offset+999));records.push(...data);if(data.length<1000)break}
  const {start,end}=normal.studyWindow(p.enrollment_date,p.withdrawal_date);
  const rows=summarizeWhoop(records,start,end),old=new Map(normal.normalizeWhoop(records,start,end).map(r=>[r.date,r]));
  for(const r of rows){
   if(r.date<normal.omanDay(start.toISOString())||r.date>normal.omanDay(end.toISOString()))throw Error('Consent boundary violation');
   stats.nap_events+=r.metrics.observed_nap_count;stats.workout_events+=r.metrics.observed_workout_count;
   stats.overlapping_sleep_days+=Number(r.quality.sleep_overlap);stats.overlapping_workout_days+=Number(r.quality.workout_overlap);
   if(old.get(r.date)?.total_sleep_min!==r.metrics.total_sleep_min)stats.changed_main_sleep_days++;
  }
  if(stats.written)for(let i=0;i<rows.length;i+=100)check(await db.rpc('save_whoop_summaries',{rid:p.id,rows_json:rows.slice(i,i+100)}));
  stats.participants++;stats.source_events+=records.length;stats.summary_days+=rows.length;
 }
 console.log(JSON.stringify(stats,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1});
