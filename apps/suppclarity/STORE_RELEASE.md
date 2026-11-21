# SuppClarity 0.6.0 — submission workspace

Prepared November 22, 2026. This document distinguishes implementation, checks and store account dependencies. It is not clinical approval or a claim of submission.

## Store copy

Name: SuppClarity
Subtitle: Understand your supplements
Google short description: Find a supplement, understand its label, and explore the evidence.
Category: Health & Fitness. Intended audience: adults 18+, including older adults. English (US).

Description:
Find your supplement with a photo, brand, product name or barcode. SuppClarity checks available label sources and helps you confirm the bottle before adding it to your routine.

See what an ingredient does, understand the amount on your label and compare supported nutrients with general daily intake references. Keep products you take separate from products you are considering. Explore 29 short guides and 100 common questions, or choose an online answer grounded in the guide evidence. Related Consensus research and original sources are available when you want more detail.

Your confirmed routine is saved in encrypted storage on your phone. No account is needed. Comfortable reading sizes, manual entry, export and clear-data controls are included.

SuppClarity provides general education for adults. It does not diagnose deficiencies, prescribe individual doses, assess your complete diet, or check all medicine interactions. Product formulas and online sources can change: always confirm your bottle. AI label reading and answers can make mistakes. No clinical validation is claimed. All current features are free; there are no subscriptions or trial charges. Online scans, research and answers have daily allowances; local guides and manual entry remain available.

Privacy: https://www.medresearch-academy.om/suppclarity/privacy
Support: https://www.medresearch-academy.om/suppclarity/support
Marketing: https://www.medresearch-academy.om/active-research/suppclarity
Contact: info@medresearch-academy.om (existing Academy public support address)
Keywords: supplement,label,vitamin,mineral,magnesium,nutrition,evidence,ingredient

## Reviewer notes

No sign-in or payment is required. The main entry points are Find my product, a short questionnaire, and Ask Clarity. You can skip the questionnaire to scan/search. Search Nature’s Own Magnesium + Energy as one example; country/formula confirmation is required before saving. A manual entry path remains available when an external provider is unavailable.

Camera and photo access are requested only for label photos. A separate explicit checkbox precedes sending a photo to OpenAI. Typed search has an explicit Agree & find my product action with NIH/OpenAI disclosure. An explicit first-use prompt precedes sending an unprepared copilot question and up to two recent exchanges to OpenAI. Permission can be revoked in Your space; it resets each session. Prepared answers and guides are local. Profile and saved inventory are not sent to these AI services. External services: NIH DSLD (product search), OpenAI (photo transcription, public-page product discovery and optional copilot), Consensus (optional related research), Vercel (backend hosting) and Supabase (separate request-allowance counters and optional answer reports only).

No HealthKit/Health Connect, wearable data, advertising SDK, tracking SDK, account creation or in-app purchases. Export opens the OS sharing UI only when chosen. The release uses supplement-education wording and explicitly states its limits. Do not describe it as clinically validated or a recruiting human-subjects study. The browser is identified separately because its storage remains session-only.

## Privacy declarations to complete in the store consoles

Declarations must reflect the actual build and provider contracts; do not blindly select “no data collected.” Selected label images, questions (which may contain health details), recent question history, product search terms and network request information leave the device when those features are used. App-side profile/routine storage is local. AI response storage is disabled, but that does not establish zero provider retention. If a user explicitly reports an answer, the displayed answer, reason and source identifiers are retained privately for up to 31 days with daily deletion; no raw question/profile/inventory is included. Include optional report data in the App Privacy and Data safety declarations. Operational provider logs and keyed quota identifiers must be considered in the store definitions. No advertising or cross-app tracking purpose. No user accounts to delete; local erasure is in Your space.

Google Play requires a completed Health apps declaration (nutrition/general health education as applicable), Data safety, target audience, content rating, app access and privacy-policy fields. State that the app is not a regulated medical device and does not diagnose, treat, cure or prevent a condition. Apple requires App Privacy, age/content rating, review contact, screenshots, app description and the correct rights holder. The signed account's legal entity must supply its correct seller/legal and regional business details; do not invent them.

## Purchase readiness

Initial build has no paid entitlements, trial enrollment or checkout. Proposed pricing remains in planning documents; the app does not advertise an unfinished membership. Before monetization: configure real store products, native IAP, restore purchases, entitlement verification, subscription terms and cancellation links. Do not switch on a paid plan without these.

## Account and artifact state

Apple production build attempted non-interactively on November 22: remote signing credentials are not configured; EAS stopped before building. Existing Apple identity requires interactive verification to set up signing. A simulator build cannot be submitted to App Store Connect. EAS Submit upload is not the same as Apple review submission. Google upload was attempted and stopped because no Google service-account key is assigned for Play submissions. Console app creation, access, and declarations still need verification. The EAS hosted Maestro workflow was attempted but requires a paid Expo plan; local Maestro tests are the fallback, with no subscription purchased. Update this section with actual build/submission results after final checks.

Never commit service-account JSON, App Store Connect private keys, passwords, verification codes, signing credentials or private-device identifiers. Do not submit obsolete 0.2 preview/simulator binaries.
