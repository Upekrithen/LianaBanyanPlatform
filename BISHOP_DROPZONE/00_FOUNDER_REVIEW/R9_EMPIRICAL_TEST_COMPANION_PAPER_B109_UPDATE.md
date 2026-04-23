# R9 Empirical Test — B109 Update (Cross-Model + Variance)
## Companion update to B108 measurement paper
## Apr 19, 2026

> **Bishop scaffolding note:** This is a structural skeleton. Numbers in tables and §1, §3, §4, §5 are load-bearing — verbatim from B109 measurements. Prose in §0 (abstract), §6, §7 marked **[Founder voice]** is intentional placeholder for your rewrite. Anecdote hooks marked **[anecdote hook]**. Expect 60–80% prose rewrite per our standing rule.

---

## 0. Abstract — UPDATE

**[Founder voice — rewrite]**

B108 reported a single-replicate measurement of R9 on Haiku 4.5 at 96.0% accuracy across 75 platform-canonical questions. B109 broadens the empirical case in two directions: variance (three replicates of Haiku, n=225 per condition) and cross-model (Sonnet 4.6 and Opus 4.7 single-replicate runs against the same preload). All three models confirm the R9 pattern. Best single-replicate measurement: Opus 4.7 / v2 preload at **97.3%** (matching B108 Haiku v1 single-rep, also 97.3% under the corrected grader). Variance-bounded floor: Haiku 4.5 / v2 preload at **93.3% ± 1.7%** (n=225). Cross-model COLD condition stable at ~8% — confirming the preload, not the model, carries the accuracy.

**[anecdote hook: this is where you might note the moment we realized Sonnet was both the cheapest *and* the most undersold by the grader — a story about measurement humility]**

---

## 1. New Measurements — DATA (verbatim from B109 results)

### 1.1 Cross-Model R9 Table (post-Q01-grader-fix)

| Model | Condition | Replicates | n | **Accuracy** | Avg input tokens | Avg output tokens | Total cost | Cost / correct |
|---|---|---|---|---|---|---|---|---|
| Haiku 4.5 | R9 | 3 | 225 | **93.3%** | 28 | 348 | $0.318 | $0.00151 |
| Haiku 4.5 | COLD | 3 | 225 | 8.4% | 77 | 144 | $0.143 | $0.00755 |
| Haiku 4.5 | COLD+URL | 3 | 225 | 5.3% | 3,052 | 348 | $0.863 | $0.07191 |
| Sonnet 4.6 | R9 | 1 | 75 | **92.0%** | (terse) | ~110 | $0.097 | $0.00141 |
| Sonnet 4.6 | COLD | 1 | 75 | 9.3% | (small) | ~150 | $0.156 | $0.02229 |
| Opus 4.7 | R9 | 1 | 75 | **97.3%** | (varies) | ~200 | $1.140 | $0.01562 |
| Opus 4.7 | COLD | 1 | 73 | 8.2% | (small) | ~200 | $0.926 | $0.15433 |

**[Bishop note: Sonnet/Opus avg-token columns are estimates from log inspection — exact numbers in `results_*_{model}.csv` if needed.]**

### 1.2 Pre-Registered Prediction Status (carried forward from B108)

All eight pre-registered predictions from B108 §4 remain MET (none triggered falsification). B109 does not test new predictions; it tightens the variance and cross-model claims that B108 left open.

### 1.3 Q01 Grader Correction

B108's reported 96.0% (72/75) used a strict `must_contain: ["Cost+20"]` rule. The model's "Cost + 20%" answers (with space + percent sign) were marked incorrect. B109 relaxed to `must_contain_any: [["Cost+20", "Cost + 20", "cost+20", "cost + 20"]]`. Effect: **+1 R9 pass per replicate per model**. B108 single-rep retroactively becomes 73/75 = **97.3%**, identical to B109 Opus.

---

## 2. v1 → v2 Preload Delta — DATA + INTERPRETATION

### 2.1 Per-question delta (Haiku, before/after v2 archive swap)

