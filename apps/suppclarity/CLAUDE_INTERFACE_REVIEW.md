# Independent interface appraisal

Claude Opus 4.6 reviewed the interface plan on 21 November 2026 without browsing. This is an AI design critique, not clinical validation.

# SuppClarity Interface Plan — Critique

## What works well

- One-question-per-screen flow reduces cognitive load and suits the broad age range.
- "Incomplete review" for pregnancy/conditions/medications is the right safety posture.
- No auto-dosing, no false all-safe badge, and no fake checkout are strong trust decisions.
- Memory-only storage with explicit clearing disclosure is honest for a demo stage.
- Expandable evidence on demand keeps the default screen clean without hiding rigor.

---

## Five prioritized UI improvements

### 1. Add an explicit exit/save-progress affordance to the check flow
One-question-per-screen with back/progress is good, but there's no mention of what happens if a user leaves mid-flow. On mobile, interruptions are constant. Add a persistent "Save & exit" option that holds partial state in memory and lets them resume. Without it, users who get interrupted at question 5 of 7 will abandon.

### 2. Make the medication/condition screen a gate, not just a question
Right now "medication and condition scope" is listed as one step in a linear sequence. It should behave differently: present it early (before goals), and if a user indicates any active prescription or diagnosed condition, surface a clear interstitial — not a toast — explaining that results will be limited and why. This prevents users from completing the full flow and only then feeling the output was unhelpful.

### 3. Strengthen the product-entry confirmation loop
Manual entry of label amount, units, serving, and frequency is four fields per product. That's error-prone, especially for older users. Add an inline summary card ("Vitamin D — 2000 IU — 1 capsule — daily") with an explicit "This is correct" confirmation before the entry counts toward intake totals. Without this, your arithmetic totals will silently inherit typos.

### 4. Provide a text-size preview, not just a toggle
A binary "larger text" toggle in Account is better than nothing but inadequate for the stated age range (no upper cutoff). Replace it with a three-step size selector (default / large / extra-large) with a live preview sentence so users see the effect before committing. Also ensure the teal-on-ivory contrast ratio meets WCAG AA at every size — teal can fail AA depending on the exact hex.

### 5. Differentiate the starter and existing-user paths more visibly
Combining both paths "under one flow" sounds efficient but risks confusing both groups. Add a single fork screen after "Start my check" — two clearly labeled cards ("I'm new to supplements" / "I already take supplements") — that adjusts downstream question phrasing and skips irrelevant screens for each group. This costs one extra tap but meaningfully reduces friction and irrelevant questions.

---

## Deceptive or unsafe behavior check

| Area | Verdict |
|---|---|
| **No auto-dosing / no deficiency diagnosis** | Safe. Correctly scoped. |
| **"Expandable reasons and sources"** | Safe only if sources are real citations (journal, org), not fabricated. Plan should state that any source shown must be a verified reference, never LLM-generated text dressed as a citation. |
| **Camera/library with "no extraction until OCR connected"** | Potentially confusing. If users can photograph a label but nothing happens with the image, the camera button creates a false expectation. Either hide the camera entry point entirely until OCR is functional, or label it unambiguously as "Save photo for your reference — no data will be read from it." Showing the button without clear status is a mild dark pattern. |
| **Intake totals and duplicate-ingredient checks** | Safe as described (arithmetic only, user-confirmed data), but the app must not present these totals in a way that implies safety evaluation. A screen titled "Your daily totals" is fine; "Your safe daily totals" is not. |
| **Freemium pricing concept** | No fake checkout is good. Ensure any "Pro" or gated feature is clearly marked *before* a user invests time in a flow that dead-ends at a paywall. Locking results behind a paywall after completing the check would be deceptive. |
| **In-memory-only storage** | Honest for demo, but must not be presented as a privacy *feature* in production. Users could mistake "data clears on reload" for strong privacy when it's actually a limitation. Label it as a demo constraint, not a benefit. |

---

## One additional note

The plan doesn't mention accessibility beyond text size. For the stated audience (18+, no upper limit), you should also plan for screen-reader labels on all tappable elements, sufficient touch-target sizes (48×48 dp minimum), and reduced-motion support. These aren't optional polish — they're baseline requirements for a health-adjacent app targeting older adults.

## Applied changes

- Pause and resume in the current session.
- Show assessment limits on the screening question before completion.
- Explicit confirmation of quantities before adding a product.
- Three text sizes with a live sentence preview.
- Beginner and existing-user choices at the first step.
- Photo entry labelled as reference only, with no automatic reading.
