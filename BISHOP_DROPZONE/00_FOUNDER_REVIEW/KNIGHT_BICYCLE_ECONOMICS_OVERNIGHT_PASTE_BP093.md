# KNIGHT BICYCLE ECONOMICS OVERNIGHT PASTE · BP093
# §3 Sonnet 4.6 · §14 gadget-first discovery · §17 BLOOD overnight dispatch
# Composed by Bishop · 2026-06-23 · Paste verbatim into Knight (Cursor IDE)

---

## §3 BINDING

use segs · Sonnet 4.6 · BP093 · Knight Yoke

This is a Knight overnight automation dispatch. Do not paraphrase, collapse, or reorder sections. Execute sequentially. The 3 baselines must run one-at-a-time (sequential, not parallel) to avoid VRAM contention on M0's llama3.3:70b.

---

## §17 BLOOD · GADGET-FIRST DISCOVERY

Before writing any new script, Knight SHALL read the following existing infrastructure files to understand invocation patterns, dataset paths, and CLI flags already in use:

1. READ: `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs` — understand parseArgs(), loadDomainQuestions(), buildPrompt(), selectQuestionsSpreadAcrossDomains(), DATASET_BASE, DOMAINS, and the LETTERS extraction pattern.
2. READ: `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c_THUNDERCLAP_V061.ps1` — understand the PowerShell launch harness, secrets injection pattern, and TEE log pattern.
3. READ: `C:\Users\Administrator\.claude\state\secrets\22May2026.env` (value is sensitive — NEVER echo to console, NEVER write to any receipt file). Confirm the following keys are present:
   - `ANTHROPIC_API_KEY` — for Baseline 1 (off-substrate Anthropic Sonnet endpoint)
   - `OPENAI_API_KEY` (CAI22May2026 labeled key, line 3 in file) — for Baseline 1 alternate if Anthropic call fails
   - Ollama runs locally on M0 at http://localhost:11434 — no API key needed for Baseline 2

Do NOT proceed to script composition until discovery is complete.

---

## TASK OVERVIEW

Compose and run 3 new PowerShell baseline scripts sequentially, then write a combined receipt markdown. These 3 baselines + the in-progress M13c 42Q THUNDERCLAP receipt = the 4-column empirical comparison table that backs every "Check My Math" claim in Substack #1, the Sanders/AOC/Warren PROOFS sections, and the 8 Big AI licensing letters.

**Dataset:** Same 14-domain MMLU-Pro set already used for M13c. Same 42-question spread. Same selectQuestionsSpreadAcrossDomains(42) deterministic selection from:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\lb-reproducibility-pack\datasets\mmlu_pro_per_domain\`

**Question set lock:** All 3 baselines MUST use the IDENTICAL 42 questions as M13c THUNDERCLAP, in the IDENTICAL order. Knight MUST seed or pre-select the 42 questions first, write them to a locked question cache JSON, then pass --question-bank to each baseline runner. This ensures apples-to-apples comparison. If validate-relay.mjs --question-bank flag supports loading from a JSON array, use it. If not, Knight writes a new thin standalone runner for baselines that loads from the same JSON cache.

**Locked question cache path:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\BASELINE_42Q_LOCKED_CACHE_BP093.json`

If the file already exists, do NOT regenerate — use it verbatim.

---

## BASELINE 1 · OFF-SUBSTRATE FLAGSHIP API

**What it measures:** What does a flagship cloud API (Anthropic claude-sonnet-4-5 or GPT-4o) produce on these 42 questions, directly, with no LB substrate involvement? Cost-class: paid API tokens. This is the "what enterprises currently pay for" benchmark.

**Target:** Anthropic Messages API · model `claude-sonnet-4-5` (NOT claude-sonnet-4-6 — use the published Sonnet 4.5 which is the commercial peer to our 4.6 harness; if 4-5 is unavailable use claude-sonnet-4-6 and log which model was used)

**Method:**
- For each of the 42 questions, POST directly to `https://api.anthropic.com/v1/messages`
- Use the SAME buildPrompt() format as validate-relay.mjs (letter-only instruction, options lettered A-J)
- Single inference per question, no retry, no ensemble, no substrate
- Capture: answer letter, correct/incorrect, input_tokens, output_tokens, wall_time_ms, model_used
- Rate-limit handling: 1.0s inter-request sleep between questions (Anthropic Tier 1 safe)
- If ANTHROPIC_API_KEY is absent or returns HTTP 401/429: log FAIL gracefully, write a partial receipt, continue to Baseline 2. Do NOT abort the overnight run.

