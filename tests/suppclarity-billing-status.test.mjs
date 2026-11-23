import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../api/suppclarity/billing-status.mjs";
const id = "2a045994-22c1-4d99-80ac-50b89bd848aa";
const env = {
  SUPPCLARITY_PLUS_ENABLED: "true",
  SUPPCLARITY_REVENUECAT_SECRET_KEY: "fixture",
  SUPABASE_SERVICE_ROLE_KEY: "fixture",
  VITE_SUPABASE_URL: "https://example.supabase.co",
};
async function call(options = {}, request = {}) {
  const result = { headers: {}, statusCode: 0, body: undefined };
  const response = {
    setHeader(k, v) {
      result.headers[k] = v;
    },
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
    end() {},
  };
  await createHandler({
    env,
    lookup: async () => ({ plus: false }),
    checkDatabase: async () => ({ data: true }),
    ...options,
  })(
    { method: "GET", headers: { "x-suppclarity-billing": id }, ...request },
    response,
  );
  return result;
}
test("Checkout readiness requires both verification and database availability", async () => {
  assert.equal((await call()).body.ready, true);
  assert.equal((await call({ env: {} })).body.ready, false);
  assert.equal(
    (await call({ checkDatabase: async () => ({ data: false }) })).body.ready,
    false,
  );
  assert.equal(
    (
      await call({
        checkDatabase: async () => ({
          data: true,
          error: { message: "missing migration" },
        }),
      })
    ).body.ready,
    false,
  );
  assert.equal(
    (
      await call({
        lookup: async () => {
          throw Error("offline");
        },
      })
    ).statusCode,
    503,
  );
});
test("Checkout readiness rejects invalid identities, origins and methods", async () => {
  assert.equal((await call({}, { headers: {} })).statusCode, 400);
  assert.equal(
    (
      await call(
        {},
        {
          headers: {
            origin: "https://untrusted.example",
            "x-suppclarity-billing": id,
          },
        },
      )
    ).statusCode,
    403,
  );
  assert.equal((await call({}, { method: "POST" })).statusCode, 405);
  assert.equal((await call()).headers["Cache-Control"], "no-store");
});

test("Readiness accepts the app-specific public verification key", async () => {
  const { SUPPCLARITY_REVENUECAT_SECRET_KEY, ...rest } = env;
  const result = await call({
    env: { ...rest, SUPPCLARITY_REVENUECAT_API_KEY: "goog_public_fixture" },
  });
  assert.equal(result.body.ready, true);
});

test("Checkout readiness recognizes RevenueCat's native anonymous identity", async () => {
  const result = await call(
    {},
    {
      headers: {
        "x-suppclarity-billing":
          "$RCAnonymousID:0123456789abcdef0123456789abcdef",
      },
    },
  );
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ready, true);
});
