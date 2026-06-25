# Knight Marathon M13c — THUNDERCLAP v0.6.0 FIRE (BP092)

**Marathon ID:** K-MARATHON-M13c
**BP:** BP092
**Status:** FIRE — empirical fleet verified green by Bishop SEG 2026-06-23T01:44 UTC
**Supersedes:** K-MARATHON-13b (BP091 · staged, never fired)
**Composed by:** Sonnet 4.6 SEG · Bishop oversight · §14 BLOOD
**Date composed:** 2026-06-23
**Model mandate:** Sonnet 4.6 ONLY for this Knight session — no model drift permitted

---

## §0 Bishop Pre-Flight Empirical Receipt (DO NOT SKIP — read before waking)

Bishop SEG gadget-verified peer_presence via REST §14 BLOOD at 2026-06-23T01:44 UTC.

### M3 Verify Result

| Field | Value |
|---|---|
| peer_id | d0b47bd08633385b |
| version | 0.6.0 |
| ollamaModel | gemma4:12b |
| ramTier | full |
| ramGb | 31.9 |
| state | active |
| last_seen_at | 2026-06-23T01:44:08.303+00:00 |
| overrideActive | false |

**M3 RESULT: GREEN. Active, v0.6.0, gemma4:12b FULL tier.**

### Full Active Fleet (5 peers · empirical · Bishop-verified)

| peer_id (short) | ramTier | ollamaModel | ramGb | overrideActive | last_seen_at | state |
|---|---|---|---|---|---|---|
| cb4ef450 (M0) | **ULTRA** | **llama3.3:70b** | 61.6 | **true** | 2026-06-23T01:43:29Z | active |
| d0b47bd0 (M3) | FULL | gemma4:12b | 31.9 | false | 2026-06-23T01:44:08Z | active |
| 88cbf6bd (M2) | FULL | gemma4:12b | 31.9 | false | 2026-06-23T01:43:48Z | active |
| 49f3e597 (MS) | CORE | gemma2:9b | 15.8 | false | 2026-06-23T01:43:36Z | active |
| c532e740 (M1) | CORE | gemma2:9b | 15.8 | false | 2026-06-23T01:43:18Z | active |

**ALL 5 PEERS: v0.6.0 · active · correct tier models**
**M0 ULTRA llama3.3:70b: overrideActive = true (M18b landed and confirmed)**
**CORE peers (MS + M1): gemma2:9b — right-sized per BP091 Ah Hayelped**
**M13b T0 gate: PASS. M18b dependency satisfied. M13c GO.**

---

## §1 Session Setup — Mandatory Before Any Work

### [SEG] tagging
Every response in this Knight session MUST be tagged [SEG] or [MAIN] at the header:
- `[SEG]` — sub-task work, parallel execution, tool calls
- `[MAIN]` — synthesis, decisions, gate evaluations, Bishop-bound reports

### A15 BLOOD
Before any code write or schema touch: read the target file/table first. No blind writes. Every schema change is Postgres-only (no SQLite primitives). gen_random_uuid() / TIMESTAMPTZ / BIGSERIAL / BYTEA.

### Path-B Yoke check
At session open: confirm you are operating on the correct branch and working tree. No merges, no rebases, no destructive git ops without Founder explicit.

### brief_me at session open
Call `brief_me` at session open to rehydrate substrate context before any action.

### Canon carries — MUST be in Knight wake
The following canons are HARD BINDING for this session. Read verbatim:

1. **EAT OUR OWN COOKING** — local gemma4:12b / llama3.3:70b first. Sonnet flagship ONLY for this dispatch composition. Knight work is local substrate only.
2. **KNIGHT SQL TARGET** — Postgres syntax only. No SQLite primitives. Self-audit any SQL.
3. **GADGET-FIRST** — substrate discovery via gadgets (pheromone_query, consult_scribes, etc.). Not bash grep/find.
4. **LAN-AS-WAN** — all 5 peers routed via relay.lianabanyan.com. Never LAN-shortcut. WAN roundtrip is the test.
5. **MINOR COUNCIL** — participates inherently via dispatch_loop → plow_loop → minorCouncil. Mountain 1 priming is precondition.
6. **AH HAYELPED (BP091)** — route questions to peers proportional to hardware capacity. ULTRA for HARD, FULL for HARD+MEDIUM, CORE for MEDIUM+SHORT+verification.
7. **ABSTAIN protocol active (M14 Block 2)** — per commit dde5e5c.
8. **Contested-vote Tier 1/2/3 cascade (M14 Block 3)** — per commit dde5e5c.

