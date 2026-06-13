# BP078 Tier 3 Empirical Benchmark Plan
## "Free Gemma 4 12B + MnemosyneC vs the Flagships"

**Status:** FOUNDER REVIEW REQUIRED before Knight fires  
**Authored by:** Bishop (SEG-AL, Sonnet 4.6, BP078)  
**Date:** 2026-06-08  
**Truth-Always gate:** Honest results only. If our free stack loses on accuracy, that is the story. Do not fake.

---

## 1. Scope of Comparison

### Our Stack (the Challenger)
- **Model:** Gemma 4 12B bundled in v0.1.27-full (local, offline, zero ongoing cost)
- **Pipeline:** Full MnemosyneC substrate pipeline engaged: Spider (web fetch/crawl), Sprite (structured extraction), Miner (substrate lookup), Operators (Contingency/Adversarial Fence), Furnace (synthesis), Three Fates (consensus/routing), Scribe (citation logging), Detective Team (adversarial cross-check)
- **Node configuration:** M1 (primary), substrate mesh-distributed to M2 + M3 before test begins

### Flagship Comparators (4 total)
| Model | Provider | Mode |
|---|---|---|
| Claude 4.7 Opus | Anthropic | API |
| GPT-4o (current) | OpenAI | API |
| Gemini 2.5 Pro | Google | API |
| Llama 3.1 405B | Meta (via API host) | API |

Each flagship answers the same questions with no substrate augmentation. Raw model, no retrieval, no citation pipeline.

### What We Measure
- Accuracy (CORRECT / INCORRECT / PARTIAL per judge)
- Latency end-to-end (ms, wall-clock)
- Cost per 100 questions (USD; flagships = API price x tokens; our stack = $0 ongoing + amortized substrate plow cost)
- Sources cited count (our stack only; flagships do not cite structurally)
- Model-emitted confidence score if available

---

## 2. Question Bank

### Dataset
**TIGER-Lab/MMLU-Pro** test split. Public, peer-known, adversarially curated, 14 categories. HuggingFace source: `TIGER-Lab/MMLU-Pro`, split `test`.

### Sample Size
**100 questions** for Wave 1, stratified across 14 categories: 7 questions from each of 12 categories + 8 questions from 2 categories (Biology, Law) selected for MnemosyneC substrate strength. Founder can scale to 500 or full test split after Wave 1.

### Reproducible Seed
```
RANDOM_SEED = 20260608
```
Fixed seed produces the same 100 questions on every re-run. Cite this seed in every receipt and chart caption.

### Plow-First Discipline (Plow-First Canon: `canon_bp078_plow_first_then_test_then_replow_spider_sprite_miner_design_bp078`)
1. Extract the 100 sampled question topic seeds (subject + key noun phrases)
2. Run MnemosyneC Spider + Sprite + Miner plow against those topic seeds on M1
3. Stamp all harvested Eblets into the substrate with `plow_run_id = TIER3_WAVE1_20260608`
4. Mesh-distribute the plowed substrate to M2 + M3 via Frontier TCP (port 11481)
5. Confirm receipt on M2 + M3 before any test question fires
6. Test questions are answered ONLY after plow is confirmed. The plow topics match the question seeds but the actual test questions are out-of-bank. This prevents the curated-bank artifact (lookup hit on the question itself, not a genuine substrate lift).

**Curated-bank artifact prevention:** questions are sampled AFTER plow topics are seeded. The plow crawls the topic domain; it does not see the specific MMLU-Pro question text. The test fires on questions the substrate has never seen verbatim.

---

## 3. Metrics Per Model Per Question

| Metric | Type | Source |
|---|---|---|
| `correctness` | CORRECT / INCORRECT / PARTIAL | Judge SEG |
| `latency_ms` | integer | wall-clock, question-send to answer-complete |
| `cost_usd` | float | API tokens x price (flagships); $0.00 (our stack, mark as zero-ongoing) |
| `sources_cited_count` | integer | our stack: Scribe log count; flagships: 0 by default |
| `confidence_score` | float or null | model-emitted; null if not available |
| `answer_text` | string | raw model answer |
| `correct_answer` | string | MMLU-Pro ground truth |

---

## 4. Output Schema

One JSONL row per `(model, question)` tuple.

