# Build validation — version 0.5

21 November 2026. This revision adds minimal-photo product identification, sourced online fallback, optional ingredient intake references, and improved general/follow-up copilot answers.

- 40 app and 34 backend cases pass locally, plus lint, TypeScript, Academy/Expo web builds and the source/export fingerprint. New cases cover front-only identity preservation, consulted-source URL validation, missing evidence excerpts, NIH/online failure distinctions, shared allowance failures, schema/request boundaries, copilot scope and curated source filtering, generic magnesium misspellings without a sleep assumption, RDA age/sex boundaries, and web provenance surviving confirmation.
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

Source-transcription follow-up: web search now identifies product pages without prefilled ingredient quantities. The server retrieves the selected public HTTPS page with DNS/IP checks, pinned resolution, validated redirects, size/time limits and no script execution. A separate transcription uses the actual page text; unsupported quotes/amounts remain unconfirmed. Tests cover fake source warnings, changed numbers despite a real quote, chemical-mass ambiguity, private-address rejection, and retrieval failure retaining identity without quantities. This addresses a live test in which a web-generated caffeine warning disagreed with the real manufacturer page.

22 November follow-up: optional amount-meaning cards show ingredient function, selected amount/basis and its general reference contribution. New checks cover 300 mg magnesium against male/female and unknown-age references, use-day serving scaling, daily-average labeling, vitamin D IU conversion, invalid quantities and caffeine's absence of a daily-requirement percentage. Pregnancy/known special health contexts suppress contribution comparisons. The preview context remains local, is cleared on session reset, and is not serialized into navigation URLs.

## Release 0.6 candidate

Local checks: 46 app tests and 34 API tests pass, including encrypted-storage failure/recovery cases. Lint, TypeScript, Academy/Expo export build and source fingerprint pass. The hosted automated native workflow requires a paid Expo plan; no subscription was purchased. A local Maestro suite covers offline lookup entry, broad ingredient questions, manual confirmation, persistence across relaunch, optional dose context and erasure. Executed results will be recorded separately. An initial simulator candidate installed/launched on iOS 26.5 and its home screenshot was inspected. This is not a physical-camera accuracy test. Apple production signing and Play submission credentials remain missing.

### Additional release checks

- 46 app and 38 backend tests (84 total), lint, TypeScript, combined builds and source-export verification pass after optional in-app answer reports.
- Feedback SQL migration applied only to the suppclarity_content_reports namespace. Transactional fixture writes tested acceptance and per-network limits, then rolled back. Separate checks confirm anonymous reads and direct authenticated writes are blocked, fixture rows are absent and the named daily expiry job is active.
- iOS manufacturer-name search and denied-camera recovery passed as native scenarios. The first full suite also found the numeric keyboard lacked a Done action; shared inputs now request the native Done toolbar. A test had tapped the uppercase page title instead of the Ask button; stable button identifiers correct the harness.
- A real manufacturer front image was selected through the iOS photo picker with explicit AI consent. Name recognition, automatic source lookup and magnesium 300 mg confirmation passed (Maestro JUnit, one test, no failures; build-review/gallery-qa/results.xml). It was a manufacturer stock image on a simulator, not the user's physical bottle or camera.
- App text distinguishes installed encrypted storage from browser session storage. Search/photo entry controls disappear after label selection. Release text describes supplement education rather than an unfinished beta or a clinically validated service.
- Final native suite results and final store binaries are still pending in this candidate document. Do not treat early partial passes as a complete release sign-off.
