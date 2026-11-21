import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { extraSources } from '../../apps/suppclarity/src/education-data.mjs';
const sourceIds = new Set([...Object.keys(extraSources), 'dNIH','b12NIH','magnesiumNIH','dGuideline','b12Review','magnesiumReview']);
export function reportInput(value) {
  if (!value || Object.keys(value).some(k=>!['category','answer','sourceIds','consent'].includes(k)) || !['incorrect','unsafe','offensive','other'].includes(value.category) || typeof value.answer !== 'string' || !value.answer.trim() || value.answer.length > 6000 || value.consent !== 'answer-report-v1' || !Array.isArray(value.sourceIds) || value.sourceIds.length > 12) throw new Error('invalid_report');
  return {category:value.category,answer:value.answer.trim(),sourceIds:value.sourceIds.filter(id=>typeof id==='string' && sourceIds.has(id))};
}
export async function saveReport(input,ip,env=process.env,rpc) {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return {status:503,error:'Reporting is temporarily unavailable. Please try again.'};
  const hash=createHmac('sha256',env.SUPABASE_SERVICE_ROLE_KEY).update('suppclarity-report-v1\0'+ip).digest('hex');
  const call=rpc || (params=>createClient(env.VITE_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}}).rpc('suppclarity_submit_report',params));
  try {
    const {data,error}=await call({p_ip_hash:hash,p_category:input.category,p_answer:input.answer,p_source_ids:input.sourceIds});
    if(error?.message?.includes('report_allowance_exceeded')) return {status:429,error:'The reporting allowance is reached. Please try tomorrow.'};
    if(error || data!==true) return {status:503,error:'The report was not saved. Please try again.'};
    return null;
  } catch {return {status:503,error:'The report was not saved. Please try again.'};}
}
