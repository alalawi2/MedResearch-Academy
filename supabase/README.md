# MedResearch Academy — Database

Unified Supabase schema for all Academy research studies.

## First-time setup

Run the files **in order** in the Supabase SQL editor:

1. **`schema.sql`** — creates all tables, enums, functions, RLS policies, and the analysis view. Idempotent.
2. **`seed.sql`** — inserts the study registry rows (Resident Burnout, Parenthood, AI Rota, EMAN). Safe to re-run.

## Architecture

One Supabase project holds data for **multiple studies**. Every data row is
scoped to a `study_id` and every RLS policy filters by `(study_id + role)`.

- `studies` — the research portfolio
- `staff` — dashboard users
- `staff_study_roles` — per-study role assignments (a staff member can be
  `super_admin` in one study and `research_assistant` in another)
- `residents`, `rotation_blocks`, `mbi_responses`, `promis29_responses`,
  `whoop_pulls` — data tables, each keyed to `study_id`
- `enrollment_events`, `audit_log` — compliance tables

## Roles

| Role                  | Data access                        | Write access                 |
| --------------------- | ---------------------------------- | ---------------------------- |
| `super_admin`         | All data in studies they belong to | Everything including delete  |
| `research_admin`      | All data                           | Insert/update                |
| `site_coordinator`    | Only residents at their site       | Insert/update for own site   |
| `research_assistant`  | All data (view)                    | Data entry only, no delete   |
| `statistician`        | All data (view, de-identified)     | Read-only                    |

## Analysis view

```sql
select * from v_block_measures where study_slug = 'resident-burnout';
```

Returns one row per resident per block with demographics, rotation info,
MBI, PROMIS-29, and WHOOP measures pre-joined for statistical analysis.
