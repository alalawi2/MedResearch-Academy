# SuppClarity Plus — 0.7.0 preparation

Status: implemented on feat/suppclarity-plus; live payments and release are disabled. The published 0.6.0 app remains free. This document is not a claim of store approval or clinical validation.

## Recommended pricing

US $4.99 monthly or $39.99 yearly (about 33% less than twelve monthly payments). No trial at launch: free features let people try the app without starting a subscription. These are recommended prices pending owner approval; the app displays localized prices returned by each store, never a hard-coded checkout amount.

## What users receive

- Free: manual entry, product-name lookup, saved labels, basic amount explanations, safety/evidence information, the learning library, ready-written common answers and text export.
- Plus: compare two saved labels, optional routine reminders and taken/skipped tracking, optional local PDF summaries, 100 photo scans and 300 online AI answers per calendar month.
- New enabled clients: free online allowance is 3 photo scans and 10 AI answers per calendar month. Existing clients retain their legacy limits. Paid daily safeguards: 20 scans and 50 online answers. Reset uses UTC; unused allowance does not roll over.
- No personalized prescribing, diagnosis, product winner scores or paid safety warnings. Optional details stay behind user actions.

## Activation checklist

1. Owner approves prices, subscription wording, privacy updates and purchase-service access.
2. Connect only SuppClarity Apple/Google apps to its separate RevenueCat project c1a49481. Configure subscription group/base plans with product IDs suppclarity_plus_monthly and suppclarity_plus_yearly; attach both to entitlement suppclarity_plus and a current offering containing monthly and annual packages. Test Store catalog drafts exist but entitlement/offering mapping still needs verification.
3. Configure app-specific server RevenueCat verification access. Current integration uses the V1 subscriber endpoint; do not use a shared company key. Keep all private credentials server-side. Review key scope before creating or granting it.
4. Apply supabase/migrations/202611220002_suppclarity_membership_quotas.sql. Server variables: SUPPCLARITY_PLUS_ENABLED=true, SUPPCLARITY_REVENUECAT_SECRET_KEY, VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Sandbox is off in production; enable SUPPCLARITY_ALLOW_SANDBOX only in an isolated test deployment.
5. Build custom native development clients with EXPO_PUBLIC_PLUS_ENABLED=true and platform public SDK keys (see .env.example). Expo Go and the website cannot make real purchases. Backend readiness must succeed before offers/checkout appear.
6. On actual native store sandboxes verify buy, cancel, restore after reinstall, expiration, grace period, refund/revocation, plan change, localized pricing and exhausted allowance. Test real notification permission/denial, delivery, clear-data cancellation and native PDF sharing. Web design preview is not purchase validation.
7. Submit a new app version with subscriptions for each store's review; keep the existing Apple 0.6 review intact. Update privacy declarations and subscription metadata before activation. Do not enable live charging until these checks pass.

## Review and safeguards

The phone-width design preview allows Free/Plus switching with sample entries and has no purchase capability. EXPO_PUBLIC_PLUS_PREVIEW is development-web-only and production build configuration rejects it. Client UI entitlement checks include expiry, approved product IDs, grace and refunds; increased online allowances are independently verified by the server. Restore/manage controls are present. Clearing local health entries does not cancel store subscriptions. Reminders are bounded to the verified membership period and generic on the lock screen. PDFs are generated locally and shared only through an explicit share action.

Automated tests cover membership/refund/expiry/grace, allowance enforcement and rollback, comparisons, routine logs and PDF content escaping. SQL was exercised against isolated PostgreSQL including service-role-only permissions. Phone-width browser flows were exercised for plans, comparison, taken/skipped/undo and optional PDF history. Native purchases, notification delivery and PDF sharing still require device validation.

Final local validation: 55 app tests and 46 backend tests passed (101 total); TypeScript and ESLint passed; Expo dependency compatibility passed; full academy build and final app web export passed. Export fingerprint matched source. These checks do not replace the native device tests above.
