import type { Nutrient } from "./domain.ts";
import type { SourceId } from "./evidence.ts";
export type ReferenceSex = "male" | "female" | "both";
// US NIH ODS RDA: food + supplements combined, never an extra dose or measured gap.
export function dailyReference(
  nutrient: Nutrient,
  age?: number,
  sex: ReferenceSex = "both",
): { lines: string[]; source: SourceId } | null {
  const a = Number.isInteger(age) && age! >= 18 ? age! : 0;
  const pair = (male: number, female: number, unit: string, group: string) =>
    `${group}${group ? ": " : ""}${sex === "male" ? `Male reference ${male}` : sex === "female" ? `Female reference ${female}` : `Male ${male}; female ${female}`} ${unit}/day.`;
  const value = (amount: number, unit: string, group: string) =>
    `${group}: ${amount} ${unit}/day.`;
  switch (nutrient) {
    case "Magnesium":
      return {
        lines:
          a === 18
            ? [pair(410, 360, "mg", "Age 18")]
            : a >= 31
              ? [pair(420, 320, "mg", "Ages 31+")]
              : a >= 19
                ? [pair(400, 310, "mg", "Ages 19–30")]
                : [
                    pair(400, 310, "mg", "Ages 19–30"),
                    pair(420, 320, "mg", "Ages 31+"),
                    pair(410, 360, "mg", "Age 18"),
                  ],
        source: "magnesiumNIH",
      };
    case "Vitamin B12":
      return { lines: [value(2.4, "mcg", "Ages 18+")], source: "b12NIH" };
    case "Vitamin D":
      return {
        lines:
          a >= 71
            ? ["Ages 71+: 20 mcg (800 IU)/day."]
            : a >= 18
              ? ["Ages 18–70: 15 mcg (600 IU)/day."]
              : [
                  "Ages 18–70: 15 mcg (600 IU)/day.",
                  "Ages 71+: 20 mcg (800 IU)/day.",
                ],
        source: "dNIH",
      };
    case "Vitamin B6":
      return {
        lines:
          a === 18
            ? [pair(1.3, 1.2, "mg", "Age 18")]
            : a >= 51
              ? [pair(1.7, 1.5, "mg", "Ages 51+")]
              : a >= 19
                ? [value(1.3, "mg", "Ages 19–50")]
                : [
                    value(1.3, "mg", "Ages 19–50"),
                    pair(1.7, 1.5, "mg", "Ages 51+"),
                    pair(1.3, 1.2, "mg", "Age 18"),
                  ],
        source: "b6NIH",
      };
    case "Calcium":
      return {
        lines:
          a === 18
            ? [value(1300, "mg", "Age 18")]
            : a >= 71
              ? [value(1200, "mg", "Ages 71+")]
              : a >= 51
                ? [pair(1000, 1200, "mg", "Ages 51–70")]
                : a >= 19
                  ? [value(1000, "mg", "Ages 19–50")]
                  : [
                      value(1000, "mg", "Ages 19–50"),
                      pair(1000, 1200, "mg", "Ages 51–70"),
                      value(1200, "mg", "Ages 71+"),
                      value(1300, "mg", "Age 18"),
                    ],
        source: "calciumNIH",
      };
    case "Iron":
      return {
        lines:
          a === 18
            ? [pair(11, 15, "mg", "Age 18")]
            : a >= 51
              ? [value(8, "mg", "Ages 51+")]
              : a >= 19
                ? [pair(8, 18, "mg", "Ages 19–50")]
                : [
                    pair(8, 18, "mg", "Ages 19–50"),
                    value(8, "mg", "Ages 51+"),
                    pair(11, 15, "mg", "Age 18"),
                  ],
        source: "ironNIH",
      };
    case "Zinc":
      return {
        lines:
          a === 18
            ? [pair(11, 9, "mg", "Age 18")]
            : [
                pair(11, 8, "mg", "Ages 19+"),
                ...(!a ? [pair(11, 9, "mg", "Age 18")] : []),
              ],
        source: "zincNIH",
      };
    case "Vitamin C":
      return {
        lines:
          a === 18
            ? [pair(75, 65, "mg", "Age 18")]
            : [
                pair(90, 75, "mg", "Ages 19+"),
                ...(!a ? [pair(75, 65, "mg", "Age 18")] : []),
                "People who smoke need an additional 35 mg/day.",
              ],
        source: "vitaminCNIH",
      };
    case "Iodine":
      return { lines: [value(150, "mcg", "Ages 18+")], source: "iodineNIH" };
    case "Selenium":
      return { lines: [value(55, "mcg", "Ages 18+")], source: "seleniumNIH" };
    default:
      return null;
  }
}
