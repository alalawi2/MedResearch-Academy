import type { Nutrient } from "./domain.ts";
import type { SourceId } from "./evidence.ts";
// US NIH ODS tolerable upper intake levels, ages 18+. A ceiling is never a target or clearance.
export function upperReference(
  nutrient: Nutrient,
  age: number,
): { amount: number; unit: string; source: SourceId; scope: string } | null {
  if (!Number.isInteger(age) || age < 18) return null;
  switch (nutrient) {
    case "Vitamin D":
      return {
        amount: 100,
        unit: "mcg",
        source: "dNIH",
        scope: "food and supplements combined",
      };
    case "Magnesium":
      return {
        amount: 350,
        unit: "mg",
        source: "magnesiumNIH",
        scope:
          "supplemental magnesium; naturally occurring food magnesium is excluded",
      };
    case "Vitamin C":
      return {
        amount: age === 18 ? 1800 : 2000,
        unit: "mg",
        source: "vitaminCNIH",
        scope: "food and supplements combined",
      };
    case "Calcium":
      return {
        amount: age === 18 ? 3000 : age <= 50 ? 2500 : 2000,
        unit: "mg",
        source: "calciumNIH",
        scope: "food and supplements combined",
      };
    case "Iron":
      return {
        amount: 45,
        unit: "mg",
        source: "ironNIH",
        scope: "food and supplements combined",
      };
    case "Zinc":
      return {
        amount: age === 18 ? 34 : 40,
        unit: "mg",
        source: "zincNIH",
        scope: "food and supplements combined",
      };
    case "Vitamin B6":
      return {
        amount: age === 18 ? 80 : 100,
        unit: "mg",
        source: "b6NIH",
        scope:
          "food and supplements combined; the European adult reference is lower and adverse effects can occur below the US ceiling",
      };
    case "Iodine":
      return {
        amount: age === 18 ? 900 : 1100,
        unit: "mcg",
        source: "iodineNIH",
        scope: "food and supplements combined",
      };
    case "Selenium":
      return {
        amount: 400,
        unit: "mcg",
        source: "seleniumNIH",
        scope:
          "food and supplements combined; other authorities use lower references",
      };
    default:
      return null;
  }
}
