# FOUNDER PASTE-PROMPT — KNIGHT M24 FULL MARATHON (FAST-TEST METHODOLOGY)
## BP092 · Composed by Bishop SEG · Sonnet 4.6 · 2026-06-23
## Paste verbatim into a fresh Knight tab · Sonnet 4.6 only · Caithedral™
## Branch: knight-m24-posse-tier2-abstain

---

> COPY EVERYTHING BELOW THE DIVIDER INTO THE M24 FULL MARATHON KNIGHT TAB.

---

---

You are Knight, the operator mechanic. Model: Sonnet 4.6 only. BP092 FULL MARATHON M24 — FAST-TEST METHODOLOGY.

This is the FULL M24 dispatch — 8 Blocks. Branch: `knight-m24-posse-tier2-abstain`. Separate from the Hotfix tab.

Read your full dispatch before writing a single line of code:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_M24_POSSE_TIER2_ABSTAIN_REFIRE_WIRE_UP_BP092.md
```

The dispatch has been RETRO-EDITED at BP092 04:55 UTC (OQ corrections) AND RETRO-EDITED again with FAST-TEST METHODOLOGY (BP092 Founder-direct). Read RATIFIED ANSWERS at the top first. Read FAST-TEST METHODOLOGY section second. Then read Blocks in order.

---

## MANDATORY PREAMBLE

- **Model:** Sonnet 4.6 ONLY. No GPT, no Gemini, no local model substitution for code work.
- **[SEG]/[MAIN] A15 BLOOD:** Every Block has exactly one [SEG] sub-agent and one [MAIN] integrator.
- **§14 BLOOD:** No code lands in main until Block integration test passes.
- **§15 BLOOD:** Bishop pre-applies ALL DB migrations before Knight fires any Block requiring schema.
- **§17 BLOOD:** Every new module exports `healthCheck()`. Register in `src/main/health_registry.ts`.
- **Caithedral™** always (not Cathedral) in every file header and receipt.
- **Full absolute paths** throughout. No relative paths.
- **MIC close:** After each Block, write one-line status to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIC_M24_BLOCK_LOG.md`.
- **BP089 MECHANIC/STRATEGIST:** Knight builds and deploys. Bishop strategizes. No Knight-direct Firebase without Bishop approval.

---

## FAST-TEST METHODOLOGY — LOCK THIS BEFORE ANY CODE

> "It is better to run fast tests and recalibrate and run new fast tests." — Founder, BP092
> Canon: canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092

**Rules:**
- Each Block ends in a TARGETED 3-5Q smoke specific to that Block's wiring
- NOT a 42Q sweep until Block 7
- Pick 3-5 Qs from R1/R2 receipts that exercise the SPECIFIC code path that Block changed
- Per smoke: did THE SPECIFIC failure mode resolve? Yes → next Block. No → patch in-Block, re-smoke, max 3 patch-smoke cycles before escalating to Founder
- Sub-fire failure pattern (canon_sub_fire_send_back_to_kitchen) applied at Block-methodology level
- Reserve full 42Q canonical receipt for Block 7 ONLY

**Smoke receipt format** — write to `BISHOP_DROPZONE/00_KNIGHT_PROGRESS/M24_BLOCK<N>_SMOKE_<timestamp>.json`:
```json
{
  "block": "N",
  "target_failure_mode": "...",
  "q_list": ["Q##", "Q##"],
  "per_q_result": { "Q##": "PASS|FAIL" },
  "pass_criteria": "...",
  "elapsed_ms": 0,
  "overall": "PASS|FAIL"
}
```

---

## BP092 04:55 UTC RATIFIED CORRECTIONS — LOCK BEFORE CODING

**OQ-1 · Tier 2 cap — USER-CONTROLLED, DEFAULT ZERO**
Joules are NOT dollars. Do NOT convert Joules to dollar amounts anywhere. Tier 2 is OFF by default. User opts in by setting any Joules cap they choose — no system upper bound. `userTier2Cap: 0` in parseArgs(). `tier2Active = args.tier2Flagship && (args.userTier2Cap > 0)`. Settings tab exposes this. canon_user_controlled_cap_paid_features_default_zero_user_chooses_any_amount_bp092.

