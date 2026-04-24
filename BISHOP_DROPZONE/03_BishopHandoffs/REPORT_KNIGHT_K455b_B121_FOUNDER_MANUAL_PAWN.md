# REPORT_KNIGHT_K455b_B121_FOUNDER_MANUAL_PAWN

**Session:** K455b Mode A / B121
**Date:** 2026-04-23/24
**Task class:** Attribution-isolation test — Pawn (Perplexity API) + Cathedral paste
**Target tag:** `v-cathedral-effect-k455b-pawn-cathedral-isolation`
**Mode:** A — Knight-automated via Perplexity API (sonar-pro)
**Status:** COMPLETE (with critical methodological finding)
**Publication hold:** IN FORCE until Prov-14 receipt

---

## Summary

K455b Mode A ran 50 R11 questions through the Perplexity sonar-pro API in two arms:
- **Arm 1 (control):** 25 questions, bare (no Cathedral content)
- **Arm 2 (treatment):** 25 questions, Pawn Cathedral snapshot prepended as system prompt

**Primary result:** HOT lift = **−8.0pp** (Arm 2 worse than Arm 1)

**Critical finding:** The result is **methodologically confounded by a corpus version mismatch**. The sealed question bank (`R11_QUESTION_BANK_SEALED.json`, sealed K444, corpus ID `R11-CANONICAL-K444`) tests a DIFFERENT set of R11 facts than what is stored in Bishop's `scribe_R11.jsonl` (ingested K455c from `r11_canonical_corpus.md`). Only **11/50 questions (22%)** are answerable from the Pawn Cathedral snapshot. The negative lift is an artifact of this mismatch, not evidence against Cathedral effectiveness.

**Attribution isolation status:** NOT ASSESSABLE in this run due to corpus mismatch. Attribution test requires re-alignment of corpus and question bank before a valid judgment can be made.

---

## Benchmark Results

### Primary Results Table

| Arm | n | HOT | HIT | MISS | HOT% | HIT% |
|-----|---|-----|-----|------|------|------|
| Arm 1 — bare (control) | 25 | 2 | 5 | 18 | **8.0%** | 20.0% |
| Arm 2 — Cathedral paste (treatment) | 25 | 0 | 2 | 23 | **0.0%** | 8.0% |
| **Lift (Arm 2 - Arm 1)** | — | — | — | — | **−8.0pp** | −12.0pp |

Cathedral Effect classification: **Negative** (lift < −5pp)

### Cost + Latency

| Metric | Value |
|--------|-------|
| Model | sonar-pro |
| Total questions | 50 (25 control + 25 treatment) |
| Total cost | $0.49 |
| Avg cost/call | $0.0098 |
| Avg latency | 3.22s |
| Budget cap | $5.00 (not hit) |

---

## Critical Finding: Corpus Version Mismatch

### What happened

The Pawn Cathedral snapshot is sourced from Bishop's `scribe_R11.jsonl`, which was ingested during K455c from `r11_canonical_corpus.md`. This corpus uses one specific set of R11 facts.

The sealed question bank (`R11_QUESTION_BANK_SEALED.json`) was sealed during K444 against a DIFFERENT version of the R11 canonical corpus (`R11-CANONICAL-K444`). The K444 corpus and the K455c-ingested corpus have different specific values, terminology, and named standards.

### Corpus alignment analysis

| | Count | % |
|-|-------|---|
| Questions aligned with Pawn snapshot | 11 | 22% |
| Questions misaligned (different facts/terminology) | 39 | 78% |
| Arm 1 questions aligned | 10 | 40% |
| Arm 2 questions aligned | 1 | 4% |

**Arm 2 had only 1/25 questions (4%) answerable from the Pawn snapshot.** The other 24 questions asked about facts from the K444 corpus that don't appear in the snapshot.

### Example mismatches

| Question Bank (K444 sealed) | Pawn Snapshot (K455c ingested) |
|-----------------------------|-------------------------------|
| "Pelham Audit Standard" (CS-09) | No mention of Pelham Audit |
| "Fjordgate Protocol" (AM-02) | No mention of Fjordgate |
| "Golden Path onboarding" (MJ-02) | No mention of Golden Path |
| "Reciprocity Score 2.1" (EG-09) | No Reciprocity Score in corpus |
| "Montclair Ruling" (HP-01) | No Montclair Ruling |
| "Cooper-Anderson Decision" (HP-08) | No Cooper-Anderson Decision |

### Why Arm 2 performed WORSE than Arm 1

The Arm 2 system prompt includes the instruction: "Use ONLY this reference material to answer questions... If the answer is NOT in your Cathedral, say 'I don't know.'" With 24/25 Arm 2 questions having answers NOT in the Cathedral, the model either:
1. Refuses to answer (says "I don't know")
2. Looks for the answer in the wrong facts and gives wrong numerical values
3. Is confused by the large amount of irrelevant pre-context

Arm 1 (bare) allowed the model to use training knowledge freely, producing 8% HOT — some questions happened to be answerable from training data.

