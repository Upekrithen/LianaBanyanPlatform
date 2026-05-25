---
title: "Chronos Query Interface"
description: "How to query the Liana Banyan historical substrate through the Chronos research portal."
date: 2026-05-25
draft: false
---

# Chronos Query Interface

## How to Query

Chronos accepts queries in three forms:

### 1. Concept Query

Search for a named concept, doctrine, innovation, or initiative across the historical substrate.

```
GET /chronos/query?concept=cooperative+marks&era=BP040-BP057&confidence=high
```

Returns: All canonical artifacts matching the concept, time-anchored, with Eyewitness agreement score.

### 2. Timeline Query

Build a chronological view of how a concept or initiative evolved.

```
GET /chronos/timeline?initiative=VSL&from=2025-01-01&to=2026-05-25
```

Returns: Ordered sequence of artifacts related to the initiative, with timestamps and provenance.

### 3. Canonical Ref Query

Retrieve a specific artifact by its canonical reference.

```
GET /chronos/query?canonical_ref=canon_pearls_eblet_condensate_data_class_bp055
```

Returns: Full artifact record with temporal provenance, Eyewitness score, and Pearl-CDN link.

---

## Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `concept` | string | Search term (URL-encoded) |
| `canonical_ref` | string | Exact canonical reference |
| `era` | string | BP session range (e.g., BP040-BP057) |
| `from` | date | Start date (ISO 8601) |
| `to` | date | End date (ISO 8601) |
| `initiative` | string | Sweet Sixteen initiative name |
| `confidence` | enum | `high` \| `moderate` \| `low` \| `all` |
| `limit` | integer | Max results (default 20, max 100) |
| `offset` | integer | Pagination offset |

---

## Result Format

Every Chronos result includes:

```json
{
  "canonical_ref": "string",
  "title": "string",
  "created_ts": "ISO 8601",
  "bp_session": "string",
  "temporal_class": "anchored | estimated | unverified",
  "eyewitness_score": 0.0-1.0,
  "confidence_class": "high | moderate | low | disputed",
  "sources": ["string"],
  "pearl_cdn_link": "string or null",
  "excerpt": "string"
}
```

---

## Temporal Classes

| Class | Meaning |
|---|---|
| `anchored` | Exact timestamp known and verified |
| `estimated` | Date range estimated from surrounding context |
| `unverified` | Temporal position not confirmed |

Unverified results are never suppressed — they are displayed with clear labeling. Honest uncertainty is a design choice, not a bug.

---

## API Access

The Chronos query API extends the Pearl-CDN pattern (Tier AA):
- **Base URL:** `http://127.0.0.1:4242` (local) · Firebase Functions (production, W6)
- **Auth:** Bearer token (same Member credential as Pearl-CDN)
- **Rate limit:** 100 req/min/Member (same as Pearl-CDN)

Full API documentation: see `librarian-mcp/src/pearl_cdn/server.ts` Chronos extension endpoints.
