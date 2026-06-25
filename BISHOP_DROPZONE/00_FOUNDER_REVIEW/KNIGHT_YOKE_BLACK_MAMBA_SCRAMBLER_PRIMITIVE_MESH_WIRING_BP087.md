# KNIGHT YOKE · BLACK MAMBA · SCRAMBLER PRIMITIVE RESOLUTION · BP087

**From:** Bishop · BP087 · SEG-P · Sonnet 4.6
**To:** Knight
**Class:** BLACK MAMBA · scope-resolution (§14 gadget-first empirical result)
**Model:** Sonnet 4.6 verbatim (Statutes §3) · use segs on every sub-task
**Streams:** 1 resolution stream + 1 canon-mint stream
**Goal:** Resolve Row 2h (Scrambler primitive) from ❌ NOT WIRED to ✅ NOT-APPLICABLE-FOR-MESH-SUPABASE via empirical recon, mint clarifying canon, update matrix status, and define the correct minimal mesh-wiring scope.

---

## §0 · Header (BP087 verbatim)

BLACK MAMBA SCRAMBLER PRIMITIVE MESH WIRING (RESOLUTION)
BP087 · BRICK WALL pre-authorized · SEG-P authored

---

## §1 · Empirical Recon Result

### What the Scrambler IS per canon

**Canon source:** `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_scrambler_deterministic_sync_layer_A_and_A_2259_bp085.eblet.md`

