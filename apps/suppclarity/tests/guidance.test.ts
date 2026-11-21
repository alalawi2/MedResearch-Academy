import { strict as assert } from "node:assert";
import { test } from "node:test";
import { guidance } from "../src/guidance.ts";
import { totals, type Profile, type Product } from "../src/domain.ts";
import { confirmedProduct, draftRows, type ReadLabel } from "../src/labels.ts";
const date = "2026-11-21";
const profile: Profile = {
  use: "No",
  age: "35",
  diet: "Mixed diet",
  context: "No special circumstances",
  screening: "None of these",
  goal: "Whether to start supplements",
};
const product: Product = {
  id: "x",
  name: "Label",
  unitsPerServing: 2,
  unitsTaken: 1,
  daysPerWeek: 7,
  ingredients: [
    { nutrient: "Vitamin D", amount: 25, unit: "mcg" },
    { nutrient: "Vitamin B12", amount: 50, unit: "mcg" },
  ],
  unassessedIngredients: ["Zinc"],
  taking: true,
};
const run = (p = profile, ps: Product[] = []) => guidance(p, ps, date);
test("vegan guidance is specific without claiming deficiency or assigning a dose", () => {
  const g = run({ ...profile, diet: "Vegan", b12Source: "Neither regularly" });
  assert.equal(g.primary.id, "b12-source");
  assert(g.primary.sourceIds.includes("b12Review"));
  assert(g.primary.limits.includes("individual supplement dose"));
});
test("known B12 source is reviewed rather than automatically stacked", () => {
  const g = run({ ...profile, use: "Yes", diet: "Vegan" }, [product]);
  assert(g.primary.text.includes("before adding"));
});
test("claimed but unrecorded B12 supplement is requested before adding more", () => {
  const g = run({
    ...profile,
    diet: "Vegan",
    b12Source: "I take a B12-containing supplement",
  });
  assert.equal(g.primary.route, "/product");
});
test("19, 74, 75 and 18 use different vitamin D guideline populations", () => {
  for (const age of ["19", "74"])
    assert(
      [
        ...run({ ...profile, age }).additional,
        run({ ...profile, age }).primary,
      ].some((c) => c.id === "d-adult"),
    );
  assert.equal(run({ ...profile, age: "75" }).primary.id, "d-75-plus");
  assert(
    [
      ...run({ ...profile, age: "18" }).additional,
      run({ ...profile, age: "18" }).primary,
    ].some((c) => c.id === "d-age18"),
  );
});
test("medicine, unknown, clinician plan and special circumstances stop nutritional suggestions", () => {
  for (const screening of [
    "I take medicines",
    "Not sure",
    "Clinician-directed supplements or a known deficiency",
  ]) {
    const g = run({ ...profile, screening });
    assert.equal(g.status, "limited");
    assert.equal(g.primary.id, "individual-review");
  }
  for (const context of [
    "Pregnant or breastfeeding",
    "Trying to conceive",
    "Prefer not to say",
    "unexpected",
  ])
    assert.equal(run({ ...profile, context }).status, "limited");
});
test("upper reference compares use-day exposure, not a diluted weekly average", () => {
  const p = {
    ...product,
    ingredients: [
      { nutrient: "Vitamin D" as const, amount: 10000, unit: "IU" },
    ],
    daysPerWeek: 1,
    unitsPerServing: 1,
  };
  const g = run(profile, [p]);
  assert.equal(g.primary.id, "reference-Vitamin D");
  assert(g.primary.why.includes("250 mcg"));
  assert(totals([p])[0].amount < 100);
});
test("reference boundaries do not become safe badges", () => {
  for (const [nutrient, unit, bound] of [
    ["Vitamin D", "mcg", 100],
    ["Magnesium", "mg", 350],
  ] as const) {
    const p = {
      ...product,
      ingredients: [{ nutrient, amount: bound, unit }],
      unitsPerServing: 1,
    };
    assert(!run(profile, [p]).primary.id.startsWith("reference"));
    assert(
      run(profile, [
        { ...p, ingredients: [{ nutrient, amount: bound + 0.1, unit }] },
      ]).primary.id.startsWith("reference"),
    );
  }
});
test("quantity reference remains visible alongside medicine scope limits", () => {
  const g = run({ ...profile, screening: "I take medicines" }, [
    {
      ...product,
      ingredients: [{ nutrient: "Magnesium", amount: 500, unit: "mg" }],
      unitsPerServing: 1,
    },
  ]);
  assert.equal(g.status, "limited");
  assert(g.additional.some((c) => c.id === "individual-review" && c.essential));
  assert(g.primary.essential);
});
test("considered products are excluded from actual intake", () => {
  assert.equal(
    totals([{ ...product, taking: false, unitsTaken: 0, daysPerWeek: 0 }])
      .length,
    0,
  );
});
test("expired evidence pauses personalized suggestions", () => {
  assert.equal(guidance(profile, [], "2027-02-22").status, "stale");
});
test("unknown label rows do not become zeros or a complete assessment", () => {
  assert.equal(
    run({ ...profile, use: "Yes" }, [{ ...product, incompleteLabel: true }])
      .primary.id,
    "partial-label",
  );
});
test("uncertain scan quantities stay blank and duplicate unit rows cannot double-count", () => {
  const label: ReadLabel = {
    hasSupplementFacts: true,
    panelComplete: true,
    productName: "Example",
    servingText: "2 capsules",
    servingUnits: 2,
    servingUnit: "capsules",
    concerns: [],
    ingredients: [
      {
        id: "d",
        name: "Vitamin D",
        nutrient: "Vitamin D",
        amount: 25,
        unit: "mcg",
        reading: "uncertain",
        labelText: "25?",
        supported: true,
      },
      {
        id: "z",
        name: "Zinc",
        nutrient: null,
        amount: 10,
        unit: "mg",
        reading: "clear",
        labelText: "10 mg",
        supported: false,
      },
    ],
  };
  const rows = draftRows(label);
  assert.equal(rows[0].amount, "");
  assert.equal(
    confirmedProduct({
      name: "Example",
      serving: "2",
      servingUnit: "capsules",
      taken: "1",
      days: "7",
      taking: true,
      rows,
      label,
    }),
    null,
  );
  rows[0].amount = "25";
  const p = confirmedProduct({
    name: "Example",
    serving: "2",
    servingUnit: "capsules",
    taken: "1",
    days: "7",
    taking: true,
    rows,
    label,
  });
  assert.equal(p?.unassessedIngredients?.[0], "Zinc");
  assert.equal(
    confirmedProduct({
      name: "Example",
      serving: "2",
      servingUnit: "capsules",
      taken: "1",
      days: "7",
      taking: true,
      rows: [...rows, { ...rows[0], id: "d2", unit: "IU", amount: "1000" }],
      label,
    }),
    null,
  );
});
test("expanded nutrient flags apply the age-specific ceiling on use days", () => {
  const zinc: Product = {
    ...product,
    unitsPerServing: 1,
    ingredients: [{ nutrient: "Zinc", amount: 35, unit: "mg" }],
  };
  assert.equal(
    run({ ...profile, age: "18" }, [zinc]).primary.id,
    "reference-Zinc",
  );
  assert(
    ![
      run({ ...profile, age: "19" }, [zinc]).primary,
      ...run({ ...profile, age: "19" }, [zinc]).additional,
    ].some((c) => c.id === "reference-Zinc"),
  );
  const calcium: Product = {
    ...zinc,
    ingredients: [{ nutrient: "Calcium", amount: 2200, unit: "mg" }],
  };
  assert.equal(
    run({ ...profile, age: "51" }, [calcium]).primary.id,
    "reference-Calcium",
  );
  assert.notEqual(
    run({ ...profile, age: "50" }, [calcium]).primary.id,
    "reference-Calcium",
  );
});
test("common goal scenarios select relevant education without inventing a dose", () => {
  assert.equal(
    run({ ...profile, goal: "Exercise and recovery" }).primary.topic,
    "protein",
  );
  assert.equal(
    run({ ...profile, goal: "Digestion and gut health" }).primary.topic,
    "fibre",
  );
  assert.equal(
    run({ ...profile, goal: "Sleep or general wellbeing" }).primary.id,
    "magnesium-food",
  );
  const herb: Product = {
    ...product,
    ingredients: [{ nutrient: "Ashwagandha", amount: 300, unit: "mg" }],
  };
  assert.equal(
    run({ ...profile, use: "Yes" }, [herb]).primary.topic,
    "ashwagandha",
  );
  assert.equal(
    run({
      ...profile,
      screening: "I take medicines",
      goal: "Exercise and recovery",
    }).status,
    "limited",
  );
});
