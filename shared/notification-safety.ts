import { createHash } from 'node:crypto';
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
export async function deliverEmail(body:any,key?:string){
 const day=new Date(Date.now()+4*3600000).toISOString().slice(0,10);
 const id=key||createHash('sha256').update(day+JSON.stringify(body)).digest('hex');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify(body)});
 if(!response.ok)throw new Error(`Email provider rejected delivery (${response.status}); not recorded as sent.`);
 return response.json();
}
