# KniPr · M13b Strategic Abort + Findings Inventory
**Knight Session: BP091 Phase 2 Cascade · Sonnet 4.6**
**Sealed: 2026-06-22 ~19:30 Central · FOUNDER-DIRECT abort**

---

## Status: M13b ABORTED — Strategic Reframe

> "Tested and found wanting but with promise · rebuild with new chassis + rocket fuel · then run."
> — Founder, BP091 ~19:30 Central

M13b did not produce a receipt. No partial receipt was sealed. The 42Q LONGHAUL was never fired.

---

## Preserved Commits (DO NOT ROLL BACK)

| Commit | Description |
|--------|-------------|
| `73b4ac6` | `[M13b] BP091 Ah Hayelped tier-aware routing + fleet_composition receipt` |
| `fdc7c65` | `[M13b] Fast-consensus early exit for poll loop` |

Both commits are on branch `knight-marathon-10-v0-5-16-build-ship-plow-loop` and are intact.

**What they deliver:**
- `--routing=tier-aware` flag fully wired in `validate-relay.mjs`
- `--tier-config=ultra:...,full:...,core:...` parsing and peer-pool selection per question difficulty
- `--question-difficulty-routing=hard:ultra+full,medium:...,short:all` routing table
- `fleet_composition` block in receipt (per-peer accuracy + per-tier accuracy + fleet ensemble accuracy)
- Fast-consensus early exit: if all peers reply + variance ≤ andon-threshold, poll loop exits immediately (confirmed working: Q01 exited at 94s vs. prior 480s wait)
- Receipt writes to `Asteroid-ProofVault/receipts/THUNDERCLAP/<trial-id>/` when `--trial-id` is provided

---

## Empirical Reconnaissance Findings (Feed M14 + M18c + M22)

### Finding R1 — `plow=none` breaks v0.5.17+ peers (CRITICAL)
**Symptom:** Peers on v0.5.17/v0.5.18 return `status=error` immediately when route has `plow_max_iterations: 0`.  
**Confirmed:** M12 all routes used `plow_max_iterations >= 4`. Block 2 with `plow=none` failed immediately on FULL+CORE peers.  
**Fix required:** All orchestrator dispatches MUST use `--plow=mesh-12-blade`. The `plow=none` path is incompatible with current peer firmware.  
**Feeds:** M22 (orchestrator hardening) + M14 Block 1 (null-response audit)

