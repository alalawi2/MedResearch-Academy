import test from "node:test";
import assert from "node:assert/strict";
import {
  createVault,
  validateSnapshot,
  type Snapshot,
} from "../src/local-vault.ts";
import { emptyProfile } from "../src/domain.ts";
function fixture() {
  const data = new Map<string, string>();
  let failAt = "";
  const storage = {
    get: async (k: string) => data.get(k) ?? null,
    set: async (k: string, v: string) => {
      if (k === failAt) throw new Error("locked");
      assert.ok(Buffer.byteLength(v) <= 2000);
      data.set(k, v);
    },
    remove: async (k: string) => {
      if (k === failAt) throw new Error("locked");
      data.delete(k);
    },
  };
  return {
    data,
    vault: createVault(storage),
    fail: (key: string) => {
      failAt = key;
    },
  };
}
function snapshot(name = ""): Snapshot {
  return {
    version: 1,
    profile: { ...emptyProfile, goal: name },
    products: [],
    step: 2,
    scale: 1.15,
  };
}
test("saved routine restores after a fresh vault and preserves Unicode across small encrypted chunks", async () => {
  const f = fixture();
  const value = snapshot("🧑🏽‍⚕️".repeat(20));
  value.products = Array.from({ length: 20 }, (_, n) => ({
    id: String(n),
    name: `Bottle ${n}`,
    unitsPerServing: 1,
    unitsTaken: 1,
    daysPerWeek: 7,
    ingredients: [{ nutrient: "Magnesium", amount: 300, unit: "mg" }],
  }));
  await f.vault.write(value);
  assert.deepEqual(await f.vault.read(), value);
  assert.ok([...f.data.keys()].filter((k) => /\.a\.\d/.test(k)).length > 1);
});
test("interrupted writes preserve previous confirmed routine, later write recovers and removes abandoned chunks", async () => {
  const f = fixture();
  await f.vault.write(snapshot("old"));
  f.fail("suppclarity.v1.b.0");
  await assert.rejects(f.vault.write(snapshot("new")));
  assert.equal((await f.vault.read())?.profile.goal, "old");
  f.fail("");
  await f.vault.write(snapshot("recovered"));
  assert.equal((await f.vault.read())?.profile.goal, "recovered");
  assert.equal(
    [...f.data.keys()].some((k) => k.startsWith("suppclarity.v1.a.")),
    false,
  );
});
test("rapid saves and clear are ordered and no old health entries remain", async () => {
  const f = fixture();
  await Promise.all([
    f.vault.write(snapshot("a")),
    f.vault.write(snapshot("b")),
    f.vault.clear(),
  ]);
  assert.equal(await f.vault.read(), null);
  assert.equal(f.data.size, 0);
});
test("corrupt storage is not silently treated as an empty saved routine; explicit clear recovers", async () => {
  const f = fixture();
  f.data.set("suppclarity.v1", "corrupt");
  f.data.set("suppclarity.v1.a.0", "private");
  f.data.set("suppclarity.v1.a.count", "1");
  await assert.rejects(f.vault.read());
  await f.vault.clear();
  assert.equal(f.data.size, 0);
});
test("erasure failure is visible and old routine cannot be restored after pointer removal", async () => {
  const f = fixture();
  await f.vault.write(snapshot("private"));
  f.fail("suppclarity.v1.a.0");
  await assert.rejects(f.vault.clear());
  assert.equal(await f.vault.read(), null);
  f.fail("");
  await f.vault.clear();
  assert.equal(f.data.size, 0);
});
test("malformed or unsupported saved data cannot enter dose calculations", () => {
  assert.throws(() =>
    validateSnapshot({
      ...snapshot(),
      profile: { ...emptyProfile, sexReference: "invalid" },
    }),
  );
  assert.throws(() =>
    validateSnapshot({
      ...snapshot(),
      products: [{ name: "bad", unitsPerServing: 0 }],
    }),
  );
  assert.throws(() => validateSnapshot({ ...snapshot(), scale: 99 }));
});
