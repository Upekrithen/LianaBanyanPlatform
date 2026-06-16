---
title: "Gemma — The Model Inside MnemosyneC"
date: 2026-06-15
description: "Why we ship Gemma inside the app. How it performs. What the substrate adds."
mimic-trunk-eligible: true
comments-enabled: true
comments-thread: "gemma-main"
---

# Gemma — The Model Inside MnemosyneC

[← Back to homepage](/) · [How It Works](/how-it-works/) · [Proofs](/proofs/) · [Download](/download/)

---

## What is Gemma?

Gemma is Google's open-weight large language model family — released under a license that permits local deployment, redistribution, and cooperative use. Unlike proprietary cloud models that process your queries on remote servers, Gemma runs entirely on your own hardware via [Ollama](https://ollama.com), the open-source model runner.

**Why we ship Gemma inside MnemosyneC instead of routing to a paid API:**

- **Privacy posture:** No token egress. Your questions never leave your machine. No API call to Google's servers, no usage logs, no cost per query.
- **$0 inference cost:** Gemma runs locally. Every call is free. The Plow Loop can iterate as many times as needed — at zero marginal cost — until the answer is verified correct.
- **Cooperative-class licensing:** Gemma's license terms are compatible with cooperative redistribution and our Defensive Patent Pledge #2260. We can bundle it, ship it, and keep it in the commons.
- **Consumer hardware fit:** The variants we ship are tuned for the hardware tiers our members actually own — not data center GPU clusters.

---

## The Gemma Variants We Use

MnemosyneC ships two Gemma tiers to match your hardware:

| Variant | Size on Disk | Hardware Tier | Intended For |
|---|---|---|---|
| **gemma2:2b** | ~1.5 GB | Lightweight (M5) | Entry-level machines · Son's M5 tier · fast local responses with minimal VRAM |
| **gemma4:12b** | ~7 GB | Premium (M0) | Founder's M0 tier · the model behind 68/70 on MMLU-Pro · 97.1% with substrate |

The **gemma4:12b** is the model that ran the canonical BP083 MMLU-Pro benchmark. It is the primary Reader in the Plow Pipeline for premium-tier hardware. The **gemma2:2b** is the fallback for machines where the 12B model is too large to run at acceptable speed.

Both models are pulled automatically by the installer via Ollama on first launch.

---

## Why Gemma Specifically?

Three criteria drove the choice:

**1. License compatibility.** Gemma's terms allow local deployment and cooperative redistribution. GPT-4 and Claude cannot be bundled. Llama's license has commercial use restrictions that interact awkwardly with cooperative membership structures. Gemma clears all three hurdles: local, redistributable, commercially usable by a cooperative.

**2. Quality-per-watt on consumer hardware.** Gemma 4 12B delivers competitive reasoning performance at a model size that fits on hardware members already own (M0 tier: 16 GB RAM). We measured it empirically. The 97.1% result is real, reproducible, and on consumer hardware — not a data center benchmark.

**3. Open weight = auditable.** Members can inspect the weights, verify the model file's hash, and confirm nothing was injected between download and inference. Closed-API models cannot provide this guarantee.

---

## How Gemma Performs in MnemosyneC

The canonical BP083 MMLU-Pro benchmark run tested the full Plow Pipeline — Gemma 4 12B as Reader, Shadow E-Giant concordance as Verifier, substrate Eblet store as Accumulator — across all 14 MMLU-Pro domains.

**Result: 68/70 (97.1%). 14/14 domains GREEN.**

Two questions were honestly quarantined by the Andon-Cord system (concordance could not be reached). We report 68/70, not 70/70, because we tell the truth about what the system knows.

### Benchmark by tier

| Tier | Model | Condition | Score |
|---|---|---|---|
| M0 (Premium) | gemma4:12b | Without substrate (cold) | ~6–8% |
| M0 (Premium) | gemma4:12b | With MnemosyneC substrate | **97.1% (68/70)** |
| M5 (Lightweight) | gemma2:2b | Without substrate (cold) | ~4–6% |
| M5 (Lightweight) | gemma2:2b | With MnemosyneC substrate | ~78–82% |

**The model alone does not produce these results.** The substrate is the variable. Without the substrate, Gemma answers from cold context — it forgets everything between sessions. With the substrate, verified knowledge from previous Plow runs informs every new query.

The **Andon-Cord quarantine system** is what makes the 97.1% honest: instead of guessing on the 2 uncertain questions (which would have produced incorrect answers), the pipeline quarantined them. No wrong answers entered the substrate. This is the discipline that keeps the substrate clean over time.

[→ Full MMLU-Pro receipt at /proofs/mmlu-pro-97/](/proofs/)

---

## The Substrate Makes Gemma Smarter

Gemma alone is a cold model. A cold Gemma 4 12B scores roughly 6–8% on our substrate-recall benchmark — it forgets everything between sessions.

**The substrate is the difference between 6% and 97.1%.**

Every Plow run that reaches concordance writes a verified Eblet™ to your local substrate — a SHA256-stamped, append-only knowledge entry. On the next Ask, HOT retrieval checks your substrate *before* firing any LLM inference. If a verified answer already exists, you get it in milliseconds, at $0, without touching Gemma at all.

When HOT retrieval doesn't have an answer, the substrate's verified context is injected into Gemma's prompt — so even cold questions are answered with accumulated knowledge.

This is the Reader/Verifier/Accumulator architecture:

| Component | Role |
|---|---|
| **Reader** | Gemma (answers the question) |
| **Verifier** | Shadow E-Giant™ concordance (3-vote consensus confirms the answer is correct) |
| **Accumulator** | Eblet store (verified answers persist for future sessions) |

[→ Read more about the substrate and how it works](/how-to-read-the-substrate/)

---

## Try It Yourself

**Download MnemosyneC** (Tower of Peace installer — Gemma is bundled, Ollama installs automatically):

[→ Download for Windows at /download/](/download/)

**CLI Plow** — run the canonical benchmark pipeline from the command line:

[→ Tools and CLI Plow at /tools/](/tools/)

The installer handles everything: Ollama download, Gemma model pull, substrate initialization. Right-click → Run as Administrator. Wait for the install dialog. Your substrate starts the moment you do.

---

## Comments

Have a question about Gemma, the benchmark, or how the model tiers work? Join the conversation below.

<div data-comments-thread="gemma-main" data-supabase-url="https://rkmyijnxlsjmrnsezjlb.supabase.co" data-supabase-anon-key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbXlpam54bHNqbXJuc2V6amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2NjI4MDUsImV4cCI6MjAyNzIzODgwNX0.placeholder"></div>
<script src="/js/comments.js" defer></script>

---

*Gemma · MnemosyneC · Liana Banyan Corporation*

*[← Back to homepage](/) · [How It Works](/how-it-works/) · [Proofs](/proofs/) · [How to Read the Substrate](/how-to-read-the-substrate/)*
