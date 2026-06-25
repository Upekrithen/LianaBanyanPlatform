# Knight Marathon 12 — Unified Long-Haul Fix (TRIPLE MAMBA)

**Marathon ID:** K-MARATHON-12 (UNIFIED — supersedes earlier M12 quick-timeout yoke)
**BP:** BP090
**Date:** 2026-06-22 post-midnight Central
**Status:** STAGED · awaiting Knight execution
**Founder ratify:** explicit — "I want the real fix NOW · ALWAYS BUILD FOR THE LONG HAUL · use Knight to Mamba all three at once" relayed 2026-06-21 ~21:30 Central
**Predecessor:** K-MARATHON-10 (v0.5.16 ship + first 42Q baseline · TRIAL_02_PREVIEW_42Q — ABORTED at Q30 per Founder option (b) ratify)
**Governing canon:** `canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053` — no patch fixes, build it right from the start.

## Objective

Combine three Marathons (12 quick-timeout · 13 timeout-escalation · 14 per-domain tuning) into ONE unified Knight Mamba session so we ship the canonical "Individual Domain Pattern" (Founder-coined BP090) in one cut. No quick-fix-then-fix-again.

## Empirical motivation (from Marathon 10 aborted-at-Q30 partial)

- Plow Loop 12 wiring is empirically live (field presence proven)
- Global 300s orchestrator timeout cuts Plow Loop short on hard-disagreement domains (math, physics, psychology, law, philosophy, business, economics)
- Resulting pattern: 3/4 peer timeouts on hard domains → ensemble degrades to single-peer M0 fallback → ~41% accuracy
- Root cause: Plow Loop 12 × 3-judge Council × ~30s/inference ≈ 1080s needed worst case · 300s available · 28% of time budget

## Scope — 7 blocks

### Block 0 — ABORT Marathon 10 + seal partial baseline receipt
- Kill in-flight `node validate-relay.mjs` process for session relay-2026-06-22T01-31-22 (graceful SIGTERM, then SIGKILL if needed within 30s)
- Wait for any in-flight peer replies to drain into `relay_route_replies` (max 60s)
- Compose partial receipt at `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q\TRIAL_02_PREVIEW_42Q_PARTIAL_Q1_to_Q30_ABORTED.md` with:
  - Truth-Always disclosure: "Marathon 10 aborted at Q~30 by Founder ratify (option b · 2026-06-21 ~21:30 Central) to free fleet for Marathon 12 unified long-haul fix per canon_fix_as_we_go_build_for_the_long_haul_bp053. Partial receipt serves as empirical baseline for side-by-side comparison."
  - Per-question result + per-peer participation (timeout vs reply) extracted from relay_route_replies
  - Ensemble accuracy through Q-last-complete + plow_loop_iterations distribution

### Block 1 — Per-domain timeout config (the core "Individual Domain Pattern" fix)
- New file: `tools/mesh-validation/per_domain_timeout_config.json` with:
  ```json
  {
    "high_disagreement": { "domains": ["math", "physics", "chemistry", "law", "philosophy"], "timeout_s": 1500 },
    "medium_disagreement": { "domains": ["computer_science", "engineering", "psychology"], "timeout_s": 900 },
    "low_disagreement": { "domains": ["biology", "business", "health", "history", "economics", "other"], "timeout_s": 600 }
  }
  ```
- Patch `validate-relay.mjs` to load this config + dispatch each question with its domain's timeout (replaces single global `--timeout` for per-question routing)
- Keep `--timeout` CLI flag as fallback override (also raise default 300s → 900s for backwards compat)

### Block 2 — Timeout-triggered escalation
- Patch peer-side `src/main/index.ts` `startRelayRoutePoll`:
  - When Plow Loop iteration N has been running > 80% of its allotted per-domain timeout AND council variance still > 15%, emit a "approaching_timeout" signal back to orchestrator with current partial council votes + best-guess answer
