# Evidence implementation record — 0.2

Snapshot: 21 November 2026. Version `2026-11-21.1`; review due 21 February 2027. Authoring used Consensus for discovery and checked selected primary sources. This record describes implementation decisions, not a pharmacist/dietitian approval or clinical validation.

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

Rules are auditable in `src/guidance.ts`, references in `src/evidence.ts`, and label normalization/confirmation in `src/labels.ts` plus `lib/suppclarity/label.mjs`. Test cases cover age boundaries, scope stops, upper-reference boundaries, weekly dilution, product overlap, prospective exclusion, incomplete labels, stale sources, uncertain values and duplicate units. These software checks do not estimate sensitivity/specificity on real-world labels or establish clinical validity. Revisions require source adjudication, a version/date update and corresponding behavior checks; newly retrieved papers are not sufficient on their own.
