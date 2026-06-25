# How to Fire M13c THUNDERCLAP Outside Knight — BP092

**TL;DR:** Double-click `FIRE_M13c.cmd`. Press ENTER at the pre-flight prompt. Walk away for ~90-150 min. Receipt arrives in Asteroid-ProofVault automatically.

---

## Why This Exists

Knight's MCP-sandboxed "background worker" pattern was theatrical **twice** in BP092. The wrapper printed "M13c THUNDERCLAP Execution is running in the background" but `validate-relay.mjs` was never actually executed against the mesh — `peer_presence` wave_id remained NULL, `mesh_task_queue` stayed at 0 rows, `peer_marks_log` stayed at 0 rows after 60+ minutes. The canonical bypass is to fire the Node process directly from a real Windows terminal Founder controls.

---

## Step 1 — Double-click this file

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c.cmd
```

A PowerShell window opens. It runs `FIRE_M13c_THUNDERCLAP_V061.ps1` with `-NoProfile -ExecutionPolicy Bypass`.

---

## Step 2 — Watch pre-flight (automatic, ~5 sec)

You will see:

```
========================================================================
  M13c THUNDERCLAP v0.6.1 PRE-FLIGHT
  BP092 · Direct OS-shell fire · Knight sandbox bypassed
========================================================================
[PRE-FLIGHT 1/4] Checking Node.js...  OK (v20.x.x)
[PRE-FLIGHT 2/4] Checking validate-relay.mjs...  OK
[PRE-FLIGHT 3/4] Checking secrets file...  OK (exists, not echoing)
[PRE-FLIGHT 4/4] Checking per_domain_timeout_config.json...  OK
[SECRETS] SERVICE_ROLE_KEY injected into child env (length=xxx, not echoed)
[SECRETS] SUPABASE_URL + ANON_KEY injected from public env (not sensitive)
```

If any check says FAIL, stop. Fix the indicated problem before retrying.

---

## Step 3 — Read the banner, then press ENTER

```
========================================================================
  M13c THUNDERCLAP 42Q SWEEP — READY TO FIRE
========================================================================
  Target fleet    : 5 peers · v0.6.0 · relay.lianabanyan.com (WAN)
  Fleet tiers     : ULTRA cb4ef450 llama3.3:70b
                    FULL  d0b47bd0+88cbf6bd gemma4:12b
                    CORE  c532e740+49f3e597 gemma2:9b
  Questions       : 42  (spread across 14 MMLU-Pro domains)
  Routing         : tier-aware (Ah Hayelped BP091)
  Baseline to beat: M12 ensemble 61.9%
  Est. wall-clock : ~90-150 min
  Receipt dest    : C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060
========================================================================

Press ENTER to fire, or Ctrl-C to abort.
```

Press **ENTER**. Walk away.

To abort cleanly: press **Ctrl-C** in the terminal at any time before the run completes.

---

## Step 4 — Progress (every question, live in the terminal)

Each question prints:

```
[Q01/42] source_id=... (math) correct=B timeout=1500s
  [tier-routing] math → difficulty=hard → tiers=[ultra+full] → ULTRA:cb4ef450, FULL:d0b47bd0, FULL:88cbf6bd
  Dispatched 3 routes — polling replies (timeout 1500s · approach@1200s)...
  [cb4ef450] B [✅]
  [d0b47bd0] B [✅]
  [88cbf6bd] C [❌]
  Ensemble: B [✅] | escalation_fired=false | source=council_majority
```

ANDON escalation prints a yellow line if variance > 15% at the 80% timeout threshold.

---

## Step 5 — Final summary and receipt

At the end of 42 questions:

```
══════════════════════════════════════════════════════════════
5-PEER RELAY ORCHESTRATOR · BP090 TRIPLE-MAMBA · CROSS-VENDOR
══════════════════════════════════════════════════════════════
Ensemble Score:  XX/42 = XX.X%
Contested:       N
Escalation fired: N/42 questions
...
Receipt written: C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060_RECEIPT_<timestamp>.json

PASS — Ensemble >= 60% threshold    (or FAIL if below)
```

Then the PS1 wrapper prints:

```
========================================================================
  M13c THUNDERCLAP — RUN COMPLETE
========================================================================
  Exit code    : 0 (PASS >= 60%)
  Wall-clock   : XX.X min
  Log file     : C:\...\tools\mesh-validation\m13c_run_<timestamp>.log
  Receipt dir  : C:\...\receipts\THUNDERCLAP\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060
  Ensemble Score:  XX/42 = XX.X%
```

---

## Where things land

| Artifact | Path |
|---|---|
| JSON receipt (canonical) | `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060\TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060_RECEIPT_<timestamp>.json` |
| TEE log (full stdout) | `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\m13c_run_<timestamp>.log` |
| KniPr (Knight writes after run) | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIPR_M13c_THUNDERCLAP_V060_RECEIPT_BP092.md` |

---

## What Bishop does while the run is in progress

Bishop's main thread can tail the log file to surface MIC progress reports at Q10 / Q20 / Q30 / Q42. The TEE log receives every line validate-relay.mjs emits in real time. Bishop reads the log; the run does not depend on Bishop.

---

## How to abort

Press **Ctrl-C** in the terminal window at any time. The Node process terminates. Any partial receipt is NOT written (validate-relay.mjs writes the receipt only at the end). The log file captures all output up to the abort point.

---

## CLI signature (empirical — what the PS1 actually passes)

```
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs" \
  --questions=42 \
  --mode=smoke \
  --routing=tier-aware \
  --tier-config=ultra:cb4ef450cc4a18c3,full:d0b47bd08633385b+88cbf6bdd6f74587,core:c532e74069e137bc+49f3e5971518a064 \
  --question-difficulty-routing=hard:ultra+full,medium:ultra+full+core,short:all \
  --andon-escalate=star-chamber \
  --andon-threshold=15 \
  --wire=hex-mcode \
  --plow=mesh-12-blade \
  --flagship-tier=mixed-tiered \
  --trial-id=TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060 \
  --pass=A \
  --per-domain-timeout=<path>\per_domain_timeout_config.json
```

Note: `--abstain-protocol` and `--contested-cascade` from the M13c dispatch document are NOT in `parseArgs()`. The contested-vote Tier 1/2/3 cascade is baked into the script at commit dde5e5c and fires automatically. `--fleet-composition-receipt=true` is also not a flag — the fleet_composition block is always written to the receipt when `--trial-id` is set.

---

*Bishop SEG · Sonnet 4.6 · BP092 · 2026-06-23*
*Each carries what they can. And we can all help.*
