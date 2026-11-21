import {
  emptyProfile,
  validProduct,
  type Profile,
  type Product,
} from "./domain.ts";
export type Snapshot = {
  version: 1;
  profile: Profile;
  products: Product[];
  step: number;
  scale: number;
};
export type VaultStorage = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};
const prefix = "suppclarity.v1";
const maxChunks = 400;
type Manifest = { slot: "a" | "b"; count: number };
function manifest(value: string | null): Manifest | null {
  if (!value) return null;
  const x = JSON.parse(value);
  if (
    !["a", "b"].includes(x.slot) ||
    !Number.isInteger(x.count) ||
    x.count < 1 ||
    x.count > maxChunks
  )
    throw new Error("Invalid saved routine");
  return x;
}
export function validateSnapshot(value: unknown): Snapshot {
  const x = value as Snapshot;
  if (
    !x ||
    x.version !== 1 ||
    !x.profile ||
    !Array.isArray(x.products) ||
    x.products.length > 100 ||
    !x.products.every(validProduct)
  )
    throw new Error("Invalid saved routine");
  const profile = { ...emptyProfile };
  for (const key of Object.keys(emptyProfile) as Exclude<
    keyof Profile,
    "sexReference"
  >[]) {
    if (typeof x.profile[key] !== "string" || x.profile[key]!.length > 300)
      throw new Error("Invalid saved profile");
    profile[key] = x.profile[key]!;
  }
  if (
    x.profile.sexReference &&
    !["male", "female", "both"].includes(x.profile.sexReference)
  )
    throw new Error("Invalid reference");
  if (x.profile.sexReference) profile.sexReference = x.profile.sexReference;
  if (
    !Number.isInteger(x.step) ||
    x.step < 0 ||
    x.step > 20 ||
    ![1, 1.15, 1.3].includes(x.scale)
  )
    throw new Error("Invalid preferences");
  return {
    version: 1,
    profile,
    products: x.products,
    step: x.step,
    scale: x.scale,
  };
}
// Commit a pointer only after every encrypted chunk is written. A failed save
// leaves the previous routine readable. Each value is at most 2,000 UTF-8 bytes.
export function createVault(storage: VaultStorage) {
  let queue = Promise.resolve();
  async function read() {
    const m = manifest(await storage.get(prefix));
    if (!m) return null;
    const parts = [];
    for (let n = 0; n < m.count; n++) {
      const part = await storage.get(`${prefix}.${m.slot}.${n}`);
      if (part === null) throw new Error("Incomplete saved routine");
      parts.push(part);
    }
    return validateSnapshot(JSON.parse(parts.join("")));
  }
  async function write(value: Snapshot) {
    const validated = validateSnapshot(value);
    // Copy now so later React changes cannot mutate a queued snapshot.
    const points = Array.from(JSON.stringify(validated));
    if (points.length > 500 * maxChunks)
      return Promise.reject(new Error("Saved routine is too large"));
    const parts: string[] = [];
    for (let n = 0; n < points.length; n += 500)
      parts.push(points.slice(n, n + 500).join(""));
    const task = queue
      .catch(() => {})
      .then(async () => {
        const old = manifest(await storage.get(prefix));
        const slot = old?.slot === "a" ? "b" : "a";
        const previousCount = Number(
          (await storage.get(`${prefix}.${slot}.count`)) || 0,
        );
        if (
          !Number.isInteger(previousCount) ||
          previousCount < 0 ||
          previousCount > maxChunks
        )
          throw new Error("Invalid saved chunks");
        const reservedCount = Math.max(previousCount, parts.length);
        await storage.set(`${prefix}.${slot}.count`, String(reservedCount));
        for (let n = 0; n < parts.length; n++)
          await storage.set(`${prefix}.${slot}.${n}`, parts[n]);
        await storage.set(
          prefix,
          JSON.stringify({ slot, count: parts.length }),
        );
        // Remove old and abandoned chunks, including after an interrupted write.
        // Failure is reported: callers must not promise erasure when it fails.
        for (let n = parts.length; n < reservedCount; n++)
          await storage.remove(`${prefix}.${slot}.${n}`);
        await storage.set(`${prefix}.${slot}.count`, String(parts.length));
        if (old) {
          const oldCount = Number(
            (await storage.get(`${prefix}.${old.slot}.count`)) || old.count,
          );
          if (
            !Number.isInteger(oldCount) ||
            oldCount < old.count ||
            oldCount > maxChunks
          )
            throw new Error("Invalid saved chunks");
          for (let n = 0; n < oldCount; n++)
            await storage.remove(`${prefix}.${old.slot}.${n}`);
          await storage.remove(`${prefix}.${old.slot}.count`);
        }
      });
    queue = task;
    return task;
  }
  function clear() {
    const task = queue
      .catch(() => {})
      .then(async () => {
        // Explicit erasure can recover even a corrupt manifest. Remove the pointer
        // first so an interrupted clear cannot restore an old health record.
        await storage.remove(prefix);
        for (const slot of ["a", "b"]) {
          const stored = Number(await storage.get(`${prefix}.${slot}.count`));
          const count =
            Number.isInteger(stored) && stored >= 0 && stored <= maxChunks
              ? stored
              : maxChunks;
          for (let n = 0; n < count; n++)
            await storage.remove(`${prefix}.${slot}.${n}`);
          await storage.remove(`${prefix}.${slot}.count`);
        }
      });
    queue = task;
    return task;
  }
  return { read, write, clear };
}
