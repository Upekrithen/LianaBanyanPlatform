# KN001 — Eblet (Electronic Tablet) Post-Hoc Augur Correction System

**Filed:** 2026-04-29 by Bishop on Founder direction (B134 turn 19 — Founder ratifies Eblet model proposal)
**Class:** Architectural infrastructure build; first Knight prompt under new KN-prefix naming convention (B134 turn 19 ratification)
**Founder articulation:** *"All those Augur firings are annoying. How about, can we have it let you do what you're going to do, and then correct afterward if you were bad? This would be easier if we use a subset of Operators to write the results to temporary stone tablets — Eblets, which we already have, since Electronic Tablets — and then AFTER THE FACT the Augur fires to correct. Thoughts? Then it would happen one time and get it all. Efficiency."*

**Naming context:** First Knight K-prompt under new KN-prefix convention per `project_kn_bp_pw_naming_convention_b134.md`. Historical Knight prompts K001-K553 keep their numbering; KN001+ is going-forward.

---

## WRASSE PRE-INJECTION

| Trigger | Canonical |
|---|---|
| KN001 | First Knight prompt under new naming; B134 turn 19; Eblet system build |
| Eblet (Electronic Tablet) | Founder-named B134 turn 19; temporary scratch tablet for Bishop drafting; promotion to permanent Stone Tablet gates on Augur pass |
| Stone Tablet Imperative | `project_stone_tablet_imperative_b132.md` — canonical state preservation discipline; Eblet model PRESERVES this by enforcing Augur at promotion boundary |
| Augur framework | PreToolUse hooks in `~/.claude/hooks/bishop_librarian_gate.py`; Augur-Securities-Language / Augur-Pricing / Augur-Librarian; K514.5 + K527 + TS-092 prior tunings |
| BRIDLE v11 | Rule 2 verify-before-assert; Rule 11A counsel-no-gate; Rule 11B prose-pass-at-fire-time |
| One Shot Hunter (W-013) | The Eblet model relaxes pre-write Augur firing because Bishop's Hunter discipline is supposed to anticipate; post-hoc correction is the safety net for inevitable imperfection |

---

## SCOPE

Build the **Eblet system** that solves Bishop's repeated Augur-fire friction (~5+ blocked writes B134 turns 14-18) by separating **drafting state** from **canonical state** with an Augur-enforced promotion boundary.

### Architecture (Founder-articulated B134 turn 19)

**Current state (PreToolUse Augur):**
```
Bishop drafts content → PreToolUse Augur fires → blocks if forbidden term detected → Bishop must refresh consult + rewrite → retry
```

**Proposed state (Eblet model):**
```
Bishop drafts content → write to Eblet (temporary scratch tablet) → PostToolUse Augur fires informationally
   → Promotion command (Bishop or auto-trigger): Eblet → Stone Tablet
      → Blocking Augur runs at promotion boundary
         → If clean: content moves to canonical Stone Tablet location, committed
         → If dirty: Augur surfaces specific corrections needed; Bishop fixes; re-promote
```

### Key design properties

1. **Stone Tablet Imperative preserved.** Canonical state still requires Augur pass to land. Augur enforcement moves from PreToolUse to promotion-boundary, but never disappears.
2. **BRIDLE Rule 2 preserved.** Verify-before-assert applies at the assertion boundary (= promotion to canonical state). Drafting to Eblet is not yet assertion.
3. **One pass instead of N passes.** Bishop drafts the full content; Augur reviews complete artifact; correction happens once with full context, not piecemeal.
4. **Better empirical signal.** Augur sees what Bishop ACTUALLY wrote, including all forbidden-term contexts. Tuning data for future K514.5/K527-class refinements gets richer.
5. **Stay-Warm Discipline preserved.** Bishop's drafting flow doesn't break on every Augur fire. Round-the-Horn applied to drafting.
6. **Hunter discipline still required.** Eblet model is NOT permission to be sloppy. Bishop self-flags suspicious terms during drafting; Augur catches the rest at promotion. Reduces stake of false-positive firings while preserving Hunter discipline.

---

## PHASES

