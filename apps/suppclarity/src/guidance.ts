import {
  ingredientsOf,
  nutrientCatalog,
  overlappingIngredients,
  profileComplete,
  totals,
  validProduct,
  type Profile,
  type Product,
} from "./domain.ts";
import {
  EVIDENCE_REVIEW_DUE,
  EVIDENCE_VERSION,
  type SourceId,
  type Topic,
} from "./evidence.ts";
import { localGuides } from "./education-data.mjs";
import { upperReference } from "./upper-references.ts";
export type Consideration = {
  id: string;
  title: string;
  text: string;
  action: string;
  why: string;
  limits: string;
  sourceIds: SourceId[];
  topic?: Topic;
  route: "/product" | "/products" | "/evidence" | "/check";
  priority: number;
  essential?: boolean;
};
export type Guidance = {
  version: string;
  status: "incomplete" | "limited" | "educational" | "stale";
  primary: Consideration;
  additional: Consideration[];
  coverage: string;
};
export function guidance(
  profile: Profile,
  products: Product[],
  today = new Date().toISOString().slice(0, 10),
): Guidance {
  const entries: Consideration[] = [];
  const base = {
    version: EVIDENCE_VERSION,
    coverage:
      "Recorded labels and general nutrition evidence. Food quantities, absorption, medicine interactions and individual doses are not assessed.",
  };
  const finish = (status: Guidance["status"]): Guidance => {
    entries.sort((a, b) => a.priority - b.priority);
    return {
      ...base,
      status,
      primary: entries[0],
      additional: entries.slice(1),
    };
  };
  if (!profileComplete(profile)) {
    entries.push({
      id: "profile",
      priority: 0,
      title: "Start with your personal check",
      text: "A few answers help us choose relevant guidance.",
      action: "Complete my check",
      why: "Age, diet and health circumstances affect which evidence applies.",
      limits:
        "No personal conclusion can be made before the check is complete.",
      sourceIds: [],
      route: "/check",
    });
    return finish("incomplete");
  }
  if (products.some((p) => !validProduct(p))) {
    entries.push({
      id: "invalid-entry",
      priority: 0,
      title: "Check a product entry first",
      text: "Some quantities are missing or invalid.",
      action: "Review my products",
      why: "Ingredient calculations require confirmed amounts and serving sizes.",
      limits: "Unconfirmed quantities cannot be assessed.",
      sourceIds: [],
      route: "/products",
      essential: true,
    });
    return finish("limited");
  }
  const ts = totals(products);
  for (const t of ts) {
    const reference = upperReference(t.nutrient, Number(profile.age));
    const upper = reference?.amount ?? null;
    if (
      reference &&
      upper !== null &&
      t.unit === reference.unit &&
      t.onUseDay > upper
    ) {
      entries.push({
        id: `reference-${t.nutrient}`,
        priority: 0,
        essential: true,
        title: `Review your recorded ${t.nutrient.toLowerCase()} amount`,
        text:
          t.count > 1
            ? "If taken on the same day, these entries would exceed the general adult upper reference."
            : "Your recorded amount on a day you take it exceeds the general adult upper reference.",
        action: "Check my quantities",
        why: `The recorded on-use-day amount is ${Number(t.onUseDay.toFixed(2))} ${t.unit}; the US age-specific upper reference is ${upper} ${t.unit}, for ${reference.scope}. Weekly averages can hide larger single-day amounts.`,
        limits:
          "This is a reference comparison, not an individual safe dose. Actual days may differ. Clinician-directed treatment can differ; do not change prescribed treatment without the prescriber.",
        sourceIds: [reference.source],
        route: "/products",
      });
    }
  }
  const limited =
    profile.screening !== "None of these" ||
    profile.context !== "No special circumstances";
  if (limited) {
    entries.push({
      id: "individual-review",
      priority: 1,
      essential: true,
      title: "An individual review is your next step",
      text: "Your health circumstances fall outside this guidance module. Your label quantities are still available.",
      action: "See what to ask",
      why: "Medicines, diagnosed conditions, a known deficiency, clinician-directed supplements, pregnancy and breastfeeding can change suitability and dosing.",
      limits:
        "No medicine or condition interaction screening is provided. Take the product labels and current instructions to your clinician or pharmacist; do not change prescribed treatment here.",
      sourceIds: ["dNIH", "b12NIH", "magnesiumNIH"],
      route: "/evidence",
    });
    return finish("limited");
  }
  if (today > EVIDENCE_REVIEW_DUE) {
    entries.push({
      id: "stale-evidence",
      priority: 1,
      essential: true,
      title: "The guidance needs an evidence update",
      text: "This evidence version has passed its review date. Confirmed label totals remain available.",
      action: "Read the source references",
      why: "A dated evidence snapshot must be reviewed before being used for current guidance.",
      limits:
        "Personalized nutritional suggestions are paused for this version.",
      sourceIds: ["dGuideline", "b12NIH", "magnesiumNIH"],
      route: "/evidence",
    });
    return finish("stale");
  }
  const current = products.filter((p) => p.taking !== false);
  const has = (n: string) =>
    current.some((p) =>
      ingredientsOf(p).some((i) => i.nutrient === n && i.amount > 0),
    );
  if (profile.use !== "No" && !current.length) {
    entries.push({
      id: "inventory",
      priority: 2,
      title: "Record what you already take",
      text: "Add your current products before considering another supplement.",
      action: "Read my first label",
      why: "An existing product may already contain an ingredient you are considering.",
      limits:
        "A new-product recommendation cannot account for an unrecorded routine.",
      sourceIds: [],
      route: "/product",
    });
  }
  if (current.some((p) => p.incompleteLabel)) {
    entries.push({
      id: "partial-label",
      priority: 2,
      title: "Finish checking an incomplete label",
      text: "Some ingredients or quantities may be missing. Confirm the label before considering another product.",
      action: "Review my products",
      why: "Missing label rows can hide ingredients you already take.",
      limits:
        "The known amounts remain visible, but the label is not completely accounted for.",
      sourceIds: [],
      route: "/products",
    });
  }
  const overlaps = overlappingIngredients(products);
  if (overlaps.length) {
    entries.push({
      id: "overlap",
      priority: 3,
      title: "Check overlapping ingredients first",
      text: `${overlaps.map((t) => t.nutrient).join(", ")} ${overlaps.length === 1 ? "appears" : "appear"} in more than one current product.`,
      action: "Compare my entries",
      why: "Adding products can duplicate ingredients even when the names on the bottles differ.",
      limits:
        "Overlap alone does not prove harm. Do not stop a clinician-directed product based on overlap alone.",
      sourceIds: ["dNIH", "magnesiumNIH"],
      route: "/products",
    });
  }
  const relevant = [
    ...new Set(current.flatMap((p) => ingredientsOf(p).map((i) => i.nutrient))),
  ];
  for (const nutrient of relevant) {
    const item = nutrientCatalog[nutrient];
    if (["Vitamin D", "Vitamin B12", "Magnesium"].includes(nutrient)) continue;
    entries.push({
      id: `learn-${nutrient}`,
      priority: 6,
      title: `Understand your ${nutrient.toLowerCase()} entry`,
      text: "Your label is recorded. Learn what this ingredient can and cannot tell you before adding more.",
      action: "Read the short guide",
      why: "Recording an amount does not establish that you need it or that it suits your health circumstances.",
      limits:
        "Formulation, other ingredients and your full intake can change the interpretation.",
      sourceIds: localGuides[item.guide as keyof typeof localGuides]
        .sourceIds as SourceId[],
      topic: item.guide as Topic,
      route: "/evidence",
    });
  }
  if (
    profile.goal === "Exercise and recovery" ||
    profile.goal === "Digestion and gut health"
  ) {
    const exercise = profile.goal === "Exercise and recovery";
    entries.push({
      id: "goal-guide",
      priority: 5,
      title: exercise
        ? "Start with food, training and recovery"
        : "Start with your food pattern",
      text: exercise
        ? "An exercise goal alone does not establish a supplement need. Protein and creatine have different uses and evidence."
        : "Fiber and probiotics have different purposes. A gut-health goal does not identify a strain or dose.",
      action: "Read my quick guide",
      why: "A goal is a starting point for education, not a diagnosis or a measured nutrient gap.",
      limits: "No individual product or dose is selected.",
      sourceIds: [exercise ? "sportsNIH" : "fiberNIDDK"],
      topic: exercise ? "protein" : "fiber",
      route: "/evidence",
    });
  }
  const plant = profile.diet === "Vegan" || profile.diet === "Vegetarian";
  const sourceKnown = profile.b12Source === "Regular fortified foods";
  const claimedB12 = profile.b12Source === "I take a B12-containing supplement";
  if (plant || Number(profile.age) >= 50) {
    entries.push({
      id: "b12-source",
      priority: claimedB12 && !has("Vitamin B12") ? 2 : plant ? 4 : 7,
      title: has("Vitamin B12")
        ? "Your B12 source is recorded"
        : claimedB12
          ? "Record the B12 supplement you mentioned"
          : sourceKnown
            ? "Confirm your fortified B12 source"
            : plant
              ? "Make a reliable B12 source a priority"
              : "Review your B12 sources",
      text:
        claimedB12 && !has("Vitamin B12")
          ? "Confirm its label and schedule before considering another B12 product."
          : has("Vitamin B12")
            ? "Review the amount and schedule you record before adding another B12 product."
            : sourceKnown
              ? "You report regular fortified foods. Check their B12 amounts and serving frequency."
              : "B12-fortified foods or a suitable supplement can provide a reliable source. Your answers do not establish a deficiency.",
      action: has("Vitamin B12")
        ? "Review my B12 entry"
        : claimedB12
          ? "Read my B12 label"
          : "Explore B12 sources",
      why: plant
        ? "Plant-based diets warrant attention to reliable B12 sources; fortified foods and supplements can reduce deficiency risk."
        : "B12 absorption from food can become less reliable with age. Review sources rather than infer a deficiency from age.",
      limits:
        "This check cannot determine absorbed B12, a numerical dietary gap or an individual supplement dose. A recorded product or food source does not prove adequacy.",
      sourceIds: plant ? ["b12Review", "b12NIH"] : ["b12NIH"],
      topic: plant ? "b12-vegan" : "b12-older",
      route: has("Vitamin B12")
        ? "/products"
        : claimedB12
          ? "/product"
          : "/evidence",
    });
  }
  const age = Number(profile.age);
  if (age >= 75) {
    entries.push({
      id: "d-75-plus",
      priority: 5,
      title: has("Vitamin D")
        ? "Review your existing vitamin D plan"
        : "Consider a vitamin D plan at your age",
      text: has("Vitamin D")
        ? "You already record vitamin D. Review it before adding a second product."
        : "The 2024 Endocrine Society guideline suggests vitamin D supplementation for adults aged 75 and above. Choose a plan that accounts for your current intake.",
      action: has("Vitamin D")
        ? "Review my vitamin D entry"
        : "Understand the vitamin D guidance",
      why: "This is an age-specific, conditional guideline recommendation. It does not mean everyone needs the same product or amount.",
      limits:
        "No individual dose, deficiency or need for blood testing is determined by this app. The guideline is not a guarantee of benefit.",
      sourceIds: ["dGuideline", "dNIH"],
      topic: "vitamin-d-older",
      route: has("Vitamin D") ? "/products" : "/evidence",
    });
  } else if (age >= 19) {
    entries.push({
      id: "d-adult",
      priority: 8,
      title: "Check vitamin D sources before adding more",
      text: "Being a healthy adult is not by itself a reason to add extra vitamin D above nutritional reference intake for disease prevention.",
      action: "Understand vitamin D intake",
      why: "The guideline advises against routine extra empiric vitamin D above dietary reference intake in generally healthy adults aged 19–74.",
      limits:
        "This does not mean vitamin D is unnecessary or that a supplement is never useful. Food quantities and total dietary intake have not been measured here.",
      sourceIds: ["dGuideline", "dNIH"],
      topic: "vitamin-d-adult",
      route: "/evidence",
    });
  } else {
    entries.push({
      id: "d-age18",
      priority: 8,
      title: "Use vitamin D guidance for your age",
      text: "At 18, the adult guideline for ages 19–74 should not be applied automatically.",
      action: "Read the age-specific guidance",
      why: "The 2024 guideline includes age 18 in a separate children-and-adolescents recommendation.",
      limits:
        "This app does not choose a vitamin D dose or diagnose a deficiency.",
      sourceIds: ["dGuideline", "dNIH"],
      route: "/evidence",
    });
  }
  entries.push({
    id: "magnesium-food",
    priority: profile.goal === "Sleep or general wellbeing" ? 5 : 9,
    title:
      profile.goal === "Sleep or general wellbeing"
        ? "A sleep goal alone does not establish a need for magnesium"
        : "Start with magnesium-rich foods",
    text:
      profile.goal === "Sleep or general wellbeing"
        ? "Supplement evidence for sleep is limited and inconsistent. A symptom or wellness goal cannot identify a personal dose."
        : "Consider foods such as beans, nuts and whole grains when reviewing magnesium sources.",
    action: "Explore magnesium evidence",
    why: "Food patterns are a useful starting point. Trials of magnesium for sleep are small and do not establish a routine recommendation for everyone.",
    limits:
      "No dietary magnesium gap, deficiency or supplement dose has been calculated. The sleep review focused on older adults and cannot be assumed to apply to all ages or formulations.",
    sourceIds: ["magnesiumReview", "magnesiumNIH"],
    topic: "magnesium-sleep",
    route: "/evidence",
  });
  return finish("educational");
}