**API key source:** Extract from `C:\Users\Administrator\.claude\state\secrets\22May2026.env` key `ANTHROPIC_API_KEY`. Inject via env var. NEVER echo value to console or write to receipt.

**Script to compose:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\BASELINE_1_OFFSUBSTRATE_API_BP093.mjs`

**Log path:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\baseline_1_run_<TIMESTAMP>.log`

**Est. wall-clock:** ~8-15 min (42 questions × ~5-10s API RTT + 1s sleep + extraction)

**Receipt section output:** See RECEIPT SCHEMA below.

---

## BASELINE 2 · FLAGSHIP-ALONE LOCAL (SINGLE BIG MODEL, NO POSSE)

**What it measures:** What does a single local large model (llama3.3:70b on M0) produce, with ZERO cooperative substrate — no posse, no round-up, no ABSTAIN, no Plow, no multi-peer mesh? Cost-class: $0 API, local electricity only. This is "what a well-resourced individual with a big GPU gets, alone."

**Target:** Ollama local endpoint `http://localhost:11434` · model `llama3.3:70b`

**Method:**
- For each of the 42 questions, POST to `http://localhost:11434/api/generate`
- Body: `{ "model": "llama3.3:70b", "prompt": "<buildPrompt(q)>", "stream": false, "options": { "temperature": 0 } }`
- Single inference per question, no retry, no ensemble, NO relay_routes insertion
- Capture: answer letter (same extractLetter() logic), correct/incorrect, eval_count (tokens), wall_time_ms
- Timeout per question: 300s (llama3.3:70b on M0 GPU is fast; 300s is generous safety margin)
- If Ollama returns 503 (model not loaded): attempt `ollama pull llama3.3:70b` equivalent via API keep_alive ping, wait 60s, retry once. If still fails: FAIL gracefully, write partial receipt, continue to Baseline 3.
- Cost-class tag: `LOCAL_FREE`

**No Supabase involvement.** This baseline must NOT write to relay_routes, relay_route_replies, or any LB table.

**Script to compose:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\BASELINE_2_FLAGSHIP_LOCAL_SOLO_BP093.mjs`

**Log path:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\baseline_2_run_<TIMESTAMP>.log`

**Est. wall-clock:** ~30-60 min (42 questions × 30-90s local inference on llama3.3:70b depending on question complexity)

---

## BASELINE 3 · SINGLE COOPERATIVE PEER (PRIMITIVES DISABLED)

**What it measures:** What does a single peer in the 5-peer cooperative mesh produce when running ALONE with all cooperative primitives disabled? No posse decompose, no round-up, no ABSTAIN cascade, no Andon escalation, no tier-aware routing, no Plow. Just one peer (M0 · cb4ef450 · llama3.3:70b) answering questions through the relay infrastructure but without any cooperative overlay. Quantifies the delta the cooperative primitives add.

**Target:** M0 peer only (cb4ef450cc4a18c3) · via relay.lianabanyan.com · model llama3.3:70b (as configured on M0)

**Method:**
- Use validate-relay.mjs with heavily restricted flags:
  - `--questions=42`
  - `--mode=smoke`
  - `--routing=round-robin`
  - `--andon-escalate=none`
  - `--wire=json-legacy`
  - `--plow=none`
  - `--flagship-tier=ultra` (ensures M0 llama3.3:70b is used)
  - `--tier-config=ultra:cb4ef450cc4a18c3` (ONLY M0 in pool — no other peers)
  - `--exclude-peer=d0b47bd0` (exclude M3)
  - `--exclude-peer=88cbf6bd` (exclude M2)
  - `--exclude-peer=c532e740` (exclude M1)
  - `--exclude-peer=49f3e597` (exclude SON)
  - `--tier2-flagship=false` (disable Tier 2 flagship cascade)
  - `--andon-threshold=999` (disable Andon escalation by setting impossibly high threshold)
  - `--question-bank=C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\BASELINE_42Q_LOCKED_CACHE_BP093.json`
  - `--trial-id=BASELINE_3_SINGLE_COOP_PEER_BP093`
  - `--pass=A`
  - `--per-domain-timeout=C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\per_domain_timeout_config.json`

**IMPORTANT:** This IS the cooperative relay infrastructure — it writes to relay_routes. That is intentional: it proves the relay path works while isolating the single-peer ceiling. The receipt clearly labels this as single-cooperative-peer mode.

