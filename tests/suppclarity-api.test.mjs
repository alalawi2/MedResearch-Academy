import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Readable } from "node:stream";
import { createHandler as scanHandler } from "../api/suppclarity/scan.mjs";
import { createHandler as evidenceHandler } from "../api/suppclarity/evidence.mjs";
import {
  validatedLabel,
  normalizeNutrient,
  imageFromDataUrl,
  readLabel,
} from "../lib/suppclarity/label.mjs";
import { reserveScan, reserveEvidence } from "../lib/suppclarity/quota.mjs";
import { safePaper, searchEvidence } from "../lib/suppclarity/evidence.mjs";
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  Buffer.alloc(50),
]);
const image = "data:image/png;base64," + png.toString("base64");
const raw = {
  hasSupplementFacts: true,
  panelComplete: true,
  productName: "Example",
  servingText: "2 capsules",
  servingUnits: 2,
  servingUnit: "capsules",
  ingredients: [
    {
      name: "Vitamin D (as cholecalciferol)",
      amount: 25,
      unit: "mcg",
      reading: "clear",
      labelText: "25 mcg (1000 IU)",
    },
    {
      name: "Zinc",
      amount: 11,
      unit: "mg",
      reading: "clear",
      labelText: "11 mg",
    },
  ],
  concerns: [],
};
function req(body = { image }, headers = {}, method = "POST") {
  const r = Readable.from([Buffer.from(JSON.stringify(body))]);
  r.method = method;
  r.headers = {
    "content-type": "application/json",
    "x-suppclarity-consent": "label-photo-v1",
    "x-suppclarity-install": "a".repeat(64),
    ...headers,
  };
  r.socket = { remoteAddress: "test-ip" };
  return r;
}
function res() {
  return {
    code: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.code = n;
      return this;
    },
    json(v) {
      this.body = v;
      return this;
    },
    end() {
      return this;
    },
  };
}
const env = {
  OPENAI_API_KEY: "test-provider-secret",
  CONSENSUS_API_KEY: "test-consensus-secret",
  VITE_SUPABASE_URL: "https://test.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "test-quota-secret",
};
test("image guard rejects URLs, SVG, invalid encoding, MIME mismatch and oversized input", () => {
  assert.equal(imageFromDataUrl(image), image);
  for (const v of [
    "https://example.com/a.jpg",
    "data:image/svg+xml;base64,PHN2Zz4=",
    image.replace("image/png", "image/jpeg"),
    image + "invalid",
    "data:image/png;base64," + "A".repeat(3600000),
  ])
    assert.throws(() => imageFromDataUrl(v));
});
test("compound or blended amounts cannot be mistaken for elemental target amounts", () => {
  assert.equal(normalizeNutrient("Magnesium (as citrate)"), "Magnesium");
  assert.equal(normalizeNutrient("Magnesium citrate"), null);
  assert.equal(normalizeNutrient("Vitamin D and calcium blend"), null);
  assert.equal(
    normalizeNutrient("Vitamin B12 (as methylcobalamin)"),
    "Vitamin B12",
  );
});
test("all rows remain visible while unsupported and uncertain quantities stay unassessed", () => {
  const l = validatedLabel(raw);
  assert.equal(l.ingredients.length, 2);
  assert.equal(l.ingredients[1].supported, false);
  const x = validatedLabel({
    ...raw,
    panelComplete: false,
    ingredients: [
      {
        ...raw.ingredients[0],
        amount: null,
        unit: "unknown",
        reading: "unreadable",
      },
    ],
  });
  assert.equal(x.ingredients[0].amount, null);
  assert.equal(x.panelComplete, false);
  assert.equal(x.ingredients[0].supported, false);
  assert.throws(() => validatedLabel({ ...raw, servingUnits: 0 }));
});
test("unsupported target units cannot prefill a canonical quantity", () => {
  const l = validatedLabel({
    ...raw,
    ingredients: [
      {
        name: "Vitamin B12",
        amount: 1,
        unit: "mg",
        reading: "clear",
        labelText: "Vitamin B12 1 mg",
      },
    ],
  });
  assert.equal(l.ingredients[0].unit, "mg");
  assert.equal(l.ingredients[0].amount, 1); // Preserve transcription without pretending it is 1 mcg.
  assert.equal(l.ingredients[0].reading, "uncertain");
  assert.equal(l.panelComplete, false);
  assert(l.concerns.some((c) => c.includes("converted amount manually")));
});
test("unreadable non-label does not become a guessed product", () => {
  assert.equal(
    validatedLabel({ ...raw, hasSupplementFacts: false }).ingredients.length,
    0,
  );
});
test("consent, origin, method, body size and image checks run before spending", async () => {
  let reads = 0,
    quotas = 0;
  const h = scanHandler({
    env,
    read: async () => {
      reads++;
      return raw;
    },
    reserve: async () => {
      quotas++;
      return null;
    },
  });
  for (const [r, code] of [
    [req({}, { "x-suppclarity-consent": "" }), 403],
    [req({}, { origin: "https://evil.invalid" }), 403],
    [req({}, {}, "GET"), 405],
    [req({}, { "content-length": "4000000" }), 413],
    [req({ image: "https://evil.invalid/image" }), 400],
  ]) {
    const s = res();
    await h(r, s);
    assert.equal(s.code, code);
  }
  assert.equal(reads, 0);
  assert.equal(quotas, 0);
});
test("quota failure stops provider calls, without a public-key fallback", async () => {
  let called = false;
  const h = scanHandler({
    env,
    read: async () => {
      called = true;
    },
    reserve: async () => ({ status: 429, error: "Allowance reached" }),
  });
  const s = res();
  await h(req(), s);
  assert.equal(s.code, 429);
  assert(!called);
});
test("successful scan is always a confirmation draft, never a recommendation", async () => {
  const s = res();
  await scanHandler({
    env,
    read: async () => validatedLabel(raw),
    reserve: async () => null,
  })(req(), s);
  assert.equal(s.code, 200);
  assert.equal(s.body.requiresConfirmation, true);
  assert.equal(s.body.provider, "OpenAI");
  assert(!("recommendation" in s.body));
  assert.equal(s.headers["Cache-Control"], "no-store");
});
test("provider failure remains generic and does not leak response or secrets", async () => {
  const s = res();
  await scanHandler({
    env,
    reserve: async () => null,
    read: async () => {
      throw Error(env.OPENAI_API_KEY);
    },
  })(req(), s);
  assert.equal(s.code, 502);
  assert(!JSON.stringify(s.body).includes(env.OPENAI_API_KEY));
});
test("Responses request is image-only extraction, stateless, bounded and structured", async () => {
  let sent;
  const result = await readLabel({
    apiKey: "mock",
    image,
    upstream: async (url, options) => {
      sent = JSON.parse(options.body);
      assert.equal(url, "https://api.openai.com/v1/responses");
      return {
        ok: true,
        json: async () => ({
          status: "completed",
          output: [
            { content: [{ type: "output_text", text: JSON.stringify(raw) }] },
          ],
        }),
      };
    },
  });
  assert.equal(sent.store, false);
  assert.equal(sent.text.format.strict, true);
  assert.equal(sent.max_output_tokens, 5000);
  assert.equal(result.ingredients[0].amount, 25);
});
test("durable counters receive keyed identifiers, not raw IP or client identifiers", async () => {
  let params;
  assert.equal(
    await reserveScan("installation", "private-ip", env, async (p) => {
      params = p;
      return { data: true };
    }),
    null,
  );
  assert.match(params.p_install_hash, /^[a-f0-9]{64}$/);
  assert.match(params.p_ip_hash, /^[a-f0-9]{64}$/);
  assert(!JSON.stringify(params).includes("private-ip"));
  assert.equal(
    (await reserveScan("x", "x", {}, async () => ({ data: true }))).status,
    503,
  );
  assert.equal(
    (
      await reserveEvidence("x", env, async () => ({
        error: { message: "quota_exceeded" },
      }))
    ).status,
    429,
  );
});
test("research query is fixed and arbitrary profile text is rejected before a search", async () => {
  let searched = false;
  const h = evidenceHandler({
    env,
    reserve: async () => null,
    search: async () => {
      searched = true;
      return [];
    },
  });
  const r = req({}, {}, "GET");
  r.query = { topic: "diagnose my condition" };
  const s = res();
  await h(r, s);
  assert.equal(s.code, 400);
  assert(!searched);
});
test("research returns paper metadata, not generated personal advice or untrusted links", async () => {
  assert.equal(safePaper({ title: "Bad", url: "javascript:alert(1)" }), null);
  assert.equal(safePaper({ title: "Bad", url: "https://evil.invalid" }), null);
  const papers = await searchEvidence({
    apiKey: "mock",
    topic: "b12-vegan",
    upstream: async (url, options) => {
      assert(!String(url).includes("private"));
      assert.equal(options.headers["x-api-key"], "mock");
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              title: "Example paper",
              doi: "10.1234/abc",
              publish_year: 2024,
              takeaway: "Take 100 pills",
              journal_name: "Example",
            },
          ],
        }),
      };
    },
  });
  assert.equal(papers[0].url, "https://doi.org/10.1234/abc");
  assert(!("takeaway" in papers[0]));
});
