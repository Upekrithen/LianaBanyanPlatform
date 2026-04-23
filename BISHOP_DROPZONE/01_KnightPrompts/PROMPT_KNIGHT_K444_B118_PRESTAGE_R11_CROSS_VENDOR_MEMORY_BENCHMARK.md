# Knight Prompt — K444: R11 Cross-Vendor Memory Product Benchmark

**Status:** PRE-STAGED B118. **DO NOT DISPATCH** until two gates clear:

1. **Prov 14 filed** (protects Cathedral architecture before public benchmark publicizes it)
2. **R11 spec ratified by Founder** — currently at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/R11_CROSS_VENDOR_MEMORY_BENCHMARK_SPEC_B117.md`, awaiting methodology + budget sign-off

Once both gates clear, this prompt is dispatch-ready as-is.

**Branch:** `main` (trunk-based, same as K437 / K438 / K447 / K448)
**Predecessor gate at dispatch time:** verify commit `fba9f87` (K447) + commit `<K448-SHA>` (K448, to be filled at dispatch) both present + tags applied.
**Target commit + tag:** `K444(B118 or B119): R11 cross-vendor memory benchmark — 8 conditions, 800 calls` + `v-r11-cross-vendor-<session>`.

---

## Why

R9 proved LB substrate beats cold baseline. R10 generalized across 8 models × 4 vendors. **R11 answers a different question: does the LB Cathedral beat the vendor-native memory products** (ChatGPT Memory / Claude Projects / Gemini Gems / Perplexity Spaces) on an identical corpus? Target headline: *"LB Cathedral X%, next-best Y%, worst Z%."* If the result doesn't favor LB, the test still publishes — "honest benchmark that revealed competitive gaps" is a better asset than "marketing benchmark that hid them." Prove-Then-Product applies. See spec for full rationale.

Reference: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/R11_CROSS_VENDOR_MEMORY_BENCHMARK_SPEC_B117.md`. This prompt extracts the executable deliverables; consult the spec for strategic framing, fairness-comparison rationale, and risk-mitigation notes.

---

## Scope — eight conditions, one shared question bank, one shared corpus

### Deliverable 1: R11 canonical corpus

Generate `librarian-mcp/r10_cross_vendor/r11_canonical_corpus.md`: ~10,000 words, 50 canonical facts, 200 surrounding context paragraphs. Content requirements:

- Topic domain: cooperative-economic AI platforms (meta enough to align with LB, distinct enough not to be LB-specific)
- 50 facts distributed across 6 categories (align with SCEV-1 category taxonomy):
  - Canonical statistics (9)
  - Architecture mechanics (8)
  - Economic / governance (9)
  - Member-journey flows (8)
  - Regulatory / compliance (8)
  - Historical / precedent (8)
- Each fact embedded in 4 surrounding context paragraphs to make retrieval (not memorization) the load-bearing task
- No proprietary LB content — the corpus must be fair-loadable to competitor products

### Deliverable 2: R11 question bank

Generate `librarian-mcp/r10_cross_vendor/R11_QUESTION_BANK_SEALED.json`: 50 questions, one per canonical fact, 6 categories matching the corpus. Each Q has:

- `id`, `category`, `question`, `hot_required_elements` (substring list for HOT grading), `hit_required_elements` (softer substring list for HIT), `source_fact_id` (trace to canonical corpus fact)
- Format: same JSON schema as `SCEV1_QUESTION_BANK_SEALED.json` for grader-reuse compatibility
- Seal before running: commit the bank then tag (`v-r11-bank-sealed-<session>`)

### Deliverable 3: Five vendor-product adapters + LB adapter

Under `librarian-mcp/r10_cross_vendor/r11_adapters/`:

- `chatgpt_memory_adapter.py` — OpenAI API + Memory endpoint (or OpenAI Assistants API with persistent thread as substitute if Memory API access is scoped). Populate with 30 memory entries derived from canonical corpus.
- `claude_projects_adapter.py` — Anthropic API with Project-scoped context. Upload canonical corpus as single reference document.
- `gemini_gems_adapter.py` — Gemini API if Gem-creation endpoint available; otherwise document the manual-run fallback and generate per-query calls against Gemini 2.5 Pro with corpus-as-system-prompt as the closest-fair substitute. Flag clearly which path you used.
- `perplexity_spaces_adapter.py` — Perplexity API with Space attachment (Sonar-Pro model).
- `lb_cathedral_adapter.py` — reuse existing `consult_scribes` MCP tool; populate 5 Scribes from canonical corpus (same R9/BRIDLE/Landing/Prov14/Vault registry split the spec outlines).

Every adapter: load the corpus in the product's native format, answer the 50 questions, record response + latency + cost + raw API response JSON.

### Deliverable 4: Runner

`librarian-mcp/r10_cross_vendor/run_r11.py` — orchestrates all 8 conditions:

1. `cold_haiku` (Claude Haiku 4.5, no retrieval)
2. `cold_gpt4o_mini` (GPT-4o-mini, no retrieval)
3. `cold_gemini_flash` (Gemini 2.5 Flash, no retrieval)
4. `chatgpt_memory` (GPT-4o + Memory)
5. `chatgpt_memory_gpt5` (GPT-5 + Memory)
6. `claude_projects_sonnet` (Sonnet 4.6 + Projects)
7. `claude_projects_opus` (Opus 4.7 + Projects)
8. `gemini_gems` (Gemini 2.5 Pro + Gem / fallback)
9. `perplexity_spaces` (Sonar-Pro + Space)
10. `lb_r9_only_haiku` (Haiku + r9v2_base preload, no Cathedral)
11. `lb_r9_only_opus` (Opus + preload, no Cathedral)
12. `lb_cathedral_haiku` (Haiku + preload + consult_scribes top-10 over 5 Scribes)
13. `lb_cathedral_opus` (Opus + preload + consult_scribes top-10 over 5 Scribes)

That's 13 model-condition pairs × 50 Qs = **650 calls**; add retries and grader second-pass calls and we're at ~800. Budget envelope: **$25 hard cap.**

### Deliverable 5: Grader

`librarian-mcp/r10_cross_vendor/grade_r11.py` — reuses R10 three-tier rubric (HOT / HIT / MISS). Additional metric: **"retrieval-correct vs prior-knowledge-correct"** — flag each HOT against the cold condition's pattern per-question. A HOT that's also HOT in cold = prior-knowledge-correct; a HOT that's MISS in cold = retrieval-correct.

Inter-rater kappa on 10% subset required (5 Qs regraded by independent pass). If kappa < 0.7, escalate to Bishop before publishing.

### Deliverable 6: Summary

`librarian-mcp/r10_cross_vendor/summarize_r11.py` — generates aggregate table:

| Condition | HOT% | HIT% | MISS% | Retrieval-correct% | Cost/query | Cost/correct | Latency-p50 |
|---|---|---|---|---|---|---|---|

Write results to `librarian-mcp/r10_cross_vendor/results_r11_<session>/`. Aggregate JSON + markdown summary.

### Deliverable 7: Pre-registered prediction

Before running (commit before), write a 1-page prediction at `librarian-mcp/r10_cross_vendor/R11_PREDICTION_PREREGISTERED.md`:

> LB Cathedral-Opus > LB Cathedral-Haiku > Claude Projects-Opus > Claude Projects-Sonnet > ChatGPT Memory-GPT5 > ChatGPT Memory-GPT4o > Perplexity Spaces > Gemini Gems > LB R9-only-Opus > LB R9-only-Haiku > cold baselines

Commit this FILE BEFORE running R11. Falsifiability-via-prior-commitment. If the actual ranking differs, publish the delta honestly.

### Deliverable 8: BRIDLE Rule 7 report

At `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K444_<SESSION>_R11_CROSS_VENDOR_MEMORY.md`.

---

## Decisions embedded