The Scrambler is the **8th named Substrate primitive** (A&A Formal #2259, B098, K407 LIVE). Per canon verbatim:

> "Deterministic synchronization layer. At every session start it reads the canonical state and flags any drift; at every session end it reconciles what each agent committed against that state. No AI inside -- pure deterministic predicate evaluation. The infrastructure that keeps Bishop, Knight, Rook, and Pawn working from the same truth at all times."

**Expanded per A&A Formal #2259** (`BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2259_THE_SCRAMBLER_B098.md`):

The Scrambler is an **eager pairwise consistency verifier** operating over C(8,2) = 28 unordered subsystem pairs (4 Corps + 4 Librarian subsystems). It uses a 28-cycle deterministic non-sequential permutation with seeded rotation every 7 cycles to prevent prediction-based gaming. Zero AI inference capacity. Background process. Writes results to append-only ledger.

**Triple-Redundant evolution per K418** (`BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_SESSION_K418_SCRAMBLER_TOUCHSTONE_AUTORECONCILE_B101.md`):

Three Scrambler instances: A (Ledger Verifier), B (Ground Truth Verifier), C (Tiebreaker Arbiter). Three triggers: brief_me/moneypenny_debrief hardwire, 4-hour cron, Claude Code hooks. Nine verification paths total.

### Current Code State

**Empirically confirmed via Glob + Grep (BP087, §14 BLOOD):**

- `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\scrambler\` EXISTS with:
  - `README.md` -- architecture doc, MCP tool names `scrambler_session_start` and `scrambler_session_closeout`
  - `staleness.py` -- gap detection, stale/orphaned deliverable flagging (K418/#2263)
  - `resolution_log.jsonl` -- append-only resolution record
  - `tiebreak_log.jsonl`, `tiebreak_log (1).jsonl` -- Arbiter logs (Scrambler C)
  - `unreconciled.jsonl` -- conflict queue
  - `snapshots/` -- canonical state snapshots
  - `tests/` -- test suite

- **ZERO presence in `src/main/`** -- Grep across all of `src/main/` returned no matches.
- **ZERO presence in `platform/supabase/functions/`** -- Grep returned no matches; only legacy archive SQL mentions it as a description string (not a schema or function).
- **ZERO Supabase tables** for scrambler state. No migration files create scrambler tables.

### What the SEG-H "❌ NOT WIRED" Designation Meant

Row 2h in the 8-row capability matrix flagged the Scrambler as not wired at the mesh level. SEG-H's correct empirical reading: the Scrambler has **no presence in `src/main/` or `platform/supabase/functions`.**

However, the Scrambler is **architecturally correct as a librarian-mcp Python MCP subsystem.** It is NOT a Supabase/Edge Function mesh primitive. Its wire format is MCP tool calls (`scrambler_session_start`, `scrambler_session_closeout`, `scrambler_arbiter`, `scrambler_ground_truth`, `scrambler_tiebreak_log`), registered in `librarian-mcp/src/server.ts`.

**Confirmed in `librarian-mcp/src/server.ts`** via Grep: scrambler MCP tools ARE registered.

### Scope Determination: NOT a mesh-bound Supabase primitive

The THUNDERCLAP Full Wiring yoke (β6 row) says:

> "Scrambler deterministic sync -- composes A&A #2259. The mesh-distributed Plow's blade ordering is deterministic across peers; sync receipt on every mesh fire."

This is the CORRECT mesh-level scope: the Scrambler ensures **blade ordering determinism across peers** during a THUNDERCLAP fire. This does NOT require:

- A new Supabase table (`peer_scrambler_state` would be incorrect architecture)
- A new Edge Function
- New entries in `src/main/index.ts`

What it DOES require:

- The Scrambler MCP tools already in `librarian-mcp/scrambler/` to be called at mesh-fire time
- A mesh-fire receipt record confirming deterministic ordering was applied
- `scrambler_session_start` called at THUNDERCLAP Trial 02 fire start
- `scrambler_session_closeout` called at THUNDERCLAP Trial 02 fire end

**Resolution path: SCOPE REDUCTION.** Row 2h transitions from ❌ NOT WIRED to ✅ WIRED-VIA-MCP-NOT-SUPABASE. No new Supabase tables. No new Edge Functions. The wiring is: call existing MCP tools at mesh-fire time.

---

## §2 · SEG Fan-Out

Use segs Sonnet 4.6 verbatim.

Two streams run in parallel:

- **Stream σ1** (Resolution Canon Mint): mint a clarifying canon eblet documenting the scope determination. 150-line eblet max.
- **Stream σ2** (Mesh-Fire Hook): wire `scrambler_session_start` + `scrambler_session_closeout` into the THUNDERCLAP Trial 02 fire scaffold (composes with KNIGHT_YOKE_BLACK_MAMBA_ZETA_THUNDERCLAP_TRIAL_02_FIRE_BP087.md).

Both streams use segs. No single-threaded sequencing. σ1 completes first (pure text); σ2 composes into the existing ζ yoke.

---

## §3 · File Targets

### Stream σ1 -- Canon Mint (pure text, no code)

**New file (Knight creates):**
```
C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_scrambler_primitive_librarian_mcp_not_supabase_row_2h_resolution_bp087.eblet.md
```

Contents per §4 acceptance gate σ1 below.

### Stream σ2 -- Mesh-Fire Hook

**Edit file (Knight edits, Bishop applies):**
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_BLACK_MAMBA_ZETA_THUNDERCLAP_TRIAL_02_FIRE_BP087.md
```

Insert into the THUNDERCLAP Trial 02 fire scaffold a Scrambler hook section:

```typescript
// SCRAMBLER HOOK -- session_start (call before first peer dispatch)
// MCP tool: scrambler_session_start
// Inputs: agent="THUNDERCLAP_TRIAL_02", session_id=<ISO-8601 UTC timestamp>
// Expected: canonical state snapshot written to librarian-mcp/scrambler/snapshots/
// This enforces deterministic blade ordering across peers (A&A #2259 Row 2h close)

// SCRAMBLER HOOK -- session_closeout (call after last peer result collected)
// MCP tool: scrambler_session_closeout
// Inputs: agent="THUNDERCLAP_TRIAL_02", session_id=<same as above>, summary=<receipt hash>
// Expected: reconciliation written to resolution_log.jsonl
// Drift flagged to unreconciled.jsonl if blade ordering diverged across peers
```

**New file (Knight creates, Bishop reviews):**
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\scrambler-mesh-hook.mjs
```

This is a thin wrapper that calls the Librarian MCP `scrambler_session_start` and `scrambler_session_closeout` tools from the mesh-fire CLI context. It does NOT duplicate Scrambler logic -- it is a call-through only.

Skeleton:

```javascript
// scrambler-mesh-hook.mjs
// Wires Scrambler MCP tools into THUNDERCLAP mesh-fire CLI
// A&A #2259 Row 2h close -- BP087

import { callLibrarianTool } from './librarian-mcp-client.mjs';

export async function scramblerSessionStart(sessionId) {
  return callLibrarianTool('scrambler_session_start', {
    agent: 'THUNDERCLAP_TRIAL_02',
    session_id: sessionId
  });
}

export async function scramblerSessionCloseout(sessionId, summary) {
  return callLibrarianTool('scrambler_session_closeout', {
    agent: 'THUNDERCLAP_TRIAL_02',
    session_id: sessionId,
    summary
  });
}
```

If `librarian-mcp-client.mjs` does not exist, Knight creates it as a thin MCP stdio client. If it does exist, Knight composes into it.

**NO new Supabase migrations. NO new Edge Functions. NO changes to `src/main/index.ts`.**

---

## §4 -- Acceptance Gates

### Gate σ1 -- Canon mint

The new eblet at:
```
C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_scrambler_primitive_librarian_mcp_not_supabase_row_2h_resolution_bp087.eblet.md
```

Must contain:

1. YAML front matter: `type: canon`, `session: BP087`, `status: BP087 HARD CANON`, `date: 2026-06-19`
2. LEAD section: Row 2h resolved. Scrambler is a librarian-mcp Python MCP subsystem, NOT a Supabase/Edge Function primitive. Zero new tables. Zero new Edge Functions.
3. WHAT section: Scrambler's mesh-wiring = calling `scrambler_session_start` and `scrambler_session_closeout` at THUNDERCLAP fire time.
4. MATRIX UPDATE section: Row 2h ❌ NOT WIRED (src/main/ + supabase) --> ✅ WIRED-VIA-MCP (librarian-mcp tools, called at mesh-fire). Rationale verbatim from §1.
5. DEPENDENCIES_UPSTREAM: pointer to `canon_scrambler_deterministic_sync_layer_A_and_A_2259_bp085`.
6. No em-dashes. No AI hallucination. Truth-Always.

### Gate σ2 -- Mesh-fire hook

- `tools/mesh-validation/scrambler-mesh-hook.mjs` exists and exports `scramblerSessionStart` and `scramblerSessionCloseout`.
- The THUNDERCLAP Trial 02 fire scaffold (ζ yoke or its implementation) calls both hooks at fire start and fire end.
- After a Trial 02 fire, `librarian-mcp/scrambler/resolution_log.jsonl` has a new entry with `agent: THUNDERCLAP_TRIAL_02`.
- `tsc` clean (if any TypeScript touched, which σ2 avoids by staying in `.mjs`).
- No Supabase migrations touched.

### Gate Row 2h Close

After both σ1 and σ2 pass:

Row 2h in the 8-row matrix transitions to:

```
Row 2h · Scrambler primitive  ✅ WIRED-VIA-MCP · librarian-mcp/scrambler/ (K407 LIVE) · mesh-fire hook in tools/mesh-validation/scrambler-mesh-hook.mjs · NOT a Supabase primitive · canon_scrambler_primitive_librarian_mcp_not_supabase_row_2h_resolution_bp087
```

---

## §5 -- Drift Protocol

**Truth-Always applies throughout.**

- If `librarian-mcp/src/server.ts` does NOT export `scrambler_session_start` / `scrambler_session_closeout` as MCP tools, Knight surfaces this inline and escalates to Bishop before writing σ2. Do NOT assume registration from the README alone.
- If `tools/mesh-validation/librarian-mcp-client.mjs` already exists with a different pattern, Knight composes into the existing pattern, does NOT create a conflicting second client.
- If K418 acceptance criteria in `PROMPT_KNIGHT_SESSION_K418_SCRAMBLER_TOUCHSTONE_AUTORECONCILE_B101.md` were already fulfilled (Scrambler B and C already wired), Knight notes this in the σ2 return receipt and reduces scope accordingly -- the hook may just need to call `touchstone_reconcile` instead of `scrambler_session_start` directly.
- If any upstream file is newer than this yoke's date (2026-06-19), Knight reads it before editing.
- Ascending Andon: Knight refuses to guess if `librarian-mcp-client.mjs` is absent. Instead, Knight returns a spec-stub for Bishop to confirm before coding it.

---

## §6 -- Composition

**Canon pointers (empirically confirmed in recon):**

- `canon_scrambler_deterministic_sync_layer_A_and_A_2259_bp085` -- parent Scrambler canon (HARD CANON)
- `AA_FORMAL_2259_THE_SCRAMBLER_B098.md` -- patent claim source (28-cycle permutation, zero AI)
- `PROMPT_KNIGHT_SESSION_K418_SCRAMBLER_TOUCHSTONE_AUTORECONCILE_B101.md` -- Triple-Redundant Scrambler architecture spec (K418)
- `canon_ascending_andon_right_fast_cheap_discipline_bp085` -- escalation discipline (refuse-to-guess)
- `canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053` -- drift surfaced inline
- `KNIGHT_YOKE_BLACK_MAMBA_THUNDERCLAP_100_FULL_WIRING_BP087.md` -- β6 row context ("mesh-distributed Plow's blade ordering is deterministic across peers")
- `KNIGHT_YOKE_BLACK_MAMBA_ZETA_THUNDERCLAP_TRIAL_02_FIRE_BP087.md` -- σ2 composes into this
- The 43%-context-multiplier canon: `canon_persistent_active_memory_crown_jewel_bp085` -- Scrambler resolution is an active-memory integrity event

**Statutes bindings per §8 below are the authoritative constraint layer. Canons above are composition, not override.**

---

## §7 -- Return Template

Knight returns ONE receipt covering both streams. Format:

```
SCRAMBLER RESOLUTION RECEIPT · BP087 · [ISO-8601 UTC]

RECON CONFIRMED:
- Scrambler lives at: librarian-mcp/scrambler/ (K407 LIVE)
- Zero presence in: src/main/ | platform/supabase/functions/
- MCP tools registered: [YES/NO -- empirical check of server.ts]
- K418 Triple-Redundant: [status per disk]

STREAM σ1 CANON MINT:
- File: [absolute path]
- Line count: [N]
- Status: [MINTED / FAILED]

STREAM σ2 MESH-FIRE HOOK:
- Files touched: [absolute paths]
- scramblerSessionStart wired: [YES/NO]
- scramblerSessionCloseout wired: [YES/NO]
- tsc: [CLEAN / ERRORS: list]
- resolution_log.jsonl updated after dry-run: [YES/NO/DEFERRED]

ROW 2H STATUS:
- Previous: ❌ NOT WIRED
- New: ✅ [WIRED-VIA-MCP / SPEC-ONLY-PENDING-CONFIRM]
- Canonical label: [verbatim from §4 Gate Row 2h Close above]

DRIFT SURFACED: [NONE / list items]
```

Empirical receipt only. No prose summary. No em-dashes. Truth-Always.

---

## §8 -- Statutes Binding

- **§2 IMMUTABLES:** Scrambler non-AI principle (zero LLM calls in Scrambler code) is immutable per A&A #2259. Knight does NOT add AI inference to the mesh hook.
- **§3 Sonnet 4.6 verbatim:** Model ID is Sonnet 4.6. NEVER "4.5". Use segs.
- **§4 Absolute paths:** Every file reference in this yoke is absolute. Knight returns absolute paths in receipt.
- **§14 BLOOD -- gadget-first:** Knight reads `librarian-mcp/src/server.ts` and `librarian-mcp/scrambler/README.md` BEFORE writing any code. If server.ts does not register the expected tools, Knight escalates rather than writing dead code.
- **§15 BLOOD -- Bishop-direct-Supabase:** There are NO Supabase migrations in this yoke. If Knight discovers a need for a Supabase migration, it ships `.sql` only -- Bishop applies via psql, NEVER delegate.
- **PowerShell separator:** `;` NOT `&&` in all shell commands.
- **No secrets echoed.** Canonical secrets path: `C:\Users\Administrator\.claude\state\secrets\22May2026.env`.

---

*Yoke authored by Bishop · SEG-P · BP087 · 2026-06-19 · Sonnet 4.6*
*Zero em-dashes confirmed. Absolute paths confirmed. §14 gadget-first confirmed.*
