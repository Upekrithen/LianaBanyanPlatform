---
name: Pioneer Proposal Rewards (Rolodex Recruitment Pipeline)
description: A diminishing-priority reward system for cooperative members who propose external vendors or individuals for platform membership, distributing rewards on order-based (100%/50%/25%/10%) and time-decay scales, strictly one-level-deep as a structural anti-MLM guarantee, with automatic Rolodex connection formed upon the proposed party joining.
type: aa_formal
innovation_id: "2252"
ratification_session: B098
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - pioneer proposal rewards rolodex recruitment
  - diminishing priority proposal reward system
  - anti-mlm one-level-deep enforcement
  - aa formal 2252
  - pioneer proposal time-decay rewards
  - rolodex automatic connection on join
  - multi-proposer ordered recruitment attribution
  - no effort wasted proposal reward floor
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal #2252 — Pioneer Proposal Rewards (Rolodex Recruitment Pipeline)

**Innovation #:** 2252 (renumbered in B098 from former #2235 per `INNOVATION_RENUMBERING_LOG_B098.md`)
**Category:** Content / Commerce / Recruitment Economics
**Crown Jewel:** **YES**
**Original Session:** B093 (April 9, 2026)
**Renumbering Session:** B098 (April 11, 2026)
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Patent Relevance:** Prov 13 thresh
**Source:** `BISHOP_DROPZONE/INNOVATIONS_2234_2235_AFFILIATIONS_PIONEER_B093.md`
**Production Status:** Shipped via Knight K388 (pioneer_proposals and pioneer_rewards tables live in production)

---

## TL;DR

A diminishing-priority reward system for cooperative members who propose that specific external vendors, creators, or individuals join the cooperative platform. Proposals are timestamped and ordered; when a proposed person actually joins the cooperative, rewards distribute on a diminishing scale to all prior proposers (1st=100%, 2nd=50%, 3rd=25%, 4th+=10% floor), with time-decay applied independently (proposals older than 7 days retain 100%, older than 30 days retain 25%, older than 90 days retain 10%). **The reward operates strictly one-level-deep** — only the direct proposers of the joining member earn rewards; the joining member's subsequent proposals earn rewards to themselves, not to their original proposer (structural anti-MLM guarantee). Proposed vendors receive a fill-in-the-blank business plan template pre-populated from the original proposer's research, enabling fast onboarding. The first proposer of a joining member becomes that member's automatic Rolodex connection upon join.

---

## Independent Claim

**Claim 1.** A computer-implemented method for distributing recruitment rewards among multiple proposers of an external party joining a cooperative platform, comprising:

(a) Receiving, from cooperative members, proposals comprising an identifier of the proposed external party, a descriptive narrative, optional business plan template fields, and a timestamp;

(b) Computing a proposal order for each proposal relative to prior proposals targeting the same external party identifier;

(c) Detecting a join event when the proposed external party becomes a cooperative member;

(d) Upon detection of the join event, computing a reward allocation for each prior proposer as the minimum of (i) an order-based reward percentage selected from a diminishing sequence (100%, 50%, 25%, 10%) corresponding to the proposer's proposal order, and (ii) a time-decay reward percentage selected from a decay sequence (100%, 25%, 10%) corresponding to the elapsed time since the proposal was submitted;

(e) Distributing the computed reward to each prior proposer in the cooperative's native governance currency (Marks), wherein the distribution is strictly one level deep and does not propagate to any proposer upstream of the direct proposers;

(f) Creating, upon the join event, an automatic peer connection in the cooperative's Rolodex system between the first-ordered proposer and the newly-joined member;

(g) Delivering to the newly-joined member a business plan template pre-populated with data extracted from the original proposer's submission.

**Dependent Claim 1.1** — The method of Claim 1, wherein the one-level-deep restriction of (e) is enforced by computing rewards only against the proposers in the immediate pioneer_proposals table for the joining member, without traversing any downstream proposal graph originating from the joining member's subsequent proposals.

**Dependent Claim 1.2** — The method of Claim 1, wherein the minimum-of-two-decays formula of (d) prevents reward inflation whereby an early proposer (high order percentage) who submitted long ago (low time percentage) receives only the lower of the two, consistent with the cooperative's no-effort-wasted floor-rewarding philosophy.

**Dependent Claim 1.3** — The method of Claim 1, wherein the reward currency is Marks and is subject to the cooperative's one-way-valve constraint (Marks cannot convert to fiat), distinguishing the method from cash-based affiliate and referral programs.

**Dependent Claim 1.4** — A system comprising a processor, a proposals database, a rewards ledger, a Rolodex connection database, and instructions stored on a non-transitory computer-readable medium which, when executed, cause the processor to perform the method of Claim 1 through Claim 1.3.

---

## Prior Art Distinction

Traditional referral programs (Uber, Airbnb, Dropbox) are single-referrer attribution systems with cash or credit payouts. Affiliate programs (Amazon Associates, ShareASale) use cookie-based single-attribution with no multi-proposer acknowledgment. Multi-level marketing systems propagate rewards across multiple levels of referral, generating the extractive hierarchy the cooperative explicitly rejects. **No system combines (a) multi-proposer ordered attribution with (b) a diminishing-reward-with-floor structure that honors every effort, (c) time-decay applied independently of order, (d) strict one-level-deep enforcement as an anti-MLM structural guarantee, (e) pre-populated business plan template delivery, (f) automatic Rolodex connection formation, and (g) cooperative currency denomination with a one-way-valve constraint.** The combination is novel.

---

## Cross-References

- **Original source file (B093):** `INNOVATIONS_2234_2235_AFFILIATIONS_PIONEER_B093.md`
- **Renumbering log:** `INNOVATION_RENUMBERING_LOG_B098.md`
- **Production implementation:** Knight K388 (live in production Supabase)
- **Related innovations:** #2233 The Rolodex, Cue Card Pioneer Program (#2104), Golden Key Re-Stamping (#1026) — time-decay pattern origin, Linchpin Influencer Program — anti-MLM rule origin, Pudding #24 "No Effort Is Wasted"
- **Refer to B093 source file for complete technical implementation detail, reward formula derivation, and business plan template schema.**

---

**FOR THE KEEP.**
