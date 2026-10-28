import test from 'node:test';import assert from 'node:assert/strict';import {Readable} from 'node:stream';import {EventEmitter} from 'node:events';
import {createHandler} from '../api/wardwise/conversation.mjs';
import {generatePartner,scenarios,wavFromPCM,instructionsFor} from '../lib/wardwise/partner.mjs';
const env={OPENAI_API_KEY:'test-provider-secret',WARDWISE_BETA_ACCESS_TOKEN:'private-test-code'};
function setup(generate=async()=>({line:'Who will check with the team?',audioBase64:'fixture',mime:'audio/wav'})){
 let calls=0;const h=createHandler({env,generate:async x=>{calls++;return generate(x);}});
 return {calls:()=>calls,run:async(body={scenarioId:'handover',history:[{partner:'Please hand over.',learner:'Taylor is waiting.'}]},headers={})=>{
  const req=Readable.from([Buffer.from(typeof body==='string'?body:JSON.stringify(body))]);req.method='POST';req.headers={authorization:'Bearer private-test-code','x-wardwise-consent':'fictional-adaptive-dialogue-v1','content-type':'application/json',...headers};
  const res={setHeader(){},status(n){this.statusCode=n;return this;},json(x){this.body=x;return this;}};await h(req,res);return res;
 }};
}
test('requires private access and separate dialogue consent',async()=>{const s=setup();assert.equal((await s.run(undefined,{authorization:'Bearer bad'})).statusCode,401);assert.equal((await s.run(undefined,{'x-wardwise-consent':'fictional-practice-audio-v1'})).statusCode,403);assert.equal(s.calls(),0);});
test('bounds history, body and scenario before paid generation',async()=>{const s=setup();for(const b of [{scenarioId:'unknown',history:[]},{scenarioId:'handover',history:Array(4).fill({partner:'p',learner:'l'})},{scenarioId:'handover',history:[{partner:'p',learner:'a'.repeat(2001)}]},'{bad','a'.repeat(12001)])assert.ok([400,413].includes((await s.run(b)).statusCode));assert.equal(s.calls(),0);});
test('canonical server facts and full dialogue reach generator, no client instructions',async()=>{const s=setup(async x=>{assert.equal(x.scenario.id,'handover');assert.ok(x.scenario.facts.some(f=>f.includes('No visit time')));assert.equal(x.history[0].learner,'Taylor is waiting.');return {line:'Who will check?',audioBase64:'voice'};});const r=await s.run();assert.equal(r.statusCode,200);assert.equal(r.body.final,false);});
test('final exchange is explicitly final and provider failures remain private',async()=>{const s=setup();assert.equal((await s.run({scenarioId:'handover',history:Array(3).fill({partner:'p',learner:'l'})})).body.final,true);const fail=setup(async()=>{throw Error(env.OPENAI_API_KEY);});const r=await fail.run();assert.equal(r.statusCode,502);assert.ok(!JSON.stringify(r.body).includes(env.OPENAI_API_KEY));});
class VoiceSocket extends EventEmitter{
 static last;constructor(){super();VoiceSocket.last=this;queueMicrotask(()=>this.emit('open'));}
 send(raw){const e=JSON.parse(raw);if(e.type==='session.update'){this.config=e.session;queueMicrotask(()=>this.emit('message',JSON.stringify({type:'session.updated'})));}if(e.type==='response.create')queueMicrotask(()=>{for(const e of [{type:'response.output_audio.delta',delta:Buffer.alloc(100).toString('base64')},{type:'response.output_audio_transcript.done',transcript:'Who will follow that up?'},{type:'response.done',response:{status:'completed'}}])this.emit('message',JSON.stringify(e));});}
 close(){this.closed=true;}
}
test('audio generator assembles valid WAV and uses constrained server-owned configuration',async()=>{const r=await generatePartner({apiKey:'fixture',scenario:scenarios[1],history:[{partner:'p',learner:'l'}],Socket:VoiceSocket});const bytes=Buffer.from(r.audioBase64,'base64');assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.readUInt32LE(24),24000);assert.equal(bytes.length,144);assert.equal(VoiceSocket.last.config.tools.length,0);assert.equal(VoiceSocket.last.closed,true);assert.match(VoiceSocket.last.config.instructions,/Never give clinical advice/);});
test('abort closes the provider connection and rejects without output',async()=>{const c=new AbortController();c.abort();await assert.rejects(generatePartner({apiKey:'fixture',scenario:scenarios[0],history:[],Socket:VoiceSocket,signal:c.signal}));assert.equal(VoiceSocket.last.closed,true);});
test('closing prompt forbids further questions and WAV lengths are consistent',()=>{assert.match(instructionsFor(scenarios[0],3),/Do not ask another question/);assert.equal(wavFromPCM(Buffer.alloc(24)).readUInt32LE(40),24);});

test('short-lived native QA credentials require explicit server opt-in and expire',async()=>{
 const {allowedVoiceAccess}=await import('../lib/wardwise/access.mjs');const {createHmac}=await import('node:crypto');const now=1700000000000;
 const mint=expiry=>{const p=`qa.${expiry}.0123456789abcdef`;return `${p}.${createHmac('sha256',env.WARDWISE_BETA_ACCESS_TOKEN).update(p).digest('base64url')}`;};
 assert.equal(allowedVoiceAccess(mint(now+60000),env,now),false);
 const enabled={...env,WARDWISE_QA_ENABLED:'true'};
 assert.equal(allowedVoiceAccess(mint(now+60000),enabled,now),true);
 assert.equal(allowedVoiceAccess(mint(now-1),enabled,now),false);
 assert.equal(allowedVoiceAccess(mint(now+3600001),enabled,now),false);
 assert.equal(allowedVoiceAccess(mint(now+60000).replace('0123456789abcdef','fedcba9876543210'),enabled,now),false);
 assert.equal(allowedVoiceAccess(env.WARDWISE_BETA_ACCESS_TOKEN,env,now),true);
});
