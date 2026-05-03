---
name: Voting-by-Install-and-Use (Marks-Deposit Reputation-Weighted Marketplace Governance)
description: A cooperative marketplace governance primitive where members vote on Plays via small Marks deposits refunded upon verified report-back, with votes weighted by Rolodex reputation tiers, making installation and authentic use the governing signal rather than separate polling forms.
type: aa_formal
innovation_id: "2323"
ratification_session: B130
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - voting by install and use
  - marks deposit refund on report back governance
  - reputation weighted marketplace voting
  - aa formal 2323
  - voting install use b130
  - rolodex tier vote weighting
  - pay to install refund on report back authentic voting
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2323 -- Voting-by-Install-and-Use (Marks-Deposit Reputation-Weighted Marketplace Governance)

**Filed**: B130, 2026-04-27 by Bishop on Founder direction *"draft."* Sibling B under #2321 The Repertory umbrella.

**Status**: ✅ **FULL FIRST DRAFT.** Founder direction B130 ratified the Marks-deposit-and-refund-on-report-back mechanism: *"Not if you pay for it. Use what LB already has going for it. In fact, we can make it pay for it in marks and get that back when you report how it worked."*

**Class**: Crown Jewel sibling. Independently patentable governance primitive applicable beyond The Repertory (e.g., any marketplace where adoption + use signals must be authentically distinguished from gaming).

