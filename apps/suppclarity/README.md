# SuppClarity

Expo SDK 58 / React Native app for iOS, Android and web. US English adults 18+, with no upper age cutoff; beginners and existing supplement users. Version 0.4 adds front-photo identification, automatic online product discovery, optional daily-intake details and a copilot that answers broad questions without assuming a goal. Details stay optional.

## Run and check

Use Node 24 LTS (tested 24.22.1).

```sh
cd apps/suppclarity
npm ci
npm start
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

From the repository root, `npm run test:suppclarity` checks the backend, and `npm run build:all` exports the app and builds the Academy. Commit the generated `public/suppclarity` export with source changes. CI verifies its source fingerprint before rebuilding. The Academy's existing Vercel project hosts `/suppclarity/` and the research card at `/active-research/suppclarity`.

## Working features

- Beginner/existing-user onboarding, adult age, diet, B12-source questions when relevant, health-scope screening, and goals.
- Camera/library label reading with explicit consent, resizing and server-side structured OpenAI extraction. No questionnaire accompanies the image.
- Editable confirmation of each supported amount and serving size before saving; missing and uncertain quantities stay blank. Unsupported ingredients stay visible as unassessed.
- Multi-ingredient scanned, database and manual products. Paired vitamin D units cannot double-count within a product. Magnesium must be elemental magnesium from Supplement Facts.
- Current versus prospective products; only current products enter totals. Weekly averages and potential same-day totals are distinguished.
- 54 ingredient types: common vitamins/minerals, omega-3, protein, creatine, collagen, fiber, probiotics, melatonin and selected botanicals. Catalog coverage means recording/education, not a personal recommendation for every ingredient.
- 29 in-app guides and 100 authored common questions, with local matching, ambiguity choices and an honest out-of-scope fallback. Prepared answers and broad ingredient overviews remain local. Other questions and up to two prior exchanges use OpenAI with curated guide content; profiles and product inventories are not sent. Optional primary sources and fixed-topic Consensus reading are available after asking.
- Start with a name/brand photo or typed name. NIH lookup automatically falls back to OpenAI web search when no candidate is found or NIH is unavailable. A user can request an online check for an incorrect NIH candidate. Manufacturer pages are preferred over retailer pages; only consulted HTTPS product URLs survive validation. Online quantities stay editable and require bottle confirmation. International quantitative ingredient panels are accepted.
- Search the NIH Dietary Supplement Label Database by name, brand or typed barcode. Match the exact strength and serving; confirm all quantities before saving. Ranged/multiple servings and obvious quantity/%DV conflicts never supply guessed amounts. This is not NIH product approval.
- Versioned deterministic guidance preserves age/diet-specific vitamin D and B12 rules, food-first magnesium guidance, relevant guides for recorded ingredients and exercise/gut goals. Nine selected US upper references use age-specific values; staying below a reference never establishes safety. Important limitations remain visible; reasons, sources and other considerations expand on request.
- Live Consensus related-paper searches on supported general topics. Searches never receive profiles/photos, and returned matches never automatically rewrite the rules.
- Ingredient names link to optional daily intake references for ten nutrients, including age/sex differences and existing upper references. Values describe total food-plus-supplement intake, not extra pills. Sex-reference selection is optional under Account; the default shows both references. Gender identity is not requested. No extra onboarding step was added.
- Reading sizes, session export and clearing. Personal entries are memory-only and disappear on reload. No payments, authentication or persistent health records.

The home screen separates four scenarios: new to supplements, checking before buying, reviewing current use and asking a question. If camera access is blocked, the app opens its system settings; Expo Go opens the host app’s settings.

## Server setup

Existing Vercel project: `med-research-academy`. Server-only environment variables:

- `OPENAI_API_KEY` — label reader; optional `SUPPCLARITY_LABEL_MODEL`, default `gpt-4.1-mini`.
- `CONSENSUS_API_KEY` — current `/v1/search` endpoint, `x-api-key` authentication.
- `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — separate durable request counters in the Academy's existing database. Never expose the service role key to Expo or browser code.

