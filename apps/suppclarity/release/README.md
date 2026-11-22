# SuppClarity 0.6 release handoff

## What can be tested

The current app supports photo recognition followed by sourced product search, name/barcode search, manual confirmation, encrypted saved routines, optional amount explanations, 29 local guides and 100 prepared questions. Details are opened on request. Current features are free; subscriptions and revenue collection are not enabled.

The web preview is https://www.medresearch-academy.om/suppclarity/. Browser storage lasts only for the session. The installed native app saves routines in encrypted device storage.

## Android artifact

Full production build: `c4022d61-5c9c-42a4-9b13-169db9eef0c3`, version 0.6.0, code 8. The AAB and matching installable APK are in the workspace's `build-review` folder, outside Git. Audit results include SHA-256 hashes. Use this exact build for Play upload, not a preview or JavaScript repack.

## Store connection and submission state

Apple signing and App Store Connect access are connected. iOS 0.6.0/build 12 was uploaded successfully and the processed build was attached and verified after reloading. App: https://appstoreconnect.apple.com/apps/6837860843/appstore . EAS submission ID: `e497f77c-1147-408b-8836-bca9726d7751`.

Google Play access is connected through the owner's signed-in console. SuppClarity app ID: `4975920705998390942`. The final AAB/code 8 is submitted to US production review; Google's initial checks passed. All required content and privacy declarations are saved. The Education category correction has also been submitted. There is no Google Play submission key on EAS; manual Console upload does not require one.

Apple privacy responses, content rights, screenshots, free US availability, Education category and non-device declaration are saved. Apple review submission completed: **Waiting for Review**, version 0.6.0/build 12. Google shows **Changes in review**, including the Education category correction. Both review submissions completed on November 22, 2026; store approval remains pending. Uploading a binary does not complete review submission or make the app public. The original connect/build helpers are available for later credential repair; they are not needed to repeat the completed uploads.

Apple store copy is maintained in `../store.config.json`. Validate with `eas metadata:lint`. The standard CLI currently drops required Apple age-rating flags, so push through `push-store-metadata.cjs` with the official EAS executable path. See STORE_RELEASE.md for the exact scope and live verification. No credentials belong in Git.

## Verification

See `../VALIDATION.md` for executed checks, `../BENCHMARK_2026-11-22.md` for the ten-app feature comparison, and `../CLAUDE_RELEASE_REVIEW.md` for the actual Claude engineering reviews. Source and backend tests are automated in GitHub. `scripts/test-suppclarity-native.mjs` at the Academy root runs native scenarios serially on dedicated simulators/emulators. The EAS release-candidate workflow additionally supports hosted native testing, which needs a paid Expo plan; none was purchased.

A manufacturer front image was used to verify recognition and source lookup. The user's physical bottle and physical iPhone camera still need a hands-on test. No clinical validation is claimed.