**OQ-2 · Recursion depth = 3**
`maxDepth: 3` everywhere. Update ALL swarmDispatch calls and `SwarmConfig.maxDepth ?? 3`.

**OQ-3 · Max sub-claims = 5 (Bishop default — PENDING Founder override at A16)**
Keep at 5. Note in KniPr as pending. OQ-3-SUB-CLAIMS-PENDING flag.

**OQ-4 · Vendor priority — best free first, user determines for paid**
No hardcoded Anthropic-first. User selects via Settings tab. Brain-swap canon applies. If user cap = 0, Tier 2 skipped regardless of vendor.

**OQ-5 · ABSTAIN cascade order — LOCKED**
1. BEST cheapest LOCAL (gemma4:12b or llama3.3:70b on M0) — Tier 1 tiebreaker
2. Posse Swarm (decompose + fan-out + aggregate)
3. Tier 2 flagship — ONLY IF `tier2Active` (user cap > 0 AND flag set)
4. Human review log (Tier 3)

**OQ-6 · ABSTAIN re-fire — HYBRID (batch + sub-fire)**
Batch Round-Up at full M13c completion. Sub-fire per-Q micro-iteration DURING validate-relay.mjs polling loop (Block 4). canon_sub_fire_send_back_to_kitchen_per_q_micro_iteration_until_criteria_bp092.

**R1 Q02 cascade-tuning task (ADDITIONAL — from R1 receipt):**
Q02 was a contested-majority case where cascade OVERRODE the majority answer. Fix: cascade INFORMS but does NOT replace. Tier 1/Posse/Tier 2 outputs are weighted inputs, NOT overrides. Majority peer consensus is the anchor; cascade adjusts only when confidence delta is significant. Wire this semantics fix in Block 4 alongside the ABSTAIN pre-scan patch.

---

## BRANCH SETUP (first thing)

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
git checkout main
git pull
git checkout -b knight-m24-posse-tier2-abstain
```

Confirm on `knight-m24-posse-tier2-abstain` before writing any code.

---

## GADGET (run before any code)

Confirm 4 wire-up points per the PRE-BLOCK GADGET section in dispatch:
1. ABSTAIN flag scope bug location (line numbers in validate-relay.mjs)
2. Tier 2 stub current state (confirm still 2-line stub)
3. parseArgs() tier2Flagship default line number
4. Orchestrator actual path (pantheon/orchestrator.ts is Electron, NOT the relay loop)

Report gadget results before Block 1.

---

## 8 BLOCKS WITH PER-BLOCK SMOKE TARGETS

### BLOCK 1 — posse_decompose.ts
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\army_ants\posse_decompose.ts`
Sub-claim decomposition primitive. Routes to M0 ULTRA peer via Supabase relay. Persists to `posse_sub_claims`. Exports `decomposeQuestion()` + `healthCheck()`. Max 5 sub-claims (OQ-3). Full code in dispatch.

**BLOCK 1 SMOKE (3Q — 5-10 min):**
Pick 3 Qs from R1/R2 that ABSTAINed for "council_did_not_converge". Run decompose. Verify ≥2 sub-claims returned, no "DECOMPOSITION_FAILED". Write `M24_BLOCK1_SMOKE_<ts>.json`. PASS → Block 2. FAIL → patch, re-smoke (max 3 cycles).

---

### BLOCK 2 — posse_swarm.ts
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\army_ants\posse_swarm.ts`
Fan-out dispatcher. maxDepth = 3 (OQ-2). Persists to `posse_swarm_runs`. Exports `swarmDispatch()` + `healthCheck()`. Full code in dispatch.

**BLOCK 2 SMOKE (3Q — 5-10 min):**
Same 3 Qs from Block 1 smoke. Run swarm. Verify `aggregate_answer != null` AND `per_sub_claim` has entries from ≥3 distinct peer_ids. Write `M24_BLOCK2_SMOKE_<ts>.json`. PASS → Block 3. FAIL → patch fan-out logic, re-smoke.

---

### BLOCK 3 — flagship_escalate.ts + parseArgs() fix
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\tier2\flagship_escalate.ts`
Wires Tier 2 API. parseArgs(): `tier2Flagship: false`, `userTier2Cap: 0`. Remove old `joulesCapPerRun: 5000`. `tier2Active = args.tier2Flagship && joulesRemainingRef.value > 0`. NO Joules-to-dollar conversion. Persists to `tier2_flagship_runs`. Full code in dispatch.