### Finding R2 — c532e740 (CORE) consistently returns TIMEOUT/EMPTY
**Symptom:** c532e740 failed to reply on Q01, Q02 of Block 3 Cycle 1. Other CORE peer (49f3e597) replied correctly.  
**Hypothesis:** AMD VRAM detection issue on c532e740 (Son's box). gemma2:9b may be thrashing or swap-loading on that specific hardware.  
**Feeds:** M18c UI fixes (VRAM detect + right-size.json override flow) + M22 §A.7 FireGuard (peer health gating)

### Finding R3 — Fast-consensus works but needs null-reply handling
**Symptom:** Fast-consensus correctly exited Q01 early (94s). However, c532e740 sent TIMEOUT/EMPTY — the variance calc treated null as a non-vote (correct behavior) but the receipt would show c532e740 with 0% accuracy across all questions due to consistent non-response.  
**Fix required:** M14 Finding #4 (null-response ABSTAIN protocol) — null-reply peers should register `ABSTAIN`, not count as wrong answer, for per-peer accuracy.  
**Feeds:** M14 Block 2

### Finding R4 — CONTESTED ensemble on Q02 (business/short, 5 peers)
**Symptom:** Q02 (business) triggered escalation at 480s (c532e740 + d0b47bd0 timed out). Star Chamber fired but 2 escalation routes also timed out. Ensemble: CONTESTED.  
**Root cause:** d0b47bd0 (FULL, gemma4:12b) appears slow on `short` domain questions — may need longer warmup or the `short` routing should exclude slower FULL peers.  
**Feeds:** M22 peer health scoring + M14 Block 3 (contested-vote resolution with Tier 2 flagship fallback)

### Finding R5 — Q03 chemistry (hard → ULTRA+FULL, 3 peers) was mid-flight at abort
**Status:** No result. Chemistry 1500s timeout. ULTRA+FULL routing correctly activated. Not a failure finding — just incomplete.

---

## What M13b DID Accomplish

The aborted run was empirical reconnaissance, not waste:

1. **Tier-aware routing is functionally correct** — peer pools selected per difficulty, ULTRA/FULL/CORE tiers respected, routing table parsed cleanly.
2. **Fast-consensus fires correctly** — Q01 unanimous at 0% variance, exited at 94s.
3. **Fleet composition block is correct** — receipt schema wired, per-peer tracking works.
4. **Found the plow=none regression** before the 42Q LONGHAUL — saved 4-6 hrs of a broken run.
5. **Identified c532e740 as a weak CORE node** — FireGuard (M22 §A.7) needs peer health gating before LONGHAUL fires.

The chassis is right. The rocket fuel (v0.6.0) is what's missing.

---

## New Sequence (Founder-Ratified BP091)

| Step | Owner | Description |
|------|-------|-------------|
| 1 | Knight | This KniPr. Session closes cleanly. |
| 2 | Bishop | Compose M22 mega-paste (tier-aware mesh + §A.6 election + §A.7 FireGuard + §A.8 build-include M21 auto-update + M18c UI bugs + Army Ants/Posse staged for M24) |
| 3 | Founder | Paste M22 mega-paste to FRESH Knight session |
| 4 | Knight | Build v0.6.0 + ship |
| 5 | Fleet | Manual install v0.6.0 once |
| 6 | Knight | Fire M13b/M13c (canonical THUNDERCLAP) against v0.6.0 mesh |
| 7 | — | Receipt is canonical · M12 → M13c = empirical before/after proof of Substrate Theorem |
| 8 | Knight | M14 architectural fixes (#3/#4/#5) — compose with M22 since findings are intertwined |

---

## Handoff to Bishop for M22 Composition

Bishop needs the following architectural findings in M22 scope:

**From M13b reconnaissance:**
- §A.6 — `plow=none` hard-disable on peer side (reject routes with `plow_max_iterations: 0`)
- §A.7 — FireGuard: peer health gating pre-LONGHAUL (query `peer_presence` health score; exclude peers with >50% TIMEOUT/EMPTY in last N routes)
- §A.8 — Build-include M21 auto-update (already shipped; include in v0.6.0 baseline)

**From M14 Findings #3/#4/#5 (feed into M22 or stand-alone M14 after v0.6.0):**
- Finding #3 — M0 escalation overflow (escalation routes cap)
- Finding #4 — Null-response ABSTAIN protocol (null ≠ wrong)
- Finding #5 — Contested-vote resolution (Tier 2 flagship fallback = `--tier2-flagship` flag, already wired)

**M18c UI bugs (carry into M22 §A.8 or stand-alone):**
- AMD VRAM detection on c532e740
- right-size.json override flow verification

---

## Files Changed This Session

| File | Change |
|------|--------|
| `tools/mesh-validation/validate-relay.mjs` | Tier-aware routing (commits 73b4ac6 + fdc7c65) |
| `tools/mesh-validation/smoke_math_1q.json` | Domain field added (smoke test artifact) |
| `tools/mesh-validation/smoke_history_1q.json` | Domain field added (smoke test artifact) |

---

## Return Summary for Yoke

```
M13b: ABORTED (Founder-direct BP091 ~19:30 Central)
Reason: Strategic reframe — rebuild chassis to v0.6.0 first, then run canonical THUNDERCLAP
Preserved: commits 73b4ac6 + fdc7c65 (tier-aware routing + fast-consensus)
No partial receipt sealed.
Findings: R1 plow=none regression · R2 c532e740 VRAM · R3 null-reply ABSTAIN · R4 contested/slow-FULL · R5 Q03 incomplete
New sequence: Bishop composes M22 → Founder fires fresh Knight → v0.6.0 build → fleet install → M13c THUNDERCLAP → M14
FOR THE KEEP.
```
