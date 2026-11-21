# Evidence implementation record — 0.3

Snapshot: 21 November 2026. Version `2026-11-21.2`; review due 21 February 2027. Authoring used Consensus for discovery and checked selected primary sources. This record describes implementation decisions, not a pharmacist/dietitian approval or clinical validation.

Consensus discovery review: https://consensus.app/search/for-implementation-of-suppclarity-a-us-english-adu/yA5bg4ppSE2S-rnhn_Kx_A/
The full generated research report is preserved separately in the project workspace under `evidence/`; its citation markers were not altered. It is not copied into the rule engine. Live API paper matches provide optional additional reading; they do not authorize new rules.

| Rule | Trigger / behavior | Source and interpretation |
|---|---|---|
| B12 source review | Vegan/vegetarian diets or age 50+: review fortified foods/current B12 products. Claimed supplement without a recorded label prompts label entry. No inferred deficiency, adequacy or dose. | NIH ODS B12 health professional fact sheet; 2024 vegan scoping review, DOI 10.3390/nu16101442. Older-adult source issue uses NIH, not extrapolation from vegan review. |
| Vitamin D 19–74 | Generally healthy adults: no routine **extra empiric amount above dietary reference intake for disease prevention** solely because of adult age. | 2024 Endocrine Society guideline, DOI 10.1210/clinem/dgae290. The generated research report's broad “no routine supplementation” summary was too strong. Implementation preserves the distinction between meeting nutritional reference intake and extra disease-prevention supplementation. |
| Vitamin D 75+ | Conditional guideline suggestion warrants consideration/review of a plan; existing D entry is reviewed before another product. | Same guideline. Age is not a diagnosis or sufficient basis for an individual dose. No mortality guarantee. |
| Age 18 | Separate age-specific guidance, not the 19–74 recommendation. | Same guideline includes 18 in its children/adolescent population. No automated dose. |
| Magnesium | Food-source starting point; a sleep goal does not establish a need or dose. | NIH ODS magnesium; insomnia SR DOI 10.1186/s12906-021-03297-z. Small older-adult trials, low/very low certainty; no generalization across all ages/products. |
| Quantity references | Compare recorded use-day D >100 mcg or supplemental Mg >350 mg; multiple products are explicitly a possible co-use sum. Weekly average never suppresses this flag. | NIH ODS D and Mg health professional fact sheets. 1 mcg D =40 IU. D upper limit includes food, which the app cannot measure; supplemental Mg reference excludes food. At/below a reference is never labeled safe or adequate. No B12 upper reference invented. |
| Scope stop | Medicines, health conditions, uncertainty, clinician-directed supplements/known deficiency, pregnancy/breastfeeding/trying to conceive or withheld context prevent nutritional suggestions. | NIH source cautions plus conservative product scope. Known quantity flags remain visible. No medication changes advised. |
| Incomplete inventory/evidence | Current products not recorded or incomplete labels take priority; expired snapshot pauses suggestions. | Product safeguards, not evidence of deficiency. |

Primary references:

- https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-prevention-of-disease
- https://www.mdpi.com/2072-6643/16/10/1442
- https://link.springer.com/article/10.1186/s12906-021-03297-z
- https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/
- https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/
- https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/

Rules are auditable in `src/guidance.ts`, references in `src/evidence.ts`, and label normalization/confirmation in `src/labels.ts` plus `lib/suppclarity/label.mjs`. Test cases cover age boundaries, scope stops, upper-reference boundaries, weekly dilution, product overlap, prospective exclusion, incomplete labels, stale sources, uncertain values, unsupported-unit handling and duplicate units. These software checks do not estimate sensitivity/specificity on real-world labels or establish clinical validity. Revisions require source adjudication, a version/date update and corresponding behavior checks; newly retrieved papers are not sufficient on their own.


## Broader common-supplement coverage

Discovery: https://consensus.app/search/research-brief-for-implementing-suppclarity-a-us-e/i7krcM5iRZqEaUXG8mtQsw/

