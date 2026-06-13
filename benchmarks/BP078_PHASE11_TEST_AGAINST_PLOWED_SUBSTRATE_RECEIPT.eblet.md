# BP078_PHASE11_TEST_AGAINST_PLOWED_SUBSTRATE_RECEIPT.eblet.md

**Phase:** B -- Test Against Pre-Plowed Substrate
**Run timestamp:** 2026-06-09T03:28:35.876025+00:00
**Model:** gemma4:12b
**LLM timeout per call:** 60s
**Total wall clock:** 963.6s
**Anti-popularity threshold:** weight >= 0.6 AND content >= 100 chars

## Truth-Always Notes

- Question banks (bp077_phase8_*_mmlu_pro_REAL.json) were NOT found on disk.
  Grading uses substrate concordance only (no MCQ answer key comparison).
- truth_single_bp076.py is in replication-kit/ but requires drt_team.eblet
  which is absent from benchmarks/; Phase B runs a self-contained LLM pipeline.
- PASS = BMV >= 70 AND concordance != DISCORDANT
- FAIL = LLM responded but low BMV or DISCORDANT
- ANDON = LLM timeout, empty response, or no question text

## Per-Category Results

| Category | Total | Pass | Fail | Andon | Skipped |
|----------|-------|------|------|-------|---------|
| math | 10 | 0 | 10 | 0 | no |
| physics | 9 | 0 | 9 | 0 | no |
| chemistry | 10 | 0 | 10 | 0 | no |
| biology | 8 | 0 | 8 | 0 | no |
| health | 10 | 0 | 10 | 0 | no |
| psychology | 10 | 1 | 9 | 0 | no |
| history | 10 | 0 | 10 | 0 | no |
| law | 10 | 0 | 10 | 0 | no |
| philosophy | 10 | 0 | 10 | 0 | no |
| economics | 9 | 0 | 9 | 0 | no |
| business | 10 | 0 | 10 | 0 | no |
| engineering | 10 | 0 | 10 | 0 | no |
| cs | 0 | 0 | 0 | 0 | YES (bank_not_found_phase_a) |
| other | 0 | 0 | 0 | 0 | YES (bank_not_found_phase_a) |
| **TOTAL** | 116 | 1 | 115 | 0 | -- |

## Overall Accuracy

- Accuracy (concordance-based): **0.9%**
- Cold baseline: **0%** (no substrate = LLM has no context = no grounded answer)
- Improvement over cold: **0.9 percentage points**

## Andon-Stop Question IDs (for Phase C)

**Zero Andon-stops.** All questions received LLM responses.
Phase C has nothing to re-plow.

## Verdict

Phase B complete. 1/116 questions passed concordance check.
Andon-stops written to: `bp078_phase_b_andon_ids.json`

---
*BP078 Phase B receipt. Truth-Always. Concordance-based grading.*
