import {useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
import {blocksForYear,academicYearStart,omanToday} from '../../../shared/burnout-calendar';
export default function WhoopCoverage(){
 const [rows,setRows]=useState<any[]>([]),[sync,setSync]=useState<any[]>([]),[assessments,setAssessments]=useState<any[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);setError('');try{
  const [a,b,c]=await Promise.all([supabase.from('whoop_coverage_v').select('*').order('study_participant_id'),supabase.from('whoop_sync_state').select('resident_id,kind,status,error,completed_through,last_success,next_attempt'),supabase.from('block_assessments').select('resident_id,block_number,academic_year,assessment_date').limit(5000)]);
  if(a.error||b.error||c.error)throw a.error||b.error||c.error;
  setRows(a.data??[]);setSync(b.data??[]);setAssessments(c.data??[]);
 }catch(e:any){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const day=omanToday(),year=academicYearStart();
 return <div style={{padding:28}}><h1>WHOOP coverage and recovery</h1>
 <p>Post-enrollment data only, capped at 365 days and withdrawal. Archive jobs resume automatically every hour. A returned empty period is not proof of non-wear.</p>
 <button onClick={load} disabled={loading}>{loading?'Loading…':'Refresh coverage'}</button>
 {error&&<p role="alert">{error}</p>}
 <div style={{overflowX:'auto'}}><table style={{width:'100%',marginTop:20,borderCollapse:'collapse'}}><thead><tr>{['Resident','Daily / expected','HRV days','Sleep days','Latest day','Archive / action','Missing ended blocks','Timing flags'].map(t=><th key={t} style={{textAlign:'left',padding:8}}>{t}</th>)}</tr></thead><tbody>
 {rows.map(p=>{const jobs=sync.filter(s=>s.resident_id===p.resident_id),own=assessments.filter(a=>a.resident_id===p.resident_id),fail=jobs.filter(j=>j.error);
 const missing=blocksForYear(year).filter(b=>b.endDate<day&&p.enrollment_date<=b.endDate.toISOString().slice(0,10)&&!own.some(a=>a.block_number===b.block&&a.academic_year===b.academicYear));
 const earlyLate=own.filter(a=>{if(!a.block_number||!a.academic_year)return false;const b=blocksForYear(Number(a.academic_year.slice(0,4))).find(b=>b.block===a.block_number);return b&&(a.assessment_date<b.submissionOpensDate.toISOString().slice(0,10)||a.assessment_date>b.endDate.toISOString().slice(0,10))}).length;
 const action=fail.some(j=>['reconnect_required','connection_missing'].includes(j.error))?'Resident connection/reconnection needed':fail.some(j=>j.error==='permission_required')?'WHOOP permission review needed':fail.length?'Import error — coordinator review':jobs.length<4?'Not queued / enrollment review':jobs.some(j=>!j.completed_through||new Date(j.completed_through)<new Date(day.getTime()-86400000))?'Backfill pending':'Archive queried; remaining gaps need sync/wear review';
 return <tr key={p.resident_id}>{[p.study_participant_id,`${p.recorded_days} / ${p.expected_days??'unknown'}`,p.hrv_days,p.sleep_days,p.latest_day??'None',action,missing.map(b=>b.block).join(', ')||'None',earlyLate].map((v,i)=><td key={i} style={{padding:8,borderBottom:'1px solid #ddd'}}>{v}</td>)}</tr>})}
 </tbody></table></div><p>Timing flags indicate early or late submissions for review, not deletion. Existing responses are preserved. Daily rows can have partial measurements; workouts and naps are retained individually in the secure source archive.</p></div>;
}
