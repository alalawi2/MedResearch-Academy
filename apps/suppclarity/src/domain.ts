export type Nutrient = "Vitamin D" | "Vitamin B12" | "Magnesium";
export type Product = {
  id: string;
  name: string;
  nutrient: Nutrient;
  amount: number;
  unit: string;
  unitsPerServing: number;
  unitsTaken: number;
  daysPerWeek: number;
};
export type Profile = {
  use: string;
  age: string;
  diet: string;
  context: string;
  screening: string;
  goal: string;
};
export const emptyProfile: Profile = {
  use: "",
  age: "",
  diet: "",
  context: "",
  screening: "",
  goal: "",
};
export const units: Record<Nutrient, string[]> = {
  "Vitamin D": ["mcg", "IU"],
  "Vitamin B12": ["mcg"],
  Magnesium: ["mg"],
};
export function validAge(age: string) {
  return /^\d{2,3}$/.test(age.trim()) && Number(age) >= 18;
}
export function validProduct(p: Product) {
  return (
    Boolean(p.name.trim()) &&
    p.name.trim().length <= 100 &&
    units[p.nutrient]?.includes(p.unit) &&
    [p.amount, p.unitsPerServing, p.unitsTaken, p.daysPerWeek].every(
      (n) => Number.isFinite(n) && n > 0,
    ) &&
    Number.isInteger(p.daysPerWeek) &&
    p.daysPerWeek <= 7
  );
}
export function totals(products: Product[]) {
  const groups = new Map<
    Nutrient,
    { nutrient: Nutrient; amount: number; unit: string; count: number }
  >();
  for (const p of products) {
    if (!validProduct(p))
      throw new Error("Confirm all product quantities before calculation.");
    const normalized =
      p.nutrient === "Vitamin D" && p.unit === "IU" ? p.amount / 40 : p.amount;
    const amount =
      (((normalized * p.unitsTaken) / p.unitsPerServing) * p.daysPerWeek) / 7;
    const current = groups.get(p.nutrient) || {
      nutrient: p.nutrient,
      amount: 0,
      unit: p.nutrient === "Magnesium" ? "mg" : "mcg",
      count: 0,
    };
    current.amount += amount;
    current.count++;
    groups.set(p.nutrient, current);
  }
  return [...groups.values()];
}
export function report(profile: Profile, products: Product[]) {
  const incomplete =
    Object.values(profile).some((v) => !v) || !validAge(profile.age);
  if (incomplete)
    return {
      title: "A little more information first",
      text: "Complete your profile before reviewing your next step.",
      action: "Complete my check",
      kind: "profile",
    };
  if (
    profile.screening !== "None of these" ||
    profile.context === "Pregnant or breastfeeding" ||
    profile.context === "Prefer not to say"
  )
    return {
      title: "Your personal check needs more context",
      text: "This preview cannot assess your medicines, health conditions or special circumstances. Your product totals are still available.",
      action: "See what was checked",
      kind: "limited",
    };
  if (profile.use === "No")
    return {
      title: "Start with understanding your diet",
      text: "Your answers are ready. This preview does not establish a deficiency or a need to start a supplement.",
      action: "Explore the evidence",
      kind: "beginner",
    };
  if (!products.length)
    return {
      title: "Let’s look at what you take",
      text: "Add the quantities from a label to see your intake and ingredient overlap.",
      action: "Add my first product",
      kind: "products",
    };
  const overlap = totals(products).filter((t) => t.count > 1);
  return overlap.length
    ? {
        title: "Some ingredients appear more than once",
        text: `${overlap.map((t) => t.nutrient).join(", ")} ${overlap.length === 1 ? "appears" : "appear"} in multiple entries. Compare your confirmed totals before adding another product.`,
        action: "View my totals",
        kind: "totals",
      }
    : {
        title: "Your product summary is ready",
        text: "See the amounts you entered. These totals do not establish whether a product or dose is appropriate for you.",
        action: "View my totals",
        kind: "totals",
      };
}
