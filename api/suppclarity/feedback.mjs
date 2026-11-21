import { allowedOrigin } from '../../lib/suppclarity/http.mjs';
import { reportInput, saveReport } from '../../lib/suppclarity/feedback.mjs';
export const config={api:{bodyParser:false}};
export function createHandler({env=process.env,save=saveReport}={}) {
  return async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    const origin=req.headers.origin;
    if(origin && allowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
      res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
    }
    if(req.method==='OPTIONS')return res.status(origin && allowedOrigin(origin)?204:403).end();
    if(origin && !allowedOrigin(origin))return res.status(403).json({error:'Origin not allowed.'});
    if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
    if(String(req.headers['content-type']||'').split(';')[0]!=='application/json')return res.status(415).json({error:'Expected a report.'});
    let input;
    try {
      let size=0;const chunks=[];
      for await(const chunk of req){size+=chunk.length;if(size>28000)return res.status(413).json({error:'The report is too long.'});chunks.push(chunk);}
      input=reportInput(JSON.parse(Buffer.concat(chunks).toString()));
    } catch {return res.status(400).json({error:'Choose a reason and agree to send this answer.'});}
    const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
    const failed=await save(input,ip,env);
    if(failed)return res.status(failed.status).json({error:failed.error});
    return res.status(201).json({saved:true});
  };
}
export default createHandler();
