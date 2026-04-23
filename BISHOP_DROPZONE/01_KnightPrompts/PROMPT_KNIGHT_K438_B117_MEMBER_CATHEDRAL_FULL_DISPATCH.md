---
knight_session: K438
bishop_session: B117
complexity_tier: COMPLEX
estimated_duration_hours: 8.0
recommended_model: opus-4.7
escalation_trigger: "This is already at opus-4.7; if session spans >2 Cursor windows OR blocked on a Supabase schema design question you can't answer, stop and checkpoint with Bishop before Phase C."
---
# Knight K438 — Member-Facing Scribes Cathedral (THE CATHEDRAL product)
## B117, April 23, 2026 — FULL DISPATCH (promoted from B116 stub)

**Status:** FULL DISPATCH. Gate cleared: K437 SEALED-50 PASSED at +6.0pp (commit `8b11811`, tag `v-scev1-b116`). Bishop B117 expanded Scribe registry (Architecture + Decisions + FounderVoice) to cover the K437-identified blind-spot categories per #2276. Founder ratified "Librarian: AI Companion" as product brand + "The Cathedral" as install-artifact name.

**Prerequisite reads (BRIDLE Rules 1–7):**
- `BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K436_*.md` + K436 Knight report (Cathedral MCP tools are the production backbone)
- `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2268_MEMBER_OWNED_SCRIBES_CATHEDRAL_B117.md` (the canonical architecture spec)
- `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2270_SCRIBES_CATHEDRAL_ARCHITECTURE_B117.md` (the storage substrate)
- `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2269_THREE_FATES_ROUTING_PIPELINE_B117.md` (routing pipeline)
- `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2275_AI_COMPANION_VENDOR_NEUTRAL_BRIDGE_B117.md` (Companion distribution spec)
- `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2276_SCRIBE_COVERAGE_DISCOVERY_B117.md` (empirical-roadmap diagnostic)
- `librarian-mcp/r10_cross_vendor/results_scev1_b116_k437_sealed50_summary.md` (K437 PASS evidence)
- `librarian-mcp/stitchpunks/scribes/` (current 8-Scribe registry including B117 expansion)

**Estimated Knight session:** 6–10 hours. Multi-phase; can split across two Knight sessions if needed.

**Complexity tier:** COMPLEX → recommended model **Opus 4.7 (1M context)**. Multi-file + multi-module + new Supabase schema + UI across several routes.

---

## Why this Knight now

Per B116 Founder-ratified "Prove it first. Product it second.": K437 SEALED-50 PASS is the proof gate. K438 ships the member-facing Cathedral — the monetization bridge from R9 retrieval substrate to $5/yr membership product, formalized as #2268 Member-Owned Scribes Cathedral.

**Strategic framing (per B117 Founder confirmation):**
- Product brand: **"Librarian: AI Companion"**
- Install artifact: **"The Cathedral"** (as in: "install your Cathedral")
- Core pitch: **"The more Scribes, the more accuracy. The more members, the smarter the platform. Unless someone starts a secret society with millions of dollars to replicate cooperative economics, no AI major can match this."**
- URL strategy: single site at `librarian.the2ndsecond.com` — sub-pages `/companion`, `/cathedral`, `/benchmarks`; no subdomain proliferation per chapter.

---

## Scope — six phases

### Phase A — Supabase schema (`cathedral` schema, separate from `public` and `upekrithen`)

Create a new schema `cathedral` to keep member Cathedral state separable from cooperative-governance data (public) and from Pedestal Stake commercial data (upekrithen). Rationale: three distinct privacy + access-pattern regimes; schema-level separation is the K431-ratified pattern.

Tables:

- `cathedral.member_cathedrals` — one row per member. Columns: `member_id` (FK auth.users), `created_at`, `tier` ENUM('free','paid'), `last_sync_at`, `export_count`, `export_last_at`
- `cathedral.member_scribes` — per-member Scribe registry. Columns: `scribe_id` UUID, `member_id`, `name`, `primary_field` TEXT, `adjacents` JSONB (array of {level, field}), `keywords` TEXT[], `active` BOOLEAN, `share_level` ENUM('private','guild','tribe','commons'), `share_target_id` UUID NULL, `created_at`, `updated_at`
- `cathedral.scribe_entries` — append-only tablet entries. Columns: `entry_id` UUID, `scribe_id` FK, `member_id`, `ts`, `session_id` TEXT, `observation` TEXT, `source` TEXT, `canonical_ref` TEXT, `tags` TEXT[], `shared` BOOLEAN (materialized view of Scribe's share_level at entry time — immutable even if Scribe's share_level changes later)
- `cathedral.fates_log` — routing audit. Columns: `log_id`, `member_id`, `session_id`, `content_hash`, `themes` JSONB, `scores` JSONB, `dispatches` JSONB, `coverage_gaps` JSONB
- `cathedral.tidbits` — SP-21 verify-action ledger per member. Columns: standard SP-21 schema + `member_id` FK

