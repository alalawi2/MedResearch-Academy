const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

async function run(body, options = {}) {
  const links = [], emails = [];
  const query = {
    select() { return this; }, ilike() { return this; }, eq() { return this; },
    async maybeSingle() { return { data: options.missing ? null : { auth_user_id: 'staff-id' } }; },
  };
  const client = { from: () => query, auth: { admin: {
    getUserById: async () => ({ data: { user: { email: options.accountEmail || body.email.trim().toLowerCase() } } }),
    generateLink: async input => { links.push(input); return { data: { properties: { action_link: 'https://auth.example/verify?token=test&type=recovery' } } }; },
  } } };
  const context = {
    exports: {}, URL, Date, console: { error() {} },
    process: { env: { VITE_SUPABASE_URL: 'https://auth.example', SUPABASE_SERVICE_ROLE_KEY: 'test', RESEND_API_KEY: 'test', SITE_URL: 'https://www.medresearch-academy.om' } },
    require: () => ({ createClient: () => client }),
    fetch: async (url, init) => { emails.push(JSON.parse(init.body)); return { ok: !options.deliveryFailure, text: async () => 'failed' }; },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('api/send-magic-link.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  const response = { status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; }, setHeader() {} };
  await context.exports.default({ method: 'POST', body }, response);
  return { response, links, emails, repeat: () => context.exports.default({ method: 'POST', body }, response) };
}

(async () => {
  const reset = await run({ email: 'Staff@example.com', purpose: 'staff-reset', redirectTo: 'https://evil.example' });
  assert.equal(reset.response.code, 200);
  assert.equal(reset.links[0].type, 'recovery');
  assert.equal(reset.links[0].options.redirectTo, 'https://www.medresearch-academy.om/dashboard/set-password');
  assert.match(reset.emails[0].subject, /Reset your password/);
  await reset.repeat();
  assert.equal(reset.response.code, 429);
  const login = await run({ email: 'staff@example.com', purpose: 'staff-login' });
  assert.equal(login.links[0].type, 'magiclink');
  assert.equal(login.links[0].options.redirectTo, 'https://www.medresearch-academy.om/dashboard');
  for (const options of [{ missing: true }, { accountEmail: 'someoneelse@example.com' }]) {
    const unknown = await run({ email: 'staff@example.com', purpose: 'staff-reset' }, options);
    assert.equal(unknown.response.code, 200);
    assert.equal(unknown.links.length, 0);
    assert.equal(unknown.emails.length, 0);
  }
  const failed = await run({ email: 'staff@example.com', purpose: 'staff-login' }, { deliveryFailure: true });
  assert.equal(failed.response.code, 500);
  const invalid = await run({ email: 'staff@example.com', purpose: 'invalid' });
  assert.equal(invalid.response.code, 400);
  const resident = await run({ email: 'resident@example.com' });
  assert.equal(resident.links[0].options.redirectTo, 'https://www.medresearch-academy.om/resident/dashboard');
  assert.match(resident.emails[0].subject, /OMSB/);
  console.log('Staff access email tests passed: login, recovery, redirects, account checks, cooldown, provider failure, resident compatibility.');
})().catch(error => { console.error(error); process.exit(1); });
