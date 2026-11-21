# Build validation

21 November 2026

- Expo doctor: 20/20 checks passed for the final font and identity configuration.
- App lint and TypeScript checks pass.
- Eight automated tests pass, including the web/native configuration separation regression test and seven domain cases: adult age handling including age 101; unit normalization and weekly arithmetic; invalid quantities; screening exclusions; incomplete profile/pregnancy; beginner routing; overlap notices.
- Academy TypeScript and Vite production build pass.
- Browser: home and revised identity render; beginner onboarding accepts a fictional age of 78; progress and scope questions work; manual product entry requires quantities and confirmation; entering 1,000 IU per two units and taking one daily yields 12.5 mcg/day; adding a second 25 mcg entry yields 37.5 mcg/day and an overlap notice; adding another product opens an empty form. No clinical suitability is inferred from these tests.
- Claude Opus 4.6 reviewed the design plan and implementation source. Verified response is recorded with each review; incorrect review suggestions were not adopted.

Outstanding before a clinical release: physical iPhone and Android testing, VoiceOver/TalkBack and keyboard review, a held-out clinical rules/labels evaluation, intended-use and regulatory assessment, secure persistence and data-rights work. The published browser preview deliberately contains no personal recommendation or interaction engine.

The first iOS simulator build exposed an asset-directory collision caused by applying the Academy web prefix to native assets. The dynamic app configuration now applies that prefix only when explicitly set for web; both configurations are checked automatically. Native builds are retried against the corrected configuration.

The corrected iOS simulator build completed successfully and was installed and launched on an iPhone 17 Pro simulator running iOS 26.5. Native existing-user onboarding and pause/resume were exercised. A browser check found that React Native Web 0.21 did not map the native accessibilityState object to checked/expanded/value attributes; explicit ARIA aliases now expose these states. The browser reports `aria-checked=true` for the selected reading size. Physical-device and complete screen-reader audits remain outstanding.

## Version 0.2 — label reading and educational guidance

- 20 app tests and 12 backend tests pass. Lint, TypeScript, Expo doctor (20/20) and Academy production build pass.
- App tests cover the 18/19/74/75 vitamin D populations, B12 sources, current/prospective separation, health-scope stops, stale sources, uncertain rows and duplicate-unit prevention. Backend checks cover image validation/size, consent, origins, durable quota failure, image-only structured extraction, secret-safe errors, fixed research topics and safe paper URLs.
- The additive quota migration was applied to the existing Academy database. Verified RLS enabled, anonymous scan RPC execution denied, service-role execution allowed. No clinical data was accessed for this setup.
- Browser: fictional beginner age 78, vegan diet and no regular B12 source leads to B12 source guidance. Reasons default collapsed; secondary vitamin D guidance correctly uses the 75+ conditional recommendation. Evidence page contains practical B12-source information and the selected primary references.
- Native version 0.2 builds and real-provider integration tests are recorded after completion below. Automated checks are software verification, not clinical validation or a representative label-accuracy study.
