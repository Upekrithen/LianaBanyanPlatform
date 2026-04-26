# INNOVATION THRESH #2301 — Dragonriders (Phase-Shift / Sandbox Contingency Operators)

**Filed:** B123-late (Founder articulation), formalized B126 (K516 reduction-to-practice 2026-04-26)
**Status:** SHIPPED — K516 (2026-04-26) reduced-to-practice (sandbox Phase-Shift integrated with Bishop Wing Consensus Layer). 8/8 verification checks passed.
**Class:** New Stitchpunk class / TimeWave Architecture component
**Cluster:** AI substrate / Temporal-state / Wing Consensus enhancement (#2295 Tier 3)
**Companion entries:** #2299 (Chronos+HourGlass), #2300 (Chroniclers), #2295 (Augur MAJCOM), #2306 (Embedded Correspondent + Bureau)

**Pern Reference (Founder B123-late):** Dragonriders go BETWEEN to different times AND locations to copy components into Sandbox Contingency Operators / Mimic Trunks. Here: when the Wing Consensus Layer reaches a borderline decision (warn), the Dragonrider Phase-Shifts into an alternate sandbox timeline, tests the action, and returns a confidence-weighted prediction — allowing the Consensus Layer to escalate warn → block if predicted harm is found.

---

## K516 Reduction-to-Practice Anchor (2026-04-26)

**Tag:** `v-dragonriders-sandbox-K516`

**Files shipped:**
- `discipline_wing/dragonrider.py` — Phase-Shift sandbox forking, risk evaluation, confidence scoring, tablet write, `query_phase_shifts()`
- `discipline_wing/engine.py` — Dragonrider integration: Phase-Shift call after Consensus arbitration; escalate warn→block when confidence ≥ 0.7
- `librarian-mcp/src/server.ts` — MCP tool `dragonrider_phase_shifts` for querying Phase-Shift history
- `librarian-mcp-helm-pwa/src/renderer/src/components/DragonriderPanel.tsx` — Phase-Shift visualization dashboard ("Phase-Shift" nav in Helm)
- `~/.claude/state/bishop_wing_augurs.json` — Added `dragonrider_enabled: false` (per-Wing opt-in)

**Design constraints (operational):**
- **No primary state mutation** — sandbox is in-memory only; primary Wing state is read-only from sandbox perspective; sandbox lifetime = one Phase-Shift evaluation; auto-cleaned after return
- **Voluntary** — `dragonrider_enabled` is per-Wing opt-in (default `false`)
- **Fail-safe** — any Phase-Shift error → graceful fallback, Consensus proceeds without Dragonrider input + logs

**Verification (8/8 PASSED):**

| Check | Result |
|---|---|
| C.1 Borderline warn triggers Dragonrider; non-warn does not | OK |
| C.2 Sandbox is true copy — modifying sandbox doesn't affect primary | OK |
| C.3 Sandbox auto-cleans: no orphaned temp files | OK |
| C.4 Outcome trace captured to Phase-Shift tablet | OK |
| C.5 High-risk sandbox content yields escalate_to_block confidence | OK (confidence=1.00) |
| C.6 Dragonrider mode toggleable per Wing config | OK |
| C.7 Performance: Phase-Shift evaluation p95 < 5s | OK (0.5ms) |
| C.8 Dragonrider failure: graceful fallback, no exception propagated | OK |

---

## The architectural primitive

A **Dragonrider** is a sandbox Phase-Shift agent that:
1. Detects borderline Wing Consensus decisions (warn, not block or allow)
2. Forks the current Wing state into a true copy sandbox (in-memory, no primary mutation)
3. Runs the hypothetical action in the sandbox — evaluates both Bureau risk-pattern Augurs and forward-scan patterns against the content
4. Returns a confidence-weighted prediction: `escalate_to_block` (≥70% confidence) or `allow_as_warned` (<70%)
5. Consensus Layer accepts the Dragonrider prediction and optionally escalates warn → block

**Why this matters:**
- Wing Augurs fire on trigger patterns (K514); Chroniclers record time-state (K515); Bureau watches reasoning (K515). But a borderline warn — where content almost violates a rule — has no mechanism to evaluate forward risk before allowing. The Dragonrider fills this gap: *"If we let this through, what happens next?"*

---

## Patent claims (provisional — counsel-rewriteable)

**Claim 1 (independent):** A method for hypothetical-action evaluation in a multi-rule AI discipline-enforcement system comprising: (a) detection of a borderline enforcement signal wherein at least one advisory rule fires but no critical rule fires; (b) sandbox forking of the current enforcement state into an isolated copy where the primary state is read-only from the sandbox perspective; (c) execution of the hypothetical action within the sandbox; (d) confidence-weighted outcome prediction based on downstream risk-pattern evaluation within the sandbox; (e) optional escalation of the borderline signal to a blocking decision when predicted confidence exceeds a configurable threshold.

**Claim 2 (dependent on 1):** wherein sandbox state forking uses copy-on-write semantics for enforcement configuration and session context, and the sandbox is auto-destroyed after the single Phase-Shift evaluation without propagating any state back to the primary enforcement plane.

**Claim 3 (dependent on 1):** wherein the confidence score is computed as a weighted sum of downstream risk signals, with critical-class risks weighted at 0.5 each and advisory-class risks at 0.2 each, capped at 1.0, and the escalation threshold is configurable per Wing.

---

## Cross-references

- A&A #2295 (Augur MAJCOM) — Tier 3 Wing Consensus Layer that calls Dragonrider for borderline decisions
- A&A #2299 (Chronos+HourGlass) — time-state aggregation; Dragonriders inform which Chronicler tablets to restore for Mimic Trunk creation
- A&A #2300 (Chroniclers) — per-component state that Dragonriders use as substrate for Phase-Shift forks
- A&A #2301 (this entry) — Dragonriders Phase-Shift + Sandbox Contingency Operators
- A&A #2306 (Embedded Correspondent + Bureau) — Bureau risk-pattern Augurs are re-used in the Dragonrider sandbox evaluation (code reuse)
- [project_chronos_chroniclers_dragonriders_timewave.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_chronos_chroniclers_dragonriders_timewave.md) — full Founder B123-late articulation

---

*Filed B126, K516 reduction-to-practice 2026-04-26. Dragonriders go BETWEEN. Long haul. Always.*

— Knight K516, B126