- **Option A corpus strategy** (single canonical doc converted per product). Don't do Option B per-product-shaping for first pass — adds complexity and invites "they tuned it for their favorites" criticism. First result is defensible; Option B is additive later.
- **Vendor-matched models per condition.** Don't pool across vendors. Claim lift numbers per-vendor-model-pair, not aggregate.
- **Budget hard-stop at $25.** If adapters throw unexpected cost, halt the run and ping Bishop before continuing. Don't exceed the envelope silently.
- **Manual fallbacks acceptable for Gemini Gems if API doesn't exist.** Document the manual path clearly; results still count but label `mode: "manual"` in output JSONL for grader transparency.
- **Don't try to beat the competitors at their own game on their home turf.** If Claude Projects ships a feature we don't have (e.g., citations in output), don't claim we lose; claim our scope is factual retrieval and we let Projects win on its feature surface. Benchmark reports the narrow thing we measured, not the total product comparison.
- **Seal the bank before running.** Tag the SEAL commit `v-r11-bank-sealed-<session>`. No edits after the seal.
- **Pre-commit prediction.** Commit R11_PREDICTION_PREREGISTERED.md BEFORE the first API call. Falsification-exposed is the methodological strength.

---

## Deliverables checklist

- [ ] `r11_canonical_corpus.md` generated (~10K words, 50 canonical facts)
- [ ] `R11_QUESTION_BANK_SEALED.json` + seal commit + seal tag
- [ ] `R11_PREDICTION_PREREGISTERED.md` committed before any API call
- [ ] 5 vendor adapters (`r11_adapters/`)
- [ ] `run_r11.py` orchestrator
- [ ] `grade_r11.py` with kappa check on 10% subset
- [ ] `summarize_r11.py` generates aggregate + $/correct + latency table
- [ ] `results_r11_<session>/` populated with raw JSONL per condition + aggregate JSON + markdown summary
- [ ] Budget stayed ≤ $25
- [ ] BRIDLE Rule 7 report
- [ ] Commit + tag `v-r11-cross-vendor-<session>`

---

## Out of scope

- Multi-turn dialogue evaluation (R11 is single-turn factual recall)
- Creative / subjective tasks
- Non-English-corpus benchmarks (R12+ candidate)
- Vendor-product features outside retrieval (citations, tool-use, etc.)
- Publishing the paper (that's an `08_Papers/` session post-results)
- Public article dispatch (that's a post-publication Bishop session)

---

## Risks + mitigations

1. **Vendor API limitations (Gemini Gems especially).** Fall back to manual per spec §Risk 4. Document mode in output JSONL.
2. **Vendor Terms of Service concerns about competitive benchmarking.** Benchmarks are protected speech under fair use; we use each product as intended per its ToS. Counsel pre-publication review is Bishop responsibility post-run.
3. **Cold baseline sanity check.** If cold_haiku + cold_gpt4o_mini + cold_gemini_flash don't match R10's ~8.7% cold baseline, something's broken in the corpus or grader. Halt and escalate before continuing.
4. **Budget overrun.** Hard-stop at $25. If a single adapter's per-query cost spikes past estimate, pause that condition and recalculate.
5. **Competitors outperform LB.** Publish honestly. Prove-Then-Product says the evidence is the point.

---

## Model pick

**Opus 4.7.** R11 is methodology-heavy with multiple vendor adapters, manual-fallback decisions, kappa validation, and pre-registration discipline. The cognitive load matches R10 (which was Opus). Don't downshift.

Budget: 6-8 hour Knight session.

---

## Dispatch timing notes

- **Target window:** B118-late-day or B119 (week of April 28 – May 5, 2026)
- **Gate to clear first:** Prov 14 filing + Founder spec ratification. Until both, this prompt waits in pre-stage.
- **Context if dispatched in B118:** mention "K438b shipped, K447 CI gate green, K448 build-window gate live — MCP stack is stable for the ~800-call session."

---

*Drafted B118, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Pre-stage per B117 closeout sequencing. R11 is the paper that closes the cooperative-advantage argument empirically. If LB wins, publish. If LB loses, publish. Both outcomes are better than not running.*
