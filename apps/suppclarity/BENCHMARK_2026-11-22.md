# Consumer app benchmark and improvement cycles

Reviewed November 22, 2026 using official feature/help pages and publisher store listings. These are ten established adjacent products, not a verified revenue ranking. Published feature descriptions are not a hands-on usability study. No claim that SuppClarity beats their revenue, clinical quality or retention.

| Product | Observed pattern and primary source | Decision for SuppClarity |
| --- | --- | --- |
| MyFitnessPal | [Meal Scan](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-How-to-use-the-Meal-Scanner) allows database search when a suggestion is absent | Front photo → name/brand search → source confirmation, with manual fallback |
| Cronometer | [Features](https://cronometer.com/features/) offers barcode entry and deep nutrient analysis | Keep contribution/context behind an ingredient tap rather than a dense first result |
| Yuka | [App](https://yuka.io/en/app/) starts with a quick product scan summary | Lead with product identity; avoid an unsupported blanket supplement safety score |
| Medisafe | [Official app](https://medisafeapp.com/) emphasizes medication reminders | A routine must survive relaunch; encrypted local persistence added. Reminders are not claimed |
| Apple Health | [Medications](https://support.apple.com/en-us/105064) supports adding/logging scheduled items | Distinguish recorded routine from clinical need; considering products never increase current totals |
| Calm | [Free vs Premium](https://support.calm.com/hc/en-us/articles/360008536834-Calm-Premium-vs-Free-Features-Content-List-Benefits) describes library access clearly | Concrete free utility; no trial charge or checkout until payments actually exist |
| Headspace | [App](https://www.headspace.com/headspace-meditation-app) organizes short meditation/sleep content | Short local guides and optional deeper sources, without requiring chat |
| Noom | [Photo/voice/text logging](https://www.noom.com/support/faqs/using-the-app/logging-and-tracking/food-and-water/2025/10/how-to-log-meals-using-photo-voice-or-text/) supports correcting identification | Treat machine readings as editable drafts; user confirms amounts and serving basis |
| Lifesum | [Publisher listing](https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691) offers photo, typed and barcode entry | Multiple entry methods stay on the same product flow; no mandatory wearable |
| Eat This Much | [Meal planner](https://www.eatthismuch.com/meal-planner/) adapts plans to preferences | Respect diet context but do not translate a short questionnaire into an unsupported deficiency diagnosis |

## Cycle 1: product discovery and dose context

Production 0.5 live check: source matched the official Nature’s Own page, serving 1 tablet, magnesium 300 mg, B12 2.5 mcg, total caffeine 75 mg. A prior AI web summary had reported 69 mg; actual-source retrieval and quote/number verification corrected this. This is a manufacturer-page check, not a real-camera test. Optional dose context gives magnesium contribution to general references; caffeine has no RDA percentage. Clear results and confirmation remain essential.

## Cycle 2: relaunch, privacy and interrupted use

Review found entries disappeared after reload, unclear online copilot consent and a stale-answer race when switching questions. Added encrypted native routine persistence with atomic small-chunk commits, ordered writes/clear, explicit save errors, validation before restore, clear-data recovery, and separate explicit online-question permission. New questions cancel old requests. Reading preferences remain after clear. Browser preview remains session-only and says so. Privacy and support are available from Your space and public routes.

Meaningful checks cover failed writes preserving previous records, Unicode/chunk limits, rapid saves followed by clear, corrupt snapshots, erasure failures and malformed quantities. Native build/install/launch and on-device camera accuracy must be reported separately. Simulator fixtures do not establish real-bottle recognition accuracy. Release artifacts must come from the checked final source.

## Release review sources

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), especially third-party AI permission and accurate health claims.
- [Google Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511), health declaration and privacy requirements.
- [Expo submission guide](https://docs.expo.dev/deploy/submit-to-app-stores/), upload versus review and first Play upload constraints.
- [SDK 58 SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/), encrypted storage, small-value limits, backup and reinstall behavior.
