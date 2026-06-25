# BISHOP SYNTHESIS · M24 FULL POWER WIRE-UP · BP092
## One-Page Founder Brief · 2026-06-22 · Sonnet 4.6

---

## What this Marathon delivers

M12 scored 61.9%. M13c in-flight is trending ~83%. The gap to ≥90% is three missing mechanisms — each a real swing, not a batchcheck. M24 wires all three simultaneously.

**Block 1 + 2 — Army Ants Posse Decomposition (BP091 CANON)**
Hard questions that stump the council get decomposed into ≤5 atomic sub-claims. Each sub-claim is dispatched to a tier-appropriate peer in parallel (the army ants attack the buffalo from five directions). Sub-claim answers are synthesized into an aggregate. If a sub-claim is still contested, the swarm recurses (max depth 2). This is the BREADTH primitive — orthogonal to Plow Loop (depth) and Star Chamber (consensus). New modules: `src/main/army_ants/posse_decompose.ts` and `posse_swarm.ts`. New tables: `posse_sub_claims`, `posse_swarm_runs`.

**Block 3 — Tier 2 Flagship Unblock**
The Tier 2 block in `validate-relay.mjs` is currently a 2-line stub: `BLOCKED` printed, nothing called. Block 3 wires actual Anthropic Claude Sonnet 4.6 API (primary) and OpenAI GPT-4o (fallback) with a Joules-denominated budget meter ($5 default per 42Q sweep). Default flag flipped from `--tier2-flagship=false` to `true`. New module: `src/main/tier2/flagship_escalate.ts`. New table: `tier2_flagship_runs`.

**Block 4 — ABSTAIN Auto-Re-Fire Protocol**
Two bugs fixed. (1) The `_abstainForcedEscalation` flag is set AFTER the polling loop exits, so it never triggers the in-loop escalation check — fixed by adding a pre-scan on each poll iteration. (2) After Tier 1 tiebreaker fails, the cascade currently falls through to a log line and stops — no Posse call, no Tier 2 call. Block 4 wires the full cascade: ABSTAIN → Tier 1 qwen2.5:7b → Posse swarm → Tier 2 flagship → Tier 3 human-flagged record. New table: `escalation_log`. Helper functions: `logEscalation`, `buildResult`, `joulesRemainingRef`.

**Block 5 — Integration Tests**
Unit tests (mocked LLM) for Posse decomposition. Full ABSTAIN cascade integration test. 7Q smoke run confirming receipt schema includes Posse + Tier 2 fields.

**Block 6 — v0.7.0 Ship**
Version bump 0.6.1 → 0.7.0 (new architectural capability justifies minor bump). `npm run dist:win` · NSIS · SHA256 · `latest.yml` · `version_trust.json` (canonical Tower source per BP090). Firebase hosting:mnemosyne deploy. M21 fleet auto-update toggle for all 0.6.1 peers.

**Block 7 — M13c++ Re-Fire**
Full 42Q canonical sweep with all three powers live. Target ≥90%. KniPr receipt at `KNIPR_M13c_FULLPOWER_RECEIPT_BP092.md`. If ≥90%: M24 sealed. If <90%: cascade gap analysis and targeted re-work before sealing.

**Block 8 — Deploy-All-Touched Gate + KniPr Seal**
8-module checklist. 4 migrations confirmed applied. Firebase confirmed deployed. Fleet confirmed on 0.7.0. M13c++ score confirmed. Final KniPr sealed.

---

## Why this unblocks FULL POWER

The three components are NOT cosmetic. Each addresses a documented empirical failure mode from M12:

| M12 Finding | Root Cause | M24 Fix |
|---|---|---|
| 3 questions contested after escalation (Finding 5) | No Posse, no Tier 2 — Tier 3 just logged and quit | Block 2 Posse swarm + Block 3 Tier 2 fill the gap |
| `_abstainForcedEscalation` never fires in-loop | Flag scope bug | Block 4 pre-scan |
| Tier 2 stub BLOCKED | Default off, no API wiring | Block 3 + default flip |

With all three live, the cascade is: Tier 1 free → Posse free → Tier 2 paid (budget-metered) → Tier 3 human. Only the hardest 5–10% of questions should reach Tier 2 or Tier 3.

---

## Estimated wall-clock

**M24a (Blocks PRE + 1 + 2 + 4):** 8–12 hrs Knight
**M24b (Blocks 3 + 5 + 6 + 7 + 8):** 6–10 hrs Knight
**Total:** 14–22 hrs · recommend M24a fires first, Bishop reviews PRE-BLOCK gadget output before M24b fires

---

## 5 Open Questions (Founder ratify required before Knight fires)

1. **Tier 2 budget cap per 42Q sweep** — $5 USD (5000 Joules) proposed. Y/N or specify amount.
2. **Posse max recursion depth** — 2 proposed. Y/N or specify depth.
3. **Posse max sub-claims per decomposition** — 5 proposed. Y/N or specify count.
4. **Tier 2 vendor priority** — Anthropic Sonnet 4.6 first, GPT-4o fallback. Y/N or reverse.
5. **ABSTAIN cascade order** — Tier 1 → Posse → Tier 2 → Tier 3 human. Y to lock.

---

*Bishop SEG · Sonnet 4.6 · BP092 · 2026-06-22 · Caithedral™ · The Substrate Cure to AI Amnesia*
