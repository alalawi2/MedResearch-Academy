import { createHash,randomUUID } from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
export function authorizedJob(req:any):boolean {
 const auth=req.headers.authorization?.replace('Bearer ','')||req.headers['x-api-key'];
 return !!auth && [process.env.CRON_SECRET,process.env.SUPABASE_SERVICE_ROLE_KEY].some(k=>!!k&&k===auth);
}
export function checked<T extends {error?:any}>(result:T):T {
 if(result.error) throw new Error(result.error.message || 'Database operation failed');
 return result;
}
export async function allRows(query:()=>any):Promise<any[]> {
 const rows:any[]=[];
 for(let offset=0;;offset+=1000){
  const {data}=checked(await query().range(offset,offset+999)) as any;
  rows.push(...data); if(data.length<1000)return rows;
 }
}
export const escapeHtml=(value:any)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function deliverEmail(body:any,key?:string,db?:any){
 const day=new Date(Date.now()+4*3600000).toISOString().slice(0,10);
 const id=key||createHash('sha256').update(day+JSON.stringify(body)).digest('hex');
 const providerKey=createHash('sha256').update(id).digest('hex');
 db??=createClient(process.env.VITE_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const run=randomUUID();
 const {data:claim}=checked(await db.rpc('claim_notification',{k:id,payload:body,run})) as any;
 if(claim.accepted)return {id:claim.id,deduplicated:true};
 if(claim.busy||claim.review_required)throw new Error('Notification is in progress or requires delivery review; not sent again.');
 try{
  const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':providerKey},body:JSON.stringify(claim.body)});
  if(!response.ok)throw new Error(`Email provider rejected delivery (${response.status}); not recorded as sent.`);
  const result=await response.json();
  if(!result.id)throw new Error('Email provider did not return an acceptance ID.');
  const {data:saved}=checked(await db.from('notification_outbox').update({status:'accepted',provider_id:result.id,lease_until:null,last_error:null,updated_at:new Date().toISOString()}).eq('message_key',id).eq('owner',run).select('message_key')) as any;
  if(!saved?.length)throw new Error('Notification lease changed; verify provider acceptance.');
  return result;
 }catch(e:any){
  await db.from('notification_outbox').update({status:'uncertain',lease_until:null,last_error:String(e.message).slice(0,200),updated_at:new Date().toISOString()}).eq('message_key',id).eq('owner',run);
  throw e;
 }
}
