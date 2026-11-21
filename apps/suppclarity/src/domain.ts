export type Nutrient = "Vitamin D" | "Vitamin B12" | "Magnesium";
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
  source?: "manual" | "scan";
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
export const units: Record<Nutrient, string[]> = {
  "Vitamin D": ["mcg", "IU"],
  "Vitamin B12": ["mcg"],
  Magnesium: ["mg"],
};
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
  return Boolean(
    i &&
    units[i.nutrient]?.includes(i.unit) &&
    Number.isFinite(i.amount) &&
    i.amount > 0 &&
    i.amount <= 1e9,
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
  return i.nutrient === "Vitamin D" && i.unit === "IU"
    ? i.amount / 40
    : i.amount;
}
export function totals(products: Product[]) {
  const groups = new Map<
    Nutrient,
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
      const onUseDay = (normalized(i) * p.unitsTaken) / p.unitsPerServing;
      const amount = (onUseDay * p.daysPerWeek) / 7;
      const current = groups.get(i.nutrient) || {
        nutrient: i.nutrient,
        amount: 0,
        onUseDay: 0,
        unit: i.nutrient === "Magnesium" ? "mg" : "mcg",
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
      groups.set(i.nutrient, current);
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
  const overlap = totals(products).filter((t) => t.count > 1);
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