CDC NHANES usage and NIH multivitamin material informed category selection; popularity is not proof of benefit and this is not a ranked top-54 list. The generated Consensus brief mixed European and US upper references and had limited coverage of broad benefit claims, so it was not adopted as a decision engine. Independently authored guides use the primary NIH ODS/NCCIH/FDA/NIDDK references listed in `src/education-data.mjs`. Collagen reviews differ; the guide describes mixed evidence rather than a guaranteed effect. The 100 questions are prepared common scenarios, not a claim of measured search-frequency ranking.

The additional US reference comparisons in `src/upper-references.ts` are: C 1,800 mg at 18 / 2,000 at 19+; calcium 3,000 mg at 18 / 2,500 at 19–50 / 2,000 at 51+; iron 45 mg; zinc 34 mg at 18 / 40 at 19+; B6 80 mg at 18 / 100 at 19+; iodine 900 mcg at 18 / 1,100 at 19+; selenium 400 mcg. These are food-plus-supplement limits and food quantities are not measured. The pre-existing D 100 mcg and supplemental Mg 350 mg rules remain. B6 and selenium guidance explicitly notes other authorities use lower references. No under-limit safety badge or recommended dose is generated.

Simple mass units and D IU are normalized; generic vitamin A/E IU, mcg RAE, folate DFE, separately declared folic acid and niacin NE are not silently converted into one another. A/E/folate/niacin are not given automatic upper-reference comparisons. Fish oil is not EPA/DHA; magnesium salts are not elemental magnesium. Extracts, probiotic counts, creatine forms and collagen are kept as product records without adding interchangeable potency. Ingredient families can still indicate possible overlap across current products.

NIH label records can be stale or incorrect. An actual retrieved Centrum record declared vitamin C as 60 mcg with 67% DV; this implementation blanks the conflicting quantity, preserves the printed evidence and asks for bottle verification. FDA Daily Values are used only to identify extreme inconsistencies, never to reconstruct a missing number. Multiple/ranged servings, mismatched serving units and conflicting paired quantities stay uncertain. Database findings and photo transcription always require user confirmation; neither constitutes suitability or contraindication screening.

The copilot retrieves authored answers locally. Ambiguity shows related questions; personal-dose requests receive a scope explanation; medication and urgent-ingestion questions use prepared limitations/action guidance. This is not a clinical triage system and does not claim comprehensive emergency detection. Unknown questions cannot generate unsupported advice. General guides remain available when personalized guidance is limited, but local reading and FAQ content are not automatically revoked by the personalized-guidance review-date gate; they display their dated snapshot and require editorial review.


## Version 0.4 discovery, references and copilot

The front-label name/brand can trigger automatic NIH + online manufacturer/retailer discovery. Only URLs present in the provider's actual web-search sources/citations survive; name/brand tokens reject obvious substitutions. Web quantities require an evidence excerpt and retain source metadata through confirmation. This is machine transcription, not independent source verification, and current formulas may differ from the bottle. International Each tablet contains panels are accepted. No compound-to-elemental conversion is inferred; an explicitly declared total caffeine is preferred once rather than summed again with its components.

`src/daily-references.ts` separately records NIH ODS total-intake RDAs for magnesium, D, B12, B6, calcium, iron, zinc, C, iodine and selenium. Age 18 and adult boundaries are distinct. Optional sex-reference selection is a display preference; no sex is inferred, gender identity is not requested, and scanning/search works without it. The figures apply to general non-pregnant/non-breastfeeding populations and are not supplemental prescriptions. Food is not measured, so no extra dose is calculated. Some physiological/clinical circumstances require different interpretation.

Broad copilot questions and common misspellings receive an ingredient overview, not an assumed sleep goal. Specific questions preserve the prepared library when appropriate; other questions and up to two prior exchanges use a stateless OpenAI response grounded in the existing authored guides. The app profile and product list are not included. Answers must resolve to existing source IDs, unsupported sources are dropped, and responses without supporting sources fall back. Deterministic dose/medicine/urgent scope checks precede paid calls, with an additional obvious dose-imperative check on model output. These controls are limited and do not establish clinical safety or comprehensive triage. The generative helper does not claim a fresh Consensus search; optional research stays separately requested.
