import { test } from "node:test";
import assert from "node:assert/strict";
import { membershipFromInfo, annualSaving } from "../src/plus-policy.ts";
import { compareLabels } from "../src/comparison.ts";
import { summaryHtml } from "../src/pdf-summary.ts";
import {
  recordDay,
  validateRoutine,
  emptyRoutine,
  localDay,
} from "../src/routine-data.ts";
import { validateSnapshot } from "../src/local-vault.ts";
import { emptyProfile, type Product } from "../src/domain.ts";
const product = (id: string, amount = 100, unit = "mg"): Product => ({
  id,
  name: id,
  unitsPerServing: 2,
  unitsTaken: 1,
  daysPerWeek: 7,
  ingredients: [{ nutrient: "Magnesium", amount, unit }],
});
const now = Date.parse("2026-11-22T00:00:00Z");
const info = (change = {}) => ({
  entitlements: {
    active: {
      suppclarity_plus: {
        isActive: true,
        expirationDate: "2026-12-22T00:00:00Z",
        willRenew: true,
        productIdentifier: "suppclarity_plus_yearly",
        ...change,
      },
    },
  },
});
test("Plus requires a known, active, unexpired store entitlement", () => {
  assert.equal(membershipFromInfo(info(), now).active, true);
  for (const change of [
    { isActive: false },
    { expirationDate: "2026-11-21" },
    { expirationDate: null },
    { expirationDate: "invalid" },
    { productIdentifier: "another_app_subscription" },
  ])
    assert.equal(membershipFromInfo(info(change), now).active, false);
  assert.equal(membershipFromInfo({ isPlus: true }, now).active, false);
  assert.equal(
    membershipFromInfo(info({ willRenew: false }), now).active,
    true,
  );
});
test("Android base plans retain entitlement validation", () => {
  assert.equal(
    membershipFromInfo(
      info({ productIdentifier: "suppclarity_plus_monthly:monthly" }),
      now,
    ).active,
    true,
  );
});
test("A verified grace period retains local access but a refund does not", () => {
  const base = info({ expirationDate: "2026-11-21" });
  const grace = {
    ...base,
    subscriptionsByProductIdentifier: {
      suppclarity_plus_yearly: { gracePeriodExpiresDate: "2026-11-25" },
    },
  };
  assert.equal(membershipFromInfo(grace, now).active, true);
  assert.equal(
    membershipFromInfo(
      {
        ...grace,
        subscriptionsByProductIdentifier: {
          suppclarity_plus_yearly: {
            gracePeriodExpiresDate: "2026-11-25",
            refundedAt: "2026-11-21",
          },
        },
      },
      now,
    ).active,
    false,
  );
});
test("Savings use actual store prices, with no invented discount", () => {
  assert.equal(annualSaving(4.99, 39.99), 33);
  assert.equal(annualSaving(0, 39.99), 0);
  assert.equal(annualSaving(4.99, 79), 0);
});
test("Comparison normalizes units without comparing unlike serving sizes", () => {
  const rows = compareLabels(product("a", 100), product("b", 0.2, "g"));
  assert.deepEqual(rows, [
    { name: "Magnesium", left: 100, right: 200, unit: "mg" },
  ]);
  assert.equal(
    compareLabels(product("a", 0), {
      ...product("b"),
      ingredients: [{ nutrient: "Vitamin D", amount: 10, unit: "mcg" }],
    })[0].right,
    null,
  );
  assert.equal(rows[0].left, 100); // Per serving; do not divide by units taken.
});
test("Taken/skipped entries replace, undo and remain unique", () => {
  const logs = recordDay([], "a", "taken", "2026-11-22");
  assert.deepEqual(recordDay(logs, "a", "skipped", "2026-11-22"), [
    { productId: "a", day: "2026-11-22", status: "skipped" },
  ]);
  assert.deepEqual(recordDay(logs, "a", "taken", "2026-11-22"), []);
  assert.equal(localDay(new Date(2026, 10, 22, 23, 59)), "2026-11-22");
});
test("Legacy encrypted routines migrate without losing entries", () => {
  const old = {
    version: 1,
    profile: { ...emptyProfile },
    products: [product("a")],
    step: 0,
    scale: 1,
  };
  assert.deepEqual(validateSnapshot(old), old);
  const next = {
    ...old,
    routine: {
      reminders: [],
      logs: [{ productId: "a", day: "2026-11-22", status: "taken" }],
    },
  };
  assert.deepEqual(validateSnapshot(next).routine, next.routine);
});
test("Malformed schedules and duplicate history are rejected", () => {
  assert.deepEqual(validateRoutine(undefined), emptyRoutine());
  assert.throws(() =>
    validateRoutine({
      reminders: [
        { productId: "a", hour: 25, minute: 0, days: [2], notificationIds: [] },
      ],
      logs: [],
    }),
  );
  assert.throws(() =>
    validateRoutine({
      reminders: [],
      logs: [
        { productId: "a", day: "2026-11-22", status: "taken" },
        { productId: "a", day: "2026-11-22", status: "skipped" },
      ],
    }),
  );
});
test("PDF is escaped, local and excludes history until requested", () => {
  const p = {
    ...product("a"),
    name: '<img src="https://example.org/steal">',
    web: {
      url: 'https://example.org/?x="bad"',
      brand: "brand",
      sourceType: "manufacturer" as const,
      market: null,
      retrievedAt: "2026-11-22",
    },
  };
  const logs = [
    { productId: "a", day: "2026-11-22", status: "taken" as const },
  ];
  const html = summaryHtml([p], logs, false, new Date(now));
  assert(!html.includes("<img"));
  assert(html.includes("&lt;img"));
  assert(!html.includes("2026-11-22 — taken"));
  assert(
    summaryHtml([p], logs, true, new Date(now)).includes("2026-11-22 — taken"),
  );
  assert(html.includes("not a clinical assessment"));
  assert(!html.includes("<script"));
});
