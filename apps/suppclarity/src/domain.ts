import { nutrientCatalog, normalizeQuantity } from "./catalog.mjs";
export type Nutrient = keyof typeof nutrientCatalog;
export { nutrientCatalog };
export type Ingredient = { nutrient: Nutrient; amount: number; unit: string };
export type Product = {
  id: string;
  name: string;
  unitsPerServing: number;
  unitsTaken: number;
  daysPerWeek: number;
  nutrient?: Nutrient;
  amount?: number;
  unit?: string;
  ingredients?: Ingredient[];
  unassessedIngredients?: string[];
  incompleteLabel?: boolean;
  servingUnit?: string;
  taking?: boolean;
  source?: "manual" | "scan" | "database";
  database?: {
    id: string;
    url: string;
    brand: string;
    entryDate: string | null;
    barcode: string | null;
  };
};
export type Profile = {
  use: string;
  age: string;
  diet: string;
  context: string;
  screening: string;
  goal: string;
  b12Source?: string;
};
export const emptyProfile: Profile = {
  use: "",
  age: "",
  diet: "",
  context: "",
  screening: "",
  goal: "",
  b12Source: "",
};
export const units = Object.fromEntries(
  Object.entries(nutrientCatalog).map(([name, info]) => [name, info.units]),
) as Record<Nutrient, string[]>;
export function validAge(age: string) {
  return /^\d{2,3}$/.test(age.trim()) && Number(age) >= 18;
}
export function ingredientsOf(p: Product): Ingredient[] {
  if (p.ingredients !== undefined) return p.ingredients;
  return p.nutrient && p.amount !== undefined && p.unit
    ? [{ nutrient: p.nutrient, amount: p.amount, unit: p.unit }]
    : [];
}
export function validIngredient(i: Ingredient) {
  const normalizedValue = i && normalizeQuantity(i.nutrient, i.amount, i.unit);
  return Boolean(
    normalizedValue &&
    Number.isFinite(normalizedValue.amount) &&
    normalizedValue.amount <= (normalizedValue.unit === "CFU" ? 1e15 : 1e9) &&
    i &&
    units[i.nutrient]?.includes(i.unit) &&
    Number.isFinite(i.amount) &&
    i.amount >= 0 &&
    i.amount <= (i.unit.includes("CFU") ? 1e15 : 1e9),
  );
}
export function validProduct(p: Product) {
  if (
    !p ||
    typeof p.name !== "string" ||
    !p.name.trim() ||
    p.name.trim().length > 120 ||
    !Number.isFinite(p.unitsPerServing) ||
    p.unitsPerServing <= 0 ||
    p.unitsPerServing > 10000
  )
    return false;
  if (p.taking === false) {
    if (p.unitsTaken !== 0 || p.daysPerWeek !== 0) return false;
  } else if (
    !Number.isFinite(p.unitsTaken) ||
    p.unitsTaken <= 0 ||
    p.unitsTaken > 10000 ||
    !Number.isInteger(p.daysPerWeek) ||
    p.daysPerWeek < 1 ||
    p.daysPerWeek > 7
  )
    return false;
  const rows = ingredientsOf(p);
  if (
    !Array.isArray(rows) ||
    !rows.every(validIngredient) ||
    new Set(rows.map((x) => x.nutrient)).size !== rows.length
  )
    return false;
  if (
    p.unassessedIngredients &&
    !p.unassessedIngredients.every(
      (x) => typeof x === "string" && x.length <= 200,
    )
  )
    return false;
  return (
    rows.length > 0 ||
    Boolean(p.unassessedIngredients?.length) ||
    p.incompleteLabel === true
  );
}
export function normalized(i: Ingredient) {
  return normalizeQuantity(i.nutrient, i.amount, i.unit)?.amount ?? i.amount;
}
export function overlappingIngredients(products: Product[]) {
  const families = new Map<string, number>();
  for (const p of products.filter((p) => p.taking !== false)) {
    const present = new Set(
      ingredientsOf(p)
        .filter((i) => i.amount > 0)
        .map((i) => nutrientCatalog[i.nutrient].family),
    );
    for (const name of present)
      families.set(name, (families.get(name) || 0) + 1);
  }
  return [...families]
    .filter(([, count]) => count > 1)
    .map(([nutrient, count]) => ({ nutrient, count }));
}
export function totals(products: Product[]) {
  const groups = new Map<
    string,
    {
      nutrient: Nutrient;
      amount: number;
      onUseDay: number;
      unit: string;
      count: number;
    }
  >();
  for (const p of products) {
    if (!validProduct(p))
      throw Error("Confirm product quantities before calculation.");
    if (p.taking === false) continue;
    for (const i of ingredientsOf(p)) {
      if (!nutrientCatalog[i.nutrient].aggregate) continue;
      const value = normalizeQuantity(i.nutrient, i.amount, i.unit);
      if (!value) throw Error("Unsupported quantity unit.");
      const onUseDay = (value.amount * p.unitsTaken) / p.unitsPerServing;
      const amount = (onUseDay * p.daysPerWeek) / 7;
      const key = i.nutrient + ":" + value.unit;
      const current = groups.get(key) || {
        nutrient: i.nutrient,
        amount: 0,
        onUseDay: 0,
        unit: value.unit,
        count: 0,
      };
      current.amount += amount;
      current.onUseDay += onUseDay;
      current.count++;
      if (
        !Number.isFinite(current.amount) ||
        !Number.isFinite(current.onUseDay)
      )
        throw Error("Quantity is too large.");
      groups.set(key, current);
    }
  }
  return [...groups.values()];
}
export function profileComplete(p: Profile) {
  return (
    ["use", "age", "diet", "context", "screening", "goal"].every(
      (k) =>
        typeof p[k as keyof Profile] === "string" &&
        Boolean(p[k as keyof Profile]?.trim()),
    ) && validAge(p.age)
  );
}
// This factual routing summary is retained for existing screens and tests. Guidance uses versioned evidence rules.
export function report(profile: Profile, products: Product[]) {
  if (!profileComplete(profile))
    return {
      title: "A little more information first",
      text: "Complete your profile before reviewing your next step.",
      action: "Complete my check",
      kind: "profile",
    };
  if (
    profile.screening !== "None of these" ||
    profile.context !== "No special circumstances"
  )
    return {
      title: "Your personal check needs more context",
      text: "Medicine interactions and special health circumstances need an individual review.",
      action: "Understand this limit",
      kind: "limited",
    };
  if (profile.use === "No")
    return {
      title: "Start with understanding your diet",
      text: "A diet pattern alone does not establish a deficiency.",
      action: "Explore the evidence",
      kind: "beginner",
    };
  if (!products.some((p) => p.taking !== false))
    return {
      title: "Let’s look at what you take",
      text: "Add your current products so that existing ingredients can be considered.",
      action: "Add my first product",
      kind: "products",
    };
  const overlap = overlappingIngredients(products);
  return {
    title: overlap.length
      ? "Some ingredients appear more than once"
      : "Your product summary is ready",
    text: overlap.length
      ? `${overlap.map((t) => t.nutrient).join(", ")} ${overlap.length === 1 ? "appears" : "appear"} in multiple products.`
      : "Your confirmed quantities are available.",
    action: "View my totals",
    kind: "totals",
  };
}
