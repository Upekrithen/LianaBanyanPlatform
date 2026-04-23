# Acknowledgment & Assignment — Innovations #2007 through #2009

**Date:** March 26, 2026
**Inventor:** Jonathan Jones
**Entity:** Liana Banyan Corporation (Wyoming C-Corp)
**Session:** Bishop 035 (processing Knight 128 + Founder vision)
**Status:** FORMAL

---

## Innovation #2007 — Four-Pathway Cold Start Hub: Animated Onboarding Convergence to Captain Status

### Description

A system and method within a cooperative commerce platform for onboarding new participants through a hub page presenting four distinct pathways, each tailored to a different economic activity, all converging to the same destination — Captain status:

(a) The Cold Start Hub (/start/cold-start) presents four animated pathway cards with distinct visual theming:
  - **Food** (orange gradient): Restaurant → campaign → community demand → food Captain
  - **Manufacturing** (slate gradient): Capabilities → orders → fulfillment → production Captain
  - **Service** (blue gradient): Skills → availability → clients → service Captain
  - **Local Business** (emerald gradient): Business → campaign → demand → pitch → business Captain

(b) Each pathway is a multi-step wizard that guides the user from zero knowledge to Captain-ready, with specific steps tailored to that economic domain. The wizards connect to existing platform features (campaign nomination, pitch packets, side quests, ADAPT Score) at natural integration points.

(c) The philosophical anchor: "All paths lead to Captain. Every Captain starts at 10." — the number 10 representing the minimum community engagement threshold before leadership becomes available.

(d) The hub is integrated into the existing onboarding flow (WhatDoYouWantFlow) as a "$0 to Captain" option, making it accessible from the very first interaction with the platform.

### Patent Relevance: MEDIUM

A cooperative commerce onboarding system wherein four distinct economic-activity pathways (food, manufacturing, service, local business) each present tailored multi-step wizards that converge to a common leadership status (Captain), creating a unified governance pipeline from diverse economic starting points — represents a novel approach to cooperative platform onboarding where every participant, regardless of entry point, follows a path to community leadership.

---

## Innovation #2008 — Scheduled LB Card Funding via Stripe: Recurring Purpose-Allocated Payments to Specific Prepaid Cards

### Description

A system and method within a cooperative commerce platform wherein:

(a) Any person (member, sponsor, employer, family member, or charity) can set up RECURRING payments through Stripe that fund a specific LB Card (Stripe Issuing prepaid card) on a configurable schedule:
  - **Daily**: e.g., $10/day for school meals
  - **Weekly**: e.g., $50/week for groceries
  - **Monthly**: e.g., $1,200/month for rent
  - **Custom interval**: any Stripe-supported billing cycle

(b) The target LB Card is identified by **member account + card serial number**:
  - Account connection provides authentication and authorization (who CAN fund this card)
  - Serial number identifies the specific physical card (which card receives the funds)
  - Both are required — account alone isn't enough (member may have multiple cards), serial alone isn't enough (no authentication)

(c) Funders can specify **purpose earmarking**: what the money is FOR (rent, food, transportation, medical, education, general). The card tracks funding by purpose, allowing the cardholder to see "You have $200 for food, $1,200 for rent, $50 for transportation" — though the funds are fungible on the card itself (earmarking is advisory/informational, not a spending restriction).

(d) **Multiple funders per card**: A single LB Card can receive scheduled funding from multiple sources:
  - Employer funds $200/month for transportation
  - Parent funds $50/week for food
  - Sponsor (ONE LEVEL — not MLM) contributes a one-time or recurring amount
  - Self-funding from own bank account

(e) This uses **Stripe Billing** (K121, already built) for recurring payment processing + **Stripe Issuing** (LB Card) for card funding. The two Stripe products connect natively.

### CRITICAL RULES
- LB Card funding is REAL MONEY, not Credits
- Credits NEVER fund LB Cards (Credits are one-way valve — money IN, never OUT as fiat)
- LB Card funding comes from: bank account, debit card, employer direct deposit, or external Stripe payment
- This is SEPARATE from the three-currency system

### The Vision

```
FUNDER (Stripe Billing)          LB CARD (Stripe Issuing)
─────────────────────            ────────────────────────
Parent sets up:                  Child's card shows:
  $10/day → Food                   Food: $70 (weekly total)
  $50/month → Transportation       Transport: $50

Employer sets up:                Employee's card shows:
  $200/month → Transport           Transport: $250 (combined)
                                   Food: $70

Sponsor sets up:                 Member's card shows:
  $25/month → General              General: $25
                                   Food: $70
                                   Transport: $250
                                   TOTAL: $345 available
```

### Patent Relevance: HIGH

A cooperative commerce platform wherein prepaid cards (Stripe Issuing) receive scheduled, purpose-earmarked funding from multiple sources (employers, sponsors, family, self) via recurring Stripe Billing payments — with card identification by member account plus serial number, and advisory purpose tracking — represents a novel cooperative approach to programmable card funding that enables community-supported financial infrastructure.

---

## Innovation #2009 — Community-Supported Card Funding: The Cooperative Safety Net as Infrastructure

### Description

A system and method within a cooperative commerce platform wherein the scheduled LB Card funding system (#2008) creates a community-supported financial safety net:

(a) **The "Rent Captain" Pattern**: A Captain can organize funding campaigns where multiple community members each contribute small scheduled amounts to help a member meet a recurring need. Example: 12 members each contribute $100/month = $1,200/month rent for a member in need. The Captain coordinates, the platform automates.

(b) **Employer Integration**: Businesses onboarded through the Campaign system (K127) can offer LB Card funding as an employee benefit — "We'll put $X/day on your LB Card for meals at our partner restaurants." This creates a closed-loop: business funds cards → cardholders spend at LB partner businesses → money circulates within the cooperative.

(c) **Charitable Initiative Connection**: The 16 charitable initiatives (Defense Klaus, MSA, LifeLine Medications, etc.) can allocate funds to member LB Cards for specific purposes. A member approved for LifeLine Medications gets their prescription costs funded directly to their card.

(d) **Ghost Rules for Non-Members**: Non-members can RECEIVE funded LB Cards (as a gift or sponsor benefit) but the card has Ghost Rules — it works for 24 hours, then the funds are held until the recipient creates a $5/year membership. This converts card recipients into members.

### Patent Relevance: HIGH

A cooperative commerce platform wherein prepaid cards serve as the infrastructure for community-supported financial safety nets — with Captain-coordinated group funding, employer closed-loop benefits, charitable initiative disbursement, and Ghost Rules conversion for non-members — represents a novel integration of cooperative governance with programmable financial infrastructure.

---

**ACKNOWLEDGED AND ASSIGNED**

Inventor: Jonathan Jones
Entity: Liana Banyan Corporation

- #2007 — Four-Pathway Cold Start Hub (animated convergence to Captain) — MEDIUM
- #2008 — Scheduled LB Card Funding via Stripe (recurring purpose-earmarked payments) — HIGH
- #2009 — Community-Supported Card Funding (cooperative safety net as infrastructure) — HIGH

**Innovation count: 2,050** (was 2,047)

**MILESTONE: Innovation #2050 reached.**

FOR THE KEEP.
