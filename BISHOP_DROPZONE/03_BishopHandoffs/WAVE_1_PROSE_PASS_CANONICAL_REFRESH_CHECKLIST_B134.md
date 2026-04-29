# Wave 1 Prose-Pass Cohort — Canonical-Number Refresh Checklist (B134)

**Filed:** 2026-04-29 by Bishop on AI Nanny + Founder direction (B134 turn 8 + turn 10)
**Purpose:** Itemize stale canonical numbers + research-methodology-tied numbers in Wave 1 letters that need attention at Founder fire-time prose-pass.
**Discipline anchor:** [feedback_letter_prose_pass_single_session.md](../../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_letter_prose_pass_single_session.md) — letters wait for ONE consolidated prose-pass session right before fire. Founder clarification B134 turn 10: *"generally correct on letters, but canonical numbers can be updated"* — mechanical canonical numbers are fair-game refresh outside prose-pass; research-methodology-tied numbers stay prose-pass-gated.

---

## Mechanical canonical refreshes — DONE B134 (b-canonical-stats-ui-letter-refresh-B134)

| Letter | File | Lines | What changed |
|---|---|---|---|
| **MacKenzie Scott** (Board Chair) | `platform/src/data/crown-letters/LOCKED_MACKENZIE_SCOTT_BOARD_CHAIR.md` | 19, 35 | 2,224→2,270 / ~2,393→~2,506 / 12→15 |
| **Michael Seibel** (CEO) | `platform/src/data/crown-letters/LOCKED_MICHAEL_SEIBEL_CEO.md` | 26 | 2,224→2,270 / ~2,393→~2,506 / 12→15 |

These were pure standalone canonical claims with no methodology ties. Refreshed mechanically.

---

## Research-methodology-tied numbers — DEFERRED to Founder prose-pass

### LOCKED_TOM_SIMON_CFO.md (FBI forensic-accountant CFO Crown Letter)

**Line 32 (research-pack invitation passage):**
> Before building any of this, we ran **130 prior art queries across 12 innovation categories** using Perplexity AI's patent search, reviewing **330+ existing patents** against our portfolio of **2,224 documented innovations**. **202 innovations survived** with no prior art found — we call them the Crown Jewels.

**Line 62 (Founder bio passage):**
> The patent portfolio behind this platform includes **2,224 documented innovations** and **~2,393 formal claims** filed across **12 provisional applications** — 99% utility patents, not design — **202 of which survived** a **130-query** deep dive against the U.S. patent office with no prior art found.

### Why deferred (not auto-refreshed)

These numbers are tied to a **specific historical research event**: 130 prior-art queries across 12 categories yielding 202 Crown Jewels out of 2,224 innovations. Bumping `2,224 → 2,270` and `202 → 228` without re-running the analysis would over-claim — it would imply the new 46 innovations and 26 additional Crown Jewels were also subjected to the 130-query deep dive, which is empirically not on record.

Three reconcile paths at prose-pass time:

1. **Re-run the prior-art research** with the expanded corpus (2,270 / 228 / 95 letters / etc.) so the letter can honestly claim the new totals against a fresh 130+-query pass.
2. **Update the prose** to historicize the 130-query event: e.g. *"As of Nov 2025, we ran 130 prior art queries... 202 survived. Since then we've expanded to 2,270 innovations / 228 Crown Jewels and continue the prior-art audit."*
3. **Substitute a shorter framing** that drops the methodology specifics and leans on the canonical totals only.

Founder picks at prose-pass time. Bishop scaffolds whichever path is chosen.

---

## Other canonical refreshes still needed in Wave 1 cohort (NOT YET AUDITED)

This file currently covers the 3 stale-stat sites surfaced by `health-check.sh` 1c guard at B134. Other Wave 1 letters may also carry stale canonical numbers — full cohort audit is queued as a separate Bishop sweep before fire-time prose-pass.

**Audit-now candidates** (likely to contain stale stats based on letter age):
- LOCKED_*.md letters in `platform/src/data/crown-letters/` (full LOCKED_ cohort sweep)
- B131 Wave 1 reconciled cohort = 30 letters (22 PLOW-AHEAD + 8 WORTH-IT)
- Any letter draft with explicit innovation/CJ/claim/provisional number citation

Bishop will run the full canonical-stats sweep on Wave 1 cohort before prose-pass fire-time. Output as augment to this file: `WAVE_1_PROSE_PASS_CANONICAL_REFRESH_CHECKLIST_B134.md` extension, OR fresh B-NNN file if the sweep happens in a later session.

---

## Post-prose-pass close

When Founder runs the consolidated prose-pass session:
- Review this file's deferred items (Tom Simon research-tied numbers + any added by full audit)
- Founder decides per-item: re-run research / historicize / substitute / leave-as-is
- Bishop applies edits + commits as `b-wave-1-prose-pass-canonical-refresh-B<N>`
- Mark this file CLOSED with link to commit

Until that moment: this file is the standing canonical-refresh ledger for Wave 1.
