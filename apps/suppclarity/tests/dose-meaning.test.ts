import { test } from "node:test";
import assert from "node:assert/strict";
import { ingredientContext, doseMeaning } from "../src/dose-meaning.ts";
test("magnesium contribution compares the serving with the selected general references without prescribing a gap", () => {
  const context = ingredientContext("Magnesium", 300, "mg")!;
  const both = doseMeaning(context, 35);
  assert.deepEqual(
    both.percentages.map((x) => x.percent),
    [71, 94],
  );
  assert(both.text.includes("Food"));
  assert(!both.text.includes("fulfilled"));
  assert.deepEqual(
    doseMeaning(context, 35, "female").percentages.map((x) => x.percent),
    [94],
  );
  const unknown = doseMeaning(context);
  assert(unknown.text.includes("71–97%"));
  assert.equal(doseMeaning(context, 35, "female", true).percentages.length, 0);
});
test("recorded use scales the amount and distinguishes a use day from a weekly average", () => {
  const context = ingredientContext("Magnesium", 0.25, "g", "use-day", 2, 1)!;
  assert.equal(context.amount, 125);
  assert.equal(context.unit, "mg");
  assert(doseMeaning(context, 35, "male").basis.includes("use day"));
  assert(
    doseMeaning({ ...context, basis: "daily-average" }, 35).basis.includes(
      "daily average",
    ),
  );
});
test("caffeine is explained as a stimulant amount with no percentage-of-requirement goal", () => {
  const context = ingredientContext("Caffeine", 0.075, "g")!;
  const meaning = doseMeaning(context, 35);
  assert.equal(context.amount, 75);
  assert(meaning.headline.includes("75 mg"));
  assert(meaning.text.includes("not a daily nutrient requirement"));
  assert.deepEqual(meaning.percentages, []);
  assert(!meaning.text.includes("400"));
});
test("unknown amounts and unsupported units cannot turn into a contribution; vitamin D IU converts once", () => {
  assert.equal(ingredientContext("Magnesium", NaN, "mg"), undefined);
  assert.equal(ingredientContext("Magnesium", 1, "mL"), undefined);
  assert.equal(ingredientContext("Magnesium", -1, "mg"), undefined);
  const d = ingredientContext("Vitamin D", 600, "IU")!;
  assert.equal(d.amount, 15);
  assert.deepEqual(
    doseMeaning(d, 35).percentages.map((x) => x.percent),
    [100],
  );
});
