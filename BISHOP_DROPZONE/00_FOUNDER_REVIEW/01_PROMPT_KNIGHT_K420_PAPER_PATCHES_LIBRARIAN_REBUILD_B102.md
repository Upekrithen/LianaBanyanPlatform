# Knight Session K420 — Paper Patches + Librarian Index Rebuild + Canonical Stats

**Dispatched by**: Bishop B102
**Priority**: HIGH — clears 4 stale TouchStone deliverables
**TouchStone IDs**: B096-paper-patch-unlimited-throws, B096-paper-patch-five-dollar-career, B096-librarian-index-rebuild, B096-canonical-stats-update

---

## Task 1: Paper Patch — "What If You Had Unlimited Throws?"

**Deliverable**: Migration that adds a cross-reference to Pudding #183 in the paper "What If You Had Unlimited Throws?"

Pudding #183 ("The Triple Double and the Lottery Ticket Monkeys") directly uses the carnival dart game framing from this paper. The paper needs a citation back to the Pudding that proves the concept in a real-world context.

**What to do**:
1. Find the paper content in Supabase (table: `cephas_content` or `papers` — search for "Unlimited Throws")
2. Append a new section or footnote:
   - Title: "See Also"
   - Content: "Pudding #183, 'The Triple Double and the Lottery Ticket Monkeys,' applies the Unlimited Throws framework to the Triple Double Ladder — a concrete motivation system built on three doublings from a $100/day base. The carnival dart game framing is central to its argument that attempts, not outcomes, are the metric that matters."
3. Write as a SQL migration: `20260412000001_paper_patch_unlimited_throws.sql`

**Verification predicate** (already in manifest):
```
file_exists: platform/supabase/migrations/20260412000001_paper_patch_unlimited_throws.sql
```

---

## Task 2: Paper Patch — "The Five Dollar Career" — Append Section 8

**Deliverable**: Migration that appends Section 8 to the paper "The Five Dollar Career," linking it to Pudding #183's Cold Start pathway argument.

Pudding #183 includes a section titled "What to do with $2,000–$5,000" that directly extends the Five Dollar Career thesis — explaining how LB's Cold Start tools let you validate a business in Marks before risking capital.

**What to do**:
1. Find the paper content in Supabase (search for "Five Dollar Career")
2. Append Section 8:
   - Title: "Section 8 — The Cold Start Proof"
   - Content: "Pudding #183 demonstrates the full Cold Start pathway in practice: Cue Cards test demand in Marks before dollars are spent. Treasure Maps crowdsource audience discovery. Campaign Forge builds materials using shared tools. The Red Carpet connects founders to mentors. The Recipe Pot assembles teams paid in Marks. The Commerce Engine handles compliance. The result: a founder deploys their $2,000–$5,000 only after the platform has validated the idea. The Five Dollar Career doesn't start with five dollars. It starts with effort."
3. Write as migration: `20260412000002_paper_patch_five_dollar_career.sql`

**Verification predicate** (already in manifest):
```
file_exists: platform/supabase/migrations/20260412000002_paper_patch_five_dollar_career.sql
```

---

## Task 3: Librarian Index Rebuild

**Deliverable**: Rebuild the librarian-mcp index so B096 content (Puddings 182-183, innovations 2234-2236, Pollination Manifest) is searchable.

**What to do**:
```bash
cd librarian-mcp
npm run rebuild
```

Verify the rebuilt index contains "B096" in the overview.

**Verification predicate**: `librarian_index_contains: overview contains "B096"`

---

## Task 4: Canonical Stats Reconciliation

**Deliverable**: Ensure `platform_canonical` table reflects current counts.

Current canonical (from canonical_values.yaml):
- innovation_count: 2263
- crown_jewel_count: 222
- formal_claims: ~2412
- production_systems: 36
- pudding_count: 189
- paper_count: 41
- glass_door_letters: 95
- spoonfuls_count: 706+
- bst_episodes: 584

**What to do**:
1. Check current values in `platform_canonical` table
2. Write migration to update any stale values: `20260412000003_canonical_stats_b102.sql`
3. Deploy via `npx supabase db push`

**Verification predicate**: `supabase_row_exists: platform_canonical where key = 'innovation_count' AND value >= 2263`

---

## Run Order
1. Paper patches (Tasks 1-2) — write migrations
2. Canonical stats (Task 4) — write migration
3. Deploy all three migrations: `npx supabase db push`
4. Librarian rebuild (Task 3) — `npm run rebuild`
5. Verify all 4 TouchStone deliverables pass

## Session End
Run `scrambler_session_closeout` for K420.
