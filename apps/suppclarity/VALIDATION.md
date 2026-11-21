# Build validation — version 0.2

21 November 2026. These are software checks, not clinical validation, professional approval or a representative real-label accuracy evaluation.

## Automated and hosted checks

- 20 app tests and 13 backend tests pass. App lint, TypeScript, Expo doctor (20/20), source/export consistency and the Academy production build pass.
- Cases include age 18/19/74/75, B12 source/current-product handling, health-scope stops, expired sources, current/prospective separation, weekly dilution versus use-day upper references, unsupported/uncertain rows and paired-unit double counting.
- Backend tests cover image type/size, consent, allowed origins, quota failure, bounded image-only structured extraction, generic secret-safe errors, fixed research topics and safe paper URLs. Unsupported target units force manual checking instead of prefilling a number into another unit.
- GitHub checks and Vercel deployment passed for feature PR #7. The source fingerprint verifies that the checked-in web export matches app source. The web base path never enters the default native configuration.
- Additive request-counter migration applied to the existing Academy database. RLS enabled; anonymous scan RPC denied; service-role scan RPC allowed. No clinical records were accessed for this setup.

## Live integration and browser

- Production Consensus API returned five related B12 papers; the browser's on-request search displayed their titles, journals and dates. No profile or photo is sent to Consensus.
- Production OpenAI label reader transcribed a synthetic multivitamin: two-capsule serving, D 25 mcg (paired 1,000 IU), B12 50 mcg, elemental Mg 120 mg and zinc 11 mg. Zinc remained visible as unassessed. A non-label fixture returned no ingredients instead of guessed values.
- Missing-consent scan request returned 403; unsupported research topic returned 400.
- Browser photo selection, explicit consent, image manipulation, extraction, editable fields, confirmation and saving worked end to end. One capsule daily from the two-capsule label produced D 12.5 mcg/day, B12 25 mcg/day and Mg 60 mg/day.
- Fictional existing-user age 35, vegan diet and recorded B12 product prompted review of the existing entry before adding another. Reasons default collapsed. Optional sources and live research loaded.
- Fictional beginner age 78, vegan diet and no reliable B12 source prompted source guidance. Secondary vitamin D guidance correctly used the conditional 75+ recommendation. No dose or deficiency was inferred.
- Proof screenshots are saved in the parent project's `branding/guidance-v02.jpg` and `branding/label-confirmation-v02.jpg`. All QA profiles/products were fictional; the browser was reset to a fresh home screen afterward.

## Native builds

- iOS simulator: build `3c9b7a2b-5fa8-4b04-85f7-4ee36cf45921`, version 0.2.0, completed. Downloaded, installed and launched on iPhone 17 Pro / iOS 26.5. Label-entry screen and native photo picker opened. The automation could not select a photo inside the system picker, so end-to-end **native** photo reading is not claimed. The complete photo flow was verified in the browser against production.
- Android: build `83f997b7-5d31-4af4-ba7c-b4df97ce7b16`, version 0.2.0 / versionCode 2, completed. APK downloaded and installed on the local emulator. Activity launch returned `Status: ok`; the process remained running on the subsequent check. This is a launch smoke test, not a visual or camera-flow audit.
- iOS simulator artifacts cannot install on physical iPhones. No App Store or Google Play submission has been made.

Still outstanding before a clinical/commercial release: held-out real-label and evidence-rule validation; physical iPhone/Android photo/camera testing; VoiceOver/TalkBack and complete keyboard audits; intended-use/regulatory assessment; and persistent-data rights design if accounts are added. Current guidance covers three nutrients, not complete intake, interactions or whole-product suitability.
