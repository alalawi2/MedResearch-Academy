import { test } from "node:test";
import { strict as assert } from "node:assert";
import { identifyNutrient, normalizeQuantity } from "../src/catalog.mjs";
import {
  totals,
  overlappingIngredients,
  validIngredient,
  type Product,
} from "../src/domain.ts";
import { upperReference } from "../src/upper-references.ts";
const p = (
  nutrient: keyof typeof import("../src/catalog.mjs").nutrientCatalog,
  amount: number,
  unit: string,
): Product => ({
  id: nutrient,
  name: nutrient,
  taking: true,
  unitsTaken: 1,
  unitsPerServing: 1,
  daysPerWeek: 7,
  ingredients: [{ nutrient, amount, unit }],
});
test("mass and CFU conversions preserve meaning without salt or extract inference", () => {
  assert.deepEqual(normalizeQuantity("Vitamin B12", 1, "mg"), {
    amount: 1000,
    unit: "mcg",
  });
  assert.deepEqual(normalizeQuantity("Probiotics", 20, "billion CFU"), {
    amount: 2e10,
    unit: "CFU",
  });
  assert.equal(identifyNutrient("Magnesium citrate"), null);
  assert.equal(identifyNutrient("Fish oil"), "Fish oil");
  assert.equal(identifyNutrient("Calcifediol"), null);
  assert.equal(identifyNutrient("Vitamin D with calcium"), null);
  assert.equal(identifyNutrient("Probiotic blend (10 strains)"), "Probiotics");
  assert.equal(
    validIngredient({
      nutrient: "Probiotics",
      amount: 1e15,
      unit: "billion CFU",
    }),
    false,
  );
});
test("form-specific units stay separate and noninterchangeable products are not summed", () => {
  const ts = totals([
    p("Vitamin A", 3000, "IU"),
    p("Vitamin A", 900, "mcg RAE"),
  ]);
  assert.equal(ts.length, 2);
  assert.deepEqual(
    totals([p("Ashwagandha", 300, "mg"), p("Probiotics", 10, "billion CFU")]),
    [],
  );
  const pair = [p("Fish oil", 1000, "mg"), p("EPA", 300, "mg")];
  assert.equal(overlappingIngredients(pair).length, 1);
  assert.equal(
    overlappingIngredients([
      pair[0],
      { ...pair[1], taking: false, unitsTaken: 0, daysPerWeek: 0 },
    ]).length,
    0,
  );
});
test("US age-specific ceilings include boundaries without creating a dose for unknowns", () => {
  for (const [age, amount] of [
    [18, 3000],
    [19, 2500],
    [50, 2500],
    [51, 2000],
    [85, 2000],
  ])
    assert.equal(upperReference("Calcium", age)?.amount, amount);
  assert.equal(upperReference("Zinc", 18)?.amount, 34);
  assert.equal(upperReference("Zinc", 19)?.amount, 40);
  assert.equal(upperReference("Vitamin B6", 18)?.amount, 80);
  assert.equal(upperReference("Iodine", 18)?.amount, 900);
  assert.equal(upperReference("Vitamin C", 18)?.amount, 1800);
  assert.equal(upperReference("Probiotics", 35), null);
  assert.equal(upperReference("Vitamin A", 35), null);
  assert.equal(upperReference("Iron", 17), null);
});
