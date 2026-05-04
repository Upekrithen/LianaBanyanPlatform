---
title: "Prior Art Research — 16 Innovation Screening"
date: 2026-03-15
description: "Comprehensive prior art analysis for 16 Liana Banyan innovations — all found structurally novel or defensibly distinct"
tags: ["patent", "prior-art", "innovation", "legal", "filing"]
weight: 2
wrasseTriggers:
  - prior art research 16 innovation screening
  - patents
  - prior art research
  - liana banyan platform
  - cephas member content
---

# Prior Art Research: 16 Innovation Screening

> **16 innovations screened. 16 found structurally novel or defensibly distinct from nearest art.**
>
> This analysis was conducted as part of the 8th provisional patent application preparation, covering innovations #1600–#1614 and #1623.

---

## Summary Table

| # | Innovation | Prior Art Conclusion | Key Finding |
|---|-----------|---------------------|-------------|
| #1600 | Recipe Popularity Leaderboard per Postal Code | NOT SEEN | Nobody ranks recipes by fulfilled-order-count + unique-recipients per postal code |
| #1601 | Recipe Edition (cook x recipe as rated entity) | NOT CAPTURED | Nobody models cook x recipe as first-class entity with independent reputation |
| #1602 | Four-Axis Food Review (taste/flavor/spice/mouthfeel) | NOVEL SPECIALIZATION | Multi-dimensional frameworks exist; nobody fixes axes to these four sensory dimensions |
| #1603 | Time-Bounded Review Incentive with Internal Currency | OPEN | Nobody does configurable countdown window after delivery with internal currency reward |
| #1604 | Capacity-First Worker-Defined Service Zones | STRUCTURALLY NOVEL | All existing art partitions by demand/geography then assigns workers; nobody lets workers declare capacity first |
| #1605 | Three-Tier Cook Redundancy per Recipe per Area | OPEN | Worker scheduling exists; nobody encodes primary/secondary/backup triple per recipe per geography |
| #1606 | Capacity-Filler Cook Role (distinct from originator) | DEFENSIBLE | Nobody models a distinct overflow-fulfiller role with per-recipe qualification |
| #1607 | Freeze-Dried Meal Buffer with Fixed Overproduction Ratio | UNCLAIMED | No fixed overproduction ratio + controlled premium/charity release channels |
| #1608 | Distributed Cold-Storage Bounty (household freezers as nodes) | UNADDRESSED | All cold storage art is centralized appliances; no platform role for compensated member freezers |
| #1609 | Buffer Inventory Premium + Auto Charitable Release | OPEN | Nobody does pre-overproduced buffer into time-bounded premium window then auto charity diversion |
| #1610 | Internal Currency Hold-and-Release Staged Conversion | DISTINCT | Escrow art holds real funds; nobody does platform-internal currency with staged milestone conversion |
| #1611 | Charitable Buffer Top-Up for Preorder Shortfalls | NOVEL | Nobody uses a capped, time-bounded cooperative pool to fill internal-currency shortfalls on meals |
| #1612 | Dual-Use Fulfilled Order Data (leaderboard + load balance) | NOT TAUGHT | Load-balancing art is infrastructure-level; nobody dual-purposes fulfilled orders for popularity + initiative balancing |
| #1613 | Visual Pipeline with Claimable Bounty Slots | NOT IN ART | Supply chain visualization and self-organizing freelancers exist separately; nobody combines them |
| #1614 | Directed Thought contribution impact in Human-AI Collaboration | DISTINCT | contribution impact-of-AI-vs-human exists; nobody measures prevented-wrong-implementation cost as directed thought contribution impact |
| #1623 | AI Tuner Role for Multi-Agent Team | NOT IN ART | Multi-agent orchestration exists; nobody defines a first-class human role designation with governance authority |

---

## Detailed Analysis

### #1600 — Recipe Popularity Leaderboard per Postal Code

**Concept:** A leaderboard ranking recipes by fulfilled order count and unique recipients per geographic postal code area.

**Nearest Art:**
- US 2020-0143437 A1 / US 2024-0127298 A1 — Multi-category restaurant scoring
- US 2019-0347707 A1 — Restaurant food item recommendation by taste/nutrition

**Gap:** No prior art uses the specific dual metric of fulfilled order count + unique recipient count for ranking recipes per postal area. Existing systems use general popularity or rating scores, not operational fulfillment data.

---

### #1601 — Recipe Edition (Cook x Recipe Entity)

**Concept:** A separately rated entity pairing a specific cook with a specific recipe, with independent reputation tracking per cook-recipe combination.

**Nearest Art:**
- US 9,552,461 B2 / US 2011-0289044 A1 — Food preparation system with cook coefficient (Harrison)
- US 2019-0213914 A1 — Kitchen personal assistant with recipe ratings
- US 10,803,769 B2 / US 2019-0130786 A1 — Recipe player with ratings and social features

