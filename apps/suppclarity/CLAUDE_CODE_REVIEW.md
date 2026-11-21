# Independent implementation review

Claude Opus 4.6 reviewed implementation source on 21 November 2026, without browsing or executing the app. Findings below require verification and are not clinical validation.

## Prioritized Issues

### P0 — Bugs / Broken Behavior

1. **Typo in About page URL** — `about.tsx:25`
   `"https://medresearch-academy.om/active-research/suppclarity"` — domain is `.om` (Oman ccTLD), almost certainly should be `.com`. Users tapping "Visit the research project" will hit a dead link or wrong site.

2. **Smart quote breaks JSX on web** — `(tabs)/index.tsx:12`
   The string `'A clear view of what you've entered…'` uses a **curly apostrophe** (`'`). Depending on the bundler's source encoding handling this can cause a build failure or render as a mojibake character. Use `{"\u2019"}` or a straight apostrophe.

3. **`Copy` fontSize logic is self-defeating** — `ui.tsx:34-50`
   `finalSize` is computed from `extra.fontSize ?? sizes[kind]`, then the last style object applies `fontSize: finalSize * scale`. But the first style object already sets `fontSize: sizes[kind] * scale`. Because both paths multiply by `scale`, any caller that passes a custom `fontSize` (e.g. `fontSize: 21` on the home screen) gets `21 * scale`, which is correct — but callers that do **not** pass a custom fontSize get `sizes[kind] * scale` applied **twice** (once from the first object, overwritten by the third). The net result is correct only by accident; the triple-spread is fragile and the `lineHeight` calculation in the third object can diverge from the actual fontSize when a caller passes a custom `lineHeight`. Simplify to a single computed style.

4. **`validAge` rejects ages 9–17 but also rejects valid single-digit edge-case `"18"` only by luck** — `domain.ts:30`
   The regex `/^\d{2,3}$/` requires 2–3 digits, so it rejects `"018"` (3-digit, passes) while also allowing `"999"`. There is no upper bound. An age of `999` passes validation. Add `Number(age) <= 120` or similar cap.

5. **Overlap text grammar bug** — `domain.ts:103`
   When multiple nutrients overlap, the sentence reads *"Vitamin D, Magnesium appears in multiple entries"* — `appears` should be `appear`. Use `overlap.length === 1 ? 'appears' : 'appear'`.

### P1 — Routing / Navigation

6. **Vercel rewrite doesn't cover tab sub-routes** — `vercel.json`
   The pattern `:screen(check|product|result|…|products|account)` is flat. Expo Router with `(tabs)/products` and `(tabs)/account` generates paths like `/suppclarity/(tabs)/products` or `/suppclarity/products` depending on web config. If the generated client-side route includes the group segment, a hard refresh will 404 because the rewrite doesn't match `(tabs)/products`. Verify the actual produced paths and add a catch-all like `/suppclarity/:path*` → `index.html`, or use a single `"/suppclarity/(.*)"` rewrite.

7. **`router.replace("/products")` from product entry lands on the tab screen only if routing resolves `(tabs)/products`** — `product.tsx:74`
   `router.replace("/products")` after adding a product may not resolve to `(tabs)/products` in all Expo Router configurations. If the tab group requires an explicit segment, the user could get a "route not found" flash. Test on web specifically.

8. **Back button on result/check can lose state** — `result.tsx`
   `Page` has `back` which calls `router.back()`. If the user deep-linked to `/result`, `router.canGoBack()` is false and `router.replace("/")` fires, discarding in-memory profile/product state silently (no warning).

### P2 — Calculation Integrity

9. **`unitsPerServing` can be fractional** — `domain.ts:36`
   `validProduct` requires `n > 0` and `Number.isFinite(n)` but doesn't require `unitsPerServing` or `unitsTaken` to be integers. While `daysPerWeek` is checked for `Number.isInteger`, a user entering `1.5` for units-per-serving is accepted. The calculation page describes "units" as a whole count. Either enforce integers or update the copy.

10. **Division by zero is possible if validation is bypassed** — `domain.ts:71`
    `normalized * p.unitsTaken / p.unitsPerServing` — if `unitsPerServing` is `0`, this produces `Infinity`. `validProduct` guards against it, but `totals()` throws on invalid products only after the division could theoretically be reached if someone mutates state. Defensive: check before dividing.

### P3 — Accessibility

