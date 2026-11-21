import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyReference } from "../src/daily-references.ts";
import { upperReference } from "../src/upper-references.ts";
import { askCopilot } from "../src/knowledge.ts";
import { confirmedProduct, draftRows, type ReadLabel } from "../src/labels.ts";
test("general magnesium references retain age/sex differences and are distinct from the supplemental ceiling", () => {
  assert(dailyReference("Magnesium", 30, "male")?.lines[0].includes("400"));
  assert(dailyReference("Magnesium", 31, "male")?.lines[0].includes("420"));
  assert(dailyReference("Magnesium", 31, "female")?.lines[0].includes("320"));
  assert(dailyReference("Magnesium", 18, "female")?.lines[0].includes("360"));
  assert(
    dailyReference("Magnesium", 35)?.lines[0].includes("Male 420; female 320"),
  );
  assert.equal(upperReference("Magnesium", 35)?.amount, 350);
});
test("reference boundaries do not invent daily doses for herbs", () => {
  assert(dailyReference("Calcium", 70, "male")?.lines[0].includes("1000"));
  assert(dailyReference("Calcium", 71, "male")?.lines[0].includes("1200"));
  assert(dailyReference("Vitamin D", 70)?.lines[0].includes("15 mcg"));
  assert(dailyReference("Vitamin D", 71)?.lines[0].includes("20 mcg"));
  assert(dailyReference("Iron", 18, "female")?.lines[0].includes("15 mg"));
  assert(dailyReference("Iron", 19, "female")?.lines[0].includes("18 mg"));
  assert.equal(dailyReference("Ashwagandha", 35), null);
  assert.equal(dailyReference("Magnesium", 17), null);
});
test("general magnesium questions and common typos never assume a sleep goal", () => {
  for (const q of [
    "magnesium",
    "magensium",
    "tell me about magnesium",
    "what is magnesium good for",
    "magnesuim benefits",
  ]) {
    const reply = askCopilot(q);
    assert.equal(reply.kind, "answer", q);
    assert.equal(reply.nutrient, "Magnesium", q);
    assert(!reply.answer?.toLowerCase().includes("sleep"), q);
  }
  const r = askCopilot("How much magnesium per day?");
  assert(r.answer?.includes("food and supplements combined"));
  assert.equal(askCopilot("How much should I take?").kind, "scope");
  assert.equal(askCopilot("magnesium daily intake in pregnancy").kind, "scope");
});
test("online provenance survives quantity confirmation without pretending to be a scanned bottle", () => {
  const label: ReadLabel = {
    hasSupplementFacts: true,
    panelComplete: true,
    productName: "Example",
    servingText: "1 tablet",
    servingUnits: 1,
    servingUnit: "tablet",
    ingredients: [
      {
        id: "0",
        name: "Magnesium",
        nutrient: "Magnesium",
        amount: 300,
        unit: "mg",
        reading: "clear",
        labelText: "Magnesium 300 mg",
        supported: true,
      },
    ],
    concerns: [],
    web: {
      url: "https://example.com/product",
      brand: "Example",
      sourceType: "manufacturer",
      retrievedAt: "2026-11-21",
      market: "Australia",
    },
  };
  const p = confirmedProduct({
    name: "Example",
    serving: "1",
    servingUnit: "tablet",
    taken: "",
    days: "",
    taking: false,
    rows: draftRows(label),
    label,
  });
  assert.equal(p?.source, "web");
  assert.equal(p?.web?.sourceType, "manufacturer");
});
