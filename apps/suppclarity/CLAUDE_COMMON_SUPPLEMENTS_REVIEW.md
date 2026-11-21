# Common supplement review — version 0.3

21 November 2026. Actual Claude CLI critique with tools disabled, model `claude-opus-4-6[1m]`; response completed successfully. Input contained public source code, no credentials or personal profiles. The review covered an intermediate revision; subsequent fixes below were independently checked. This is not pharmacist/dietitian approval, a clinical validation study or a source-verification service.

## Adjudication

- B1: Kept the nine explicitly scoped reference comparisons. Adding a total-vitamin-A limit without identifying preformed retinol could apply the wrong limit to beta-carotene. E IU and folate DFE require form-specific handling; the catalog intentionally keeps them separate. Routine and entry screens now explicitly explain partial coverage and the absence of safety clearance. Further reference coverage needs its own source/form-specific implementation.
- B2: Changed displayed fiber/center spelling to US English; retained UK fiber aliases for label recognition. Corrected the NIDDK source title. Internal guide/topic IDs were updated consistently.
- B3: Manual multi-ingredient entry had already been implemented while this review was running. Users can add and remove rows instead of replacing the product with one nutrient.
- I1: Choline is now in Other nutrients, linked to the general starting guide. Compound-mass aliases were not blindly added as equivalent elemental choline.
- I2: Self-harm phrases receive a separate immediate-support scope response rather than a label-reaction FAQ. No unverified helpline number is embedded. This remains limited phrase routing, not clinical triage.
- I3: Extreme quantity/%DV conflict tolerance tightened from 50-fold to 10-fold, including equality. Tests cover both a real 1,000-fold unit conflict and a 10-fold error. The printed amount is blanked, never reconstructed from DV.
- I4: A blocked review button now explains missing or invalid fields, including positive serving/use quantities and whole-number use days 1–7.
- I5: Considering-only records remain excluded from intake. Before confirmation, a separate hypothetical check can flag one printed serving above an age-specific reference or ingredients also recorded in current use. No proposed personal dose is inferred. Boundary/exclusion/family tests pass.
- I6/I10: Entry notes explain form-specific units. Taking/Considering has a labeled radio group. Clear rows remain compact until edited.
- I7: Both questioned sources were independently verified against current primary-source records: CDC Data Brief 561, May 2026, and PubMed 43047141, July 2026. They are current for this project's November 2026 date. The cautious mixed-evidence collagen description remains.
- I8: Added common misspellings for vitamin, protein, creatine and zinc; kept conservative confidence thresholds and explicit related-question choices.
- I9: No food-tracking feature exists; quantities remain supplement-product records and the reference scope is displayed. A future food feature must distinguish food versus supplemental magnesium before reusing comparisons.

The reviewer reported no conversion arithmetic errors. Its closing claim of “27 local guides” is a counting error: the implemented data and tests contain 29 guides.

## Verbatim Claude response