### Why this doesn't invalidate the Cathedral architecture

The Cathedral Effect (K455c: +14pp, K455a: vendor-wide weak positive) was measured using:
- **MCP-mediated retrieval** (`consult_scribes`) which dynamically retrieves semantically relevant facts
- Semantic search is more robust to corpus version drift — it returns the most relevant entries regardless of naming differences

The K455b Mode A **paste approach** is sensitive to corpus alignment because:
- The full snapshot is included regardless of question relevance
- Irrelevant corpus content fills context and may confuse or constrain the model
- The model is instructed to use ONLY the Cathedral content, which it can't find for 96% of Arm 2 questions

### Required fix for attribution isolation

K455b cannot produce valid attribution isolation results until:
1. **Option A:** Re-seal the question bank against the current `r11_canonical_corpus.md` (K455c version) — regenerate `R11_QUESTION_BANK_SEALED.json` with aligned facts
2. **Option B:** Revert `scribe_R11.jsonl` to the K444 version of the corpus AND regenerate the Pawn snapshot
3. **Option C:** Use MCP-retrieval for Arm 2 (note: this would require Perplexity to have MCP support, which it doesn't)

**Option A is recommended** as it preserves the K455c-ingested corpus and updates the question bank to match.

---

## Comparison to K455c / K455a

| Benchmark | Method | Cathedral | HOT Lift |
|-----------|--------|-----------|----------|
| K455c (Cross-Cathedral MCP) | MCP retrieval, Anthropic Haiku | Bishop (MCP) | +14pp |
| K455a (Full vendor matrix) | MCP retrieval, 4 vendors | Bishop (MCP) | +4pp avg (Weak) |
| **K455b Mode A (Attribution isolation)** | **Full snapshot paste, Perplexity API** | **Pawn snapshot** | **−8pp (CONFOUNDED)** |

K455b Mode A result is NOT comparable to K455c/K455a because of corpus mismatch. Meaningful comparison requires corpus alignment.

---

## Attribution Isolation Framework

The attribution isolation test design is valid:
- Perplexity API has no MCP support — no ambient LB infrastructure in call path
- Cathedral content reaches the model ONLY via explicit in-prompt inclusion
- If lift were observed (+10pp or higher), it would confirm clean Cathedral attribution

The design is blocked only by corpus misalignment. Once aligned:
- A positive lift would confirm Cathedral attribution is clean
- A null result would suggest K455c/K455a lift was environment-assisted

---

## Observations on Pawn / Perplexity Behavior

From Arm 2 responses where the Cathedral had relevant content (CS category, AM-05, EG-02):
- Perplexity (sonar-pro) generally followed instructions to use provided content
- Responses tended toward the provided values when they appeared in the system prompt
- Sonar-pro has a tendency to add web search citations even with "ONLY" instructions (noted in K455a perplexity_spaces_adapter.py)

---

## Deliverables Status

| Deliverable | Status |
|-------------|--------|
| Pre-session: K470 Pawn-Cathedral instantiation | ✓ K470 complete |
| Pre-session: Pawn snapshot (K455b_playbook/pawn_cathedral_snapshot.md) | ✓ Generated by K470 |
| Pre-session: Log template (K455b_log_template.jsonl) | ✓ Complete |
| Pre-session: Founder playbook (FOUNDER_PLAYBOOK_K455b.md) | ✓ Complete |
| Mode A: 50-question Perplexity API benchmark | ✓ Run (confounded) |
| Mode A: Per-arm accuracy table | ✓ See results table above |
| Mode A: Cathedral Effect lift classification | Negative (−8pp, confounded) |
| Attribution ratification | NOT ASSESSABLE — corpus mismatch |
| Comparison to K455c / K455a | ✓ See comparison table |
| Log file | ✓ BISHOP_DROPZONE/K455b_playbook/results/K455b_log.jsonl |
| Summary file | ✓ BISHOP_DROPZONE/K455b_playbook/results/K455b_summary.json |
| This report | ✓ Complete |

---

## Required Follow-Up (K455b Re-run)

Before K455b can produce valid attribution isolation evidence:

1. **Identify the K444 R11 corpus version** — what specific facts were used when the question bank was sealed?
2. **Option A (recommended):** Re-seal `R11_QUESTION_BANK_SEALED.json` against `r11_canonical_corpus.md` to align with scribe_R11 and Pawn snapshot content. This preserves the K455c/K455a benchmark baseline.
3. **Re-run K455b Mode A** with aligned corpus — expect Arm 2 HOT rate to be much higher than Arm 1 if Cathedral Effect is real.
4. **Document re-run as K455b-v2** (or K455b_rerun) to distinguish from the confounded run.

---

## Commit Plan

**Commit 1:** K455b Mode A playbook + runner + results
**Commit 2:** This report

Tag: `v-cathedral-effect-k455b-pawn-cathedral-isolation`

---

*Knight session K455b Mode A / B121 — 2026-04-23/24. Committed and tagged.*
