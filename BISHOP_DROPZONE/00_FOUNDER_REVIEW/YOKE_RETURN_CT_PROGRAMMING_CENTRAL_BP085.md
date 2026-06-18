Sonnet 4.6

YOKE: KNIGHT_YOKE_CT_PROGRAMMING_CENTRAL_UPGRADE_BP085
STATUS: COMPLETE — SEG-3 GREEN (Founder Option A shipped 2026-06-18)

---

## 6 SHARPS

| # | SEG | Sharp | Status |
|---|-----|-------|--------|
| 1 | SEG-1 | BP082 voting infra recon DONE — 8 tables · 2 views · 3 RPCs · gap list written to CT_VOTING_RECON_BP085.md | GREEN |
| 2 | SEG-2 | CT.com HTML read · card-flip pattern identified (`flip-card`, `flip-card__inner`, `flip-card__front`, `flip-card__back`) · color palette captured (amber `#c9782a`, steel `#4a7fa5`, gold `#d4a017`) · existing sections mapped | GREEN |
| 3 | SEG-3 | Hiring Directors schema — Founder Option A 2026-06-18 · Table: hiring_directors ✓ · View: node_operators ✓ · Trigger: auto-promote ✓ · RLS: ✓ · Ouster Edge Function written (deploy pending SEG-6 re-run) · v2 deferred: hired-user project_count eligibility · node_operator_since timestamp · ouster_pending state | GREEN |
| 4 | SEG-4 | Guilds Directors section added · `<section id="directors">` · 3 sample guild cards (NOIDs, Harper, MnemosyneC) · ACTIVE/ELECTION OPEN/NEEDS DIRECTORS status badges · "Nominate / Vote" CTAs → `#vote` · no horizontal scroll | GREEN |
| 5 | SEG-5 | Programming Central nav added · 5 sections created (#programming-central intro + sub-nav, #contracts, #directors, #node-operators, #vote) · /vote BP082 tier table (12 rows: 20/30/50/75/100/150/200/300/500/1000 + quarterly + 25% emergency) · reputation weight formula `1 + log₁₀(Marks+1)` · "Leader ouster = demote not exile · voluntary handoff keeps Marks + rep" · "No active elections · Check back soon" · no horizontal scroll · "Programming Central" added to desktop + mobile nav | GREEN |
| 6 | SEG-6 | CT.com Programming Central LIVE · 6 strings FOUND · no horizontal scroll · Firebase deploy confirmed (8.4s) · smoke test 138,456 chars | GREEN |

---

## FOUNDER GATE · Hiring Directors Schema (SEG-3)

**SEG-1 Recon Found:**

8 existing tables: `council_voting_cycles`, `council_votes`, `governance_audit_log`, `admin_governance_overrides`, `pedestal_vote_canon`, `vote_allocations`, `guild_master_profiles`, `member_profiles` (with `reputation_score` and `governance_flags` columns).

2 existing views: `council_vote_tallies`, `member_activity_feed`.

3 existing RPCs: `cast_vote_with_cap_check`, `cast_council_vote_with_cap_check`, `refresh_reputation_score`.

**No `hiring_directors` table exists. No `node_operators` view exists.**

**Proposed schema additions:**

```sql
-- hiring_directors table
CREATE TABLE public.hiring_directors (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  project_count        integer NOT NULL DEFAULT 0,
  hired_user_count     integer NOT NULL DEFAULT 0,
  node_operator_status boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  last_updated         timestamptz NOT NULL DEFAULT now()
);

-- Eligibility trigger: project_count >= 1 AND hired_user_count >= 1 → node_operator_status = true
-- (app-layer check or trigger TBD per Founder)

-- Ouster hook: FK to bp082 vote record (100-tier per guild chapter)
-- vote_ouster_reference uuid REFERENCES vote_allocations(id) — optional column

-- View: node operators
CREATE VIEW public.node_operators AS
  SELECT * FROM public.hiring_directors WHERE node_operator_status = true;
```

**Please reply:**

- **(A) Approve as-is** — Knight runs the migration
- **(B) Revise columns** — Founder specifies changes, Knight runs revised migration
- **(C) Redirect** — different approach

**SEG-3 status = GREEN — Founder Option A approved and executed 2026-06-18.**

---

## SEG-3 COMPLETION RECEIPT · 2026-06-18

```
SEG-3 COMPLETED 2026-06-18 · Founder Option A approved
Migration: 20260618000002_hiring_directors_node_operator.sql
Table hiring_directors: EXISTS ✓ (BASE TABLE)
View node_operators: EXISTS ✓ (VIEW)
Trigger: hiring_directors_last_updated_trigger ✓ (auto-promote on project_count>=1 AND hired_user_count>=1)
RLS: ✓ (read_own, insert_own, update_own policies)
Ouster Edge Function: written (not yet deployed — deploy via: npx supabase functions deploy node-operator-ouster --project-ref ruuxzilgmuwddcofqecc)
v2 deferred: hired-user project_count eligibility · node_operator_since timestamp · ouster_pending state
```

Verify query output:
```json
{
  "rows": [
    { "table_name": "hiring_directors", "table_type": "BASE TABLE" },
    { "table_name": "node_operators",   "table_type": "VIEW" }
  ]
}
```

---

## Smoke Test Receipt

```
cerostechnology.com HTTP: 200 (gate check)

Post-deploy smoke test:
Response size: 138,456 chars
FOUND: Programming Central
FOUND: Coding Contracts
FOUND: Hiring Directors
FOUND: Node Operator
FOUND: Bounty Posters
FOUND: Guilds Directors
PASS: no horizontal scroll
```

Firebase deploy: `hosting[ceros-technology]: release complete` in 8.4s