| Q | Bucket | B108 (v1, single-rep) | B109 (v2, 3-rep) | Verdict |
|---|---|---|---|---|
| Q01 | economics | FAIL | PASS 3/3 (after grader fix) | ✅ Grader fixed |
| Q06 | patents | PASS | FAIL 0/3 | **Regression** — multi-part canonical numbers |
| Q20 | roadmap | PASS | FAIL 0/3 | **Regression** — Opening Gambit detail |
| Q29 | outreach | FAIL | MIXED 2/3 | Improved partially (Doctorow/Dougherty) |
| Q59 | transcript_reasoning | FAIL | PASS 3/3 | ✅ **v2 fixed its target** |
| Q68 | transcript_reasoning | PASS | FAIL 0/3 | **Regression** — acquisition ethic content |

**Net:** v2 preload trades 1 fixed (Q59, the target) for 3 regressed (Q06, Q20, Q68) and 1 improved (Q29). Aggregate Haiku R9: 97.3% → 93.3% = −4 pts.

### 2.2 Hypothesis on the regression

**[Founder voice — pick one or merge]**

The v2 archive is ~85k tokens vs v1's ~70k. SP-15 v2's tighter preservation (verbatim labeled iterations, exact quotes) added 15k tokens of high-fidelity but locally-dense content. Hypothesis: more-context isn't strictly more-accuracy; semantic competition for attention on multi-part detail questions (Q06, Q20, Q68 all require *several* specific facts in one answer) appears to suffer.

The interesting reading: the model has the information (Q68 acquisition-ethic content is verifiably at line 2861 of `SESSION_REASONING_ARCHIVE_B109.md`), but synthesis-under-load misses it. This is an **R9-v3 design constraint**, not a corpus gap. Worth investigating in B110: chunked vs monolithic preload, retrieval-augmented R9, or per-domain preload partitioning.

