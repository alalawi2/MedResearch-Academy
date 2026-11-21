import { test } from "node:test";
import { strict as assert } from "node:assert";
import { prospectiveNotes } from "../src/prospective.ts";
import { totals, type Product } from "../src/domain.ts";
const candidate: Product = {
  id: "c",
  name: "Considering zinc",
  taking: false,
  unitsPerServing: 2,
  unitsTaken: 0,
  daysPerWeek: 0,
  ingredients: [{ nutrient: "Zinc", amount: 35, unit: "mg" }],
};
test("prospective serving flags are hypothetical and never change actual totals", () => {
  const at18 = prospectiveNotes(candidate, [], 18);
  assert(
    at18.some((t) => t.includes("One printed serving") && t.includes("34 mg")),
  );
  assert.equal(prospectiveNotes(candidate, [], 19).length, 0);
  assert.equal(prospectiveNotes(candidate, [], 0).length, 0);
  assert.deepEqual(totals([candidate]), []);
});
test("prospective overlap includes ingredient families but excludes unrelated/currently-considering entries", () => {
  const current: Product = {
    ...candidate,
    taking: true,
    unitsTaken: 1,
    daysPerWeek: 7,
  };
  assert(
    prospectiveNotes(candidate, [current], 35).some((t) =>
      t.includes("current routine: Zinc"),
    ),
  );
  assert.equal(
    prospectiveNotes(
      candidate,
      [
        {
          ...current,
          ingredients: [{ nutrient: "Iron", amount: 10, unit: "mg" }],
        },
      ],
      35,
    ).length,
    0,
  );
  assert.equal(prospectiveNotes(candidate, [candidate], 35).length, 0);
  const oil: Product = {
    ...candidate,
    ingredients: [{ nutrient: "Fish oil", amount: 1000, unit: "mg" }],
  };
  const epa: Product = {
    ...current,
    ingredients: [{ nutrient: "EPA", amount: 300, unit: "mg" }],
  };
  assert(
    prospectiveNotes(oil, [epa], 35).some((t) => t.includes("current routine")),
  );
});
