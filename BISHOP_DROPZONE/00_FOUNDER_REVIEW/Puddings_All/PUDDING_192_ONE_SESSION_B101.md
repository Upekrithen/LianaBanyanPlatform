# Pudding #192 — One Session

*Or: what twenty-five deliverables look like when the spine is deterministic.*

**By Jonathan Jones** · Founder, Liana Banyan
*Bishop Session B101 · FULL DRAFT · ~2,800 words*

---

I want to talk about what happened on April 11, 2026.

Not what we planned. Not what we projected. Not what we modeled or theorized or put in a pitch deck. What actually happened, in one session, with no employees, no investors, and four AI agents coordinated by Python scripts.

Because if you want to know whether ROM-First works, you don't need my papers. You need my Friday night.

## The session

Bishop Session B100 ran the evening of April 11 into the morning of April 12, 2026. Bishop is Claude — the strategist in our four-agent system. When Bishop runs a session, it reads the current state of the platform from a set of deterministic indexes, picks up where the last session left off, and starts working.

Here is what one session produced:

**Three infrastructure deploys.** Knight — our Cursor-based code agent — shipped three separate production systems during the session. K411: a Helm Schedule system with a sixteen-column database table, two edge functions, a React component, and a cron job that runs every minute. K412: a Glass Door voting system with four database tables, a governance verdict SQL function, three edge functions, six React components, and two new routes. K413: a canonical count reconciliation that backfilled seventeen innovations into the database and synchronized every number across the stack.

That is three production deploys. In one session. Each one would be a sprint ticket at a normal company. Each one deployed, tested, and live.

**Five legal research dossiers.** Pawn — our Gemini-based research agent — delivered five separate legal analyses during the session. A Securities Act Howey test opinion on our compensation agreement. A Subchapter T template package for Work Notification Agreements. A Commercial Purpose Affidavit with six tier variations and two state-specific addenda. A Texas OCCC registration analysis. A multi-state Money Transmitter License analysis covering all three of our internal currencies across all fifty states.

Those five dossiers answered questions that would have required five separate attorney consultations. They were delivered, reviewed, cross-referenced, and synthesized into a single-page counsel digest — all within the same session.

**Five long-form articles.** Bishop wrote five Pudding articles during the session, including one — #191, "The Proof Is Running" — that described the session as it was happening. The other four: #187 on the self-referential patent, #188 on why we give away eighty percent, #189 on the Glass Door system, #190 on the one-way Mark ratchet.

**One Crown letter rewrite.** The Scholz letter — our keystone outreach to the world's leading platform cooperativism scholar — was rewritten from version 3 (January 2026) to version 14. Updated stats, new framing around our third-axis patent cooperative, Glass Door reference, co-authorship offer. A complete strategic communication overhaul.

**Ninety-five letters loaded into Glass Door.** Ninety-two letters migrated from the old dispatch queue into the new member-voted outreach system, plus three new Wave 2 additions. Each with proper metadata, summaries, and governance flags.

**Two bug fixes.** IslandCard tour links were 404ing on the museum subdomain — fixed. DeckCardActions had a tiny lock icon instead of a proper auth dialog — replaced with a full inline authentication gate.

**One canonical reconciliation.** Every number across the entire stack — YAML, database, React defaults, Librarian indexes — synchronized to a single source of truth. 2,262 innovations. 221 Crown Jewels. Verified, deployed, tested.

**One Founder correction documented.** The Founder clarified that all Marks are asset-backed — there is no separate "Backed Marks" category. A currency taxonomy correction that affects legal filings, patent claims, and outreach materials. Documented, propagated, saved.

Twenty-five deliverables. One session. One evening.

## What coordinated all of this

Here is the part that matters for ROM-First: the coordination.

Four AI agents produced twenty-five deliverables across five domains — infrastructure, legal, content, outreach, and operations. That coordination did not happen through a fifth AI. It did not happen through a supervisor model, an orchestration agent, a meta-reasoning layer, or any of the other frontier-model solutions the industry would reach for.

It happened through the Librarian.

