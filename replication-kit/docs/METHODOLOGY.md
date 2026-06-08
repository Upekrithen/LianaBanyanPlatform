# Methodology -- Staggered Swarm Substrate Benchmark (BP077)

**Date:** 2026-06-07
**Session:** Blueprint Session 077 (BP077)
**Canonical URL:** https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/bp077-substrate-proof-v1

---

## Overview

BP077 tests the **substrate-uplift hypothesis**: that a dose-metered knowledge layer (the r10v3 distilled substrate, <=2KB) fed as a system prompt to a local language model improves factual accuracy on domain-specific questions, compared to a no-substrate baseline.

The benchmark uses the **Staggered Swarm** pipeline -- a cooperative retrieval architecture where multiple domain-specialized Operator agents run in parallel, gathering eblets (atomic knowledge units) and producing a concordance-weighted attribution.

---

## 1. Staggered Swarm approach

### What it is

The Staggered Swarm is a parallel Operator dispatch architecture with per-domain isolation. For each question:

1. A **hardness qualifier** scores the question's domain difficulty and assigns a Tier (1-3).
2. Based on the Tier, 3-8 domain Operator agents are recruited.
3. Operators are dispatched in a **staggered cadence** (not all-at-once burst) to avoid rate-limit pressure.
4. Each Operator queries the Ollama local model with the substrate pre-loaded and returns an attribution + supporting text.
5. Attributions are **clustered** into independent groups (derivative sources are collapsed -- no popularity-contest inflation).
6. The final answer is the highest-weighted cluster attribution, evaluated against 4 gates.

### Per-domain isolation

Each domain's swarm is completely independent. A `physics_constant` question uses only physics Operators; a `literary` question uses only literary Operators. No cross-domain contamination occurs -- rate-limit bursts, sleep accumulation, and eblet clusters do not bleed across domain boundaries.

### FireGuard pattern

Operators are dispatched with staggered start times (not simultaneous), preventing burst-mode API hammering against the local Ollama server.

---

## 2. r10v3 substrate

The **r10v3 distilled substrate** (`substrate/r10v3_distilled_substrate_bp076.md`) is a <=2KB knowledge layer containing:
- Liana Banyan cooperative identity primitives
- Canonical numbers (creator keep 83.3%, platform margin Cost+20%, etc.)
- The Sweet Sixteen initiative list
- Three-gear currency definitions
- Behavioral doctrine (Truth-Always, Heart of Peace)

This substrate is prepended as the system prompt for every Operator call. It is NOT a general-knowledge injection -- it is a cooperative identity binding that keeps model behavior aligned with the platform's epistemological discipline.

The substrate was distilled in BP076 from the 15,138-byte r9v2 packet. The distillation strips legal/operational depth and retains only the load-bearing identity primitives that affect model behavior on benchmark questions.

**Source:** BP076 Phase 2 Redesigned Substrate Methodology Spec (Asteroid-ProofVault)

---

## 3. Operator rosters

Operator rosters are the per-domain sets of agent definitions that the Staggered Swarm recruits. Each roster defines:
- Domain scope (which question categories this roster covers)
- Number of Operators per Tier (Tier 1: 3 Operators, Tier 2: 5 Operators, Tier 3: 8 Operators)
- Repository classes each Operator targets (Wikipedia, Wikidata, primary texts, structured knowledge bases, etc.)
- Source-class reputation weights (0.70-0.99 scale)

Rosters are defined **inline** in `truth_single_giants_bp077.py` -- there are no separate roster files. The harness covers 10 domains:
- `literary`, `historical`, `mathematical`, `geodata`, `art`, `chemistry`
- `music`, `physics_constant`, `bio_historical`, `linguistic_geo`

---

## 4. 50-question bank

The `questions/q_bank_bp077.jsonl` contains 50 questions (one per line, JSON format). The canonical source is `questions/bp077_phase7_q50_bank.json` (array format).

**Domain distribution (10 domains, 50 questions):**
| Domain | Count |
|---|---|
| literary | 5 |
| historical | 3 |
| mathematical | 3 |
| geodata | 6 |
| art | 5 |
| chemistry | 3 |
| music | 3 |
| physics_constant | 4 |
| bio_historical | 6 |
| linguistic_geo | 4 |
| **Total** | **50** (confirmed) |

---

## 5. Banyan Metric Value (BMV)

The **Banyan Metric Value** is a composite quality score (0-100) measuring:
1. Number of independent clusters (source independence)
2. Specialists consulted (>= 5 in swarm-calibrated mode)
3. Eblets gathered (>= 15 raw eblets in swarm-calibrated mode)
4. Source-class diversity
5. Primary-text presence
6. Concordance level
7. Derivative pairs collapsed
8. Latency

BMV >= 60 is the passing threshold (Gate 3). A score of 100 means all 8 dimensions are fully satisfied.

---

## 6. Verification criteria (what counts as a pass)

A question **passes** (`all_pass=true`) when ALL 4 gates are satisfied:
- **G1 (gate_fact):** The swarm extracted a factual attribution (concordance != "UNKNOWN")
- **G2 (gate_conc):** Concordance level is ABSOLUTE, HIGH, or MEDIUM (multiple independent clusters agree)
- **G3 (gate_bmv):** BMV score >= 60
- **G4 (gate_latency):** Total pipeline wall-clock time <= 45 seconds

---

## 7. Reproducibility gate

Per the NYT standard: **empirical proof-in-the-wild is the gate.** This kit enables any external party to clone, run, and verify that the pipeline produces matching results within rate-limit variance (5-10% tolerance). The swarm proof documents in `receipts/` are the published ground truth.
