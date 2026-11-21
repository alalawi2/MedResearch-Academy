import {
  validProduct,
  units,
  type Nutrient,
  type Product,
  type Ingredient,
} from "./domain.ts";
export type ReadRow = {
  id: string;
  name: string;
  nutrient: Nutrient | null;
  amount: number | null;
  unit: string;
  reading: "clear" | "uncertain" | "unreadable";
  labelText: string;
  supported: boolean;
};
export type ReadLabel = {
  hasSupplementFacts: boolean;
  panelComplete: boolean;
  sourcePanelComplete?: boolean;
  database?: Product["database"];
  otherIngredients?: string[];
  productName: string | null;
  servingText: string | null;
  servingUnits: number | null;
  servingUnit: string | null;
  ingredients: ReadRow[];
  concerns: string[];
};
export type DraftRow = {
  id: string;
  name: string;
  nutrient: Nutrient;
  amount: string;
  unit: string;
  included: boolean;
  reading: ReadRow["reading"];
  labelText: string;
};
export function draftRows(label: ReadLabel): DraftRow[] {
  return label.ingredients
    .filter((r): r is ReadRow & { nutrient: Nutrient } =>
      Boolean(r.nutrient && Object.hasOwn(units, r.nutrient)),
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      nutrient: r.nutrient,
      amount:
        r.reading === "clear" && r.amount !== null && r.amount >= 0
          ? String(r.amount)
          : "",
      unit: units[r.nutrient].includes(r.unit) ? r.unit : "",
      included: true,
      reading: r.reading,
      labelText: r.labelText,
    }));
}
export function confirmedProduct({
  name,
  serving,
  servingUnit,
  taken,
  days,
  taking,
  rows,
  label,
  manualOther = false,
}: {
  name: string;
  serving: string;
  servingUnit: string;
  taken: string;
  days: string;
  taking: boolean;
  rows: DraftRow[];
  label?: ReadLabel;
  manualOther?: boolean;
}): Product | null {
  const selected = rows.filter((r) => r.included);
  if (selected.some((r) => !r.amount.trim() || !r.unit)) return null;
  const ingredients: Ingredient[] = selected.map((r) => ({
    nutrient: r.nutrient,
    amount: Number(r.amount),
    unit: r.unit,
  }));
  const unassessed = label
    ? label.ingredients
        .filter((r) => !r.nutrient || !selected.some((d) => d.id === r.id))
        .map((r) => r.name)
    : manualOther
      ? ["Other label ingredients not entered"]
      : [];
  if (label?.otherIngredients) unassessed.push(...label.otherIngredients);
  const p: Product = {
    id: "",
    name: name.trim(),
    unitsPerServing: Number(serving),
    servingUnit: servingUnit.trim() || "unit",
    unitsTaken: taking ? Number(taken) : 0,
    daysPerWeek: taking ? Number(days) : 0,
    taking,
    ingredients,
    unassessedIngredients: unassessed,
    incompleteLabel: label
      ? !(label.sourcePanelComplete ?? label.panelComplete) ||
        label.ingredients.some(
          (r) => r.nutrient && !selected.some((d) => d.nutrient === r.nutrient),
        )
      : manualOther,
    source: label?.database ? "database" : label ? "scan" : "manual",
    ...(label?.database ? { database: label.database } : {}),
  };
  return validProduct(p) ? p : null;
}
