---
title: "Proofs & Receipts — MnemosyneC"
description: "68/70 MMLU-Pro. 97.1%. Hash-verified. Reproducible. Truth-Always: we measured 68/70, not 70/70. The 2 Andon quarantines are the cooperative quality gate working correctly."
date: 2026-06-15
draft: false
---

# Proofs & Receipts

**Just Add Salt · How to Get the Right Answer**

*The Secret of Mnem... is Salt. Substrate Salt + Federation Salt + Human Salt = Right Answer.*

MnemosyneC finds answers through a 3-layer salt architecture: Substrate Salt (local verified eblets) · Federation Salt (Constellation peers) · Human Salt (The Diagnosis). The right answer lives somewhere in the constellation.

**Every claim MnemosyneC makes is hash-verified and reproducible.**

We don't ask you to trust us. We give you the receipts.

[← Back to homepage](/) · [The Diagnosis](/diagnosis/) · [Constellation / MIC](/constellation/)

---

## Truth-Always: We Didn't Claim 70/70 {#truth-always}

We measured **68/70 (97.1%)**. The 2 questions that did not produce a new verified fact were **quarantined by the Andon Cord** — the cooperative-class self-policing mechanism that refuses to write uncertain answers to the substrate.

**We did not claim 70/70. We measured 68/70. The 2 quarantines are the Andon Cord working as designed.**

This is the cooperative-class commitment: accurate measurement over vanity metrics. If the pipeline is uncertain, it says so. If it can't reach 3-voter concordance, it stops and quarantines rather than writing potentially wrong data. The substrate stays clean because we tell the truth about what we know.

### What the Andon Cord quarantine means

When the MnemosyneC Canonical Plow Pipeline reaches the Three Fates (concordance layer) and cannot achieve 3-voter consensus after all retry attempts, the question is **quarantined** — not answered, not written to substrate. The system:

1. Logs the quarantine (visible in the Plow run summary)
2. Does NOT write any new eblet for that question
3. Does NOT increment the "success" count
4. Reports it honestly: "2 Andon quarantines (correct behavior)"

The Business and Economics domain quarantines in the BP083 MMLU-Pro run mean: the pipeline encountered questions where three independent verification passes could not converge on a single correct answer. The correct response was to stop, not to guess.

**Quarantine rate: 2/70 = 2.9% — this is the cooperative quality gate, not a failure.**

### Reproducibility

Any MnemosyneC user with Ollama + `gemma4:12b` + v0.4.0+ and an internet connection can reproduce this benchmark:

- Run **Plow the Field** with all 14 MMLU-Pro domains, Questions per domain = 5
- Observe your own pass/quarantine split
- Compare substrate eblet counts

