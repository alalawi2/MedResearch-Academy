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

SuppClarity is not a medical device and does not diagnose, treat, cure or prevent medical conditions. Consult a qualified healthcare professional for medical advice.

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

Updated November 22, 2026 after the account owner completed Apple verification. Apple signing is connected. Production iOS build `e7bfb240-f712-4fea-bbe0-767e1319b374` (0.6.0, build 12) finished and was successfully uploaded through EAS submission `e497f77c-1147-408b-8836-bca9726d7751`. App Store Connect app ID is `6837860843`. The processed build was attached and verified again after reloading the version page. The final review submission completed on November 22, 2026; Apple shows **Waiting for Review**. Approval and public availability are still pending.

Google Play organization access is connected through the owner's authenticated console. The SuppClarity app record was created with explicit approval of Google's policy/export declarations. App ID is `4975920705998390942`; package is `om.medresearchacademy.suppclarity`. The verified production AAB (version code 8) was accepted and saved in an internal release draft. The English listing, four actual Android screenshots, icon, feature graphic, privacy URL, access, content ratings, adult target, health-content disclosures, Data safety, no-advertising-ID declaration and trader status were completed. Production version code 8 and US availability were submitted; Google's initial checks passed and the changes entered review. The owner then requested educational positioning: Education replaced Health & Fitness, and this category correction was sent for review too. No private Google service-account key was needed for the manual upload; unattended EAS submissions still need a properly connected key.

Apple English metadata, categories, privacy/support URLs, company copyright, review contact/notes and adult age rating were saved through Expo Metadata. The review phone is the company's published number, supplied as requested by the owner from https://www.bayanai.tech/. This contact is for review, not the description. The app uses manual release after approval. Apple privacy labels were published with explicit owner approval. Three iPhone and one iPad screenshots, free US availability, and the owner-approved content-rights declaration are saved. Education is the only category, with no Health & Fitness or Medical category. The app is declared not a regulated medical device; health-content and data disclosures remain accurate. The iOS version was added to a review submission and submitted successfully: **Waiting for Review**, build 12. Both stores use Education; Google shows **Changes in review** including the category correction. Store approval is pending; neither store is claimed to have approved the app.

The standard Expo CLI failed to send Apple's newly required social-media fields. `release/push-store-metadata.cjs` adapts the official client's request in memory for this exact app only, using the existing EAS credential service; it does not change installed packages, print keys or write credentials. Live Apple responses confirm 18+, wellness topics, no social network, no location sharing and no dating features. Recheck/remove the adapter when upstream serialization supports these fields.

Never commit service-account JSON, App Store Connect private keys, passwords, verification codes, signing credentials or private-device identifiers. Do not submit obsolete 0.2 preview/simulator binaries.

## Secure account setup

Open `release/Connect-Apple-and-build.command` in macOS Terminal to complete Apple verification and create a signed iOS release. Open `release/Connect-Google-Play.command` to connect a Google Play submission key locally. These helpers do not contain credentials and do not send verification codes through chat. Upload alone does not complete review submission or the store declarations.

Final Android production job: `c4022d61-5c9c-42a4-9b13-169db9eef0c3`, app 0.6.0, source `8a8f9111d4992ddff96fa941f12f6c5e173f281b`. This job builds the AAB and a matching test APK together; it finished successfully with version code 8; final native scenario results are recorded in VALIDATION.md. JavaScript repacks are QA artifacts and must not be submitted.

Android artifacts are stored outside the repository in `build-review/SuppClarity-v06-release.aab` and `build-review/SuppClarity-v06-release.apk`; the APK is an additional output of the same production build. Final manifest inspection confirms target SDK 36 and no overlay permission; all 24 arm64 native libraries have load alignment of at least 16 KiB.

Removed the temporary workflows that repacked JavaScript onto old native builds after the Android repack rendered but ignored taps. Future native verification uses full builds. The manual release-candidate workflow remains available; its hosted Maestro jobs need an Expo paid plan, so local native tests remain the verified free fallback.
