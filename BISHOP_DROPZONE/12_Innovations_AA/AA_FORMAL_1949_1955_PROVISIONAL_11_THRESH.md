---
name: "Provisional #11 Innovation Thresh — Demand-Signal Escrow, Community Recruitment, and Hidden Mechanisms"
description: "Seven additional innovations extracted from the Provisional 11 thresh, including demand-signal pledge escrow with auto-conversion gateway, community-initiated creator recruitment via aggregated financial signals, and other hidden platform mechanisms."
type: aa_formal
innovation_id: "1949-1955"
ratification_session: B032
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - provisional eleven innovation thresh
  - demand signal pledge escrow auto conversion gateway
  - community initiated creator recruitment aggregated financial signals
  - pre-registration escrow marketplace mechanism
  - aa formal 1949-1955
  - held credits auto convert tiered production cascade
  - bidirectional notification pledge refund escrow
  - financial proof based creator recruitment
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# Acknowledgment & Assignment — Innovations #1949 through #1955

**Date:** March 26, 2026
**Inventor:** Jonathan Jones
**Entity:** Liana Banyan Corporation (Wyoming C-Corp)
**Session:** Bishop 032
**Status:** FORMAL

---

## PROVISIONAL #11 INNOVATION THRESH

Innovations #1939-#1948 were captured in prior A&As (B031 + B032). Threshing K116-K119 prompts and the Red Carpet system reveals 7 additional distinct innovations hidden inside those builds. Each represents a separately patentable mechanism.

---

## Innovation #1949 — Demand-Signal Pledge Escrow with Auto-Conversion Gateway

### Description