**Predecessors**: Marks one-way ratchet (`project_mark_backing_oneway.md`); The Rolodex (#2233) reputation tiers; Synapses (#2287) reasoning-moment receipts; existing LB voting / governance primitives; Cost-Slasher (#2272) receipt-driven empirical anchors.

**LB membership pricing**: unchanged at $5/year (membership-orthogonal). This filing concerns marketplace governance currency mechanics using Marks (effort-differential currency, all backed), not membership pricing structure.

---

## Why a separate CJ from #2321 umbrella

#2321 establishes the marketplace; #2322 the Scribe-class. #2323 specifically claims the **governance mechanism** — how members' choices about which Plays to install and use are converted into reputation-weighted votes that drive marketplace adoption signals. The mechanism is independently patentable and composes with non-Repertory contexts (any marketplace where pay-to-vote integrity matters: governance proposals, content curation, feature requests, etc.).

The Founder's framing: *"voting (which in this instance can simply be tracked through the LB Frame as what you as a user chose to install and use from the EXTENSIVE library of python scripts - with reputation etc IF you are an LB Member - you can't benefit from LB network without contributing to it."*

---

## Claim 1 — Pay-to-install Marks deposit mechanism

To install a Play from The Repertory, a Member pays a small Marks deposit (Marks = backed effort-differential currency, distinct from $5/year membership which remains unchanged). The deposit is small but non-zero — sufficient that gaming the install-count via fake installs would cost real Marks.

The deposit-and-refund cycle:
1. Member discovers Play via Conductor's Baton routing or marketplace browse
2. Member chooses to install: **Marks deposit charged** (e.g., 5 Marks, calibrated against real-effort-equivalent scale)
3. Member runs Play one or more times (Performance receipts logged via Synapses #2287)
4. **Member submits report-back**: structured assessment (qualitative: did it work as advertised? quantitative: what savings did you actually get?)
5. **On verified report-back, Marks deposit is refunded** plus optional bonus Marks for thorough qualitative reports (calibrated to incentivize report quality without over-incentivizing rote reporting)
6. The deposit-transaction-record + refund-transaction-record + report-content together constitute the Member's *authentic vote* on the Play

If the Member never reports back, the deposit is not refunded (becomes platform reciprocal-engine credit). Anti-gaming property: gaming requires real Marks, and gaming the report-back layer requires verified content quality.

---

## Claim 2 — Reputation weighting via Rolodex tiers

A Member's vote (the deposit + report-back transaction record) is weighted by the Member's Rolodex (#2233) reputation tier:
- **L1** (basic verified Member): 1× weight
- **L2** (sponsored or contribution-active): 2× weight
- **L3** (high-trust, multi-domain contributor): 3× weight
- **L4** (verified expert in the Play's category): 5× weight + listing privileges + review-pipeline gates

Reputation weighting honors the Conductor's quality-gate-then-cost-optimize pattern (#2277). High-reputation Members' aggregated votes shape the marketplace adoption ranking; low-reputation Members can still vote (their deposit-and-report mechanism still works) but their weight is appropriately calibrated.

Reputation tier itself is earned via the existing Rolodex 4-level reciprocal promotion mechanism — not a separate currency, not a paid-for-tier — meaning vote weight reflects genuine LB-network contribution, not commercial purchase.

---

## Claim 3 — Anti-gaming via Marks-flow anomaly detection + reputation slashing

Beyond the cost-of-deposit floor, the system detects gaming patterns:
- **Marks-flow anomaly detection**: Sentinel-class Scribes monitor deposit-flow patterns. Anomalous patterns (e.g., a single Member depositing on dozens of Plays in rapid succession; coordinated install-campaigns from a member-cluster) trigger investigation
- **Report-back content quality auditing**: peer review of report contents; reports that are template-copied or sentiment-fake trigger reputation slashing
- **Reputation slashing on detected gaming**: Members caught gaming have their Rolodex tier downgraded (e.g., L3 → L1, with privileges and listing access revoked); slashing is logged via Synapses for audit
- **Cooling-off**: a slashed Member must rebuild reputation through demonstrated authentic contribution before regaining tier privileges (Rolodex 4-level reciprocal promotion mechanism handles this naturally)

This makes voting-by-install-and-use both **passive** (Members don't have to fill out separate vote-forms — installing and using IS the vote) and **integrity-protected** (gaming costs real Marks + risks reputation; authentic use costs Marks that come back via refund).

---

## Claim 4 — Composition with Marks one-way ratchet + reciprocal-contribution principle

The Marks deposit mechanism honors the Marks one-way ratchet (`project_mark_backing_oneway.md`): all Marks are backed effort-differential, never converted back to fiat. The deposit cycle moves Marks within the LB economy:
- Deposit charged to Member's Marks balance
- Refund credited to Member's Marks balance after report-back
- Unrefunded deposits flow to the platform's reciprocal-engine credit (not extraction; reinvested into substrate maintenance)

The reciprocal-contribution principle (`feedback_attribution_one_level.md`): non-members cannot vote because non-members cannot install (membership-gated marketplace per #2321 Claim 3). The right to influence the marketplace's evolution is earned through participation, not separate from it.

This is the LB inversion of conventional marketplace voting: instead of "anyone can rate anything" (which produces sock-puppet gaming and rating-farms), "only Members with skin in the game vote, and the skin in the game is real Marks they paid to install."

---

## Claim 5 — Composition with Cost-Slasher receipts + empirical adoption signal

A Member's report-back attaches the Member's *empirical* Cost-Slasher receipt — what specific token-cost reduction did the Play deliver in the Member's actual use? This produces:
- A growing, empirically-grounded adoption signal per Play (not just install count, but install-count-weighted-by-demonstrated-savings)
- Conductor's Baton routing improves over time as the empirical-savings dataset matures (the Baton routes preferentially to Plays with empirical Cost-Slasher receipts vs. theoretical-savings-claims)
- Public-surface receipts (per `project_librarian_cost_slasher_angle.md` marketing framing) draw from this empirical pool — "members report X% average token-cost reduction across N installations" becomes a citable platform-metric

The voting mechanism produces both governance signal AND empirical-anchor data simultaneously. Members' authentic reports are the substrate that proves the marketplace's value claim.

---

## Open scope

- Specific Marks deposit amounts (calibrated against real-effort-equivalent scale; tunable per Play category and per claimed-savings tier)
- Bonus-Marks calibration for thorough report-backs (anti-incentive-distortion: rewarding report quality without overpaying for routine reports)
- Sentinel-class Scribe ruleset for Marks-flow anomaly detection (specific patterns; threshold tuning)
- Reputation slashing scale (proportionality between gaming severity and tier reduction)
- Cross-Cathedral vote aggregation under #2266 Sphinx-Federation (does a federated pod's Member's vote count toward the home pod's marketplace ranking? Bishop lean: yes, with cross-pod reputation translation logic)

---

## Provenance

- **Founder direction B130 (Q3 voting integrity refinement)**: *"Not if you pay for it. Use what LB already has going for it. In fact, we can make it pay for it in marks and get that back when you report how it worked."*
- **Founder direction B130 (passive voting framing)**: *"voting (which in this instance can simply be tracked through the LB Frame as what you as a user chose to install and use from the EXTENSIVE library of python scripts - with reputation etc IF you are an LB Member - you can't benefit from LB network without contributing to it"*
- **Marks currency canonical**: `project_mark_backing_oneway.md` (one-way ratchet, all backed effort-differential)
- **Reputation tier canonical**: `project_the_rolodex.md` + #2233 Rolodex 4-level reciprocal promotion
- **Sibling under**: #2321 The Repertory umbrella; co-filed with #2322 / #2324 / #2325

---

*Filed #2323 by Bishop B130 (full first draft). Pay-to-install + refund-on-report-back = authentic voting. FOR THE KEEP!*
