import {normalizeWhoop,omanDay} from './whoop-normalize.js';
type Event={kind:string,payload:any};
const finite=(v:any)=>typeof v==='number'&&Number.isFinite(v);
const sleepMinutes=(p:any)=>{
 const s=p.score?.stage_summary;
 const values=[s?.total_light_sleep_time_milli,s?.total_slow_wave_sleep_time_milli,s?.total_rem_sleep_time_milli];
 return values.every(finite)?values.reduce((a,b)=>a+b,0)/60000:null;
};
function overlaps(events:any[]){
 const ranges=events.map(p=>[Date.parse(p.start),Date.parse(p.end)]).sort((a,b)=>a[0]-b[0]);
 if(ranges.some(([s,e])=>!Number.isFinite(s)||!Number.isFinite(e)||e<=s))return true;
 let end=-Infinity;
 for(const [s,e] of ranges){if(s<end)return true;end=Math.max(end,e)}
 return false;
}
// Version 2: observed events, not inferred wear. Sleep is attributed to its end
// date, workouts/cycles to their start date in Oman. Strain is never additive.
export function summarizeWhoop(records:Event[],start:Date,end:Date){
 const unique=new Map<string,Event>();
 for(const r of records){
  const id=r.kind==='recovery'?r.payload.cycle_id:r.payload.id;
  if(id==null)continue;
  const key=r.kind+':'+id,old=unique.get(key);
  const time=(e:Event)=>Date.parse(e.payload.updated_at)||0;
  if(!old||time(r)>time(old)||(time(r)===time(old)&&JSON.stringify(r.payload)>JSON.stringify(old.payload)))unique.set(key,r);
 }
 const all=[...unique.values()];
 const days=new Map<string,Event[]>();
 for(const r of all){
  if(r.kind==='recovery')continue;
  const when=r.kind==='sleep'?r.payload.end:r.payload.start,time=Date.parse(when);
  if(!Number.isFinite(time)||time<+start||time>=+end)continue;
  const day=omanDay(when);days.set(day,[...(days.get(day)??[]),r]);
 }
 return [...days].sort(([a],[b])=>a.localeCompare(b)).map(([date,events])=>{
  const get=(kind:string)=>events.filter(r=>r.kind===kind).map(r=>r.payload);
  const sleeps=get('sleep'),naps=sleeps.filter(p=>p.nap),workouts=get('workout'),cycles=get('cycle');
  const scored=(p:any)=>p.score_state==='SCORED'&&p.score;
  const primary=sleeps.filter(p=>!p.nap&&scored(p)).sort((a,b)=>(sleepMinutes(b)??-1)-(sleepMinutes(a)??-1)||String(a.id).localeCompare(String(b.id)))[0];
  const recovery=primary&&all.find(r=>r.kind==='recovery'&&String(r.payload.sleep_id)===String(primary.id));
  const cycle=cycles.find(p=>String(p.id)===String(recovery?.payload.cycle_id))??cycles.filter(scored).sort((a,b)=>String(a.start).localeCompare(String(b.start))||String(a.id).localeCompare(String(b.id)))[0];
  const chosen:Event[]=[];
  if(cycle)chosen.push({kind:'cycle',payload:cycle});
  if(primary)chosen.push({kind:'sleep',payload:primary});
  if(recovery)chosen.push(recovery);
  const metrics=normalizeWhoop(chosen,start,end).find(r=>r.date===date)??{date};
  const sleepOverlap=overlaps(sleeps),workoutOverlap=overlaps(workouts);
  const sum=(list:any[],value:(p:any)=>any,invalid:boolean)=>!list.length||invalid||list.some(p=>!scored(p)||!finite(value(p)))?null:list.reduce((s,p)=>s+value(p),0);
  return {date,metrics:{...metrics,
   observed_nap_count:naps.length,observed_workout_count:workouts.length,
   nap_sleep_min:sum(naps,sleepMinutes,sleepOverlap),
   all_sleep_min:sum(sleeps,sleepMinutes,sleepOverlap),
   workout_duration_min:sum(workouts,p=>(Date.parse(p.end)-Date.parse(p.start))/60000,workoutOverlap),
   workout_kilojoules:sum(workouts,p=>p.score?.kilojoule,workoutOverlap),
   // Per-event strain retained; never sum workouts or add them to cycle strain.
   workout_strains:workouts.filter(scored).map(p=>p.score.strain).filter(finite),
  },quality:{sleep_overlap:sleepOverlap,workout_overlap:workoutOverlap,multiple_cycles:cycles.length>1,
   unscored_sleep_count:sleeps.filter(p=>!scored(p)).length,unscored_workout_count:workouts.filter(p=>!scored(p)).length,
   counts_are_observed:true},source_ids:[...events.map(r=>r.kind+':'+r.payload.id),...(recovery?['recovery:'+recovery.payload.cycle_id]:[])].sort()};
 });
}

// Alternate historical pages with normal recent refreshes, preserving cursors.
export function nextWhoopWindow(job:any,bounds:{start:Date,end:Date},now=Date.now()){
 const day=86400000,through=Date.parse(job.completed_through);
 const caughtUp=through>=+bounds.end-day;
 const historical=caughtUp&&job.reconcile_mode!==true&&(!job.reconcile_due_at||Date.parse(job.reconcile_due_at)<=now);
 let start=historical?Math.max(+bounds.start,Date.parse(job.reconcile_cursor)||+bounds.start):caughtUp?Math.max(+bounds.start,+bounds.end-14*day):through;
 if(!Number.isFinite(start)||start>=+bounds.end)start=+bounds.start;
 return {window_start:new Date(start).toISOString(),window_end:new Date(Math.min(+bounds.end,start+28*day)).toISOString(),next_token:null,status:'pending',reconcile_mode:historical};
}
