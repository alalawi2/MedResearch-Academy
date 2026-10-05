import {createClient} from '@supabase/supabase-js';
import {authorizedJob,allRows,deliverEmail,escapeHtml} from '../shared/notification-safety.js';
import {loadCoverage} from '../shared/whoop-coverage.js';
import {getPastBlocksSinceEnrollment,omanToday} from '../shared/burnout-calendar.js';
export default async function handler(req:any,res:any){
 if(!authorizedJob(req))return res.status(401).json({error:'Unauthorized'});
 try{
  const db=createClient(process.env.VITE_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const now=new Date(),today=omanToday(now).toISOString().slice(0,10);
  const participants=(await allRows(()=>db.from('burnout_participants').select('id,study_participant_id,full_name,email,enrollment_date,coordinator_email,coordinator_name,demographics_completed,baseline_completed').eq('status','active').order('id'))).filter(p=>/^RES-\d+$/.test(p.study_participant_id));
  const coverage=await loadCoverage(db,participants);
  const assessments=await allRows(()=>db.from('block_assessments').select('id,resident_id,block_number,academic_year').order('id'));
  const groups=new Map<string,any[]>();
  for(const p of participants){
   if(!p.coordinator_email)continue;
   const done=new Set(assessments.filter(a=>a.resident_id===p.id).map(a=>`${a.block_number}:${a.academic_year}`));
   const enrollment=p.enrollment_date?new Date(p.enrollment_date+'T00:00:00Z'):null;
   const expected=enrollment?getPastBlocksSinceEnrollment(enrollment,now).filter(b=>b.startDate.getTime()<enrollment.getTime()+365*86400000):[];
   const missing=expected.filter(b=>!done.has(`${b.block}:${b.academicYear}`));
   const c=coverage.get(p.id)!;
   const row={participant:p.study_participant_id,name:p.full_name,coverage:c,missing:missing.map(b=>`Block ${b.block} (${b.academicYear})`),baseline_complete:p.baseline_completed&&p.demographics_completed};
   groups.set(p.coordinator_email,[...(groups.get(p.coordinator_email)||[]),row]);
  }
  const dryRun=req.query?.dry_run==='true';let sent=0;
  for(const [email,members] of groups){
   if(dryRun)continue;
   const rows=members.map(m=>`<tr><td>${escapeHtml(m.name)} (${m.participant})</td><td>${m.coverage.pct===null?escapeHtml(m.coverage.state):`${m.coverage.recorded}/${m.coverage.expected} days (${m.coverage.pct}%)`}</td><td>${escapeHtml(m.missing.join(', ')||'None')}</td><td>${m.baseline_complete?'Complete':'Incomplete'}</td></tr>`).join('');
   await deliverEmail({from:'OMSB Burnout Study <info@medresearch-academy.om>',to:[email],cc:['dr.abdullahalalawi@gmail.com','mrawahi@squ.edu.om','tamadhiralmahrouqi@gmail.com'],subject:`OMSB Burnout Study — Weekly data and assessment report (${today})`,html:`<p>WHOOP percentages describe days with research data, not continuous wear. Connection review or sync pending means the data pipeline needs review; do not classify those residents as noncompliant.</p><table border="1" cellpadding="8"><tr><th>Resident</th><th>WHOOP data</th><th>Past assessments missing</th><th>Enrollment forms</th></tr>${rows}</table><p>Assessment expectations use the official block calendar and each resident's enrollment date, capped at one year.</p>`});sent++;
  }
  return res.json({dry_run:dryRun,sent,coordinators:groups.size,...(dryRun?{groups:Array.from(groups.values())}:{})});
 }catch(e:any){return res.status(503).json({error:e.message});}
}
