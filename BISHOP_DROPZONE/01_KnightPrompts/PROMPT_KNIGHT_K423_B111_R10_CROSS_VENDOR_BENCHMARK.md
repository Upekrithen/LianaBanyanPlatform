# Knight K423 — The Eyewitness Benchmark — Cross-Vendor R9 Replication Analysis
## B111, April 20, 2026 — Dispatched by Bishop

**Founder-greenlit:** April 20, 2026 ($80 API-spend cap approved).
**Delivery deadline:** Before Yale AI Symposium demo table prep begins — target **April 25, 2026** end-of-day (5 days out).
**Hard budget cap:** **USD $80.00 total API spend.** Abort the run if projection exceeds cap. Report partial results if cap is hit mid-run.

---

## Why this exists

The R9 architecture has been empirically validated on **Anthropic models only** (Haiku 4.5, Sonnet 4.6, Opus 4.7) at 93.3% ±1.7% / 92.0% / 97.3% accuracy against an ~8% cold baseline (B108/B109, n=225). Any serious reader — NYT editor, Sanders/AOC staffer, Scott operator, Pluralistic subscriber — will ask: *"does it work outside Anthropic?"*

**The Eyewitness Benchmark answers that question with a measured multi-vendor table.** The op-ed and the Doctorow V04 letter both reference cross-vendor performance. Yale demo table prep needs the table finalized 3 days before the symposium. The Sanders/AOC staffer memo (awaiting Pawn B70 contact list) uses the same table as its central evidence. Cross-vendor is the highest-leverage scientific work in the pipeline this week.

**Posture choice (Founder-stated, preserve in methodology section of the paper):** R10 tests four vendors — **Anthropic, Google, Microsoft (Azure OpenAI), Perplexity.** OpenAI direct is NOT on the vendor list; OpenAI models enter the study only via Microsoft's Azure wrapper. This is intentional. The paper should disclose this choice explicitly, not pretend it was arbitrary.

---

## Scope — K423 is R10 ONLY

Do **NOT** attempt the previously-queued librarian_context v0.2.0, librarian_metrics tool, or pyproject.toml publishing work in this session. Those are deferred to **K424**. K423 is one job: run the cross-vendor benchmark, log the results, produce the comparison table. If time and budget remain after R10 is clean, stop and close out — K424 will pick up the v0.2.0 work.

---

## Deliverables (in priority order)