NIH product search uses the public DSLD v9 API with no additional key. It is read-only, bounded to 60 upstream hits / 8 displayed candidates, uses a 10-second NIH timeout, and caches public label metadata for an hour. Online fallback uses existing server-only OPENAI_API_KEY (optional SUPPCLARITY_SEARCH_MODEL, default gpt-4.1-mini), at most two web tool calls, bounded output, and the existing durable evidence allowance shared with live copilot/Consensus (50 global, 20 per network daily). Transient failure and allowance responses are not cached as no-match results. No personal profile goes to NIH. Only typed product queries are sent.

Apply `supabase/migrations/202611210001_suppclarity_scan_quota.sql` to that database. RLS and revoked client privileges restrict counters/RPCs to the server. Default beta caps are 100 scans globally/day, 15 per network/day, 5 per session/day; evidence 50 global/day and 20 per network/day. Identifiers are HMAC hashes with an app-specific namespace. Old counters are removed on requests after seven days. Client session IDs are not authentication; global/network caps remain authoritative. Provider failures still consume an allowance. These are request safeguards, not a paid membership system.

Deploy environment changes before testing. Missing keys/counters fail closed and leave manual entry and saved references available. The app calls the fixed production API origin on all platforms; localhost/owned Academy previews are allowed for QA. Scan endpoint accepts only bounded inline JPEG/PNG/WebP image data, requires consent, does not fetch user URLs, and does not log raw photos, profiles or upstream responses. API keys never enter the app bundle.

OpenAI Responses uses `store:false`. This does not promise zero provider retention or eliminate abuse-monitoring retention. Photos are not saved in the app database, but temporary device files and provider controls still apply. External reference pages have their own privacy practices.

## Evidence and scope

Read `EVIDENCE_RULES.md`. Research was gathered through Consensus and checked against linked primary sources. This is an implementation review, not independent clinical validation. The evidence snapshot is versioned and personalized suggestions pause after its review date; label totals remain available. Essential quantity flags are not paywalled.

No diagnosis, individual supplement dose, treatment plan, comprehensive nutrient adequacy calculation, medicine interaction screening or whole-product safety clearance is provided. Diet categories and label amounts do not establish deficiency, absorbed intake or a numerical gap. Health conditions, medicines, clinician-directed supplements/known deficiency and pregnancy-related circumstances route to individual review rather than automatic personal advice. No participant recruitment, ethics approval or clinical efficacy is claimed.

## Native builds

Expo project: https://expo.dev/accounts/alalawi2/projects/suppclarity

```sh
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile ios-simulator
```

For native camera testing without Apple signing, the installed SDK 58 camera/image modules are included in Expo Go. Start `npx expo start --go --lan --port 8081`, keep phone and Mac on the same Wi-Fi, and sign in to Expo Go with the same Expo account as the CLI. Expo Go is a preview host, not a standalone App Store installation. The published Safari app is also available for photo scanning without Expo Go setup.

The photo picker preserves the full image instead of forcing iOS square cropping, so tall Supplement Facts panels and serving sizes remain in view. New/unknown users and the “checking before buying” path start with “Considering it”; only a user who has reported existing supplement use starts with “Taking it”. Confirm the actual choice before recording use.

For a physical iPhone, register it with the Apple team and configure signing with `npx eas-cli@latest credentials:configure-build --platform ios --profile preview`, then build `--platform ios --profile preview`. The `ios-simulator` profile does not produce a phone-installable app. Complete Apple account verification in your own terminal and enable iOS Developer Mode when required.

Image manipulation adds native code, so version 0.2 needs a new native build. Android preview is an APK. iOS simulator builds cannot install on physical iPhones. Signed iPhone builds need Apple Developer credentials and registered test devices; store submission remains a separate step. Identifier: `om.medresearchacademy.suppclarity`. The Academy web prefix is set only for web exports, never native assets.

Before clinical/commercial release: held-out real-label evaluation and evidence-rule validation, physical-device and VoiceOver/TalkBack testing, defined intended-use/regulatory assessment, persistent-data rights design if accounts are introduced, and app-store-compliant subscriptions after core value is demonstrated. Claude's earlier interface critique is recorded in `CLAUDE_INTERFACE_REVIEW.md`; AI critique is not clinical validation.
