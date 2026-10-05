// Explicit production E2E: creates an email-less synthetic participant, then removes
// exactly the records and Auth account created by this run. No email is sent.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const origin='https://www.medresearch-academy.om';
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,options);
const browser=createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY,options);
const run=randomUUID(),email=`codex-e2e-${run}@example.invalid`,password=randomUUID()+'Aa9!';
const check=r=>{if(r.error)throw r.error;return r.data;};
let uid,rid;
try{
 const study=check(await admin.from('studies').select('id').eq('slug','resident-burnout').single());
 uid=check(await admin.auth.admin.createUser({email,password,email_confirm:true})).user.id;
 rid=check(await admin.from('burnout_participants').insert({study_id:study.id,study_participant_id:'RES-TEST-E2E-'+run,full_name:'SYNTHETIC E2E — DELETE AFTER TEST',email:null,auth_user_id:uid,status:'active',enrollment_date:'2026-05-01'}).select('id').single()).id;
 const session=check(await browser.auth.signInWithPassword({email,password})).session;
 const base={payload:{resident_id:rid,study_id:study.id,rotation_name:'SYNTHETIC E2E',block_number:1,academic_year:'2026-2027'},blockNumber:1,academicYear:'2026-2027',cbiData:{items:{},personal_score:0,work_score:0,patient_score:0},phq9Data:{items:{},total_score:0,severity:'minimal'},gad7Data:{items:{},total_score:0,severity:'minimal'},isiData:{items:{},total_score:0,severity:'none'}};
 const submit=async(body,expected=200)=>{
  const r=await fetch(origin+'/api/submit-block-assessment',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify(body)});
  const result=await r.json();assert.equal(r.status,expected,JSON.stringify(result));return result;
 };
 const first=await submit(base);assert.equal(first.saved,true);assert.equal(first.already_submitted,false);
 const duplicate=await submit(base);assert.equal(duplicate.id,first.id);assert.equal(duplicate.already_submitted,true);
 for(const table of ['cbi_responses','phq9_responses','gad7_responses','isi_responses']){
  assert.equal(check(await admin.from(table).select('id').eq('block_assessment_id',first.id)).length,1);
 }
 const older={...base,blockNumber:13,academicYear:'2025-2026',payload:{...base.payload,block_number:13,academic_year:'2025-2026'}};
 const second=await submit(older);assert.notEqual(second.id,first.id);
 const baseline={...base,blockNumber:null,academicYear:null,payload:{...base.payload,block_number:null,academic_year:null,rotation_name:'BASELINE'}};
 await submit(baseline);
 assert.equal(check(await admin.from('burnout_participants').select('baseline_completed').eq('id',rid).single()).baseline_completed,true);
 await submit({...base,blockNumber:2,payload:{...base.payload,block_number:2}},400);
 await submit({...base,payload:{...base.payload,resident_id:randomUUID()}},403);
 assert((await browser.from('block_assessments').insert({...base.payload,block_number:3})).error,'Browser must not bypass API');
 check(await admin.from('burnout_participants').update({status:'withdrawn'}).eq('id',rid));
 await submit(base,403);
 console.log('PASS: real Auth login → API → five linked database records; duplicate retry; two blocks same day; baseline flag; future-block, identity, direct-write and withdrawal rejection.');
}finally{
 if(rid){
  for(const table of ['cbi_responses','phq9_responses','gad7_responses','isi_responses','block_assessments','submission_error_log','enrollment_events'])check(await admin.from(table).delete().eq('resident_id',rid));
  check(await admin.from('burnout_participants').delete().eq('id',rid).eq('study_participant_id','RES-TEST-E2E-'+run));
  assert.equal(check(await admin.from('burnout_participants').select('id').eq('id',rid)).length,0);
 }
 if(uid)check(await admin.auth.admin.deleteUser(uid));
 console.log('Synthetic participant, test responses and temporary Auth account removed; no participant email sent.');
}