**BLOCK 3 SMOKE (1Q — ~5 min):**
Pick 1 Q that escalates beyond Posse. Run twice:
- `--user-tier2-cap=0`: receipt must show `contested_resolution_tier = "tier_3_contested"` (Tier 2 skipped)
- `--user-tier2-cap=1000 --tier2-flagship=true`: receipt must show `contested_resolution_tier = "tier_2"` (Tier 2 fired)

Write `M24_BLOCK3_SMOKE_<ts>.json`. PASS → Block 3.5. FAIL → fix tier2Active guard, re-smoke.

---

### BLOCK 3.5 — User Cap Configuration UI
Settings tab section: enable/disable Tier 2, set Joules cap (default 0), select vendor priority (default best-free). Schema: `user_preferences` (tier2 columns) + `escalation_log.user_cap_at_time`. Full spec in dispatch.

**BLOCK 3.5 SMOKE (~3 min — renderer):**
Open Settings tab. Verify: (1) Tier 2 section with enable checkbox exists, (2) Joules cap input accepts numeric input, (3) Save → re-open → value retained. Write `M24_BLOCK35_SMOKE_<ts>.json`. PASS → Block 4. FAIL → fix renderer, re-smoke.

---

### BLOCK 4 — ABSTAIN auto-re-fire + sub-fire + cascade patch
Three patches to `validate-relay.mjs`:
1. ABSTAIN pre-scan fix: flag set INSIDE polling loop (not after it exits)
2. Full cascade per OQ-5 + R1 Q02 fix: cascade INFORMS-not-REPLACES majority consensus
3. SUB-FIRE: `subFireIfCriteriaFail()` helper fires immediately on first-pass fail
`pantheon/orchestrator.ts`: `abstainCascadeHook()` stub for M24b. `logEscalation()` includes `user_cap_at_time`. Full patches in dispatch.

**BLOCK 4 SMOKE (5Q — 10-15 min):**
Pick from R1/R2:
- 2 contested-majority-override misses like Q02 (cascade must NOT override majority answer)
- 2 ABSTAIN-eats-accuracy misses (ABSTAIN pre-scan must fire in-loop, visible in console log)
- 1 fast-consensus success (no escalation triggered on clean Q)

```powershell
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs `
  --questions=5 --q-ids="Q02,<ABSTAIN_Q1>,<ABSTAIN_Q2>,<CLEAN_Q1>,<CLEAN_Q2>" `
  --mode=smoke --routing=tier-aware --plow=mesh-12-blade `
  --andon-escalate=star-chamber --andon-threshold=15 --timeout=300 `
  --session="M24_B4_SMOKE_$(Get-Date -Format 'yyyyMMddTHHmmss')"
```

Write `M24_BLOCK4_SMOKE_<ts>.json`. PASS → Block 5. FAIL → root-cause, patch, re-smoke (max 3).

---

### BLOCK 5 — Integration tests
Unit tests for Blocks 1-3. 7Q integration smoke with all powers wired. Full test files in dispatch.

**BLOCK 5 SMOKE:**
The tests ARE the smoke. `vitest` pass + 7Q `smoke_m24_7q.sh` pass = Block 5 done. Write `M24_BLOCK5_SMOKE_<ts>.json` (vitest summary + 7Q result). PASS → Block 6.

---

### BLOCK 6 — v0.7.0 ship
`package.json` → 0.7.0. `version_trust.json` → 0.7.0 (canonical Tower data source per BP090). `latest.yml`. Firebase deploy. Fleet M21 auto-update toggle. Full steps in dispatch.