11. **Progress bar has no accessible value** — `check.tsx:52-61`
    The progress `<View>` has `accessibilityLabel` describing the question number, but no `accessibilityRole="progressbar"` or `accessibilityValue`. Screen readers won't announce progress changes.

12. **Radio groups lack `accessibilityRole="radiogroup"`** — `check.tsx`, `product.tsx`
    Individual options have `accessibilityRole="radio"` but the containing `<View>` is not marked as a `radiogroup`, so screen readers can't convey group boundaries.

13. **Error text in product.tsx is not announced** — `product.tsx:149`
    The error `<Copy>` at the bottom lacks `accessibilityRole="alert"`, unlike the similar pattern in `check.tsx:93`. Add it so screen reader users are notified.

14. **Tab bar labels are small and lack scaling** — `(tabs)/_layout.tsx:17`
    `tabBarLabelStyle: { fontSize: 14 }` is hardcoded and not affected by the user's `scale` preference from the store. Users who chose "Extra large" text still see default-sized tab labels.

### P4 — UI State / UX

15. **`reset()` doesn't reset `scale`** — `store.tsx:19`
    "Clear session" resets profile, products, and step, but preserves `scale`. This is probably intentional, but should be explicit — if a user expects "clear session" to restore defaults, the text size stays changed with no indication.

16. **No input sanitization on product name** — `product.tsx`
    `name` is trimmed only at save time (`name.trim()`), but `name.trim().length <= 100` is validated on the untrimmed value in `validProduct`. A name of 101 spaces + 1 char (102 chars) would fail `maxLength={100}` on the `TextInput`, but the validation checks `p.name.trim().length` against the pre-trim value because `p.name` is set from raw `name` state, not `name.trim()`. Actually, re-reading: `validProduct` checks `p.name.trim().length <= 100` which is fine. But `Field` has `maxLength={100}` on the input — a name of exactly 100 chars with trailing space would be blocked by `maxLength` before the user can even type it. Minor mismatch.

17. **Photo state leaks between entries** — `product.tsx`
    If a user adds a product, is navigated to `/products`, then hits "Add a product" again, `product.tsx` remounts with fresh state — this is fine with Expo Router. But if the route is cached (e.g., `router.push` reuses component), the old photo URI could persist. Verify unmount behavior on web.

### P5 — Clinical Copy / Claims

18. **IU-to-mcg conversion statement** — `calculation.tsx:17`
    "40 IU equals 1 mcg" is correct for vitamin D (1 mcg = 40 IU). The code at `domain.ts:70` does `p.amount / 40`, which is also correct. No issue here, just confirming.

19. **No misleading clinical claims detected** — The copy consistently disclaims assessment, doesn't promise deficiency diagnosis, and labels everything as a preview. The `report()` function returns informational routing text, not clinical recommendations. This is clean.

---

### Summary of recommended fixes by effort

| Fix | Effort |
|-----|--------|
| Fix `.om` → `.com` typo | 1 min |
| Fix smart quote | 1 min |
| Fix `appears`/`appear` grammar | 2 min |
| Add age upper bound | 2 min |
| Broaden Vercel SPA rewrite to catch-all | 5 min |
| Add `accessibilityRole="progressbar"` + value | 5 min |
| Add `accessibilityRole="alert"` to product error | 1 min |
| Simplify `Copy` fontSize/lineHeight cascade | 15 min |
| Scale tab bar labels with user preference | 10 min |

## Verified response

Applied the multi-nutrient grammar correction, progressbar semantics, questionnaire radio grouping and reading-size support for tab labels. Custom text overrides scale correctly; later style objects replace earlier ones rather than multiply values again. Decorative icons are hidden from assistive technology. Reading preference remains when health entries are cleared, now explained explicitly.

Several suggested fixes were incorrect and were not adopted: the Academy's actual domain is `.om`, not `.com`; Unicode apostrophes compiled correctly; route group names are omitted from the observed public web paths; replacing a route does not reset the root provider; product errors already have the alert role; and `totals` validates before dividing. Fractional quantities are retained for measured servings, with clarified instructions. An arbitrary upper age cutoff was not introduced. The finite numeric age field is a prototype input, not a clinical eligibility rule.

Web flows and quantities are tested in the actual preview. The review's assertion that there are no misleading clinical claims is an AI opinion and is not clinical or regulatory approval.
