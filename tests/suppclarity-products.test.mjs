import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  databaseLabel,
  searchProducts,
  productQuery,
  getProductLabel,
} from "../lib/suppclarity/products.mjs";
import { createHandler } from "../api/suppclarity/products.mjs";
import { validatedLabel } from "../lib/suppclarity/label.mjs";
const quantity = (quantity, unit, percent) => ({
  quantity,
  unit,
  operator: "=",
  servingSizeOrder: 1,
  servingSizeQuantity: 1,
  servingSizeUnit: "Softgel(s)",
  dailyValueTargetGroup: percent
    ? [
        {
          name: "Adults and children 4 or more years of age",
          percent,
          operator: "=",
        },
      ]
    : [],
});
const raw = () => ({
  id: 179704,
  fullName: "Vitamin D3 2000 IU",
  brandName: "Nature Made",
  entryDate: "2018-08-31",
  upcSku: "0 31604 02679 0",
  servingSizes: [
    {
      order: 1,
      minQuantity: 1,
      maxQuantity: 1,
      unit: "Softgel(s)",
      inSFB: true,
    },
  ],
  ingredientRows: [
    {
      name: "Vitamin D3",
      quantity: [quantity(2000, "IU", 500)],
      nestedRows: [],
    },
  ],
});
test("database label converts vitamin D while preserving provenance and requiring confirmation", () => {
  const l = databaseLabel(raw());
  assert.equal(l.ingredients[0].amount, 50);
  assert.equal(l.ingredients[0].unit, "mcg");
  assert.equal(l.servingUnits, 1);
  assert.equal(l.database.id, "179704");
  const b12 = validatedLabel({
    ...l,
    ingredients: [
      {
        name: "Vitamin B12",
        amount: 1,
        unit: "mg",
        reading: "clear",
        labelText: "1 mg",
      },
    ],
  });
  assert.equal(b12.ingredients[0].amount, 1000);
  assert.equal(b12.ingredients[0].unit, "mcg");
});
test("database unit and Daily Value inconsistencies are blank, never silently corrected", () => {
  const r = raw();
  r.ingredientRows = [
    { name: "Vitamin C", quantity: [quantity(60, "mcg", 67)] },
  ];
  const l = databaseLabel(r);
  assert.equal(l.ingredients[0].amount, null);
  assert.equal(l.ingredients[0].reading, "uncertain");
  assert.equal(l.panelComplete, false);
  assert(l.concerns.some((c) => c.includes("%DV")));
});
test("ranged, multiple and mismatched serving records never supply guessed quantities", () => {
  for (const change of [
    (r) => {
      r.servingSizes[0].maxQuantity = 2;
    },
    (r) => {
      r.servingSizes.push({ ...r.servingSizes[0], order: 2 });
    },
    (r) => {
      r.ingredientRows[0].quantity[0].servingSizeUnit = "mL";
    },
  ]) {
    const r = raw();
    change(r);
    const l = databaseLabel(r);
    assert.equal(l.ingredients[0].amount, null);
    assert.equal(l.panelComplete, false);
  }
});
test("nested folic acid and form-specific DFE remain separate; paired D must agree", () => {
  const r = raw();
  r.ingredientRows = [
    {
      name: "Folate",
      quantity: [quantity(667, "mcg DFE")],
      nestedRows: [{ name: "Folic acid", quantity: [quantity(400, "mcg")] }],
    },
  ];
  const l = databaseLabel(r);
  assert.equal(l.ingredients.length, 2);
  assert.equal(l.ingredients[0].unit, "mcg DFE");
  assert.equal(l.ingredients[1].nutrient, "Folic acid");
  const d = raw();
  d.ingredientRows[0].quantity.push(quantity(50, "mcg"));
  assert.equal(databaseLabel(d).ingredients[0].amount, 50);
  d.ingredientRows[0].quantity[1].quantity = 25;
  assert.equal(databaseLabel(d).ingredients[0].amount, null);
});
const hit = (id, name, brand = "Nature Made", date = "2026-01-01") => ({
  _id: id,
  _source: { fullName: name, brandName: brand, entryDate: date },
});
test("search requires all name tokens, deduplicates newest records, and tries the NIH UPC format", async () => {
  const found = await searchProducts({
    query: "Nature Made Vitamin D",
    upstream: async () => ({
      ok: true,
      json: async () => ({
        hits: [
          hit("1", "Vitamin D"),
          hit("2", "Vitamin D", "Nature Made", "2025-01-01"),
          hit("3", "Vitamin C"),
          hit("4", "Vitamin D", "Other brand"),
        ],
      }),
    }),
  });
  assert.deepEqual(
    found.map((x) => x.id),
    ["1"],
  );
  const queries = [];
  await searchProducts({
    query: "031604026790",
    upstream: async (url) => {
      queries.push(url.searchParams.get("q"));
      return {
        ok: true,
        json: async () => ({
          hits:
            queries.length === 1 ? [] : [hit("179704", "Vitamin D3 2000 IU")],
        }),
      };
    },
  });
  assert.deepEqual(queries, ['"031604026790"', '"0 31604 02679 0"']);
});
test("invalid inputs, injected IDs, wrong label records and upstream failures cannot pass as results", async () => {
  for (const q of [null, [], "a", "123", "x".repeat(121)])
    assert.throws(() => productQuery(q));
  await assert.rejects(getProductLabel({ id: "../../secret" }));
  await assert.rejects(
    getProductLabel({
      id: "123",
      upstream: async () => ({ ok: true, json: async () => raw() }),
    }),
  );
  await assert.rejects(
    searchProducts({
      query: "vitamin D",
      upstream: async () => ({ ok: false }),
    }),
  );
});
const res = () => ({
  code: 200,
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v;
  },
  status(v) {
    this.code = v;
    return this;
  },
  json(v) {
    this.body = v;
    return this;
  },
  end() {},
});
test("lookup endpoint accepts one query only, enforces origins and returns a usable fallback", async () => {
  for (const query of [
    {},
    { q: "abc", id: "1" },
    { id: ["1"] },
    { q: "vitamin D", extra: "x" },
  ]) {
    const out = res();
    await createHandler()({ method: "GET", headers: {}, query }, out);
    assert.equal(out.code, 400);
  }
  const denied = res();
  await createHandler()(
    {
      method: "GET",
      headers: { origin: "https://evil.invalid" },
      query: { q: "Vitamin D" },
    },
    denied,
  );
  assert.equal(denied.code, 403);
  const fail = res();
  await createHandler({
    search: async () => {
      throw Error("private upstream detail");
    },
  })({ method: "GET", headers: {}, query: { q: "Vitamin D" } }, fail);
  assert.equal(fail.code, 502);
  assert(!JSON.stringify(fail.body).includes("private"));
  const ok = res();
  await createHandler({ read: async () => databaseLabel(raw()) })(
    { method: "GET", headers: {}, query: { id: "179704" } },
    ok,
  );
  assert.equal(ok.code, 200);
  assert.equal(ok.body.requiresConfirmation, true);
});
