---
title: "How It Works — MnemosyneC Canonical Pipeline"
description: "The three salt layers. Canonical pipeline: Spider → Sprite → 9 Specialists → Miner → Saladin → Furnace → Three Fates → Scribe → Detective + Andon. Per-domain isolation. We Don't Give Up on a Question — Federated Andon Cord."
date: 2026-06-15
draft: false
---

# How It Works

**Just Add Salt. How to Get the Right Answer.**

*Substrate Salt + Federation Salt + Human Salt = Right Answer.*

[← Back to homepage](/) · [The Diagnosis](/diagnosis/) · [Constellation / MIC](/constellation/) · [Proofs](/proofs/)

---

## The Three Salt Layers

MnemosyneC answers questions through three cooperative salt layers. Each layer is attempted in order. The system escalates only when necessary.

| Layer | Salt | Source | Speed |
|---|---|---|---|
| 🧂 **Layer 1** | Substrate Salt | Your local verified eblets (HOT retrieval) | Milliseconds |
| 🌌 **Layer 2** | Federation Salt | Constellation peers — other machines in your fleet | Seconds |
| 🩺 **Layer 3** | Human Salt | [The Diagnosis](/diagnosis/) — cooperative peer network | Minutes–hours |

**HOT retrieval always comes first.** If your substrate already has a verified answer to this question, you get it in milliseconds — $0, no inference, no API call. The substrate is the asset. It compounds with every Plow.

---

## The Canonical Plow Pipeline

When a question enters a Plow run, it travels through the full Canonical Pipeline:

```
Spider
  → Sprite (question pre-processor + domain classifier)
    → 9 External Specialists (staggered swarm)
      · Wikipedia · arXiv · OpenAlex · PubMed
      · Domain-specific sources (4 additional by domain)
        → Miner (knowledge extraction + deduplication)
          → Saladin (Adversarial Fence — challenges the answer)
            → Furnace (Integrity Gate — burns inconsistencies)
              → Three Fates (Concordance — 3-voter consensus)
                → Scribe (writes verified eblet to substrate)
                  → Detective + Andon (cross-substrate verification + quality gate)
```

### Each stage, explained plain

**Spider** — Crawls the question space. Identifies what sources are relevant and dispatches fetch jobs.

**Sprite** — Pre-processes the question for domain classification. Assigns the question to one of the 14 MMLU-Pro domains (or general knowledge). This determines which specialists are activated.

**9 External Specialists** — A staggered swarm of 9 parallel source queries. Not all 9 fire for every question — the Sprite's domain assignment determines the mix. Wikipedia and arXiv fire for most academic questions. PubMed fires for health/biology. OpenAlex for research citations. Four domain-specific additional sources by classification.

**Miner** — Extracts candidate knowledge from Specialist results. Deduplicates. Normalizes. Produces a candidate answer pool.

**Saladin (Adversarial Fence)** — Challenges every candidate answer. Acts as the skeptic: "What could be wrong with this?" Filters out answers that don't survive adversarial challenge.

**Furnace (Integrity Gate)** — Burns off inconsistencies. Verifies internal coherence. An answer that contradicts itself doesn't pass the Furnace.

**Three Fates (Concordance)** — The 3-voter consensus layer. Three independent Shadow E-Giant™ passes from different perspective lenses (correctness · consistency · coverage) must agree before an answer proceeds. This is the Andon Cord trigger: if Two-of-Three cannot agree, the Andon fires.

**Scribe** — Writes the verified answer to your substrate as a new Eblet™. SHA256-stamped. Append-only. The substrate grows.

**Detective + Andon** — Cross-substrate verification layer. The Detective checks the new Eblet against existing substrate for contradictions. If a contradiction is found, the Andon Cord fires — the new eblet is quarantined, not written. The substrate stays clean.

---

## Per-Domain Isolation

Each Plow question runs in its own isolated pipeline context. Domain A's Specialists do not contaminate Domain B's results. This is why the BP083 MMLU-Pro run achieved **14/14 domains GREEN** — each domain's questions were processed through domain-appropriate Specialist configurations.

Domain isolation also means: a failed concordance in Business does not affect Chemistry. The Andon quarantine in one domain does not cascade to others.

---

## We Don't Give Up on a Question {#federated-andon}

**The Federated Andon Cord** is MnemosyneC's commitment that no question is silently discarded.

When a question fails concordance at Three Fates, the cooperative escalates:

### Tier 1 — Local Retry
*"Local pipeline could not reach concordance. Retrying with different Specialist configuration."*
- Up to 3 retry attempts with varied Specialist dispatch
- If concordance is reached: eblet written to substrate, question marked GREEN
- If all retries exhausted: escalate to Tier 2

### Tier 2 — Constellation Escalation
*"Local retries exhausted. Escalating to Constellation peers."*
- Question is dispatched to [Constellation](/constellation/) peers (other machines in your fleet)
- Peers have different substrate states — may already have the answer
- If any peer reaches concordance: result propagates back to your substrate
- If Constellation cannot resolve: escalate to Tier 3

### Tier 3 — Human Salt / The Diagnosis
*"Constellation cannot resolve. Escalating to The Diagnosis cooperative peer network."*
- Question enters [The Diagnosis](/diagnosis/) — human cooperative peer network
- Cooperative peers who have experienced or solved this problem respond
- 3-voter concordance at human response layer promotes answer to Seasoning tier
- If The Diagnosis resolves it: human-verified eblet written to substrate

### Honest Quarantine (Tier 3 exhausted)
*"The cooperative has exhausted all tiers. Quarantining. No eblet written."*
- The pipeline does not write a wrong answer to keep the substrate clean
- The question is marked as quarantined in the Plow summary
- No Andon = silent failure. With Andon = honest quarantine. The difference is everything.

**2/70 questions in the BP083 MMLU-Pro run were honestly quarantined. That is the Andon Cord working as designed. We report 68/70 (97.1%) — not 70/70 — because we tell the truth about what the system knows.**

---

## The Substrate Is the Asset

Use Ask in MnemosyneC. Use Claude Desktop. Use Cursor. Use ChatGPT in your browser. Whichever surface you use, the **substrate underneath compounds**. Your knowledge grows. The model is interchangeable. The substrate is what makes any AI smarter — for you, for your work, for the keep.™

Every Plow run adds verified eblets. HOT retrieval on the next Ask costs $0 and takes milliseconds. The substrate gets cleaner over time, not noisier. Failed claims die. Verified+used claims persist. Used-and-verified claims become permanent Stone Tablets.™

---

*How It Works · MnemosyneC · Liana Banyan Corporation*

*[← Back to homepage](/) · [Proofs & Receipts](/proofs/) · [The Diagnosis](/diagnosis/) · [Constellation](/constellation/) · [Download v0.4.1](/download/)*
