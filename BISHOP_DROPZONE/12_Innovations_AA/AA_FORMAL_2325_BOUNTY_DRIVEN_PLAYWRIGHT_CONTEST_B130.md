---
name: Bounty-Driven Playwright Contest (Bounty Poster + Larks Integration for Member-Submitted Plays)
description: A bounty-and-contest mechanism integrating Bounty Poster and Larks primitives to drive directed member Play creation for The Repertory marketplace, with reputation-gated entry, amplifier-dispatched high-value bounties, and empirical Cost-Slasher receipts closing the bounty-strategy feedback loop.
type: aa_formal
innovation_id: "2325"
ratification_session: B130
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - bounty driven playwright contest
  - bounty poster larks play contest
  - directed play creation repertory marketplace
  - aa formal 2325
  - playwright contest b130
  - member submitted plays bounty
  - contest bounty play submission repertory
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2325 -- Bounty-Driven Playwright Contest (Bounty Poster + Larks Integration for Member-Submitted Plays)

**Filed**: B130, 2026-04-27 by Bishop on Founder direction *"draft."* Sibling D under #2321 The Repertory umbrella.

**Status**: ⚠️ **FIRST DRAFT — STUB-STAGED FOR CANON GAPS.** Bishop has not yet completed the Bounty Poster + Larks canonical-mechanics cross-reference (open chapter flagged B130 for post-filing fill-in). Filing locks priority date 2026-04-27 alongside siblings #2321 / #2322 / #2323 / #2324. Full claim development continues post-Founder-confirmation of Bounty Poster + Larks specs.

**Class**: Crown Jewel sibling. Independently patentable contest-and-bounty mechanism for member-driven contribution to a substrate marketplace.

