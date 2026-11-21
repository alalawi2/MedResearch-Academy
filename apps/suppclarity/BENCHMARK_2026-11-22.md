# Consumer app benchmark and improvement cycles

Reviewed November 22, 2026 using official feature/help pages and publisher store listings. These are ten established direct and adjacent products, not a verified revenue ranking. Published feature descriptions are not a hands-on usability study. No claim that SuppClarity beats their revenue, clinical quality or retention.

| Product | Observed pattern and primary source | Decision for SuppClarity |
| --- | --- | --- |
| MyFitnessPal | [Meal Scan](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-How-to-use-the-Meal-Scanner) allows database search when a suggestion is absent | Front photo → name/brand search → source confirmation, with manual fallback |
| Cronometer | [Features](https://cronometer.com/features/) offers barcode entry and deep nutrient analysis | Keep contribution/context behind an ingredient tap rather than a dense first result |
| Yuka | [App](https://yuka.io/en/app/) starts with a quick product scan summary | Lead with product identity; avoid an unsupported blanket supplement safety score |
| Medisafe | [Official app](https://medisafeapp.com/) emphasizes medication reminders | A routine must survive relaunch; encrypted local persistence added. Reminders are not claimed |
| Apple Health | [Medications](https://support.apple.com/en-us/105064) supports adding/logging scheduled items | Distinguish recorded routine from clinical need; considering products never increase current totals |
| Calm | [Free vs Premium](https://support.calm.com/hc/en-us/articles/360008536834-Calm-Premium-vs-Free-Features-Content-List-Benefits) describes library access clearly | Concrete free utility; no trial charge or checkout until payments actually exist |
| SuppCo | [Publisher listing](https://apps.apple.com/us/app/suppco-supplement-scanner/id6504838951) describes stack analysis, product search, reminders and quality scores | Compete through clear source confirmation and understandable amounts; no unsupported universal quality/safety grade |
| SuppTrack | [Publisher listing](https://apps.apple.com/us/app/supptrack-supplement-tracker/id6502848329) describes a searchable supplement database, AI stack analysis and annual subscription/trial | Keep a useful free entry path; do not advertise unlimited AI or a live trial without billing and reliable allowances |
| Lifesum | [Publisher listing](https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691) offers photo, typed and barcode entry | Multiple entry methods stay on the same product flow; no mandatory wearable |
| CareClinic | [Official site](https://careclinic.io/) combines symptom, medication and supplement tracking | Keep the first release focused on labels and education instead of adding a complex medical diary |

Supplement-specific listings and website product counts differ over time and between platforms; they are publisher claims, not independently audited database coverage. We have not verified competitor revenue and do not call these the ten highest-grossing apps. Features described here may also exist elsewhere; no exclusivity claim is made.

Additional UX references: [Headspace short content](https://www.headspace.com/headspace-meditation-app), [Noom correction after photo identification](https://www.noom.com/support/faqs/using-the-app/logging-and-tracking/food-and-water/2025/10/how-to-log-meals-using-photo-voice-or-text/), and [Eat This Much preference-based planning](https://www.eatthismuch.com/meal-planner/). The app does not copy their medical or subscription claims.

## Cycle 1: product discovery and dose context

Production 0.5 live check: source matched the official Nature’s Own page, serving 1 tablet, magnesium 300 mg, B12 2.5 mcg, total caffeine 75 mg. A prior AI web summary had reported 69 mg; actual-source retrieval and quote/number verification corrected this. This is a manufacturer-page check, not a real-camera test. Optional dose context gives magnesium contribution to general references; caffeine has no RDA percentage. Clear results and confirmation remain essential.

## Cycle 2: relaunch, privacy and interrupted use

Review found entries disappeared after reload, unclear online copilot consent and a stale-answer race when switching questions. Added encrypted native routine persistence with atomic small-chunk commits, ordered writes/clear, explicit save errors, validation before restore, clear-data recovery, and separate explicit online-question permission. New questions cancel old requests. Reading preferences remain after clear. Browser preview remains session-only and says so. Privacy and support are available from Your space and public routes.

Meaningful checks cover failed writes preserving previous records, Unicode/chunk limits, rapid saves followed by clear, corrupt snapshots, erasure failures and malformed quantities. Native build/install/launch and on-device camera accuracy must be reported separately. Simulator fixtures do not establish real-bottle recognition accuracy. Release artifacts must come from the checked final source.

## Cycle 3: native scenario checks and AI feedback

Added reproducible local Maestro scenarios for native tab navigation, manual entry, restore after relaunch, erasure, a real manufacturer-name search and denied-camera recovery. First harness runs hit retained iOS deep-link permission dialogs and tab labels with accessibility suffixes; the flows were corrected to use normal in-app navigation and accessible tab labels. These failed runs are retained and are not claimed as passing device tests. The hosted Maestro run is unavailable on the current free Expo plan; no subscription was purchased.

Google Play's AI policy review identified a missing in-app report control. Added an optional, explicitly consented answer report below the copilot response, with private service-only storage, bounded fields, per-network/global allowances and daily expiry. The displayed answer and reason are shared; the raw question, profile and inventory are excluded. The separate feedback table and scheduled deletion do not read or modify clinical/participant records. No report is sent automatically.

## Release review sources

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), especially third-party AI permission and accurate health claims.
- [Google Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511), health declaration and privacy requirements.
- [Expo submission guide](https://docs.expo.dev/deploy/submit-to-app-stores/), upload versus review and first Play upload constraints.
- [SDK 58 SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/), encrypted storage, small-value limits, backup and reinstall behavior.
