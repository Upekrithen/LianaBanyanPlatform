---
name: Savings-Priced Play Marketplace (Member-to-Member Sales Priced by Demonstrated Token Savings)
description: A cooperative member-to-member marketplace where Python-script Plays are priced by empirically-demonstrated token-cost savings, with money flowing to the Playwright creator at Cost+20% platform margin, reputation-gated listing tiers, and Conductor auto-computation of net savings at routing time.
type: aa_formal
innovation_id: "2324"
ratification_session: B130
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - savings priced play marketplace
  - member to member play sales token savings
  - cost plus twenty margin playwright
  - aa formal 2324
  - savings priced marketplace b130
  - price anchored to demonstrated value
  - plays priced by savings repertory marketplace
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2324 -- Savings-Priced Play Marketplace (Member-to-Member Sales Priced by Demonstrated Token Savings)

**Filed**: B130, 2026-04-27 by Bishop on Founder direction *"draft."* Sibling C under #2321 The Repertory umbrella.

**Status**: ✅ **FULL FIRST DRAFT.** Founder direction B130 ratified marketplace economics: *"The money doesn't go to us, it would go to the Scripter - Programmer. As a business contract making money."* + *"We could even introduce those scripts, with ratings from reputation backed members, as for sale for what they save - to other members. That incentivizes it for the Members to Make, in my opinion."*

**Class**: Crown Jewel sibling. Independently patentable economic primitive — savings-priced marketplace where price is empirically anchored to demonstrated token-cost reduction, with money flowing to creator (not platform).