RLS policies:
- `member_cathedrals`: members can SELECT their own row; INSERT on enrollment; UPDATE restricted to `tier` (paid upgrade) and `last_sync_at`
- `member_scribes`: members CRUD their own; cannot see other members' unless Scribe is shared to a group the viewer belongs to
- `scribe_entries`: NO UPDATE/DELETE (append-only); INSERT restricted to Scribe owner; SELECT follows Scribe's share_level
- `fates_log` + `tidbits`: per-member, no cross-member visibility; NO UPDATE/DELETE

Migration file: `platform/supabase/migrations/20260423_k438_cathedral_schema.sql`

### Phase B — Member Cathedral UI

Routes to add under `platform/src/pages/cathedral/`:

- `/my/cathedral` — landing: member's Scribes listed by activity + recent entries across all Scribes + Cathedral health card (Scribe count, entry count, last sync)
- `/my/cathedral/new` — Scribe creation wizard: pick primary field (free text + recommended-from-starter-pack), pick 0–12 adjacents with level dropdowns, keyword library (auto-suggested from primary field; editable)
- `/my/cathedral/<scribe_id>` — tablet view: paginated entries (20 per page), search by keyword, filter by source/session, append-new-entry form
- `/my/cathedral/<scribe_id>/share` — share settings: radio among private/guild/tribe/commons + target picker
- `/my/cathedral/export` — one-click ZIP download + `liana-companion-standalone-reader.py` sidecar (for #2268 Claim 1(d) export-on-demand)
- `/my/cathedral/settings` — tier upgrade CTA, sync preferences, delete-all-data (the anti-lock-in nuclear option)

Starter-pack Scribes (auto-created on member enrollment, modifiable):
1. **Work** (primary: "your professional domain" — free text at enrollment)
2. **Learning** (primary: "what you're currently studying")
3. **Projects** (primary: "active projects")
4. **Health** (primary: "personal health context, medications, providers")
5. **Family** (primary: "family members, dates, preferences, traditions")

Each starter Scribe has default adjacents + keyword seeds. Members can add/remove/rename at `/my/cathedral/new`.

### Phase C — MCP tool extension (`member_consult_scribes`)

Extend `consult_scribes` from K436 to support a `member_id` parameter. When member_id is set:
- Query runs against member's own Scribes first (primary pass)
- Then expands to Guild Scribes the member has joined (if any)
- Then to Commons Scribes (global member-generated content, opt-in)
- Never to other members' private Scribes

Register as new MCP tool `member_consult_scribes` at `librarian-mcp/src/server.ts` alongside existing `consult_scribes`. Existing K436 tool unchanged.

### Phase D — Three Fates member-session integration

When a member's work session runs (e.g., they're typing into Claude Desktop via the Companion bridge), the Fates pipeline routes exchange content to their Scribes in real-time:

1. Member's MCP client (Claude Desktop / Cursor / etc.) calls `fates_route(session_id, content, member_id)`
2. Clotho extracts themes against the member's own registered entity patterns (derived from their Scribes' keywords + LB canonical entities)
3. Lachesis scores themes against member's active Scribes (primary + adjacent fields)
4. Atropos dispatches append-directives to top-K Scribes, logs routing record, flags coverage gaps back to member UI

Implementation: `librarian-mcp/src/scribes/fates.ts` already supports this at the base pipeline level. K438 adds member-scoped invocation in the MCP tool layer + persistence to `cathedral.fates_log`.

### Phase E — Export + Import

- **Export** (`/my/cathedral/export`): ZIPs member's `cathedral.*` rows + generates `registry.yaml` + scribe tablets JSONL + SP-21 tidbits JSONL + fates_log JSONL + README.md (describes the bundle) + `liana-companion-standalone-reader.py` (minimal Python reader for offline use per #2268 Claim 1(d))
- **Import**: symmetric — accepts a ZIP produced by export (or by a future Companion) and populates the member's Cathedral on the server side. Collision strategy: member chooses (merge / overwrite / keep-existing) per Scribe. Default: merge (append-only respects existing timestamps).

### Phase F — Tests (22+ cases minimum, green before commit)

- RLS tests: member A cannot SELECT member B's private Scribes (3 cases across share_level enum)
- Append-only enforcement: UPDATE / DELETE on `scribe_entries` rejected by RLS (2 cases)
- Starter-pack enrollment: new member gets 5 starter Scribes on first login (1 case)
- Export round-trip: export → import produces byte-identical Cathedral content (1 case)
- Share-level changes don't retroactively change existing entries' `shared` flag (1 case)
- `member_consult_scribes` returns member's own Scribes first, Guild second, Commons third (3 cases)
- Fates routing produces `cathedral.fates_log` rows with correct member_id (2 cases)
- Starter Scribe keywords produce measurable retrieval hits on sample queries (5 cases)
- `/my/cathedral/export` produces valid ZIP with all expected files (1 case)
- Standalone reader reads exported ZIP and answers queries correctly (1 case)
- Tier upgrade flow: free → paid unlocks sync (2 cases)
- Delete-all-data scrubs member's Cathedral rows cleanly (1 case)

