# SuppClarity 0.6 release handoff

## What can be tested

The current app supports photo recognition followed by sourced product search, name/barcode search, manual confirmation, encrypted saved routines, optional amount explanations, 29 local guides and 100 prepared questions. Details are opened on request. Current features are free; subscriptions and revenue collection are not enabled.

The web preview is https://www.medresearch-academy.om/suppclarity/. Browser storage lasts only for the session. The installed native app saves routines in encrypted device storage.

## Android artifact

Full production build: `c4022d61-5c9c-42a4-9b13-169db9eef0c3`, version 0.6.0, code 8. The AAB and matching installable APK are in the workspace's `build-review` folder, outside Git. Audit results include SHA-256 hashes. Use this exact build for Play upload, not a preview or JavaScript repack.

## What stops store submission

- Apple: distribution signing has not been configured; the existing Apple sign-in needs live verification. Open `Connect-Apple-and-build.command` in Terminal. Verification stays in Terminal.
- Google Play: no Play submission key exists in the connected EAS account. Open `Connect-Google-Play.command` to connect one locally. Do not paste or commit the key.
- Complete the store app records, privacy/health declarations, ratings and legal/contact information using `../STORE_RELEASE.md`. Store screenshots and graphics are in `build-review/store-assets`.

No store upload/review submission has completed. Store approval and review timing cannot be guaranteed. An iOS simulator app cannot be installed on a physical iPhone or submitted as an IPA. Expo Go remains the available iPhone preview until signing is complete.

## Verification

See `../VALIDATION.md` for executed checks, `../BENCHMARK_2026-11-22.md` for the ten-app feature comparison, and `../CLAUDE_RELEASE_REVIEW.md` for the actual Claude engineering reviews. Source and backend tests are automated in GitHub. `scripts/test-suppclarity-native.mjs` at the Academy root runs native scenarios serially on dedicated simulators/emulators. The EAS release-candidate workflow additionally supports hosted native testing, which needs a paid Expo plan; none was purchased.

A manufacturer front image was used to verify recognition and source lookup. The user's physical bottle and physical iPhone camera still need a hands-on test. No clinical validation is claimed.
