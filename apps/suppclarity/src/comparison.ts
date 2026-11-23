import { ingredientsOf, normalized, type Product } from "./domain.ts";
import { nutrientCatalog } from "./catalog.mjs";
export function compareLabels(left: Product, right: Product) {
  const a = ingredientsOf(left),
    b = ingredientsOf(right);
  return [...new Set([...a, ...b].map((i) => i.nutrient))].map((name) => {
    const l = a.find((i) => i.nutrient === name),
      r = b.find((i) => i.nutrient === name);
    return {
      name,
      left: l ? normalized(l) : null,
      right: r ? normalized(r) : null,
      unit: nutrientCatalog[name].baseUnit,
    };
  });
}
export function amountText(value: number | null, unit: string) {
  return value === null
    ? "Not listed"
    : new Intl.NumberFormat("en-US", { maximumSignificantDigits: 4 }).format(
        value,
      ) +
        " " +
        unit;
}