### Phase G (optional, can slip to K445+) — Companion CLI package scaffolding

If time permits: draft the `pip install liana-companion` package scaffolding per #2275 spec. `liana-companion init` provisions a local `~/.liana/cathedral/` directory + MCP server registration. Can run as a later K-session if K438 Phase A–F is already long.

---

## Acceptance criteria

- [ ] Schema migration `20260423_k438_cathedral_schema.sql` applies cleanly via `npx supabase db push --linked --include-all`
- [ ] RLS policies verified across all 5 tables (member A can't see member B's private data)
- [ ] All 6 routes render without 500s on a test member's Cathedral
- [ ] Starter-pack Scribes created on member enrollment (verify via `/my/cathedral` landing)
- [ ] `member_consult_scribes` MCP tool registered + 3 test cases green (self / guild / commons)
- [ ] `/my/cathedral/export` produces valid ZIP + standalone reader works offline
- [ ] All 22+ tests green
- [ ] Commit + push (push is Founder's call per AGENTS.md)
- [ ] K438 Knight report summarizes what shipped, any scope deferred to K445+, and any empirical signal worth Bishop's next move

---

## Non-goals

- **Do NOT ship the Companion CLI package (`pip install liana-companion`) in K438.** Phase G is optional scaffolding; full Companion engineering is K445+.
- **Do NOT generate marketing copy for the landing page.** Bishop owns landing copy; K438 ships UI + backend only.
- **Do NOT change existing `consult_scribes` behavior.** Add `member_consult_scribes` as a sibling; keep K436's tool unchanged for the librarian-mcp public registry.
- **Do NOT modify `upekrithen` schema.** K438 lives in `cathedral` schema; zero cross-schema FK.

---

## Dependencies + sequencing

- **K437 SEALED-50 PASS ✓** (commit `8b11811`, tag `v-scev1-b116`)
- **K436 Cathedral MCP tools ✓** (commit `6c47d9b`, tag `v-cathedral-tools-K436`)
- **K441 recommended BEFORE K438** — K441 fixes MCP auto-reload so Knight's iterative Cathedral-code + Cathedral-UI dev loop doesn't require Cursor restarts
- **K443 recommended BEFORE K438** — model router wrapper saves Founder time across this complex session
- **Bishop-side K437 re-run on B117-expanded registry** — should produce +15-20pp lift; K438 member-facing claims quote THESE numbers, not SEED-18's +19.4pp or the pre-expansion +6.0pp. Run command: `python run_scev1_k437.py --bank SCEV1_QUESTION_BANK_SEALED.json --out results_scev1_b117_expanded_registry --budget 20.00`
- **K438 blocks K445+ Companion engineering** — Cathedral backend must be live before CLI package can compose with it

---

## Reporting requirements (BRIDLE Rule 7)

1. Pre-K438 state: schemas present, existing cathedral-adjacent tables if any
2. Post-K438 state: migration applied, RLS policies verified, test counts
3. Commit SHA + tag (propose `v-member-cathedral-K438`)
4. Per-phase completion notes — if Phase G deferred, explicit handoff to K445
5. Any empirical finding surfaced during development that's worth Bishop's attention (e.g., "starter-pack Scribe X never gets routed to; consider removing from default set")
6. Any schema or RLS policy Bishop should review before member beta opens

---

## Strategic context — the pitch

Per Founder B117:

> *"The more Scribes we have, the more accuracy we will achieve. Unless copiers start their own secret society and garner millions to do it — [AI majors] can't match this."*

**Corollary (the cooperative-economic flywheel):** LB's accuracy scales with member participation. AI-major products' accuracy scales with employee headcount. Our corpus = our members; their corpus = their payroll. Structurally, we can grow the corpus without growing the company.

K438 operationalizes this. Every member who adds a Scribe grows (their own Cathedral AND, consent-gated, the Commons Scribes). Every member who uses the platform produces routing data that surfaces blind-spot categories for the next Cathedral-coverage-expansion cycle (per #2276).

Build accordingly. The Cathedral UI should feel like a member is investing in their own personal expertise record that grows over time, not filling out a SaaS form. Small details matter: the name is "The Cathedral" (mythology-consistent), not "My Memory" (SaaS-generic); the primary field is "your professional domain" (asking for their truth), not "work" (dropdown).

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Promoted from B116 stub to full dispatch. The Member Cathedral is the product that turns R9's empirical lift into a $5/yr subscription business AND the cooperative-economic moat against AI-major native memory features. Build it with intention; this is the flywheel's first turn.*
