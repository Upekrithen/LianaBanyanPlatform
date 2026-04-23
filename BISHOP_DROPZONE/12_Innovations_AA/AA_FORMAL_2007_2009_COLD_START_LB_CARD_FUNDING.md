# A&A FORMAL — Innovations #2007-#2009
## Cold Start Hub + Scheduled LB Card Funding
**Bishop Session:** 035 | **Date:** March 27, 2026 | **Knight:** K128 (Hub), Design (Funding)
**Status:** K128 DEPLOYED | Funding: DESIGN COMPLETE

---

### Innovation #2007 — Cold Start Hub (Four Pathways → Captain)
**Type:** Production System
**Category:** Onboarding — Pathway Selection

**Description:**
An animated hub presenting four (now six with Guilds and Tribes) distinct entry pathways into the cooperative economy, all converging on Captain status. Each pathway is a color-coded card with staggered animation:
- 🍊 Food (orange) — Restaurant campaigns, Family Table, meal pipeline
- 🔩 Manufacturing (slate) — Maker capabilities, production cascade, factory nodes
- 🔵 Service (blue) — Service listing, availability, ADAPT Score, reputation
- 🟢 Local Business (emerald) — Campaign nomination, demand signals, pitch packets
- 🟣 Guild (purple) — Professional association formation (added K133)
- 🟡 Tribe (gold) — Personal community formation (added K133)

"All paths lead to Captain. Every Captain starts at 10."

**Architecture:**
- `/start/cold-start` — Hub page with animated pathway cards
- Each card routes to a multi-step Cue Card wizard specific to that pathway
- Wizards connect to existing systems (campaigns, maker dashboard, service listing, etc.)
- WhatDoYouWantFlow updated with "COLD START — $0 to Captain" entry point

**Cooperative Significance:**
The Cold Start Hub solves the "what do I do first?" problem for cooperative platforms. Traditional co-ops require education before participation. The Hub inverts this: pick your lane, follow the steps, arrive at Captain. Six pathways = six Production Levels. Every type of economic participant has a door.

**Connected Innovations:** #1972 (Universal Business Onboarding), #2015 (Guild Formation), #2020 (Tribe Formation)
**Production System:** #26 (Cold Start Hub)

---

### Innovation #2008 — Scheduled LB Card Funding via Stripe
**Type:** Feature (Crown Jewel candidate)
**Category:** Financial Infrastructure — Recurring Card Funding

**Description:**
Using Stripe Billing + Stripe Issuing together, anyone can set up RECURRING payments that fund a specific LB Card on a configurable schedule. The funder chooses:
- **Which card** — Identified by member account + card serial number (account for auth, serial for physical card ID)
- **How much** — Any dollar amount
- **How often** — Daily, weekly, bi-weekly, monthly, or custom
- **What for** — Purpose earmarking: rent, food, transportation, education, childcare, general

Examples:
- A parent funds a child's food card: $10/day for school meals
- An employer funds worker transportation: $200/month
- A sponsor funds a family's rent: $1,200/month
- A cooperative member self-funds their own card: $50/week grocery budget

**Architecture:**
- Stripe Billing subscription → charges funder's payment method on schedule
- Stripe Issuing top-up → adds funds to target LB Card balance
- Card identified by: member account (authenticated) WITH serial number (physical ID)
- Purpose tags stored in metadata (informational, not restrictive — the card works everywhere)

**CRITICAL RULES:**
- LB Card is funded SEPARATELY from Credits. Credits NEVER cash out to fiat.
- LB Card money is REAL MONEY on a prepaid card (Stripe Issuing).
- Credits are cooperative currency. LB Card is dollar-denominated prepaid.
- These are two completely separate systems that happen to coexist on the same platform.

**Cooperative Significance:**
This turns the LB Card into a programmable, scheduled funding channel. For cooperative economics, this is revolutionary — it means an employer can fund worker meals directly, a community can fund a family's rent, a guild can fund member tools. The money flows THROUGH the cooperative infrastructure but IS real money. No conversion, no tokens, no friction.

**Connected Innovations:** #1967 (LB Card Direct Funding), #2009 (Community-Supported Funding)

---

### Innovation #2009 — Community-Supported Card Funding
**Type:** Feature
**Category:** Financial Infrastructure — Collective Funding

**Description:**
Multiple funders can contribute to the same LB Card for different purposes. A single card might receive:
- $10/day from Mom (food)
- $200/month from Employer (transport)
- $50/month from Guild Treasury (tools)
- $25/month from self (discretionary)

Each funding stream is independent — its own Stripe subscription, its own schedule, its own purpose tag. The card holder sees a unified balance but can view the breakdown by source.

**Cooperative Significance:**
This is community-supported finance. Instead of one paycheck from one employer, a cooperative member can receive structured support from their entire economic network. This mirrors how cooperatives actually work — multiple relationships, each contributing value. The LB Card makes this tangible and automatic.

**Connected Innovations:** #2008 (Scheduled Funding), #1967 (LB Card Direct Funding)

---

**Innovation Count after #2009:** 2,009
**Crown Jewels:** 132 → 133 (#2008 Scheduled LB Card Funding — candidate)
