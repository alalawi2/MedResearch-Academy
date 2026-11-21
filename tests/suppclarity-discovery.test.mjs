import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { validatedLabel } from "../lib/suppclarity/label.mjs";
import {
  discoverProducts,
  discoveredMatches,
  safeSource,
  matchesQuery,
} from "../lib/suppclarity/discovery.mjs";
import {
  answerQuestion,
  copilotInput,
  scopeAnswer,
} from "../lib/suppclarity/copilot.mjs";
import { createHandler as products } from "../api/suppclarity/products.mjs";
import { createHandler as copilot } from "../api/suppclarity/copilot.mjs";
const label = {
  hasSupplementFacts: true,
  panelComplete: true,
  brand: "Nature's Own",
  productName: "Magnesium + Energy",
  servingText: "Each tablet contains",
  servingUnits: 1,
  servingUnit: "tablet",
  ingredients: [
    {
      name: "Magnesium",
      amount: 300,
      unit: "mg",
      reading: "clear",
      labelText: "Magnesium (from Magnesium Carbonate Hydrate) 300mg",
    },
  ],
  concerns: [],
};
const url = "https://www.naturesown.com.au/products/energy/magnesium-energy/";
const provider = (matches, urls = [url]) => ({
  status: "completed",
  output: [
    {
      type: "web_search_call",
      action: { sources: urls.map((url) => ({ url })) },
    },
    {
      type: "message",
      content: [{ type: "output_text", text: JSON.stringify({ matches }) }],
    },
  ],
});
const match = {
  name: "Magnesium + Energy",
  brand: "Nature's Own",
  url,
  sourceType: "manufacturer",
  market: "Australia",
  label,
};
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
test("a front-only photo keeps name and brand without inventing quantities", () => {
  const out = validatedLabel({ ...label, hasSupplementFacts: false });
  assert.equal(out.productName, "Magnesium + Energy");
  assert.equal(out.brand, "Nature's Own");
  assert.deepEqual(out.ingredients, []);
  assert.equal(out.servingUnits, null);
});
test("only consulted HTTPS product sources survive discovery and blank evidence cannot prefill an amount", () => {
  assert.equal(
    discoveredMatches(provider([match]))[0].label.ingredients[0].amount,
    300,
  );
  assert(matchesQuery("natures own magnesium energy", match));
  assert(!matchesQuery("natures own magnesium sleep", match));
  assert(
    !matchesQuery("vitamin D", { name: "Vitamin C", brand: "Nature Made" }),
  );
  assert.equal(
    discoveredMatches(
      provider([{ ...match, url: "https://made-up.invalid/product" }]),
    ).length,
    0,
  );
  for (const u of [
    "http://example.com",
    "https://127.0.0.1/",
    "https://localhost/",
    "https://a:b@example.com/",
    "javascript:alert(1)",
  ])
    assert.equal(safeSource(u), null);
  const bad = structuredClone(match);
  bad.label.ingredients[0].labelText = "";
  assert.equal(
    discoveredMatches(provider([bad]))[0].label.ingredients[0].amount,
    null,
  );
});
test("online search uses bounded stateless web retrieval, with only the product query", async () => {
  let body;
  const found = await discoverProducts({
    query: "natures own magnesium energy",
    apiKey: "test",
    upstream: async (u, o) => {
      body = JSON.parse(o.body);
      return { ok: true, json: async () => provider([match]) };
    },
  });
  assert.equal(found.length, 1);
  assert.equal(body.store, false);
  assert.equal(body.tools[0].type, "web_search");
  assert.equal(body.max_tool_calls, 2);
  assert.deepEqual(JSON.parse(body.input), {
    productQuery: "natures own magnesium energy",
  });
  await assert.rejects(
    discoverProducts({
      query: "magnesium",
      apiKey: "test",
      upstream: async () => ({ ok: false }),
    }),
  );
});
test("NIH misses automatically check online; online limits do not become a false no-match claim", async () => {
  let searches = 0;
  const env = { OPENAI_API_KEY: "test" };
  const out = res();
  await products({
    env,
    search: async () => [],
    reserve: async () => null,
    discover: async ({ query }) => {
      searches++;
      assert.equal(query, "natures own magnesium energy");
      return [match];
    },
  })(
    {
      method: "GET",
      headers: {},
      query: { q: "natures own magnesium energy" },
    },
    out,
  );
  assert.equal(out.code, 200);
  assert.equal(searches, 1);
  assert.equal(out.body.onlineStatus, "searched");
  assert.equal(out.body.webMatches.length, 1);
  const blocked = res();
  await products({
    env,
    search: async () => [],
    reserve: async () => ({ status: 429 }),
    discover: async () => {
      throw Error("must not call");
    },
  })({ method: "GET", headers: {}, query: { q: "magnesium" } }, blocked);
  assert.equal(blocked.body.onlineStatus, "allowance-reached");
  assert.equal(blocked.headers["Cache-Control"], "no-store");
  const fail = res();
  await products({
    env,
    search: async () => {
      throw Error();
    },
    reserve: async () => null,
    discover: async () => [match],
  })({ method: "GET", headers: {}, query: { q: "magnesium" } }, fail);
  assert.equal(fail.body.webMatches.length, 1);
  assert.equal(fail.body.databaseAvailable, false);
});
test("an explicit online check works even when NIH returns candidates", async () => {
  let called = false;
  const out = res();
  await products({
    env: { OPENAI_API_KEY: "test" },
    search: async () => [{ id: "1" }],
    reserve: async () => null,
    discover: async () => {
      called = true;
      return [match];
    },
  })({ method: "GET", headers: {}, query: { q: "magnesium", web: "1" } }, out);
  assert(called);
  assert.equal(out.body.products.length, 1);
});
test("copilot accepts short follow-ups, rejects hidden profiles, and scopes personal doses without a model", async () => {
  assert.equal(
    copilotInput({
      question: "what about forms?",
      history: [{ question: "magnesium", answer: "A nutrient." }],
    }).history.length,
    1,
  );
  for (const body of [
    { question: "a".repeat(501) },
    { question: "magnesium", profile: { age: 35 } },
    {
      question: "magnesium",
      history: Array(3).fill({ question: "q", answer: "a" }),
    },
  ])
    assert.throws(() => copilotInput(body));
  assert(scopeAnswer("How many capsules should I take?"));
  assert(scopeAnswer("Can it interact with my medicine?"));
  let called = false;
  const answer = await answerQuestion({
    question: "How many capsules should I take?",
    apiKey: "test",
    upstream: async () => {
      called = true;
    },
  });
  assert(!called);
  assert(answer.answer.includes("personal supplement dose"));
});
test("grounded answers contain curated references and cannot claim arbitrary source IDs", async () => {
  let request;
  const invoke = (ids) =>
    answerQuestion({
      question: "What is the difference between magnesium forms?",
      apiKey: "test",
      upstream: async (u, o) => {
        request = JSON.parse(o.body);
        return {
          ok: true,
          json: async () => ({
            status: "completed",
            output: [
              {
                content: [
                  {
                    type: "output_text",
                    text: JSON.stringify({
                      answer: "The guide cannot rank every form for you.",
                      sourceIds: ids,
                      guide: "magnesium",
                    }),
                  },
                ],
              },
            ],
          }),
        };
      },
    });
  const out = await invoke(["magnesiumNIH", "invented"]);
  assert.deepEqual(out.sourceIds, ["magnesiumNIH"]);
  assert.equal(request.store, false);
  assert(!Object.hasOwn(request, "tools"));
  assert(!Object.hasOwn(JSON.parse(request.input), "profile"));
  const empty = await invoke(["invented"]);
  assert(empty.answer.includes("enough supported information"));
  assert.deepEqual(empty.sourceIds, []);
});
function req(body, origin) {
  const r = Readable.from([Buffer.from(JSON.stringify(body))]);
  r.method = "POST";
  r.headers = {
    "content-type": "application/json",
    ...(origin ? { origin } : {}),
  };
  return r;
}
test("live-answer endpoint validates before quota, rejects foreign origins and hides provider failures", async () => {
  let calls = 0;
  const handler = copilot({
    env: { OPENAI_API_KEY: "test" },
    reserve: async () => {
      calls++;
      return null;
    },
    answer: async () => {
      throw Error("private provider detail");
    },
  });
  const bad = res();
  await handler(req({ question: "x", profile: {} }), bad);
  assert.equal(bad.code, 400);
  assert.equal(calls, 0);
  const denied = res();
  await handler(req({ question: "magnesium" }, "https://evil.example"), denied);
  assert.equal(denied.code, 403);
  assert.equal(calls, 0);
  const fail = res();
  await handler(req({ question: "What magnesium forms exist?" }), fail);
  assert.equal(fail.code, 502);
  assert(!JSON.stringify(fail.body).includes("private"));
  const safety = res();
  await handler(req({ question: "How much should I take?" }), safety);
  assert.equal(safety.code, 200);
  assert.equal(calls, 1);
});
