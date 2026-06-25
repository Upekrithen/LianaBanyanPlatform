# FOUNDER PASTE-PROMPT — KNIGHT HOTFIX M24 POSSE ROUND-UP
## BP092 · 2026-06-22 · Paste verbatim into a FRESH Knight tab (NOT the live M13c tab)
## RETRO-EDITED BP092 04:55 UTC · Corrected OQ answers + user-cap + sub-fire pattern

---

> COPY EVERYTHING BELOW THE DIVIDER LINE INTO THE NEW KNIGHT TAB.

---

---

You are Knight, the operator mechanic. Model: Sonnet 4.6 only. BP092 HOTFIX.

**DO NOT TOUCH** the live Knight session running M13c. This is a FRESH tab, FRESH branch, FRESH scope.

**THIS HOTFIX scope (4–6 hrs wall-clock):** Build Posse decompose module + Posse swarm module + Round-Up CLI sweep tool. Pure script work. No Electron rebuild. No version bump. No Firebase deploy.

Read your full dispatch before writing a single line of code:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_HOTFIX_M24_POSSE_ROUND_UP_BP092.md
```

## BP092 04:55 UTC RATIFIED CORRECTIONS — READ BEFORE CODING

**OQ-1 · Tier 2 cap:** USER-CONTROLLED, default 0. Tier 2 OFF by default. User sets any Joules cap they choose. NO Joules-to-dollar conversion anywhere. The `--tier2-budget` flag is RENAMED to `--user-tier2-cap` (old flag kept as alias for backwards compat). canon_user_controlled_cap_paid_features_default_zero_user_chooses_any_amount_bp092.

**OQ-2 · Recursion depth:** depth = 3. Update `maxDepth: 3` everywhere (was 2).

**OQ-3 · Sub-claims:** 5 (Bishop default). Founder has NOT overridden. Stays 5. Flag for A16 end-of-cycle ratify.

**OQ-4 · Vendor priority:** Best free default; user-determined for paid. No hardcoded vendor priority. If user cap = 0, Tier 2 is skipped entirely — do not even attempt API call. canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085.

**OQ-5 · Cascade order:** Local cheapest (gemma4:12b/llama3.3:70b M0) → Posse Swarm → Tier 2 (ONLY if user cap > 0) → Tier 3 human log. Hotfix scope = pure Posse (Steps 1+2 only). Tier 2 fires only if user explicitly sets `--user-tier2-cap=[N]`.

**OQ-6 · Sub-fire pattern:** Hotfix delivers BATCH mode only (Round-Up after M13c completion). Sub-fire (per-Q micro-iteration during run) requires hooking into validate-relay.mjs — which this hotfix does NOT touch. Full sub-fire wired in M24 Full Marathon Block 4. Use `--mode=batch` (default). If `--mode=sub-fire` is passed, Knight prints a warning and falls back to batch. Reference: canon_sub_fire_send_back_to_kitchen_per_q_micro_iteration_until_criteria_bp092.

---

## MANDATORY PREAMBLE

- **Model:** Sonnet 4.6 ONLY. No GPT, no Gemini, no local model substitution for code work.
- **[SEG]/[MAIN]:** Every Block gets one [SEG] sub-agent + one [MAIN] integrator. A15 BLOOD.
- **§14 BLOOD:** No code lands on branch until Block integration test passes.
- **§15 BLOOD:** DB migrations (`posse_sub_claims`, `posse_swarm_runs`, `escalation_log`) are being pre-applied by Bishop in background. Before Block 3, confirm tables exist — see dispatch for check command.
- **§17 BLOOD:** Every new module exports `healthCheck()`. Register in `src/main/health_registry.ts`.
- **Caithedral™** always (not Cathedral) in every file header and receipt.
- **Full absolute paths** throughout. No relative paths.
- **MIC close:** After each Block, write one-line status to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIC_HOTFIX_M24_ROUND_UP_BLOCK_LOG.md`.

---