**Predecessors**: Cost+20% margin (`feedback_margin_not_tax.md`); Cost-Slasher (#2272); Conductor's Baton (#2277); Marks one-way ratchet; Rolodex (#2233) reputation tiers; Pedestal staking (Upekrithen seller-of-record pattern); existing LB business-contract infrastructure.

**LB membership pricing**: unchanged at $5/year (membership-orthogonal). Marketplace transactions are SEPARATE from membership — analogous to Pedestals, Larder, etc. — and concern API spend / compute cost reductions (industry terms), not membership pricing structure.

---

## Why a separate CJ from #2321 umbrella

#2321 establishes the marketplace structure; #2322 the Scribe-class; #2323 the voting/governance. #2324 specifically claims the **economic mechanism** — how Plays are priced, how money flows, and how reputation gates listing privileges. Independently patentable as a marketplace-pricing-by-demonstrated-savings primitive applicable beyond The Repertory (e.g., any marketplace where service value can be empirically quantified per use).

---

## Claim 1 — Pricing anchored to demonstrated token savings (not list-price)

Plays in The Repertory are priced via a **savings-anchored model**, not arbitrary list-price:
- A Play's listed price is paired with its **claimed savings** (e.g., "this Play substitutes for an LLM call costing $0.50/invocation; expected savings $0.45/invocation = 90% reduction")
- The marketplace UI displays both the price AND the empirical savings receipts from prior Audience Members' Performances (anchored via Cost-Slasher #2272 receipt schema)
- A buyer's purchase decision is informed by *empirically-demonstrated* savings, not seller-claimed savings — the receipts come from real prior runs of the Play in real Audience contexts
- Price calibration over time: a Play whose empirical savings stay above its claimed-savings level retains buyer confidence; a Play whose receipts fall short triggers automatic price-review by the Playwright

The architectural property: **price is locked to demonstrated value, not aspirational claim**. This protects buyers from over-claimed savings AND incentivizes Playwrights to ship Plays that genuinely deliver. The Cost-Slasher receipt schema is the empirical-anchor substrate.

---

## Claim 2 — Money flows to Playwright; LB takes Cost+20% margin (reciprocal engine, not platform tax)

The economic flow is preserved by Founder ratification:
- **Audience pays Playwright** the Play's listed price (member-to-member business contract)
- **LB takes Cost+20% margin** to cover platform infrastructure (sandbox compute, marketplace UI, Conductor's Baton routing computation, IP-ledger storage) — per `feedback_margin_not_tax.md`, this is the reciprocal engine, not a platform-extraction fee
- The 20% margin is calculated against actual platform-cost-of-service (Cost+20% means Cost-of-service plus 20%, not 20% of transaction value)
- Transparency: each Performance's full cost-flow is auditable via Synapses receipts (Audience-paid, Playwright-received, LB-margin-charged amounts disclosed)

This contrasts conventional marketplaces (App Store, mobile-app marketplaces, etc.) that take percentage-of-revenue cuts ranging 15-30%. The cooperative-engine inversion: LB exists to *return* value to members; the margin services the substrate, not extraction. Members keep what they make (Keystone #42 — *"You keep what you make."*).

---

## Claim 3 — Reputation-tier gating for listing privileges

Listing on The Repertory marketplace is gated by Rolodex (#2233) reputation tier:
- **L1** (basic verified Member): can list **free Plays only** (gift to community; no monetary transaction)
- **L2** (sponsored or contribution-active): can list **paid Plays** at moderate price tiers
- **L3** (high-trust, multi-domain contributor): can list **paid Plays** at any price tier
- **L4** (verified expert in the Play's category): can list **premium-priced Plays** + categorical reviewer privileges

Tier-gating prevents unverified Members from spamming the marketplace with low-quality paid Plays while preserving the freedom for any Member to contribute free Plays as a gift. The reputation system is earned (per Rolodex 4-level reciprocal promotion mechanism), not purchased — listing privileges are a function of network contribution, not commercial buy-in.

---

## Claim 4 — Conductor's Baton auto-computes savings during routing decisions

The Conductor's Baton (#2277) extension under #2324:
- When the Conductor would route to LLM call X for a query class, AND a Repertory Play P exists serving class X, the Conductor computes (in real-time):
  1. The token-cost the LLM call would incur
  2. The Play P's empirical savings (from prior Performances against the same query class)
  3. The Audience Member's net savings if they choose Play P (Play price - LLM-equivalent-cost = net savings)
- The Conductor surfaces both options to the Audience Member with the empirical savings figure attached
- If the Audience Member selects Play P, the Performance's Cost-Slasher receipt feeds back into Play P's empirical-savings dataset

This makes savings-pricing **self-validating over time**: each Performance refines the demonstrated-savings figure; the marketplace UI shows live-updated savings receipts. Subjective claims are progressively replaced by objective receipts.

---

## Claim 5 — I.P. Ledger Category dedicated to Plays

Plays receive their own dedicated I.P. Ledger Category (per Founder direction B130: *"That's also why these have their own I.P. Ledger Category"*):
- Distinct from patent-class IP per `project_ip_load_balancing_v2.md`'s 60/20/10/10 split
- Tracks Time Capsule snapshots (#2303) at each Play's submission moment — Chronicler-based snapshot, no separate storage
- Records Playwright authorship for IP attribution + revenue distribution
- Filed under #2260 Cooperative Defensive Patent Pledge framework — Plays accessible to all cooperative-network members (no rent-seeking via Play-IP-hoarding)
- Versioning via semver pinned at install moment; Time Capsule resolves the exact Play version a given Performance executed

The Plays-IP-Ledger-Category is the architectural primitive that allows Plays to be both **member-monetizable** (creators earn from sales) and **cooperative-network-accessible** (the Play's underlying patentable logic remains under the Pledge). This compose-not-conflict pattern preserves the LB cooperative-engine ethos while enabling Playwright income.

---

## Open scope

- Specific Cost+20% margin computation methodology (which platform-cost-of-service components are included; how is the 20% applied per-transaction)
- Tier-gating thresholds (L1 free-only / L2 moderate-paid / L3 any-price / L4 premium) — specific price-ceilings per tier
- Conductor's Baton "script-first when applicable" auto-routing default vs Member-opt-in (relates to Power-Contained #54 — AUTO default works; manual override available in Nerd Mode)
- Cross-Cathedral marketplace federation (#2266 Sphinx-Federation pod-to-pod Play access; cross-pod price normalization)
- Pricing dispute resolution (when claimed savings ≠ empirical savings; refund mechanism + reputation effects)

---

## Provenance

- **Founder direction B130 (Q4 marketplace economics)**: *"The money doesn't go to us, it would go to the Scripter - Programmer. As a business contract making money."*
- **Founder direction B130 (savings-priced framing)**: *"We could even introduce those scripts, with ratings from reputation backed members, as for sale for what they save - to other members. That incentivizes it for the Members to Make, in my opinion."*
- **Cost+20% margin canonical**: `feedback_margin_not_tax.md` (reciprocal engine, not platform tax)
- **Cost-Slasher receipt schema**: #2272 Cost-Slasher; `project_librarian_cost_slasher_angle.md` marketing framing
- **Reputation tier canonical**: `project_the_rolodex.md` + #2233 Rolodex 4-level reciprocal promotion
- **Sibling under**: #2321 The Repertory umbrella; co-filed with #2322 / #2323 / #2325

---

*Filed #2324 by Bishop B130 (full first draft). Price = demonstrated savings; money to the Scripter; LB infrastructure on Cost+20%. FOR THE KEEP!*
