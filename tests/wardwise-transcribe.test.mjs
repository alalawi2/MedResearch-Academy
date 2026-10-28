import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHandler } from '../api/wardwise/transcribe.mjs';
const env = { WARDWISE_BETA_ACCESS_TOKEN: 'test-private-code', OPENAI_API_KEY: 'test-provider-secret' };
function setup(options = {}) {
  let calls = 0;
  const handler = createHandler({ env, metadata: async () => ({ format: { duration: 3 } }), upstream: async (url, init) => {
    calls++; assert.equal(init.body.get('model'), 'gpt-transcribe');
    assert.equal(init.body.has('prompt'), false);
    return Response.json({ text: '  My practice words.  ' });
  }, ...options });
  const run = async ({ headers = {}, body = Buffer.from('fixture'), method = 'POST' } = {}) => {
    const req = Readable.from([body]); req.method = method;
    req.headers = { authorization: `Bearer ${env.WARDWISE_BETA_ACCESS_TOKEN}`, 'x-wardwise-consent': 'fictional-practice-audio-v1', 'content-type': 'audio/mp4', ...headers };
    const res = { statusCode: 200, setHeader() {}, status(n) { this.statusCode = n; return this; }, json(value) { this.body = value; return this; } };
    await handler(req, res); return res;
  };
  return { run, calls: () => calls };
}
test('valid request returns editable transcript without sample-answer bias', async () => {
  const s = setup(); const r = await s.run(); assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body, { text: 'My practice words.', provider: 'OpenAI', requiresConfirmation: true }); assert.equal(s.calls(), 1);
});
test('rejects unauthorised, unconsented and unsupported requests before provider call', async () => {
  const s = setup();
  assert.equal((await s.run({ headers: { authorization: 'Bearer wrong' } })).statusCode, 401);
  assert.equal((await s.run({ headers: { 'x-wardwise-consent': '' } })).statusCode, 403);
  assert.equal((await s.run({ headers: { 'content-type': 'text/plain' } })).statusCode, 415);
  assert.equal((await s.run({ method: 'GET' })).statusCode, 405); assert.equal(s.calls(), 0);
});
test('rejects empty, oversized, invalid and overlong audio before provider call', async () => {
  const s = setup(); assert.equal((await s.run({ body: Buffer.alloc(0) })).statusCode, 400);
  assert.equal((await s.run({ body: Buffer.alloc(1500001) })).statusCode, 413); assert.equal(s.calls(), 0);
  for (const duration of [NaN, 0.1, 47]) {
    const x = setup({ metadata: async () => ({ format: { duration } }) });
    assert.equal((await x.run()).statusCode, 400); assert.equal(x.calls(), 0);
  }
  const x = setup({ metadata: async () => { throw Error('bad file'); } });
  assert.equal((await x.run()).statusCode, 400); assert.equal(x.calls(), 0);
});
test('does not expose provider error details or secrets', async () => {
  const s = setup({ upstream: async () => new Response('test-provider-secret provider internal error', { status: 401 }) });
  const r = await s.run(); assert.equal(r.statusCode, 502); assert.equal(JSON.stringify(r.body).includes(env.OPENAI_API_KEY), false);
});
test('per-instance allowance stops repeated uploads', async () => {
  const s = setup(); for (let i = 0; i < 60; i++) assert.equal((await s.run()).statusCode, 200);
  assert.equal((await s.run()).statusCode, 429); assert.equal(s.calls(), 60);
});