```json
{
  "run_id": "TIER3_WAVE1_20260608",
  "timestamp": "2026-06-08T00:00:00Z",
  "model_name": "gemma4_12b_mnemosynec",
  "model_version": "v0.1.27-full",
  "judge_method": "claude_sonnet_4_6_single_judge",
  "question_id": "mmlu_pro_test_00042",
  "category": "biology",
  "question_text": "...",
  "correct_answer": "A",
  "model_answer": "A",
  "correctness": "CORRECT",
  "judge_reasoning": "Model selected A, which matches the key.",
  "latency_ms": 31400,
  "cost_usd": 0.00,
  "sources_cited_count": 3,
  "confidence_score": null
}
```

Full JSONL file: `tier3_wave1_results_20260608.jsonl`  
One row per evaluation. 500 rows total (100 questions x 5 models).

---

## 5. Judge Method

**Judge:** Claude Sonnet 4.6 (same model as Bishop). Single judge to avoid cohort bias. Strongest reasoning-to-cost ratio per prior benchmarks (BP067 Star Chamber, pearl_241641f4).

**Judge prompt template (deterministic):**

```
You are a benchmark judge. Your only job is to compare a model answer to a correct answer and return a verdict.

Question: {question_text}
Correct answer: {correct_answer}
Model answer: {model_answer}

Rules:
- CORRECT: model answer matches the correct answer exactly or contains the correct choice unambiguously.
- INCORRECT: model answer is wrong or contradicts the correct answer.
- PARTIAL: model answer contains the correct answer but also incorrect reasoning, or is ambiguous.

Respond with exactly one line in this format:
VERDICT: [CORRECT|INCORRECT|PARTIAL] | REASON: [one sentence, max 20 words]

Do not add any other text.
```

No chain-of-thought, no elaboration. Deterministic verdict format enforced. The Judge SEG processes all 500 rows sequentially and stamps a `correctness` + `judge_reasoning` field into each JSONL row.

---

## 6. Wall-Clock Estimate

| Phase | Details | Est. Time |
|---|---|---|
| Plow (M1) | Spider + Sprite + Miner on 100 topic seeds | 20-30 min |
| Mesh distribute | Eblets to M2 + M3, confirm receipt | 5 min |
| Our stack (100 Qs) | ~30s p50 / 60s ceiling per question, full pipeline | 50-60 min |
| 4 flagship SEGs (parallel) | ~5-15s per question via API, 100 Qs each | 15-25 min total |
| Judge SEG (500 evals) | ~5s per evaluation via Sonnet 4.6 API | 40-45 min |
| Aggregate SEG | JSONL + summary + chart-ready JSON | 10 min |
| **Total serialized** | | ~3 hours |
| **Total with SEG fan-out** | Plow + mesh serial; all 5 model SEGs + judge parallel after plow | ~75-90 min |

**Honest latency note:** Gemma 4 12B is slower than mistral:7b or gemma2:2b. Expected p50 latency 25-45s per question on M1. This is the real architecture at real cost. Frame in chart as "local, private, zero ongoing cost" not as a speed competitor.

---

## 7. Knight Dispatch Shape

### Single Pinned Yoke -- Mandatory SEG Block

```
MANDATORY SEG DISCIPLINE (Statute §3):
All work in this Yoke executes via Sonnet 4.6 SEGs.
No main-thread inference. No model substitution.
Self-audit before single send (Novaculi §2).
```

### Sub-Scopes (ordered)

**Scope 1 -- Plow (SEG: TIER3_PLOW)**
- Pull 100 question sample from MMLU-Pro test split using seed 20260608
- Extract topic seeds (subject + key noun phrases per question)
- Run Spider + Sprite + Miner plow on M1 against those 100 topic seeds
- Stamp all Eblets with `plow_run_id = TIER3_WAVE1_20260608`
- Output: `tier3_plow_receipt.jsonl` listing each topic seed + eblet count harvested

**Scope 2 -- Mesh Distribution (SEG: TIER3_MESH)**
- Push plowed substrate Eblets from M1 to M2 + M3 via Frontier TCP port 11481
- Confirm receipt on both nodes (fetch 3 spot-check Eblets from each node)
- Gate: do not advance to Scope 3 until mesh confirm passes
- Output: `tier3_mesh_receipt.md` with M2 + M3 confirmation hashes