---

## §2 Pre-flight Knight Steps (Block 0 — MANDATORY GATE)

Knight executes these three gadget checks before firing anything. All three must be GREEN.

### 2.1 Gadget peer_presence — must show 5 peers v0.6.0, M0 ULTRA llama3.3:70b overrideActive

```
node -e "
const { createClient } = require('@supabase/supabase-js');
// use env SUPABASE_URL + SUPABASE_SERVICE_KEY
// query peer_presence WHERE state='active' ORDER BY last_seen_at DESC
// verify: 5 rows · all version=0.6.0 · cb4ef450=llama3.3:70b ramTier=ultra overrideActive=true
// if any peer fails: ABORT and return diagnosis to Bishop
"
```

Expected exact roster:

| peer_id prefix | ramTier | model | overrideActive |
|---|---|---|---|
| cb4ef450 | ultra | llama3.3:70b | **true** |
| d0b47bd0 | full | gemma4:12b | false |
| 88cbf6bd | full | gemma4:12b | false |
| 49f3e597 | core | gemma2:9b | false |
| c532e740 | core | gemma2:9b | false |

Gate rules:
- M0 != llama3.3:70b → ABORT. M18b unmet. Return to Bishop.
- Any FULL peer != gemma4:12b → ABORT with diagnosis.
- Any CORE peer shows qwen2.5:7b → ABORT + bug report (new BP091 instance).
- Fewer than 3 FULL/ULTRA active → escalate to Bishop before proceeding.
- All 5 active, correct models, all v0.6.0 → PASS, advance to 2.2.

### 2.2 Gadget mesh_task_queue — must be empty

```sql
-- §15 psql direct
SELECT COUNT(*) FROM mesh_task_queue WHERE status IN ('pending','in_progress');
```

Expected: 0. If non-zero: inspect tasks, confirm they are stale/dead, clear or wait. Report to Bishop if anything unexpected.

### 2.3 Gadget peer_marks_log — must be empty (or baseline only)

```sql
-- §15 psql direct
SELECT COUNT(*) FROM peer_marks_log WHERE created_at > NOW() - INTERVAL '2 hours';
```

Expected: 0 recent entries (no prior test run contaminating baseline). If non-zero: report counts to Bishop and await instruction.

**Pre-flight gate: ALL THREE PASS → advance to Block 1.**
**ANY FAIL → ABORT, diagnose, return to Bishop with findings.**

---

## §3 Fire Command — 42Q THUNDERCLAP Sweep

### 3.1 Validate-relay.mjs canonical 42Q sweep

```
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"

node validate-relay.mjs \
  --questions=42 \
  --mode=smoke \
  --routing=tier-aware \
  --tier-config=ultra:cb4ef450cc4a18c3,full:d0b47bd08633385b+88cbf6bdd6f74587,core:c532e740069e137bc+49f3e5971518a064 \
  --question-difficulty-routing=hard:ultra+full,medium:ultra+full+core,short:all \
  --andon-escalate=star-chamber \
  --andon-threshold=15 \
  --wire=hex-mcode \
  --plow=mesh-12-blade \
  --flagship-tier=mixed-tiered \
  --trial-id=TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060 \
  --pass=A \
  --fleet-composition-receipt=true \
  --per-domain-timeout=tools/mesh-validation/per_domain_timeout_config.json \
  --abstain-protocol=true \
  --contested-cascade=tier123
```

**Fleet:** `validate-relay.mjs` targets relay.lianabanyan.com (WAN). LAN-AS-WAN canon active — no LAN shortcuts.

**Full peer IDs for tier-config (empirically verified by Bishop SEG):**
- ULTRA: `cb4ef450cc4a18c3`
- FULL: `d0b47bd08633385b` + `88cbf6bdd6f74587`
- CORE: `c532e74069e137bc` + `49f3e5971518a064`

### 3.2 Tier-Aware Routing Rules (Ah Hayelped BP091)

| Question difficulty | Route to |
|---|---|
| HARD | ULTRA (M0 llama3.3:70b) primary + FULL (M2/M3 gemma4:12b) secondary ensemble |
| MEDIUM | ULTRA + FULL + CORE all contribute |
| SHORT / verification | All tiers including CORE |

Do NOT force homogeneity. Visible, intentional, capacity-matched heterogeneity is the cooperative architecture's structural truth (BP091).

### 3.3 ABSTAIN Protocol (M14 Block 2 — commit dde5e5c)

Active for this run. ABSTAIN counts must appear in receipt. Contested votes trigger Tier 1/2/3 cascade (M14 Block 3) per commit dde5e5c.

