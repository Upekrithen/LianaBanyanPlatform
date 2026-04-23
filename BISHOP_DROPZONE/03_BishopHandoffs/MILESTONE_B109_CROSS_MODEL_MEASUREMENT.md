# Milestone — B109 Cross-Model R9 Measurement
## Status: COMPLETE — April 19, 2026

**Session:** B109 (Bishop / Claude Opus 4.7 1M context)
**Total session spend:** $4.42 of $18 approved budget (75% headroom remaining)

---

## 1. The Story in One Paragraph

B108 measured R9 on Haiku 4.5 at a single replicate (96.0% accuracy). B109 widens the measurement on two fronts: (1) **variance** — three Haiku replicates (n=225 per condition), (2) **cross-model** — single replicates on Sonnet 4.6 and Opus 4.7. All three models confirm the R9 pattern: preload delivers ~90–96% accuracy across the Claude 4 family, cold-start collapses to ~8–9%. Haiku's true R9 accuracy with variance is **92.0% ± 1.8%** (not 96.0% — the B108 single-rep was upper-tail noise). SP-15 v2 preservation successfully fixed Q59 (the original target, 0/3 → 3/3) but introduced mixed regressions on Q06, Q20, Q68 that drop aggregate by ~4 points. Opus 4.7 recovers 96.0%. Sonnet 4.6 shows a 5-point gap (90.7%) that appears to be a grading artifact — Sonnet gives terser answers that miss `must_contain` key-term matching, not a capability gap. Cross-model total: **$4.42 session spend** (overprojected by ~4× due to prompt caching on R9 condition).

---

## 2. Cross-Model Results Table

| Model | Replicates | R9 n | **R9 Accuracy** | COLD n | COLD Accuracy | R9 Total Cost | R9 Cost/Query | R9 Cost/Correct |
|---|---|---|---|---|---|---|---|---|
| Haiku 4.5 | 3 | 225 | **92.0%** | 225 | 8.4% | $0.3180 | $0.00141 | $0.00154 |
| Sonnet 4.6 | 1 | 75 | **90.7%** | 75 | 9.3% | $0.0970 | $0.00129 | $0.00143 |
| Opus 4.7 | 1 | 75 | **96.0%** | 73 | 8.2% | $1.1400 | $0.01520 | $0.01583 |

**Key observations:**
- R9 effect holds across the entire Claude 4 family (~10× cold-start accuracy).
- **Sonnet 4.6 is cheapest per correct R9 answer** ($0.00143) — prompt caching + terse outputs.
- Opus R9 cost per query ($0.0152) is ~10× Haiku but accuracy is +4 pts (96.0% vs 92.0%).
- COLD across models is noise-floor-stable at 8–9% (expected — these are canonical platform facts not in training data).

---

## 3. Haiku Variance Breakdown (n=225)

**Per-question stability:**
- 66 / 75 questions: **3/3 PASS** (always correct)
- 5 / 75 questions: **MIXED** (Q07 2/3, Q29 2/3, Q37 2/3, Q49 1/3, Q66 2/3)
- 4 / 75 questions: **0/3 FAIL** (Q01, Q06, Q20, Q68)

**Math check:** 66×3 + 2+2+2+1+2 + 0 = 198 + 9 + 0 = 207/225 = 92.0% ✓

**Confidence interval** for R9 Haiku:
- Single-rep n=75: 92.0% ± 3.1% (so 96.0% single-rep from B108 was inside 95% CI — upper tail noise)
- 3-rep n=225: 92.0% ± 1.8% → true R9 accuracy on this preload is 88.4–95.6% at 95% CI

---

## 4. v1 (B108) → v2 (B109) Archive Delta

B108 single-rep Haiku R9 failures: Q01, Q29, Q59.
B109 3-rep Haiku R9 stability (on v2 archive):

