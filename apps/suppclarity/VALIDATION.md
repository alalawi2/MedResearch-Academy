# Build validation — version 0.4

21 November 2026. This revision adds minimal-photo product identification, sourced online fallback, optional ingredient intake references, and improved general/follow-up copilot answers.

- 35 app and 29 backend cases pass locally, plus lint, TypeScript, Academy/Expo web builds and the source/export fingerprint. New cases cover front-only identity preservation, consulted-source URL validation, missing evidence excerpts, NIH/online failure distinctions, shared allowance failures, schema/request boundaries, copilot scope and curated source filtering, generic magnesium misspellings without a sleep assumption, RDA age/sex boundaries, and web provenance surviving confirmation.
- No additional native modules are added. The existing SDK 58 Expo Go camera and image modules support this source update.
- Hosted checks recognized the actual manufacturer front-pack image as Nature’s Own / Magnesium + Energy with no invented ingredient amounts. Online search found its official Australian manufacturer page. Broad magnesium and contextual follow-up answers returned grounded source IDs. Final checks after the URL/caffeine fix are recorded separately. A real manufacturer's front image can test recognition but does not replace the user's physical iPhone camera/real bottle comparison. A comprehensive visual/accessibility audit is not claimed.
- Evidence references remain general education. No personal extra dose, complete interaction screen, clinical approval or measured label accuracy is claimed.

## Previous version 0.3 baseline (historical)


21 November 2026. Software checks only; no clinical approval, measured real-label accuracy or whole-product safety clearance is claimed.

## Current scope and checks

- 31 app tests and 20 backend tests pass. App lint and TypeScript pass. A full Academy and Expo web build succeeds, and the source/export fingerprint matches.
- New cases cover all 100 distinct FAQs and their sources/guides, all catalog-guide mappings, unknown/ambiguous questions, personal-dose and medication scope, urgent prepared-answer routing, B12 mg-to-mcg and CFU conversions, separate form-specific units, nonaggregated extracts/probiotics, family overlap, age-18 and calcium age-51 boundaries, and the native JSX bare-text regression.
- NIH lookup cases cover barcode formatting, exact query token matching (a vitamin D query must not match a D inside “Made”), newest-record deduplication, bounded inputs, origin protection, provider failures, ranged/multiple/mismatched servings, paired-unit consistency, nested folic acid and quantity/%DV conflicts. No conflicting quantity is silently corrected.
- Direct live NIH searches returned candidates for Nature Made vitamin D, Centrum Adults, a 12-digit UPC, creatine monohydrate and probiotics. Live label 179704 returned one-softgel serving and D 2,000 IU normalized to 50 mcg. These check API integration; they do not establish that a candidate matches the user’s bottle.
- The original D/B12 guidance, limited-health-context handling, current/prospective separation, incomplete inventory and stale personalized-guidance checks remain covered. No clinical need, deficiency or personal dose is inferred.

The current native iOS manifest and JavaScript bundle also returned HTTP 200 from the Expo Go preview, including the new lookup and FAQ screens. This verifies native compilation, not physical screen interaction.

## Earlier version 0.2 verification

The previous production release passed browser photo selection, consent, structured extraction, confirmation and saving using a synthetic multivitamin. Optional live Consensus research loaded. The earlier browser and simulator images belong to version 0.2 and are not screenshots of this revision.

Version 0.2 iOS simulator build `3c9b7a2b-5fa8-4b04-85f7-4ee36cf45921` installed and launched. The photo picker opened but automated photo selection did not complete. Android build `83f997b7-5d31-4af4-ba7c-b4df97ce7b16` installed and passed an activity/process launch smoke test. Neither verifies the new version’s physical camera flow. No App Store/Google Play submission has been made.

## Physical iPhone

A paired iPhone matched the registered Expo device. Standalone signing was not completed; the user requested an alternative to Apple terminal verification. The SDK 58 Expo Go LAN preview delivered an actual native iOS bundle and the user reported it opened. No phone-installable SuppClarity IPA is claimed.

The preview exposed a native-only explicit-space JSX error, now removed and covered by the static regression check. Full label images are preserved instead of forced square crops. Camera denial now provides an app-settings button and a manual/photo alternative. These changes still need a physical permission-denial/return test and a real bottle comparison by the user.

Outstanding: real-label accuracy evaluation, physical iPhone/Android photo and camera flows, visual and accessibility audits for these new screens, independent evidence-rule validation, and any clinical/commercial intended-use assessment. Profiles and product entries remain session-only; accounts, purchases and wearables are not implemented.

Independent Claude Opus 4.6 review completed on the public implementation before final follow-up edits. See `CLAUDE_COMMON_SUPPLEMENTS_REVIEW.md` for adjudicated findings and the verbatim response. It is a software/content critique, not clinical validation. Prospective-only label warnings and overlap checks are tested without changing intake totals.
