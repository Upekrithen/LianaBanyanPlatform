# KNIGHT PROMPT — K511 — Local-LLM Cathedral Effect Empirical Test

**Filed**: B125 (2026-04-25)
**Assigned K#**: K511
**Gate**: ~~Dispatchable AFTER K508 lands~~ — **GATE CLEARED. K508 landed B118, commit 60de632, tag `v-comet-bridge-network-intercept-K508`.**
**Queue note (B125 update)**: K512 (LB Test Frame turnkey) likely runs FIRST. Hold K511 dispatch until Founder confirms: (1) hardware allocation (Founder rig or Pawn rig), (2) K511 vs K512 queue order. Pre-staging Phase B (harness fork, ~1-2 hr active, no inference) is fine in parallel with K512 if Knight has bandwidth — Phase C is autonomous wallclock and can background while K512 runs.
**Knight**: Sonnet 4.6 preferred (Opus if architectural surprise emerges). Founder-rig hardware required (Ollama on Pawn or Founder rig).
**Budget**: ~$0 cloud cost (local inference); ~6-10 hours Knight; ~12-24 hours wallclock for benchmark itself
**Tag-on-close**: `v-local-llm-cathedral-test-K511`

---

## The empirical question

The 7-layer defense ([project_vendor_lockout_resilience_layered_defense.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_vendor_lockout_resilience_layered_defense.md)) lists Layer 6 as *"Local-LLM fallback (Ollama / llama.cpp / etc.)"* — the deepest cloud-vendor-independent defense. It is currently **theoretical, not proven**. R13 K499 empirically proved the Cathedral Effect at +86.2pp mean lift across **4 cloud vendors**. We do not yet have an empirical replication on a local LLM.

**The question this Knight answers:** does the Cathedral Effect signature (+80pp class lift) replicate when the answer-construction layer is a local LLM (Ollama Llama 3.3 70B Q4 quant, or comparable) rather than a commercial cloud vendor?

If YES (lift in +80pp class): Layer 6 graduates from theoretical to empirically hardened. Public claim *"vendor-resilient by architecture, empirically across 5 model families including local"* becomes defensible. Keystone #42 (*"You keep what you make"*) gains its strongest empirical anchor — even cloud-LLM-free, members keep their work-product.

If NO (lift collapses below +50pp, or sealed-cold contamination property fails): we know the real defense floor. Public claims must be tempered. K-future work routes to investigating the specific local-LLM weakness (likely candidates: instruction-following on substrate-conditioning prompts; context-window saturation; quantization-induced retrieval-precision loss).

Either outcome is canon-worthy. **The honest empirical result is the deliverable**, not a particular conclusion.

---

## Inputs (what's already in place)

- **R13 K499 harness**: `librarian-mcp/r10_cross_vendor/run_r13_k499.py` (or successor) — the canonical cross-vendor benchmark runner, 50 sealed adversarial questions, cathedral + cold conditions, 8 models, $22.23 / $80 cap, 46 min wall on cloud vendors.
- **R13 results**: `librarian-mcp/r10_cross_vendor/results_R13_K499/` — full per-vendor table at +86.2pp mean lift.
- **R13 grading methodology**: Haiku 4.5 + Gemini 2.5 Flash dual LLM judges, κ inter-rater agreement reported, deterministic substring fallback. Inter-rater κ(Haiku, Gemini) = 0.928 in R13 — this is the "methodology gold" baseline.
- **R13 sealed bank**: 50 LB-canonical adversarial questions, 0% HOT cold across 8 cloud models (sealed-against-training property confirmed). Use the SAME bank for local-LLM test — direct comparability to R13.
- **Cathedral substrate**: current canonical substrate as of B125, ~4,400-token injection block (matches K499 harness expectation).
- **Founder hardware**: Founder rig has consumer GPU sufficient for Q4-quantized 70B local inference; Pawn rig may also work. Confirm with Founder before dispatch.

