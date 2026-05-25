---
title: "Chronos Ingest"
description: "How to contribute historical artifacts to the Chronos cooperative research substrate."
date: 2026-05-25
draft: false
---

# Contributing to Chronos

## The Ingest Pipeline

Chronos grows through Member contribution. When Members discover, document, or verify historical artifacts that belong in the cooperative substrate, they submit them through the ingest pipeline.

## What Can Be Ingested

| Artifact Type | Examples |
|---|---|
| Historical documents | Founding documents, early correspondence, planning records |
| Canonical decisions | Platform decisions not yet in substrate |
| Innovation records | Cooperative innovations with clear timestamps |
| Personal testimony | Member accounts of cooperative history (with corroboration) |
| External references | Published works, public records, news coverage |

## Submission Format

```
POST /chronos/ingest
Authorization: Bearer <member-token>
Content-Type: application/json

{
  "canonical_ref": "string (create or cite existing)",
  "title": "string",
  "artifact_type": "document | decision | innovation | testimony | reference",
  "content": "string (the artifact content or excerpt)",
  "created_ts": "ISO 8601 (exact or estimated)",
  "temporal_class": "anchored | estimated",
  "sources": ["array of source descriptions"],
  "contributor_id": "string (your Member ID)",
  "witness_ids": ["array of Member IDs who can corroborate"],
  "initiative": "string (Sweet Sixteen initiative name if applicable)"
}
```

## Verification Process

All ingested artifacts go through a three-stage verification:

### Stage 1: Automated Screening
- Schema validation
- Duplicate detection (canonical_ref check)
- Temporal consistency check (does the date fit the era?)

### Stage 2: Peer Corroboration
- Two Member witnesses confirm (or one CANON document reference)
- If neither is available: artifact enters `unverified` status (still ingested, clearly labeled)

### Stage 3: Eyewitness Scoring
- Multi-source agreement scoring applied
- Eyewitness score assigned
- Confidence class determined

## Marks for Contribution

| Outcome | Marks |
|---|---|
| Submission accepted (unverified) | 25 |
| Submission verified (moderate confidence) | 100 |
| Submission verified (high confidence) | 250 |
| Submission promotes CANON artifact | 500 |

All accepted submissions receive a substrate receipt logged to your Member record.

## Ingest Discipline

The Chronos ingest discipline:
- **Never fabricate timestamps.** If you don't know, say "estimated" and explain why.
- **Cite your sources.** Even partial citations are better than none.
- **Corroborate before claiming high confidence.** The Eyewitness score exists for a reason.
- **Honest uncertainty is welcome.** A well-labeled unverified artifact is worth more than a confident fabrication.

---

*"The most cooperative thing you can do for history is tell the truth about what you don't know."*
