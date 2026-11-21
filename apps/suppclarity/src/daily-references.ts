import type { Nutrient } from "./domain.ts";
import type { SourceId } from "./evidence.ts";
export type ReferenceSex = "male" | "female" | "both";
type Range = { min: number; max?: number; male: number; female: number };
type Reference = {
  unit: string;
  source: SourceId;
  ranges: Range[];
  note?: string;
};
// US NIH ODS RDAs for total intake, not extra supplemental doses. Pregnancy/breastfeeding are outside this table.
const table: Partial<Record<Nutrient, Reference>> = {
  Magnesium: {
    unit: "mg",
    source: "magnesiumNIH",
    ranges: [
      { min: 18, max: 18, male: 410, female: 360 },
      { min: 19, max: 30, male: 400, female: 310 },
      { min: 31, male: 420, female: 320 },
    ],
  },
  "Vitamin B12": {
    unit: "mcg",
    source: "b12NIH",
    ranges: [{ min: 18, male: 2.4, female: 2.4 }],
  },
  "Vitamin D": {
    unit: "mcg",
    source: "dNIH",
    ranges: [
      { min: 18, max: 70, male: 15, female: 15 },
      { min: 71, male: 20, female: 20 },
    ],
  },
  "Vitamin B6": {
    unit: "mg",
    source: "b6NIH",
    ranges: [
      { min: 18, max: 18, male: 1.3, female: 1.2 },
      { min: 19, max: 50, male: 1.3, female: 1.3 },
      { min: 51, male: 1.7, female: 1.5 },
    ],
  },
  Calcium: {
    unit: "mg",
    source: "calciumNIH",
    ranges: [
      { min: 18, max: 18, male: 1300, female: 1300 },
      { min: 19, max: 50, male: 1000, female: 1000 },
      { min: 51, max: 70, male: 1000, female: 1200 },
      { min: 71, male: 1200, female: 1200 },
    ],
  },
  Iron: {
    unit: "mg",
    source: "ironNIH",
    ranges: [
      { min: 18, max: 18, male: 11, female: 15 },
      { min: 19, max: 50, male: 8, female: 18 },
      { min: 51, male: 8, female: 8 },
    ],
  },
  Zinc: {
    unit: "mg",
    source: "zincNIH",
    ranges: [
      { min: 18, max: 18, male: 11, female: 9 },
      { min: 19, male: 11, female: 8 },
    ],
  },
  "Vitamin C": {
    unit: "mg",
    source: "vitaminCNIH",
    ranges: [
      { min: 18, max: 18, male: 75, female: 65 },
      { min: 19, male: 90, female: 75 },
    ],
    note: "People who smoke need an additional 35 mg/day.",
  },
  Iodine: {
    unit: "mcg",
    source: "iodineNIH",
    ranges: [{ min: 18, male: 150, female: 150 }],
  },
  Selenium: {
    unit: "mcg",
    source: "seleniumNIH",
    ranges: [{ min: 18, male: 55, female: 55 }],
  },
};
export function dailyReference(
  nutrient: Nutrient,
  age?: number,
  sex: ReferenceSex = "both",
) {
  if (typeof age === "number" && Number.isFinite(age) && age > 0 && age < 18)
    return null;
  const reference = table[nutrient];
  if (!reference) return null;
  const known = Number.isInteger(age) && age! >= 18;
  const ranges = reference.ranges.filter(
    (r) => !known || (age! >= r.min && (!r.max || age! <= r.max)),
  );
  const targets: { amount: number; unit: string; label: string }[] = [];
  const lines = ranges.map((r) => {
    const group =
      r.max === r.min
        ? `Age ${r.min}`
        : r.max
          ? `Ages ${r.min}–${r.max}`
          : `Ages ${r.min}+`;
    const amount = (value: number) =>
      nutrient === "Vitamin D"
        ? `${value} mcg (${value * 40} IU)`
        : `${value} ${reference.unit}`;
    if (r.male === r.female) {
      targets.push({ amount: r.male, unit: reference.unit, label: group });
      return `${group}: ${amount(r.male)}/day.`;
    }
    if (sex === "male" || sex === "female") {
      targets.push({
        amount: r[sex],
        unit: reference.unit,
        label: `${group}, ${sex} reference`,
      });
      return `${group}: ${sex === "male" ? "Male" : "Female"} reference ${amount(r[sex])}/day.`;
    }
    targets.push(
      {
        amount: r.male,
        unit: reference.unit,
        label: `${group}, male reference`,
      },
      {
        amount: r.female,
        unit: reference.unit,
        label: `${group}, female reference`,
      },
    );
    return `${group}: Male ${r.male}; female ${r.female} ${reference.unit}/day.`;
  });
  return {
    lines: [...lines, ...(reference.note ? [reference.note] : [])],
    source: reference.source,
    targets,
  };
}