---

## Phase A — Local-LLM environment setup

**A.1** — Install Ollama on Founder rig (or Pawn rig — confirm with Founder):
```powershell
# Windows
winget install Ollama.Ollama
# OR direct download from ollama.com
```
Verify: `ollama --version` returns successfully.

**A.2** — Pull Llama 3.3 70B Q4 quant (the canonical local-LLM benchmark target — consumer-hardware-feasible, instruction-tuned, sufficient context window):
```bash
ollama pull llama3.3:70b-instruct-q4_K_M
```
Confirm pull completion. Disk usage: ~40GB. Confirm `ollama list` shows the model.

**A.3** — Smoke test with substrate-conditioning prompt:
```bash
ollama run llama3.3:70b-instruct-q4_K_M "What is the LB membership cost?"
```
Expected (cold, no substrate): vague generic answer or "I don't have that information." This is the COLD baseline; LB-canonical answer ($5/yr) should NOT appear, confirming sealed property.

**A.4** — Substrate-injection smoke test:
- Pipe in the cathedral substrate block + the question.
- Expected (hot, with substrate): correct LB-canonical answer ($5/yr, 83.3% creator-keeps, etc.).
- If this smoke test fails: investigate before running full bank — possible context-window saturation, instruction-following gap, or quantization issue.

**A.5** — Latency calibration:
- Run 5 sealed questions through Ollama (with substrate). Record: prompt-eval-time, generation-time, total wallclock.
- 50-question full bank wallclock estimate = (per-call time) × 50 × 2 (cold + cathedral conditions). Plan for 12-24 hours typical; budget accordingly.

**Phase A success**: Ollama is running, model is pulled, smoke tests confirm cold/hot distinction, latency is bounded.

---

## Phase B — R13 harness adaptation for local-LLM target

**B.1** — Fork the R13 harness:
- Copy `librarian-mcp/r10_cross_vendor/run_r13_k499.py` to `run_local_llm_k511.py`
- Strip cloud-vendor adapters; keep ONLY the harness scaffolding (sealed-bank loader, cathedral-substrate injector, cold-vs-cathedral runner, JSONL writer with question_id dedup, cost tracker).

**B.2** — Add Ollama adapter:
- Endpoint: `http://localhost:11434/api/generate` (default Ollama port)
- Request shape: `{"model": "llama3.3:70b-instruct-q4_K_M", "prompt": "...", "stream": false, "options": {"temperature": 0.0, "num_predict": 800}}`
- Response: `{"response": "...", "total_duration": ..., "eval_count": ..., "prompt_eval_count": ...}`
- **No request_id from Ollama** — use a generated UUID per call for dedup tracking. Mark `via_api=true, vendor="local_ollama"` in JSONL output.

**B.3** — Substrate-injection pattern:
- IDENTICAL to R13 cloud vendors: prepend cathedral substrate + system prompt + question. Do NOT modify the substrate or system-prompt language for local LLM; the empirical question is whether the same substrate-injection pattern works on local.

**B.4** — Cold-condition handling:
- Same 50-question sealed bank, cold condition strips the substrate. Expected output: 0% HOT (sealed property holds for Llama 3.3 — its training cutoff is well before LB-canonical-corpus existence).

**B.5** — Output format:
- JSONL output to `librarian-mcp/r10_cross_vendor/results_local_llm_k511/`
- Per-row fields: `question_id, vendor="local_ollama", model="llama3.3:70b-q4", condition="cold|cathedral", response, prompt_eval_count, eval_count, total_duration_ms, uuid, timestamp`
- Mirror R13 schema as closely as possible — direct comparability to R13 per-vendor table.

**Phase B success**: harness runs end-to-end on 5 questions × 2 conditions = 10 calls, JSONL written correctly, no harness errors.

---

## Phase C — Full sealed bank run