**Gap:** Harrison tracks cook speed/style but doesn't publish a separate reputation for "this cook's edition of this recipe." No system models `edition = (recipe_id, cook_id)` as a primary key with independent ratings.

---

### #1602 — Four-Axis Food Review

**Concept:** Taste, flavor, spice, and mouthfeel as four separate rating dimensions replacing single star ratings.

**Nearest Art:**
- WO 2024-062495 A1 — Generic multi-dimensional review system
- US 2020-0143437 A1 — Multi-category restaurant scoring (price, quality, variety, etc.)
- US 2020-0294102 A1 — Multi-parameter rating graphs/dashboards

**Gap:** Multi-dimensional rating itself is well covered. Novelty is in fixing axes specifically to taste, flavor, spice, and mouthfeel for food/meal items as the primary sensory dimensions.

---

### #1603 — Time-Bounded Review Incentive

**Concept:** Configurable countdown window after meal delivery offering internal currency reward for structured review submission within deadline.

**Nearest Art:**
- US 2015-0254700 A1 (Google) — Incentivized reviews via purchase proof and mobile payment data
- UCDC family (US 2021-0326918, WO 2019-190573, EP 3 782 107 B1) — Unified loyalty rewards as digital currency

**Gap:** Google's patent focuses on location/transaction verification, not an explicit countdown-style incentive window anchored to delivery completion and structured review format with internal currency budgeting.

---

### #1604 — Capacity-First Worker-Defined Service Zones

**Concept:** Workers declare production capacity and preferences; zones are defined by worker capacity rather than demand mapping.

**Nearest Art:**
- US 2021-0125133 A1 (Vacasa) — Dispatch system scheduling workers into predefined geographic zones
- WO 2021-106785 A1 / US 2021-0182770 A1 (Coupang) — Camp-level capacity and worker efficiency scheduling
- US 11,775,937 B2 — Dynamic capacity ranges for workforce routing

**Gap:** All existing art partitions by demand/geography first, then assigns workers. Nobody lets workers pre-declare capacity and preferred service polygons, with zones constructed from those declarations.

---

### #1605 — Three-Tier Cook Redundancy

**Concept:** Primary, secondary, and backup cook assignment per recipe per geographic area for production continuity.

**Nearest Art:**
- US 2021-0125133 A1 (Vacasa) — Worker tiers and priority scheduling
- Coupang delivery worker assignment families
- WO 2025-019660 — Work order management with delegation hierarchies

**Gap:** No system encodes a primary/secondary/backup cook triple per recipe per geographic area with automatic fallback routing. Redundancy in existing art is implicit, not explicitly three-tiered per item per region.

---

### #1606 — Capacity-Filler Cook Role

**Concept:** A platform role distinct from recipe originator, where qualified cooks handle overflow coverage across multiple recipes.

**Nearest Art:**
- US 9,552,461 B2 (Harrison) — Cook performance profiling
- Workforce routing/scheduling patents (Vacasa, Coupang)

**Gap:** Nobody distinguishes between recipe IP originator and overflow production fulfiller as separate platform roles with separate qualification matrices. The separation of IP ownership from production capacity is novel.

---

### #1607 — Freeze-Dried Meal Buffer System

**Concept:** Fixed overproduction ratio on preordered meals; stored portions released at premium price or charitable donation.

**Nearest Art:**
- WO 2022-254089 A1 — Shelf-stable meal packets
- US 2021-0282599 A1 — Multi-meal cold storage and cooking appliance
- WO 2022-016039 A1 — Meal share system (ad hoc extra portions)

**Gap:** No system implements a fixed overproduction ratio tied to preorders with explicit buffer inventory policy and controlled release via premium pricing or charitable routing.

---

### #1608 — Distributed Cold-Storage Bounty

**Concept:** Platform members operate chest freezers as storage nodes with flat monthly + per-unit-stored variable compensation.

**Nearest Art:**
- US 2021-0282599 A1 — Multi-meal cold storage appliance
- WO 2022-031828 A1 — Automated food storage and meal preparation
- WO 2023-049126 A1 — Autonomous food preparation machine

**Gap:** All cold storage art is centralized in appliances or robots. No platform role where members register household freezers as compensated storage nodes in a logistics network.

---

### #1609 — Buffer Premium + Auto Charitable Release

**Concept:** Automatic price premium on buffer inventory with time-bounded availability window; unsold portions automatically route to charity.

**Nearest Art:**
- US 2011-0078050 A1 — Facilitating charitable donations via perishable inventory
- US 2005-0075933 A1 — Reduced-portion meals with excess to charity
- US 2008-0005017 A1 — Purchase price bifurcated into merchandise + donation

**Gap:** Existing art ties charity to the initial sale. Nobody implements buffer-queue semantics: pre-overproduced units enter a premium window, then auto-irrevocably transfer to charity on timeout.

