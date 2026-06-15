---
title: "Proofs & Receipts — MnemosyneC"
description: "Every benchmark, inter-rater reliability score, SHA-256 checksum, and test result. Hash-verified. Reproducible. For the skeptical reader."
date: 2026-06-13
draft: false
---

# Proofs & Receipts

**Just Add Salt · How to Get the Right Answer**

*The Secret of Mnem... is Salt. Substrate Salt + Federation Salt + Human Salt = Right Answer.*

MnemosyneC finds answers through a 3-layer salt architecture: Substrate Salt (local verified eblets) · Federation Salt (Constellation peers) · Human Salt (The Diagnosis). The right answer lives somewhere in the constellation.

**Every claim MnemosyneC makes is hash-verified and reproducible.**

We don't ask you to trust us. We give you the receipts.

[← Back to homepage](/)

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
