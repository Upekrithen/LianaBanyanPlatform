# A&A FORMAL — Innovation #2136: Cue Card Interest Signal
## Acknowledgment & Attribution | Bishop Session B071 | April 3, 2026

---

## Innovation Record

| Field | Value |
|-------|-------|
| **Number** | #2136 |
| **Name** | Cue Card Interest Signal |
| **Full Title** | Cue Card Interest Signal: Share Your Reading Beacon as a Statement of Interest |
| **Category** | Social Signaling / Network Discovery / Content Distribution |
| **Priority** | HIGH |
| **Crown Jewel Candidate** | YES — creates a new Cue Card capability that turns reading behavior into social signaling, enabling interest-based network discovery |
| **Patent Relevance** | Yes — novel system for sharing persistent reading positions as social signals on a professional/personal profile card |
| **Related Innovations** | Cue Cards (#2104+), Reading Beacon (#2134), Deck Card Deep-Link (#2135), Crewman #6 (#2133), Cue Card Pioneer Program (#2104) |
| **Origin** | Founder directive, B071: "choose IN ADDITION to SEND that Beacon Position on your Own Cue Card — 'Share your interest'" |

---

## Definition

**Cue Card Interest Signal** is the ability for a member to share a Reading Beacon position on their own Cue Card, broadcasting what they are reading (or have read) as a visible statement of interest. The shared beacon appears on their Cue Card as a clickable element that others can see, follow to the same reading position, and optionally save their own Reading Beacon at the same location.

---

## Architecture

### The Signal Chain

```
Member reads a paper
  └─ Saves a Reading Beacon (Read001StS015)
       └─ "Share your interest?" prompt
            └─ YES → Reading Beacon appears on member's Cue Card
                 └─ Other members see: "Currently reading: StarScreaming (30% complete)"
                      └─ Click → lands at same position in paper
                           └─ "Save YOUR place?" → their own Reading Beacon
                                └─ Interest-based connection formed
```

### Cue Card Display

On a member's Cue Card, the Interest Signal appears as:

```
┌──────────────────────────────────────┐
│  [Member Name]                       │
│  [Guild badges] [Tribe badges]       │
│                                      │
│  📖 Currently Reading:               │
│  ┌────────────────────────────────┐  │
│  │ StarScreaming: THROUGH the     │  │
│  │ AI Brick Wall                  │  │
│  │ ████████░░░░░░░░ 47%           │  │
│  │ Read003StS015                  │  │
│  │ [Read Along →]                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  📚 Finished:                        │
│  • The Blizzard (Read001Blz008)     │
│  • Pudding #78 (Read002P078001)     │
│                                      │
└──────────────────────────────────────┘
```

### Interest Signal Types

| Type | Display | Behavior |
|------|---------|----------|
| **Currently Reading** | Paper title + progress bar + ref code | Others can "Read Along" — creates their own beacon at same position |
| **Finished** | Paper title + ref code (100% complete) | Others can "Start Reading" — creates beacon at page 1 |
| **Recommended** | Paper title + member's note | Others can "Read This" — creates beacon at page 1 with recommendation attribution |

### Social Discovery

The Interest Signal enables a new form of network discovery:

| Traditional Social | Cue Card Interest Signal |
|-------------------|------------------------|
| "Follow people who post about AI" | "Find people who are reading the same paper you're reading" |
| Interest inferred from likes/follows | Interest explicitly declared by reading position |
| Passive consumption signals | Active engagement signals (they are READING the paper, not just liking a post) |

This creates **reading cohorts** — groups of members who are reading the same paper at the same time. Reading cohorts are natural discussion groups, study groups, and collaboration pools.

### Database Extension

```sql
-- Add interest signal columns to cue_cards or create junction table
CREATE TABLE cue_card_interest_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id UUID REFERENCES cue_cards(id) NOT NULL,
  beacon_id UUID REFERENCES beacons(id) NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('reading', 'finished', 'recommended')),
  note TEXT,  -- Optional recommendation note
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cue_card_id, beacon_id)
);
```

### Privacy Controls

Members choose which Reading Beacons to share. No automatic sharing. The prompt "Share your interest?" requires explicit action. Members can:
- Share specific beacons (not all)
- Remove shared beacons at any time
- Set visibility (public / Guilds only / Tribes only / private)

---

## The Compound Effect

The three innovations (#2134, #2135, #2136) form a pipeline:

```
DECK CARD (#2135)          → Physical/digital card with QR
  └─ READING BEACON (#2134) → Saves reading position, creates engagement
       └─ INTEREST SIGNAL (#2136) → Shares position on Cue Card, creates network effect
```

Each layer multiplies the previous layer's reach:
- 94 Deck Cards → N Reading Beacons (N > 94, because multiple people scan same card)
- N Reading Beacons → M Interest Signals (M < N, because sharing is optional)
- M Interest Signals → P new readers (P > M, because each signal reaches the sharer's network)
- P new readers → more Reading Beacons → more Interest Signals → compound growth

The content compounds. The audience compounds. The network compounds. All triggered by a physical card with a QR code.

---

## What Makes This an Innovation

1. **Reading as social signal** — no existing platform treats a bookmark as a shareable statement of interest
2. **Reading cohorts** — members reading the same paper discover each other, forming natural collaboration groups
3. **Progress visibility** — others see HOW FAR you've read, not just that you've read it — this signals depth of engagement
4. **Bi-directional benefit** — the sharer builds their professional identity; the viewer discovers relevant content through trusted sources
5. **Completes the Crewman #6 loop** — episode → paper → beacon → Cue Card → other members' episodes. The distribution system feeds back into itself.

---

*A&A Formal #2136 | Cue Card Interest Signal | Bishop B071*
*FOR THE KEEP!*

---

## Claims

**Claim 1 (Independent, System).** A computer-implemented system for social sharing of reading positions, comprising: one or more processors and a memory storing instructions; a reading beacon store maintaining reading beacons for a plurality of members; a member-profile card store maintaining, for each member, a visible profile card displayable to other members; a sharing module configured to copy a selected reading beacon onto the member profile card as an interest signal element; and a follow-through module configured to permit another member viewing the profile card to navigate to the reading position identified by the shared beacon and optionally create a corresponding reading beacon at the same position.

**Claim 2 (Independent, Method).** A computer-implemented method for reading-position-based interest signaling, the method comprising: maintaining reading beacons representing saved reading positions for a member; receiving a share request identifying a selected reading beacon; rendering the selected reading beacon on the member profile card as a clickable interest signal; and responsive to activation of the interest signal by another member, navigating the activating member to the saved reading position within the identified content.

**Claim 3.** The system of claim 1, wherein the shared interest signal displays a content title, a position indicator, and a metadata label indicating the type of publication.

**Claim 4.** The system of claim 1, wherein the follow-through module creates a persistent attribution record connecting the activating member subsequent reading activity to the member who shared the beacon.

**Claim 5.** The method of claim 2, further comprising aggregating follow-through events across all members who have shared interest signals and generating an influence metric for each sharing member.

**Claim 6.** The method of claim 2, wherein the shared interest signal serves as an implicit recommendation such that the act of reading becomes the act of endorsing.
