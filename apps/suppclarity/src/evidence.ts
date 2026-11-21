import { extraSources } from "./education-data.mjs";
import { researchTopics } from "./research-topics.mjs";
export const EVIDENCE_VERSION = "2026-11-21.2";
export const EVIDENCE_REVIEW_DATE = "2026-11-21";
export const EVIDENCE_REVIEW_DUE = "2027-02-21";
export const CONSENSUS_REVIEW_URL =
  "https://consensus.app/search/research-brief-for-implementing-suppclarity-a-us-e/i7krcM5iRZqEaUXG8mtQsw/";
export type Topic = keyof typeof researchTopics;
export const sources = {
  ...extraSources,
  dGuideline: {
    title: "Vitamin D for the Prevention of Disease",
    by: "Endocrine Society guideline · 2024",
    url: "https://doi.org/10.1210/clinem/dgae290",
    note: "Distinguishes nutritional reference intake from extra empiric supplementation for disease prevention. Age groups differ.",
  },
  b12Review: {
    title: "Vitamin B12 Supplementation in the Vegan Population",
    by: "Nutrients · Scoping review · 2024",
    url: "https://doi.org/10.3390/nu16101442",
    note: "Supports attention to reliable B12 sources in vegan diets. Does not establish an individual dose or deficiency.",
  },
  magnesiumReview: {
    title: "Oral magnesium for insomnia in older adults",
    by: "BMC Complementary Medicine and Therapies · Systematic review · 2021",
    url: "https://doi.org/10.1186/s12906-021-03297-z",
    note: "Small trials in older adults; evidence quality was low to very low. Findings should not be generalized to every adult or product.",
  },
  dNIH: {
    title: "Vitamin D fact sheet",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
    note: "Nutritional references and upper intake limits. An upper limit is not a recommended dose.",
  },
  b12NIH: {
    title: "Vitamin B12 fact sheet",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/",
    note: "Food and fortified sources, absorption and groups at risk. Recorded intake does not confirm absorption.",
  },
  magnesiumNIH: {
    title: "Magnesium fact sheet",
    by: "NIH Office of Dietary Supplements",
    url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
    note: "The adult upper reference for supplemental magnesium excludes magnesium naturally present in food.",
  },
};
export type SourceId = keyof typeof sources;
