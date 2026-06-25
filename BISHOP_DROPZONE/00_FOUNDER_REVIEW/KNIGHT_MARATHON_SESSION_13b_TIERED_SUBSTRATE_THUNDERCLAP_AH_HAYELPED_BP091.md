# Knight Marathon 13b — Tiered-Substrate THUNDERCLAP (Ah Hayelped · BP091)

**Marathon ID:** K-MARATHON-13b
**BP:** BP091
**Status:** STAGED · awaiting M18b (M0 llama3.3:70b flip) · supersedes K-MARATHON-13 (BP090)
**Supersedes:** `KNIGHT_MARATHON_SESSION_13_HOMOGENEOUS_FLEET_REFIRE_BP090.md`
**Composed by:** Sonnet 4.6 SEG · Bishop oversight
**Date staged:** 2026-06-22
**Governing canon:**
- `canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091` (primary)
- `canon_lan_as_wan_test_mode_4_machine_mesh_bp085`
- `canon_fix_as_we_go_build_for_the_long_haul_bp053`
- `canon_bishop_eat_our_own_cooking_substrate_first_dispatch_route_by_task_fit_bp089`
- TRUTH-ALWAYS

---

## §1 Founder Ratify — Two Quotes in Sequence

### The Lamborghini-Corolla learning (BP090 verbatim, preserved):

> *"Testing the new Lamborghini on the track and then finding out that a Toyota Corolla was actually tested means the test isn't correct. So yes, we need to do it again."*
>
> — Founder, 2026-06-22 morning Central (BP090 ratify, original M13 trigger)

### The BP091 reframe that supersedes it (verbatim):

> *"I would not give my daughter a 100lbs bag of flour to carry, but I would carry it myself. And we can both help."*
>
> — Founder, 2026-06-22 ~13:15 Central (BP091 ratify · "Ah Hayelped" doctrine)

**The reframe:** M12's contamination problem was not that the fleet was heterogeneous — it was that the heterogeneity was INVISIBLE and UNINTENDED (a UI bug made Son's machine appear to serve gemma4:12b when the mesh was actually seeing qwen2.5:7b). Invisible drift is contamination. Visible, intentional, capacity-matched heterogeneity is the cooperative architecture's structural feature.

M13b does NOT attempt to homogenize the fleet. M13b measures the cooperative as it actually is — five peers across three capacity tiers, each carrying what its hardware can carry — and reports that honestly. The headline becomes:

> **"Free cooperative tiered substrate: 5 peers across 3 tiers · M0 llama3.3:70b · M2/M3 gemma4:12b · M1/MS gemma2:9b · scored X% on MMLU-Pro 70Q stratified"**

This is a STRONGER claim than homogeneous gemma4:12b on a premium-only fleet, because it demonstrates what the cooperative actually promises: **commodity hardware works. Every member contributes what they can carry. And we can all help.**

---

## §2 Empirical Fleet State — BP091 Tier Roster

Per BP091 "Ah Hayelped" tier table and live peer_presence gadget 2026-06-22:

| peer_id (short) | ramTier | RAM | Model (post-M18b) | Role in M13b |
|---|---|---|---|---|
| cb4ef450 (M0) | ULTRA | 61.6 GB | `llama3.3:70b` (**after M18b lands**) | ULTRA oracle · primary on HARD questions |
| d0b47bd0 (M3) | FULL | 31.9 GB | `gemma4:12b` | FULL primary · HARD + MEDIUM questions |
| 88cbf6bd (M2) | FULL | 31.9 GB | `gemma4:12b` | FULL primary · HARD + MEDIUM questions |
| c532e740 (M1) | CORE | 15.8 GB | `gemma2:9b` (Kid) | CORE · MEDIUM + SHORT + verification |
| 49f3e597 (MS) | CORE | 15.8 GB | `gemma2:9b` (Son's WAN) | CORE · MEDIUM + SHORT + verification |

**DEPENDENCY: M18b MUST land before Knight fires M13b.** M0 (cb4ef450) must be serving `llama3.3:70b` at the time of dispatch. M0 currently runs `gemma4:12b`; M18b is the dispatch that flips M0 to `llama3.3:70b`. Without M18b, M13b's ULTRA tier is empty and the THUNDERCLAP does not demonstrate the full capacity stack.

**Son's WAN node (49f3e597):** Per BP091 bug receipt, Son's machine should now run `gemma2:9b` (right-sized for 16 GB · `gemma4:12b` confirmed OOM on this hardware). Knight verifies at Block 1 before proceeding. This is correct behavior, not contamination.

---

## §3 Objective

Fire the **42Q LONGHAUL stratified MMLU-Pro test** with the **BP091 tiered fleet** — routing questions to peers proportional to their hardware capacity — and seal a canonical THUNDERCLAP receipt that proves:

1. The cooperative tiered-substrate architecture (ULTRA + FULL + CORE tiers) functions as a coherent mesh
2. Per-peer accuracy is honest and visible (fleet_composition block, per-peer, per-tier)
3. The aggregate score is the empirical ground truth for "free cooperative tiered substrate on commodity hardware"

The v0.5.16 architecture (Plow Loop 12 · per-domain timeout · Star Chamber escalation) is unchanged from M13. The routing layer adds tier-awareness per §3.2 of BP091.

---

## §4 Scope — 8 Blocks

### Block 0 — M18b Dependency Gate (BEFORE Knight fires M13b)

**M13b does not fire until M18b is confirmed landed.** This is a hard sequencing dependency.

Knight verifies M0 model state:

```sql
SELECT peer_id, capabilities->>'ollamaModel' AS model, capabilities->>'ramTier' AS ram_tier
FROM peer_presence
WHERE peer_id LIKE 'cb4ef450%';
```

Expected result: `ollamaModel = llama3.3:70b`. If still `gemma4:12b` → M18b has not landed → **ABORT with diagnosis, return to Bishop.**

**T0 gate: M0 serves llama3.3:70b. No exception.**

### Block 1 — Pre-flight Tier Inventory Verification

Knight queries each peer's effective model and ramTier from peer_presence:

```sql
SELECT peer_id,
       capabilities->>'ollamaModel' AS model,
       capabilities->>'ramTier'     AS ram_tier,
       last_seen
FROM peer_presence
WHERE status = 'active'
ORDER BY last_seen DESC;
```

Expected roster (exact):

| peer_id prefix | ramTier | model |
|---|---|---|
| cb4ef450 | ULTRA | llama3.3:70b |
| d0b47bd0 | FULL | gemma4:12b |
| 88cbf6bd | FULL | gemma4:12b |
| c532e740 | CORE | gemma2:9b |
| 49f3e597 | CORE | gemma2:9b |

**T1 gate rules:**
- If M0 shows any model != `llama3.3:70b` → ABORT (M18b dependency unmet)
- If any FULL peer shows != `gemma4:12b` → ABORT with diagnosis
- If CORE peers show `qwen2.5:7b` or any non-right-sized model → ABORT + report (new BP091 bug instance)
- If CORE peers show `gemma2:9b` → PASS (correct right-sized assignment)
- If fewer than 3 FULL/ULTRA peers active → escalate to Bishop before proceeding

Verify Plow Loop 12 wiring intact and per-domain timeout config active on all peers (commit acf914d lineage).

### Block 2 — 1Q Tier-Stratified Smoke (Sanity Check)

Fire a single HARD question routed to ULTRA tier (M0 llama3.3:70b) and a single SHORT question routed to CORE tier (M1 or MS gemma2:9b).

Verify:
- ULTRA peer returns response; latency consistent with llama3.3:70b profile (~15-30s for hard domain)
- CORE peer returns response; latency consistent with gemma2:9b on short question (~5-12s)
- receipt model_families field correctly logs both models as served (NOT hallucinated)

**T2 gate:** Both responses logged with correct model in receipt. If model field mismatches actual observed behavior → diagnose before advancing.

### Block 3 — Iterative 6Q Tier-Stratified Smoke Cycles ("Engine Purring")

Per Founder-direct BP090 ratify (preserved): *"I want to do a 6 question test, and repeat 6 (different) question tests until we get the engine purring. THEN we go to the track."*

ITERATIVE PROTOCOL (identical structure to M13, tier-routing layer added):

Each cycle: 6 questions stratified across domains · rotate to cover all 14 across 2-3 cycles · use `selectQuestionsSpreadAcrossDomains(6)` with different seed/offset per cycle

**Tier routing per cycle:**
- HARD difficulty flag → route to ULTRA (M0) primary; FULL (M2/M3) secondary ensemble
- MEDIUM difficulty flag → route to ULTRA + FULL + CORE all contribute
- SHORT / verification → all tiers including CORE

PASS CRITERIA ("engine purring" — tier-aware version):

| Criterion | Target |
|---|---|
| Ensemble accuracy | ≥ 5/6 (83.3%) |
| Zero `answer: null` responses | required |
| Zero `contested: true` unresolved | required |
| ULTRA peer accuracy on HARD questions | ≥ 4/6 |
| FULL peer accuracy on HARD+MEDIUM | ≥ 4/6 |
| CORE peer participation on SHORT+MEDIUM | ≥ 3/6 (CORE handles subset; not expected on all 6) |
| Per-peer model field in receipt | must match actual ramTier assignment — no hallucinated model names |

DECISION TABLE:

| Outcome | Next action |
|---|---|
| All pass criteria met | Run ONE MORE cycle with DIFFERENT 6 questions to confirm stability; if also passes → ADVANCE to Block 4 |
| Most pass, 1 marginal | Re-run with different 6 to see if pattern persists |
| Multiple criteria fail | DIAGNOSE — abort, return to Bishop with findings |

MAX CYCLES BEFORE FOUNDER ESCALATION: 8.

**T3 gate:** Two consecutive 6Q cycles meeting all pass criteria → advance to Block 4. Otherwise abort + diagnose.

### Block 4 — Fire 42Q LONGHAUL with Tiered Fleet

```
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node validate-relay.mjs \
  --questions=42 \
  --mode=smoke \
  --routing=tier-aware \
  --tier-config=ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597 \
  --question-difficulty-routing=hard:ultra+full,medium:ultra+full+core,short:all \
  --andon-escalate=star-chamber \
  --andon-threshold=15 \
  --wire=hex-mcode \
  --plow=mesh-12-blade \
  --flagship-tier=mixed-tiered \
  --trial-id=TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED \
  --pass=A \
  --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json
```

Receipt seals at:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED\`

**Receipt MUST include `fleet_composition` block (BP091 §3.3 binding):**

```json
{
  "fleet_composition": {
    "peers": [
      {
        "peer_id": "cb4ef450",
        "ramTier": "ULTRA",
        "ollamaModel": "llama3.3:70b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ HARD/MEDIUM breakdown }}"
      },
      {
        "peer_id": "d0b47bd0",
        "ramTier": "FULL",
        "ollamaModel": "gemma4:12b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ HARD/MEDIUM breakdown }}"
      },
      {
        "peer_id": "88cbf6bd",
        "ramTier": "FULL",
        "ollamaModel": "gemma4:12b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ HARD/MEDIUM breakdown }}"
      },
      {
        "peer_id": "c532e740",
        "ramTier": "CORE",
        "ollamaModel": "gemma2:9b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ MEDIUM/SHORT breakdown }}"
      },
      {
        "peer_id": "49f3e597",
        "ramTier": "CORE",
        "ollamaModel": "gemma2:9b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ MEDIUM/SHORT breakdown }}"
      }
    ],
    "per_tier_accuracy": {
      "ULTRA": "{{ X }}/{{ N }} ({{ PCT }}%)",
      "FULL": "{{ X }}/{{ N }} ({{ PCT }}%)",
      "CORE": "{{ X }}/{{ N }} ({{ PCT }}%)"
    },
    "fleet_ensemble_accuracy": "{{ X }}/42 ({{ PCT }}%)",
    "model_families": "llama3.3:70b (M0 ULTRA) + gemma4:12b (M2/M3 FULL) + gemma2:9b (M1/MS CORE) — TIERED BY CAPACITY · Ah Hayelped BP091"
  }
}
```

### Block 5 — Four-Way Comparison Receipt

Compose at `Asteroid-ProofVault\receipts\THUNDERCLAP\COMPARISON_M10_M12_M13_M13b_BP091.md`:

| Variable | M10 | M12 | M13 (superseded) | M13b |
|---|---|---|---|---|
| Architecture | v0.5.15 (no plow in payload) | v0.5.16 + per-domain timeout + escalation | v0.5.16 + per-domain timeout + escalation | v0.5.16 + per-domain timeout + escalation + tier-aware routing |
| Fleet intent | Heterogeneous (uncontrolled) | Heterogeneous (uncontrolled) | Homogeneous gemma4:12b (never fired) | Tiered by capacity (BP091 Ah Hayelped) |
| Fleet actual | 3× gemma4:12b + 1× qwen2.5:7b | 3× gemma4:12b + 1× qwen2.5:7b | STAGED — superseded by M13b | ULTRA llama3.3:70b + 2× FULL gemma4:12b + 2× CORE gemma2:9b |
| Fleet visibility | INVISIBLE (post-hoc discovery) | INVISIBLE (post-hoc discovery) | N/A | VISIBLE · per-peer logged in receipt |
| Ensemble accuracy | 59.5% | 61.9% | N/A | **{{ M13b_ENSEMBLE }}%** |
| Escalations fired | 0 | 29/42 (69%) | N/A | **{{ M13b_ESCALATION_COUNT }}/42** |
| Per-tier accuracy | N/A | N/A | N/A | **ULTRA: {{ }}% · FULL: {{ }}% · CORE: {{ }}%** |
| Canonical status | Superseded | Superseded (contaminated) | VOID — superseded by M13b | **CANONICAL** |

**M13 (BP090) explicit supersession note:** M13 was staged to homogenize the fleet as a correction to M12's invisible contamination. BP091 Ah Hayelped doctrine established that forced homogenization is the wrong answer — capacity-matched heterogeneity is the cooperative architecture's structural truth. M13 was never fired and is superseded by M13b without loss of empirical record.

### Block 6 — M12 Canonical Seal-With-Disclosure (Close Out M12 Record)

Seal M12 canonical receipt at:
`Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_LONGHAUL\TRIAL_02_PREVIEW_42Q_LONGHAUL_COMPLETE.md`

Include the following disclosure verbatim:

> "M12 ran with mixed model fleet (3× gemma4:12b LAN peers + 1× qwen2.5:7b WAN peer per receipt model_families field). The heterogeneity was INVISIBLE (root cause: MnemosyneC FULL tier UI confirmed on Son's machine while peer_presence still registered qwen2.5:7b — OOM on 16 GB, BP091 §5 bug receipt). M12 ensemble 61.9% is empirically valid as an architectural-validation receipt (29 escalations fired in production) but does not isolate any single model-variable. M13b (BP091 Ah Hayelped · tiered-by-capacity fleet · intentional + visible heterogeneity) is the canonical measurement; see COMPARISON_M10_M12_M13_M13b_BP091.md."

Do NOT discard M12 receipt JSON — it is empirically valuable as the escalation-architecture validation receipt (29/42 escalations fired confirms the andon layer is operational).

### Block 7 — Headline Composition + Social Surface Placeholder Update

Knight computes the canonical M13b headline from the sealed receipt:

```
Free cooperative tiered substrate: 5 peers across 3 tiers
· M0 llama3.3:70b (ULTRA)
· M2/M3 gemma4:12b (FULL)
· M1/MS gemma2:9b (CORE)
· scored {{ M13b_ENSEMBLE }}% on MMLU-Pro 42Q stratified LONGHAUL
· commodity hardware works
· Ah Hayelped (BP091)
```

Update all 23 staged social surfaces from `{{ M12_* }}` and `{{ M13_* }}` placeholders to `{{ M13b_* }}`. Bishop handles sed pass once receipt lands.

**Do NOT fire any social copy until M13b receipt is sealed.** M12 heterogeneous contamination + M13 void status mean no prior numbers are social-blast ready.

### Block 8 — Return to Bishop

Brief includes:
- M13b ensemble accuracy
- Per-tier accuracy breakdown (ULTRA / FULL / CORE)
- Escalation count and distribution
- Per-peer accuracy (fleet_composition block)
- Comparison receipt filepath
- Explicit Truth-Always note: M13b is the canonical "BP091 tiered cooperative mesh" measurement; supersedes M12 as social-blast empirical anchor and voids M13 (BP090)
- Confirmation that M12 close-out disclosure is sealed

---

## §5 Truth-Always Gates

| Gate | Condition | Fail action |
|---|---|---|
| T0 | M0 serves llama3.3:70b at dispatch time | ABORT — M18b dependency unmet |
| T1 | All 5 peers rostered with correct ramTier + model at pre-flight | ABORT with per-peer diagnosis |
| T2 | 1Q smoke: both ULTRA and CORE latency profiles match models | DIAGNOSE before advancing |
| T3 | Two consecutive 6Q smoke cycles meet all pass criteria | ABORT + return to Bishop |
| T4 | Block 4 receipt includes `fleet_composition` JSON with per-peer model + ramTier | Receipt is non-canonical without it |
| T5 | `model_families` field in receipt explicitly states tiered-by-capacity framing (not "homogeneous") | Correct before sealing |
| T6 | Comparison receipt (Block 5) notes M13 void status + M12 contamination + M13b canonical status | Required for lineage integrity |
| T7 | M12 close-out includes BP091 disclosure verbatim | Required — M12 record not fully closed without it |

---

## §6 Dependencies

**Hard dependency — M18b MUST land first:**

M13b fires AFTER M18b (the dispatch that flips M0 from gemma4:12b to llama3.3:70b). Without M18b, M0 is not serving the ULTRA-tier model and M13b's entire tier-routing architecture collapses to "FULL + CORE with a misclassified ULTRA peer" — which would reproduce M12's invisible-contamination failure mode in reverse. M18b is non-negotiable.

**Soft dependency — Son's WAN node (49f3e597) gemma2:9b:**

Son's machine should be right-sized to gemma2:9b per BP091. If it still registers qwen2.5:7b, that is a new instance of the BP091 UI bug and must be triaged before M13b fires. Resolution: Founder or Son confirms gemma2:9b is serving from terminal (`ollama run gemma2:9b` smoke test). Does not block M13b outright if 4 FULL/ULTRA peers are active, but the 5-peer fleet_composition block will be incomplete without MS.

---

## §7 Out of Scope

- Tier 2 flagship fallback (Anthropic/OpenAI/Google API calls) — still prohibited. Local + cooperative only.
- Switching any peer to a non-right-sized model to force homogeneity — explicitly prohibited by BP091.
- Firing M13 (BP090 homogeneous version) at any point — it is superseded and void.
- Changing the v0.5.16 architecture — the test measures the architecture as built, not a modified version.
- Social blast before receipt seals — no M12/M13 numbers propagate to public surfaces.

---

## §8 Ratification Gates

**Founder ratify path (same as M13 + BP091 reframe addendum):**

1. Founder confirms M18b has landed (M0 serving llama3.3:70b)
2. Founder confirms Son's WAN node status (gemma2:9b serving or triage plan)
3. Founder explicit: "Fire M13b" — Knight wakes and begins Block 0 verification
4. Post-receipt Founder review of fleet_composition block — per-tier accuracy visible + honest
5. Founder ratifies M13b as the canonical THUNDERCLAP receipt before social blast

**Reframe addendum (BP091 specific):**
- Founder confirms: M13b headline uses "tiered cooperative substrate" framing, NOT "homogeneous gemma4:12b" framing
- Founder confirms: "Ah Hayelped" doctrine (every peer contributes per capacity) is the narrative anchor for the social blast and any PROV filing that references this receipt

---

## §9 Wall-Clock Estimate

| Block | Time |
|---|---|
| 0 M18b dependency gate | depends on M18b landing (Bishop coordinates Phase 2 mega-paste) |
| 1 Pre-flight tier inventory | 5-10 min |
| 2 1Q tier-stratified smoke | 5-10 min |
| 3 6Q iterative smoke cycles (up to 8 cycles) | 30-90 min |
| 4 Fire 42Q tiered LONGHAUL | 90-180 min (per-domain timeouts active; similar wall-clock to M12 ~88.9 min) |
| 5 Four-way comparison receipt | 20 min |
| 6 M12 canonical seal-with-disclosure | 10 min |
| 7 Headline + social surface placeholders | 10 min |
| 8 Return to Bishop | 5 min |
| **TOTAL (after M18b confirmed)** | **~3-6 hrs** |

---

## §10 Anticipated Return Artifacts

1. `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_COMPLETE.md` — canonical sealed receipt with fleet_composition block
2. `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED\fleet_composition.json` — machine-readable per-peer accuracy breakdown
3. `Asteroid-ProofVault\receipts\THUNDERCLAP\COMPARISON_M10_M12_M13_M13b_BP091.md` — four-way comparison receipt with M13 void notation
4. `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_LONGHAUL\TRIAL_02_PREVIEW_42Q_LONGHAUL_COMPLETE.md` — M12 close-out with BP091 disclosure
5. Social surface placeholder updates (23 surfaces · `{{ M13b_* }}` templated · NOT fired until Founder ratifies)
6. Bishop brief: M13b canonical numbers + lineage summary

---

## §11 Receipt Anchors + Lineage

- M12 receipt JSON (preserved): `BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json`
- M10 partial receipt: `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q\`
- M13 (superseded, void): `BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_SESSION_13_HOMOGENEOUS_FLEET_REFIRE_BP090.md`
- BP091 Ah Hayelped canon: `Asteroid-ProofVault\state\eblets\CANON\canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md`
- Mesh test discipline: `canon_lan_as_wan_test_mode_4_machine_mesh_bp085`
- Long-haul discipline: `canon_fix_as_we_go_build_for_the_long_haul_bp053`

---

*Stage only. Knight fires after M18b lands per Phase 2 mega-paste. — Bishop · Sonnet 4.6 SEG · BP091 · 2026-06-22*

*Each carries what they can. And we can all help.*