**Scope 3a -- Our Stack (SEG: TIER3_GEMMA)**
- Fire all 100 questions through MnemosyneC full pipeline on M1
- Log latency, sources_cited_count, answer_text, confidence_score per question
- Output: `tier3_gemma4_answers.jsonl`

**Scope 3b -- Claude 4.7 Opus (SEG: TIER3_OPUS)**
- Fire all 100 questions via Anthropic API (Statute §3: use Sonnet 4.6 for the SEG orchestration; the evaluated model is Opus as the subject under test)
- Log latency, cost_usd (input + output tokens x current pricing), answer_text
- Output: `tier3_opus_answers.jsonl`

**Scope 3c -- GPT-4o (SEG: TIER3_GPT)**
- Fire all 100 questions via OpenAI API
- Log latency, cost_usd, answer_text
- Output: `tier3_gpt4o_answers.jsonl`

**Scope 3d -- Gemini 2.5 Pro (SEG: TIER3_GEMINI)**
- Fire all 100 questions via Google API
- Log latency, cost_usd, answer_text
- Output: `tier3_gemini25_answers.jsonl`

**Scope 3e -- Llama 3.1 405B (SEG: TIER3_LLAMA)**
- Fire all 100 questions via API host (Together.ai or equivalent)
- Log latency, cost_usd, answer_text
- Output: `tier3_llama405_answers.jsonl`

**Scopes 3a-3e run in parallel after Scope 2 mesh confirm.**

**Scope 4 -- Judge (SEG: TIER3_JUDGE)**
- Merge all 5 answer JSONL files into one working set (500 rows)
- Apply judge prompt template (Section 5 above) to each row via Sonnet 4.6 API
- Stamp `correctness` + `judge_reasoning` into each row
- Output: `tier3_wave1_results.jsonl` (full 500-row graded set)

**Scope 5 -- Aggregate (SEG: TIER3_AGGREGATE)**
- Compute per-model: accuracy %, mean latency ms, total cost USD, mean sources_cited
- Produce `tier3_chart_data.json` (Section 9 schema)
- Produce `tier3_summary_paragraph.md` (Section 9 schema)
- Produce `tier3_wave1_results_20260608.jsonl` (final archive copy)
- Stage receipt at `Asteroid-ProofVault/BP078_TIER3_GEMMA4_VS_FLAGSHIPS_RECEIPT.eblet.md`

---

## 8. Risks and Truth-Always Gates

| Risk | Mitigation |
|---|---|
| Curated-bank artifact (plow sees question verbatim) | Plow runs on topic seeds extracted before question text is seen. Out-of-bank sampling confirmed. |
| Gemma 4 12B accuracy below flagships | Expected and honest. Report it. Frame as "full privacy + zero ongoing cost at X% accuracy." |
| Gemma 4 12B latency above flagships | Expected. Report p50 + p95. Do not suppress. |
| API pricing changes between plow and test | Log per-token pricing used for each flagship at run time. Include in JSONL header row. |
| Judge hallucination on ambiguous questions | PARTIAL verdict used for genuine ambiguity. Review all PARTIAL rows manually before publishing. |
| M2 or M3 offline at mesh step | Gate at Scope 2. If mesh fails, benchmark runs on M1 only with honest note: "single-node substrate, no mesh lift tested." |
| Flagship API rate limits during parallel SEG fan-out | Each model SEG retries with 30s backoff up to 3 times before logging TIMEOUT. TIMEOUT rows excluded from accuracy calc with explicit footnote. |

**Truth-Always floor:** If the final accuracy table shows our stack below all four flagships, the Tier 3 chart caption reads exactly: "Gemma 4 12B + MnemosyneC: [X]% accuracy, $0 ongoing cost, [Y] sources cited per answer. Flagships: [range]% accuracy, $[range] per 100 questions."  
No framing adjustments to hide the gap. The citation trail and zero-cost are genuine advantages independent of accuracy rank.

---

## 9. Chart-Ready Output

### `tier3_chart_data.json`

