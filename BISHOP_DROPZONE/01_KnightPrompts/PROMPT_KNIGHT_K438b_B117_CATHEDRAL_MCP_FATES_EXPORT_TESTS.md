---
knight_session: K438b
bishop_session: B117
complexity_tier: COMPLEX
estimated_duration_hours: 5.0
recommended_model: opus-4.7
escalation_trigger: "If ZIP export standalone reader requires Python+Node runtime bridging decisions, stop and checkpoint. If member-scoped Fates routing raises per-member performance concerns (latency >500ms on consult), stop and checkpoint."
---
# Knight K438b — Cathedral MCP Tool + Fates Integration + Export/Import + Test Suite
## B117, April 23, 2026 — CONTINUATION of K438a

**Status:** Ships Phases C / D / E / F that K438a deferred. Gate: K438a MUST have landed (commit tag `v-member-cathedral-K438a`). Verify via `git log --oneline -8` before starting.

**Complexity tier:** COMPLEX → Opus 4.7 (1M context). Multi-module: extends `librarian-mcp/src/server.ts` + `src/scribes/consult.ts` + `src/scribes/fates.ts` + new `src/cathedral/export.ts` + `src/cathedral/import.ts` + `tests/`. Sonnet 4.6 will struggle; use Opus.

**Prerequisite git state (verify, don't re-check beyond the quick log):**
- K438a merged: tag `v-member-cathedral-K438a` (if not present, STOP and report — K438b depends on the cathedral schema existing in prod)
- K436 merged: `6c47d9b` (consult_scribes + scribe_log + fates_route + log_tidbit are the extension targets)
- K441 merged: `d4621f8` (MCP auto-reload means you can iterate on server.ts without Cursor restart)

**Everything architectural is in these three files — read them first, do not browse the 9 A&A Formals:**
1. `librarian-mcp/src/scribes/consult.ts` (K436 implementation; you extend)
2. `librarian-mcp/src/scribes/fates.ts` (K436 implementation; you extend)
3. `librarian-mcp/src/server.ts` (K436 + K441 tool registrations)

---

## Phase C — `member_consult_scribes` MCP tool

Register new tool at `librarian-mcp/src/server.ts`. Signature:

```typescript
server.tool(
  'member_consult_scribes',
  'Retrieve top-K relevant Scribe entries across member-owned + shared Scribes',
  {
    member_id: z.string().uuid(),
    query: z.string().min(5).max(2000),
    top_k: z.number().int().min(1).max(50).default(10),
    since_ts: z.string().optional(),  // ISO-8601
    include_shared: z.boolean().default(true),
  },
  async ({ member_id, query, top_k, since_ts, include_shared }) => {
    // 1. Query member's own Scribes first (share_level = 'private' | 'guild' | 'tribe' | 'commons')
    // 2. If include_shared: also query Scribes shared to groups this member belongs to
    //    (for K438b, "groups this member belongs to" = stub: just include all share_level IN ('guild','tribe','commons')
    //     rows; fine-grained group membership join is K438c or post-ship)
    // 3. Rank by primary-field match first (per #2270 Claim 3 expertise-level weighting),
    //    then adjacent-level-weighted score
    // 4. Return top_k entries with (scribe_name, observation, ts, source, canonical_ref, relevance_score)
    // Backs onto cathedral.scribe_entries via Supabase client; NOT the local JSONL tablets
    // (those remain Bishop's internal-librarian substrate; member Cathedral lives in Supabase)
  }
);
```

Access-control: the tool is callable by any authenticated MCP client but the Supabase client inside the tool uses the member_id param's session credentials — i.e., RLS does the gatekeeping, the tool is just a convenience surface.

### Phase C acceptance

- [ ] Tool registered; `tools/list` output includes `member_consult_scribes`
- [ ] Query against a test member's Cathedral returns their own Scribes' entries ranked by relevance
- [ ] Query with `include_shared: false` returns only private-scoped entries
- [ ] `since_ts` filter correctly excludes older entries
- [ ] Empty Cathedral returns empty array (no error)
- [ ] Invalid member_id returns clear error (not silent empty)

---

## Phase D — Three Fates member-session integration

Extend `librarian-mcp/src/scribes/fates.ts` to accept `member_id` and persist routing records to `cathedral.fates_log`. New MCP tool registration:

```typescript
server.tool(
  'member_fates_route',
  'Route session content to relevant member Scribes via Three Fates pipeline',
  {
    member_id: z.string().uuid(),
    session_id: z.string(),
    content: z.string().min(10).max(10000),
    dispatch_cap: z.number().int().min(1).max(10).default(5),
  },
  async ({ member_id, session_id, content, dispatch_cap }) => {
    // Clotho: extract themes (reuse existing extractThemes from K436 fates.ts)
    // Lachesis: score themes against member's registered Scribes
    //   (query cathedral.member_scribes WHERE member_id = $1 AND active = true)
    // Atropos: select top-K scribes per theme (capped at dispatch_cap),
    //   write dispatch directives, log coverage-gap flags if <3 scribes matched
    //   (triply-redundant-witness threshold per #2270 Claim 4)
    // Persist: INSERT INTO cathedral.fates_log with content_hash, themes,
    //   scores, dispatches, coverage_gaps
    // Return: { routed_to: [{scribe_id, scribe_name, reason}], coverage_gaps: [...] }
  }
);
```

Does NOT auto-append to tablets — the member sees the routing suggestion + confirms (via UI from K438a Phase B tablet view, which K438b augments with a "Fates suggested this entry" UX beat). Manual-approval default for the first ship; full-auto is a post-K438b toggle.

### Phase D acceptance

- [ ] `member_fates_route` tool registered + callable
- [ ] Routing against a test session content produces a `cathedral.fates_log` row
- [ ] Coverage-gap flag fires when content routes to fewer than 3 scribes
- [ ] Latency under 500ms for typical ~500-word input + 5-10 member scribes (escalation trigger if over)

---

## Phase E — Export + Import with standalone reader

### Export

Create edge function at `platform/supabase/functions/cathedral-export/index.ts`. Flow:

1. Accept `{ member_id }` (validated via auth session)
2. Query all member's `cathedral.*` rows (member_cathedrals, member_scribes, scribe_entries, fates_log, tidbits)
3. Serialize to JSONL files matching the internal-librarian tablet convention:
   - `registry.yaml` (mirrors Scribe registry format from `librarian-mcp/stitchpunks/scribes/registry.yaml`)
   - `scribe_<name>.jsonl` per Scribe (header line + entries)
   - `fates_log.jsonl`
   - `tidbits.jsonl`
4. Include `README.md` (describes bundle format)
5. Include `liana-companion-standalone-reader.py` (a ~150-line Python script that loads the bundle + offers a simple CLI: `python reader.py consult "my query"` returns top-5 relevant entries without any LB platform dependency)
6. Package as ZIP; serve as downloadable
7. Update `cathedral.member_cathedrals.export_count` + `export_last_at`

Wire the `/my/cathedral/export` UI route (K438a scaffold) to call this edge function.

### Import

Create edge function at `platform/supabase/functions/cathedral-import/index.ts`. Flow:

1. Accept `{ member_id, zip_bundle, collision_strategy }` where `collision_strategy ∈ {'merge','overwrite','keep_existing'}`
2. Unzip + validate (must contain registry.yaml + at least one scribe_*.jsonl)
3. Per-Scribe collision handling:
   - `merge` (default): new entries append; existing entries retained; Scribe registry-level config (adjacents, keywords) from importing bundle overwrites if member had same-named Scribe
   - `overwrite`: delete existing Scribe rows before importing (use sparingly — loses entry history; logs the delete to tidbits for audit)
   - `keep_existing`: imported Scribes with name conflicts are skipped; report is returned listing skipped names
4. Return summary: `{ scribes_imported, entries_imported, skipped, collision_strategy }`

### Standalone reader sidecar (ships with every export)

File: `liana-companion-standalone-reader.py`. ~150 lines. Implements:

- Loads registry.yaml
- Loads all scribe_*.jsonl files
- Implements a minimal `consult_scribes(query, top_k=5)` function (substring match over observation; weight primary>adjacent by tier)
- CLI: `python reader.py consult "my query"` → prints top-5 matches
- CLI: `python reader.py list-scribes` → prints registry
- CLI: `python reader.py stats` → prints Scribe + entry counts

No LB platform dependency — operates purely on the exported ZIP bundle. This is #2268 Claim 1(d) operational: export-on-demand with a standalone reader that the former member can run offline, forever.

### Phase E acceptance

- [ ] Edge function `cathedral-export` creates valid ZIP with all expected files
- [ ] `liana-companion-standalone-reader.py` reads the ZIP and answers a test query correctly (independent of the LB platform)
- [ ] Edge function `cathedral-import` with a freshly-exported ZIP restores the Cathedral in a NEW test-member account, byte-identical entry counts
- [ ] Collision strategies behave per spec on conflicting Scribe names

---

## Phase F — Test suite (22+ cases)

Create `librarian-mcp/tests/test_member_cathedral.mjs` + Supabase integration tests + edge function tests. Minimum coverage:

**Supabase RLS (7 cases):**
1. Member A cannot SELECT member B's `member_cathedrals` row
2. Member A cannot SELECT member B's private Scribes
3. Member A CAN SELECT member B's commons-shared Scribes
4. Member A cannot UPDATE `scribe_entries` (append-only)
5. Member A cannot DELETE `scribe_entries`
6. Member A cannot UPDATE `fates_log`
7. Member A cannot INSERT a scribe_entry with another member's member_id

**Starter-pack (2 cases):**
8. New member signup triggers seed_starter_pack; 5 Scribes created
9. Starter Scribe Keywords produce measurable hits on sample queries

**member_consult_scribes (5 cases):**
10. Returns member's own Scribes first when both own + shared match
11. include_shared: false excludes shared Scribes
12. since_ts filter works correctly
13. Empty Cathedral returns empty array
14. top_k cap honored

**member_fates_route (3 cases):**
15. Produces fates_log row with correct member_id
16. Coverage-gap fires when content routes to <3 Scribes
17. Latency under 500ms on benchmark input

**Export/Import (4 cases):**
18. Export produces ZIP with all expected files
19. Import + Export round-trip is byte-identical
20. Collision strategies behave per spec
21. Standalone reader answers query correctly on exported ZIP

**UI integration (1+ cases):**
22. `/my/cathedral/export` button calls edge function and returns download

### Phase F acceptance

- [ ] All 22+ tests green via `npm test` (or appropriate test runner)
- [ ] No test flakes (run 3× to verify)
- [ ] Coverage report includes the new `cathedral/*` modules at ≥80%

---

## Commit + tag

After all four phases land:

```powershell
git commit -m @'
K438b(B117): Cathedral MCP tools + Fates integration + Export/Import + tests

* Phase C: member_consult_scribes MCP tool (extends K436 consult_scribes
  with member_id, share cascade, since_ts filter)
* Phase D: member_fates_route MCP tool (extends K436 fates_route with
  member-scoped routing + cathedral.fates_log persistence)
* Phase E: cathedral-export + cathedral-import edge functions + standalone
  Python reader sidecar (implements #2268 Claim 1(d) export-on-demand)
* Phase F: 22-case test suite across RLS, starter-pack, MCP tools, export/
  import, UI integration

K438 complete across two sessions: K438a (schema + UI scaffold,
v-member-cathedral-K438a) + K438b (MCP tools + Fates + Export + tests,
v-member-cathedral-K438b).

Phase G (Companion CLI package) still deferred to K445+.

Co-Authored-By: Claude Opus 4.7 (Knight) <noreply@anthropic.com>
'@
```

**Target tag:** `v-member-cathedral-K438b`. **Supersedes** the earlier-reserved `v-member-cathedral-K438` — that's retired in favor of the split-session pair `K438a` + `K438b`.

---

## BRIDLE Rule 7 report requirements

1. Phase-by-phase completion status (each phase's acceptance criteria, checked)
2. Migration additions if any (shouldn't be — K438a's schema is sufficient)
3. New MCP tools registered (names + tool signature)
4. Edge functions created (paths + roles)
5. Test count + pass rate + any flakes
6. Latency measurements for `member_fates_route` (escalation trigger if >500ms)
7. Any deviation from this prompt AND why
8. Commit SHA + tag

---

**Estimated effort:** 5 hours. Opus 4.7 (1M context). Single session if stretched; split over two if phases exceed 6hr total.

**If you find yourself at hour 7:** stop. Commit what's green. Any remaining phase becomes K438c (we reserve the `c` suffix for if needed).

**Proceed.**
