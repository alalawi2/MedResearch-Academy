import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  askCopilot,
  faqBank,
  localGuides,
  guideTopic,
} from "../src/knowledge.ts";
import { sources } from "../src/evidence.ts";
import { nutrientCatalog } from "../src/catalog.mjs";
test("100 distinct prepared questions and every guide resolve to dated sources", () => {
  assert.equal(faqBank.length, 100);
  assert.equal(new Set(faqBank.map((f) => f.id)).size, 100);
  assert.equal(new Set(faqBank.map((f) => f.question)).size, 100);
  assert.equal(Object.keys(localGuides).length, 29);
  for (const f of faqBank) {
    assert(f.question.trim() && f.answer.length > 20);
    assert(Object.hasOwn(localGuides, f.guide), f.id);
    assert(
      f.sourceIds.length &&
        f.sourceIds.every((id) => Object.hasOwn(sources, id)),
      f.id,
    );
  }
  for (const [id, g] of Object.entries(localGuides)) {
    assert(g.summary && g.food && g.evidence && g.check, id);
    assert(
      g.sourceIds.every((source) => Object.hasOwn(sources, source)),
      id,
    );
    if (g.topic) assert(guideTopic(id as keyof typeof localGuides), id);
  }
  for (const [name, item] of Object.entries(nutrientCatalog))
    assert(Object.hasOwn(localGuides, item.guide), name);
});
test("exact prepared questions return their own answer unless an explicit scope guard applies", () => {
  for (const f of faqBank) {
    const response = askCopilot(f.question);
    assert(response.answer || response.choices.length, f.id);
    if (
      response.kind === "answer" &&
      !["q081", "q087", "q088"].includes(response.faq!.id)
    )
      assert.equal(response.faq!.id, f.id, f.question);
  }
});
test("ambiguous and unknown questions cannot invent a medical answer", () => {
  assert.equal(askCopilot("magnesium").kind, "choices");
  const r = askCopilot("quantum teleportation tickets");
  assert.equal(r.kind, "choices");
  assert.equal(r.choices.length, 0);
  assert.equal(askCopilot("how many capsules should I take?").kind, "scope");
  assert.equal(askCopilot("Can I take this with my warfarin?").faq?.id, "q081");
  assert.equal(
    askCopilot("I accidentally took too many tablets").faq?.id,
    "q087",
  );
  assert.equal(askCopilot("I have trouble breathing").faq?.id, "q088");
});