**Predecessors**: Bounty Poster (LB canonical primitive — needs canon-grep); Larks (LB canonical primitive — needs canon-grep); Amplifier Program (#2318/#2319/#2320) — bounty-dispatch infrastructure; Rolodex (#2233) reputation gating; Marks one-way ratchet; The Repertory umbrella (#2321).

**LB membership pricing**: unchanged at $5/year (membership-orthogonal). This filing concerns contest mechanics for marketplace-contribution incentives, not membership pricing.

---

## Why a separate CJ from #2321 umbrella

#2321 establishes the marketplace; #2322 the Scribe-class; #2323 the voting; #2324 the economics. #2325 specifically claims the **bounty-driven contribution mechanism** — how LB drives directed Play creation via bounties + contests, separate from organic Member submission. Independently patentable as a contest-driven member-marketplace primitive.

---

## Claim 1 — Bounty Poster integration for Play category bounties

LB or LB Members can post bounties for specific Play categories using the existing Bounty Poster infrastructure:
- Bounty specifies: target LLM-call class to substitute, expected savings range, claim-deadline, prize structure (Marks + reputation + listing privileges)
- Posted bounties surface in The Repertory's "Open Bounties" section
- Members (Playwrights) can claim a bounty by committing to ship a Play matching the spec by the deadline
- Multiple Members can independently claim the same bounty; a contest emerges naturally (the first Play to pass peer review with empirically-demonstrated savings ≥ bounty claim wins; runners-up may still list as alternative Plays)

Bounty categories organized by LLM-call class being substituted, matching the Larks taxonomy (canonical Larks specs to be cross-referenced in scope-completion pass).

---

## Claim 2 — Larks integration for category taxonomy + scoring

Larks (existing LB primitive — canonical mechanics to be cross-referenced) provides the category taxonomy + scoring rubric that:
- Organizes Bounty Poster categories (data validation, format conversion, regex extraction, schema mapping, deterministic content generation, etc.)
- Scores submitted Plays against the bounty spec on multiple dimensions (correctness, savings-achieved, code quality, documentation, test coverage)
- Aggregates community ratings from reputation-backed Members per #2323

The Larks scoring rubric is the empirical-evaluation substrate for bounty winners. Plays scoring above category threshold win bounties; Plays scoring near-threshold list as alternative options.

---

## Claim 3 — Amplifier Program composition for high-value bounties

For high-value bounties (large expected savings, broad applicability, strategic platform priority), the Amplifier Program (#2318/#2319/#2320) composes:
- Amplifier Threshold System (#2318) — qualifying members at amplifier-threshold can dispatch high-value bounties to their networks
- Battery Dispatch Threshold Fan-Out (#2319) — bounty announcements fan out to threshold-amplifiers' networks
- Cue Card Auto-Attach (#2320) — bounty-summary cue cards auto-attach for amplifier resharing, friction-to-amplify approaches zero
- Result: high-value bounties get ecosystem-amplified beyond LB-internal Member base, drawing skilled Playwrights from broader network

This makes the Repertory contest mechanism **scale-appropriate**: small bounties handled by direct-Member submission; large bounties handled by amplifier-driven ecosystem dispatch.

---

## Claim 4 — Reputation-gated contest entry + listing

Contest entry is gated by reputation tier per #2323 voting + #2324 listing rules:
- **L1 Members** can enter contests but cannot win paid bounties (entry is optional contribution; winners selected from L2+ pool)
- **L2+ Members** are eligible for paid bounty awards
- **L3+ Members** are eligible for high-value strategic bounties (where bounty value × claim risk justifies higher trust requirement)
- **L4 Members** can co-sponsor bounties (using their Marks balance to fund bounties they care about; recovers funding when winning Plays produce empirical savings receipts)

Reputation gating prevents low-trust Members from gaming bounties via low-quality submissions while preserving the freedom for any Member to contribute (L1 entries can still earn reputation toward higher tiers).

---

## Claim 5 — Empirical receipts close the loop (bounty → Play → savings → next-bounty)

Each bounty cycle produces a closed empirical loop:
1. Bounty posted with claimed expected savings
2. Plays submitted; Larks scores them; community votes per #2323
3. Winning Play(s) list on marketplace at savings-priced tier per #2324
4. Audience Members install + use; Cost-Slasher receipts accumulate
5. Empirical savings data feeds back: was the bounty's claim accurate? Should follow-on bounties target similar categories?
6. Strategic bounty roadmap evolves based on receipt-driven evidence (vs. theoretical-savings-claims)

The architectural property: **bounty strategy improves over time via Cost-Slasher receipt evidence**, not via theoretical projections. Each completed bounty cycle is an experiment whose results inform the next.

---

## Open scope (substantial — Bishop's open chapters acknowledged)

This sibling has the most open scope of the five Repertory filings, by design:
- **Bounty Poster canonical mechanics** — Bishop has not yet grepped the canonical Bounty Poster specs in `BISHOP_DROPZONE/` or memory; cross-reference to be completed post-filing
- **Larks canonical mechanics + taxonomy** — same canonical-mechanics-grep pending
- **Amplifier Program integration specifics** — high-value bounty dispatch threshold + amplifier-network-fan-out requires post-launch empirical tuning per #2318/#2319
- **Bounty pricing methodology** — Marks-based bounty values; how funded; refund mechanics for unclaimed bounties
- **Contest dispute resolution** — when multiple Plays meet bounty spec; tie-breaking rules; runner-up consolation rewards
- **L4 co-sponsorship mechanics** — how Members fund their own bounties; risk-of-loss; revenue-share if winning Play sells well

This filing intentionally locks priority date with the umbrella + 3 other siblings, preserving stub-claim status pending Founder confirmation of Bounty Poster + Larks canonical mechanics. Pattern matches #2320 Cue Card Auto-Attach (B129 stub-staged) — file priority-locking, develop full claims post-launch with empirical tuning.

---

## Provenance

- **Founder direction B130 (contest framing)**: *"We could even make it a contest (Bounty Poster, and Larks) to submit different categories of python scripts to make all kinds of things inexpensive and effective"*
- **Founder direction B130 (incentive framing)**: *"That incentivizes it for the Members to Make, in my opinion."*
- **Bounty Poster + Larks canonical**: existing LB primitives (canon-grep pending Bishop completion)
- **Amplifier Program canonical**: #2318/#2319/#2320 (B129-filed); `project_amplifier_program_b129.md`
- **Sibling under**: #2321 The Repertory umbrella; co-filed with #2322 / #2323 / #2324

---

*Filed #2325 by Bishop B130 (first draft, stub-staged). Bounties drive contributions; receipts close the loop; reputation gates the gates. FOR THE KEEP!*