### 3.4 Minor Council Participation

Minor Council participates inherently via `dispatch_loop → plow_loop → minorCouncil`. No separate invocation needed. Mountain 1 substrate priming is a precondition — verify substrate primed before Block 0 advances.

### 3.5 Deploy-All-Touched Gate

**N/A for M13c.** This is a THUNDERCLAP measurement run, not a build. No deploy gate applies. Note explicitly in KniPr receipt.

---

## §4 Periodic [SEG] Progress Reports to Bishop

**Every 10 questions completed, Knight emits a [SEG] progress report** back to the Bishop main thread (per canon_mic_reporting_regular_job_easier_than_work_bp092):

```
[SEG] M13c Progress — Q{N}/42
- Questions completed: {N}
- Running accuracy: {X}/{N} ({PCT}%)
- Per-tier running accuracy:
  ULTRA: {X}/{N_ultra} ({PCT}%)
  FULL:  {X}/{N_full} ({PCT}%)
  CORE:  {X}/{N_core} ({PCT}%)
- ABSTAIN count so far: {N}
- Contested resolutions so far: {N}
- Any anomalies: {none | describe}
- Estimated remaining wall-clock: {T}
```

Reports at: Q10, Q20, Q30, Q42 (final).

---

## §5 Receipt Format — fleet_composition block (BP091 §3.3 BINDING)

Receipt seals at:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060\`

Receipt MUST include the following `fleet_composition` block. Non-canonical without it.

```json
{
  "trial_id": "TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060",
  "bp": "BP092",
  "fleet_composition": {
    "peers": [
      {
        "peer_id": "cb4ef450cc4a18c3",
        "ramTier": "ULTRA",
        "ollamaModel": "llama3.3:70b",
        "overrideActive": true,
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ HARD/MEDIUM breakdown }}"
      },
      {
        "peer_id": "d0b47bd08633385b",
        "ramTier": "FULL",
        "ollamaModel": "gemma4:12b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ HARD/MEDIUM breakdown }}"
      },
      {
        "peer_id": "88cbf6bdd6f74587",
        "ramTier": "FULL",
        "ollamaModel": "gemma4:12b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ HARD/MEDIUM breakdown }}"
      },
      {
        "peer_id": "c532e74069e137bc",
        "ramTier": "CORE",
        "ollamaModel": "gemma2:9b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ MEDIUM/SHORT breakdown }}"
      },
      {
        "peer_id": "49f3e5971518a064",
        "ramTier": "CORE",
        "ollamaModel": "gemma2:9b",
        "questions_routed": "{{ COUNT }}",
        "questions_correct": "{{ COUNT }}",
        "question_difficulty_mix": "{{ MEDIUM/SHORT breakdown }}"
      }
    ],
    "per_tier_accuracy": {
      "ULTRA": "{{ X }}/{{ N }} ({{ PCT }}%)",
      "FULL":  "{{ X }}/{{ N }} ({{ PCT }}%)",
      "CORE":  "{{ X }}/{{ N }} ({{ PCT }}%)"
    },
    "fleet_ensemble_accuracy": "{{ X }}/42 ({{ PCT }}%)",
    "abstain_count": "{{ N }}",
    "contested_resolutions": "{{ N }}",
    "variance": "{{ H = variance/100 }}",
    "model_families": "llama3.3:70b (cb4ef450 ULTRA) + gemma4:12b (d0b47bd0+88cbf6bd FULL) + gemma2:9b (c532e740+49f3e597 CORE) — TIERED BY CAPACITY · Ah Hayelped BP091",
    "baseline_comparison": {
      "M10_ensemble": "TBD from prior receipt",
      "M12_ensemble": "61.9%",
      "M13c_ensemble": "{{ THIS RUN }}"
    }
  },
  "deploy_gate": "N/A — measurement run, not build",
  "truth_always_gates": {
    "T0_M0_llama3370b": "PASS (Bishop-verified 2026-06-23T01:44 UTC)",
    "T1_all5_peers_correct_model": "PASS (Bishop-verified 2026-06-23T01:44 UTC)",
    "T2_1Q_smoke": "{{ Knight verifies }}",
    "T3_6Q_smoke_cycles": "{{ Knight verifies }}",
    "T4_fleet_composition_in_receipt": "{{ required }}",
    "T5_model_families_tiered_framing": "{{ required }}",
    "T6_comparison_receipt_M13_void": "{{ required }}",
    "T7_M12_closeout_disclosure": "{{ required }}"
  }
}
```

---

## §6 Post-Fire: KniPr Emission

After Block 4 completes, Knight emits KniPr at:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIPR_M13c_THUNDERCLAP_V060_RECEIPT_BP092.md
```