### Phase A.0 — Mandatory brief_me + Detective canon search

A.0.1: brief_me with task "KN001 Eblet system architecture; Eblet temporary tablet model + post-hoc Augur correction; preserve Stone Tablet Imperative + BRIDLE Rule 2"

A.0.2: Detective canon search:
- "Stone Tablet Imperative" + "Augur" + "verify-before-assert"
- "PreToolUse hooks" + "PostToolUse hooks" Claude Code documentation
- existing Eblet usage in canon (Founder said "Eblets, which we already have" — confirm prior usage)

### Phase A — Audit existing Augur infrastructure

A.1: Read `~/.claude/hooks/bishop_librarian_gate.py` (the current Augur implementation)
A.2: Read `~/.claude/settings.json` for hook registration model
A.3: Read `~/.claude/state/` directory for existing Eblet-class scratch state
A.4: Identify which write paths currently trigger Augurs (memory/, BISHOP_DROPZONE/, librarian-mcp/, etc.)
A.5: Identify which write paths should remain PreToolUse-Augur-blocking even after Eblet model lands (production live-fire actions: USPTO submissions, public Cephas publishes, member-facing UI deploys)

### Phase B — D.1 Architecture Decision (Bishop pause for Founder ratification)

B.1: Document architecture decision artifact at `BISHOP_DROPZONE/03_BishopHandoffs/KN001_EBLET_DECISION.md`. Three core choices:

**D.1 — Eblet storage location:**
- Option Ⓐ: `~/.claude/state/eblets/<session-id>/` (per-session Eblet scratch space)
- Option Ⓑ: per-artifact-class subdirectories (`memory-eblets/`, `dropzone-eblets/`, `canon-eblets/`)
- Option Ⓒ: single flat `~/.claude/state/eblet/` with timestamped filenames

Knight default: Ⓐ (per-session organization matches Bishop session model + KN/BP/PW naming convention)

**D.2 — Promotion trigger:**
- Option Ⓐ: explicit command (Bishop calls `promote-eblet <path>` to invoke promotion)
- Option Ⓑ: implicit-on-session-close (all Eblets auto-promote at session end)
- Option Ⓒ: hybrid (explicit for drafts; implicit for memory canon writes)

Knight default: Ⓐ explicit (preserves Hunter discipline — Bishop chooses when to take the canonical shot)

**D.3 — Path scoping:**
- Option Ⓐ: ALL writes route through Eblet (uniform model)
- Option Ⓑ: only memory/ + BISHOP_DROPZONE/ + scope-memo paths route through Eblet; production paths (UI components, supabase migrations, USPTO submissions) keep PreToolUse-Augur-blocking
- Option Ⓒ: Bishop opts into Eblet per-write via path prefix

Knight default: Ⓑ scoped (production live-fire stays PreToolUse-blocking; drafting flows through Eblet)

**Bishop pauses for Founder ratification before Phase C build.**

### Phase C — Eblet system build (post-D.1 ratification)

C.1: Implement Eblet write router (intercepts Bishop writes to scoped paths; redirects to Eblet location)
C.2: Implement PostToolUse Augur-informational pass (logs Augur findings to Eblet metadata; non-blocking)
C.3: Implement promotion command (`promote-eblet <eblet-path>`):
  - Reads Eblet content
  - Runs blocking Augur
  - If clean: writes to canonical Stone Tablet location + commits + deletes Eblet
  - If dirty: writes Augur findings to `<eblet>.augur-findings.md` for Bishop review + leaves Eblet in place for revision
