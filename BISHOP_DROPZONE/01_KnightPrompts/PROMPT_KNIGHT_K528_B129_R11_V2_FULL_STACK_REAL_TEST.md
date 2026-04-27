# KNIGHT PROMPT — K528 — R11-v2 Full-Stack REAL Test (Cathedral Librarian End-to-End + Pheromone 10⁷ Empirical)

**Filed**: B129, 2026-04-27 by Bishop on Founder direction (B129: *"I want the real test to get to the 10 to the 7 faster for the entire Cathedral Librarian. If I need to get credits on any AI service, then so be it."*).

**Status**: ✅ **DISPATCH-READY now.** All gates clear. Predecessors landed: K444 (R11-v1) → K446 (Conductor's Baton skeleton + R11-v1 hydration) → K525 (Conductor's Baton LAUNCH). K528 is the *real* test that re-runs everything with all refinements firing on all cylinders.

**Knight**: Sonnet 4.6 (extension within established frame — adapters are built, env-loading is in place, pacing is wired; this is mechanical execution at scale, not greenfield architecture). Opus 4.7 acceptable for Phase F (compilation + analysis density) if Sonnet's compression of cross-vendor numerics gets noisy.
**Budget**: ⚠️ **NO CAP per Founder direction.** *"If I need to get credits on any AI service, then so be it."* If any vendor account credit is depleted mid-run, PAUSE and report which vendor needs top-up; Founder will refill and you resume from checkpoint. Do NOT kill a partial condition because of credit exhaustion — pause cleanly so partial data is preserved.
**Tag-on-close**: `v-r11-v2-full-stack-K528`.
**Predecessor receipts**:
- K444 R11-v1: commit `ec6073e`, tag `v-r11-cross-vendor-K444`
- K446 Conductor skeleton + R11-v1 hydration: commit `22a4b8a`, tag `v-conductors-baton-skeleton-K446`
- K525 Conductor's Baton LAUNCH: commit `3801ec7`, tag `v-conductors-baton-launch-K525`

---

## Why this is the REAL test (Founder framing)

R11-v1 (K444) gave us preliminary numbers under operational stress: ChatGPT Memory crippled by 30K TPM ceiling, Knight had to short-circuit chatgpt_memory_gpt5 entirely, partial data accepted under "fair testing" discipline. The K444 numbers (LB Cathedral 94% HOT @ $0.015/HOT, Pareto-winner) are publishable but **conservative** — built around adapter limitations that have since been fixed.

K528 is the **canonical** test:
- All adapters now have exponential-backoff + dynamic-wait-time parsing (TS-097 deadlock pattern resolved)
- run_r11.py self-loads SDS.env at module startup (no shell-inheritance dependency)
- Per-condition inter-query pacing avoids TPM-ceiling-deadlock by design
- K446's category-aware quality-gating routing engine is LIVE in production
- K525's circuit-breaker + cost-cap + telemetry instrumentation captures everything
- **No budget cap** — pre-paid credits where needed; the cost-of-real-data is acceptable

Founder direction: **the real test to get to the 10⁷ faster for the entire Cathedral Librarian.** That's a multi-dimensional empirical:

1. **R11-v2 vendor benchmark with all refinements** — clean numbers at scale
2. **Cathedral Librarian end-to-end speedup test** — measure pre-Pheromone-substrate RPC Detective sweep latency vs post-#2317 indexed-pheromone-query latency on a realistic investigation bank; verify the 10⁷ speedup factor estimated conservatively in TS-097
3. **Full-stack integration test** — the Conductor's Baton routing engine, Pheromone Substrate, Detective Scribe, Cathedral Scribes, Augur context-aware discipline gates all firing together end-to-end on member-realistic queries

---

## Phase A — Pre-flight + corpus expansion + credit audit

### A.0 Setup