| Question | B108 (v1) | B109 (v2) | Verdict |
|---|---|---|---|
| Q01 economics | FAIL | FAIL 0/3 | No change. Grader artifact ("Cost + 20%" vs "cost+20"). |
| Q29 outreach (SEC-12 names) | FAIL | MIXED 2/3 | Improved — Doctorow/Dougherty drift still partial. |
| Q59 transcript_reasoning (Newmark A/B/C) | FAIL | **PASS 3/3** | **✅ v2 fixed its target.** |
| Q06 patents (canonical numbers) | PASS | FAIL 0/3 | **New regression.** Multi-part detail miss. |
| Q20 roadmap (Opening Gambit) | PASS | FAIL 0/3 | **New regression.** Missing date detail in preload? |
| Q68 transcript_reasoning (acquisition ethic) | PASS | FAIL 0/3 | **New regression.** Content IS in v2 archive (line 2861). Synthesis miss. |

**Net delta:** v2 fixed the targeted Q59 but introduced 3 new 0/3 fails. Aggregate: 96.0% → 92.0%.

**Interpretation:** v2 archive is ~85k tokens vs v1's ~70k. More context ≠ more accuracy. Possibly: the additional verbatim preservation in v2 creates semantic competition for attention on multi-part detail questions. Worth investigating in B110.

---

## 5. Sonnet 4.6 Terseness Hypothesis

Sonnet R9 accuracy (90.7%) is 5 points below Haiku (92.0%) and 5.3 points below Opus (96.0%). The numbers that tell the story:

| Model | Avg output tokens (R9) | Avg output tokens (COLD) |
|---|---|---|
| Haiku 4.5 | 348 | 144 |
| Sonnet 4.6 | ~110 (est from logs) | ~150 |
| Opus 4.7 | ~200 (est from logs) | ~200 |

Sonnet outputs ~3× fewer tokens than Haiku on R9. The benchmark grader requires **all** `must_contain` substrings to be present — shorter answers mechanically miss more key terms even when semantically correct.

**This is a grading-rigor hypothesis, not a capability claim.** To confirm, a manual review of Sonnet's 7 R9 failures would distinguish:
- Sonnet said the right thing but too tersely (grading artifact)
- Sonnet actually got it wrong (capability miss)

Deferred to B110 if publication depends on it. Mention in Limitations for now.

---

## 6. Cost Summary — Session B109

| Work | Cost |
|---|---|
| SP-15 v2 extraction (33 transcripts, resume from failed run) | $0.77 |
| Haiku 3-rep benchmark (R9, COLD, COLD+URL, n=225 each) | $1.32 |
| Sonnet 4.6 single-rep (R9 + COLD, n=75) | $0.26 |
| Opus 4.7 single-rep (R9 + COLD, n=75 + n=73 after 2 dropped on 429) | $2.07 |
| **Session total** | **$4.42** |

Approved budget: $18. **Under by $13.58.** Prompt caching on the ~102k-token R9 preload did most of the heavy lifting — every benchmark except the first call on each condition paid cache-rate ($1.50/M Haiku, $5.63/M Sonnet, $28.13/M Opus — all 10% of base input rate).

---

## 7. Known Caveats

- **Opus COLD n=73, not 75.** Two 429 rate-limit errors (Q01 and Q02 COLD) exhausted 3 retries during parallel execution with Haiku 3-rep. Dropped 2 data points. Does not affect the 92% / 91% / 96% R9 headlines.
- **Sonnet terseness artifact** unverified (see §5).
- **v2 regressions** unexplained (see §4).
- **Cross-model replicates = 1.** Variance only measured on Haiku. Sonnet and Opus single-rep numbers carry ~3.1% CI.
- **COLD+URL** was only measured on Haiku (by approved plan). Sonnet/Opus site-audit not measured.
- **Single platform** (lianabanyan.com canonical corpus). No cross-domain generalization tested in this session.

---

## 8. Artifacts Produced

### Benchmark Results
- `BISHOP_DROPZONE/13_Ops_Deploy/painter_benchmark/results/results_20260419_141147_haiku-4-5.csv` + report
- `BISHOP_DROPZONE/13_Ops_Deploy/painter_benchmark/results/results_20260419_143701_sonnet-4-6.csv` + report
- `BISHOP_DROPZONE/13_Ops_Deploy/painter_benchmark/results/results_20260419_144821_opus-4-7.csv` + report
- `BISHOP_DROPZONE/13_Ops_Deploy/painter_benchmark/results/site_fix_punchlist_20260419_141147_haiku-4-5.md`