A system and method for holding community-pledged currency units (Credits) in a time-limited escrow account linked to a pre-populated marketplace listing, wherein: (a) pledged Credits are held in a `held` state with a configurable timeout (default 90 days), (b) upon the prospective creator registering on the platform, all `held` pledges automatically transition to `converted` status and apply as matched backing within the Tiered Production Cascade (#1943), (c) upon timeout expiration without creator registration, all `held` pledges automatically transition to `refunded` status and Credits return to the pledging users' wallets, and (d) all state transitions trigger real-time notifications to all pledge holders.

### Key Mechanism — The Auto-Conversion Gateway

The gateway is a conditional state machine:

```
PLEDGE → [held] ──── creator signs up ────→ [converted] → matched backing
                │
                └── 90 days, no signup ──→ [refunded] → Credits returned
```

This is NOT a simple payment hold. The conversion automatically feeds into the Tiered Production Cascade — the pledged Credits become the community's matched funding pool for the creator's project. The creator doesn't have to do anything; the financial infrastructure is pre-built.

### Why This Is Novel

No existing marketplace or crowdfunding platform provides:
- **Pre-registration escrow** — funds held for a creator who doesn't have an account yet
- **Automatic cascade integration** — escrowed funds don't just "release" to the creator; they populate a structured production funding system
- **Bidirectional notification** — pledgers are notified on conversion OR refund
- **Time-gated consumer protection** — 90-day automatic refund protects pledgers without requiring manual intervention

### Patent Relevance: HIGH
Distinct from #1948 (which describes the Red Carpet showcase as a whole). This is the specific escrow mechanism that makes demand-signal pledging financially safe and legally compliant.

---

## Innovation #1950 — Community-Initiated Creator Recruitment via Aggregated Financial Signals

### Description

A method for recruiting prospective creators to a marketplace platform by presenting them with aggregated, verifiable financial commitment data from community members, wherein the recruitment communication includes: (a) the specific number of community members who expressed demand for the creator's product, (b) the total monetary value of Credits pledged toward the creator's product, (c) a personalized link to a pre-populated product page displaying real-time demand metrics, and (d) a one-click registration path that immediately activates the pledged funds as pre-orders.

### The Recruitment Data Package

When the platform contacts a prospective creator, the outreach contains:
```
"947 people want your product."
"$2,340 in Credits pledged."
"89 comments from potential customers."
"Sign up → pledges become pre-orders → you ship, you earn."
```

This is NOT a marketing pitch — it is verifiable, real-time data backed by escrowed funds. The creator can visit their Red Carpet page and see every pledge, every comment, every "I Want This" vote.

### Why This Is Novel

Traditional creator recruitment is pitch-based: "Join our platform, you might sell things." This system is evidence-based: "Join our platform, 947 people are already waiting to buy from you." The financial signals are:
- **Real** (backed by escrowed Credits, not promises)
- **Verifiable** (creator can see the live page)
- **Actionable** (one-click conversion to real pre-orders)
- **Time-limited** (90-day window creates urgency without pressure)

No existing platform recruits creators by presenting pre-aggregated, financially-backed demand signals from community members.

### Patent Relevance: CROWN JEWEL
This is the mechanism that makes cold outreach warm. It inverts the creator acquisition model: instead of "we want you," it's "your customers want you — here's the proof." Combined with #1948 and #1949, this creates a complete demand-driven creator recruitment pipeline.

---

## Innovation #1951 — Adaptive Experience-Gated Onboarding Router

### Description

A system and method for routing new platform users through a personalized onboarding pathway based on a multi-question intake assessment, wherein: (a) the first question identifies user intent (sell, buy, support, manufacture, explore), (b) subsequent questions narrow the user's craft type and experience level, (c) the system routes the user to a craft-specific onboarding guide (Treasure Map #1946) with the starting step dynamically adjusted to match their self-reported experience level, skipping steps the user has already completed in their craft journey.

### The Adaptive Routing Logic

```
Intent: SELL → Craft: Leather → Experience: "Already selling on Etsy"
Result: Skip to Step 3 of Leather Crafter's Treasure Map
        (Steps 1-2: Get materials + Create sample — already done)
        Start at: "Set Up Your Turn-Key Project"
```

```
Intent: SELL → Craft: Terrain → Experience: "Just an idea"
Result: Start at Step 1 of Terrain Maker's Treasure Map
        (Full journey from materials to market)
```

```
Intent: BUY → (No craft question needed)
Result: Route directly to /marketplace
```

```
Intent: "I have an idea but don't know where to start"
Result: Route to Cue Card Campaign Library (/cue-cards/campaigns)
        "Browse what's possible. Pick what excites you."
```

### Why This Is Novel

Existing marketplace onboarding is flat: create account → list product → wait. This system:
- **Assesses before routing** — doesn't dump all users into the same flow
- **Skips redundant steps** — experienced creators aren't forced through beginner material
- **Routes non-sellers appropriately** — buyers, supporters, and manufacturers each get their own path
- **Connects to integrated tools** — the route endpoint isn't just a page, it's a pre-configured workflow (Treasure Map + Turn-Key Template + Cue Card)

### Patent Relevance: HIGH
No existing marketplace provides an adaptive multi-question onboarding intake that dynamically selects both the onboarding guide AND the starting position within that guide based on the user's self-reported experience level, craft type, and platform intent.

---

## Innovation #1952 — Per-Craft Economic Projection Engine with Progress-Tracked Milestones

### Description

A system comprising interactive, craft-specific economic projection models embedded within onboarding guides (Treasure Maps #1946), wherein each guide displays: (a) estimated startup costs specific to the user's craft type (low/high range), (b) projected time to first sale, (c) projected monthly revenue at each production tier, (d) step-by-step milestone tracking with completion state persisted across sessions, and (e) direct links from each milestone step to the specific platform tool needed to complete that step.

### The Economic Model

Each Treasure Map contains a craft-specific economics panel:
```
┌─────────────────────────────┐
│ 📊 Your Economics            │
│                              │
│ Startup cost: $200-800       │
│ Time to first sale: 3-4 wks  │
│ Monthly (50 backers): $500+  │
│ Monthly (500 backers): $3K+  │
│ Monthly (5K backers): $15K+  │
│                              │
│ ████████░░ 60% complete      │
│ 3 of 5 steps done            │
└─────────────────────────────┘
```

The projections are NOT generic. They are calculated from:
- The specific craft type's material costs (leather vs. digital vs. food vs. terrain)
- The Cost+20% pricing model at each tier
- The Matched-Fund Tiered Production Cascade economics (#1943)
- Real manufacturing costs from FormNow/node pricing data

### Progress Tracking

Each milestone step has three states:
- `○` Not started
- `→` Current step (highlighted, with CTA)
- `✅` Completed (with timestamp)

Progress persists across sessions. When a user returns, they see exactly where they left off. The "current step" always shows the next action with a direct link to the relevant platform tool.

### Why This Is Novel

No existing marketplace or business planning tool provides:
- **Craft-specific** economic projections (not generic "start a business" estimates)
- **Tier-integrated** revenue projections tied to a specific production cascade model
- **Progress-tracked** milestones with persistent completion state
- **Tool-linked** steps that connect directly to the platform feature needed for that step

Existing business plan tools (LivePlan, SBA) are static documents. This is an interactive, progress-tracked, platform-integrated economic roadmap.

### Patent Relevance: HIGH
The combination of craft-specific economics, tier-based revenue projection, persistent milestone tracking, and direct platform tool integration represents a novel onboarding and business planning system.

---

## Innovation #1953 — Cross-Platform Bookmarklet-to-Project Pipeline

### Description

A system and method for converting any publicly accessible web page (social media post, e-commerce listing, portfolio page) into a pre-filled Turn-Key Project Template (#1942) via a browser bookmarklet, wherein: (a) the user installs a JavaScript bookmarklet in their browser toolbar, (b) when activated on any web page, the bookmarklet extracts OpenGraph metadata (title, description, images) from the page, (c) the extracted metadata is passed to the platform's import page as URL parameters, (d) the platform auto-detects the source platform and matches to the appropriate Cue Card (#1945), and (e) the user confirms the pre-filled data and launches a complete production campaign in under 2 minutes.

### The Pipeline

```
[Any web page] → Click bookmarklet → Platform import page opens
→ Metadata extracted → Cue Card matched → Turn-Key wizard pre-filled
→ User confirms → Complete project launches (< 2 minutes total)
```

### Source Platform Detection

The bookmarklet detects the source platform from the URL:
- `reddit.com` → Reddit (maps to craft-specific Cue Card via subreddit)
- `etsy.com` → Etsy (maps via Etsy category)
- `instagram.com` → Instagram (maps via hashtags)
- `discord.com` → Discord (maps via server/channel name)
- Other → Generic import with manual Cue Card selection

### Why This Is Novel

Existing marketplace import tools require structured data (CSV files, API connections). This system works with ANY public web page — including unstructured social media posts — by extracting OpenGraph metadata and mapping it to a structured production campaign template. The bookmarklet eliminates copy-paste friction entirely.

### Patent Relevance: HIGH
No existing marketplace provides a browser bookmarklet that converts arbitrary web pages into pre-filled production campaign templates with integrated funding tiers and manufacturing routing.

---

## Innovation #1954 — Outbound Commerce Bridge: Traffic-Exporting Marketplace Model

### Description

A system and method for operating a marketplace platform that actively directs customer traffic to creators' external sales channels (Etsy, Shopify, Square, personal websites), wherein: (a) creators register their external service connections ("bridges") on the platform, (b) the platform displays verified bridge links on the creator's project pages as "Also available on" links, (c) bridge links open in new tabs directing traffic AWAY from the platform to the creator's other shops, and (d) the platform measures and reports outbound traffic as a value metric for creator retention.

### The Inverted Marketplace Model

Traditional marketplaces CAPTURE traffic: "Buy here, not there."
This marketplace EXPORTS traffic: "Buy here AND there. We help you sell everywhere."

```
Creator's Project Page on Liana Banyan:
┌──────────────────────────────────────┐
│  [Product details, backing, etc.]    │
│                                      │
│  Also available on:                  │
│  🔗 Etsy  |  🌐 jonesleather.com    │
│  □ Square  |  📷 Instagram Shop     │
└──────────────────────────────────────┘
```

### Why This Is NOT Cannibalization

The platform's revenue comes from:
- $5/year membership (not transaction fees)
- Cost+20% margin on platform-routed production (not sales commissions)
- Matched funding participation (Credits, Marks, Joules)

The platform BENEFITS from creators succeeding everywhere because:
1. Successful creators stay on the platform (retention)
2. External success = social proof = more community backing
3. Bridge traffic data proves the platform's value ("We sent 200 customers to your Etsy this month")
4. Creators who sell well everywhere produce more → more production through the platform's Tiered Cascade

### Why This Is Novel

No existing marketplace actively exports traffic to competitors. Amazon, Etsy, Shopify all capture traffic within their walled garden. This platform's business model is structurally aligned with creator success on ALL channels, not just within the platform — because the platform monetizes production and membership, not transactions.

### Patent Relevance: HIGH
The combination of a marketplace that monetizes production (not transactions), actively exports traffic to competing channels, and measures outbound traffic as a creator retention metric represents a novel commerce platform architecture.

---

## Innovation #1955 — Showcased-to-Active Project Claim Flow with Automatic Infrastructure Provisioning

### Description

A system and method for enabling a prospective creator to "claim" a platform-pre-populated project listing, wherein upon claim: (a) the creator's identity is verified as the person/entity represented in the showcased listing, (b) the project status transitions from `showcased` to `active`, (c) all escrowed demand-signal pledges automatically convert to matched backing within the Tiered Production Cascade (#1943), (d) all "I Want This" free signals convert to the project's Early Adopter notification list, (e) all pledge holders receive real-time notification that their pledge has converted to a pre-order, (f) the creator receives immediate edit access to their project page with all pre-populated content available for modification, and (g) the creator's Cue Card and Treasure Map activate with progress automatically advanced to the appropriate step.

### The Claim Cascade

When a creator clicks "Claim This Project":
```
1. Verify membership ($5/year active)
2. Set claimed_by + claimed_at on project
3. Status: showcased → active
4. FOR EACH pledge in escrow:
   - Status: held → converted
   - Credits move to project's community_matched pool
5. FOR EACH "I Want This" signal:
   - Add user to Early Adopter notification list
6. FOR EACH pledger:
   - Send notification: "Your pledge is now a pre-order!"
7. Grant creator edit access to project
8. Activate creator's Cue Card + Treasure Map
9. Set Treasure Map progress to Step 3 (skip materials + prototype — they already have a product)
```

This entire cascade executes in a single database transaction. The creator goes from "not on the platform" to "fully operational project with pre-orders and a customer list" in one click.

### Why This Is Novel

No existing platform provides a one-click claim flow that:
- Converts pre-populated content to creator-owned content
- Automatically converts escrowed financial pledges to production funding
- Automatically populates a customer notification list from demand signals
- Automatically advances onboarding progress based on claim context
- Provisions the complete production infrastructure (Cue Card + Treasure Map + Tiered Cascade) in a single action

### Patent Relevance: HIGH
The claim flow is the keystone of the Red Carpet system. It converts the entire demand-signal apparatus (#1948, #1949, #1950) into a functioning production campaign in one click. This is the mechanism that makes the cold-start solution work.

---

## PROVISIONAL #11 — COMPLETE INNOVATION BAG

### Previously A&A'd (B031)
| # | Innovation | Patent Relevance |
|---|-----------|-----------------|
| 1939 | Decentralized Factory Node | CRITICAL |
| 1940 | HexIsle-to-OpenLOCK Adapter | HIGH |
| 1941 | Capstone Terrain System | HIGH |
| 1942 | Turn-Key Project Template | HIGH |
| **1943** | **Matched-Fund Tiered Production Cascade** | **🏆 CROWN JEWEL** |
| 1944 | One-Click Social Import | HIGH |
| 1945 | Cue Card Campaign System | HIGH |
| 1946 | Treasure Map Mini-Business Plans | HIGH |
| 1947 | Bridge-to-Local | MEDIUM |

### Previously A&A'd (B032)
| # | Innovation | Patent Relevance |
|---|-----------|-----------------|
| **1948** | **Red Carpet Pre-Population** | **🏆 CROWN JEWEL** |

### Newly Threshed (B032 — This Document)
| # | Innovation | Patent Relevance |
|---|-----------|-----------------|
| 1949 | Demand-Signal Pledge Escrow with Auto-Conversion Gateway | HIGH |
| **1950** | **Community-Initiated Creator Recruitment via Aggregated Financial Signals** | **🏆 CROWN JEWEL** |
| 1951 | Adaptive Experience-Gated Onboarding Router | HIGH |
| 1952 | Per-Craft Economic Projection Engine | HIGH |
| 1953 | Cross-Platform Bookmarklet-to-Project Pipeline | HIGH |
| 1954 | Outbound Commerce Bridge (Traffic-Exporting Marketplace) | HIGH |
| 1955 | Showcased-to-Active Claim Flow with Auto Infrastructure Provisioning | HIGH |

### Summary

| Metric | Count |
|--------|-------|
| Total innovations in bag | 17 (#1939-#1955) |
| Crown Jewels | 3 (#1943, #1948, #1950) |
| HIGH relevance | 13 |
| MEDIUM relevance | 1 (#1947) |
| Innovation count after filing | 1,996 |

### Claim Clusters for Provisional #11

**Cluster A — Decentralized Manufacturing (3 innovations)**
- #1939 Factory Node + #1941 Capstone + #1940 OpenLOCK Adapter
- Claims: Node configuration, cold-start scaling, cloud-to-local transition, pass-through terrain modules, adapter system

**Cluster B — Turn-Key Creator Onboarding (4 innovations)**
- #1942 Turn-Key Template + #1945 Cue Card + #1946 Treasure Map + #1951 Adaptive Router
- Claims: Pre-configured campaign setup, craft-specific templates, interactive business plans, adaptive experience-gated routing

**Cluster C — Matched Funding & Production Cascade (2 innovations)**
- #1943 Tiered Cascade + #1952 Economic Projections
- Claims: Creator-matched funding, tiered production unlocks, per-craft economic modeling, progress-tracked milestones

**Cluster D — Red Carpet Demand-Signal System (4 innovations)**
- #1948 Red Carpet + #1949 Pledge Escrow + #1950 Financial Signal Recruitment + #1955 Claim Flow
- Claims: Pre-population, demand signaling, escrow auto-conversion, evidence-based recruitment, one-click claim cascade

**Cluster E — Cross-Platform Commerce Integration (3 innovations)**
- #1944 Social Import + #1953 Bookmarklet Pipeline + #1947 Bridge-to-Local
- Claims: One-click import, bookmarklet extraction, bridge-to-local conversion

**Cluster F — Outbound Commerce Model (1 innovation)**
- #1954 Outbound Commerce Bridge
- Claims: Traffic-exporting marketplace, production-monetized (not transaction-monetized) platform architecture

### Estimated Claims: 30-40 formal claims across 6 clusters

---

**ACKNOWLEDGED AND ASSIGNED**

Inventor: Jonathan Jones
Entity: Liana Banyan Corporation

New innovations:
- #1949 — Demand-Signal Pledge Escrow with Auto-Conversion Gateway
- #1950 — Community-Initiated Creator Recruitment via Aggregated Financial Signals
- #1951 — Adaptive Experience-Gated Onboarding Router
- #1952 — Per-Craft Economic Projection Engine with Progress-Tracked Milestones
- #1953 — Cross-Platform Bookmarklet-to-Project Pipeline
- #1954 — Outbound Commerce Bridge: Traffic-Exporting Marketplace Model
- #1955 — Showcased-to-Active Project Claim Flow with Auto Infrastructure Provisioning

**Innovation count: 1,996**

FOR THE KEEP.