**Script to compose (PowerShell launcher):**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\BASELINE_3_SINGLE_COOP_PEER_BP093.ps1`

This is a thin PowerShell wrapper (model FIRE_M13c_THUNDERCLAP_V061.ps1 pattern) that:
1. Injects secrets from 22May2026.env
2. Calls `node validate-relay.mjs` with the flags above
3. TEEs output to log file
4. Reports exit code + ensemble score

**Log path:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\baseline_3_run_<TIMESTAMP>.log`

**Est. wall-clock:** ~90-150 min (same as THUNDERCLAP but single-peer ceiling; expect more ABSTAIN/timeout events)

---

## ORCHESTRATOR SCRIPT

Compose a master PowerShell orchestrator:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\RUN_ALL_BASELINES_BP093.ps1`

This script:
1. Displays pre-flight banner (BP093 · Bicycle Economics Baseline Suite · 3 baselines sequential)
2. Prompts Founder: "Press ENTER to start Baseline 1 → 2 → 3 (est. ~3-4 hours total). Ctrl-C to abort."
3. Runs Baseline 1 script (BASELINE_1_OFFSUBSTRATE_API_BP093.mjs via node)
4. On Baseline 1 complete: prints summary (score, cost, wall-clock), pauses 30s, then continues
5. Runs Baseline 2 script (BASELINE_2_FLAGSHIP_LOCAL_SOLO_BP093.mjs via node)
6. On Baseline 2 complete: prints summary, pauses 30s, then continues
7. Runs Baseline 3 script (BASELINE_3_SINGLE_COOP_PEER_BP093.ps1 via PowerShell)
8. On all 3 complete: calls RECEIPT WRITER (see below)
9. Final banner: "All 3 baselines complete. Receipt at BISHOP_DROPZONE. BATTERY PUBLISH HOLD until M13c THUNDERCLAP 42Q receipt lands."

Graceful failure: if any baseline fails (non-zero exit), log the failure, continue to next baseline. Do NOT abort the suite. Mark failed baseline as INCOMPLETE in receipt.

---

## RECEIPT SCHEMA

After all 3 baselines complete, Knight writes the combined receipt to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BICYCLE_ECONOMICS_BASELINE_RECEIPTS_BP093.md`

### Per-baseline per-question table (write one per baseline):

```
| Q# | Domain | Correct Answer | Model Answer | Correct? | Tokens (in+out) | Wall-time ms | Cost-class |
|----|--------|---------------|--------------|----------|-----------------|--------------|------------|
| 1  | math   | C             | C            | YES      | 450+12          | 4823         | PAID_API   |
...
| 42 | history| E             | D            | NO       | 389+8           | 3901         | PAID_API   |
```

Cost-class values: `PAID_API` (Baseline 1), `LOCAL_FREE` (Baseline 2), `LOCAL_FREE_RELAY` (Baseline 3)

### 4-column summary comparison table (placeholder for M13c THUNDERCLAP):

```markdown
## BICYCLE ECONOMICS · 4-COLUMN COMPARISON TABLE

| Metric                    | BL-1: Off-Substrate API | BL-2: Flagship Local Solo | BL-3: Single Coop Peer | M13c THUNDERCLAP (42Q) |
|---------------------------|------------------------|--------------------------|------------------------|------------------------|
| Model(s)                  | claude-sonnet-4-5      | llama3.3:70b solo        | llama3.3:70b via relay  | 5-peer tiered mesh     |
| Questions answered        | 42/42                  | 42/42                    | TBD/42                 | [PENDING]              |
| Correct answers           | TBD                    | TBD                      | TBD                    | [PENDING]              |
| Accuracy %                | TBD%                   | TBD%                     | TBD%                   | [PENDING — Target 65%+]|
| Total tokens consumed     | TBD                    | TBD (local)              | TBD (local)            | [PENDING]              |
| Est. API cost             | $TBD                   | $0.00                    | $0.00                  | $0.00                  |
| Wall-clock (min)          | TBD                    | TBD                      | TBD                    | [PENDING]              |
| Cooperative primitives    | NONE                   | NONE                     | NONE (disabled)        | FULL (Plow+Posse+ABSTAIN)|
| Peers involved            | 0 (cloud API)          | 1 (local only)           | 1 (relay, no mesh)     | 5 (mesh)               |
| Baseline class            | OFF-SUBSTRATE          | FLAGSHIP-SOLO            | SINGLE-COOP-PEER       | FULL COOPERATIVE       |
```

[M13c THUNDERCLAP column fills when Trial_02 42Q receipt lands in BISHOP_DROPZONE]

