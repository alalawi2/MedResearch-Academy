import { omanToday } from './burnout-calendar.js';
import { allRows } from './notification-safety.js';
const DAY=86400000;
export function coverageWindow(enrollment:string|null,now=new Date()) {
 const end=omanToday(now).getTime();
 const enrolled=enrollment?Date.parse(enrollment.slice(0,10)+'T00:00:00Z'):NaN;
 const studyEnd=enrolled+365*DAY;
 const start=Math.max(enrolled,end-28*DAY);
 const expected=Math.max(0,Math.round((Math.min(end,studyEnd)-start)/DAY));
 return {start:Number.isFinite(start)?new Date(start).toISOString().slice(0,10):null,end:new Date(end).toISOString().slice(0,10),expected:Number.isFinite(expected)?expected:0,finished:end>=studyEnd};
}
export function assessCoverage(p:any,days:any[],jobs:any[],now=new Date()) {
 const w=coverageWindow(p.enrollment_date,now);
 const valid=days.filter(d=>w.start&&d.date>=w.start&&d.date<w.end&&!d.is_nap && ['hrv_rmssd_ms','resting_hr_bpm','total_sleep_min','daily_strain','recovery_score'].some(k=>typeof d[k]==='number'));
 const recorded=new Set(valid.map(d=>d.date)).size;
 const endInstant=Date.parse(w.end+'T00:00:00+04:00');
 let state='ready';
 if(!w.start)state='enrollment_review';
 else if(w.finished)state='study_complete';
 else if(w.expected<7)state='enrollment_grace';
 else if(jobs.some(j=>['reconnect_required','connection_missing','permission_required'].includes(j.error)))state='connection_review';
 else if(!['cycle','sleep','recovery'].every(kind=>jobs.some(j=>j.kind===kind&&!j.error&&Date.parse(j.completed_through)>=endInstant&&Date.parse(j.last_success)>=now.getTime()-36*3600000)))state='sync_pending';
 return {...w,recorded,pct:state==='ready'?Math.min(100,Math.round(recorded/w.expected*100)):null,state};
}
export async function loadCoverage(db:any,participants:any[],now=new Date()) {
 const since=new Date(omanToday(now).getTime()-28*DAY).toISOString().slice(0,10);
 const [days,jobs]=await Promise.all([
  allRows(()=>db.from('whoop_daily').select('id,resident_id,date,is_nap,hrv_rmssd_ms,resting_hr_bpm,total_sleep_min,daily_strain,recovery_score').gte('date',since).order('id')),
  allRows(()=>db.from('whoop_sync_state').select('resident_id,kind,error,completed_through,last_success').order('resident_id').order('kind')),
 ]);
 return new Map(participants.map(p=>[p.id,assessCoverage(p,days.filter(d=>d.resident_id===p.id),jobs.filter(j=>j.resident_id===p.id),now)]));
}
