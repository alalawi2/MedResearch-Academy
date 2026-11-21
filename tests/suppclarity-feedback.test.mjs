import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { reportInput, saveReport } from '../lib/suppclarity/feedback.mjs';
import { createHandler } from '../api/suppclarity/feedback.mjs';
const input={category:'incorrect',answer:'Magnesium supports muscle and nerve function.',sourceIds:['magnesiumNIH','invented'],consent:'answer-report-v1'};
function req(body=input,headers={},method='POST') {const x=Readable.from([Buffer.from(JSON.stringify(body))]);x.headers={'content-type':'application/json',...headers};x.method=method;x.socket={remoteAddress:'test-network'};return x;}
function res(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(x){this.body=x;return this;},end(){return this;}};}
test('reports require explicit consent, a supported category and bounded answer; profile/question are refused',()=>{
 assert.deepEqual(reportInput(input).sourceIds,['magnesiumNIH']);
 for(const x of [{...input,consent:false},{...input,answer:'x'.repeat(6001)},{...input,category:'anything'},{...input,question:'private question'},{...input,profile:{age:30}}])assert.throws(()=>reportInput(x));
});
test('save uses an irreversible keyed network hash and only the chosen report fields',async()=>{
 let captured;
 const env={VITE_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only-key'};
 const result=await saveReport(reportInput(input),'raw-network',env,async x=>{captured=x;return {data:true};});
 assert.equal(result,null);assert.match(captured.p_ip_hash,/^[a-f0-9]{64}$/);
 assert.equal(JSON.stringify(captured).includes('raw-network'),false);
 assert.deepEqual(Object.keys(captured).sort(),['p_answer','p_category','p_ip_hash','p_source_ids']);
});
test('storage outages and allowances never falsely report success or expose backend details',async()=>{
 const env={VITE_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only-key'};
 assert.equal((await saveReport(reportInput(input),'ip',{})).status,503);
 assert.equal((await saveReport(reportInput(input),'ip',env,async()=>({data:false,error:{message:'report_allowance_exceeded'}}))).status,429);
 const failed=await saveReport(reportInput(input),'ip',env,async()=>{throw Error('secret database details');});
 assert.equal(failed.status,503);assert.ok(!failed.error.includes('secret'));
});
test('HTTP validates before any write and only acknowledges confirmed storage',async()=>{
 let calls=0;const handler=createHandler({save:async()=>{calls++;return null;}});
 for(const [request,code] of [[req(input,{},'GET'),405],[req(input,{origin:'https://untrusted.invalid'}),403],[req({...input,consent:null}),400],[req(input,{'content-type':'text/plain'}),415],[req({...input,answer:'x'.repeat(29000)}),413]]) {
  const response=res();await handler(request,response);assert.equal(response.code,code);
 }
 assert.equal(calls,0);
 const response=res();await handler(req(),response);assert.equal(response.code,201);assert.deepEqual(response.body,{saved:true});assert.equal(calls,1);assert.equal(response.headers['Cache-Control'],'no-store');
 const failed=res();await createHandler({save:async()=>({status:503,error:'Not saved'})})(req(),failed);assert.equal(failed.code,503);assert.ok(!failed.body.saved);
});