### Cost computation for Baseline 1:
- Anthropic claude-sonnet-4-5 pricing: $3.00 per 1M input tokens, $15.00 per 1M output tokens (as of 2026-06-23)
- Knight: compute actual cost from token counts. If model used was claude-sonnet-4-6, use same pricing and note model substitution.
- Total cost: sum across all 42 questions. Round to nearest cent. Include in receipt.

### Receipt header (required fields):
```
# BICYCLE ECONOMICS BASELINE RECEIPTS · BP093
## Run date: <ISO timestamp>
## Composed by: Knight (Cursor IDE) · Dispatched by Bishop · BP093
## Question cache: BASELINE_42Q_LOCKED_CACHE_BP093.json (sha256: <hash of cache file>)
## M13c THUNDERCLAP reference: Trial_02_PREVIEW_42Q · PENDING receipt
## BATTERY PUBLISH HOLD: YES — do not cite specific % numbers in any public-facing copy until this receipt + M13c THUNDERCLAP receipt both land in BISHOP_DROPZONE and Founder confirms.
```

---

## QUESTION CACHE GENERATION (Knight Task 0 — do this FIRST)

Before composing any baseline runner, Knight:

1. Opens `validate-relay.mjs` and copies the `selectQuestionsSpreadAcrossDomains(42)` logic verbatim.
2. Runs it once (Node.js script) against the actual dataset at `C:\Users\Administrator\Documents\LianaBanyanPlatform\lb-reproducibility-pack\datasets\mmlu_pro_per_domain\` to produce the canonical 42-question array.
3. Writes the result to `BASELINE_42Q_LOCKED_CACHE_BP093.json` — this is the single source of truth for all 3 baselines.
4. Computes sha256 of the file and prints it to console (for receipt header). Does NOT embed sha256 inside the file itself.
5. Reads the file back and confirms it has exactly 42 entries, each with: question, options[], correct_answer, domain, source_id.

Script to compose for this step:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\GEN_BASELINE_42Q_CACHE_BP093.mjs`

Run it first, verify 42 questions, then proceed to baselines.

---

## SEQUENCING SUMMARY

```
Knight execution order tonight:

1. READ validate-relay.mjs, FIRE_M13c_THUNDERCLAP_V061.ps1 (§17 discovery)
2. COMPOSE GEN_BASELINE_42Q_CACHE_BP093.mjs
3. RUN GEN_BASELINE_42Q_CACHE_BP093.mjs → produces BASELINE_42Q_LOCKED_CACHE_BP093.json
4. CONFIRM 42 questions, log sha256
5. COMPOSE BASELINE_1_OFFSUBSTRATE_API_BP093.mjs
6. COMPOSE BASELINE_2_FLAGSHIP_LOCAL_SOLO_BP093.mjs
7. COMPOSE BASELINE_3_SINGLE_COOP_PEER_BP093.ps1
8. COMPOSE RUN_ALL_BASELINES_BP093.ps1 (orchestrator)
9. RUN RUN_ALL_BASELINES_BP093.ps1 → runs all 3 baselines sequentially
10. COMPOSE + WRITE BICYCLE_ECONOMICS_BASELINE_RECEIPTS_BP093.md
11. Report completion to Founder with absolute path to receipt
```

Est. total overnight wall-clock: 3-5 hours (Baseline 1 ~15min + Baseline 2 ~45min + Baseline 3 ~150min + buffer).

---

## BISHOP VERIFICATION SQL (for Bishop use after Knight reports done)

After Knight confirms receipt written, Bishop will run the following psql gadget to independently verify the relay-routed data from Baseline 3 (the only baseline that touches Supabase):

