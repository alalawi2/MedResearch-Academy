import { allowedVoiceAccess } from '../../lib/wardwise/access.mjs';
import { reserveFreeUse } from '../../lib/wardwise/free-quota.mjs';
import { createHash } from 'node:crypto';
import { generatePartner, scenarios } from '../../lib/wardwise/partner.mjs';
export const config={api:{bodyParser:false}};
const hash = x=>createHash('sha256').update(x).digest();
export function createHandler({env=process.env,generate=generatePartner,now=Date.now,reserve=reserveFreeUse}={}) {
 const budget=new Map();
 return async (req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const allowedOrigins=new Set(['https://www.medresearch-academy.om','https://medresearch-academy.om','http://localhost:8083']);
  const origin=req.headers.origin;
  if(origin&&allowedOrigins.has(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, X-Wardwise-Consent, X-Wardwise-Install');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');}
  if(req.method==='OPTIONS')return res.status(origin&&allowedOrigins.has(origin)?204:403).end();
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
  if(!env.OPENAI_API_KEY)return res.status(503).json({error:'AI practice is not configured.'});
  const token=String(req.headers.authorization||'').replace(/^Bearer /,'');
  const privateAccess=allowedVoiceAccess(token,env,now());
  const installId=String(req.headers['x-wardwise-install']||'');
  if(token&&!privateAccess)return res.status(401).json({error:'This access code is not valid. Remove it in Settings to use free daily practice.'});
  if(!privateAccess&&!/^[A-Za-z0-9_-]{32,96}$/.test(installId))return res.status(401).json({error:'Update Wardwise to use free daily practice.'});
  if(req.headers['x-wardwise-consent']!=='fictional-adaptive-dialogue-v1')return res.status(403).json({error:'Please consent to AI conversation before sending your words.'});
  if(String(req.headers['content-type']||'').split(';')[0]!=='application/json')return res.status(415).json({error:'Expected JSON.'});
  const controller=new AbortController();const closed=()=>controller.abort();res.on?.('close',closed);
  try{
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>12000)return res.status(413).json({error:'Conversation is too large.'});chunks.push(chunk);}
   let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{return res.status(400).json({error:'Invalid conversation.'});}
   const sc=scenarios.find(s=>s.id===body.scenarioId);const history=body.history;
   if(!sc||!Array.isArray(history)||history.length<1||history.length>3||!history.every(h=>h&&typeof h.partner==='string'&&h.partner.trim()&&h.partner.length<=1000&&typeof h.learner==='string'&&h.learner.trim()&&h.learner.length<=2000))return res.status(400).json({error:'Invalid conversation history.'});
   if(privateAccess){const t=now(),key=hash(token).toString('hex');for(const[k,v]of budget)if(v.until<=t)budget.delete(k);const b=budget.get(key)||{count:0,until:t+3600000};
   if(b.count>=60)return res.status(429).json({error:'AI beta allowance reached. Continue with guided practice or try later.'});b.count++;budget.set(key,b);}
   else {const blocked=await reserve(installId,'conversation',env);if(blocked)return res.status(blocked.status).json({error:blocked.error});}
   const result=await generate({apiKey:env.OPENAI_API_KEY,scenario:sc,history,signal:controller.signal,diagnostic:(code)=>console.error('wardwise_provider_error',String(code||'unknown').slice(0,60))});
   return res.status(200).json({...result,provider:'OpenAI',final:history.length===3});
  }catch{return res.status(502).json({error:'Your partner could not reply. Your words are kept here. Retry, or continue with guided practice.'});}
  finally{res.off?.('close',closed);}
 };
}
export default createHandler();
