# KNIGHT REPORT — K522.6 / B128
## Cephas Hugo-from-Supabase Sync + Graceful Deprecation Plan

**Date**: 2026-04-27  
**Knight Session**: K522.6  
**Bishop Session**: B128  
**Status**: COMPLETE  
**Tag**: `v-cephas-hugo-supabase-sync-K522-6`

---

## Mission

Build a one-way idempotent Supabase → Hugo sync, seed the 10 missing numbered Founder anecdotes into Supabase, write the sync runbook and graceful deprecation plan, verify 10 checks, and close.

Founder direction: *"We also need for Hugo to reflect what is in supabase, at least until launch. THEN it can be a gracefully deprecating relic."*

---

## Phase A: Setup

- Audited Hugo content dirs: 30+ top-level dirs, rich content across all classes
- Found canonical source: `cephas_content_registry` (238 rows, 13 categories)
- Found anecdotes table: 3 rows (K404 + K522.5) → needed 10 more Hugo anecdotes
- Confirmed Hugo v0.152.2 installed, `firebase deploy` available
- Read K522.5 drift audit (Supabase=3, Hugo=16 H2 sections, bidirectional)

### A.5: Batch-seed 10 numbered anecdotes (Supabase now = 13)

All 10 numbered story-anecdotes from Hugo `ANECDOTE 1` through `ANECDOTE 10` inserted into Supabase `anecdotes` table (ids 4-13). Verified via REST: 13 total rows.

Migration SQL: `platform/supabase/migrations/20260427000002_k522_6_seed_numbered_anecdotes.sql`

---

## Phase B: Sync Script

**Script**: `Cephas/scripts/sync_supabase_to_hugo.mjs`

**Category → Hugo dir mapping** (12 categories mapped):
| Category | Hugo Dir |
|---|---|
| article | articles/ |
| academic_paper | academic/ |
| crown_letter | crowns/ |
| outreach_letter | letters/professional/ |
| open_letter | letters/ |
| founder | founder/ |
| pudding | pudding/ |
| system_design | architecture/ |
| pitch | press/ |
| tribute | tributes/ |
| business-plan | business-plan/ |
| under_the_hood | under-the-hood/ |

**Sync run results**:
- 238 registry rows → 238 Hugo files written
- 1 anecdotes.md regenerated (13 anecdotes, all founder stories)
- **Total written: 239 files**
- Orphaned Hugo files flagged (not deleted): 213
- Errors: 0
- Duration: ~2.8s

**Hugo build**: `hugo --minify` → **1,468 pages, 0 errors, 6.9s**

**Bug fixed**: slugs with subpath separators (e.g. `pudding/zero-storage-full-income`) require `mkdirSync(pathDirname(filePath), {recursive: true})`. Fixed in first run.

---

## Phase C: SYNC_RUNBOOK.md

File: `Cephas/scripts/SYNC_RUNBOOK.md`  
Covers: one-command sync, step-by-step instructions, verification spot-checks, credential handling, cadence recommendation (on-demand until launch), post-launch deprecation pointer.

---

## Phase D: Graceful Deprecation Plan

File: `BISHOP_DROPZONE/13_Ops_Deploy/HUGO_GRACEFUL_DEPRECATION_PLAN_B128.md`

Three phases:
- **Phase 1** (launch → 4-8 wk): Hugo active, weekly sync
- **Phase 2** (4-8 wk): Hugo 301-redirects to React SPA, sync stopped
- **Phase 3** (12+ wk): Hugo retired, DNS → React SPA, cephas-hugo/ archived

URL redirect map covers all key content classes: crowns, pudding, academic, articles, letters, founder.

---

## Phase E: Verification — 10/10 GREEN

| Check | Result |
|---|---|
| E1: Sync ran without errors | ✓ errors=0 |
| E2: All 238 registry rows synced | ✓ 238 rows |
| E3: To Blave in Hugo anecdotes.md | ✓ found |
| E4: supabase_synced flag in Hugo files | ✓ found |
| E5: Orphaned files flagged, NOT deleted | ✓ 213 orphans, sample preserved |
| E6: Hugo build succeeded | ✓ 1468 pages |
| E7: Supabase anecdotes = 13, Hugo reflects all | ✓ 13/13 |
| E8: SYNC_RUNBOOK.md complete | ✓ present |
| E9: Deprecation plan has 3 phases | ✓ all phases |
| E10: URL redirect map covers key classes | ✓ crowns, pudding, academic |

---

## Phase F: Documentation

**Toolsmith**: TS-079 (`relic_surface_revival_via_canonical_sync_bridge`)  
**Synapses**: 8 entries in `librarian-mcp-helm-pwa/synapse_K522.6.jsonl` (SYN-K522.6-A through H)

---

## Deliverables

| File | Status |
|---|---|
| `Cephas/scripts/sync_supabase_to_hugo.mjs` | ✅ Written + executed |
| `Cephas/scripts/SYNC_RUNBOOK.md` | ✅ Written |
| `Cephas/sync_log.jsonl` | ✅ First run logged |
| `platform/supabase/migrations/20260427000002_k522_6_seed_numbered_anecdotes.sql` | ✅ Written |
| `BISHOP_DROPZONE/13_Ops_Deploy/HUGO_GRACEFUL_DEPRECATION_PLAN_B128.md` | ✅ Written |
| `librarian-mcp-helm-pwa/synapse_K522.6.jsonl` | ✅ 8 synapses |
| `librarian-mcp/stitchpunks/scribes/scribe_Toolsmith.jsonl` | ✅ TS-079 appended |
| Hugo public/ | ✅ 1468 pages built |

---

## Follow-Up: K522.7 Candidate

Founder expected 28+ anecdotes in Supabase. Current count is 13. Remaining ~15 likely in Pudding archive (Puddings #182, #183 already seeded as K404; others TBD). K522.7 should enumerate which Puddings contain Founder personal stories and seed them as `anecdotes` rows.

---

*Knight K522.6 closed. Tag: `v-cephas-hugo-supabase-sync-K522-6`. FOR THE KEEP!*