**C.1** — Run cold condition: 50 questions × cold (no substrate) → 50 calls. Expected: ~1-3% HOT (sealed property — Llama 3.3 cutoff 2024-12 or earlier, before LB-canonical-corpus existence).

**C.2** — Run cathedral condition: 50 questions × cathedral (with substrate) → 50 calls. Expected: TBD — this is the empirical question.

**C.3** — Lock-file discipline (Toolsmith TS-024 lesson):
- Implement single-process lock-file before run. Multiple Knight processes writing to same JSONL = duplicate entries, billing chaos. Ollama is local so cost isn't the issue; data correctness is.
- Lock file at `results_local_llm_k511/run.lock` with PID + heartbeat. Refuse to start if lock exists and PID is alive.

**C.4** — Backgrounded run:
- Long wallclock (12-24 hours). Run in background; Knight returns to process after run completes (or on next session). Monitor via heartbeat / progress file, not by polling.
- Save progress after every 5 calls in case of mid-run interruption.

**C.5** — Dedup post-run:
- Apply TS-024 dedup pattern: read JSONL, keep last entry per `question_id × condition` pair, rewrite. Confirm 50 unique cold + 50 unique cathedral.

**Phase C success**: 100 unique calls completed, JSONL clean, no duplicates, sealed property holds (cold ≤3% HOT), cathedral condition data ready for grading.

---

## Phase D — Grading + comparison to R13

**D.1** — Apply R13 grading methodology:
- Same dual LLM judge (Haiku 4.5 + Gemini 2.5 Flash) — these are CLOUD vendors used as JUDGES, not as answer-construction. Cloud vendor grading of local-LLM responses is fine and direct comparability with R13.
- Deterministic substring fallback for canonical-class queries.
- Compute κ(Haiku, Gemini) on local-LLM responses; expect κ ≈ 0.85-0.93 (R13 baseline 0.928).

**D.2** — Per-condition aggregate:
- Cold HOT%
- Cathedral HOT%
- Lift (Cathedral HOT% − Cold HOT%)

**D.3** — Compare to R13 per-vendor table:
- Add row: `local_ollama_llama3.3:70b-q4 | cold X% | cathedral Y% | lift Zpp | cost-per-HOT $0 (compute only)`
- Compare lift Z to R13's per-vendor lifts: Opus 4.7 +98pp, Sonar Pro +94pp, Haiku 4.5 +90pp, GPT-5.5 +88pp, Sonnet 4.6 +86pp, GPT-5.4-mini +82pp, Gemini Flash +80pp, Gemini Pro +74pp.
- **Hypothesis success**: local_ollama lift in [+74pp, +98pp] range (R13 cloud envelope) — Layer 6 hardened.
- **Hypothesis partial**: local_ollama lift in [+50pp, +73pp] — Layer 6 functional but degraded; investigate quantization/instruction-following.
- **Hypothesis failure**: local_ollama lift <+50pp — Layer 6 substantially weaker than cloud; public claim must reflect this.

**D.4** — Surprise check:
- Did cold contamination property hold? (Sealed bank: cold should be ≈0%.)
- Did substrate retrieval work as expected? (Spot-check 5 queries from each canonical/outreach/architecture intent class.)
- Any qualitative differences in response style, citation behavior, hallucination patterns? Note for Toolsmith.

**Phase D success**: full per-condition aggregate in hand; row added to R13 table; lift category determined; surprises noted.

---

## Phase E — Synapse + Toolsmith + report + commit + tag

**E.1** — Toolsmith entries (per [feedback_toolsmith_log_at_each_ratification.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_toolsmith_log_at_each_ratification.md) — required at ratification):
- Category `benchmark_infra` for Ollama harness adaptation lessons (substrate-injection compatibility, response-shape divergence, latency calibration)
- Category `local_llm` (new category) for any local-LLM-specific gotchas (quantization effects, instruction-following gaps, context-window behavior)
- Category `process` if any harness-discipline lessons (lock-file behavior under long wallclock, etc.)
- Cite ts_id in ratification line at Knight close.

