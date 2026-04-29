---
target_publication: reddit.com/r/LocalLLaMA
format: reddit-self-text
anchor: K535-CathedralEffect-3.5pp-HOT-23x-cost
depth: alpha
status: DRAFT — FOUNDER PROSE-PASS REQUIRED BEFORE DISPATCH
filed: 2026-04-29
---

# REDDIT DRAFT — r/LocalLLaMA
## [TITLE CANDIDATES]
### Option A: "Tested same corpus on 5 vendors: 3.5pp HOT spread, 23x cost spread. The cheap model + good substrate beats frontier pricing."
### Option B: "Cathedral Effect: cross-vendor empirical receipt — model selection matters less than you think when the retrieval layer is right"

---

*[α skeleton — ~700 words framework.]*

---

## Opening Hook

r/LocalLLaMA is the right community for this, because you already understand the instinct: a good cheap model with the right context beats a bad expensive model with no context. This post has receipts for exactly that.

---

## The K535 Cross-Vendor Benchmark

Five vendors. Same corpus (R11-v3-RICH-FACT, 150 facts, 6 categories). Same retrieval architecture. 200 questions, 5 retrieval conditions per vendor.

| Metric | Value |
|---|---|
| Best vendor HOT% | 86.5% |
| Worst vendor HOT% | 83.0% |
| Spread | **3.5pp** |
| Cheapest tier $/HOT | ~$0.004 |
| Most expensive tier $/HOT | ~$0.09 |
| Cost spread | **23x** |

Three and a half percentage points separates best from worst. Twenty-three times cost separates cheapest from most expensive.

The Cathedral Effect tightened the HOT spread to 3.5pp. Without substrate-layer architecture, vendor HOT spreads blow out to 30-54pp. The substrate is doing the equalization work.

*[ANCHOR: K535 5-vendor benchmark — all receipts are Stone-Tablet-preserved, Brynjolfsson-methodology-mirrored.]*

---

## What the Substrate Is (Skeleton)

The "Cathedral Effect" is the name for the empirical phenomenon: a shared retrieval substrate — indexed canonical knowledge, sub-millisecond retrieval, Conductor routing — equalizes vendor performance at fraction of frontier cost.

**Pheromone Substrate (#2317):** stigmergic index, 21-51x faster than RPC. Sub-ms per lookup.
**Conductor's Baton (#2277):** routes queries to cheap models for simple retrieval, expensive models only for high-complexity. Result: Haiku-class performance matching Sonnet-class on benchmarked domains.
**Wrasse Scribe (K540):** pre-injection at session start. 66+ canonical resolutions resolved before any context window opens. Phase E: 41.1% rote-cognition tokens pre-resolved (proxy lower bound).

---

## The Local Model Angle

[FOUNDER: r/LocalLLaMA's specific interest is local/open models. If the Conductor routing can be extended to local models (Ollama, llama.cpp, etc.), that's the direct hook here. The Cathedral substrate pattern is model-agnostic — anything that takes a context window is a valid downstream target for the retrieval layer. Frame this as: "the substrate works with any model; local models become viable options at equivalent-HOT quality when the retrieval layer is properly built."]

---

## Why This Matters for Your Benchmarks

[FOUNDER: Local community frequently debates "which local model is best." The Cathedral Effect receipt suggests that retrieval architecture dominates model selection for knowledge-retrieval tasks. The right response for r/LocalLLaMA is not "which model" but "which substrate" — and that favors local deployment precisely because the substrate can live local too.]

---

## Methodology Note

All runs: Stone-Tablet-preserved, Brynjolfsson-methodology-mirrored, honest-receipt-classified. INDETERMINATE results reported as indeterminate. REFUTED results preserved (K538/K539/K543 panel lineage — failed hypotheses preserved per Stone Tablet Imperative, not deleted).

[FOUNDER: Link to Cephas / Glass Door when firing]

---

## CTA

[FOUNDER: Glass Door / Cephas link + member application note. r/LocalLLaMA community is technical — offer the methodology and receipts for independent replication.]

*Liana Banyan Corporation, Wyoming C-Corp, EIN 41-2797446*

---
**[DRAFT — PUBLICATION GATE HARD — FOUNDER PROSE-PASS + DISPATCH AUTHORIZATION REQUIRED]**