```sql
-- BISHOP GADGET · Baseline 3 verification · BP093
-- Run via psql with SUPABASE_DB_URL from 22May2026.env

-- 1. Count relay_routes rows from Baseline 3 session
SELECT
  COUNT(*) AS total_routes,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
  COUNT(CASE WHEN status = 'timeout' THEN 1 END) AS timed_out,
  COUNT(CASE WHEN status = 'error' THEN 1 END) AS errors,
  MIN(created_at) AS run_start,
  MAX(created_at) AS run_end,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 AS duration_min
FROM relay_routes
WHERE trial_id = 'BASELINE_3_SINGLE_COOP_PEER_BP093';

-- 2. Per-domain accuracy (Baseline 3)
SELECT
  rr.domain,
  COUNT(rrr.id) AS replies,
  COUNT(CASE WHEN rrr.is_correct THEN 1 END) AS correct,
  ROUND(
    100.0 * COUNT(CASE WHEN rrr.is_correct THEN 1 END) / NULLIF(COUNT(rrr.id), 0),
    1
  ) AS accuracy_pct
FROM relay_routes rr
LEFT JOIN relay_route_replies rrr ON rrr.route_id = rr.id
WHERE rr.trial_id = 'BASELINE_3_SINGLE_COOP_PEER_BP093'
GROUP BY rr.domain
ORDER BY accuracy_pct DESC;

-- 3. Single-peer ensemble accuracy (Baseline 3 — only 1 peer so ensemble = that peer's answer)
SELECT
  COUNT(*) AS questions_answered,
  COUNT(CASE WHEN ensemble_correct THEN 1 END) AS ensemble_correct,
  ROUND(
    100.0 * COUNT(CASE WHEN ensemble_correct THEN 1 END) / NULLIF(COUNT(*), 0),
    1
  ) AS ensemble_accuracy_pct
FROM relay_routes
WHERE trial_id = 'BASELINE_3_SINGLE_COOP_PEER_BP093'
  AND ensemble_answer IS NOT NULL;

-- 4. Summary stats for 4-column table (Baseline 3 row)
SELECT
  'BASELINE_3_SINGLE_COOP_PEER' AS baseline,
  COUNT(DISTINCT rr.id) AS questions,
  COUNT(CASE WHEN rr.ensemble_correct THEN 1 END) AS correct,
  ROUND(
    100.0 * COUNT(CASE WHEN rr.ensemble_correct THEN 1 END) / NULLIF(COUNT(DISTINCT rr.id), 0),
    1
  ) AS accuracy_pct,
  ROUND(AVG(rrr.processing_ms) / 1000.0, 1) AS avg_latency_s,
  0.00 AS api_cost_usd
FROM relay_routes rr
LEFT JOIN relay_route_replies rrr ON rrr.route_id = rr.id
WHERE rr.trial_id = 'BASELINE_3_SINGLE_COOP_PEER_BP093';
```

Note: Baseline 1 and Baseline 2 do not write to Supabase. Their receipts come from the markdown file alone. Bishop reads the markdown receipt directly via Read tool — no SQL needed for those two.

---

## HARD CONSTRAINTS (Knight must not violate)

1. SEQUENTIAL — never run 2 baselines in parallel. VRAM contention on M0 will corrupt results.
2. SAME 42 QUESTIONS — all 3 baselines use BASELINE_42Q_LOCKED_CACHE_BP093.json. No divergence.
3. SECRETS NEVER ECHOED — ANTHROPIC_API_KEY and OPENAI_API_KEY values must NEVER appear in logs, console, or receipt files. Log key presence (length) at most.
4. GRACEFUL FAILURE — if any baseline fails (API 401, Ollama down, timeout), log INCOMPLETE, continue to next. Do not abort the suite.
5. NO BATTERY PUBLISH — receipt closes with "BATTERY PUBLISH HOLD — do not cite specific baseline % numbers in any public-facing copy until Founder confirms."
6. POSTGRES ONLY — Baseline 3 SQL writes (relay_routes) are already Postgres. Do not introduce any SQLite primitives.
7. RECEIPT PATH — write to `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BICYCLE_ECONOMICS_BASELINE_RECEIPTS_BP093.md`. Confirm written with absolute path in completion report.

---

## COMPLETION REPORT (Knight sends to Bishop)

When all 3 baselines + receipt are written, Knight sends a completion report to Bishop containing:

```
BP093 BASELINE SUITE COMPLETE

Baseline 1 (Off-Substrate API): TBD/42 = TBD% · $TBD · TBD min · [COMPLETE|INCOMPLETE]
Baseline 2 (Flagship Local Solo): TBD/42 = TBD% · $0.00 · TBD min · [COMPLETE|INCOMPLETE]
Baseline 3 (Single Coop Peer): TBD/42 = TBD% · $0.00 · TBD min · [COMPLETE|INCOMPLETE]

Question cache sha256: <value>
Receipt path: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BICYCLE_ECONOMICS_BASELINE_RECEIPTS_BP093.md
Log files:
  - baseline_1_run_<TIMESTAMP>.log
  - baseline_2_run_<TIMESTAMP>.log
  - baseline_3_run_<TIMESTAMP>.log

BATTERY PUBLISH HOLD ACTIVE — awaiting M13c THUNDERCLAP 42Q receipt + Founder confirm.
```

---

*End of Knight Yoke Paste · BP093 · Bishop-composed 2026-06-23*
