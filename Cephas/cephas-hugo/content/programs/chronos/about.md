---
title: "About Chronos"
description: "The philosophy and empirical design behind the Chronos cooperative research portal."
date: 2026-05-25
draft: false
---

# About Chronos

## Why a Research Portal?

The Liana Banyan Platform is not a startup with a three-year history. It is a 37-year design project that has produced 2,270 documented innovations, 21 provisional patent applications, and 228 Crown Jewels. That record is not marketing material — it is a research archive.

Chronos exists because the archive deserves a research interface. Not a website timeline that cherry-picks milestones. A substrate query system that lets you ask real questions and get empirically grounded answers.

## The Time-Class Commitment

Everything in Chronos is time-anchored. This is not optional:

- Every artifact has a `created_ts` and (if applicable) a `modified_ts`
- Every query includes a time-anchor parameter (date range, era, or BP session)
- Every result shows its temporal provenance — when the artifact was created, when it was canonized, when it was last verified

If a result cannot be time-anchored, it is flagged as `temporal_class: unverified`. Honest uncertainty is a feature.

## The Eyewitness Benchmark

The Eyewitness Benchmark (BP053/BP054) established the cooperative's empirical standard for historical corroboration. Using multi-model agreement scoring, the benchmark found 0.883 Haiku-Opus agreement on canonical historical claims.

Chronos uses this benchmark as its confidence floor:

| Agreement Score | Confidence Class | Display |
|---|---|---|
| ≥ 0.883 | High confidence | ✅ Corroborated |
| 0.70–0.882 | Moderate confidence | ⚠️ Partially corroborated |
| 0.50–0.699 | Low confidence | ⚠️ Weakly corroborated |
| < 0.50 | Disputed | ❌ Contested |

## Cooperative-Class Research

Chronos is not a proprietary research tool. It is cooperative infrastructure:

- **Members contribute** — historical context submitted by Members enriches the substrate
- **Citations are canonical** — any Member who contributes a verified historical artifact receives a substrate receipt
- **Provenance is transparent** — every result shows its source (which Scribe, which session, which Member contribution)

## Relationship to Pearl-CDN

Chronos and Pearl-CDN (Tier AA) are sister systems:
- Pearl-CDN serves atomic-wire primitives (current state)
- Chronos serves historical queries (temporal substrate)

A Chronos result may include a Pearl-CDN link for the underlying doctrine. A Pearl may link back to its Chronos provenance timeline.

---

*Truth is not the absence of uncertainty. It is the honest accounting of it.*