**[anecdote hook: Founder's "highway painter" or "wide-spread / thin-paint" framing might land well here]**

---

## 3. The Sonnet Terseness Effect — DATA + LIMITATION

### 3.1 Observation

Sonnet 4.6 R9 = 92.0%, slightly below Haiku 93.3% and well below Opus 97.3%. Sonnet output tokens per R9 query average **~110** vs Haiku's **348** and Opus's **~200**. Shorter answers mechanically miss more `must_contain` substrings even when semantically correct.

### 3.2 Status

Unverified — to confirm whether this is grading artifact or capability gap requires manual review of Sonnet's 6 R9 failures. **Deferred to B110** for a follow-up analysis if publication target requires Sonnet-specific resolution. Reporting as Limitation in §6.

---

## 4. Cost — DATA

### 4.1 B109 Session Spend

| Component | Cost |
|---|---|
| SP-15 v2 extraction (33 transcripts via `--resume`) | $0.77 |
| Haiku 3-rep × 3 conditions × 75 Q | $1.32 |
| Sonnet 4.6 1-rep × 2 conditions × 75 Q | $0.26 |
| Opus 4.7 1-rep × 2 conditions × 75 Q (n=73 on COLD) | $2.07 |
| **Session total** | **$4.42** |

### 4.2 Marginal Cost-per-Correct-Answer (R9 condition)

- Haiku 4.5: **$0.00151** per correct
- Sonnet 4.6: **$0.00141** per correct (cheapest, due to prompt caching + terse output)
- Opus 4.7: **$0.01562** per correct (10× Haiku, but +4 pts accuracy)

Compared to COLD baseline at $0.00755/correct (Haiku), R9 is **5× cheaper per correct answer** on Haiku.

---

## 5. Limitations (honest, expanded from B108)

[Carry forward §6 from B108 paper, then add:]

- **Cross-model replicates = 1 for Sonnet and Opus.** Variance bounded only on Haiku. Sonnet/Opus point estimates carry ~3.1% single-rep CI.
- **Sonnet terseness effect** unverified (see §3.2). Reported value (92.0%) may understate true accuracy.
- **v2 preload regression** on Q06, Q20, Q68 unexplained at submission time. Hypothesis in §2.2; experimental resolution deferred to B110.
- **Two Opus COLD calls dropped** to rate-limit retries (Q01, Q02) — n=73 not 75 for Opus COLD only. Does not affect the 97.3% R9 headline.
- **COLD+URL not measured for Sonnet/Opus.** That condition is a site-audit (does lianabanyan.com serve canonical facts?) not a model-capability test; carrying forward Haiku's COLD+URL = 5.3% as the site-audit number.

---

## 6. What's Next — UPDATE

**[Founder voice — pick / merge / cut]**

### 6.1 Closing the v2 regression
- Manual diagnosis of Q06, Q20, Q68 against v2 archive content. Possible interventions: targeted preload pruning, chunked retrieval, per-domain partitioning.

### 6.2 Sonnet terseness resolution
- Manual review of the 6 Sonnet R9 failures. If grading-artifact: paper headline becomes "consistent ≥92% across the Claude 4 family." If capability gap: model-specific calibration noted.

### 6.3 Cross-domain validation
- Per the B108 §7 plan: pick a public canonical corpus (Linux kernel docs, IRS Pub 15, OSHA 1910), build mini-preload, write 25 Q, run same three conditions. Estimated 3–4 hr prep + ~$2 compute.

### 6.4 Cross-provider validation
- OpenAI (GPT-5.x) and Google (Gemini 2.5 Pro) prompt-caching is architecturally equivalent. B110+ work for external publication.

---

## 7. Citation — UPDATE

**[Founder voice — your phrasing]**

Suggested form for citing this update:

> Liana Banyan Bishop Session B109 (Apr 19, 2026). *R9 Empirical Test — Cross-Model and Variance Update*. Companion to *The Editorial Archaeologist Intervention* (B108). Accuracy 93.3% ± 1.7% (n=225, Haiku 4.5); 97.3% (n=75, Opus 4.7); 92.0% (n=75, Sonnet 4.6) on the same 75-question canonical benchmark.

---

## Appendix A — Updated Pre-Registration Status

| Prediction (from B108 §4) | Predicted | B108 Measured | B109 Measured | Verdict |
|---|---|---|---|---|
| R9 Set A accuracy | ≥90% | 96.4% | 93.3% (n=165, Haiku v2) | ✅ MET |
| R9 Set B accuracy | ≥80% | 95.0% | 93.3% (n=60, Haiku v2) | ✅ MET |
| Ingestion cost | $1.50–$3.00 | $0.97 (v1) | $0.77 (v2 resume) | ✅ UNDER |
| Cost per query | $0.017 | $0.00152 | $0.00141 (Sonnet) – $0.01520 (Opus) | ✅ UNDER for Haiku/Sonnet, met for Opus |
| Set A regression floor | ≥85% | 96.4% | 93.3% | ✅ not triggered |
| Set B failure threshold | <50% | 95.0% | 93.3% | ✅ not triggered |
| Ingestion overspend | >$10 | $0.97 | $0.77 | ✅ not triggered |
| Preload too large | query >$0.030 | $0.00152 | $0.01520 max (Opus) | ✅ not triggered |

All eight predictions remain MET in B109. None triggered falsification.

---

## Appendix B — Artifacts

- **Milestone:** `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B109_CROSS_MODEL_MEASUREMENT.md`
- **B109 archive:** `BISHOP_DROPZONE/14_CanonicalReferences/SESSION_REASONING_ARCHIVE_B109.md` (50 sessions, 416 sections, ~85k tokens)
- **Benchmark CSVs / reports** in `BISHOP_DROPZONE/13_Ops_Deploy/painter_benchmark/results/`:
  - `results_20260419_141147_haiku-4-5.csv` + report
  - `results_20260419_143701_sonnet-4-6.csv` + report
  - `results_20260419_144821_opus-4-7.csv` + report
- **Code:** `bishop_dirty_dozen_v2.py` (now multi-model via `--model` flag); `sp15v2_bulk_concat.py` (new)
- **Ground truth:** `ground_truth.yaml` (Q01 grader relaxed for "Cost + 20%" variants)

---

*Saved B109, Apr 19, 2026. Founder rewrites prose; Bishop holds the numbers.*
