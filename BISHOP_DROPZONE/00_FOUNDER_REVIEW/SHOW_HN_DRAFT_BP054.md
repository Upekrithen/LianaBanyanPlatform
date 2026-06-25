# SHOW HN DRAFT — Mnemosyne v0.1.10 (BP054 Sunday Launch)

Status: DRAFT for Founder review. Placeholder multiplier `847x` pending Bishop SEG-MM verification. Replace with canonical number before dispatch.

Author voice: Founder. Technical but accessible. Not a pitch deck.

ASCII only. No emojis.

---

## TITLE (paste into HN "title" field — keep under 80 chars)

```
Show HN: Mnemosyne v0.1.10 - 847x memory expansion for local LLM agents (SSPL)
```

Alternates if title length needs trimming after verified number lands:
- `Show HN: Mnemosyne - turnkey memory layer for local agents, 847x expansion`
- `Show HN: Mnemosyne v0.1.10 - memory expansion + Eyewitness Benchmark 0.883`

---

## BODY (paste into HN "text" field — Markdown allowed)

Hi HN. I am the founder of Liana Banyan, a cooperative-class software project.
Today we are shipping Mnemosyne v0.1.10, a turnkey memory layer for local LLM
agents. One-command download, runs against any model you already have wired up.

What it does, plainly: it takes a working memory budget of N tokens and gives
the agent effective recall over roughly 847x N tokens of prior context, using
a five-layer compaction pipeline (CelPane). No vector-DB ops, no embeddings
service to provision, no recurring fees. The whole thing runs where your
agent runs.

What is new in v0.1.10:

- Turnkey download. One file, one command, no node setup. Starting circle
  is zero nodes - my family is node zero, and you are invited to be node
  number one. There is no network you have to join to get value out of it.
  Federation is optional and additive.
- Eyewitness Benchmark receipt: 0.883 Haiku-Opus inter-rater agreement on
  the v0.1.10 memory-recall task suite. This is an empirical receipt, not a
  marketing number. The benchmark spec and the raw judging transcripts ship
  in the repo so you can replicate.
- Licensed under SSPL, covered by Cooperative Defensive Patent Pledge
  number 2260. Translation: if you build with it, our patents will never be
  weaponized against you. The pledge is defensive only - it triggers if
  someone tries to enclose the cooperative-class commons.

Why I think this is interesting beyond the immediate utility:

The 847x figure is not magic - it is the natural consequence of treating
memory as five composable layers instead of one flat context window. Most
"long context" work pushes the window outward. CelPane pushes the working
set inward by separating what the model needs to see right now from what it
needs to be able to find. The expansion ratio falls out of the layering.

I am building this as part of a longer project (Caithedral / Liana Banyan)
aimed at making professional-grade AI infrastructure affordable for the
cooperative class - households, small co-ops, libraries, schools. Five dollars
a year, eighty-three percent of value retained on-prem, cost-plus-twenty
pricing, fifty year dissipate. None of that pricing applies to the code I
am posting today - Mnemosyne is SSPL, full stop. Use it however you like
within the license.

Repo, download, and the benchmark transcripts are linked below. I will be
in the thread for the next several hours. Questions, criticism, replication
attempts, and "your number is wrong because X" are all welcome - especially
the third one.

- Founder, Liana Banyan

---

## SUGGESTED FIRST COMMENT (post immediately after submission)

A few things worth saying up front that did not fit cleanly in the post:

1. The 847x number is for the recall-task suite specifically. Your mileage
   on free-form chat will differ - probably lower on adversarial recall,
   probably higher on structured-document workflows. The benchmark spec
   tells you exactly what we measured so you can decide whether the number
   transfers to your use case.

2. "Zero nodes" is not a euphemism for "nobody uses it yet." It means the
   federation layer is designed so the first user gets full value with no
   peers. Everything peer-to-peer is additive. You never have to wait for
   a network effect to get the local benefit.

3. Why SSPL and not MIT: we want the substrate to stay open for the people
   it is built for. SSPL lets individuals, co-ops, and small operators do
   anything they want. It only constrains the case where a hyperscaler
   wants to wrap it as a managed service without contributing back. If
   that case does not apply to you, SSPL behaves like a permissive license.

4. The Cooperative Defensive Patent Pledge (number 2260) is published in
   full in the repo. The short version: we will never sue you for using
   Mnemosyne, derivatives of Mnemosyne, or anything in the same problem
   space. The pledge is revocable only against parties who first move
   patents offensively against the cooperative-class commons.

Happy to dig into any of these. Especially interested in hearing from
people running local agents at home - what is the memory ceiling you hit
first, and does this move it.
