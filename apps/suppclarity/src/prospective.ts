import { ingredientsOf, nutrientCatalog, type Product } from "./domain.ts";
import { normalizeQuantity } from "./catalog.mjs";
import { upperReference } from "./upper-references.ts";
// Hypothetical label-serving comparisons never enter actual intake totals or choose a dose.
export function prospectiveNotes(
  candidate: Product,
  current: Product[],
  age: number,
) {
  if (candidate.taking !== false) return [];
  const notes: string[] = [];
  for (const ingredient of ingredientsOf(candidate)) {
    const reference = upperReference(ingredient.nutrient, age);
    const value = normalizeQuantity(
      ingredient.nutrient,
      ingredient.amount,
      ingredient.unit,
    );
    if (
      reference &&
      value &&
      value.unit === reference.unit &&
      value.amount > reference.amount
    )
      notes.push(
        `One printed serving contains ${value.amount} ${value.unit} of ${ingredient.nutrient}, above the US upper reference of ${reference.amount} ${reference.unit} for age ${age} (${reference.scope}). This is a label comparison, not a suggested serving or an assessment of your actual intake.`,
      );
  }
  const candidateFamilies = new Set(
    ingredientsOf(candidate)
      .filter((i) => i.amount > 0)
      .map((i) => nutrientCatalog[i.nutrient].family),
  );
  const currentFamilies = new Set(
    current
      .filter((p) => p.taking !== false)
      .flatMap((p) =>
        ingredientsOf(p)
          .filter((i) => i.amount > 0)
          .map((i) => nutrientCatalog[i.nutrient].family),
      ),
  );
  const shared = [...candidateFamilies].filter((family) =>
    currentFamilies.has(family),
  );
  if (shared.length)
    notes.push(
      `Also recorded in your current routine: ${shared.join(", ")}. Review the overlap before adding another product.`,
    );
  return notes;
}