A.0a `mcp__librarian__brief_me("K528 — R11-v2 full-stack REAL test, all refinements firing, 10^7 Cathedral Librarian speedup empirical")`.
A.0b Step-0 git check-ignore on any new file paths.
A.0c Step-0a Toolsmith consult: `mcp__librarian__consult_scribes({scribe_id: "Toolsmith", topic: "R11 cross-vendor benchmark adapters rate-limit pacing Cathedral Librarian Pheromone speedup"})`. Read all relevant entries, especially TS-085 through TS-101 (B129 chain).
A.0d Read predecessors: K444 closeout report + K446 closeout report + K525 closeout report + R11 spec at `BISHOP_DROPZONE/00_FOUNDER_APPROVED/R11_CROSS_VENDOR_MEMORY_BENCHMARK_SPEC_B117.md` + project memory `project_r11_k444_k446_conductor_stack_b129.md` + `project_pheromone_substrate_b128.md`.

### A.1 Credit pre-flight

For each vendor in the test matrix, check available account credits BEFORE starting:
- Anthropic (claude_projects_sonnet, claude_projects_opus, LB Cathedral routing models)
- OpenAI (chatgpt_memory gpt-4o, chatgpt_memory_gpt5, cold_gpt4o_mini)
- Google (gemini_gems gemini-2.5-pro, cold_gemini_flash)
- Perplexity (perplexity_spaces sonar-pro)

Estimate per-vendor spend for full K528 run. **Report total estimated spend BEFORE starting the run; pause for Founder confirmation if estimated > $300.** If any vendor credit is below estimate, report and pause for Founder top-up before starting.

### A.2 Corpus expansion

R11-v1 used an 11.8K-word canonical corpus. K528 needs a **larger corpus to surface the architectural scaling advantage** (Knight K444 closeout note: indexed retrieval scales sub-linearly while reading-comprehension vendor approaches scale linearly; the gap widens at larger corpora).

