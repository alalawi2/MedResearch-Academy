// Run with node --env-file=.env.incident.local tests/production-notification-check.mjs
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const origin='https://www.medresearch-academy.om';
const headers={Authorization:`Bearer ${process.env.CRON_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY}`};
for(const path of ['/api/adherence-check','/api/coordinator-adherence-report','/api/questionnaire-reminder','/api/export-study-data','/api/whoop/daily-pull']){
 const r=await fetch(origin+path);assert.equal(r.status,401,path);console.log(path,'unauthenticated rejected');
}
const account=await fetch(origin+'/api/create-resident-account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ownership-test@example.com',password:'Test-no-account-created-123!'})});
assert.equal(account.status,401);console.log('Unverified account/password setup rejected');
for(const path of ['/api/adherence-check','/api/coordinator-adherence-report']){
 const r=await fetch(origin+path+'?dry_run=true',{headers});assert.equal(r.status,200);const body=await r.json();assert.equal(body.dry_run,true);
 if(body.results){const actions={};for(const p of body.results)actions[p.action]=(actions[p.action]||0)+1;console.log(path,JSON.stringify({checked:body.checked,actions,maryam:body.results.find(p=>p.participant==='RES-003')}));}
 else console.log(path,JSON.stringify({coordinators:body.coordinators,sent:body.sent}));
}
for(const path of ['/api/questionnaire-reminder','/api/weekly-shift-email']){
 const response=await fetch(origin+path+'?dry_run=true',{headers});assert.equal(response.status,200);const result=await response.json();assert.equal(result.dry_run,true);assert.equal(result.sent,0);
 console.log(path,'planned successfully without sending or recording reminders');
}
const exportResponse=await fetch(origin+'/api/export-study-data?format=counts',{headers});assert.equal(exportResponse.status,200);const exportCounts=await exportResponse.json();
assert(exportCounts.counts.whoop_daily>1000,'Export must paginate beyond the database default cap');console.log('Export counts:',JSON.stringify(exportCounts.counts));
const pageResponse=await fetch(origin+'/api/export-study-data?table=whoop_daily&limit=2&offset=0',{headers});assert.equal(pageResponse.status,200);const page=await pageResponse.json();assert.equal(page.rows.length,2);assert.equal(page.next_offset,2);assert(page.rows.every(r=>r.participant_id&&!r.resident_id));
const anomaly=await fetch(origin+'/api/anomaly-detect',{headers});assert.equal((await anomaly.json()).paused,true);
console.log('Unvalidated anomaly emails paused');
const db=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const {data:repairs,error}=await db.from('enrollment_date_repairs').select('old_date,restored_date');if(error)throw error;
console.log('Enrollment repairs:',repairs.length);
const shift=await fetch(origin+'/api/shift-study-auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'get_my_timepoints',participant_id:'00000000-0000-0000-0000-000000000001'})});
assert.equal(shift.status,401);console.log('Cognitive Shifts rejects an unsigned participant ID');
const anonymous=createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY);
assert((await anonymous.from('whoop_tokens').select('id').limit(0)).error,'Anonymous credentials query must fail');
assert((await anonymous.from('surveys').select('researcher_password').limit(0)).error,'Legacy passwords must not be readable');
const responseRows=await anonymous.from('survey_responses').select('id').limit(1);assert.equal(responseRows.data?.length,0);
const {data:corrections}=await db.from('adherence_alerts').select('id').not('correction_sent_at','is',null).gte('created_at','2026-10-03');
assert.equal(corrections.length,5);console.log('Five correction emails recorded; anonymous database privacy checks passed');