---

### #1610 — Internal Currency Hold-and-Release

**Concept:** Platform-internal currency reserved at preorder time, not charged until staged conversion at procurement and delivery milestones.

**Nearest Art:**
- US 7,734,544 B2 (PayPal) — Multi-currency authorization and capture
- US 7,464,057 B2 — Multi-currency escrow service
- US 2023-0130845 A1 — Synchronous settlement engine with escrow
- US 2025-0156822 A1 — Smart contract escrow on distributed ledger

**Gap:** All escrow art holds real funds or digital currency at once. Nobody holds a platform-internal currency reservation that is only converted in stages tied to procurement/delivery milestones, with milestone-by-milestone release logic.

---

### #1611 — Charitable Buffer Top-Up

**Concept:** Cooperative charitable pool fills internal-currency shortfalls on preordered meals, capped and time-bounded per member.

**Nearest Art:**
- US 2004-0143491 A1 — Loyalty reward donation to charities
- US 2013-0226676 A1 — Affiliate purchases funding charitable pool
- WO 2024-019838 A1 — QR-based product purchase with percentage donation

**Gap:** Existing charity pools donate on top of completed purchases. Nobody uses a capped, time-bounded assistance pool to fill payment gaps at order time in an internal currency system.

---

### #1612 — Dual-Use Fulfilled Order Data

**Concept:** Fulfilled order data simultaneously drives a consumer-facing popularity leaderboard and internal platform load balancing across cooperative initiatives.

**Nearest Art:**
- US 11,038,952 B2 (eBay) — Connection service discovery and load rebalancing
- US 11,082,484 B2 (IBM) — Load balancing system with service capability data
- US 10,574,699 B1 (Amazon) — Load balancer request processing
- US 2024-0364781 A1 (Google) — Multi-cluster ingress traffic routing

**Gap:** All load-balancing art routes infrastructure-level traffic (packets, requests, compute). Nobody dual-purposes fulfilled order data for public popularity ranking + cross-initiative cooperative balancing.

---

### #1613 — Visual Pipeline with Claimable Bounty Slots

**Concept:** Supply chain pipeline diagram with claimable bounty slots showing capacity fill rate and open roles for self-organizing labor.

**Nearest Art:**
- US 8,631,021 B2 (Jostle) — Visual organizational roles (filled/unfilled)
- WO 2024-073505 A1 — Supply chain command platform with digital twin visualization
- US 2023-0005002 A1 — Automated self-organizing workers with multi-tier incentives

**Gap:** Existing art does visualization, capacity modeling, and self-organizing groups separately. Nobody combines a pipeline UI with claimable capacity slots as the central worker interaction surface.

---

### #1614 — Directed Thought contribution impact

**Concept:** Strategic human prompt cost compared to prevented wrong implementation cost in human-AI collaboration.

**Nearest Art:**
- US 2025-0321798 A1 — contribution impact estimations using prompt processing units (PPUs)
- US 2017-0060108 A1 — contribution impact-based automation recommendation
- Prompt management patents (WO 2024-186549, US 2024-0320476, US 2025-0384330)

**Gap:** PPU art measures contribution impact of running model vs. human doing the whole task. Nobody computes a per-prompt "avoided wrong-implementation cost" versus human cognitive cost as a directed thought contribution impact metric.

---

### #1623 — AI Tuner Role for Multi-Agent Team

**Concept:** Human director role designation for multi-agent AI team, derived from Crystal Singer operational metaphor for craft-based human-AI collaboration.

**Nearest Art:**
- US 2026-0025311 A1 — Multi-prompt/model orchestration for threat mitigation
- US 2025-0258870 A1 — Prompt self-optimization systems
- Microsoft prompt development systems (US 2024-0296316)

**Gap:** Existing art handles automated multi-agent orchestration and prompt refinement. Nobody defines a named human role ("AI Tuner") with explicit governance authority, responsibilities, and performance metrics for directing a team of AI agents as a craft-like collaboration.

---

## Conclusion

All 16 innovations occupy defensible positions relative to existing patent art. The key differentiation patterns across the portfolio:

1. **Worker-first vs. demand-first** (#1604, #1605, #1606) — existing platforms assign workers to demand; Liana Banyan lets workers define capacity
2. **Internal currency staging** (#1610, #1611) — existing escrow holds real funds at once; Liana Banyan stages internal currency across milestones
3. **Zero-waste economics** (#1607, #1608, #1609) — existing art handles charity as add-on; Liana Banyan builds charitable release into the production pipeline
4. **Human-AI craft collaboration** (#1614, #1623) — existing art automates away the human; Liana Banyan elevates human direction as the primary value creator

---

*Prior art research conducted March 2026 by PAWN (Legal Review Agent)*
*For Liana Banyan Corporation — Patent Filing Preparation*

**FOR THE KEEP.**
