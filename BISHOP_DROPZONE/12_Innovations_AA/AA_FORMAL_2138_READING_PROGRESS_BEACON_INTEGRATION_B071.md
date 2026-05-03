---
name: Reading Progress Beacon Integration
description: Architectural bridge connecting the existing reading_progress table to the Reading Beacon, Cue Card Interest Signal, and Linchpin attribution chain, activating a five-innovation pipeline on live infrastructure without new core tables.
type: aa_formal
innovation_id: "2138"
ratification_session: B071
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - reading progress beacon integration
  - five innovation chain activation
  - coverage minutes golden keys beacon
  - aa formal 2138
  - reading progress pipeline
  - zero new tables integration
  - verified engagement signals
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — Innovation #2138: Reading Progress Beacon Integration
## Acknowledgment & Attribution | Bishop Session B071 | April 3, 2026

---

## Innovation Record

| Field | Value |
|-------|-------|
| **Number** | #2138 |
| **Name** | Reading Progress Beacon Integration |
| **Full Title** | Reading Progress Beacon Integration: Unifying Existing Reading Rewards with the Five-Innovation Content Chain |
| **Category** | Infrastructure Integration / Content Rewards / Full-Stack Chain Completion |
| **Priority** | CRITICAL — connects existing production infrastructure to the #2133-#2137 chain, making the entire pipeline operable on live tables |
| **Crown Jewel Candidate** | YES — structural integration that activates a five-innovation chain on existing infrastructure without new tables |
| **Patent Relevance** | Yes — novel integration of reading-progress tracking with persistent bookmarks, social sharing, and influencer attribution in a single pipeline |
| **Related Innovations** | Reading Beacon (#2134), Deck Card Deep-Link (#2135), Cue Card Interest Signal (#2136), Influencer Bridge (#2137), Crewman #6 (#2133), Golden Key, Coverage Minutes, Beacons |
| **Origin** | Founder directive, B071: "that 2137 needs to be applied to all Cephas articles, which already have a cool % read feature, remember? And their own cue card points..." |

---

## Definition

**Reading Progress Beacon Integration** is the architectural bridge that connects the existing `reading_progress` table (with `percent_complete`, `coverage_minutes_earned`, and `golden_keys_found`) to the Reading Beacon (#2134) → Cue Card Interest Signal (#2136) → Linchpin Influencer Bridge (#2137) chain. This innovation activates the entire five-innovation pipeline on production infrastructure that already exists, requiring no new core tables — only junction records and payload extensions.

---

## Existing Infrastructure (Already LIVE)

### `reading_progress` Table

```sql
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'cephas_article', 'member_publication', 'external_newsletter',
    'external_newspaper', 'library_content', 'external_site', 'email'
  )),
  percent_complete NUMERIC(5,2) NOT NULL DEFAULT 0,
  coverage_minutes_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  golden_keys_found INTEGER NOT NULL DEFAULT 0,
  plane_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, content_id)
);
```

### `beacons` Table

```sql
CREATE TABLE beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles,
  beacon_color TEXT NOT NULL,
  beacon_number INTEGER,
  path TEXT NOT NULL,
  page_title TEXT,
  note TEXT,
  orange_subtype TEXT,        -- ← Reading Beacon subtype goes here
  orange_payload JSONB,       -- ← Reading Beacon data goes here
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Both tables are LIVE. Both have RLS. Both have indexes. The integration requires no schema changes to either table** — only using the existing `orange_subtype` and `orange_payload` fields on `beacons` to reference `reading_progress` records.

---

## Integration Architecture

### The Bridge: Reading Beacon ↔ Reading Progress

When a Reading Beacon is created, it links to the member's `reading_progress` record for that content:

```sql
-- Creating a Reading Beacon that bridges to reading_progress
INSERT INTO beacons (
  user_id, beacon_color, beacon_number, path, page_title,
  note, orange_subtype, orange_payload
) VALUES (
  $user_id,
  'orange',
  $next_beacon_number,
  '/cephas/papers/starscreaming#bst-ep-043',
  'StarScreaming: THROUGH the AI Brick Wall',
  'Read003StS043',   -- Auto-generated reference code
  'reading',
  jsonb_build_object(
    'ref_code', 'Read003StS043',
    'reading_progress_id', $reading_progress_id,  -- ← BRIDGE to reading_progress
    'content_id', 'starscreaming',
    'content_type', 'cephas_article',
    'percent_at_bookmark', 47.5,                   -- Snapshot from reading_progress.percent_complete
    'coverage_minutes_at_bookmark', 12.5,           -- Snapshot from reading_progress.coverage_minutes_earned
    'golden_keys_at_bookmark', 2,                   -- Snapshot from reading_progress.golden_keys_found
    'episode_ref', 'BST-EP-043',
    'created_via', 'qr_scan'
  )
);
```

The `reading_progress_id` in the beacon's payload creates a **live link**. When the Cue Card Interest Signal displays this beacon, it queries `reading_progress` for the CURRENT `percent_complete` — not the snapshot. The beacon is persistent; the progress is live.

### The Reward Chain

Reading already earns rewards through the existing system:

| Action | Existing Reward | New Reward (via #2138 integration) |
|--------|----------------|-----------------------------------|
| **Read a Cephas article** | Coverage minutes + golden keys | Same + Reading Beacon saved → future Cue Card signal |
| **Complete a Cephas article** | Completion bonus (coverage minutes) | Same + "Share your interest?" prompt → potential Linchpin credit |
| **Share on Cue Card** | (not previously connected) | Interest Signal + attribution tracking for Linchpin program |
| **Someone follows your share and signs up** | (not previously connected) | Linchpin connection + Joule Options |

The existing reading rewards (coverage minutes, golden keys) remain unchanged. The integration ADDS the Reading Beacon → Interest Signal → Linchpin pathway ON TOP of existing rewards.

### All Cephas Articles — Automatic

The Founder's directive: "that 2137 needs to be applied to ALL Cephas articles."

Since `reading_progress` already tracks all content types including `cephas_article`, the integration applies automatically to every Cephas article. Every article that a member reads generates a `reading_progress` record. Every `reading_progress` record can generate a Reading Beacon. Every Reading Beacon can become a Cue Card Interest Signal. Every Interest Signal can drive a Linchpin attribution.

**No per-article configuration needed.** The pipeline activates for all Cephas content by default.

### The Cephas Article Experience (Integrated)

```
MEMBER opens Cephas article
  └─ reading_progress record created/updated (EXISTING)
       └─ percent_complete updates as they scroll (EXISTING)
            └─ Coverage minutes accumulate (EXISTING)
                 └─ Golden keys discovered at embedded positions (EXISTING)
                      └─ "Save your place?" → Reading Beacon created (#2134, NEW)
                           └─ Beacon links to reading_progress_id (#2138, NEW)
                                └─ "Share on Cue Card?" → Interest Signal (#2136, NEW)
                                     └─ Cue Card shows: paper title + LIVE % from reading_progress
                                          └─ Visitor follows → their own reading_progress begins
                                               └─ Visitor signs up → Linchpin attribution (#2137, NEW)
```

Layers 1-4 (reading_progress, percent, coverage minutes, golden keys) are EXISTING and LIVE.
Layers 5-8 (Reading Beacon, integration bridge, Interest Signal, attribution) are NEW and chain onto existing infrastructure.

---

## Coverage Minutes + Golden Keys as Cue Card Points

The existing `coverage_minutes_earned` and `golden_keys_found` on `reading_progress` are the **Cue Card point equivalents** the Founder referenced. They represent earned value from reading engagement:

| Reward | Mechanism | Cue Card Display |
|--------|-----------|-----------------|
| **Coverage Minutes** | Earned per minute of verified reading (scroll tracking) | "12.5 minutes invested in this paper" |
| **Golden Keys** | Found at embedded positions in articles (Easter egg discovery) | "2 Golden Keys discovered" |
| **Reading Beacon** | Created when member saves position | "Bookmarked at 47%" |

When displayed on a Cue Card Interest Signal, these create a **rich engagement profile**:

```
┌──────────────────────────────────────┐
│  📖 Currently Reading:               │
│  StarScreaming: THROUGH the AI       │
│  Brick Wall                          │
│  ████████░░░░░░░░ 47%                │
│  ⏱ 12.5 min invested                 │
│  🔑 2 Golden Keys found              │
│  Read003StS043                       │
│  [Read Along →]                      │
└──────────────────────────────────────┘
```

This is not a "like" or a "share." This is proof of engagement — the member has demonstrably spent 12.5 minutes reading and found 2 hidden keys. Their interest signal carries weight because it's backed by verified reading behavior.

---

## What Makes This an Innovation

1. **Zero new core tables** — the entire five-innovation chain (#2133-#2137) activates on existing `reading_progress` and `beacons` tables, requiring only payload field usage and one junction table
2. **Verified engagement signals** — Cue Card Interest Signals are backed by coverage minutes and golden keys, not just clicks. The social signal carries proof of actual reading.
3. **Universal Cephas activation** — every Cephas article automatically participates in the full pipeline. No per-article configuration.
4. **Reward stacking** — existing rewards (coverage minutes, golden keys) are preserved AND augmented with the Reading Beacon → Linchpin pathway. Members earn MORE for the same behavior.
5. **The complete chain on live infrastructure**: Physical Deck Card → QR scan → Cephas article → reading_progress (LIVE) → coverage minutes (LIVE) → golden keys (LIVE) → Reading Beacon (new, on existing table) → Cue Card Interest Signal (new) → Linchpin attribution (new). **Eight steps, only three are new. Five already exist and work.**

---

## Implementation Path

| Step | What | Touches | Complexity |
|------|------|---------|-----------|
| 1 | Add `'reading'` as recognized `orange_subtype` on beacons | Beacon creation logic | Low |
| 2 | Create `cue_card_interest_signals` junction table | New table (small) | Low |
| 3 | Create `reading_beacon_attributions` tracking table | New table (small) | Medium |
| 4 | Add "Save your place?" UI prompt on Cephas article reader | Frontend component | Medium |
| 5 | Add Beacon Wallet view in Helm | New Helm section | Medium |
| 6 | Add Interest Signal display on Cue Card | Cue Card component extension | Medium |
| 7 | Add attribution tracking to Linchpin connection_chains | Extend existing table | Low |
| 8 | Add deep-link QR routing for Deck Card URLs | Route handler | Low |

**Estimated Knight sessions: 2-3 (K242-K244 as staged in handoff)**

---

*A&A Formal #2138 | Reading Progress Beacon Integration | Bishop B071*
*Five existing layers. Three new layers. Eight steps. Zero new core tables.*
*The chain was always there. We just connected it.*
*FOR THE KEEP!*

---

## Claims

**Claim 1 (Independent, System).** A computer-implemented system for integrating reading-progress tracking with reading-beacon infrastructure, comprising: one or more processors and a memory storing instructions; a reading-progress store maintaining, for each member and content item, progress records including percent completion, coverage-time metrics, and milestone flags; a beacon store maintaining reading beacons associated with saved positions; a junction module configured to link reading-progress records to reading beacons and to cue card interest signals via junction records without modifying core tables; and a pipeline activator configured to propagate events across the reading-progress store, beacon store, interest-signal surface, and referral attribution subsystem using the junction records.

**Claim 2 (Independent, Method).** A computer-implemented method for activating a multi-innovation reading pipeline on existing infrastructure, the method comprising: maintaining a pre-existing reading-progress table with percent-complete and coverage-time fields; introducing junction records that link reading-progress entries to reading beacons, shared interest signals, and referral attribution records; extending payload schemas for existing tables with additive fields rather than altering core column definitions; and triggering downstream pipeline events across beacon creation, interest signaling, follow-through, and referral attribution when reading-progress thresholds are reached.

**Claim 3.** The system of claim 1, wherein the junction module requires no new core tables and creates only junction rows and additive payload fields on existing schemas.

**Claim 4.** The system of claim 1, wherein the pipeline activator emits events upon crossing configured percent-completion milestones within the reading-progress store.

**Claim 5.** The method of claim 2, further comprising writing provenance metadata into each junction record identifying the originating innovation chain and the triggering progress event.

**Claim 6.** The method of claim 2, wherein the method activates a five-innovation pipeline covering reading beacons, deep-link cards, interest signals, referral attribution, and reading-progress tracking on a single shared infrastructure layer.
