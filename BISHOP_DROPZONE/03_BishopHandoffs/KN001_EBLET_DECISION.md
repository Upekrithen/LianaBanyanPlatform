# KN001 — Eblet Architecture Decision Record
**D.1 — Three Core Choices for Founder Ratification**

**Filed:** 2026-04-29, Knight KN001 Phase B output  
**Awaiting:** Founder ratification before Phase C build begins  
**Context:** KN001 EBLET_POST_HOC_AUGUR_CORRECTION_B134  
**Phase A Audit:** Complete — see findings below

---

## Phase A Audit Findings (Knight's Recon)

### What exists now

**Hook registration** (`~/.claude/settings.json`):
- `PreToolUse` on `Write|Edit` → `bishop_librarian_gate.py` → `discipline_wing.engine.evaluate()`
- `PreToolUse` on `Bash` → `bishop_librarian_gate.py` (substrate cache freshness check)
- `PreToolUse` on `mcp__.*` → `bishop_librarian_gate.py` (substrate cache freshness check)
- `PostToolUse` on `Bash(firebase deploy*)` → health check (separate; unrelated to Augur)
- `PostToolUse` on librarian tools → timestamp update (separate; unrelated to Augur)

**Note: There is currently NO PostToolUse hook for Write/Edit.**  
This means the Eblet PostToolUse informational pass requires a new hook registration.

**The Wing Engine** (`discipline_wing/engine.py`):
- Loads Augur configs from `~/.claude/state/wing_augurs/*.json`
- Five active Augurs: `augur_closeout`, `augur_librarian`, `augur_pricing`, `augur_securities_language`, `augur_toolsmith`
- Evaluates in parallel; Consensus Layer arbitrates; Dragonrider Phase-Shift for borderline decisions
- Each Augur config has `exclusion_path_patterns` — paths that bypass that specific Augur entirely
- Fail-safe: engine errors → `exit 0` (never block legitimate work)

**State directory** (`~/.claude/state/`):
```
bureau_augurs/       — Bureau (B-class) Augur state
chroniclers/         — Per-Augur tablet entries (K515 Chronicler UpTick)
correspondents/      — Correspondent state
dragonrider_tablets/ — Phase-Shift records (K516)
timewave_security/   — Security event records (K517)
wing_augurs/         — Augur config JSONs (the five Augurs)
bishop_wing_augurs.json          — Wing config (augur_ids, consensus_rules, flags)
bishop_last_librarian_consult.ts — Librarian freshness timestamp
wing_telemetry.jsonl             — Append-only telemetry
```

**No existing Eblet infrastructure.** Nothing in `~/.claude/state/` is currently named `eblet*`.  
Founder said "Eblets, which we already have" — this may refer to the conceptual tablet metaphor  
(Stone Tablets → temporary Eblets), not a pre-built system.

### Which write paths currently block

All paths that match Augur `file_path_patterns` and pass exclusion filters:
- `.md`, `.txt`, `.html`, `.tsx`, `.ts` files trigger `augur_securities_language` (critical)
- `BISHOP_DROPZONE/12_Innovations_AA/` is already excluded from `augur_securities_language`
- `discipline_wing/`, `wing_augurs/`, `.py` are already excluded from most Augurs
- `letters/counsel`, `Asteroid-ProofVault/` already excluded

### Which write paths should remain PreToolUse-blocking post-Eblet

Per Founder articulation and BRIDLE Rule 2 (verify-before-assert at canonical boundary):
- `platform/src/` (live-fire UI components — member-facing)
- `platform/supabase/migrations/` (database mutations — irreversible)
- Cephas Hugo content (`Cephas/cephas-hugo/content/`) — public published letters
- USPTO submission files (any path matching `USPTO` or `provisional`)
- `.env` files (already blocked by secrets hygiene, separate layer)

### Augur exclusion mechanism — ready to use

The engine already supports per-Augur `exclusion_path_patterns`. To route Eblet-scoped writes  
around the blocking Augur, Knight adds the Eblet path to each Augur's `exclusion_path_patterns`.  
No engine changes required for the "skip blocking Augur on Eblet writes" step.

---