**E.2** — Synapse emission ≥12 clusters per BRIDLE v10.5 requirement.

**E.3** — Knight report:
- File at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K511_B125_LOCAL_LLM_CATHEDRAL_TEST.md`
- Include: full per-condition table, comparison to R13, lift category determination (success/partial/failure), surprises, Toolsmith ts_id citations, deliverables checklist, commit hash, tag.

**E.4** — Update canonical artifacts:
- `librarian-mcp/r10_cross_vendor/results_local_llm_k511/` — full results dir
- `project_vendor_lockout_resilience_layered_defense.md` — update Layer 6 status from THEORETICAL to one of (HARDENED / PARTIALLY HARDENED / DEGRADED) based on result
- `VENDOR_SHUTDOWN_RUNBOOK_B125.md` — update the cross-vendor model-ID reference table with the local row populated empirically
- Update R13 master per-vendor table (`r10_cross_vendor/R13_PER_VENDOR_TABLE.md` or successor) with the local row appended

**E.5** — Commit + tag:
- Commit message references the empirical finding, not just "local LLM test ran." E.g., *"Local LLM Cathedral Effect: +Xpp lift on Llama 3.3 70B Q4 — Layer 6 [HARDENED|PARTIAL|DEGRADED]"*.
- Tag: `v-local-llm-cathedral-test-K511` (will be published in Knight report; Founder may rename for keystone alignment).

**E.6** — Founder review surfaces (if lift in success class):
- Update [project_the_cathedral_effect.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/project_the_cathedral_effect.md) — Cathedral Effect now empirically validated across 4 cloud vendors AND 1 local-LLM family
- Stage AAAI paper §6 update with local-LLM column
- Stage Pledge / op-ed / Crown letter language using keystone #42 (*"You keep what you make"*) with the new empirical anchor

---

## Constraints carried forward (BRIDLE v10.5 + Founder canon)

- **No AI impersonation** ([feedback_no_ai_impersonation_ever.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_no_ai_impersonation_ever.md)) — Ollama responses are real local-LLM outputs; do not synthesize or interpolate. If Ollama call fails, log error and skip the row, do not fabricate.
- **Don't extrapolate from live terminal** ([feedback_dont_extrapolate_from_live_terminal.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_dont_extrapolate_from_live_terminal.md)) — terminal substring HIT counts during run = naive substring; HOT% from canonical grader = empirical finding. Only report findings after full grading. During run, report operational observations only.
- **Step-0 git check-ignore** on all new files (BRIDLE v10.4 / TS-036 lesson).
- **Toolsmith write at session close** + cite ts_id at ratification (B125 discipline).
- **Synapse ≥ 12 clusters** per BRIDLE v10.2.
- **Bishop micro-task TS-037 lesson**: handoff design — if test integrity matters, structural file separation, not rhetorical boundary.

---

## Founder gating (per [feedback_no_timing_shortcuts_ever.md](C:/Users/Administrator/.claude/projects/C--Users-Administrator-Documents/memory/feedback_no_timing_shortcuts_ever.md))

This Knight is **gated**. Bishop does not propose dispatch timing. Founder triggers when:
- K508 (Comet Bridge network-intercept) is landed and verified
- Ollama hardware is allocated (Founder rig or Pawn rig confirmed available, no other process competing for GPU)
- Founder greenlight — *"Dispatch K511"*

Until then: prompt is staged, runbook ready, harness fork can be pre-staged by Bishop if useful, but no inference run begins without Founder go.

---

*Filed B125 by Bishop, gated post-K508. The empirical proof of Layer 6 — converting "we believe vendor-resilient" to "we have measured vendor-resilient." The deepest empirical anchor for keystone #42. Long haul. Always.*

— Bishop B125
