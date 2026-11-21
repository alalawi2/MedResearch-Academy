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
