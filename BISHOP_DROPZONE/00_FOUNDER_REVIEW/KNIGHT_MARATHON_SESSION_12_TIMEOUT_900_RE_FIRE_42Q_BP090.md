# Knight Marathon 12 — Timeout 900s Re-fire 42Q

**Marathon ID:** K-MARATHON-12
**BP:** BP090
**Date:** 2026-06-22 (post-midnight Central)
**Status:** STAGED · awaiting Marathon 10 receipt seal · then fire immediately
**Founder ratify:** explicit — "B. Now" relayed 2026-06-21 ~21:25 Central
**Predecessor:** K-MARATHON-10 (v0.5.16 ship + first 42Q · TRIAL_02_PREVIEW_42Q)

## Objective

Re-fire the 42Q mesh test with **orchestrator timeout raised 300s → 900s** so the Plow Loop 12 × 3-judge Minor Council has wall-clock room to complete on hard-disagreement domains (math, physics, psychology, law, philosophy, business, economics) where Marathon 10's 300s ceiling produced 3/4 peer timeouts.

**Root cause empirical from Marathon 10:** Plow Loop 12 × 3 council judges × ~30s/inference ≈ 1080s needed worst case. 300s ceiling cuts loop short. Hard domains degrade to single-peer M0 fallback → ~52% ensemble accuracy through Q29.

**No code change required.** Timeout is already a CLI flag (`--timeout=300`); just bump to `--timeout=900` and re-fire.

## Scope — 3 blocks

### Block 1 — WAIT for Marathon 10 receipt seal
- Watch `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q\TRIAL_02_PREVIEW_42Q_COMPLETE.md`
- When file exists with sealed status, proceed to Block 2
- Marathon 10 receipt MUST seal first — do not parallel-fire (same peer pool, same Ollama instances)

### Block 2 — Pre-fire verification (30 sec)
- Confirm all 4 peers still on v0.5.16 (`peer_presence.version` should still report)
- Confirm M0 Ollama not OOM after Marathon 10 (`ollama ps`)
- Confirm relay healthy (no stuck routes from Marathon 10 still polling)

### Block 3 — Fire 42Q with --timeout=900
Execute:
```
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node validate-relay.mjs --questions=42 --mode=smoke --routing=round-robin --andon-escalate=star-chamber --andon-threshold=15 --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --trial-id=TRIAL_02_PREVIEW_42Q_TIMEOUT_900 --pass=A --timeout=900
```

Receipt seals at:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIMEOUT_900\TRIAL_02_PREVIEW_42Q_TIMEOUT_900_COMPLETE.md`

## Truth-Always disclosure (must appear in receipt)

> "Marathon 12 re-fire of Trial 02-PREVIEW 42Q with orchestrator timeout raised from 300s (Marathon 10 default) to 900s (Marathon 12 fix) to allow Plow Loop 12 × 3-judge Minor Council to complete on hard-disagreement domains. Same 4-peer Dragon Harness mesh (M0 cb4ef450 · 88cbf6bd · d0b47bd0 · SON 49f3e597), same v0.5.16 binary, same Plow Loop wiring (commit acf914d). Side-by-side comparison to Marathon 10's TRIAL_02_PREVIEW_42Q receipt is the empirical proof of the timeout-vs-loop-depth architectural finding (Founder-coined 'Individual Domain Pattern' BP090)."

## Wall-clock estimate

- Marathon 10 finish wait: ~26 min from Q30 status (so ~21:48 Central seal)
- Block 2 pre-fire: 30 sec
- Block 3 fire: ~120-150 min (3 questions / min was Marathon 10 pace, but with 900s timeout peers will actually complete the loop, so per-question time goes UP on hard domains while easier domains stay fast)
- Receipt seal: ~00:00-01:00 Central
- Total Marathon 12 wall-clock: ~2.5-3 hrs

## Return-to-Bishop spec

When receipt seals, return: ensemble accuracy + per-domain breakdown + plow_loop_iterations distribution + per-peer participation per question (timeout vs reply) + side-by-side comparison vs Marathon 10's 52% baseline.

## Marathon 13 + 14 deferred

Per Founder ratify, Marathon 12 quick-win first. Marathons 13 (timeout-triggered escalation) + 14 (per-domain timeout tuning) staged after Marathon 12 receipt lands and ratifies the timeout fix is sufficient.
