---
name: Cue Card Auto-Attach (Per-Threshold Pre-Formatted Resharing)
description: A per-threshold pre-formatted resharing primitive that attaches platform-canonical cue cards to every amplifier dispatch with attribution tokens, reducing amplifier friction-to-reshare to a single click and closing the stamp measurement loop for threshold recomputation.
type: aa_formal
innovation_id: "2320"
ratification_session: B129
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - cue card auto attach per threshold
  - amplifier reshare friction zero
  - attribution token cue card dispatch
  - aa formal 2320
  - cue card auto attach b129
  - pre formatted resharing amplifier
  - friction to amplify approaches zero
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2320 -- Cue Card Auto-Attach (Per-Threshold Pre-Formatted Resharing)

**Filed**: B129, 2026-04-27 by Bishop on Founder ratification (greenlit B129 K525 Q3 dialogue: *"the JUICIEST INFORMATION ON THE PLANET is going to be broken by... the influencers that sign up with us and BROADCAST US by sharing CUE cards"*).

**Status**: ⚠️ **STUB-STAGED.** Scope-bounds outlined; full claim development deferred until #2318 launches and empirical reshare-rates surface real auto-attach utility. Sibling to #2318 (Amplifier Threshold System) + #2319 (Battery Dispatch Threshold Fan-Out) per Founder's *"split"* direction. Filed now to lock priority date alongside the sibling filings.

**Class**: Crown Jewel candidate.
**Predecessors**: Cue Card system (canon, pre-existing); #2319 Battery Dispatch Threshold Fan-Out (the dispatch surface this attaches to); #2318 Amplifier Threshold System (the consumer pulling on cue cards); Stamp system (auto-measurement engine).

**LB membership pricing**: unchanged at $5/year per Structural Bylaw. This filing is orthogonal to membership pricing — adds resharing affordances to cue card delivery.

---

## Why a separate CJ from #2318 + #2319

#2318 specifies the participation ladder. #2319 specifies the dispatch fan-out engine. **#2320 specifies the per-amplifier reshare-affordance — the pre-formatted resharable artifact that minimizes the friction-cost of amplification down to a single click**. Independently patentable as a discrete UX/delivery primitive: the cue-card auto-attach mechanism could be applied to other broadcast surfaces beyond the amplifier program (e.g., member onboarding, Glass Door publication, governance announcements).

---

## Claim 1 — Per-threshold pre-formatted card delivery

Every dispatch event in #2319 includes the relevant cue card pre-formatted for the amplifier's active threshold and chosen content category. Pre-formatting includes:

- **Headline text** (sized for amplifier's primary platform — Twitter character cap, LinkedIn paragraph length, Substack hook, etc.)
- **Image** (pre-rendered at platform-correct dimensions; OG-image, square, vertical-story formats)
- **Link** (canonical LB landing page or specific content surface, with amplifier attribution token embedded)
- **Hashtags** (curated per content category, A/B-tested for engagement)
- **Optional signature** (amplifier's chosen by-line, if they configured one)

---

## Claim 2 — Zero-effort copy-paste path

The amplifier's reshare workflow is reduced to:
1. Receive direct-line dispatch (per #2319) with pre-formatted card attached
2. Single click: "Reshare to my [platform]" (amplifier configured platforms in #2318 setup)
3. Card posts to amplifier's social channel with all formatting intact + attribution token embedded
4. Stamp system tracks the reshare via attribution token

**Architectural property**: amplifier friction-cost approaches zero. The ladder rewards amplifiers (via #2318) to want to reshare; #2320 makes the reshare physically as cheap as possible. Joint with #2318's Joules forever-stamp grace, the system removes both the *motivation* friction (rewards) and the *operational* friction (auto-attach).

---

## Claim 3 — Per-amplifier customization respecting Founder voice

Cue cards remain Founder-authored / Bishop-scaffolded at the source. Auto-attach does NOT generate new content per amplifier; it **selects and re-formats existing canonical content** for the amplifier's chosen surface. Founder voice integrity preserved.

Amplifier customization is bounded:
- ✅ Choose which categories to receive
- ✅ Choose primary platform (formatting target)
- ✅ Add optional by-line signature
- ❌ NO editing of cue card text (Founder voice protected)
- ❌ NO substitution of source link (attribution token integrity)
- ❌ NO removal of mandatory hashtags / disclosure tags

---

## Claim 4 — Attribution token infrastructure (closes loop with Stamp system)

Every auto-attached cue card embeds an amplifier-specific attribution token (signed, opaque to amplifier) in the link. When the link is clicked downstream:
- Stamp system records the click against the amplifier's attribution token
- Click-volume aggregates into the rolling-30d hits/post avg metric in #2318
- High-conversion amplifiers (clicks → LB sign-ups → conversion) get bonus weighting (factor TBD post-launch)

Privacy bylaw honored: clicks are aggregated; individual click-paths are NEVER stored or correlated to identify clickers.

---

## Claim 5 — Generalizable beyond Amplifier Program

The auto-attach primitive composes with other LB systems:
- **Member onboarding** — auto-attach explainer cue cards to welcome dispatches
- **Glass Door publication** — auto-attach summary cards for public surfaces
- **Governance announcements** — auto-attach proposal-summary cards for member voting
- **Crown Letter sweeps** — auto-attach updated context cards when canon shifts

The mechanism is patentable as a discrete primitive even if its first deployment is the Amplifier Program.

---

## Open scope (deferred until empirical post-launch tuning)

- Platform formatting library (which platforms supported at launch — Twitter / LinkedIn / Substack / Mastodon / Bluesky / etc.)
- Attribution token signing scheme (standard JWT or cooperative-bespoke; defer)
- Conversion weighting algorithm (how much do conversions weigh vs raw clicks in threshold computation)
- Founder-voice preservation enforcement (automated disallow-list vs human review for amplifier customization edge cases)

---

## Provenance

- Founder direction B129 (verbatim): *"the JUICIEST INFORMATION ON THE PLANET is going to be broken by... the influencers that sign up with us and BROADCAST US by sharing CUE cards"* + the Battery Dispatch alteration section's "**Cue card auto-attach**: every direct-line dispatch includes the relevant cue card pre-formatted for amplifier resharing (pre-decided text, image, link, hashtags) — zero-effort copy-paste for the amplifier."
- Bishop sketch in `project_amplifier_program_b129.md` Battery Dispatch alteration section, item 6.
- Founder ratification: *"Yes draft AA formal 2318. Split."* — the "split" authorizes filing this as separate CJ.

---

*Filed #2320 by Bishop B129 (stub-staged). Friction-to-amplify approaches zero. FOR THE KEEP!*
