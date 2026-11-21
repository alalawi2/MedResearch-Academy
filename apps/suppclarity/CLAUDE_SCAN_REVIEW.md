# Claude review of scanning and guidance

21 November 2026. Actual Claude Code review, model reported as `claude-opus-4-6[1m]`. The reviewer received public application/domain/rule/label/server source and the evidence implementation record. Tools, external retrieval and session persistence were disabled. No keys, user photos, real profiles or database records were included.

The reviewer reported no substantiated high-impact blocking bug in the supplied snapshot and identified a concrete grammar issue: multiple overlapping nutrients used singular “appears”. Verified and corrected in source/web. The home routine count was also adjusted for singular/plural wording. The already-built native 0.2 artifacts precede these cosmetic wording changes; their scanning/guidance behavior is the same, and the server safeguard applies to them.

One positive claim in the response was **incorrect**: it said the `supported` flag gates `draftRows`. That function actually filters by recognized nutrient identity. Independent inspection found that a readable quantity in an unsupported unit could therefore prefill its number while the form offered a different unit. The server now marks such rows uncertain/incomplete and adds an explicit unit-check explanation; the client leaves the amount blank. A regression test follows B12 `1 mg` through server validation into the existing confirmation logic and verifies that it cannot be saved without manual checking.

This illustrates the limits of the AI appraisal. It is code critique, not a clinical approval, regulatory determination, representative OCR accuracy study or replacement for the automated/live checks in `VALIDATION.md`. Research-rule interpretations are recorded separately in `EVIDENCE_RULES.md`.

The original machine-readable response and exact supplied input are retained in the parent workspace's `build-review/claude-v02-review-response.json` and `build-review/claude-v02-review-input.txt`.