- Patch orchestrator `validate-relay.mjs`:
  - On receiving "approaching_timeout" signal from N peers, immediately dispatch Star Chamber escalation to remaining peers with partial council votes as context
  - Escalation peer's Plow Loop starts from where the timing-out peer left off — uses partial information as priming
  - Final answer: plurality vote across (timed-out peers' partial answers) ∪ (escalation peers' completed answers)
- Receipt logs: per-question escalation_fired bool + escalation_peer_count + final_answer_source (council_unanimous / council_majority / escalation_consensus / single_peer_fallback)

### Block 3 — Smoke test (multi-domain, escalation verification)
- Fire 3-question smoke: 1 biology (low-disagreement, fast) + 1 math (high-disagreement, should trigger escalation) + 1 law (high-disagreement, should also trigger escalation)
- Verify in receipt: biology completes within 600s; math + law trigger escalation_fired=true at >80% of 1500s timeout
- If smoke shows escalation NOT firing → abort + diagnose before Block 4

### Block 4 — Fire 42Q with full new architecture
```
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node validate-relay.mjs --questions=42 --mode=smoke --routing=round-robin --andon-escalate=star-chamber --andon-threshold=15 --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --trial-id=TRIAL_02_PREVIEW_42Q_LONGHAUL --pass=A --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json
```

Receipt seals at:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_LONGHAUL\TRIAL_02_PREVIEW_42Q_LONGHAUL_COMPLETE.md`

### Block 5 — Side-by-side receipt comparison
- Read M10 partial + M12 unified receipts
- Compose comparison table: per-domain accuracy M10 vs M12 + per-question peer participation M10 vs M12 + escalation-fired count + wall-clock per question
- Save as `Asteroid-ProofVault\receipts\THUNDERCLAP\COMPARISON_M10_vs_M12_LONGHAUL_BP090.md`

### Block 6 — Return to Bishop
- Brief return message including: each block's commit hash + escalation-fired count + final ensemble accuracy + side-by-side comparison filepath + Truth-Always disclosure quoted

## Truth-Always gates (must abort if any fail)

- T1: If per-domain config loads but doesn't dispatch per-domain timeouts → diagnose before Block 3
- T2: If Block 3 smoke shows escalation NOT firing on math/law → abort + diagnose
- T3: If M12 LONGHAUL ensemble accuracy < M10 partial baseline → diagnose (means fix made things worse)
- T4: Receipt MUST disclose per-question peer participation (which peers timed out, which escalated, which completed full Plow Loop)
- T5: All commits must reference `canon_fix_as_we_go_build_for_the_long_haul_bp053` + Founder ratify timestamp

## Wall-clock estimate

| Block | Est. time |
|---|---|
| 0 ABORT + partial receipt | 5 min |
| 1 per-domain config | 30-45 min |
| 2 escalation logic | 90-180 min (most complex block) |
| 3 smoke test | 5-15 min |
| 4 fire 42Q | ~120-200 min (peers actually completing loops) |
| 5 comparison receipt | 15 min |
| 6 return to Bishop | 5 min |
| **TOTAL** | **~5-8 hrs overnight Knight session** |

## Dependencies / Founder ratify points

- I8 MIC security yoke remains open — escalation broadcast across peers uses same I8 channel; Founder one-shot approval extends to M12 escalation
- Per-domain timeout values (600/900/1500s) are Bishop best-guess based on Plow Loop math; Founder may override after seeing first receipt
- "approaching_timeout" 80% threshold is Bishop best-guess; could be 70% or 90% — config-driven, easy to tune

## Receipt anchors

- Source canon: `canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053`
- Founder-coined name: "Individual Domain Pattern" (BP090, 2026-06-21)
- Architectural lineage: `canon_plow_loop_and_domain_specific_unfair_advantages_inherent_to_mountain_1_substrate_reader_bp089` + `canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089`
- Composing with: Dragon Harness (canon staged for ratify at `canon_dragon_harness_meta_yoke_integrated_cooperative_reasoning_engine_bp090_DRAFT_for_ratify.eblet.md`)