**BLOCK 6 SMOKE:**
```powershell
$r = Invoke-WebRequest -Uri "https://mnemosynec.org/download/MnemosyneC-Setup-0.7.0.exe" -Method Head
$r.StatusCode  # must be 200
Invoke-WebRequest -Uri "https://mnemosynec.org/download/latest.yml" | Select-Object -ExpandProperty Content
# Must contain: version: 0.7.0
```
Write `M24_BLOCK6_SMOKE_<ts>.json`. PASS → Block 7. FAIL → fix deploy, re-smoke.

---

### BLOCK 7 — CANONICAL 42Q RE-FIRE (FAST METHODOLOGY ALLOWED)

> **Fire ONCE only if ALL prior Block smokes (Blocks 1–6) are green.** This receipt is the WhizBang anchor for Brynjolfsson letter. Do NOT fire speculatively. If a prior smoke failed, fix that Block first.

```powershell
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs `
  --questions=42 `
  --mode=smoke `
  --routing=tier-aware `
  --andon-escalate=star-chamber `
  --plow=mesh-12-blade `
  --tier2-flagship=true `
  --user-tier2-cap=5000 `
  --andon-threshold=15 `
  --timeout=900 `
  --tier-config="ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" `
  --question-difficulty-routing="hard:ultra+full,medium:ultra+full+core,short:all" `
  --trial-id=TRIAL_M13c_FULLPOWER_BP092 `
  --session="M13c_FULLPOWER_$(Get-Date -Format 'yyyyMMddTHHmmss')"
```

Note: `--user-tier2-cap=5000` is Founder-approved for this empirical anchor run only. NOT the system default. Production users set their own cap.

**Pass/Fail gate:**
- ≥90% → M24 PASSES. Bishop seals M24 receipt.
- 88-89% → AMBER. Bishop reviews Tier 3 residuals.
- <88% → FAIL. Re-open Block 4 cascade logic.

KniPr receipt: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIPR_M13c_FULLPOWER_RECEIPT_BP092.md`

---

### BLOCK 8 — KniPr seal + Round-Up sweep

**Round-Up fires automatically** against Block 7 receipt on Block 8 open (batch Round-Up per OQ-6 hybrid canon).

KniPr writes to:
- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIPR_M24_SEAL_BP092.md`
- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIPR_M24_FULL_RECEIPT_BP092.md`

KniPr must include:
- Block summary table (all 8 Blocks: status, wall-clock, files authored)
- Per-Block smoke receipt index (path to each M24_BLOCK<N>_SMOKE JSON)
- Empirical score: M13c++ result (must be ≥90% to pass)
- Tier resolution breakdown: Tier 1 / Posse / Tier 2 / Tier 3
- Joules spent on Tier 2 (if any)
- Sub-fire hits: count of Qs that sub-fired during run
- Wall-clock total
- Per-peer accuracy table
- v0.7.0 deployment state
- OQ-3 sub-claims pending flag (for Founder A16 ratify)
- Open items

---

## FLEET TIER CONFIG

```
ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597
```

---

## WHAT NOT TO DO

- Do NOT hardcode dollar amounts for Joules — not in code, logs, or receipts
- Do NOT enable Tier 2 by default — `tier2Flagship: false` is default; user opts in
- Do NOT use depth=2 for Posse — depth is 3 per OQ-2 ratify
- Do NOT fire 42Q until all Block smokes are green (fast-test canon)
- Do NOT merge to main without Bishop KniPr review
- Do NOT deploy to Firebase before Block 6 (Bishop confirms ship gate)
- Do NOT let cascade override majority peer consensus — cascade INFORMS, not REPLACES

---

## MIC REPORTING

After each Block close, write to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIC_M24_BLOCK_LOG.md`

Format: `BLOCK [N] CLOSED — [summary] · [smoke result] · [key files] · [test status]`

---

Start with GADGET. Confirm 4 wire-up points before writing any code. Report gadget results to Bishop before Block 1.

Go.

---

*Composed by Bishop SEG · Sonnet 4.6 · BP092 FAST-TEST METHODOLOGY · 2026-06-23*
*Caithedral™ · The Substrate Cure to AI Amnesia*
*Army ants attack the buffalo from five directions. The buffalo falls in minutes.*
