---
title: "Substrate Awakens Constellation Receipt — 12-Blade Plow"
status: "founder-ratify-pending"
session: "BP084"
plow_version: "12blade-bp084"
question_bank_sha: "e79142cf"
date: "[DATE TBD — fill after constellation run]"
note: "AWAITS LIVE RECEIPT NUMBERS — placeholders below"
---

# SUBSTRATE AWAKENS CONSTELLATION RECEIPT · BP084

**Status: `founder-ratify-pending`**  
This template AWAITS the live receipt numbers from the mesh constellation run.  
DO NOT publish until Founder ratifies after constellation completes.

---

## Headline

> **[X_CORRECT] / [Y_ANSWERED] on [Z_TOTAL] questions across [N_PEERS] peers**

- Accuracy: `[ACCURACY_PCT]%` (answered only, quarantine excluded)
- Constellation date: `[DATE TBD]`
- Runtime: `[TOTAL_WALL_TIME]`

---

## TIC-Distinguished Results

| Category | Count | % of Total |
|----------|-------|-----------|
| **KNOWN** entries minted | `[N_KNOWN]` | `[N_KNOWN / Z_TOTAL * 100]%` |
| **THEORIES_OPEN** with consequence-trail survival scores | `[N_OPEN]` | — |
| **ELIMINATED** with contradiction trails | `[N_ELIM]` | — |
| **Quarantined** (Andon-Cord self-policing) | `[N_QUAR]` | `[N_QUAR / Z_TOTAL * 100]%` |
| **Consequence probes** minted (blade 10) | `[N_CONSEQ_PROBES]` | — |
| **Contradiction trail eblets** (blade 11) | `[N_CONTRA_EBLETS]` | — |
| **Downstream flags** (blade 12) | `[N_DOWNSTREAM]` | — |

---

## Per-Domain Breakdown

| Domain | Correct / Total | Accuracy | KNOWN | THEORY_OPEN | ELIMINATED | Quarantined |
|--------|----------------|----------|-------|-------------|------------|-------------|
| math | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| chemistry | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| law | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| physics | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| engineering | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| cs | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| biology | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| business | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| economics | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| philosophy | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| history | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| psychology | [X/Y] | [N]% | [N] | [N] | [N] | [N] |
| **TOTAL** | **[X/Y]** | **[N]%** | **[N]** | **[N]** | **[N]** | **[N]** |

---

## Per-Peer Breakdown

| Peer | Model | Questions | Correct | Quarantined | Accuracy | Runtime | KNOWN | THEORY_OPEN | ELIMINATED |
|------|-------|-----------|---------|-------------|----------|---------|-------|-------------|------------|
| M0 (Founder) | gemma4:12b | ~500 | [N] | [N] | [N]% | [Nh Nm] | [N] | [N] | [N] |
| M1 | gemma4:12b | ~250 | [N] | [N] | [N]% | [Nh Nm] | [N] | [N] | [N] |
| M2 | gemma4:12b | ~350 | [N] | [N] | [N]% | [Nh Nm] | [N] | [N] | [N] |
| M3 | gemma4:12b | ~250 | [N] | [N] | [N]% | [Nh Nm] | [N] | [N] | [N] |
| M5 | gemma2:2b ⚠️ | ~250 | [N] | [N] | [N]% ⚠️ | [Nh Nm] | [N] | [N] | [N] |
| Reserve | gemma4:12b | ~150 | [N] | [N] | [N]% | [Nh Nm] | [N] | [N] | [N] |

⚠️ M5 uses gemma2:2b — model substitution AMBER. Accuracy figures for M5 are not directly
comparable to gemma4:12b peers.

---

## Code Breakers Guild

| Metric | Count |
|--------|-------|
| Claims advanced to Code Breakers queue | `[N_CB]` |
| Eliminations confirmed (Negative-Knowledge Tokens earned) | `[N_NEG]` |
| Code Breaker eblets written to vault | `[N_CB_EBLETS]` |

---

## Comparison to 68/70 Canonical

**IMPORTANT: These are NOT directly comparable figures.**

| Dimension | 68/70 Canonical | This Constellation |
|-----------|----------------|-------------------|
| Question bank | 1,400-q distributed-eval bank | Substrate Awakens fresh bank (SHA e79142cf) |
| Blade count | 1-blade (dispatch + adjudicate) | 12-blade (full TIC pipeline) |
| TIC output | None | KNOWN / THEORY_OPEN / ELIMINATED distinguished |
| Consequence tracing | None | Blade 10 survival scores |
| Elimination verification | None | Blade 11 BM25 contradiction search |
| Dependency propagation | None | Blade 12 review queue |
| Honest delta (if computable) | — | `[DELTA]` (scope-adjusted, not raw accuracy) |

The 68/70 receipt is the canonical accuracy benchmark for its question bank.
This constellation adds epistemic depth (TIC output) that 68/70 did not produce.
The comparison is honest: different bank, different blade depth.

---

## Reproducibility Block

```
SHA             : e79142cf  (Substrate Awakens question bank)
Plow version    : 12blade-bp084
Model versions  : gemma4:12b (M0/M1/M2/M3/Reserve) · gemma2:2b (M5)
Ollama version  : [ollama --version output TBD]
Chronos         : [CONSTELLATION_TIMESTAMP]
Aggregate file  : constellation_12blade_aggregate.json
Vault path      : Asteroid-ProofVault/state/eblets/active/
Blade telemetry : [peer]_12blade_telemetry.json (per peer)
```

---

## Bedside Read

*[FILL AFTER CONSTELLATION — 2-3 sentences describing the human story of the run:
what the mesh did together, what was discovered, what moved from THEORY_OPEN to KNOWN
or ELIMINATED, and what the Code Breakers now hold.]*

---

## Ratification Block

```
Founder review   : [ ] PENDING
Founder ratified : [ ] — [SIGNATURE / DATE]
Canon eblet minted: [ ] canon_12_blade_plow_constellation_bp084.eblet.md
```

---

*Template authored BP084 · Sonnet 4.6 · Knight (Cursor AI)*  
*DO NOT PUBLISH before Founder ratification.*