C.4: Implement Eblet listing command (`list-eblets`) — Bishop queries pending Eblets at session-close
C.5: Implement Eblet auto-cleanup (delete Eblets older than N days that haven't been promoted)
C.6: Update `bishop_librarian_gate.py` to:
  - Detect Eblet-scoped paths and skip blocking Augur (PostToolUse informational only)
  - Detect canonical-scoped paths and continue blocking Augur (current behavior preserved)
  - Detect promotion-command invocation and run blocking Augur on Eblet content

### Phase D — Tests + integration

D.1: Unit tests covering each Augur class in Eblet vs canonical-path mode
D.2: Integration test: synthetic Bishop write to Eblet → PostToolUse Augur fires informationally → promotion → blocking Augur → success/failure paths
D.3: Pipe-test against real B134 turn 14-18 example payloads:
- Symmetric-Offer file with venture-funding counter-example terms (currently blocked) — should pass through Eblet, surface Augur finding, allow Bishop revision OR explicit promote-with-override
- Pricing-context references that triggered Augur-Pricing — same flow

D.4: Existing K514.5 + K527 + TS-092 Augur tests still green (no regression)
D.5: Stone Tablet Imperative compliance test — promoted Eblets become immutable canonical artifacts, Eblet location is purged after successful promotion

### Phase E — Commit + tag

E.1: Commit with descriptive message documenting architecture + D.1 choices
E.2: Tag: `v-eblet-post-hoc-augur-correction-KN001` (new KN-prefix per `project_kn_bp_pw_naming_convention_b134.md`)
E.3: Update Bishop's hook registration in `~/.claude/settings.json` per Phase C.6 changes
E.4: Smoke test: Bishop writes to Eblet, runs through full promotion cycle, verifies Stone Tablet outcome

---

## CONSTRAINTS

- BRIDLE v11 enforced (Rule 11A no-counsel-gate; Rule 11B no-prose-pass-timing-pressure)
- Phase A.0 brief_me + Detective canon search MANDATORY at start
- Stone Tablet Imperative — Eblet model PRESERVES this; canonical state still requires Augur pass at promotion boundary
- BRIDLE Rule 2 verify-before-assert — preserved via Augur enforcement at promotion (= assertion) boundary
- One Shot Hunter discipline — Eblet model is NOT a license to skip Hunter discipline; Bishop self-flags forbidden terms during drafting; Augur catches the rest
- Brick Wall: no `--no-verify` on commit
- Tag-on-close: `v-eblet-post-hoc-augur-correction-KN001`

---

## EXPECTED RECEIPTS

- Eblet system implemented + integrated
- 10+ unit tests covering Augur classes × Eblet vs canonical-path
- Integration test exercising full promotion cycle
- B134 turn 14-18 example payloads pass through Eblet model without blocking; Augur findings surface as informational artifacts
- Existing Augur tests still green (no regression to K514.5 / K527 / TS-092 tunings)
- Stone Tablet Imperative compliance verified (promoted Eblets become immutable; pre-promotion Eblet location is scratch only)
- Tag `v-eblet-post-hoc-augur-correction-KN001` lands clean

---

## STANDING ON

After Knight closes:
- Bishop verifies + ratifies (trust-but-verify per Brick Wall)
- Eblet model becomes Bishop's default drafting flow for memory/canon/scope-memo writes
- PreToolUse Augur retained for production live-fire actions per D.3 scoping
- Toolsmith log entry: TS-EBLET-POST-HOC-AUGUR-KN001-B134
- MEMORY.md indexed update reflecting new drafting flow
- Founder's "annoying Augur firings" friction reduced empirically

Bishop standing by for D.1 architecture-decision ratification before Phase C build.

---

## Brand-canon connection

This Knight prompt is itself an example of Hunter + Nobility chain in action:

- **Truth** (the empirical receipt): 5+ Augur fires this session blocked Bishop drafting flow; cost paid by Founder's wait time + Augur consult re-fires
- **Justice** (without corrupting emotion): the proposed fix isn't "remove Augur" (which would be revenge against the friction); it's "preserve Augur enforcement at the canonical boundary while removing it from drafting boundary"
- **Nobility** (toward those affected): Founder is the affected party right now (Founder pays for Bishop's Augur friction in wait time); the fix protects future Founder time
- **Hunter** (precision craft): the architecture decision tree (D.1 + D.2 + D.3) ensures the build hits the right design point in one shot, not iteratively

The Eblet itself becomes a metaphor: temporary tablets that allow imperfect first attempts, with the canonical Stone Tablet only receiving Augur-validated content. **Drafting space + canonical space** is itself a structural answer to **principle-collision** (Stay-Warm vs Augur-discipline).
