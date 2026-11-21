# Claude release review — November 22, 2026

Actual Claude CLI review completed using the public candidate source only, with tools and MCP access disabled. Raw response is retained locally in build-review/v06-claude-review.json. It was an engineering/UX review, not clinical validation. Initial attempt failed due an inherited MCP tool schema; a strict empty MCP configuration resolved it. No false claim that the failed call performed a review.

## Independent adjudication

- `.om` domain warning: false positive. The existing Academy production domain and public contact use medresearch-academy.om. Verify deployed privacy/support routes after merge.
- FAQ indices: the 100-entry authored bank is already enforced by tests. Added a defensive filter anyway so a later edit cannot turn an absent featured item into a crash.
- Reading scale/reset race: retaining reading size is intentional accessibility behavior. An empty snapshot with reading preferences after successful erasure is expected and contains no old health entries. Ordered clear/write tests verify old records are not restored. Added explicit reading-preference wording in clear confirmation.
- Unknown profile keys: the validator reconstructs a profile from known keys, so unknown keys do not enter restored state. The default profile currently does not include sexReference. It is checked separately. No suggested broad cast copied into runtime behavior.
- Partial cleanup: failures already propagate to the user rather than promising erasure. Added a global save/clear-error notice so failures are visible outside Your space; tests cover erasure failure and retry.
- Request abort timing: there is no await between abort/null assignment and new request setup, and request identity guards prevent stale finalizers clearing another request. Newly identified stale-answer behavior had already been fixed before review. No demonstrated additional race from the review.
- Session chat wording: clarified memory-only history versus persistent routine storage, while retaining disclosure of up to two exchanges sent with optional online questions.
- Empty FAQ filter: added a helpful empty state and show-more only when filtered results remain.
- Considering status: added a short explanation at the toggle; these products remain excluded from intake totals.
- Long form suggestion: methods render conditionally; photo, search and manual inputs do not all render simultaneously as the review suggested. Existing compact ingredient review and optional details remain.

A further independent release check found silent timeout handling in the automatic product search and the need for explicit typed-search consent. Both were corrected. No ranking, medical approval or revenue claim is inferred from Claude's review.

## Final source review

A second actual Claude CLI review inspected feedback HTTP/RPC storage, the migration, privacy copy, encrypted state and public-page export. Raw response: build-review/v06-final-claude-review.json. Its two claimed defects were independently rejected:

- `.om` is the correct published Academy domain, not a `.com` typo. DNS MX records were checked and point to Google mail servers. No email was sent and mailbox-level delivery is not claimed as tested.
- Daily deletion of records older than 30 days produces a normal upper retention bound below 31 days. The UI promise is “up to 31 days.” Changing the interval to 31 days would extend that bound and would be incorrect.

The reviewer also examined and explicitly withdrew a suspected reset race: state batching plus the serialized vault clear/write queue make the empty post-clear snapshot intentional. Its global-lock and absent-Origin observations were non-blocking: report volume is bounded, the lock makes limits atomic, and native requests do not carry browser Origin headers. No clinical approval is inferred from either review.

A compiled Android permission audit found an unused framework overlay permission. The release configuration now blocks SYSTEM_ALERT_WINDOW; the final Android store binary must be rebuilt and checked for its absence. Broad READ_MEDIA_IMAGES/VIDEO and RECORD_AUDIO were already absent in the inspected candidate.