1. **Runner script** at `LianaBanyanPlatform/librarian-mcp/eyewitness_benchmark/run_benchmark.py` — third-party-runnable with env-var API keys, no hardcoded secrets. Must accept `--vendor`, `--model`, `--condition` (hot/cold), `--n` (question subset), `--out` (output path), `--dry-run` flags. Default is full 75 × 2 × 8 run.
2. **Per-vendor adapters** in `LianaBanyanPlatform/librarian-mcp/eyewitness_benchmark/adapters/` — one module per vendor, each exposing a common `call(model, system_prompt, user_prompt) -> {text, input_tokens, output_tokens, cost_usd, latency_s}` interface.
3. **Question bank** extracted from the existing B108 R9-v2 benchmark at `LianaBanyanPlatform/librarian-mcp/eyewitness_benchmark/questions.json` (75 items: Set A Q1-Q55 canonical + Set B Q56-Q75 transcript-reasoning, with canonical answers + grading rubric per question — reuse B108 grading rubric verbatim).
4. **R9-v2 preload packet** copied from the B108 run (`~87,000 tokens: MEMORY_PUBLIC + canonical_values.yaml + R9 licensing brief + CANONICAL_LAWS_AND_FRAMEWORKS.md + Session Reasoning Archive`) as `LianaBanyanPlatform/librarian-mcp/eyewitness_benchmark/r9v2_preload.md` — single source of truth, loaded identically across all 8 models.
5. **Results** at `LianaBanyanPlatform/librarian-mcp/eyewitness_benchmark/results/run_{timestamp}/` — one JSONL per (vendor, model, condition) + aggregate `summary.json` + Markdown comparison table `R10_RESULTS_B111.md`.
6. **Cost log** at `LianaBanyanPlatform/librarian-mcp/eyewitness_benchmark/results/run_{timestamp}/cost_log.csv` — every API call with timestamp, vendor, model, condition, question_id, input_tokens, output_tokens, cost_usd, cumulative_total_usd. Abort handler triggers at cumulative_total_usd >= $75 (leaves $5 margin for grader).
7. **Comparison table** at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/EYEWITNESS_BENCHMARK_RESULTS_B111.md` — the output I will hand to Founder for the op-ed, Doctorow V04, staffer memo, and Yale demo.

---

## Model matrix (greenlit)

| Vendor | Cheap-tier model | Premium-tier model |
|---|---|---|
| **Anthropic** | `claude-haiku-4-5-20251001` | `claude-opus-4-7` |
| **Google** | `gemini-3.1-flash` | `gemini-3.1-pro` |
| **OpenAI (direct)** | `gpt-4o-mini` | `gpt-4o` |
| **Perplexity** | `sonar` | `sonar-pro` |

8 models total. Each runs 75 questions × 2 conditions (HOT with R9-v2 preload, COLD with minimal system prompt). **1,200 inference calls total** + grader calls. Drop the COLD+URL condition from the B108 design — cross-vendor URL-tool support varies too much to be apples-to-apples.

**Change from original K423 draft (B111 update):** Azure OpenAI swapped to **OpenAI direct** per Founder decision B111. Rationale: Azure OpenAI is not currently provisioned (would take 1-3 days for Azure subscription + deployment), while OpenAI direct key is already live (CephasTheCursorKEY on `platform.openai.com`). Founder will provision a dedicated `R10_LibrarianBenchKEY` to separate usage tracking from Cursor. Methodology section must disclose the OpenAI inclusion decision explicitly (see "Posture disclosure" below).

**Posture disclosure (required in paper's methodology section, verbatim):**
> We include OpenAI in this study despite substantive concerns about their governance trajectory, because a cross-vendor study that excludes the market leader is not a cross-vendor study. Measurement is the contribution; endorsement is not conveyed by inclusion.

If any vendor's model name above is deprecated or renamed at the API layer, use the closest current equivalent and note the substitution in `methodology_notes.md`. Do NOT substitute a model from a different vendor.

**Not in R10 (deferred to R11 or omitted):** Mistral, Cohere (both pass a posture test, deferred to R11 for scope control — enterprise-European + enterprise-cooperative representation). xAI (Grok): omitted indefinitely unless governance stabilizes. Meta Llama: R11 candidate (adds open-weights tier). Alibaba Qwen / DeepSeek: R12+ candidates with explicit Chinese-regulatory-environment disclosure. Azure OpenAI (wrapper comparison): R11 follow-up to compare same GPT-4o models across direct vs. Azure deployment paths.

---

## Grading (single-blind, single-grader for fairness)

- **Primary grader:** Claude Haiku 4.5. Cheap, fast, high agreement with Opus on grading tasks per B108 data.
- **Spot-check grader:** Claude Opus 4.7 re-grades a random **10% sample** (stratified by vendor × condition) for inter-rater agreement. Report Cohen's kappa in `summary.json`.
- **Single-blind:** the grader prompt must NOT reveal the vendor, model, or condition. Each grading call receives only: question, reference answer, rubric, candidate response. Shuffle order.
- **Rubric:** reuse B108 rubric verbatim. Three outcomes per item: Correct / Partial / Incorrect. Score = (Correct × 1.0) + (Partial × 0.5) out of 75.

---

## Output format — the comparison table Founder needs

In `EYEWITNESS_BENCHMARK_RESULTS_B111.md`, produce this exact structure:

```
| Vendor | Model | Tier | HOT accuracy | COLD accuracy | HOT cost / Q | COLD cost / Q | HOT latency p50 |
|---|---|---|---:|---:|---:|---:|---:|
| Anthropic | Haiku 4.5 | cheap | 9X.X% | 8.X% | $0.00X | $0.00X | X.Xs |
| Anthropic | Opus 4.7 | premium | ... | ... | ... | ... | ... |
| Google | Gemini 3.1 Flash | cheap | ... | ... | ... | ... | ... |
| Google | Gemini 3.1 Pro | premium | ... | ... | ... | ... | ... |
| Microsoft (Azure) | GPT-4o-mini | cheap | ... | ... | ... | ... | ... |
| Microsoft (Azure) | GPT-4o | premium | ... | ... | ... | ... | ... |
| Perplexity | Sonar | cheap | ... | ... | ... | ... | ... |
| Perplexity | Sonar Pro | premium | ... | ... | ... | ... | ... |
```

Plus 2–3 paragraphs of narrative under the table: what the cross-vendor picture shows, which vendors carry the R9 delta well, which don't, and any surprises. Be direct. If a vendor scores poorly in HOT, say so plainly and propose the most likely cause (API truncation? system-prompt length limit? different caching behavior?). If Microsoft GPT-4o HOT accuracy is weak specifically because the Azure deployment can't ingest the full 87k preload, **that finding IS the op-ed anchor** — document it cleanly, not apologetically.

---

## Reproducibility arm (the "someone else's computer" test)

Bishop will recruit an external replicator (candidate: a technical Scott grantee volunteer, or a Pluralistic reader after Doctorow V04 dispatches). The replicator installs the `librarian-mcp` package, clones `eyewitness_benchmark/`, provides their own API keys via env vars, and runs the same benchmark on their machine.

**Knight's job in K423:** make the runner clean enough that a stranger can run it. This means:
- `README.md` in `eyewitness_benchmark/` with exact setup steps (Python version, `pip install -r requirements.txt`, env-var names, sample command)
- No hardcoded API keys anywhere
- Clear error messages when a required env var is missing
- Total run time reported at the end so the replicator knows what to expect
- Results JSONL format identical to the canonical run, so the replicator's file can be dropped into a comparison script at K424

Do NOT actually recruit the external replicator in K423 — that's Bishop's job after the canonical run lands.

---

## Hard rules

- **Single grader across all 8 models.** This is load-bearing for fairness. Do not grade Anthropic with Anthropic and Google with Google. One grader only.
- **Identical R9-v2 preload across all 8 models.** Same ~87k tokens, loaded as system prompt for HOT condition. If a vendor's API caps system-prompt length below the preload size, truncate from the end and note the truncation in `methodology_notes.md` — do not substitute a shorter preload.
- **No retries on low accuracy.** If a model scores 30% in HOT, that's the result. Don't re-run hoping for a better number. If the call itself errored (API 500, rate limit, timeout), retry up to 3× with exponential backoff — that's retry-for-error, not retry-for-score.
- **Vendor caching behavior asymmetry:** Anthropic's prompt caching is native; other vendors may or may not cache equivalently. Report raw per-call cost in the table, and note in `methodology_notes.md` which vendors had cache hits so the cost column isn't misread as unfair advantage.
- **No data leakage between HOT and COLD.** Do NOT reuse a session/conversation across conditions. Each call is fresh.
- **No human-in-the-loop grading.** Grader is model-only. Founder should NOT be asked to adjudicate borderline cases during the run. Borderline items get flagged in the per-item JSONL for Founder review after the fact, but do not block the run.

---

## Abort conditions

Abort the run and report partial results if any of these hit:

1. Cumulative cost >= $75 (leave $5 margin for grader completion + spot-check)
2. Any single vendor's per-call cost projection implies the full 150 calls (75 × 2) would cost > $25 for that vendor
3. A vendor's API is down for > 30 minutes mid-run — skip that vendor, continue, note in results
4. Rate-limit budget for the session is exhausted and further retries would push past cost cap

Report via the same results JSONL + `ABORTED_reason.md` in the results folder. Do not silently truncate.

---

## Timing

- **Target wall-clock:** 4–6 hours end-to-end including grading and spot-check. Async parallel calls across vendors are fine; serial within a vendor if rate limits demand.
- **Checkpoint:** after the first 2 vendors complete (Anthropic + Google), produce an interim table in `results/run_{timestamp}/INTERIM_2_VENDORS.md` so Bishop can check that the runner is producing reasonable numbers before Microsoft + Perplexity burn through the remaining budget.

---

## What Bishop will do with the results

1. Replace the Anthropic-only accuracy row in `NYT_OPED_INVISIBLE_TAX_B111_v2_SCAFFOLD.md` with the full 8-model table.
2. Add the table to `DOCTOROW_LETTER_V04_B111_THERMOMETER.md` as a new paragraph under "What Is in the Case File."
3. Prepare the Sanders/AOC staffer memo with the table as the central evidence.
4. Build the Yale demo-table handout (Apr 28) with the table on page 1.
5. If the spread across vendors is dramatic (e.g. one vendor fails), draft an update to the thermometer framing that specifically acknowledges the variance and invites replication.

---

## Questions for Knight if anything is unclear

If **anything** in the above is ambiguous, post in the Knight/Bishop bridge and wait for Bishop to clarify before burning budget. Specifically:
- If you cannot locate the B108 R9-v2 preload artifact or the 75-Q bank, stop and ask Bishop where to find them.
- If a vendor's SDK isn't installable on the current Knight environment, stop and ask before attempting workarounds.
- If you suspect the $80 cap will be exceeded by Microsoft or Perplexity pricing specifically, flag before running those vendors so Bishop can narrow the matrix.

---

## Stitchpunk number for the paper

Register the paper output as **Paper #49 — "The Eyewitness Benchmark: Cross-Vendor R9 Replication Analysis"** (Founder-ratified title B111). Stitchpunk registration: SP-19 Cross-Vendor Replication (next Stitchpunk number after SP-18 Prose Provenance). Paper file: `BISHOP_DROPZONE/08_Papers/Academic/PAPER_49_EYEWITNESS_BENCHMARK_B111.md` — **Knight writes the methodology section only**; Bishop writes the discussion/implications section after reviewing results.

---

## Sign-off

This prompt is self-contained. Everything Knight needs to execute R10 is above. If a future K-session wants to pick up the v0.2.0 / metrics / packaging work originally scoped to K423, reference this prompt's "Scope — K423 is R10 ONLY" section — that scope was deferred deliberately and should land in K424.

**Founder-ratified R10 itself:** B111, April 20, 2026 ("Greenlit. script K423").
**Bishop dispatched this prompt:** B111, April 20, 2026.
**FOR THE KEEP.**