## BRANCH SETUP (first thing)

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
git checkout main
git pull
git checkout -b knight-hotfix-m24-posse-roundup
```

Confirm you are on `knight-hotfix-m24-posse-roundup` before writing any code.

---

## SCOPE — 4 BLOCKS ONLY

### GADGET (run before any code)
- Find M13c receipt JSON (most recent `VALIDATION_RUN_RECEIPT_RELAY_*.json` in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` or most recent `*M13c*` in `Asteroid-ProofVault\receipts\THUNDERCLAP\`)
- Confirm receipt schema: `questions[].ensemble.contested`, `questions[].per_peer`
- Count miss-list: questions where `ensemble.contested=true` OR any peer `answer=null` OR any peer `replied=false`
- Report: miss count, domains, whether M13c is still in-flight or complete
- MIC: `GADGET COMPLETE — receipt path: [PATH] · miss-list: [N] questions`

### BLOCK 1 — `src/main/army_ants/posse_decompose.ts`
Full implementation is in your dispatch. Authors the sub-claim decomposition primitive that routes to M0 ULTRA peer via Supabase relay and persists to `posse_sub_claims` table. Exports `decomposeQuestion()` + `healthCheck()`.

### BLOCK 2 — `src/main/army_ants/posse_swarm.ts`
Full implementation in dispatch. Fan-out dispatcher — sends each sub-claim to tier-appropriate peer, aggregates weighted vote, recurses on contested sub-claims (max depth 2), persists to `posse_swarm_runs`. Exports `swarmDispatch()` + `healthCheck()`.

### BLOCK 3 — `tools/mesh-validation/round_up_sweep.mjs`
Full implementation in dispatch. The Round-Up orchestrator:
1. Reads M13c receipt JSON (`--receipt=<path>`)
2. Identifies miss-list (contested OR abstain OR timeout)
3. Fires `decomposeQuestion` → `swarmDispatch` on each miss
4. If still contested AND `--tier2-budget > 0` AND `ANTHROPIC_API_KEY` present: escalates to Tier 2 flagship (skip otherwise — record as best-effort)
5. Writes `ROUND_UP_RECEIPT_<session>_<timestamp>.json` alongside original receipt
6. Prints delta summary: original score → new estimated score

### BLOCK 4 — SMOKE + FULL ROUND-UP FIRE
1. Dry-run: confirm miss-list parse (`--dry-run`)
2. 3-question smoke: fire Posse on first 3 misses, confirm relay round-trip works
3. WAIT for M13c to be COMPLETE (final receipt written) before firing full sweep
4. Full sweep: `node round_up_sweep.mjs --receipt=[M13c receipt path] --tier-config=[fleet tiers] --user-tier2-cap=0 --mode=batch`
5. Write KniPr at: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIPR_HOTFIX_M24_ROUND_UP_BP092.md`

---

## WHAT NOT TO DO

- Do NOT touch `validate-relay.mjs` in this hotfix (that's full M24 scope on the other branch)
- Do NOT bump version in `package.json` or `version_trust.json`
- Do NOT deploy to Firebase
- Do NOT touch `src/main/pantheon/orchestrator.ts`
- Do NOT merge to main — Bishop reviews KniPr first
- Do NOT fire round_up_sweep on M13c while M13c is still running — wait for final receipt

---

## WHY THIS IS NARROW

The full M24 Marathon (`KNIGHT_MARATHON_M24_POSSE_TIER2_ABSTAIN_REFIRE_WIRE_UP_BP092.md`) is 8 Blocks, 14–22 hrs, wires everything into production including Electron rebuild, v0.7.0 ship, Firebase deploy, fleet auto-update. It runs on branch `knight-m24-posse-tier2-abstain` — do not touch.

THIS hotfix (4–6 hrs) ships JUST the round-up tool. The Founder's direction is clear: "I want to Round Up all the ones we missed. ALL of them. NOT GOOD ENOUGH." The Round-Up sweep fires on M13c's miss-list within minutes of M13c completing. WhizBang component 8 (Posse decompose) is demonstrably wired empirically. Full M24 for production integration runs in parallel.

---

## FLEET TIER CONFIG (use in --tier-config flag)

```
ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597
```

Adjust if fleet composition differs — Gadget step will show current active peers.

---

## ROUND-UP SWEEP COMMAND (Block 4 — after smoke passes)

```powershell
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\round_up_sweep.mjs `
  --receipt="[PASTE M13c RECEIPT PATH HERE]" `
  --tier-config="ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" `
  --timeout=180 `
  --user-tier2-cap=0 `
  --mode=batch `
  --session="ROUNDUP_M13c_FULL_$(Get-Date -Format 'yyyyMMddTHHmmss')"
```

Replace `[PASTE M13c RECEIPT PATH HERE]` with the path from your Gadget step.

`--user-tier2-cap=0` (default) = pure cooperative Posse, no flagship API spend. User controls this value if they want Tier 2.
`--mode=batch` = fire Round-Up ONCE on full M13c completion (only mode available in hotfix).

---

## KNIPR FORMAT

When writing `KNIPR_HOTFIX_M24_ROUND_UP_BP092.md`, include:

```
# KniPr — HOTFIX M24 Posse Round-Up · BP092

## Branch: knight-hotfix-m24-posse-roundup
## Session: [round-up session ID]
## Wall-clock: [X hrs Y min]
## M13c receipt: [path]

## Original Score
[X]/[TOTAL] = [PCT]%
Misses: [N] questions

## Round-Up Results
| source_id | domain | correct | original | round-up | correct? | tier | elapsed |
|-----------|--------|---------|----------|----------|----------|------|---------|
[one row per miss]

## Delta Summary
Newly resolved: [N]
Still missed: [N]
Estimated new score: [X]/[TOTAL] = [PCT]%

## Still-Missed (if any)
[list with correct letter — Founder review required]

## Files Authored
- C:\...\src\main\army_ants\posse_decompose.ts
- C:\...\src\main\army_ants\posse_swarm.ts
- C:\...\tools\mesh-validation\round_up_sweep.mjs
- C:\...\BISHOP_DROPZONE\00_FOUNDER_REVIEW\ROUND_UP_RECEIPT_[session]_[timestamp].json

## Open Items
[any unresolved issues]

## MIC Block Log
[paste from MIC_HOTFIX_M24_ROUND_UP_BLOCK_LOG.md]
```

---

Start with GADGET. Report miss-list count before writing any code. If M13c receipt is not yet final, note it and proceed to Blocks 1–3 (code authoring) while waiting — do not fire Block 4 sweep until M13c receipt is complete.

Go.
