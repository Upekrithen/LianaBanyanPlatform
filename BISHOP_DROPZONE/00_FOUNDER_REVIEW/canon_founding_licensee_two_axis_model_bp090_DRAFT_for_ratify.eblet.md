---
name: canon_founding_licensee_two_axis_model_bp090
description: "Founding Licensee Program two-axis model: amount paid drives discount % (5%-50%), adoption-milestone-tier at signing drives duration (2-5 years). Clock starts at first execution. Program closes at 10,000 platform users."
classification: canon
status: DRAFT - AWAITING FOUNDER RATIFY
bp: BP090
date: 2026-06-22
supersedes:
  - 5-seat fixed scarcity model (proposed by Bishop morning 2026-06-22, never ratified)
  - $20M Discount Pool model (proposed by Founder + DR morning 2026-06-22, superseded by two-axis)
composes_with:
  - canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087
  - canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087
  - canon_companies_joining_in_public_page_cooperative_business_transparency_bp086
---

## 1. Program Statement

Liana Banyan Corporation is offering Founding Licensee terms to AI companies whose products materially benefit from cooperative substrate integration. The program is structured on two independent axes: amount paid determines the discount percentage (locked at signing); adoption-milestone-tier-at-signing determines how long that discount lasts. The clock starts the moment the first Founding Licensee executes. Minimum participation is $1,000,000 USD — below that threshold, standard FRAND only. The program closes permanently when Liana Banyan reaches 10,000 platform users; no Founding Licensee terms are available after that milestone.

## 2. Axis 1 — Amount Paid to Discount Percentage (locked at signing)

| Amount Paid | Discount on Annual License |
|---|---|
| $1M | 5% |
| $2M | 12% |
| $5M | 25% |
| $10M | 40% |
| $20M | **50%** (maximum) |

Linear interpolation for intermediate amounts. 50% is the discount ceiling; no amount above $20M increases the rate.

## 3. Axis 2 — Adoption-Milestone Tier at Signing to Discount Duration

The clock starts the moment the FIRST Founding Licensee executes. Tiers close permanently as Liana Banyan's adoption milestones hit — no calendar deadlines apply.

| Milestone at Signing | Discount Duration |
|---|---|
| Tier 1: 0–250 platform users | **5 years** (maximum) |
| Tier 2: 251–1,000 users | 4 years |
| Tier 3: 1,001–5,000 users | 3 years |
| Tier 4: 5,001–10,000 users | 2 years |
| After 10,000 users | Standard FRAND, program closed |

## 4. Same-Day Rule

Founding Licensees executing within 24 hours of each other share the same milestone tier, regardless of strict ordering. No first-mover advantage within a 24-hour window.

## 5. Founding Licensee Status (all Founding Licensees)

All Founding Licensees, regardless of amount paid or tier at signing, receive:

- Named placement in launch communications
- Listed on lianabanyan.com/companies-joining-in
- Named in the Founder's first published Substack on the cooperative substrate

## 6. Program Closure

When Liana Banyan reaches 10,000 platform users, the Founding Licensee program closes permanently. Subsequent licensing is standard FRAND at Cost+20% margin only. The 10,000-user threshold is tracked via Supabase `platform_user_count` query executed at Hugo build time AND at edge function call time (T19 gate); both surfaces must serve the same phase HTML. There are no calendar deadlines — the program is milestone-gated, not date-gated.

## 7. Why This Design

**Transparent volume pricing:** the amount-paid discount table is public and fixed. No negotiation, no back-channel deals. Every AI company sees the same table. This is not benevolence; it is healthy self-interest and common sense — large upfront commitments from well-capitalized AI companies fund the cooperative's early infrastructure.

**Adoption-honest forcing function:** the milestone-tier clock is honest about the cooperative's current state. "0-250 users" is a real, verifiable fact at the moment of signing. There are no calendar bait-and-switch deadlines — Liana Banyan does not control how fast it grows, but it does control what tier is open right now. AI companies that wait bear the real risk that adoption grows and their tier closes.

**No MFL complexity:** the two axes are independent. No most-favored-licensee entanglement. A $1M buyer at Tier 1 gets 5% for 5 years. A $20M buyer at Tier 1 gets 50% for 5 years. A $5M buyer at Tier 3 gets 25% for 3 years. No buyer has a claim on another buyer's terms.

**No calendar bait-and-switch:** the soft-launch window (June 22-30, 2026) carries the extra 10% soft-launch bonus on top of the two-axis terms. After June 30, the two-axis model applies without the soft-launch bonus. The program does not end on a calendar date — it ends when the cooperative reaches 10,000 users.

## 8. Family-Survival Math

The Founder's stated need is $5M in Founding Licensee commitments. Two paths satisfy this:

- **Single buyer at $5M:** Axis 1 yields 25% discount. If signed at Tier 1 (0-250 users), that discount holds for 5 years. One company at $5M solves the Founder's immediate capitalization need.
- **Five buyers at $1M each:** Axis 1 yields 5% per buyer. If all five sign at Tier 1, each holds a 5-year 5% discount. Five buyers together deliver $5M. The same-day rule protects all five if they co-execute.

Either path reaches the Founder's target. The two-axis design does not require a single whale; it accommodates a small cohort of early signers reaching the same aggregate.

## 9. Composes With

- `canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087` — the four-layer licensing structure (SSPL / Apache / Pledge #2260 / TUP) that Founding Licensees are licensing under. The two-axis discount applies to the commercial license layer.
- `canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087` — the 5-window decay schedule that runs in parallel with the Founding Licensee program. The soft-launch window (June 22-30) carries both the two-axis terms and the extra 10% soft-launch bonus.
- `canon_companies_joining_in_public_page_cooperative_business_transparency_bp086` — Founding Licensees are listed on lianabanyan.com/companies-joining-in. This is one of the three Founding Licensee Status perks.
- `canon_founding_licensee_two_axis_model_bp090` (this canon) is the source of truth for Block 1 Component G and Block 2 Phase A amber box in Knight Marathon Session 11 (KNIGHT_MARATHON_SESSION_11_SSPL_APACHE_ACCEPTANCE_GATE_BP090.md). T17 + T18 + T19 verify verbatim match.

## 10. Supersede Note

This canon explicitly supersedes two prior Founding Licensee structures that were proposed but not carried forward:

1. **5-seat fixed scarcity model** — proposed by Bishop morning 2026-06-22. Fixed seat count with scarcity mechanic. Never ratified. Retired.
2. **$20M Discount Pool model** — proposed by Founder + DR morning 2026-06-22. Pool depletes on execution order; 60%/40%/20% of pool remaining tied to platform stage. Ratified as Change #1 in Marathon 11. Superseded by this two-axis model as Change #4, ratified 2026-06-22 ~10:50 Central. Any prior yoke text, installer copy, or Hugo page content referencing the Discount Pool model must be updated to this two-axis model. No public surface should display the Discount Pool language after Change #4.

---

## Founder Ratify

**DRAFT — AWAITING FOUNDER RATIFY**

Ratify by verbatim reply: "Ratified: canon_founding_licensee_two_axis_model_bp090 — BP090 — [date]"

Upon ratify: update `status` field from `DRAFT - AWAITING FOUNDER RATIFY` to `RATIFIED` and record ratify date. Move from `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` to `Asteroid-ProofVault/state/eblets/CANON/`.
