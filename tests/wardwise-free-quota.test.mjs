import test from 'node:test';
import assert from 'node:assert/strict';
import { reserveFreeUse } from '../lib/wardwise/free-quota.mjs';

const env={WARDWISE_FREE_HASH_SALT:'test-only-salt',VITE_SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-key'};
const installId='wardwise_1234567890123456789012345678901234567890';

test('free quota sends only a hashed install ID and fixed limits',async()=>{
 const result=await reserveFreeUse(installId,'conversation',env,async params=>{
  assert.match(params.p_install_hash,/^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(params).includes(installId));
  assert.equal(params.p_install_limit,6);
  assert.equal(params.p_global_limit,120);
  return {data:true,error:null};
 });
 assert.equal(result,null);
});

test('free quota fails closed and gives a useful daily-limit message',async()=>{
 assert.equal((await reserveFreeUse('bad','conversation',env)).status,400);
 assert.equal((await reserveFreeUse(installId,'conversation',{},null)).status,503);
 const denied=await reserveFreeUse(installId,'transcription',env,async()=>({data:null,error:{message:'quota_exceeded'}}));
 assert.equal(denied.status,429);
 assert.match(denied.error,/tomorrow/);
});