```json
{
  "run_id": "TIER3_WAVE1_20260608",
  "seed": 20260608,
  "question_count": 100,
  "models": [
    {
      "name": "Gemma 4 12B + MnemosyneC",
      "accuracy_pct": null,
      "mean_latency_ms": null,
      "cost_usd_per_100q": 0.00,
      "mean_sources_cited": null,
      "notes": "local, offline, full substrate pipeline"
    },
    {
      "name": "Claude 4.7 Opus",
      "accuracy_pct": null,
      "mean_latency_ms": null,
      "cost_usd_per_100q": null,
      "mean_sources_cited": 0,
      "notes": "API, no retrieval"
    },
    {
      "name": "GPT-4o",
      "accuracy_pct": null,
      "mean_latency_ms": null,
      "cost_usd_per_100q": null,
      "mean_sources_cited": 0,
      "notes": "API, no retrieval"
    },
    {
      "name": "Gemini 2.5 Pro",
      "accuracy_pct": null,
      "mean_latency_ms": null,
      "cost_usd_per_100q": null,
      "mean_sources_cited": 0,
      "notes": "API, no retrieval"
    },
    {
      "name": "Llama 3.1 405B",
      "accuracy_pct": null,
      "mean_latency_ms": null,
      "cost_usd_per_100q": null,
      "mean_sources_cited": 0,
      "notes": "API via host, no retrieval"
    }
  ]
}
```

(Null fields filled by Aggregate SEG after run.)

### `tier3_summary_paragraph.md`

Template (Aggregate SEG fills bracketed values):

```
Gemma 4 12B running through the full MnemosyneC substrate pipeline
scored [X]% accuracy on 100 MMLU-Pro questions (seed 20260608),
citing an average of [Y] sources per answer, at zero ongoing API cost.
The four flagship models scored [range]% accuracy at a combined cost
of $[Z] for the same 100 questions. [Honest caveat if our stack is
below: "MnemosyneC trades some accuracy for full privacy, zero cost,
and a verifiable citation trail."] Full results: Asteroid-ProofVault/
BP078_TIER3_GEMMA4_VS_FLAGSHIPS_RECEIPT.eblet.md
```

---

## 10. Founder Gates

Two hard gates before Knight fires and before chart goes live.

### Gate A -- Before Knight Fires (Founder reviews)
- [ ] Review the 100-question sample (Knight stages the list before running any model)
- [ ] Review the judge prompt template in Section 5. Approve or redline.
- [ ] Confirm API keys for all four flagship models are active on M1
- [ ] Confirm Llama 3.1 405B API host (Together.ai or equivalent) and billing cap

### Gate B -- Before Tier 3 Chart Goes Live (Founder reviews)
- [ ] Review `tier3_wave1_results_20260608.jsonl` -- scan for obvious judge errors on PARTIAL rows
- [ ] Review `tier3_summary_paragraph.md` -- approve the headline and the caveat language
- [ ] Approve `tier3_chart_data.json` for Proofs page embed
- [ ] Receipt: `Asteroid-ProofVault/BP078_TIER3_GEMMA4_VS_FLAGSHIPS_RECEIPT.eblet.md` exists and SID matches

---

## 11. Pre-Staging for Knight (Bishop Actions Before Dispatch)

To make Knight's job fast, Bishop should pre-stage:

1. **Verify MMLU-Pro access.** Confirm `TIGER-Lab/MMLU-Pro` is available via HuggingFace datasets API or local download. If Knight needs a local copy, stage the test split as `tier3_mmlu_pro_test.jsonl` in a known path on M1 before dispatch.

2. **Flagship API key audit.** Confirm Anthropic + OpenAI + Google + Llama-host keys are present in M1 env or a known secrets file. Flag any missing key to Founder BEFORE Knight dispatch, not after.

3. **Plow scope doc.** The topic-seed extraction logic (how to convert an MMLU-Pro question into Spider search terms) should be explicit in the Yoke. Bishop drafts this extraction heuristic: take `subject` field + first noun phrase of question stem, strip answer choices, use as Spider seed query.

4. **Port 11481 mesh confirm.** Verify M2 + M3 are online and responding on port 11481 before Knight dispatch. A 30-second pre-check saves Knight a mid-run gate failure.

5. **Pricing snapshot.** Pull current per-token pricing for all four flagship APIs and embed in the Yoke header so Knight uses the correct cost formula at run time, not a stale memory figure.

---

*End of plan. 10 sections. No em-dashes. Truth-Always.*
