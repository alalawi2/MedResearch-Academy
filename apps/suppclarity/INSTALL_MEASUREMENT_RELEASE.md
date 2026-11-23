# SuppClarity Android 0.6.1 — install measurement

The signed Android 0.6.1 hotfix artifact is built from commit 1c5ebf7 on the published free 0.6 base; it excludes Plus. This source integration also preserves the separately merged 0.7 Plus work on main and adds the same opt-in measurement there, without changing its prices or release authorization. Do not confuse the 0.6.1 hotfix artifact with a later 0.7 build. Existing ad budgets are unchanged.

- Meta app: 2184159269127361; Google Play package: om.medresearchacademy.suppclarity.
- Android-only local Expo module, Facebook core SDK pinned to 18.3.0. No Facebook login/share library, account matching fields or arbitrary event API.
- Startup provider removed. Native consent defaults to not_asked. Native resume sends nothing without a persisted grant. Advertising ID collection, automatic initialization and automatic events default off.
- After agreement: publish the SDK's deduplicated install receipt only. Automatic screen, purchase and subscription logging stays off. LimitEventAndDataUsage is enabled for measurement rather than personalized retargeting.
- Android Topics, custom audience and AdServices permissions are removed. Shared-preference consent/SDK attribution data is excluded from backup by disabling application backup.
- Older updated installations are excluded using Android firstInstallTime/lastUpdateTime so activating the new SDK does not count an ordinary update as a new download.
- Revocation stops future explicit requests, disables advertising-ID collection and automatic initialization; it cannot recall an in-flight request or data Meta already received.
- SDK acknowledgement reads the pinned SDK's success-only install ping. It is separate from a matched campaign conversion. Official Play first-time acquisitions, Play user installs, SDK receipts and Meta-attributed installs must remain separate in reporting.
- There are no supplement records, health answers, photos, searches, questions, chat content, payment details or arbitrary user-data fields in the measurement interface.

Validation: 49 application tests including refusal/unsupported-platform gates, acknowledgement wording and native startup configuration; TypeScript and ESLint passed. 38 existing backend tests passed. Android local module compiled. Full signed build and device checks are recorded separately; provider receipt/campaign attribution is not proven by these source checks.

Google Play declarations required with the new release: Advertising ID Yes, Analytics + Advertising/marketing; Data safety optional collected/shared device identifiers and app install interactions for analytics/ad measurement. Include approximate network-derived location where applicable. Preserve the existing declarations for online product/AI functions. No in-app advertising is added.

Never describe the integration as live or verified until the signed build is released and a genuine consented Play installation reaches Meta. Do not count QA installs as customer downloads. No retroactive match is promised for old installs or declined consent.
