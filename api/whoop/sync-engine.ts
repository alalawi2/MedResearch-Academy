import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import {normalizeWhoop,studyWindow} from '../../shared/whoop-normalize.js';
import {coverageWindow,assessCoverage} from '../../shared/whoop-coverage.js';
const PATHS:Record<string,string>={cycle:'/cycle',sleep:'/activity/sleep',recovery:'/recovery',workout:'/activity/workout'};
const DAY=86400000;
export function syncClient(){return createClient(process.env.VITE_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(20000)})}})}
function checked<T extends {error?:any}>(r:T):T{if(r.error)throw new Error(r.error.message??'Database write failed');return r}
async function request(url:string,options:any={}){
 for(let attempt=0;attempt<3;attempt++){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});
  if(response.ok)return response.json();
  if((response.status===429||response.status>=500)&&attempt<2){
   const retry=Number(response.headers.get('retry-after')??0);
   if(retry>10)throw new Error('rate_limited');
   await new Promise(r=>setTimeout(r,Math.max(retry*1000,1000*2**attempt)));continue;
  }
  throw new Error(response.status===401?'reconnect_required':response.status===403?'permission_required':response.status===429?'rate_limited':`WHOOP_HTTP_${response.status}`);
 }
 throw new Error('WHOOP request failed');
}
async function accessToken(db:any,resident:string,force=false){
 const {data:t}=checked(await db.from('whoop_tokens').select('id,access_token,refresh_token,expires_at').eq('resident_id',resident).maybeSingle()) as any;
 if(!t)throw new Error('connection_missing');
 if(!force&&new Date(t.expires_at).getTime()>Date.now()+120000)return t.access_token;
 if(!t.refresh_token)throw new Error('reconnect_required');
 let value:any;
 try{value=await request('https://api.prod.whoop.com/oauth/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:t.refresh_token,client_id:process.env.WHOOP_CLIENT_ID!,client_secret:process.env.WHOOP_CLIENT_SECRET!})});}
 catch(e:any){if(e.message==='WHOOP_HTTP_400')throw new Error('reconnect_required');throw e;}
 checked(await db.from('whoop_tokens').update({access_token:value.access_token,refresh_token:value.refresh_token??t.refresh_token,expires_at:new Date(Date.now()+value.expires_in*1000).toISOString(),token_status:'active',consecutive_failures:0,updated_at:new Date().toISOString()}).eq('id',t.id));
 return value.access_token;
}
async function materialize(db:any,p:any,bounds:{start:Date,end:Date}){
 const records:any[]=[];
 for(let offset=0;;offset+=1000){
  const {data}=checked(await db.from('whoop_source_records').select('kind,payload').eq('resident_id',p.id).order('kind').order('source_id').range(offset,offset+999)) as any;
  records.push(...data);if(data.length<1000)break;
 }
 const rows=normalizeWhoop(records,bounds.start,bounds.end);
 for(let i=0;i<rows.length;i+=100)checked(await db.rpc('merge_whoop_days',{rid:p.id,rows_json:rows.slice(i,i+100)}));
 // Keep the existing summary dashboards working. Source events remain in the archive.
 const window=coverageWindow(p.enrollment_date);
 const recent=rows.filter(r=>window.start&&r.date>=window.start&&r.date<window.end);
 const {data:jobs}=checked(await db.from('whoop_sync_state').select('kind,error,completed_through,last_success').eq('resident_id',p.id)) as any;
 const coverage=assessCoverage(p,rows,jobs);
 if(recent.length){
  const summary:any={resident_id:p.id,study_id:p.study_id,period_start:window.start,period_end:new Date(Date.parse(window.end)-DAY).toISOString().slice(0,10),days_with_data:coverage.recorded,pct_recorded:coverage.pct,pulled_at:new Date().toISOString()};
  for(const field of ['hrv_rmssd_ms','resting_hr_bpm','spo2_pct','skin_temp_c','recovery_score','total_sleep_min','light_sleep_min','deep_sleep_min','rem_sleep_min','sleep_efficiency_pct','sleep_consistency_pct','sleep_performance_pct','sleep_debt_min','daily_strain','hr_bpm','kilojoules']){
   const vals=recent.map(r=>r[field==='hr_bpm'?'avg_hr_bpm':field]).filter(v=>typeof v==='number');
   if(vals.length)summary['avg_'+field]=vals.reduce((a,b)=>a+b,0)/vals.length;
  }
  const {data:existing}=checked(await db.from('whoop_pulls').select('id').eq('resident_id',p.id).eq('period_start',summary.period_start).eq('period_end',summary.period_end).maybeSingle()) as any;
  checked(existing?await db.from('whoop_pulls').update(summary).eq('id',existing.id):await db.from('whoop_pulls').insert(summary));
 }
 return rows.length;
}
export async function runSync(db:any,maxSeconds=150){
 const run=randomUUID(); const {data:locked}=checked(await db.rpc('claim_whoop_sync',{run_id:run})) as any;
 if(!locked)return {busy:true};
 const deadline=Date.now()+maxSeconds*1000;const results:any[]=[];
 try{
  const {data:participants}=checked(await db.from('burnout_participants').select('id,study_id,enrollment_date,withdrawal_date,status,study_participant_id').eq('status','active').like('study_participant_id','RES-%').limit(1000)) as any;
  const residents=new Map<string,any>();
  const seeds:any[]=[];
  for(const p of participants){
   if(!/^RES-[0-9]+$/.test(p.study_participant_id)||!p.enrollment_date)continue;
   const bounds=studyWindow(p.enrollment_date,p.withdrawal_date);if(bounds.end<=bounds.start)continue;
   residents.set(p.id,p);
   seeds.push(...Object.keys(PATHS).map(kind=>({resident_id:p.id,kind,window_start:bounds.start.toISOString(),window_end:new Date(Math.min(bounds.end.getTime(),bounds.start.getTime()+28*DAY)).toISOString()})));
  }
  if(seeds.length)checked(await db.from('whoop_sync_state').upsert(seeds,{onConflict:'resident_id,kind',ignoreDuplicates:true}));
  // Fair queue across residents/types; persistent page cursors survive timeouts.
  const {data:jobs}=checked(await db.from('whoop_sync_state').select('*').lte('next_attempt',new Date().toISOString()).order('last_attempt',{nullsFirst:true}).order('resident_id').order('kind').limit(400)) as any;
  const tokens=new Map<string,string>();
  for(const job of jobs){
   if(Date.now()>deadline-30000)break;
   const p=residents.get(job.resident_id);if(!p)continue;
   const bounds=studyWindow(p.enrollment_date,p.withdrawal_date);
   const update=async(values:any)=>checked(await db.from('whoop_sync_state').update(values).eq('resident_id',p.id).eq('kind',job.kind));
   try{
    await update({last_attempt:new Date().toISOString()});
    if(job.status==='window_complete'){
     const through=new Date(job.completed_through);
     const caughtUp=through.getTime()>=bounds.end.getTime()-DAY;
     const start=caughtUp?new Date(Math.max(bounds.start.getTime(),bounds.end.getTime()-14*DAY)):through;
     Object.assign(job,{window_start:start.toISOString(),window_end:new Date(Math.min(bounds.end.getTime(),start.getTime()+28*DAY)).toISOString(),next_token:null,status:'pending'});
     await update({window_start:job.window_start,window_end:job.window_end,next_token:null,status:'pending'});
    }
    if(!tokens.has(p.id))tokens.set(p.id,await accessToken(db,p.id));
    let pages=0;
    do{
     if(Date.now()>deadline-30000)break;
     const params=new URLSearchParams({start:job.window_start,end:job.window_end,limit:'25'});
     if(job.next_token)params.set('nextToken',job.next_token);
     const url='https://api.prod.whoop.com/developer/v2'+PATHS[job.kind]+'?'+params;
     let body:any;
     try{body=await request(url,{headers:{Authorization:'Bearer '+tokens.get(p.id)}});}
     catch(e:any){if(e.message!=='reconnect_required')throw e;tokens.set(p.id,await accessToken(db,p.id,true));body=await request(url,{headers:{Authorization:'Bearer '+tokens.get(p.id)}});}
     if(!Array.isArray(body.records))throw new Error('invalid_response');
     if(body.next_token&&body.next_token===job.next_token)throw new Error('repeated_cursor');
     // Collections may include intersecting events; archive only events within consent bounds.
     const records=body.records.filter((r:any)=>{
      const when=job.kind==='sleep'?r.end:r.start;
      if(job.kind==='recovery')return true; // validated by WHOOP's sleep-time query range, not created_at
      return when&&new Date(when)>=bounds.start&&new Date(when)<bounds.end;
     });
     checked(await db.rpc('save_whoop_page',{rid:p.id,endpoint:job.kind,records,cursor_value:body.next_token||null,expected_start:job.window_start,expected_end:job.window_end}));
     job.next_token=body.next_token||null;pages++;
     await new Promise(r=>setTimeout(r,650));
    }while(job.next_token&&pages<8);
    const days=await materialize(db,p,bounds);
    const caughtUp=!job.next_token&&new Date(job.window_end).getTime()>=bounds.end.getTime()-1000;
    await update({next_attempt:new Date(Date.now()+(caughtUp?6*3600000:0)).toISOString()});
    results.push({resident:p.study_participant_id,kind:job.kind,pages,derived_days:days,status:caughtUp?'current':'backfilling'});
   }catch(e:any){
    const error=String(e.message??'sync_failed').slice(0,200);
    // Do not clear a page cursor, overwrite data, or mark missing wear on an API error.
    await update({error,next_attempt:new Date(Date.now()+(error==='rate_limited'?3600000:6*3600000)).toISOString()});
    results.push({resident:p.study_participant_id,kind:job.kind,error});
   }
  }
  return {processed:results.length,results};
 }finally{checked(await db.from('whoop_sync_lease').delete().eq('name','archive').eq('owner',run));}
}
export default async function handler(req:any,res:any){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const auth=req.headers.authorization?.replace('Bearer ','')??req.headers['x-api-key'];
 if(!auth||!key||!(auth===key||(process.env.CRON_SECRET&&auth===process.env.CRON_SECRET)))return res.status(401).json({error:'Unauthorized'});
 if(!['GET','POST'].includes(req.method))return res.status(405).end();
 try{return res.json(await runSync(syncClient()));}
 catch(e:any){return res.status(500).json({error:e.message});}
}
