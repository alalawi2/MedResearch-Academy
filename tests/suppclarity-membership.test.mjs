import { test } from "node:test";
import assert from "node:assert/strict";
import {
  verifiedPlan,
  reserveMembershipAction,
  lookupPlan,
} from "../lib/suppclarity/membership.mjs";
const now = Date.parse("2026-11-22T00:00:00Z");
const id = "2a045994-22c1-4d99-80ac-50b89bd848aa";
const paid = (changes = {}) => ({
  subscriber: {
    original_app_user_id: id,
    entitlements: {
      suppclarity_plus: {
        product_identifier: "suppclarity_plus_yearly",
        expires_date: "2026-12-22T00:00:00Z",
      },
    },
    subscriptions: {
      suppclarity_plus_yearly: {
        is_sandbox: false,
        store: "app_store",
        ...changes,
      },
    },
  },
});
test("Server verifies product, expiry, refund and sandbox status", () => {
  assert.equal(verifiedPlan(paid(), now).plus, true);
  assert.equal(
    verifiedPlan(paid({ refunded_at: "2026-11-21" }), now).plus,
    false,
  );
  assert.equal(verifiedPlan(paid({ is_sandbox: true }), now).plus, false);
  assert.equal(verifiedPlan(paid({ is_sandbox: true }), now, true).plus, true);
  assert.equal(verifiedPlan(paid(), Date.parse("2027-01-01")).plus, false);
  assert.equal(
    verifiedPlan(
      {
        subscriber: {
          entitlements: {
            suppclarity_plus: {
              expires_date: "2099-01-01",
              product_identifier: "another_app",
            },
          },
        },
      },
      now,
    ).plus,
    false,
  );
});
test("Grace period retains access until its actual end", () => {
  assert.equal(
    verifiedPlan(
      paid({ grace_period_expires_date: "2027-01-02" }),
      Date.parse("2027-01-01"),
    ).plus,
    true,
  );
});
test("Unconfigured or missing subscribers never grant Plus", async () => {
  assert.deepEqual(await lookupPlan(id, {}), { plus: false });
  assert.deepEqual(
    await lookupPlan(
      id,
      { SUPPCLARITY_REVENUECAT_SECRET_KEY: "private-fixture" },
      async () => ({ status: 404 }),
    ),
    { plus: false },
  );
  await assert.rejects(
    lookupPlan(
      id,
      { SUPPCLARITY_REVENUECAT_SECRET_KEY: "private-fixture" },
      async () => ({ status: 401, ok: false }),
    ),
  );
});
const env = {
  VITE_SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "private-fixture",
};
test("Client claims cannot elevate a free allowance; identifiers are hashed", async () => {
  let sent;
  const result = await reserveMembershipAction(
    {
      headers: {
        "x-suppclarity-billing": id,
        "x-suppclarity-plus": "true",
        "x-vercel-forwarded-for": "192.0.2.1",
      },
    },
    "scan",
    env,
    {
      lookup: async () => ({ plus: false }),
      rpc: async (params) => {
        sent = params;
        return { data: true };
      },
    },
  );
  assert.equal(result.plus, false);
  assert.equal(sent.p_plus, false);
  assert.match(sent.p_subject_hash, /^[a-f0-9]{64}$/);
  assert(!JSON.stringify(sent).includes(id));
  assert(!JSON.stringify(sent).includes("192.0.2.1"));
});
test("Paid allowances use RevenueCat's canonical identity across restoration", async () => {
  const run = async (subject) => {
    let sent;
    await reserveMembershipAction(
      { headers: { "x-suppclarity-billing": subject } },
      "answer",
      env,
      {
        lookup: async () => ({ plus: true, subject: id }),
        rpc: async (params) => {
          sent = params;
          return { data: true };
        },
      },
    );
    return sent;
  };
  assert.equal(
    (await run(id)).p_subject_hash,
    (await run("8848439e-3c25-46ba-bc56-bdc30bce43da")).p_subject_hash,
  );
});
test("Bad IDs, verification outage and exhausted quotas fail closed", async () => {
  assert.equal(
    (
      await reserveMembershipAction(
        { headers: { "x-suppclarity-billing": "../other" } },
        "scan",
        env,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await reserveMembershipAction(
        { headers: { "x-suppclarity-billing": id } },
        "scan",
        env,
        {
          lookup: async () => {
            throw Error("offline");
          },
        },
      )
    ).status,
    503,
  );
  assert.equal(
    (
      await reserveMembershipAction(
        { headers: { "x-suppclarity-billing": id } },
        "scan",
        env,
        {
          lookup: async () => ({ plus: false }),
          rpc: async () => ({ error: { message: "quota_exceeded" } }),
        },
      )
    ).status,
    429,
  );
  assert.equal(
    (await reserveMembershipAction({ headers: {} }, "scan", env)).legacy,
    true,
  );
});
test("Verification uses an app-specific public SDK key without administrator access", async () => {
  let authorization;
  const result = await lookupPlan(
    id,
    { SUPPCLARITY_REVENUECAT_API_KEY: "goog_public_fixture" },
    async (url, options) => {
      authorization = options.headers.Authorization;
      assert.equal(url, "https://api.revenuecat.com/v1/subscribers/" + id);
      return { status: 200, ok: true, json: async () => paid() };
    },
  );
  assert.equal(authorization, "Bearer goog_public_fixture");
  assert.equal(result.plus, true);
});

test("Sandbox access only accepts verified Apple or Google subscriptions", () => {
  assert.equal(
    verifiedPlan(paid({ is_sandbox: true, store: "play_store" }), now, true)
      .plus,
    true,
  );
  assert.equal(
    verifiedPlan(paid({ is_sandbox: true, store: "test_store" }), now, true)
      .plus,
    false,
  );
});