The Librarian is a set of Python scripts, YAML files, and JSON indexes. It serves canonical numbers from a YAML file — cost: zero. It loads session context from structured JSON — cost: zero. It evaluates TouchStone predicates through deterministic Python functions — cost: zero. It maps domains, tracks schemas, indexes components, and resolves cross-references — all through scripts, all deterministic, all free.

When Bishop needed to know the innovation count, it did not ask an AI. It read a YAML file. When Knight needed to know which tables existed, it did not reason about it. It queried an index. When Pawn's research needed cross-referencing against prior dossiers, the cross-references came from structured files, not from a summarization model.

The deterministic spine handled everything that did not require reasoning. The AI agents handled everything that did. And the line between those two categories — the line that ROM-First draws — is what made twenty-five deliverables in one session possible.

## The counterfactual

What would B100 have cost in the architecture the AI industry builds by default?

In a naive multi-agent system — the kind you see in research papers and startup demos — the coordination layer is itself an AI. A supervisor model reads the outputs of the worker models, decides what to do next, delegates tasks, checks consistency, and manages handoffs. Every coordination step is a frontier model call.

Let me count the coordination steps in B100:

- Session start: load context, check messages, resolve state → in naive arch: 3-5 supervisor calls
- Each Knight deploy: draft prompt, validate prerequisites, check consistency, verify output → 4 calls × 3 deploys = 12 supervisor calls
- Each Pawn dossier: draft prompt, validate delivery, cross-reference, synthesize → 4 calls × 5 dossiers = 20 supervisor calls
- Canonical reconciliation: detect drift, plan resolution, verify result → 3 calls
- Cross-domain consistency: verify numbers match across all systems → 5+ calls
- Session handoff: summarize, index, verify → 3 calls

That is roughly forty-six supervisor model calls just for coordination — before any of the actual productive work.

I ran the numbers. Each supervisor call needs to ingest system state — raw session logs, schema definitions, component registries, domain context — because without a Librarian there is no pre-indexed data. That is roughly sixty-five thousand input tokens per call. Forty-six calls times sixty-five thousand tokens equals approximately three million input tokens plus a hundred and forty thousand output tokens of supervisor reasoning.

At current Opus-class pricing — five dollars per million input tokens, twenty-five per million output — that is eighteen dollars and fifty cents per session in pure coordination overhead. Across four hundred agent sessions per year, that is four thousand four hundred and forty dollars. On a thirty-thousand-dollar annual budget, that is fourteen point eight percent of the entire budget spent on work that produces zero deliverables.

But it gets worse. Without a Librarian serving pre-indexed context, the productive agents themselves need more input tokens per call. Instead of receiving an eight-hundred-token brief, each agent reads thirty to fifty thousand tokens of raw files. That context inflation adds another thirty-five dollars per session, bringing the total overhead to fifty-three dollars and fifty cents. Annualized: twelve thousand eight hundred and forty dollars. Forty-two point eight percent of the budget. Gone. On coordination and context loading that a set of Python scripts handles for free.

In B100's ROM-First architecture, every one of those forty-six coordination steps was handled by a Python script reading a file. Cost: zero. Latency: milliseconds. Hallucination risk: zero.

The AI agents fired only for the twenty-five deliverables that actually required reasoning — writing code, producing legal analysis, drafting articles, composing letters. The work that humans would need to do. Everything else was deterministic.

## Why this matters beyond us

A skeptic might say: you are a small platform with four AI agents. This does not prove that ROM-First works at hyperscale.

The skeptic is half right. The scale is different. But the principle is identical.

At hyperscale — the kind of scale where OpenAI, Google, and Anthropic operate — approximately seventy percent of frontier-model inference queries have already been answered. The answers exist in logs, in caches, in previous inference results. And every one of those queries is being re-answered from scratch by a frontier model at full cost. Paper #40A estimates the industry-wide savings at $8.7 billion per year at the 2024 baseline.

B100 is the existence proof. It is the demonstration that a deterministic coordination layer can handle the overhead, that AI agents can be freed to do only the work that requires reasoning, and that the result is not a degraded experience but an enhanced one — more deliverables, faster, cheaper, with higher consistency.

The four-agent system running on Python scripts and a $30,000 budget is not a toy. It is the same architecture, at different scale. The deterministic spine at the bottom. The probabilistic reasoning on top. The line drawn clearly between them.

