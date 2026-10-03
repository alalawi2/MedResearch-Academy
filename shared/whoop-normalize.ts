const DAY=86400000;
export function studyWindow(enrollment:string,withdrawal:string|null,now=new Date()) {
 const start=new Date(enrollment+'T00:00:00+04:00');
 const end=new Date(Math.min(now.getTime(),start.getTime()+365*DAY,withdrawal?new Date(withdrawal+'T00:00:00+04:00').getTime():Infinity));
 return {start,end};
}
export function omanDay(value:string){return new Date(new Date(value).getTime()+4*3600000).toISOString().slice(0,10)}
export function normalizeWhoop(records:{kind:string,payload:any}[],start:Date,end:Date) {
 const cycles=new Map(records.filter(r=>r.kind==='cycle').map(r=>[String(r.payload.id),r.payload]));
 const sleeps=new Map(records.filter(r=>r.kind==='sleep').map(r=>[String(r.payload.id),r.payload]));
 const rows=new Map<string,any>();
 const add=(when:string|undefined,patch:any)=>{
  if(!when)return; const time=new Date(when).getTime();
  if(!Number.isFinite(time)||time<start.getTime()||time>=end.getTime())return;
  const day=omanDay(when); rows.set(day,{...rows.get(day),date:day,...Object.fromEntries(Object.entries(patch).filter(([,v])=>v!=null))});
 };
 const minutes=(x:any)=>typeof x==='number'?x/60000:null;
 // Deterministic ordering; multiple source events remain intact in the archive.
 for(const {kind,payload:p} of [...records].sort((a,b)=>(a.payload.start??a.payload.updated_at??'').localeCompare(b.payload.start??b.payload.updated_at??''))){
  if(p.score_state!=='SCORED'||!p.score)continue; const s=p.score;
  if(kind==='cycle')add(p.start,{cycle_id:String(p.id),daily_strain:s.strain,avg_hr_bpm:s.average_heart_rate,max_hr_bpm:s.max_heart_rate,kilojoules:s.kilojoule});
  if(kind==='recovery'){
   // Join by WHOOP IDs, never by API created_at (which is an ingestion timestamp).
   const when=sleeps.get(String(p.sleep_id))?.end??cycles.get(String(p.cycle_id))?.start;
   add(when,{cycle_id:String(p.cycle_id),hrv_rmssd_ms:s.hrv_rmssd_milli,resting_hr_bpm:s.resting_heart_rate,recovery_score:s.recovery_score,spo2_pct:s.spo2_percentage,skin_temp_c:s.skin_temp_celsius,user_calibrating:s.user_calibrating});
  }
  if(kind==='sleep'&&!p.nap){const st=s.stage_summary??{},sn=s.sleep_needed??{};
   const stages=[st.total_light_sleep_time_milli,st.total_slow_wave_sleep_time_milli,st.total_rem_sleep_time_milli];
   add(p.end,{sleep_id:String(p.id),total_sleep_min:stages.every(x=>typeof x==='number')?stages.reduce((a,b)=>a+b,0)/60000:null,
    light_sleep_min:minutes(st.total_light_sleep_time_milli),deep_sleep_min:minutes(st.total_slow_wave_sleep_time_milli),rem_sleep_min:minutes(st.total_rem_sleep_time_milli),awake_min:minutes(st.total_awake_time_milli),
    sleep_efficiency_pct:s.sleep_efficiency_percentage,sleep_consistency_pct:s.sleep_consistency_percentage,sleep_performance_pct:s.sleep_performance_percentage,respiratory_rate:s.respiratory_rate,
    disturbance_count:st.disturbance_count,sleep_cycle_count:st.sleep_cycle_count,sleep_onset_time:p.start,sleep_end_time:p.end,
    sleep_debt_min:minutes(sn.need_from_sleep_debt_milli),sleep_need_baseline_min:minutes(sn.baseline_milli),sleep_need_strain_min:minutes(sn.need_from_recent_strain_milli)});
  }
 }
 return [...rows.values()];
}
