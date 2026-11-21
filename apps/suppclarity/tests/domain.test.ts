import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  totals,
  validAge,
  validProduct,
  report,
  emptyProfile,
} from "../src/domain.ts";
import type { Product, Profile } from "../src/domain.ts";
const product: Product = {
  id: "a",
  name: "Label A",
  nutrient: "Vitamin D",
  amount: 1000,
  unit: "IU",
  unitsPerServing: 2,
  unitsTaken: 1,
  daysPerWeek: 7,
};
const profile: Profile = {
  use: "Yes",
  age: "78",
  diet: "Mixed diet",
  context: "No special circumstances",
  screening: "None of these",
  goal: "Understand my routine",
};
test("older adults are eligible without an upper marketing cutoff", () => {
  assert(validAge("78"));
  assert(validAge("101"));
  assert(!validAge("17"));
  assert(!validAge("18.5"));
});
test("normalizes vitamin D IU, serving and weekly use before addition", () => {
  const result = totals([
    product,
    {
      ...product,
      id: "b",
      amount: 25,
      unit: "mcg",
      unitsPerServing: 1,
      daysPerWeek: 2,
    },
  ]);
  assert.equal(result[0].count, 2);
  assert(Math.abs(result[0].amount - (12.5 + (25 * 2) / 7)) < 0.000001);
});
test("rejects invalid arithmetic inputs", () => {
  for (const n of [0, -1, NaN, Infinity]) {
    assert(!validProduct({ ...product, unitsPerServing: n }));
  }
  assert(!validProduct({ ...product, daysPerWeek: 8 }));
  assert.throws(() => totals([{ ...product, unit: "mg" }]));
});
test("medicines and unknowns block personal conclusions", () => {
  for (const screening of ["I take medicines", "Not sure"])
    assert.equal(report({ ...profile, screening }, [product]).kind, "limited");
});
test("pregnancy or missing context blocks personal conclusions", () => {
  assert.equal(
    report({ ...profile, context: "Pregnant or breastfeeding" }, []).kind,
    "limited",
  );
  assert.equal(report(emptyProfile, []).kind, "profile");
});
test("beginner path never invents a supplement need", () =>
  assert.equal(report({ ...profile, use: "No" }, []).kind, "beginner"));
test("overlap is counted across entries without safety approval", () => {
  const r = report(profile, [product, { ...product, id: "b" }]);
  assert.equal(r.kind, "totals");
  assert(r.title.includes("more than once"));
});