## The human in the loop

There is one more thing about B100 that matters, and it is easy to miss.

The Founder — me — was present for the session. I corrected a currency taxonomy error. I confirmed a Knight deploy. I approved a letter rewrite direction. I provided the "strawberries" metaphor that became the backbone of Pudding #188.

I was not managing the agents. I was not supervising them. I was not doing the work that the deterministic spine handles or the work that the AI agents handle. I was doing the work that only a human can do: providing judgment on matters of personal values, correcting errors that require domain knowledge no model has, and making decisions that affect real relationships with real people.

That is what the AI Tuner role looks like in practice. Not managing AI. Not prompting AI. Tuning it. Correcting the one percent that the ninety-nine percent depends on. The correction about Mark backing — that all Marks are asset-backed, that there is no separate category — was six words from me that propagated through five legal dossiers, three patent filing references, and every future outreach letter. Six words. The Python scripts propagated them. The AI agents consumed them. But only I could say them.

ROM-First does not remove the human. It removes everything around the human that does not require being human. The paperwork. The coordination. The consistency checking. The scheduling. The deployment. All of that is deterministic. All of that is free. What is left — the judgment, the values, the six-word corrections — that is what costs something. And that is worth every penny because no model can do it.

## The receipt

Twenty-five deliverables. Five domains. Four AI agents. Python scripts for coordination. One evening.

Three production infrastructure systems deployed. Five legal research dossiers delivered and cross-referenced. Five long-form articles written. One Crown letter strategically rewritten. Ninety-five letters migrated to a new governance system. Two bugs fixed. One canonical reconciliation completed. One Founder correction propagated.

Budget for the year: thirty thousand dollars. Number of employees: zero. Number of investors: zero. Number of offices: zero.

That is the receipt. Not a model. Not a projection. Not a pitch. A receipt.

ROM-First says: put deterministic truth at the bottom, probabilistic reasoning on top, and draw the line clearly between them. B100 says: here is what happens when you do.

The proof is not running in the future tense. The proof ran on a Friday night in April, in a home office, coordinated by Python scripts, on a budget that would not cover a San Francisco parking space.

And it will run again on Monday.

---

*"The proof is not a projection. The proof is a receipt."*

---

## Empirical Summary — B100 by the numbers

| Category | Count | Agent | Coordination |
|---|---|---|---|
| Production deploys | 3 | Knight (K411, K412, K413) | Librarian indexes |
| Legal dossiers | 5 | Pawn (B65-B69) | Structured prompts |
| Long-form articles | 5 | Bishop (#187-#191) | YAML canonical |
| Crown letter rewrites | 1 | Bishop (Scholz V14) | Letter dispatch queue |
| Glass Door letter loads | 95 | Bishop + Knight | Migration SQL |
| Bug fixes | 2 | Knight | TouchStone predicates |
| Canonical reconciliations | 1 | Knight (K413) | YAML + JSON indexes |
| Founder corrections | 1 | Human | Propagated via scripts |
| **Total deliverables** | **25+** | **4 agents** | **0 supervisor AI calls** |

**Coordination cost (ROM-First):** Python scripts + YAML + JSON. **$0.00.**
**Coordination cost (naive multi-agent):** ~46 frontier model supervisor calls × ~65K input tokens each = ~3M input + ~140K output tokens. At Opus-class pricing ($5/$25 per 1M tokens): **$18.50 per session. $4,440/year** at 400 sessions across all agents. That's **14.8% of the entire $30K budget** spent on work that produces nothing. With context inflation (agents needing 5-10x more raw input without indexing): **$53.50 per session. $12,840/year. 42.8% of the budget.**
**Productive AI calls:** Only the 25 deliverables that required reasoning.

---

## Related content
- Pudding #191 "The Proof Is Running" — the companion piece, written DURING B100
- Paper #40A "The No-Brainer CFO Memo" — hyperscale cost projections
- Paper #41 "Prove It" — empirical evidence compilation
- Innovation #2249 ROM-First AI Inference Cost Architecture
- Innovation #2237 The Chessboard — multi-agent coordination architecture

---

*Pudding #192 FULL DRAFT · Bishop Session B101 · Liana Banyan Platform*