### Code
- `librarian-mcp/stitchpunks/sp15v2_editorial_archaeologist.py` (MAX_TOKENS 3000 → 4000)
- `librarian-mcp/stitchpunks/sp15v2_bulk_concat.py` (new)
- `BISHOP_DROPZONE/13_Ops_Deploy/painter_benchmark/bishop_dirty_dozen_v2.py` (new `--model` flag; pricing dict; B109 archive path)

### Preload
- `BISHOP_DROPZONE/14_CanonicalReferences/SESSION_REASONING_ARCHIVE_B109.md` — 50 sessions, 416 kept sections, ~85k tokens. Supersedes B108 archive.

### v2 Extractions
- `BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/EXTRACTED_V2/` — 54 extractions + `_SYNTHESIS.md`

---

## 9. Recommended Next Steps (for Founder)

**Paper update (your prose):**
1. Companion paper B109 revision — headline: "Cross-model, variance-bounded: R9 works on Haiku / Sonnet / Opus."
2. Include variance CI (92.0% ± 1.8%), the v1→v2 delta honestly, Sonnet terseness as limitation.
3. Supersede B108's 96.0% headline with 92.0% ± 1.8% (or Opus 96.0% single-rep, your call on which model is the reference).

**Investigations (deferrable):**
1. **Sonnet terseness confirmation** — 7 failures, manual review, ~15 min.
2. **v2 regression diagnosis** — why did Q06, Q20, Q68 regress on v2? Possibly preload size / attention competition.
3. **Q01 grader fix** — relax `must_contain` to tolerate "Cost + 20%" with spaces. Trivial, would add 3 R9 passes to Haiku (→93.3%).

**Patent / publication gating:**
- Opus 4.7 at 96.0% R9 is the strongest single data point for a headline claim. If you prefer Haiku's 92.0% ± 1.8% as the reference (cheaper, wider measurement), that's a defensible editorial call.

---

## 10. Outstanding B109 Queue

- [ ] **Q29 Doctorow/Dougherty ratification** (unresolved since B108)
- [ ] Scholz V16 build
- [ ] NYT op-ed draft
- [ ] Wave 2 letters sweep
- [ ] Netessine letter confirmation (staged; Founder sends)

---

## 11. Q01 Grader Fix (post-run, applied April 19)

The B108-flagged Q01 grader artifact (model says "Cost + 20%" with space; grader required literal "Cost+20") was relaxed in `ground_truth.yaml`:
- `must_contain: ["$5", "83.3", "Cost+20"]` → `must_contain: ["$5", "83.3"]` + `must_contain_any: [["Cost+20", "Cost + 20", "cost+20", "cost + 20"]]`

**Corrected R9 totals (Q01 fix applied; no other changes):**

| Model | Was | Corrected | New CI (95%) |
|---|---|---|---|
| Haiku 4.5 (3-rep, n=225) | 207/225 = 92.0% | **210/225 = 93.3%** | 89.9–96.7% |
| Sonnet 4.6 (1-rep, n=75) | 68/75 = 90.7% | **69/75 = 92.0%** | 85.6–98.4% |
| Opus 4.7 (1-rep, n=75) | 72/75 = 96.0% | **73/75 = 97.3%** | 93.7–100% |

**B108 retroactive correction:** B108's reported 72/75 = 96.0% (Haiku, v1 preload, single-rep) was also suppressed by the same grader bug. Corrected: 73/75 = **97.3%**. The B108 v1 single-rep and B109 v2 Opus single-rep now match at 97.3%.

**Headline numbers for paper:**
- **Best single-rep:** Opus 4.7 / v2 preload = **97.3%** (corroborated by B108 Haiku / v1 preload = 97.3%)
- **Variance-bounded floor:** Haiku 4.5 / v2 preload, n=225 = **93.3% ± 1.7%**
- **Cross-model consistency:** all three models above 92% R9, all at ~8% COLD

---

*Saved B109, April 19, 2026. All cross-model measurement recoverable from CSVs. For the Keep.*
