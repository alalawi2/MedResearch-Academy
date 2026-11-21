import { normalizeQuantity } from "./catalog.mjs";
import { dailyReference, type ReferenceSex } from "./daily-references.ts";
import type { Nutrient } from "./domain.ts";
export type IngredientContext = {
  nutrient: Nutrient;
  amount: number;
  unit: string;
  basis: "label-serving" | "use-day" | "daily-average";
};
export function ingredientContext(
  nutrient: Nutrient,
  amount: number,
  unit: string,
  basis: IngredientContext["basis"] = "label-serving",
  serving = 1,
  taken = 1,
): IngredientContext | undefined {
  const value = normalizeQuantity(nutrient, amount, unit);
  if (
    !value ||
    !Number.isFinite(serving) ||
    serving <= 0 ||
    !Number.isFinite(taken) ||
    taken <= 0
  )
    return;
  const scaled = (value.amount * taken) / serving;
  if (
    !Number.isFinite(scaled) ||
    scaled < 0 ||
    scaled > (value.unit === "CFU" ? 1e15 : 1e9)
  )
    return;
  return { nutrient, amount: scaled, unit: value.unit, basis };
}
export function doseMeaning(
  context: IngredientContext,
  age?: number,
  sex: ReferenceSex = "both",
  limited = false,
) {
  const basis =
    context.basis === "label-serving"
      ? "One label serving"
      : context.basis === "use-day"
        ? "Your recorded amount on a use day"
        : "Your recorded daily average";
  const quantity = `${Number(context.amount.toPrecision(4)).toLocaleString("en-US")} ${context.unit}`;
  if (context.nutrient === "Caffeine")
    return {
      headline: `${quantity} of caffeine`,
      basis,
      text: "This is a stimulant amount, not a daily nutrient requirement. Caffeine can increase alertness and may also cause jitters or disturb sleep. For context, the FDA lists about 71 mg in a typical 12 fl oz black tea; drinks vary. Coffee, tea and energy drinks also count toward your total.",
      percentages: [] as { label: string; percent: number }[],
    };
  const reference = limited ? null : dailyReference(context.nutrient, age, sex);
  const targets =
    reference?.targets.filter((t) => t.unit === context.unit) || [];
  const percentages = targets.map((t) => ({
    label: t.label,
    percent: Math.round((context.amount / t.amount) * 100),
  }));
  const values = percentages.map((p) => p.percent);
  const summary = !values.length
    ? "This records an amount; it does not establish how much extra you need."
    : Number.isInteger(age) && age! >= 18 && percentages.length <= 2
      ? percentages.length === 1
        ? `About ${percentages[0].percent}% of the general daily intake reference for this age group.`
        : `For this age group: about ${percentages.find((p) => p.label.includes(", male"))?.percent}% of the male daily reference, or ${percentages.find((p) => p.label.includes(", female"))?.percent}% of the female daily reference.`
      : `About ${Math.min(...values)}${Math.max(...values) !== Math.min(...values) ? `–${Math.max(...values)}` : ""}% of the general adult daily intake reference${Math.max(...values) !== Math.min(...values) ? `, depending on ${sex === "both" ? "age and sex" : "age"}` : ""}.`;
  return {
    headline: quantity,
    basis,
    text:
      summary +
      " Food and other intake also count. This does not confirm your full intake, absorption or need for extra pills.",
    percentages,
  };
}
