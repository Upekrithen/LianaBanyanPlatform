# Bushel 32 — Codex Serial Allocation MCP Tool + Atomic Reservation Primitive (BP022)

## WRASSE PRE-INJECTION

This Bushel composes with the canon at:
- `~/.claude/state/eblets/CANON/maintenance_scribe_synchronization_debt_canon_class_canon_bp021.eblet.md` — Maintenance-Scribe synchronization-debt class (this Bushel ships THE structural close for the recurring Codex-collision class)
- `BISHOP_DROPZONE/14_CanonicalReferences/STACK_LEDGER.jsonl` — Stack Ledger primitive (BP022)
- `~/.claude/state/eblets/CANON/old_ones_naming_register_lovecraft_placeholders_pending_founder_rename_bp022.eblet.md` — naming-register pattern (parallel to codex-reservation pattern)
- Bushel 26 K-prompt (which references "Bishop reconciles serial collisions in Maintenance-Scribe pass" — this Bushel makes that reconciliation primitive-class)

## Founder direct (the recurring class this closes)

**BP022 turn 90 Founder direct**: *"so we need to get to Bushel 32"* (referencing the codex_reserve_next_serial MCP tool primitive named in BP021 post-compaction handoff Maintenance-Scribe queue: *"need `mcp__librarian__codex_reserve_next_serial` MCP tool to prevent recurrence — empirically anchored at 5 collision instances"*).

**The recurring failure mode** (5+ empirical instances tracked):
- Bushel 11 reserved LB-CODEX-0032 — collided with Bushel 15 already-bound 0032
- Bushel 18 reserved LB-CODEX-0033 — collided with Bushel 9 also reserving 0033 — collided with Bushel 12 also reserving 0033 (TRIPLE collision)
- Bushel 13 reserved LB-CODEX-0034 — collided with Bushel 19 also reserving 0034
- Knight chain-link's Bushel 26 H1-H5 plan to bind 0034-0038 — overlaps Bishop's Maintenance-Scribe-renamed drafts at 0035/0036/0037

Every Bushel currently GUESSES the next serial by visual-inspecting the codex ledger or post-compaction handoff. Without atomic reservation, two Bushels firing within the same Bishop-day independently grab the same number.

## Mission

Build the **`mcp__librarian__codex_reserve_next_serial`** MCP tool that atomically reserves the next available LB-CODEX-NNNN serial, returns it to the caller, and writes a reservation row to the codex ledger BEFORE the caller authors any draft file or binds. Eliminates the recurring collision class structurally.

## Phase scope

### Phase A — Tool design + ledger schema

1. Define the MCP tool:
   - `mcp__librarian__codex_reserve_next_serial(reserved_by: string, intended_title: string, intended_session: string, intended_bushel: number) → {serial: string, reserved_ts: ISO8601, reservation_id: UUID}`
   - Reservation row schema: `{type: "reservation", serial: "LB-CODEX-NNNN", reserved_by, intended_title, intended_session, intended_bushel, reserved_ts, reservation_id, status: "reserved"}` 
   - When the codex actually BINDS (separate `codex_bind` operation), the reservation transitions: `status: "reserved"` → `status: "bound"`, with HMAC + chapter list populated.
   - If a reservation expires without bind (configurable TTL, default 7 days), it transitions: `status: "reserved"` → `status: "expired"` + the serial is released back to the pool.

### Phase B — Atomic-reservation implementation

2. Implement at `librarian-mcp/stitchpunks/codex/serial_allocator.ts` (or .py):
   - Read the codex ledger; find max bound + max reserved serial
   - Allocate next: `max(bound, reserved) + 1`
   - Write reservation row IMMEDIATELY (before returning) — atomic via file-lock or transaction
   - Return reserved serial to caller
   - Race-safety: file-lock or atomic-append semantics; concurrent calls produce monotonically-increasing serials with no duplicates
3. Wire to MCP server (`librarian-mcp/src/server.ts`) following the registerTool wrapper pattern (THE BRIDLE Rule 10)

### Phase C — Test harness + race-condition validation

4. Test cases (`librarian-mcp/tests/test_codex_reserve_next_serial.mjs`):
   - **T1**: single reservation returns max+1
   - **T2**: 10 concurrent reservations produce 10 distinct monotonically-increasing serials (no collisions)
   - **T3**: reservation persisted to ledger between calls
   - **T4**: bound serial counted in max; reserved serial counted in max
   - **T5**: TTL expiration transitions reserved → expired; serial returns to pool
   - **T6**: bind operation transitions reserved → bound; HMAC + chapters populated
   - **T7**: bind on non-existent reservation fails (must reserve first)
   - **T8**: concurrent reserve + bind do not interleave (transactional)