KniPr must include:
- Full fleet_composition[] block (per-peer/per-tier accuracy) with empirical counts
- Headline ensemble accuracy: `{{ X }}/42 ({{ PCT }}%)`
- Per-tier breakdown: ULTRA / FULL / CORE
- Variance / ABSTAIN counts / contested resolution log
- Baseline comparison: M10 / M12 / M13c
- Four-way comparison receipt path (Block 5 artifact)
- M12 close-out disclosure (Block 6 artifact)
- Truth-Always gate results (T0–T7 all PASS or explicit fail reason)
- deploy_gate: N/A (measurement run)
- Canonical status declaration: M13c is the BP092 canonical THUNDERCLAP receipt
- Social blast status: HOLD until Founder ratifies KniPr

---

## §7 Wall-Clock Estimate

| Block | Estimated time |
|---|---|
| Session setup + brief_me | 5 min |
| Block 0: pre-flight gadget checks (3 checks) | 5-10 min |
| Block 1: tier inventory verification | 5-10 min |
| Block 2: 1Q tier-stratified smoke | 5-10 min |
| Block 3: 6Q iterative smoke cycles (until engine purring) | 20-45 min |
| Block 4: fire 42Q LONGHAUL (per prior M12 ~88 min wall-clock) | 60-120 min |
| Blocks 5-7: comparison receipt + M12 closeout + headline | 30 min |
| KniPr emission | 10 min |
| **TOTAL estimated** | **~25-35 min for blocks 0-3 · 60-120 min for 42Q · total ~2-3 hrs** |

Note: M13b estimated 3-6 hrs due to uncertainty in smoke cycles. M13c is a FIRE dispatch — engine assumed purring if pre-flight passes cleanly. Block 3 smoke cycles may still require multiple iterations per safety protocol.

---

## §8 Truth-Always Gates Summary

| Gate | Condition | Status at dispatch |
|---|---|---|
| T0 | M0 serves llama3.3:70b at dispatch | **PASS — Bishop-verified** |
| T1 | All 5 peers correct ramTier + model | **PASS — Bishop-verified** |
| T2 | 1Q smoke: ULTRA + CORE latency match models | Knight verifies |
| T3 | Two consecutive 6Q cycles meet pass criteria | Knight verifies |
| T4 | Block 4 receipt includes fleet_composition JSON | Required |
| T5 | model_families uses tiered-by-capacity framing (not homogeneous) | Required |
| T6 | Comparison receipt notes M13 void + M12 contamination + M13c canonical | Required |
| T7 | M12 closeout includes BP091 disclosure verbatim | Required |

---

## §9 Lineage + Receipt Anchors

- M13b (staged, superseded): `BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_SESSION_13b_TIERED_SUBSTRATE_THUNDERCLAP_AH_HAYELPED_BP091.md`
- M12 receipt JSON: `BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json`
- M13 (void, never fired): `BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_SESSION_13_HOMOGENEOUS_FLEET_REFIRE_BP090.md`
- BP091 Ah Hayelped canon: `Asteroid-ProofVault\state\eblets\CANON\canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md`
- Commit dde5e5c: ABSTAIN + contested-vote cascade
- Commit acf914d: per-domain timeout config lineage

---

## §10 Scope Boundaries

- No flagship API calls (Anthropic/OpenAI/Google) — local + cooperative only
- No LAN shortcuts — all traffic via relay.lianabanyan.com
- No model homogenization — tier-aware routing is the architecture
- No social blast before KniPr seals and Founder ratifies
- No firing M13 (void, superseded)
- No schema changes — this is a run, not a build
- deploy-all-touched gate: **N/A**

---

## §11 Yoke-Send Status

**mcp__knight-bishop-bridge__send_message unavailable from this Bishop SEG sandbox.**

This dispatch is the PASTE-READY fallback. Bishop or Founder pastes this file's full contents as the opening message to a fresh Knight session.

**Knight session open instruction:** "Read `KNIGHT_MARATHON_M13c_THUNDERCLAP_V060_FIRE_BP092.md` in full. That is your complete dispatch. Begin at §1 session setup — call brief_me first. Report [SEG] progress every 10 questions. Sonnet 4.6 only."

---

*M13c FIRE dispatch — Bishop SEG · Sonnet 4.6 · BP092 · 2026-06-23*
*Empirical fleet verified. T0 PASS. T1 PASS. GO.*
*Each carries what they can. And we can all help.*