Reproducibility kit: [github.com/liana-banyan/lb-reproducibility-pack](https://github.com/liana-banyan/lb-reproducibility-pack)

---

## v0.4.0 Architectural Milestone Receipt {#v040-milestone}

The BP083 MMLU-Pro run was performed on **v0.4.0** architecture — the first release with:

- **MIC (Machine In Charge)** — any machine in the fleet can conduct a Plow
- **Federated Andon Cord** — 3-tier escalation (local quarantine → Federation re-run → Human Salt / The Diagnosis)
- **The Diagnosis primitive** — Human Salt layer, peer-reviewed answer surface
- **Pinch / Seasoning / Preserved-in-Salt** persistence tiers live in substrate logic
- **Salt taglines** live across all major UI surfaces
- **Provisional 22 in flight** covering 17+ canonical Plow Cycle innovations

v0.4.1 (current) adds WAN+LAN Constellation support and the Glow mechanic bounty-surfacing. Auto-update corrected (cephas latest.yml split-brain resolved).

---

## MMLU-Pro 97.1% — Canonical Plow Receipt (BP083) {#mmlu-pro-97}

**68/70 MMLU-Pro questions answered with verified facts. 14/14 domains GREEN. Consumer hardware. No API keys.**

### Summary

| Metric | Value |
|---|---|
| Hardware | Consumer machine (M0) |
| Model | gemma4:12b · Ollama · local · no paid keys |
| Questions plowed | 70 (5 × 14 domains) |
| Questions with new verified facts | **68 / 70 = 97.1%** |
| Domains GREEN | **14 / 14** |
| Andon quarantines (correct) | 2 |
| Substrate eblets grown | **316** |
| Wall-clock | ~70 minutes |

*Founder M0 empirical receipt · 2026-06-15 ~01:47 AM*

[→ Full receipt with domain breakdown](/proofs/mmlu_pro_97/)

---

## Benchmark R10 (BP065) {#benchmark-r10}

**A free, local Ollama model jumped from 6% to 78% accuracy. No retraining. Just substrate.**

### What we tested

- **Baseline model:** qwen2.5:0.5b via Ollama — free, local, no API key
- **Method:** 100-question evaluation set across factual recall, reasoning, and knowledge synthesis tasks
- **Condition A (baseline):** Model answers with no substrate context
- **Condition B (Caithedral™ Core applied):** Same model, same questions — substrate-informed retrieval injected before inference

### Results

| Metric | Value |
|---|---|
| Baseline accuracy | 6% |
| Caithedral™ Core accuracy | 78% |
| Gain | +72 percentage points (range: +72–83 pp across question types) |
| Inter-rater reliability | Cohen's κ = 0.936 |
| Rater count | 3 independent raters |

**Cohen's κ = 0.936** means near-perfect agreement between raters — this is not a noisy measurement.

### Reproducibility

The benchmark evaluation set, rater instructions, and raw results are hash-verified in BP065. SHA-256 hash available on the [GitHub release page](https://github.com/liana-banyan/mnemosyne/releases).

*"Cached knowledge beats cold reasoning."* — Six Pillars, MnemosyneC

---

## Storm Test (BP067) {#storm-test}

**3 cloud services failed simultaneously. MnemosyneC kept working.**

### What happened

A controlled resilience test simulated simultaneous failure of three external cloud dependencies during active mesh operation. MnemosyneC's Caithedral™ Federation Protocol maintained full mesh consensus throughout.

### Results

| Metric | Value |
|---|---|
| Nodes in test | 20 |
| Mesh latency (p50) | 16.6 ms |
| Latency during failure window | Maintained (no degradation) |
| Services failed | 3 simultaneous |
| Consensus maintained | Yes |

### Why this matters

The cooperative is designed so that no single point of failure can take you down. Your substrate lives on your machine. The mesh operates peer-to-peer. When cloud services fail, your knowledge stays intact.

*Hash-verified: BP067*

---

## Mesh Proof (BP067) {#mesh-proof}

**20 nodes. 16.6 ms p50. Peer-to-peer. No central server.**

### What we tested

Caithedral™ Federation Protocol (CFP) — the peer mesh underlying cooperative substrate sync — tested at 20 concurrent nodes.

### Results

| Metric | Value |
|---|---|
| Node count | 20 |
| p50 latency | 16.6 ms |
| Architecture | Peer-to-peer (UDP multicast) |
| Central server required | No |
| Single point of failure | None |

The mesh scales cooperatively. Adding nodes increases resilience. Your data only propagates to nodes you explicitly authorize.

*Hash-verified: BP067*

---

## Architecture Proof {#architecture}

**Your entire knowledge store is a flat file you can audit yourself with standard tools.**

### The substrate format

Every Eblet™ record stored by MnemosyneC is:

- **Append-only JSONL** — new records are appended, never overwritten
- **SHA256-stamped** — each record includes a hash of its content
- **Human-readable** — open it in any text editor
- **Portable** — copy it to any machine, import into any compatible tool

### One path. No black box.

The substrate lives at a single known path on your machine. You can:

1. Open it with any text editor
2. Verify any record's SHA256 hash with `sha256sum` (Linux/Mac) or `Get-FileHash` (Windows)
3. Count every record yourself
4. Confirm no record was deleted (append-only by protocol)
5. Export your entire substrate as a zip — one command

### Binary integrity

MnemosyneC Windows builds are code-signed. Before running any installer, verify:

```powershell
Get-FileHash MnemosyneC-Setup-0.1.60.exe -Algorithm SHA256
```

Compare to the hash on the [GitHub release page](https://github.com/liana-banyan/mnemosyne/releases/tag/v0.1.60).

---

## Methodology Notes

**Inter-rater reliability:** All benchmark evaluations use at least 3 independent raters with blind scoring (raters do not know whether they are evaluating baseline or Caithedral™ Core output). Cohen's κ measures pairwise agreement.

**Hash verification:** Every benchmark session produces a SHA-256 hash of the full evaluation dataset + results. These hashes are recorded in Banyan Protocol (BP) session documents, which are time-stamped and append-only.

**Reproducibility claim:** Any researcher with access to the evaluation set, the substrate snapshot, and qwen2.5:0.5b via Ollama can reproduce Benchmark R10 results independently. Evaluation set available on request via [hello@lianabanyan.com](mailto:hello@lianabanyan.com).

---

*Proofs & Receipts &middot; MnemosyneC &middot; Liana Banyan Corporation*

*[← Back to homepage](/) &middot; [Download](/download/) &middot; [Community](/community/)*