```json
{
  "blockers": [
    {
      "id": "B1",
      "title": "Missing upper references for Vitamin A, Vitamin E, Niacin, and Folic acid",
      "severity": "high",
      "files": ["apps/suppclarity/src/upper-references.ts"],
      "detail": "The guidance flags on-use-day amounts exceeding US ULs, but only 9 of 13+ nutrients with established ULs are covered. Vitamin A (UL 3,000 mcg RAE age 19+; 2,800 for 18) is the most critical omission: preformed retinol is teratogenic at excess and commonly duplicated across multivitamins and standalone products. Vitamin E (1,000 mg / 800 mg at 18), niacin (35 mg / 30 mg at 18 from supplements+fortified foods), and synthetic folic acid (1,000 mcg / 800 mcg at 18) also have well-established ULs. Users seeing upper-reference flags for some nutrients but not others may infer that unchecked nutrients have no ceiling."
    },
    {
      "id": "B2",
      "title": "British spelling throughout a US English app",
      "severity": "medium",
      "files": [
        "apps/suppclarity/src/catalog.mjs",
        "apps/suppclarity/src/education-data.mjs"
      ],
      "detail": "The nutrient key 'Dietary fibre' (displayed to users), guide title 'Fibre and psyllium', source title 'Constipation: treatment and dietary fibre' (misrepresents the actual NIDDK page title), and FAQ q087 answer 'poison centre' all use British spelling. The target audience is US English adults 18+. Aliases include the US spelling for matching, but every display surface shows the British form. Also affects the guide key 'fibre' and source key 'fibreNIDDK'."
    },
    {
      "id": "B3",
      "title": "Manual entry limited to a single ingredient per product",
      "severity": "medium",
      "files": ["apps/suppclarity/src/app/product.tsx"],
      "detail": "In manual mode (no photo, no search result), selecting a nutrient calls setRows([blankRow(n)]), replacing the entire ingredient list with one row. Users who cannot use search (product not in DSLD) or photo (accessibility, blurry label, web without camera) cannot enter a multivitamin or any multi-ingredient product manually. This blocks the core scenario of recording an existing routine when both automated methods fail. The photo and search paths correctly produce multiple rows via draftRows()."
    }
  ],
  "improvements": [
    {
      "id": "I1",
      "title": "Choline misclassified as a mineral",
      "files": ["apps/suppclarity/src/catalog.mjs"],
      "detail": "Choline is listed with group 'Minerals' and guide 'minerals'. It is an essential nutrient recognized by NASEM but is not a mineral; it is structurally closer to B vitamins. The minerals guide text ('Iodine, selenium, copper and other minerals') is misleading when applied to choline. Move to its own group or a 'Other nutrients' group. Also missing common form aliases: choline bitartrate, CDP-choline, alpha-GPC."
    },
    {
      "id": "I2",
      "title": "Self-harm keywords route to a physical-emergency answer without crisis resources",
      "files": ["apps/suppclarity/src/knowledge.ts"],
      "detail": "The regex catches 'kill myself' and 'want to die' and routes to q088, which says 'Seek urgent medical help now using your local emergency service.' This answer was written for anaphylaxis/overdose, not suicidal ideation. It omits the 988 Suicide & Crisis Lifeline (call/text 988) and Crisis Text Line (text HOME to 741741). Either add a dedicated fixed reply with US crisis resources or extend the q088 answer to include them."
    },
    {
      "id": "I3",
      "title": "%DV consistency check uses a 50× tolerance",
      "files": ["lib/suppclarity/products.mjs"],
      "detail": "The databaseLabel function flags a quantity/DV mismatch only when the calculated %DV differs from the stated %DV by more than 50×. This catches mg↔mcg unit confusion (1,000×) but misses 10× data-entry or database errors. A 5× or 10× tolerance would catch more real errors while still allowing FDA rounding and target-group differences. Comment says 'consistency check only' but a 10× error left uncaught could reach the confirmed product."
    },
    {
      "id": "I4",
      "title": "No inline validation feedback on product-entry form fields",
      "files": ["apps/suppclarity/src/app/product.tsx"],
      "detail": "Units per serving, units taken, and days per week are free-text fields with no inline error messages. When values are invalid (e.g. 0, negative, non-integer days, >7 days), the 'Review my entry' button silently stays disabled via the confirmedProduct→validProduct chain. Users receive no explanation of what is wrong. Add per-field validation hints or a summary error above the button."
    },
    {
      "id": "I5",
      "title": "Considering-only products never compared against upper references",
      "files": ["apps/suppclarity/src/guidance.ts", "apps/suppclarity/src/domain.ts"],
      "detail": "Products with taking===false are excluded from totals() and therefore from upper-reference comparison. A user evaluating a product before purchase gets no feedback that its per-serving amount already exceeds the UL. A non-blocking informational notice ('If you took the labelled serving, this amount would exceed…') would add value without implying the user is currently at risk."
    },
    {
      "id": "I6",
      "title": "Vitamin E IU listed as a valid unit but no conversion or guidance at entry",
      "files": ["apps/suppclarity/src/catalog.mjs", "apps/suppclarity/src/app/product.tsx"],
      "detail": "Vitamin E accepts 'IU' and normalizeQuantity returns it unconverted (correct, since natural/synthetic conversions differ). However, the product entry screen gives no hint that IU values cannot be aggregated with mg values, unlike the FAQ (q014) and guide. A short inline note on the unit selector—similar to the existing magnesium elemental hint—would prevent silent non-aggregation surprises."
    },
    {
      "id": "I7",
      "title": "Collagen and CDC source URLs may be unverifiable or future-dated",
      "files": ["apps/suppclarity/src/education-data.mjs"],
      "detail": "collagenRecent cites PMID 43047141 (2026) and usageCDC cites a CDC data brief 'Published 2026'. If either URL is not yet live or was fabricated during content authoring, users following the link see a 404. Add a build-time or startup link-check, or mark these as 'pending verification' until confirmed reachable."
    },
    {
      "id": "I8",
      "title": "Copilot search misses plausible queries due to aggressive stop-word removal and limited corrections",
      "files": ["apps/suppclarity/src/knowledge.ts"],
      "detail": "The stop-word set removes 'with', so 'interact with medicine' loses a keyword. The corrections map lacks common misspellings like 'vitamine', 'protien', 'creatiene', 'zink'. Queries like 'vitamin D IU conversion' score ~0.31 against q014 (threshold 0.75) and return a vague choice list. For a 100-item bank this is acceptable but noticeable for high-intent questions. Consider synonym expansion or lowering the confident-match threshold."
    },
    {
      "id": "I9",
      "title": "Upper reference for Magnesium scope mismatch with totals",
      "files": [
        "apps/suppclarity/src/upper-references.ts",
        "apps/suppclarity/src/guidance.ts"
      ],
      "detail": "The Magnesium UL of 350 mg applies only to supplemental (non-food) magnesium, and the scope string says so. The totals() sum is from supplement labels only, so the comparison is directionally correct. But if a future feature adds food tracking, the same comparison would over-count. The 'why' text in the consideration correctly explains the scope, but it would be safer to tag the reference as supplemental-only in the data structure so the comparison logic can enforce it."
    },
    {
      "id": "I10",
      "title": "No accessibility label on the Taking/Considering radio group",
      "files": ["apps/suppclarity/src/app/product.tsx"],
      "detail": "The Taking/Considering radio buttons have accessibilityRole='radio' and individual checked state, but there is no accessibilityRole='radiogroup' on the containing View with an accessible group label. Screen reader users hear individual radio items without context for what the group controls. Wrap in a View with accessibilityRole='radiogroup' and accessibilityLabel='Product status'."
    }
  ]
}
```

**Summary of unit math**: All conversion factors checked (D IU÷40, mass ratios, CFU multipliers, age-specific ULs for 9 nutrients). No arithmetic errors found. The intentional non-conversion of Vitamin A and E IU (form-dependent) is correctly documented in FAQ q014.

**Summary of evidence claims**: All 27 local guides and 100 FAQ answers reviewed. Content is consistently cautious—no instance of recommending a dose, diagnosing a deficiency, or overstating trial evidence. The 2024 Endocrine Society vitamin D guideline age splits (18 / 19–74 / 75+) are accurately reflected.
