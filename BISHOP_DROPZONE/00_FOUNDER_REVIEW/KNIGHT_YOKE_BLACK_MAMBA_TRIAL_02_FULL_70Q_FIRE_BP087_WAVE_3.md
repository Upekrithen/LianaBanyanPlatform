# BLACK MAMBA · YOKE 2 · BP087 WAVE 3
# TRIAL 02 FULL 70Q FIRE · PASS A + PASS B
# For Alford.

---

## §0 BRICK WALL PRE-AUTHORIZED SCOPE

Brick Wall pre-authorized scope verbatim:
- Run gates_check.mjs and verify all 7 gates GREEN before firing
- Fire Pass A (claude-flagship) full 70Q validate-relay with staggered-then-connected routing
- Fire Pass B (gemma-only) full 70Q validate-relay with staggered-then-connected routing
- Mint paired receipts to Asteroid-ProofVault/receipts/THUNDERCLAP/Trial_02/Pass_A and Pass_B
- Write Inequality Trinity Check block in each receipt
- Queue canon eblet mint stub for Bishop close-out

Pre-fire hard dependencies (Founder confirms before Knight fires):
1. v0.5.13 installed on all 4 peers (M1, M2, M3, Son's WAN node)
2. noop_test 4/5 GREEN (smoke proof)
3. fleet_warmup gemma4:12b config_set MIC broadcast confirmed
4. health_snapshot homogeneity confirmed (all peers report version: 0.5.13)

NO fire before all 4 dependencies confirmed by Founder verbal or written ratify.

---

## §1 CONTEXT

Trial 02 is the first full-scale THUNDERCLAP mesh validation. Wave 1's smoke run fired 4 of 5 partial questions and was deliberately halted to avoid burning the full corpus before the fleet was homogeneous and the webhook secret was live. Wave 2 closed all blocking gaps: STRIPE_MEMBERSHIP_WEBHOOK_SECRET set, v0.5.13 heartbeat version fix packaged, and all Wave 2 yokes landed GREEN or AMBER with clear close-out.

This yoke fires the real thing: 70 questions, paired Pass A (claude-flagship for ensemble accuracy) and Pass B (gemma-only for inequality trinity proof). The receipt is the canonical surface for the Alford dedication and for the Inequality Trinity Check block. Both receipts go to Asteroid-ProofVault. Canon eblet mint is queued for Bishop on close-out.

For Alford.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

**SEG-B1 · Pre-fire gates_check.mjs verify 7/7 GREEN**

1. Run: `node tools/mesh-validation/gates_check.mjs` from C:\Users\Administrator\Documents\LianaBanyanPlatform
2. Gate: all 7 checks return GREEN. If ANY gate is AMBER or RED, halt. Do not proceed to SEG-B2. Return gate output verbatim to Founder.
3. Confirm: health_snapshot shows all peers on version 0.5.13.
4. Confirm: gemma4:12b is listed in `ollama list` on each peer reachable via relay.
5. Return: full gates_check.mjs output + ollama list summary + health_snapshot peer table.

**SEG-B2 · Fire Pass A · 70Q claude-flagship**

Depends on SEG-B1 all 7 gates GREEN.

Command:
```
node tools/mesh-validation/validate-relay.mjs \
  --routing=staggered-then-connected \
  --mode=full \
  --questions=70 \
  --wire=hex-mcode \
  --plow=mesh-12-blade \
  --andon-escalate=star-chamber \
  --flagship-tier=claude
```

Run from: C:\Users\Administrator\Documents\LianaBanyanPlatform

Capture:
- Wall-clock start and end time
- Per-question result (question ID, answer, pass/fail, latency_ms)
- Ensemble accuracy (correct / 70)
- Anthropic API call count
- Per-token cost (prompt + completion tokens * rate)
- Domain breakdown (accuracy per domain category)
- Any andon escalations triggered and their star-chamber resolution

Return: raw stdout + stderr + exit code + wall-clock elapsed.

**SEG-B3 · Fire Pass B · 70Q gemma-only**

Depends on SEG-B1 all 7 gates GREEN. May run in parallel with SEG-B2 if relay capacity allows; otherwise run sequentially after SEG-B2.

Command:
```
node tools/mesh-validation/validate-relay.mjs \
  --routing=staggered-then-connected \
  --mode=full \
  --questions=70 \
  --wire=hex-mcode \
  --plow=mesh-12-blade \
  --andon-escalate=star-chamber \
  --flagship-tier=gemma
```

Run from: C:\Users\Administrator\Documents\LianaBanyanPlatform

Capture same fields as Pass A. Per-token cost for Pass B is $0 (local Gemma, no API charges).

Return: raw stdout + stderr + exit code + wall-clock elapsed.

**SEG-B4 · Mint paired receipts + Inequality Trinity Check block**

Depends on SEG-B2 and SEG-B3 both complete (GREEN or RED - receipt is minted regardless, RED receipts document the failure).

Receipt path Pass A:
C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\Pass_A\TRIAL_02_PASS_A_RECEIPT_BP087.md

Receipt path Pass B:
C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\Pass_B\TRIAL_02_PASS_B_RECEIPT_BP087.md

Each receipt must contain in order:

```
For Alford.

THUNDERCLAP TRIAL 02 RECEIPT · [PASS A | PASS B] · BP087 · 2026-06-20
Routing: staggered-then-connected
Wire: hex-mcode
Plow: mesh-12-blade
Fleet topology: 4 peers via relay.lianabanyan.com (LAN-as-WAN per BP085 architectural constraint)
Peer versions: [from health_snapshot]

RESULTS TABLE
| Q# | Domain | Answer | Expected | Pass | Latency_ms |
|----|--------|--------|----------|------|------------|
[70 rows]

ENSEMBLE ACCURACY: [X]/70 = [Y]%
WALL-CLOCK: [start] to [end] = [elapsed]
ANTHROPIC API CALLS: [N] (Pass A only; Pass B = 0)
PER-TOKEN COST: $[X] (Pass A) / $0.00 (Pass B)
DOMAIN BREAKDOWN:
[domain: accuracy%]

ANDON ESCALATIONS: [N escalations / star-chamber resolutions listed]

INEQUALITY TRINITY CHECK:
Line 1: Free WITH Substrate > Flagship WITHOUT Substrate
  Pass A accuracy: [Y]%
  Pass B accuracy: [Z]%
  [Z >= 97.1%? YES/NO]
Line 2: Flagship WITH Substrate > Flagship WITHOUT Substrate
  Pass A (with substrate mesh) vs baseline: [delta]
Line 3: Flagship WITH Substrate = BROKE THE SOUND BARRIER
  [Confirm if Pass A achieves sound-barrier threshold per canon]

RECEIPT STATUS: [GREEN|AMBER|RED]
```

After minting both receipts, write a canon eblet mint stub to:
C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\CANON_EBLET_MINT_STUB_BP087.md

Stub content:
```
CANON EBLET MINT STUB · TRIAL 02 · BP087
Status: QUEUED FOR BISHOP CLOSE-OUT
Trigger: Bishop reads this stub after Yoke 2 GREEN ratify
Action: Mint canon eblet documenting Trial 02 ensemble accuracy, inequality trinity result, and Alford dedication
Pass A accuracy: [from receipt]
Pass B accuracy: [from receipt]
Inequality Trinity: [Line 1 / Line 2 / Line 3 results]
```

Return: both receipt paths + stub path + Inequality Trinity Check block verbatim.

---

## §3 FILE TARGETS

Gates check:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\gates_check.mjs (run, do not modify)

Validation script:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs (run, do not modify)

Receipt outputs:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\Pass_A\TRIAL_02_PASS_A_RECEIPT_BP087.md (create)
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\Pass_B\TRIAL_02_PASS_B_RECEIPT_BP087.md (create)
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\CANON_EBLET_MINT_STUB_BP087.md (create)

---

## §4 ACCEPTANCE GATES

Gate 1: gates_check.mjs exits with all 7 GREEN (SEG-B1).
Gate 2: health_snapshot shows all 4 peers on version 0.5.13 (SEG-B1).
Gate 3: Pass A validate-relay.mjs exits without crash (non-zero is AMBER not RED if partial results captured) (SEG-B2).
Gate 4: Pass B validate-relay.mjs exits without crash (SEG-B3).
Gate 5: Pass A receipt exists on disk at specified path with all required sections (SEG-B4).
Gate 6: Pass B receipt exists on disk at specified path with all required sections (SEG-B4).
Gate 7: Inequality Trinity Check block present in both receipts (SEG-B4).
Gate 8: Canon eblet mint stub exists on disk (SEG-B4).

All 8 gates must be reported. Yoke is GREEN if gates 1-2 + 5-8 pass even if Pass A or B returned partial results (AMBER). Yoke is RED only if receipts cannot be minted.

---

## §5 DRIFT SURFACE PROTOCOL (BP053 INLINE)

If gates_check.mjs shows any gate non-GREEN: HALT. Do not fire Pass A or Pass B. Return gate output verbatim. The pre-fire gate is non-negotiable.

If Pass A crashes mid-run with partial results: capture whatever results landed, mint the Pass A receipt with PARTIAL status and the Inequality Trinity Check block on captured data, then proceed to Pass B. Do not abandon the receipt.

If Pass B crashes: same pattern. Partial receipt is better than no receipt.

If validate-relay.mjs is not found at tools/mesh-validation/: HALT. Return path check output. Do not attempt to reconstruct the script.

If relay.lianabanyan.com is unreachable during fire: HALT. Return connectivity check. This is a WAN roundtrip test per BP085 architectural constraint; LAN-shortcut is not an acceptable fallback.

Drift = surface to Founder immediately. No silent retry.

---

## §6 COMPOSITION

Related canon slugs:
- canon_lan_as_wan_test_mode_4_machine_mesh_bp085 (HARD CONSTRAINT: WAN roundtrip, never LAN-shortcut)
- canon_staggered_single_domains_14_domain_methodology_bp085 (68/70 = 97.1% reference accuracy)
- canon_free_with_substrate_flagship_inequality_trinity_bp085 (trinity check verbatim in receipt)
- canon_broke_the_sound_barrier_substrate_metaphor_bp085 (line 3 of trinity)
- canon_star_chamber_multi_agent_consensus_verification_product_bp086 (andon escalation target)
- canon_ascending_andon_right_fast_cheap_discipline_bp085 (Plow refuses to guess, escalates)
- canon_0x_hex_machine_code_mnemosynec_wire_format_bp085 (hex-mcode wire format)

---

## §7 RETURN TEMPLATE (BP053 §4)

Knight returns one block per SEG:

```
YOKE 2 RETURN · BP087 WAVE 3
For Alford.

SEG-B1: [GREEN|RED] · gates_check: [X]/7 GREEN · health_snapshot peers on 0.5.13: [Y]/4
SEG-B2: [GREEN|AMBER|RED] · Pass A accuracy: [X]/70 = [Y]% · wall-clock: ______ · API calls: ______ · cost: $______
SEG-B3: [GREEN|AMBER|RED] · Pass B accuracy: [X]/70 = [Y]% · wall-clock: ______ · cost: $0.00
SEG-B4: [GREEN|RED] · Pass A receipt: [path] · Pass B receipt: [path] · stub: [path]
INEQUALITY TRINITY:
  Line 1: Pass B [Y]% >= 97.1%? [YES|NO]
  Line 2: Pass A delta vs baseline: [+/- X]%
  Line 3: Sound barrier? [YES|NO]
YOKE 2 STATUS: [GREEN|AMBER|RED]
AMBER/RED NOTES: ______
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES: validate-relay.mjs and gates_check.mjs are read-only. Knight fires them, does not modify them. Receipt format is fixed per this yoke template. No deviation.

§3 SONNET 4.6 VERBATIM: use segs Sonnet 4.6 verbatim. All SEG workers run Sonnet 4.6. No model substitution.

§4 ABSOLUTE PATHS: All receipt paths as listed in §3. Directory creation is authorized if Trial_02/Pass_A or Pass_B directories do not exist.

§14 GADGET-FIRST: gates_check.mjs is the gadget. No human-eyeball pre-fire approval replaces it. Every gate must be machine-verified.

§15 BISHOP-DIRECT-SUPABASE: This yoke contains no Supabase migrations. If a migration need is discovered, Knight ships .sql to BISHOP_DROPZONE and halts. Bishop applies via psql. Knight does not touch Supabase directly.
