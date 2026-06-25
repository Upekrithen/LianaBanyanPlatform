# Knight Marathon 13 — Homogeneous Fleet Re-Fire (M12 invalidation correction)

**Marathon ID:** K-MARATHON-13
**BP:** BP090
**Date:** 2026-06-22 morning Central
**Status:** STAGED · awaiting Founder + son coordination on WAN node gemma4:12b install/config
**Founder ratify:** explicit — "testing the new lamborghini on the track and then finding out that a toyota corolla was actually tested means the test isn't correct. So yes, we need to do it again." (2026-06-22 morning Central)
**Predecessor:** K-MARATHON-12 UNIFIED (61.9% ensemble · heterogeneous fleet · 29/42 escalations fired empirically · canonical receipt NOT yet sealed)
**Governing canon:** `canon_fix_as_we_go_build_for_the_long_haul_bp053` · `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` · TRUTH-ALWAYS

## Objective

Re-fire the 42Q LONGHAUL mesh test with **homogeneous gemma4:12b fleet across all 4 peers** (including Son's WAN node 49f3e597 which ran qwen2.5:7b during M12 — discovered post-hoc in receipt model_families field).

The architecture (v0.5.16 + Plow Loop 12 + per-domain timeout + Star Chamber escalation) is unchanged from M12 — only the peer-model-inventory variable is controlled.

## Truth-Always context — why M12 results don't count as the canonical "Plow Loop 12 mesh" measurement

From the M12 receipt JSON (`BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json`):

```json
"model_families": "gemma4:12b (M0, M1, M2, M3) x qwen2.5:7b (Son) -- CROSS-VENDOR HETEROGENEOUS"
```

The fleet was heterogeneous, contaminating the empirical claim that "v0.5.16 Plow Loop 12 mesh on consumer hardware scores X% on MMLU-Pro 42Q stratified." The test measured a mixed-vendor mesh, not a homogeneous mesh. M12 ensemble 61.9% (+2.4pp vs M10 59.5%) is empirically real but does not isolate the v0.5.16 architecture variable.

M13 controls the model variable. Then we have a clean before/after.

## Scope — 7 blocks

### Block 0 — Son model-config switch (BEFORE Knight fires)

EMPIRICAL CONTEXT (Bishop verified 2026-06-22 ~09:45 Central via Supabase peer_presence query):
- gemma4:12b is INSTALLED on Son's WAN node (Founder-confirmed); not an install problem
- Son's MnemosyneC v0.5.16 client is announcing `capabilities.ollamaModel: "qwen2.5:7b"` to peer_presence — this is the field the relay-orchestrator dispatches to
- LAN peers M0/M2/M3 all correctly announce `capabilities.ollamaModel: "gemma4:12b"`

ACTION REQUIRED FROM SON:
1. Open MnemosyneC v0.5.16 client on WAN node
2. Settings → AI Engine → switch from `qwen2.5:7b` to `gemma4:12b`
3. Restart MnemosyneC (peer_presence re-registers with new ollamaModel)
4. Confirm to Founder

KNIGHT VERIFICATION (Block 0 final gate):
```sql
SELECT peer_id, capabilities->>'ollamaModel' AS model
FROM peer_presence
WHERE peer_id = '49f3e5971518a064';
```
Expected result: `ollamaModel = gemma4:12b`. If still `qwen2.5:7b` → abort with diagnosis.

RAM CHECK: WAN node has 15.8GB; gemma4:12b Q4 runs ~10-12GB. Should fit. Fallback if OOM: gemma4:12b-q3.

**Founder ratify required: explicit "son switched and restarted, peer_presence shows gemma4:12b" before Knight fires Block 1.**

### Block 1 — Pre-flight model inventory verification

- Knight queries each peer's effective Ollama default for relay-route handling
- Verify: all 4 peers (M0 cb4ef450, M2 88cbf6bd, M3 d0b47bd0, SON 49f3e597) report gemma4:12b as the served model
- Verify: peer Plow Loop wiring intact (no v0.5.16 → v0.5.x drift)
- Verify: per-domain timeout config still active (commit acf914d + Marathon 12 commits)
- T1 gate: if ANY peer reports != gemma4:12b → ABORT with diagnosis

### Block 2 — 1Q smoke (homogeneous-fleet sanity)

- Same 1Q smoke pattern as Marathon 12 Block 3 (biology Q)
- Verify all 4 peers return responses with consistent latency profile (gemma4:12b runs at ~similar speed across LAN; Son's WAN has +RTT but same model class)
- T2 gate: if response variance suggests model heterogeneity persists → diagnose before 42Q

### Block 3 — Iterative 6Q smoke cycles until "engine purrs" (Founder-direct BP090 ratify)

CANONICAL APPROACH: do not fire the 42Q LONGHAUL until small-scale smoke iteration demonstrates consistent quality. Warm up at low stakes, then go to the track. (Founder-direct 2026-06-22 morning Central: "I want to do a 6 question test, and repeat 6 (different) question tests until we get the engine purring. THEN we go to the track.")

ITERATIVE PROTOCOL:
- Each cycle: 6 questions stratified across domains (1 from each of 6 different domains — rotate to cover all 14 across 2-3 cycles)
- Use `selectQuestionsSpreadAcrossDomains(6)` with different seed/offset per cycle so questions don't repeat
- Each cycle wall-clock: ~10-25 min depending on per-domain timeout
- After each cycle: parse receipt, compute pass criteria (below), decide CONTINUE / RE-RUN-WITH-PATCH / ADVANCE-TO-BLOCK-4

PASS CRITERIA ("engine purring"):
- Ensemble accuracy ≥ 5/6 (83.3%) — substrate working
- Zero `answer: null` responses (Finding #4 fixed) — protocol clean
- Zero `contested: true` ensemble outcomes (Finding #5 controlled) — plurality resolving
- M0 (cb4ef450) accuracy on questions it answers ≥ 4/6 (Finding #3 controlled) — no escalation-overflow regression
- Per-peer participation ≥ 4/6 each (no peer chronically timing out)
- Escalation MAY fire on hard-domain questions (math/physics/law) — that's healthy, not a failure

DECISION AFTER EACH CYCLE:
| Outcome | Next action |
|---|---|
| All pass criteria met | Run ONE MORE cycle with DIFFERENT 6 questions to confirm stability; if also passes, ADVANCE to Block 4 |
| Most pass, 1 marginal | Re-run with different 6 to see if pattern persists |
| Multiple criteria fail | DIAGNOSE — abort iterations, return to Bishop with findings, may need M14 fixes first |

MAX CYCLES BEFORE FOUNDER ESCALATION: 8 (avoid infinite-loop on a stuck issue)

T3 gate (replaces old): Two consecutive 6Q cycles meeting all pass criteria → advance to Block 4. Otherwise abort + diagnose.

### Block 4 — Fire 42Q with HOMOGENEOUS gemma4:12b fleet

```
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node validate-relay.mjs --questions=42 --mode=smoke --routing=round-robin --andon-escalate=star-chamber --andon-threshold=15 --wire=hex-mcode --plow=mesh-12-blade --flagship-tier=gemma --trial-id=TRIAL_02_PREVIEW_42Q_HOMOGENEOUS --pass=A --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json
```

Receipt seals at:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_HOMOGENEOUS\`

### Block 5 — Three-way side-by-side comparison

Compose at `Asteroid-ProofVault\receipts\THUNDERCLAP\COMPARISON_M10_M12_M13_BP090.md`:

| Variable | M10 | M12 | M13 |
|---|---|---|---|
| Architecture | v0.5.15 (no plow wiring in payload) | v0.5.16 + per-domain timeout + escalation | v0.5.16 + per-domain timeout + escalation |
| Fleet | Heterogeneous (3 gemma4:12b + 1 qwen2.5:7b) | Heterogeneous | **Homogeneous (4 × gemma4:12b)** |
| Timeout | 300s global | Per-domain (600/900/1500) | Per-domain (600/900/1500) |
| Escalation | none | star-chamber, 15% threshold | star-chamber, 15% threshold |
| Ensemble accuracy | 59.5% | 61.9% | **{{ M13_ENSEMBLE }}%** |
| Escalations fired | 0 | 29/42 (69%) | **{{ M13_ESCALATION_COUNT }}/42** |
| Per-peer accuracy ceiling | 95-100% (when no timeout) | 93.8-100% | **{{ M13_PEER_RANGE }}%** |

### Block 6 — M12 canonical seal-with-disclosure (close-out the M12 record)

- Seal M12 canonical receipt at `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_LONGHAUL\TRIAL_02_PREVIEW_42Q_LONGHAUL_COMPLETE.md`
- INCLUDE the heterogeneous-fleet disclosure verbatim: "M12 ran with mixed model fleet (3 gemma4:12b LAN peers + 1 qwen2.5:7b WAN peer per receipt model_families field). M12 ensemble 61.9% does not isolate the v0.5.16 architecture variable. M13 (homogeneous gemma4:12b fleet) is the canonical measurement; see COMPARISON_M10_M12_M13_BP090.md."
- Do NOT discard M12 receipt JSON — it is empirically valuable as the architectural-validation receipt (29 escalations fired in production)

### Block 7 — Return to Bishop

Brief: M13 ensemble · per-peer accuracy · escalation count · timeout distribution · comparison filepath · explicit Truth-Always note that M13 is the canonical "v0.5.16 homogeneous mesh" measurement and supersedes M12 as the social-blast empirical anchor.

## Truth-Always gates

- T1: All 4 peers homogeneous gemma4:12b at fire time
- T2: 1Q smoke responses consistent in latency profile
- T3: Escalation fires on math + law in 3Q smoke
- T4: M13 receipt explicitly notes fleet composition in `model_families` field
- T5: Comparison receipt (Block 5) discloses M12 contamination + M13 corrected measurement
- T6: M12 close-out includes the disclosure verbatim

## Wall-clock estimate

| Block | Time |
|---|---|
| 0 Founder + son coordination | depends on son availability |
| 1 Pre-flight model verification | 5 min |
| 2-3 Smokes | 5-15 min |
| 4 Fire 42Q homogeneous | 90-180 min (per-domain timeouts active; expect similar wall-clock to M12 ~88.9 min) |
| 5 Comparison receipt | 15 min |
| 6 M12 canonical seal-with-disclosure | 10 min |
| 7 Return to Bishop | 5 min |
| **TOTAL** | **~2.5-4 hrs after son's WAN gemma4:12b confirmed** |

## Social blast — HOLD until M13 receipt seals

The 23 social surfaces staged overnight with `{{ M12_* }}` placeholders should be updated to `{{ M13_* }}` placeholders — Bishop handles in 5 min via sed once M13 receipt lands. **Do NOT fire any social copy with M12 numbers; the heterogeneous-fleet contamination would propagate the Toyota-as-Lamborghini error to public surface.**

## Receipt anchors

- M12 receipt JSON (preserved): `BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json`
- M10 partial receipt: `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q\`
- Source canon: `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` (mesh test discipline)
- Truth-Always lineage: `canon_fix_as_we_go_build_for_the_long_haul_bp053` + Founder lamborghini-vs-corolla ratify 2026-06-22 morning Central
