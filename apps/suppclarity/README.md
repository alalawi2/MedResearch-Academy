# SuppClarity

Expo SDK 58 / React Native application for iOS, Android and web. Development preview under MedResearch Academy. Audience: US English adults 18+, without an upper age limit, both beginners and existing supplement users.

## Run

Use Node 24 LTS (tested with 24.22.1).

```sh
cd apps/suppclarity
npm ci
npm start
# npm run android / npm run ios / npm run web
npm run lint
npm run typecheck
npm test
```

Expo Router owns navigation. Shared state lives in `src/store.tsx`; calculation and scope logic in `src/domain.ts`; reusable UI in `src/ui.tsx`. The UI supports system text scaling plus three reading sizes, labels on controls, large touch targets and reduced visual complexity. Test on physical devices and with VoiceOver/TalkBack before release.

## Working features

- Beginner and existing-user questionnaire; pause/resume in the current session.
- Adults 18+ including older adults, with no upper marketing cutoff.
- Confirmed manual single-ingredient vitamin D, B12 and magnesium entries.
- Serving and weekly-use arithmetic, vitamin D IU normalization, overlapping ingredient entries.
- Optional reference photo via native camera or system library; no OCR or upload.
- Evidence reference links, optional explanation, planned pricing, export and session clearing.

## Deliberate release boundaries

This is not a validated clinical product. There is no recommendation engine, diagnosis, treatment dosing, upper-limit assessment, food-intake assessment or medicine interaction screening. Screening marks results incomplete when required. Sources are educational references, not generated personal citations. Consensus and product database integrations are not connected. Photos are transient on the entry screen and are not saved with product entries. Products and profile exist only in memory and clear on reload. There is no authentication, backend, payment collection, persistence or production health-data storage yet. No study recruitment, ethics approval, efficacy or professional review of these clinical rules is claimed.

The calculator only accepts one supported ingredient per product entry; multivitamins and mixed products are not supported. Magnesium entries must use elemental magnesium from Supplement Facts. Weekly averages are not recommended doses or a judgment about dosing schedules.

Vitamin D conversion source: NIH ODS, https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/ (1 mcg = 40 IU), checked 21 November 2026.

## Web hosting on the Academy

From the repository root after installing this app's dependencies:

```sh
npm run build:all
```

`build:app` exports the app and copies it into `public/suppclarity`. The Academy's existing Vite/Vercel build serves the checked-in export. `/active-research/suppclarity` introduces the project and `/suppclarity/` opens the app. Rebuild and commit the export whenever app source changes; CI checks a source fingerprint for stale exports and rebuilds on Linux; byte-for-byte bundle equality is not assumed across build hosts. Do not add health tracking scripts to the app. The research card has a development status and does not imply an approved research study.

## Native test builds

The Expo project is https://expo.dev/accounts/alalawi2/projects/suppclarity .

```sh
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile ios-simulator
```

Android preview produces an APK. iOS simulator builds do not install on a physical iPhone. A signed physical-device iOS build requires Apple Developer credentials and registered test devices; App Store and Play submissions are separate later steps. Identifiers: `om.medresearchacademy.suppclarity`.

## Next implementation work

1. Finish device accessibility testing and usability tests across age groups and both entry paths.
2. Add a secure, consented backend and ownership-tested export/deletion before persistent personal data.
3. Implement server-side label extraction and confirm uncertain values; validate it against held-out labels.
4. Establish intended use, reviewed nutrient rules, licensed interaction coverage, versioned source records and clinical/regulatory validation before personal recommendations.
5. Add app-store-compliant subscriptions after the core value is demonstrated; keep detected essential warnings free.

Claude's interface critique and the changes adopted are recorded in `CLAUDE_INTERFACE_REVIEW.md`. AI appraisal does not replace clinical or regulatory diligence.
