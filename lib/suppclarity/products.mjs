import { validatedLabel } from "./label.mjs";
import {
  identifyNutrient,
  normalizeQuantity,
} from "../../apps/suppclarity/src/catalog.mjs";
const BASE = "https://api.ods.od.nih.gov/dsld/v9/";
const text = (v, n = 120) =>
  typeof v === "string" ? v.trim().slice(0, n) : "";
export function productQuery(value) {
  if (
    typeof value !== "string" ||
    value.trim().length < 2 ||
    value.length > 120
  )
    throw Error("Enter a product name, brand or complete barcode.");
  const q = value.trim().replace(/\s+/g, " ");
  const digits = q.replace(/[\s-]/g, "");
  if (/^\d+$/.test(digits) && ![8, 12, 13, 14].includes(digits.length))
    throw Error("Enter the complete barcode, or include a product name.");
  if (!/[a-z0-9]/i.test(q)) throw Error("Enter a product name or barcode.");
  return q;
}
const cleanBarcode = (v) => text(v, 80).replace(/[^0-9]/g, "");
const norm = (v) =>
  text(v, 300)
    .toLowerCase()
    .replace(/(\d),(?=\d)/g, "$1")
    .replace(/[^a-z0-9]/g, "");
export function productSummary(hit) {
  const s = hit?._source;
  const id = String(hit?._id || s?.id || "");
  if (!/^\d{1,9}$/.test(id) || !text(s?.fullName)) return null;
  return {
    id,
    name: text(s.fullName),
    brand: text(s.brandName, 80),
    form: text(s.physicalState?.langualCodeDescription, 60),
    pack: text(s.netContents?.[0]?.display, 80),
    entryDate: /^\d{4}-\d{2}-\d{2}$/.test(s.entryDate || "")
      ? s.entryDate
      : null,
    offMarket: s.offMarket === 1,
  };
}
export async function searchProducts({ query, upstream = fetch, signal }) {
  const q = productQuery(query);
  const digits = q.replace(/[\s-]/g, "");
  const barcode = /^\d+$/.test(digits);
  let queries = [q.replace(/["*?{}\[\]:\\]/g, " ")];
  if (barcode) {
    queries = [`"${q}"`];
    if (digits.length === 12)
      queries.push(
        `"${digits[0]} ${digits.slice(1, 6)} ${digits.slice(6, 11)} ${digits[11]}"`,
      );
    if (digits.length === 13)
      queries.push(`"${digits[0]} ${digits.slice(1, 7)} ${digits.slice(7)}"`);
  }
  let items = [];
  for (const term of [...new Set(queries)]) {
    const url = new URL("search-filter", BASE);
    url.search = new URLSearchParams({
      q: term,
      size: barcode ? "8" : "60",
      sort_by: "_score",
      sort_order: "desc",
      status: "1",
    }).toString();
    const r = await upstream(url, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!r.ok) throw Error("Product search unavailable");
    const b = await r.json();
    if (!Array.isArray(b.hits)) throw Error("Invalid product response");
    items = b.hits.slice(0, 60).map(productSummary).filter(Boolean);
    if (items.length) break;
  }
  if (!barcode) {
    const tokens = (v) =>
      v
        .toLowerCase()
        .replace(/(\d),(?=\d)/g, "$1")
        .replace(/([a-z])(\d)/g, "$1 $2")
        .replace(/(\d)([a-z])/g, "$1 $2")
        .match(/[a-z0-9]+/g) || [];
    const required = tokens(q);
    items = items.filter((p) => {
      const found = tokens(p.brand + " " + p.name);
      return required.every((t) => found.includes(t));
    });
  }
  const seen = new Set();
  return items
    .sort((a, b) => (b.entryDate || "").localeCompare(a.entryDate || ""))
    .filter((p) => {
      const k = norm(p.brand + p.name + p.form + p.pack);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 8);
}
// FDA Daily Values are a consistency check only; never reconstruct a missing quantity from %DV.
const dv = {
  "Vitamin D": [20, "mcg"],
  "Vitamin B12": [2.4, "mcg"],
  Magnesium: [420, "mg"],
  "Vitamin C": [90, "mg"],
  Calcium: [1300, "mg"],
  Iron: [18, "mg"],
  Zinc: [11, "mg"],
  Selenium: [55, "mcg"],
  Iodine: [150, "mcg"],
  "Vitamin B6": [1.7, "mg"],
  Biotin: [30, "mcg"],
  "Folic acid": null,
};
export function databaseLabel(raw) {
  if (
    !raw ||
    !Number.isInteger(raw.id) ||
    raw.id < 1 ||
    !text(raw.fullName) ||
    !Array.isArray(raw.ingredientRows) ||
    !Array.isArray(raw.servingSizes)
  )
    throw Error("Incomplete label record");
  const choices = raw.servingSizes.filter((s) => s.inSFB !== false);
  const serving =
    choices.length === 1 &&
    Number.isFinite(choices[0].minQuantity) &&
    choices[0].minQuantity > 0 &&
    choices[0].minQuantity === choices[0].maxQuantity &&
    text(choices[0].unit, 40)
      ? choices[0]
      : null;
  let complete = !!serving && raw.ingredientRows.length > 0;
  const concerns = [];
  if (!serving)
    concerns.push(
      "This record has missing, ranged or multiple serving sizes. Confirm the serving and amounts from your bottle.",
    );
  const rows = [];
  function readRow(row, depth = 0) {
    if (depth > 8 || rows.length >= 60) {
      complete = false;
      return;
    }
    const name = text(row.name, 200);
    if (!name) return;
    const qs = Array.isArray(row.quantity)
      ? row.quantity.filter(
          (q) =>
            serving &&
            q.servingSizeOrder === serving.order &&
            q.servingSizeQuantity === serving.minQuantity &&
            text(q.servingSizeUnit).toLowerCase() ===
              text(serving.unit).toLowerCase() &&
            q.operator === "=" &&
            Number.isFinite(q.quantity) &&
            q.quantity >= 0,
        )
      : [];
    const nutrient = identifyNutrient(name);
    let chosen = qs[0];
    if (qs.length > 1) {
      const values = qs.map((q) =>
        normalizeQuantity(nutrient, q.quantity, q.unit),
      );
      if (
        !values.every(
          (v) =>
            v &&
            v.unit === values[0]?.unit &&
            Math.abs(v.amount - values[0].amount) < 1e-6,
        )
      )
        chosen = null;
    }
    let reading = chosen ? "clear" : "uncertain";
    let amount = chosen?.quantity ?? null;
    const unit = text(chosen?.unit || row.quantity?.[0]?.unit, 30);
    const value =
      chosen && nutrient ? normalizeQuantity(nutrient, amount, unit) : null;
    const ref = dv[nutrient];
    const percentage = chosen?.dailyValueTargetGroup?.find(
      (x) =>
        /adults and children 4/i.test(x.name || "") &&
        x.operator === "=" &&
        Number.isFinite(x.percent) &&
        x.percent > 0,
    )?.percent;
    if (value && ref && value.unit === ref[1] && percentage) {
      const expected = (value.amount / ref[0]) * 100;
      if (expected > percentage * 50 || expected < percentage / 50) {
        reading = "uncertain";
        amount = null;
        complete = false;
        concerns.push(
          `The ${name} amount and %DV appear inconsistent. Check the printed amount and unit; nothing has been corrected automatically.`,
        );
      }
    }
    if (!chosen) complete = false;
    rows.push({
      name,
      amount,
      unit,
      reading,
      labelText: text(
        (row.quantity || [])
          .map(
            (q) => `${q.operator || ""} ${q.quantity ?? "?"} ${q.unit || ""}`,
          )
          .join(" / "),
        300,
      ),
    });
    for (const child of Array.isArray(row.nestedRows) ? row.nestedRows : [])
      readRow(child, depth + 1);
  }
  raw.ingredientRows.forEach((row) => readRow(row));
  const label = validatedLabel({
    hasSupplementFacts: true,
    panelComplete: complete,
    productName: text(`${raw.brandName || ""} ${raw.fullName}`).trim(),
    servingText: serving ? `${serving.minQuantity} ${serving.unit}` : null,
    servingUnits: serving?.minQuantity ?? null,
    servingUnit: serving ? text(serving.unit, 40) : null,
    ingredients: rows,
    concerns: concerns.slice(0, 10),
  });
  // Row inconsistencies need explicit bottle confirmation, so retain incomplete status until a new verified entry.
  label.database = {
    id: String(raw.id),
    url: `https://dsld.od.nih.gov/label/${raw.id}`,
    brand: text(raw.brandName, 80),
    entryDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.entryDate || "")
      ? raw.entryDate
      : null,
    barcode: text(raw.upcSku, 80) || null,
  };
  label.otherIngredients = (raw.otheringredients?.ingredients || [])
    .slice(0, 60)
    .map((x) => text(x.name, 200))
    .filter(Boolean);
  return label;
}
export async function getProductLabel({ id, upstream = fetch, signal }) {
  if (!/^\d{1,9}$/.test(String(id)))
    throw Error("Choose a valid product record.");
  const r = await upstream(new URL("label/" + id, BASE), {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!r.ok) throw Error("Label record unavailable");
  const b = await r.json();
  if (String(b.id) !== String(id)) throw Error("Mismatched label record");
  return databaseLabel(b);
}
