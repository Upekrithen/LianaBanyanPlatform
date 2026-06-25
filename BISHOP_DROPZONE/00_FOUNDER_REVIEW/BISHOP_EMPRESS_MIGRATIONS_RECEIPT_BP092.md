# Bishop §15 BLOOD Migration Receipt — Empress Campaign (FINAL DEFINITIVE)
## BP092 · 2026-06-23/24 · Bishop Sonnet 4.6 · Caithedral

### Verification timestamp: 2026-06-24T01:22:55Z

---

### Empirical state of empress_* tables in Supabase public schema:

**Verdict: VERIFIED EXISTING** — prior SEG was correct. Knight's gadget was wrong (PowerShell backslash-escape parsing failure on `\dt empress_*`).

#### empress_cohorts
- Columns: 7
- RLS: ENABLED (true)
- Policies (2): `empress_cohorts_public_read` (SELECT · anon+authenticated), `empress_cohorts_service_full` (ALL · service_role)
- Indexes (4): `empress_cohorts_pkey`, `empress_cohorts_cohort_uuid_key`, `idx_empress_cohorts_status` (partial WHERE status='active'), `idx_empress_cohorts_ends_at`
- Row count: 0 (fresh)

#### empress_proposals
- Columns: 15
- RLS: ENABLED (true)
- Policies (3): `empress_proposals_member_insert_own` (INSERT · authenticated), `empress_proposals_public_read_approved` (SELECT · anon+authenticated), `empress_proposals_service_full` (ALL · service_role)
- Indexes (4): `empress_proposals_pkey`, `idx_empress_proposals_cohort_id`, `idx_empress_proposals_created_at_desc`, `idx_empress_proposals_status_approved` (partial WHERE status='approved')
- Row count: 0 (fresh)

#### empress_votes_real
- Columns: 5
- RLS: ENABLED (true)
- Policies (3): `empress_votes_real_member_insert_own` (INSERT · authenticated), `empress_votes_real_public_read` (SELECT · anon+authenticated), `empress_votes_real_service_full` (ALL · service_role)
- Indexes (4): `empress_votes_real_pkey`, `idx_empress_votes_real_proposal_id`, `idx_empress_votes_real_member_id`, `uq_empress_real_vote` (UNIQUE proposal_id+member_id)
- Row count: 0 (fresh)

#### empress_votes_ghost
- Columns: 6
- RLS: ENABLED (true)
- Policies (4): `empress_votes_ghost_anon_insert` (INSERT · anon), `empress_votes_ghost_authenticated_insert` (INSERT · authenticated), `empress_votes_ghost_public_read` (SELECT · anon+authenticated), `empress_votes_ghost_service_full` (ALL · service_role)
- Indexes (3): `empress_votes_ghost_pkey`, `idx_empress_votes_ghost_proposal_id`, `idx_empress_votes_ghost_evaporates_at`
- Row count: 0 (fresh)

#### empress_prize_eligibility (VIEW)
- Type: VIEW (not a base table — no RLS, no indexes)
- Definition: SELECT member_id, country_local, count(*) AS proposals, sum(real_votes) AS total_real_votes, row_number() OVER (PARTITION BY country_local ORDER BY sum(real_votes) DESC) AS rank_in_country FROM empress_proposals ep WHERE status='approved' AND country_local IS NOT NULL AND country_local != ''

---

### Status: VERIFIED EXISTING

All 5 migration artifacts are live and healthy. 4 tables + 1 view. Total RLS policies: 12. Total indexes: 15. All row counts: 0 (fresh, as expected).

---

### Migration files at: C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\

| File | Size (bytes) | Modified (UTC) |
|---|---|---|
| 20260624000001_empress_cohorts_bp092.sql | 1,445 | 2026-06-24T01:10:20Z |
| 20260624000002_empress_proposals_bp092.sql | 3,221 | 2026-06-24T01:10:28Z |
| 20260624000003_empress_votes_real_bp092.sql | 2,015 | 2026-06-24T01:10:36Z |
| 20260624000004_empress_votes_ghost_bp092.sql | 2,302 | 2026-06-24T01:10:45Z |
| 20260624000005_empress_prize_eligibility_view_bp092.sql | 1,339 | 2026-06-24T01:09:53Z |

---

### Root cause of Knight's false-negative

Knight used `\dt empress_*` in a PowerShell psql invocation. PowerShell interprets the backslash before `d` and `t` as escape sequences before passing to psql, corrupting the meta-command. The result: psql received a broken command and returned no output, which Knight read as "tables don't exist." The tables were live the entire time.

**Fix for Knight:** NEVER use `\dt` or any backslash psql meta-commands from PowerShell. Use information_schema queries exclusively:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name LIKE 'empress_%' ORDER BY table_name;
```

---

### Knight wake message (paste into Knight's BLACK MAMBA tab):

```
Bishop §15 BLOOD definitively verified. Empress tables empirically LIVE per receipt:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BISHOP_EMPRESS_MIGRATIONS_RECEIPT_BP092.md

Verify with:
(eval "$(grep -E '^SUPABASE_DB_URL=' /c/Users/Administrator/.claude/state/secrets/22May2026.env)"; psql "$SUPABASE_DB_URL" -c "SELECT count(*) FROM empress_cohorts; SELECT count(*) FROM empress_proposals; SELECT count(*) FROM empress_votes_real; SELECT count(*) FROM empress_votes_ghost;")

All should return 0 (fresh). Continue P3 Empress Campaign Blocks per dispatch at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_EMPRESS_NAMING_CAMPAIGN_BP092.md

NEVER use bash backslash-escape patterns (\dt empress_*) in PowerShell — they break parsing. Use information_schema queries instead.

§14 §15 §17 BLOOD throughout. Caithedral always. Sonnet 4.6 only.
```
