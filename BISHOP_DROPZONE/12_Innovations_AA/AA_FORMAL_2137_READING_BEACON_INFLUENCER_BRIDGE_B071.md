---
name: Reading Beacon Influencer Bridge
description: Attribution system connecting a member's Reading Beacon Interest Signal to the Linchpin Influencer Program, crediting new member signups driven by shared reading positions as Linchpin connections without any explicit recruitment action.
type: aa_formal
innovation_id: "2137"
ratification_session: B071
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - reading beacon influencer bridge
  - content as referral
  - organic influencer attribution
  - aa formal 2137
  - linchpin reading attribution
  - content driven member acquisition
  - beacon to beacon resonance
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — Innovation #2137: Reading Beacon Influencer Bridge
## Acknowledgment & Attribution | Bishop Session B071 | April 3, 2026

---

## Innovation Record

| Field | Value |
|-------|-------|
| **Number** | #2137 |
| **Name** | Reading Beacon Influencer Bridge |
| **Full Title** | Reading Beacon Influencer Bridge: Organic Content-Driven Attribution for the Linchpin Program |
| **Category** | Growth Architecture / Influencer Infrastructure / Content-Driven Acquisition |
| **Priority** | CRITICAL — transforms the Linchpin Program from explicit referral to organic content-based acquisition |
| **Crown Jewel Candidate** | YES — reshapes the entire member acquisition model by making content consumption the referral mechanism |
| **Patent Relevance** | Yes — novel system for attributing new member acquisition to content sharing behavior rather than explicit referral links |
| **Related Innovations** | Linchpin Influencer Program, Reading Beacon (#2134), Deck Card Deep-Link (#2135), Cue Card Interest Signal (#2136), Crewman #6 (#2133), Cue Card Pioneer Program (#2104), Medallion Sponsorship |
| **Origin** | Founder directive, B071: "connect that with the influencer program! and all that that implies." |

---

## Definition

**Reading Beacon Influencer Bridge** is the attribution system that connects a member's Reading Beacon Interest Signal (shared on their Cue Card) to the Linchpin Influencer Program. When a new person follows a shared Reading Beacon, reads the paper, creates a Helm, and becomes a member — that signup is attributed as a **Linchpin connection** for the member who shared the beacon. The member earns Joule Options without ever explicitly recruiting. The content is the referral.

---

## The Chain

```
MEMBER reads paper
  └─ Saves Reading Beacon (Read001StS015)
       └─ Shares on Cue Card as Interest Signal (#2136)
            └─ VISITOR sees Interest Signal on member's Cue Card
                 └─ Clicks "Read Along" → lands on paper at saved position
                      └─ Reads paper → explores more content
                           └─ "Save your place?" → needs Helm → $5/year signup
                                └─ NEW MEMBER created
                                     └─ Attribution: Linchpin connection for ORIGINAL MEMBER
                                          └─ Original member earns 100 Joule Options
                                               └─ Moves toward Matchstick / Torch / Beacon tier
```

**The member never said "join my platform." They said "I'm reading this paper." The content did the recruiting.**

---

## Architecture

### Attribution Tracking

```sql
-- Extend connection_chains to track reading beacon attribution
ALTER TABLE connection_chains ADD COLUMN
  attribution_source TEXT;  -- 'direct_link', 'cue_card', 'reading_beacon', 'deck_card_qr'

ALTER TABLE connection_chains ADD COLUMN
  source_beacon_id UUID REFERENCES beacons(id);  -- Which Reading Beacon led to this connection

-- When a new member signs up via a Reading Beacon path:
INSERT INTO connection_chains (
  linchpin_id,
  connected_user_id,
  connection_type,
  joules_rewarded,
  attribution_source,
  source_beacon_id
) VALUES (
  $sharing_member_linchpin_id,
  $new_member_id,
  'member',
  100,
  'reading_beacon',
  $reading_beacon_id
);
```

### Attribution Path Tracking

The system tracks the full attribution path to understand which content drives member acquisition:

```sql
CREATE TABLE reading_beacon_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beacon_id UUID REFERENCES beacons(id) NOT NULL,
  sharer_id UUID REFERENCES profiles(id) NOT NULL,      -- Member who shared the beacon
  visitor_id UUID REFERENCES profiles(id),               -- New member (null if visitor didn't sign up)
  paper_slug TEXT NOT NULL,                               -- Which paper
  episode_ref TEXT,                                       -- Which BST episode led to this (if any)
  deck_card_ref TEXT,                                     -- Which Deck Card was scanned (if any)
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,                              -- When visitor became member (null if they didn't)
  attributed_to_linchpin BOOLEAN DEFAULT false,           -- Whether the connection was credited
  joules_awarded DECIMAL(12,2) DEFAULT 0
);
```

This table is the **self-documenting dataset** for the entire Crewman #6 → Deck Card → Reading Beacon → Influencer pipeline. It answers:
- Which papers drive the most signups?
- Which members' Interest Signals convert the best?
- Which BST episodes lead to the most paper reads?
- What's the conversion rate from Deck Card scan → Reading Beacon → member signup?
- Which Linchpin tier members share the most effective beacons?

### The Linchpin Tier Resonance

The Linchpin Program's tier names now carry double meaning:

| Tier | Original Meaning | Reading Beacon Meaning |
|------|-----------------|----------------------|
| **Linchpin** | Holds connections together | Shares their first Reading Beacon that converts |
| **Matchstick** | Lights one flame that lights many | 3 people read what they read and joined |
| **Torch** | Brighter, wider reach | 6 people followed their reading path |
| **Beacon** | The lighthouse | 12+ people found the platform through their reading — they ARE a beacon |

A member who reaches **Beacon tier** through Reading Beacon attributions is literally a Beacon in both senses: a navigation point (Beacon in the platform architecture) and a lighthouse (Beacon in the Linchpin hierarchy). The naming was always right. The Reading Beacon bridge makes it literal.

---

## Why This Is Not MLM

The same anti-MLM safeguards apply:

| Rule | Application |
|------|-------------|
| **ONE LEVEL ONLY** | You earn Joule Options when YOUR shared beacon leads to a signup. You earn NOTHING when that new member shares THEIR beacon and gets signups. |
| **No downline revenue** | Your connection's connections are theirs, not yours. |
| **Content-first** | The member is sharing what they READ, not a sales pitch. If nobody signs up, they still shared a good paper. |
| **No pressure** | "Share your interest" is voluntary. No incentive to spam beacons. |
| **Real value** | The paper exists, the content is free, the platform provides genuine service. The beacon is a bookmark, not a pitch. |

The critical insight: because the referral is organic (sharing what you're reading), it doesn't FEEL like recruiting. The member is curating their intellectual profile. The new member is following a recommendation from someone whose taste they trust. The Joule Options reward is a bonus for behavior the member would do anyway — sharing interesting content.

---

## The Full Crewman #6 Revenue Chain

From a single Deck Card to Linchpin progression:

```
DECK CARD (94 in Chapters 1-2, 3,000-5,000 at full scale)
  └─ QR scan → Episode in paper (#2135)
       └─ "Save place?" → Reading Beacon created (#2134)
            └─ "Share interest?" → Cue Card Interest Signal (#2136)
                 └─ Visitor follows → reads → signs up
                      └─ Linchpin attribution (#2137) → Joule Options earned
                           └─ Member progresses: Linchpin → Matchstick → Torch → Beacon
                                └─ At Beacon tier: governance voice, platform history, direct Founder channel
```

**Five innovations chained (#2133-#2137). One physical card in someone's hand. One paper read. One bookmark saved. One interest shared. One new member. One Linchpin connection. One step toward Beacon tier.**

And the whole thing self-documents. Every step is tracked. The data optimizes the next iteration. The system that tells the story also measures who's listening and rewards those who share it.

---

## What Makes This an Innovation

1. **Content-as-referral** — no existing platform attributes member acquisition to bookmark sharing; referral is always explicit (links, codes, invites)
2. **Organic influencer progression** — members advance in the Linchpin hierarchy by sharing what they READ, not by recruiting
3. **Self-documenting acquisition** — every attribution path is tracked, creating a dataset that optimizes content-driven growth
4. **Beacon-to-Beacon resonance** — Reading Beacon (platform feature) and Beacon tier (Linchpin rank) converge in a member who literally becomes a lighthouse by reading and sharing
5. **Anti-extractive by design** — the member benefits from sharing genuine interest; the new member benefits from discovering genuine content; the platform benefits from organic growth. No one is exploited. The commerce is the charity.

---

*A&A Formal #2137 | Reading Beacon Influencer Bridge | Bishop B071*
*Five innovations in one chain. One card. One paper. One bookmark. One share. One new member.*
*Content is the referral. Reading is the recruitment. The Beacon is the lighthouse.*
*FOR THE KEEP!*

---

## Claims

**Claim 1 (Independent, System).** A computer-implemented system for content-based referral attribution, comprising: one or more processors and a memory storing instructions; a reading beacon store maintaining beacons shared by members as interest signals on visible profile cards; a follow-tracking module configured to record when a non-member activates a shared beacon, navigates to the referenced content, and subsequently creates a member account on the platform; and an attribution module configured to credit the sharing member with a referral connection for each follow-through that converts into a new member account, allocating an associated referral reward to the sharing member.

**Claim 2 (Independent, Method).** A computer-implemented method for attribution of referrals via shared content positions, the method comprising: tracking activation events where non-members follow a shared reading beacon to a referenced content item; tracking subsequent account creation events by the same non-members; linking the account creation to the member who shared the originating beacon; and crediting the sharing member with a referral connection and an associated reward without requiring an explicit recruitment action.

**Claim 3.** The system of claim 1, wherein the referral reward comprises non-purchasable governance or entitlement units allocated only to the sharing member upon confirmed conversion.

**Claim 4.** The system of claim 1, wherein the attribution module is constrained to one level of referral and does not propagate credit to upstream or downstream members.

**Claim 5.** The method of claim 2, wherein the content itself acts as the referral mechanism such that the referral is earned by sharing what one is reading rather than by direct solicitation.

**Claim 6.** The method of claim 2, further comprising de-duplicating attribution such that each new member account is credited to at most one sharing member based on the earliest activated beacon leading to conversion.