## Architecture Decision D.1 — Eblet Storage Location

### Option Ⓐ: Per-session scratch space (Knight default)
```
~/.claude/state/eblets/<session-id>/<artifact-name>.eblet.md
```
- Organizes Eblets by session (matches Bishop's session model + KN/BP/PW naming)
- Session-ID suffix makes Eblets traceable to the Bishop session that created them
- Cleanup is natural: expired sessions → expired Eblets
- Allows Bishop to list all pending Eblets from a specific session: `list-eblets --session B134`

### Option Ⓑ: Per-artifact-class subdirectories
```
~/.claude/state/eblets/memory-eblets/<name>.eblet.md
~/.claude/state/eblets/dropzone-eblets/<name>.eblet.md
~/.claude/state/eblets/canon-eblets/<name>.eblet.md
```
- Organizes by destination class (easier to see "what kind of canonical write is pending")
- More complex routing logic at write time
- Promotion logic must know each class's canonical destination

### Option Ⓒ: Single flat directory
```
~/.claude/state/eblets/<timestamp>-<artifact-name>.eblet.md
```
- Simplest to implement
- No session or class context in path — harder to triage pending Eblets
- Timestamp ensures uniqueness

**Knight default: Ⓐ (per-session)**  
Rationale: session traceability + cleanup alignment. Bishop session IDs (B134, B135…) are already the primary organizational unit. Eblets that outlive a session without promotion are orphaned Eblets — per-session organization surfaces this cleanly.

---

## Architecture Decision D.2 — Promotion Trigger

### Option Ⓐ: Explicit command (Knight default)
Bishop calls `promote-eblet <eblet-path>` to trigger promotion.  
The command: reads Eblet → runs blocking Augur → success/failure output.

### Option Ⓑ: Implicit-on-session-close
All pending Eblets auto-promote at `SessionEnd` hook.

### Option Ⓒ: Hybrid
- Explicit for scope memos / memory writes (Bishop chooses the promotion shot)
- Implicit at session-close for low-stakes Eblets (housekeeping writes)

**Knight default: Ⓐ explicit**  
Rationale: preserves Hunter discipline. The explicit `promote-eblet` command is Bishop's  
"canonical shot" — a deliberate assertion that the content is ready for permanent record.  
Implicit auto-promotion would degrade into the same friction pattern: Augur fires at session end  
on a batch of Eblets and Bishop has no chance to revise before close.

---

## Architecture Decision D.3 — Path Scoping

### Option Ⓐ: ALL writes route through Eblet (uniform model)
Every Write/Edit on a canonical path → Eblet first, then explicit promote.

### Option Ⓑ: Scoped routing — drafting → Eblet; production → PreToolUse-block (Knight default)

**Eblet-routed paths (bypass PreToolUse blocking Augur; PostToolUse informational only):**
- `~/.claude/memory/` (Bishop's canon memory files)
- `BISHOP_DROPZONE/` (scope memos, handoffs, canon artifacts — not yet canonical)
- `librarian-mcp/stitchpunks/` (Stone Tablet writes for Scribes/Cathedrals)
- `CONTEXT_MANAGEMENT/` (milestone handoffs, context management docs)

**PreToolUse-blocking paths (unchanged — production live-fire):**
- `platform/src/` (live member-facing UI)
- `platform/supabase/` (database migrations — irreversible)
- `Cephas/cephas-hugo/content/` (public published letters)
- Any path matching USPTO submission patterns

### Option Ⓒ: Bishop opts in per-write via path prefix
Bishop explicitly writes to `~/.claude/state/eblets/...` to trigger Eblet routing.  
Canonical paths keep PreToolUse blocking unless Bishop manually routes to Eblet.

**Knight default: Ⓑ scoped**  
Rationale: B134 turns 14-18 friction came specifically from memory/BISHOP_DROPZONE writes, not  
from platform/UI writes. Scoped routing targets exactly the friction source while leaving  
production safety gates untouched. Option Ⓐ would relax production gates (over-correction);  
Option Ⓒ adds cognitive overhead on every write (under-correction).

---

## Implementation Map (Phase C — awaiting ratification)

```
Phase C artifact              Location                          Purpose
─────────────────────────────────────────────────────────────────────────────
eblet_router.py               discipline_wing/eblet_router.py   Path-routing logic
promote_eblet.py              discipline_wing/promote_eblet.py  Promotion command
list_eblets.py                discipline_wing/list_eblets.py    List pending Eblets
eblet_config.json             ~/.claude/state/eblet_config.json Eblet scope config
bishop_librarian_gate.py      ~/ .claude/hooks/ (MODIFIED)      Add Eblet path detection
settings.json                 ~/.claude/settings.json (MODIFIED) Add PostToolUse Write|Edit hook
```

### settings.json change needed for PostToolUse Write|Edit

Currently there is NO PostToolUse hook for Write|Edit. For the informational PostToolUse  
Augur pass, Knight must add a new entry:

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit|StrReplace",
      "hooks": [{
        "type": "command",
        "command": "python3 ~/.claude/hooks/bishop_eblet_post_hook.py",
        "timeout": 5
      }]
    }
  ]
}
```

`bishop_eblet_post_hook.py` — new hook:
- Reads the file_path from PostToolUse event data
- If path is in Eblet-scoped set → run informational Augur pass → log findings to `<path>.augur-findings.md` (non-blocking)
- If path is NOT in Eblet-scoped set → no-op (production paths have PreToolUse blocking; PostToolUse would be redundant)

---

## Augur config changes needed (Phase C)

Each of the five Augurs in `~/.claude/state/wing_augurs/` needs `exclusion_path_patterns` updated  
to include the Eblet path pattern:

```json
"exclusion_path_patterns": [
  "... existing exclusions ...",
  "\\.eblet\\.md$",
  "state/eblets/"
]
```

This ensures that PreToolUse writes to `~/.claude/state/eblets/...` bypass the blocking Augur.  
The PostToolUse informational pass (via `bishop_eblet_post_hook.py`) still runs for signal,  
but non-blocking.

---

## BRIDLE v11 Preservation Assessment

| Rule | Status after Eblet |
|---|---|
| Rule 2 (verify-before-assert) | **PRESERVED** — Augur enforcement moves to promotion boundary (assertion boundary). Writing to Eblet is drafting, not asserting. |
| Rule 11A (counsel-no-gate) | **PRESERVED** — Eblet informational Augur is informational only; no gate at draft time. |
| Rule 11B (prose-pass-at-fire-time) | **PRESERVED** — Augur sees complete artifact at promotion time; better full-context evaluation than piecemeal PreToolUse. |

## Stone Tablet Imperative Preservation Assessment

Stone Tablet Imperative (Straight-Six Memory Reorg / B132): canonical state must be  
preserved with high fidelity; no casual overwrites.

**Preservation mechanism:** The promotion boundary enforces the Imperative.  
- Eblet location = scratch space (not canonical, not committed)
- Canonical Stone Tablet location = only reachable via promotion → blocking Augur pass → commit
- Failed promotion: Augur findings surface; Eblet stays in scratch; canonical location unchanged
- Successful promotion: Eblet content → canonical location → committed → Eblet purged

The Imperative is **stronger** post-Eblet, not weaker:
canonical state receives only Augur-validated content (previously, PreToolUse could be bypassed  
on a fail-open engine error; Eblet model requires an explicit promotion command on top of that).

---

## Knight recommendation summary

| Decision | Knight Default | Confidence |
|---|---|---|
| D.1 Storage | Ⓐ per-session `~/.claude/state/eblets/<session-id>/` | High |
| D.2 Trigger | Ⓐ explicit `promote-eblet <path>` command | High |
| D.3 Scoping | Ⓑ memory + BISHOP_DROPZONE + librarian-mcp stitchpunks + CONTEXT_MANAGEMENT → Eblet; platform/src + supabase + Cephas/content + USPTO → PreToolUse-block unchanged | High |

**Founder ratification needed on all three choices before Phase C build.**  
Knight stands by to execute Phase C immediately upon ratification.  
Estimated Phase C build time: 90–120 minutes (6 new/modified files + settings.json + 5 Augur JSONs).

---

*Knight KN001 Phase B — filed 2026-04-29*