### Phase D — Backfill existing reservations

5. Sweep the codex ledger + paper-draft files at `BISHOP_DROPZONE/14_CanonicalReferences/LB_CODEX_*_DRAFT_*.md` and `BISHOP_DROPZONE/14_CanonicalReferences/LB-CODEX-*-BUSHEL-*.md`:
   - For each unbound paper draft, write a reservation row pointing at it (status: "reserved")
   - Migrate the existing 5+ collision instances into proper reservation rows with NEW collision-free serials
   - Preserve original-serial-as-historical in reservation metadata (`originally_proposed_serial: NNNN`)

### Phase E — Stack Ledger row + Codex bind for this Bushel

6. Add Stack Ledger row LB-STACK-0030 (or next available):
   - primitive: "Codex Serial Atomic-Reservation Primitive (Bushel 32, BP022)"
   - baseline_without: "Every Bushel guesses next serial; 5+ paper-collisions tracked; manual Maintenance-Scribe rename passes after the fact"
   - with_primitive: "Atomic reservation MCP tool; serial returned + ledger-written in single call; ZERO post-hoc rename pressure"
   - delta: "Eliminates the entire collision class structurally"
   - measurement_class: instrumented (test T2 = 10 concurrent reservations / 0 collisions)
7. Allocate THIS Bushel's codex via the new tool itself (eat-your-own-dogfood): `mcp__librarian__codex_reserve_next_serial(reserved_by="Bushel 32", intended_title="Codex Serial Allocation MCP Tool + Atomic Reservation Primitive", ...)` returns the next available serial; bind on landing.

### Phase F — Update Bushel-LANDING ratification discipline

8. Update the Bushel-fire pattern (and BRIDLE if applicable):
   - Every K-prompt that includes a Codex draft step MUST first call `codex_reserve_next_serial` to get its serial
   - Drafts authored with the reserved serial from start (no `LB-CODEX-NNNN` placeholder needed)
   - At LANDING, bind transitions reserved → bound

## Verification gates

- **G1**: Tool design + schema documented (Phase A artifact)
- **G2**: Tool implemented + wired to MCP server (Phase B); `mcp__librarian__codex_reserve_next_serial` callable
- **G3**: 8/8 test cases pass (Phase C); race-condition test T2 specifically MUST pass (10 concurrent reservations / 0 collisions)
- **G4**: Backfill swept (Phase D); existing 5+ paper-collisions migrated to clean reservation rows; ledger queryable
- **G5**: Stack Ledger row appended (Phase E)
- **G6**: This Bushel uses its own tool to allocate its codex serial (eat-your-own-dogfood); codex bound at LANDING
- **G7**: BRIDLE / K-prompt template updated to require pre-reservation (Phase F)

## What success looks like

The Codex collision class is structurally CLOSED. No future Bushel guesses next serial. Every codex bind has a reservation row predating it. Maintenance-Scribe pass for codex collisions becomes empty work (because there are no more collisions to reconcile).

## What this Bushel does NOT include

- Codex semantics changes (HMAC, chapter binding, etc. — those stay as-is)
- Reservation cleanup beyond TTL expiration (manual force-release reserved for Founder Fire Code class)
- Renaming the existing 8 paper-draft files at 0032/0033/0033/0034/0034 collision instances (Bishop's Maintenance-Scribe pass already renamed Bushel 11/9/12 drafts to 0035/0036/0037; Bushel 13/19 0034-collision still pending — Phase D backfill handles)

## Composes with

- **Bushel 26** (5-hypothesis empirical receipt fire) — Bushel 26 H1-H5 are the FIRST Bushel-class binds that should USE this tool (when Knight gets to them after Bushel 14 LANDS)
- **Bushel 14 Phases 2-7** (substrate mining) — each Phase Codex bind uses this tool
- **Maintenance Scribe canon** — Bushel 32 IS Maintenance-Scribe class (closing recurring synchronization-debt)
- **Stack Ledger primitive** — Bushel 32 produces a measured-not-projected delta receipt
- **THE BRIDLE Rule 10** (MCP tooling discipline) — Tool implementation follows registerTool wrapper pattern

## Codex chain note

This Bushel's codex serial is allocated by its own tool — exact serial determined at fire-time. Bishop scaffolds with `LB-CODEX-PENDING_BUSHEL_32_SELF_RESERVATION` placeholder; Knight allocates via the tool at Phase E.

---

*Bushel 32 closes the Codex-collision class structurally. Founder asked many times why Bishop keeps reconciling serial conflicts after the fact; this Bushel makes that reconciliation primitive-class — atomic reservation at intent-time, not paper-cleanup at fire-time. Founder prose-pass at fire-time per `feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md`.*
