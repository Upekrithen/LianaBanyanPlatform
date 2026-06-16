---
title: "How to Read the Substrate"
date: 2026-06-15
description: "The verified-knowledge accumulator inside MnemosyneC. Cures AI Amnesia."
mimic-trunk-eligible: true
comments-enabled: true
comments-thread: "substrate-main"
---

# How to Read the Substrate

[← Back to homepage](/) · [How It Works](/how-it-works/) · [Gemma](/gemma/) · [Proofs](/proofs/)

---

## The Substrate, Plain English

The substrate is your **verified-knowledge accumulator**.

It is not a database. It is not a vector store. It is not a model. It is a flat file — an append-only JSONL — where every entry (called an **Eblet™**) is a verified-correct answer that your Plow Pipeline earned through the full Reader/Verifier/Accumulator cycle.

The substrate lives on your machine. It is SHA256-stamped. It cannot be altered — only appended. You can open it with any text editor and read every entry. You can verify the hash with standard command-line tools. You do not have to trust us.

**The canonical pipeline earns an eblet through these gates:**

1. **Reader** (Gemma) answers the question
2. **Verifier** (Shadow E-Giant™ concordance — 3 independent votes) confirms the answer is correct
3. **Scribe** writes the verified answer to the substrate as a new Eblet
4. **Detective + Andon** cross-checks against existing substrate for contradictions — quarantines if conflict is found

Only answers that clear all four stages enter the substrate. Wrong answers die at concordance. Contradictions are quarantined. The substrate gets cleaner over time, not noisier.

---

## The Three Layers: Hot, Warm, and Catacombs

Every eblet in the substrate lives in one of three temperature tiers:

### 🔥 Hot (Actively Queried)

Hot eblets are the ones you've asked about recently — or that other members in your Constellation fleet have been asking about. They carry strong pheromone signals. When you Ask a question, HOT retrieval checks this tier first, in milliseconds, at $0.

**HOT hits cost nothing and take no inference.** The substrate already has the answer. This is the 97.1% path.

### 🌡 Warm (Pheromone-Fading)

Warm eblets are verified-correct answers that haven't been queried recently. Their pheromone signal is fading. They're still in the substrate, still accessible, still correct — but if nothing refreshes them, they'll eventually transition to Cold.

Pheromones have a half-life. This is by design. The substrate doesn't accumulate stale knowledge indefinitely. Old guesses die naturally.

### ❄ Cold / Catacombs (Entombed but Accessible)

Cold eblets are answers that have fully faded from active pheromone tracking. They're "entombed" — not deleted, not removed, but no longer in the live query path. The Catacombs are the substrate's long-term archive.

When a query arrives that could match a cold eblet, the Detective can surface it — but it requires a deeper retrieval path than HOT. If the cold answer is confirmed again through concordance, it re-warms.

**Nothing in the substrate is ever deleted.** Append-only means append-only.

---

## How the Substrate Gets Smarter

Every Plow run that reaches concordance adds a new eblet. Each session compounds the last.

The compounding mechanism:

1. **Plow Loop writes only verified-correct answers.** Failed concordance = no write. Contradicted answers = quarantine. The substrate is not a scratchpad.
2. **HOT retrieval beats cold reasoning.** The next time the same or similar question arrives, the substrate answers without touching the model. Zero cost. Milliseconds.
3. **Federation multiplies the effect.** Other machines in your Constellation fleet share substrate state (with your permission). Answers one node earned are available to the fleet. The cooperative substrate grows faster than any individual substrate.
4. **Stone Tablets harden the canon.** When an eblet has been confirmed enough times by enough nodes over enough time, it gets promoted to **Stone Tablet™** status — immutable, permanent, load-bearing canon. Stone tablets don't decay. They are the truth the network has earned together.

The substrate is how a local 7-GB model achieves 97.1% on a 70-question benchmark. The model didn't change. The substrate grew.

---

## Why the Substrate Cures AI Amnesia

Standard AI models have no session persistence. Every time you start a new conversation, the model forgets everything. Your projects, your context, your corrections — gone.

The substrate changes this:

| Without Substrate | With Substrate |
|---|---|
| Model forgets every session | Verified answers persist across all sessions |
| Repeat questions = repeat inference cost | Repeat questions = HOT retrieval, $0 |
| Wrong answers can re-appear | Wrong answers are quarantined, never written |
| Knowledge is centralized in provider servers | Knowledge is yours, on your machine |
| Accuracy depends on training data | Accuracy compounds with every Plow run |

**The substrate is yours. SHA256-stamped. Append-only. Federated with anyone you choose. Free to copy if you want to fork.**

---

## What Composes with the Substrate

The substrate is the accumulator layer. It works with:

| Component | Role |
|---|---|
| **[Gemma](/gemma/)** | The Reader — answers questions, feeds the Plow Pipeline |
| **Shadow E-Giant™** | The Verifier — 3-vote concordance before anything writes |
| **[Constellation / MIC](/constellation/)** | Federation Node Frontier — shares verified answers across your fleet |
| **Six-folder layout** | Local file structure: Hot · Warm · Catacombs · Quarantine · Tablets · Index |
| **Plow CLI** | Command-line interface for running Plow runs on your own dataset |

The six-folder layout on disk:

```
~/.mnemosynec/substrate/
  hot/          ← active pheromone eblets
  warm/         ← fading pheromone eblets
  catacombs/    ← entombed, accessible via Detective
  quarantine/   ← failed concordance, never promoted
  tablets/      ← Stone Tablets, permanent canon
  index.jsonl   ← master index, append-only, SHA256-stamped
```

---

## Receipts

The substrate claims are empirically backed:

**68/70 (97.1%) on MMLU-Pro — disk-backed receipt**

A full 70-question MMLU-Pro benchmark run (BP083) with Gemma 4 12B + MnemosyneC substrate. 14/14 domains GREEN. 2 honest quarantines (Andon-Cord working as designed). The receipt is disk-backed: the actual substrate JSONL from the run, with all eblets SHA256-stamped, is preserved and auditable.

[→ See all proofs at /proofs/](/proofs/)

**6% → 78%: Free local model lift (BP065 Benchmark R10)**

A free, local Ollama model (Llama 3.1 8b) went from 6% to 78% accuracy on the same benchmark — no retraining, just substrate context injection. Cohen's κ = 0.936. Three independent raters. Hash-verified.

[→ Benchmark R10 receipt at /proofs/benchmark/](/proofs/)

---

## Comments

Questions about the substrate architecture, the six-folder layout, or how eblets are structured?

<div data-comments-thread="substrate-main" data-supabase-url="https://rkmyijnxlsjmrnsezjlb.supabase.co" data-supabase-anon-key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbXlpam54bHNqbXJuc2V6amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2NjI4MDUsImV4cCI6MjAyNzIzODgwNX0.placeholder"></div>
<script src="/js/comments.js" defer></script>

---

*How to Read the Substrate · MnemosyneC · Liana Banyan Corporation*

*[← Back to homepage](/) · [Gemma](/gemma/) · [How It Works](/how-it-works/) · [Download](/download/)*