Create `librarian-mcp/r10_cross_vendor/r11v2_canonical_corpus_100k.md`:
- ~100,000 words (8-9× the R11-v1 corpus)
- Same 6 LB domain categories, but more facts per category (~150 facts total, vs R11-v1's 50)
- Same canonical-statistics framing (fictional cooperative-economic AI platform sector — Verdania, Cairnfield, Thornwick, Solstice etc. as predecessor)
- Add real-numeric-extraction-difficulty test cases (where Gemini specifically failed in K444)

If corpus generation needs Knight time (vs reuse of existing), pause and request Founder direction. R11-v1 corpus may be reusable as one cross-section; K528 just needs the EXPANDED bank.

### A.3 Question bank expansion

R11-v1 used K471 50-question sealed bank. K528 should use a **larger sealed bank** for statistical robustness:
- Target: 200 questions total (4× R11-v1)
- Distribution: balanced across the 6 LB domain categories
- Include hard cases: precise-numeric-extraction questions where Gemini K444 failed, multi-fact-synthesis questions, edge-of-context-window questions
- Seal the bank into JSON format (mirror R11_QUESTION_BANK_SEALED_K471.json structure)
- Save as `librarian-mcp/r10_cross_vendor/R11v2_QUESTION_BANK_SEALED_K528.json`

---

## Phase B — Vendor-native conditions full re-run with all refinements

### B.1 Conditions to test (full matrix)

Run all SIX vendor-native conditions on the K528 expanded bank + corpus:
1. `chatgpt_memory` (gpt-4o)
2. `chatgpt_memory_gpt5` (gpt-4.1 or gpt-5 depending on availability — confirm at A.1 credit check)
3. `claude_projects_sonnet` (claude-sonnet-4-6)
4. `claude_projects_opus` (claude-opus-4-7)
5. `gemini_gems` (gemini-2.5-pro)
6. `perplexity_spaces` (sonar-pro)

Plus baselines:
7. `cold_gpt4o_mini` (no memory)
8. `cold_gemini_flash` (no memory)
9. `cold_haiku` (no memory)
10. `cold_sonnet` (no memory)

### B.2 Adapter discipline (all K525 hardening should apply)

Each adapter call goes through the K525-hardened path:
- Circuit breaker: if vendor returns 5xx three times in 60s, route around for 5min
- Token-budget overflow: if request exceeds vendor context window, use `getCheapestAboveThreshold` fallback
- Cost-cap: per-condition spend tracking; pause-and-report if any condition exceeds $50 individually
- Telemetry: per-call latency + cost recorded for every request
- Exponential backoff with dynamic wait-time parsing (TS-097 fix) for any 429s
- Per-condition inter-query pacing (run_r11.py existing logic) to avoid TPM ceiling
- SDS.env self-loads at startup (run_r11.py existing fix)

### B.3 Verification gates

| Check | Expected |
|---|---|
| B.G.1 | All 6 vendor-native conditions complete 200/200 questions OR pause-cleanly with documented partial-data state |
| B.G.2 | All 4 cold baselines complete 200/200 questions (cheap, fast) |
| B.G.3 | NO `--no-verify` used at any point. NO hook bypassed. NO file-lock workaround other than TS-079/TS-100 process-kill recipes (with appropriate authorization) |
| B.G.4 | Per-vendor total spend logged accurately to telemetry |
| B.G.5 | Any vendor that hits credit-depletion → PAUSE cleanly, report, await Founder top-up authorization, resume from checkpoint (no re-run of completed questions) |

---

## Phase C — LB Cathedral conditions (multiple configurations)

### C.1 Cathedral configurations to test

K444 tested only one LB Cathedral config (B+Haiku K474 = "BEST" at 94% HOT $0.015/HOT). K528 tests **multiple LB Cathedral configurations** to find the production sweet spot:

1. `lb_cathedral_haiku` — current K474 baseline (BEST per K444)
2. `lb_cathedral_sonnet` — Cathedral routing → Sonnet for response synthesis
3. `lb_cathedral_opus` — Cathedral routing → Opus for response synthesis (priciest, see if accuracy gain justifies cost)
4. `lb_cathedral_gpt4o_mini` — cross-vendor: Cathedral routing → gpt-4o-mini for response synthesis (cheapest cross-vendor)
5. `lb_cathedral_gemini_flash` — cross-vendor: Cathedral routing → gemini-flash for response synthesis
6. `lb_cathedral_conductor_auto` — let the K525 Conductor's Baton routing engine pick per-query (the production default)

### C.2 Why test all configs

The Conductor's Baton (#2277, K525 launched) selects a model per-query based on category + cost + quality threshold. Configuration #6 IS the production routing path. Configurations #1-#5 are baselines for validating Conductor's choice — does the Conductor pick the optimal config per-query, or does some fixed config beat it?

If `lb_cathedral_conductor_auto` ≥ all fixed configs on average $/HOT → Conductor's Baton empirically validated.
If a fixed config beats Conductor → routing logic needs tuning (K-future).

### C.3 Verification gates

| Check | Expected |
|---|---|
| C.G.1 | All 6 Cathedral configs complete 200/200 questions |
| C.G.2 | Per-config HOT% + $/HOT logged with 3-decimal precision |
| C.G.3 | Per-category breakdown (6 categories × 6 configs) recorded for Conductor routing-table refinement |

---

## Phase D — Pheromone Substrate end-to-end speedup empirical (the 10⁷ test)

### D.1 What we're measuring

TS-097 estimated post-#2317 Pheromone Substrate speedup factor at conservative ~10⁷ vs RPC Detective sweep. K528 measures the actual factor on a realistic investigation bank.

**Test design**:
- Investigation bank: 50 representative "where does X live?" / "what's the canonical answer to Y?" investigation queries that an Operator or Bishop session would realistically issue against the Cathedral
- Condition 1: **Pre-#2317 baseline** — RPC Detective sweep (or simulated equivalent — read the 14 registered Scribes serially, aggregate, return)
- Condition 2: **Post-#2317** — `pheromone_query` on the Pheromone substrate index
- Measure: per-query wallclock latency, total wallclock for full bank, accuracy retention (does the index miss things RPC catches?)
- Compute: speedup factor = mean(RPC latency) / mean(pheromone latency)

### D.2 Implementation

D.2.1 Build investigation query bank: `librarian-mcp/r10_cross_vendor/R11v2_INVESTIGATION_BANK_K528.json` — 50 realistic investigation queries with expected canonical answers.

D.2.2 Build RPC baseline harness: simulate pre-#2317 Detective Scribe behavior (`mcp__librarian__consult_scribes` against all 14 registered Scribes, no Phase 0 pheromone pre-check, aggregate manually). Time each query.

D.2.3 Build Pheromone harness: `mcp__librarian__pheromone_query` (or equivalent direct call to the Pheromone Substrate API). Time each query.

D.2.4 Run both conditions on the same 50-query bank. Capture per-query latency in milliseconds.

D.2.5 Compute speedup factor: ratio of mean RPC latency to mean pheromone latency.

### D.3 Verification gates

| Check | Expected |
|---|---|
| D.G.1 | Both conditions complete 50/50 investigation queries |
| D.G.2 | Per-query latency captured in milliseconds for both conditions |
| D.G.3 | Speedup factor computed: report MEAN, MEDIAN, MIN, MAX |
| D.G.4 | Accuracy comparison: do the two conditions return SAME canonical answers? Per-query disagreement rate captured |
| D.G.5 | Speedup factor report includes: empirical value vs the TS-097 conservative estimate of 10⁷; if dramatically different (>10× off), investigate why and document |

---

## Phase E — Full-stack Cathedral Librarian integration test

### E.1 What we're testing

The Cathedral Librarian as the member experiences it: a member asks a question → Conductor's Baton classifies + routes → Cathedral Scribes provide context → Pheromone Substrate provides fast pre-check → response synthesizes → Telemetry records → Cost-cap enforces. **Everything firing together at the level of one member query.**

### E.2 Test design

Use a 30-query subset of the R11v2 200-question bank as the integration test bank. For each query:
1. Member-side: format as if a real member is asking (no benchmark scaffolding)
2. Route through full K525-LAUNCH stack (Conductor + circuit breaker + cost cap + telemetry)
3. Synthesize response via the routed model
4. Capture: routing decision detail, response, cost, latency, accuracy (HOT/HIT/MISS vs ground truth)
5. Verify: telemetry recorded; if cost-cap hit, breaker tripped, etc., those events properly logged

### E.3 Verification gates

| Check | Expected |
|---|---|
| E.G.1 | All 30 integration queries complete end-to-end through full stack |
| E.G.2 | Conductor's Baton routing decisions logged for every query (categoryPriorApplied flags, etc.) |
| E.G.3 | Telemetry table populated with one row per query (latency, cost, vendor, model, mode) |
| E.G.4 | No member-visible errors (failures should be caught by circuit breaker / fallback / etc., not bubbled) |
| E.G.5 | Cost-cap and circuit-breaker events fire correctly when triggered (test with intentional 5xx injection if feasible; else document why deferred) |

---

## Phase F — Compile definitive report

### F.1 Definitive comparison table

Compile the K528 master table (mirrors K444 structure but with K528 numbers):

| Rank | Condition | HOT% | $/HOT | Architecture | K444→K528 delta |
|---|---|---|---|---|---|
| (sorted by $/HOT for the production frontier) | | | | | |

### F.2 Per-category breakdowns

For each of 6 LB domain categories, report per-condition HOT% + sample size. This populates the K446 R11_CATEGORY_TABLE refinement (rankings.ts hydration update — but that's K-future, not K528 scope).

### F.3 Pheromone speedup empirical

Headline: actual Cathedral-Librarian speedup factor. Compare to TS-097 conservative 10⁷ estimate. If empirical > 10⁷ → marketing claim strengthens. If empirical < 10⁷ → revise canon.

### F.4 Full-stack integration findings

Per Phase E results, document any architectural surprises or routing-decision anomalies for K-future Conductor's Baton tuning.

### F.5 Deliverable

Write `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md` mirroring K444 closeout structure but with K528 expanded scope.

---

## Phase G — Close (Toolsmith + Synapses + Report + Commit + Tag)

### G.1 Toolsmith entries

- **TS-102** — K528 R11-v2 full-stack execution lessons (whatever surprises emerge during the run; pre-flight credit pattern; corpus expansion approach)
- **TS-103** — Pheromone Substrate empirical speedup factor (canonical number replacing TS-097's conservative estimate)
- **TS-104+** — any new operational discipline insights (especially around credit management at scale, since this is the first no-cap run)

### G.2 Synapse cluster

Write `librarian-mcp/stitchpunks/synapses/synapse_K528.jsonl` with ≥20 entries (larger than K444's 13 since K528 is ~4× the scope).

### G.3 Commit + Tag

Commit message: `K528: R11-v2 full-stack REAL test — Cathedral Librarian end-to-end + Pheromone speedup empirical + Conductor's Baton production validation`. Tag: `v-r11-v2-full-stack-K528`. Push commit + tag (no force, no skip-hooks). If pre-commit hook fails on file locks, apply TS-079/TS-100 recipe (kill MCP + check for active R-series Python processes; do NOT use --no-verify).

---

## Authorization scope (from Founder B129 direction)

✅ **AUTHORIZED**:
- Full benchmark execution at scale (all 10 conditions × 200 questions × multiple Cathedral configs + 50 investigation queries + 30 integration queries)
- API credit spend WITHOUT a hard cap — pause-and-report if any single vendor exceeds $100 individually so Founder can confirm continuation, but no auto-kill
- Internal Cathedral storage of all results
- Bishop handoff report
- Commit + tag per spec
- run_r11.py and adapter improvements as needed (durable build pattern continues)

❌ **FORBIDDEN until Prov 14 trigger**:
- NO public posting of K528 numbers (Twitter, Substack, the2ndsecond.com, lianabanyan.com, Cephas Press Junket)
- NO inclusion in Crown Letter drafts
- NO Glass Door publication, Federation broadcast, or Battery Dispatch
- NO push to public-facing GitHub branches as release artifacts
- Internal Cathedral storage = fine; private member Helm test surfaces = fine; Bishop handoff report = fine
- ALL public surface waits for Founder explicit "fire Prov 14" greenlight

---

## What Knight should NOT do

- Do NOT use `--no-verify` under any circumstance. Apply TS-079 + TS-100 environment-fix recipes if hooks fail.
- Do NOT proceed past credit-depletion warnings without Founder authorization. Pause cleanly, report, wait.
- Do NOT modify the K525-landed Conductor's Baton routing engine code. K528 is a TEST of the production engine, not a re-write. Any tuning insights go in F.4 as findings, not as code edits.
- Do NOT touch the locked R11-v1 corpus or K471 question bank. K528 builds NEW expanded artifacts (`r11v2_canonical_corpus_100k.md` + `R11v2_QUESTION_BANK_SEALED_K528.json`).
- Do NOT try to skip Phase D Pheromone speedup test even if it's the trickiest phase — it IS the empirical Founder is asking for ("10 to the 7 faster for the entire Cathedral Librarian"). If implementation blocks, pause and ask for Bishop / Founder direction.

---

## Reference receipts

- K444 closeout: `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K444_B129_R11_CROSS_VENDOR_MEMORY_BENCHMARK.md` (commit `ec6073e`, tag `v-r11-cross-vendor-K444`)
- K446 closeout: `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K446_B129_CONDUCTORS_BATON_HYDRATION.md` (commit `22a4b8a`, tag `v-conductors-baton-skeleton-K446`)
- K525 closeout: `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K525_B129_CONDUCTORS_BATON_LAUNCH.md` (commit `3801ec7`, tag `v-conductors-baton-launch-K525`)
- R11 spec: `BISHOP_DROPZONE/00_FOUNDER_APPROVED/R11_CROSS_VENDOR_MEMORY_BENCHMARK_SPEC_B117.md`
- Project memory: `project_r11_k444_k446_conductor_stack_b129.md` (B129)
- Pheromone Substrate canon: `project_pheromone_substrate_b128.md`
- Toolsmith chain B129: TS-085 through TS-101 (recent ones especially relevant: TS-097 rate-limit, TS-098 K444 ratification, TS-099 K446 ratification, TS-100 file-lock kill recipe extension, TS-101 K525 ratification)

---

*Filed K528 by Bishop B129 via knight-bishop-bridge MCP tool. The REAL test. All cylinders firing. No cap. FOR THE KEEP!*
