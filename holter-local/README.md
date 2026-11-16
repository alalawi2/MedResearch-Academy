# Holter research reviewer pilot

This is a separate on-premises service for the Academy Holter review page. It reuses Academy Supabase authentication only. It never writes Holter cases, ratings, revisions, or verdicts into Supabase, Vercel, or GitHub. The existing burnout, thalassemia and other study tables and access rules are unchanged.

## Roles and workflow

Membership is an explicit local mapping of verified Supabase user UUIDs to `reviewer` or `owner`. A site-wide administrator or member of another study has no implicit Holter access. Passwords are handled by the existing Academy authentication service, not this service. The assigned institutional account and owner account are documented in the local pilot handover, not committed configuration.

Reviewers see 16 labelled XML measurements, one blinded generated report and the historical reference. There are 60 assessments from the existing blinded review round (20 records, three candidate systems). This is not a new independent test set. Neither the arm mapping nor patient identifiers are imported into the API database. The original private blinding key remains outside this repository.

Draft ratings, notes and suggested corrections autosave after a pause. Updates use version checks so another tab cannot silently overwrite them. A failed save leaves the draft visible and prevents case navigation; closing the browser before a successful save can still lose that draft. An assessment is locked on explicit submission. A final research verdict requires all assessments and is also locked. This is not an electronic clinical signature or clearance for autonomous reporting.

The owner sees submitted and draft progress and the saved revision history. Every successful save appends a timestamped audit record. Database triggers reject audit updates/deletes through ordinary SQL. These controls do not constitute cryptographic tamper evidence against the laptop administrator.

## Run locally

Create a dedicated Python environment and install `requirements.txt`. Keep `config.json` and the SQLite database in a local application-data directory outside Git and any synced cloud drive. Restrict the directory to its owner. Configuration keys:

- `database`: absolute SQLite path
- `supabase_url` and `supabase_anon_key`: existing Academy public authentication configuration
- `members`: exact auth UUID-to-role mapping
- `origins`: exact Academy origin(s); include development origins only for development

Use `python service.py --config /absolute/local/config.json`. The service binds to 127.0.0.1:8768. It validates each bearer token using the Academy authentication server; only tokens and account metadata go to that server. Clinical content is not included in authentication requests. No access request bodies or bearer tokens are logged.

Import the existing round once with `import_cases.py --inputs ... --key ... --database ...`. It refuses to replace an existing round. Never place those inputs in this repository or a deployment artifact.

Set the frontend's `VITE_HOLTER_API_URL` to the HTTPS endpoint. The web build contains only the interface and connection address. A Cloudflare pilot tunnel relays HTTPS requests to the laptop. Cloudflare terminates TLS and therefore processes traffic in transit: this is local storage, not a promise that no third party processes traffic. Do not use the tunnel if the approved data-handling scope forbids this. No training or external AI analysis occurs here.

A quick tunnel has no uptime guarantee and its address changes when restarted. Use a named managed tunnel or hospital-approved VPN endpoint for sustained use. The initial pilot needs the laptop awake, connected and the tunnel process running. Do not describe this pilot as production availability.

## Verification and export

`python -m unittest discover -s holter-local -p 'test_*.py'` runs the API safety and persistence checks with synthetic data. `node tests/holter-review-e2e.mjs` runs synthetic browser tests against a Vite development server in `--mode holter`, with authentication and API calls mocked. No real reviewer ratings are written by these tests.

`python export_reviews.py --config /absolute/config.json --output /absolute/local/export-folder` creates a JSON history, CSV ratings and consistent SQLite backup. Keep exports local. Source reports are omitted from JSON/CSV; the SQLite backup contains the entire local database. Back up only to an approved encrypted local device. Exported CSV uses only enumerated ratings/IDs, not free-text notes.

The approval letter located in the study correspondence is MREC #4017 / SQU-EC179/2026, titled “Electrocardiography-Based Artificial-Intelligence Modelling for Atrial Fibrillation Detection and Prediction.” Its relationship to the report-validation pilot and remote review arrangements should be confirmed by the study PI; the public card makes no claim of separate clinical approval.
