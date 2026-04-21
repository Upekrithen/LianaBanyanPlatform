# Knight Session K413 — Canonical Count Reconciliation

**Author:** Bishop B100
**Date:** 2026-04-12
**Priority:** Medium — not blocking any deploy, but keeps Librarian/MCP tools accurate
**Scope:** 1 migration + 1 Librarian rebuild + 1 YAML update + verification
**Estimated Knight time:** ~30 minutes
**Dependencies:** K410 deploy bundle must be live (it is — commit `6fab95c`)

---

## Problem

Two authoritative numbers exist for innovation count:
- `canonical_values.yaml` (K410): **2,250 innovations, 216 Crown Jewels**
- `INNOVATION_RENUMBERING_LOG_B098.md` (Bishop B098 close): **2,261 innovations, ~221-237 CJ**

The gap: 11 innovations (#2251–#2261) were assigned by Bishop in the B098 renumbering log but never registered in a Knight migration. The Librarian's innovation scanner reads from migration SQL and content metadata, not from dropzone A&A formals, so it doesn't see them.

Additionally, innovations #2244, #2245, #2248, #2249, #2250 may have been drafted in Bishop A&A formals but may not be in the production innovation registry table. Verify before backfilling.

## What to build

### Step 1: Backfill migration

Create `platform/supabase/migrations/[timestamp]_k413_canonical_backfill.sql`

The migration should INSERT the following innovations into the `platform_canonical` table (or whichever table the Librarian's innovation scanner reads from — check the existing K410 migration for the correct table name and column structure):

**B098 renumbered innovations (B093 orphans):**
| # | Title | CJ | Source |
|---|---|---|---|
| 2251 | Cooperative Member Verification Protocol | NO | AA_FORMAL_2251 |
| 2252 | Distributed Governance Checkpoint | NO | AA_FORMAL_2252 |
| 2253 | Patronage Volume Attestation | NO | AA_FORMAL_2253 |
| 2254 | Cross-Cooperative License Portability | YES | AA_FORMAL_2254 |
| 2255 | Bylaw Amendment Ratification Pipeline | NO | AA_FORMAL_2255 |

**B098 renumbered innovations (B096 promoted stubs):**
| # | Title | CJ | Source |
|---|---|---|---|
| 2256 | Hemispheric Dispatch Grid Validator | NO | AA_FORMAL_2256 |
| 2257 | The Glove (MoneyPenny Email Channel) | NO | AA_FORMAL_2257 |
| 2258 | Cascade Failure Isolation Protocol | YES | AA_FORMAL_2258 |
| 2259 | Multi-Agent Session Handoff Standard | NO | AA_FORMAL_2259 |
| 2260 | Cooperative Defensive Patent Pledge | YES | AA_FORMAL_2260 |
| 2261 | ROM-First Algorithmic Efficiency Mandate | YES | AA_FORMAL_2261 |

**Also verify these exist in the registry (may already be there from earlier migrations):**
| # | Title | CJ | Source |
|---|---|---|---|
| 2244 | IP Revenue Waterfall Constitutional Allocation | YES | AA_FORMAL_2244 |
| 2245 | Patron-Member Proximity Matching | YES | AA_FORMAL_2245 |
| 2248 | Hemispheric Protocol | YES | AA_FORMAL_2248 |
| 2249 | ROM-First AI Inference Cost Architecture | YES | AA_FORMAL_2249 |
| 2250 | Algorithmic Efficiency Mandate (Legislative) | YES | AA_FORMAL_2250 |

**Also add B099 innovation:**
| # | Title | CJ | Source |
|---|---|---|---|
| 2262 | The Glass Door (Public-by-Default Outreach with Member-Voted Dispatch) | YES | AA_FORMAL_2262_THE_GLASS_DOOR_B099.md |

Use `ON CONFLICT DO NOTHING` for all inserts so this is idempotent.

**IMPORTANT:** Before writing the migration, read the existing innovation registration pattern from K410's migration files. Match the exact table name, column names, and data types. The table might be `platform_canonical`, `innovations`, or something else — grep for the pattern in existing migrations.

### Step 2: Update canonical_values.yaml

After the migration applies, update `librarian-mcp/canonical_values.yaml`:

```yaml
stats:
  innovation_count: 2262  # was 2250; backfilled #2244-#2262
  crown_jewels: ???       # recount after migration — should be ~226-228
  formal_claims: 2405     # unchanged
  papers: 41              # unchanged
  puddings: 184           # unchanged
```

The CJ count should be recalculated by counting all rows in the innovation registry where `crown_jewel = true` (or equivalent flag). Don't guess — count.

### Step 3: Rebuild Librarian indexes

Run the Librarian index rebuild:
```bash
cd librarian-mcp
python rebuild_indexes.py  # or whatever the rebuild command is — check the K410 deploy report
```

### Step 4: Verify

After rebuild, verify via MCP:
- `mcp__librarian__get_canonical_numbers` should return the updated counts
- `mcp__librarian__get_system_overview` should reflect the new totals

### Step 5: Deploy

```
cd platform
npx supabase db push --linked
# Then restart Claude Desktop to pick up updated MCP
```

## What NOT to do

- Do NOT change any existing innovation numbers
- Do NOT modify any existing A&A formals
- Do NOT touch the TouchStone manifest or any predicate
- Do NOT modify any edge functions
- This is a data-only migration + YAML update + index rebuild

## Verification checklist

- [ ] Migration applies cleanly
- [ ] `canonical_values.yaml` updated with correct counts
- [ ] Librarian indexes rebuilt
- [ ] `get_canonical_numbers` returns updated values
- [ ] Innovation count matches renumbering log + Glass Door (#2262)
- [ ] CJ count is verified by actual count, not estimate

---

**FOR THE KEEP.**
