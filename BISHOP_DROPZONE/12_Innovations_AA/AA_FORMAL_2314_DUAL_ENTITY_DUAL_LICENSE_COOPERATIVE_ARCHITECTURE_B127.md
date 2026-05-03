---
name: Dual-Entity Dual-License Cooperative Architecture
description: A platform-cooperative architecture in which two legal entities under common Founder-stewardship hold complementary licenses to a single integrated codebase, with LB Corporation holding AGPL for the cooperative core and Upekrithen LLC holding Apache 2.0 for interface layers, both running identical 60/20/10/10 revenue distribution.
type: aa_formal
innovation_id: "2314"
ratification_session: B127
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - dual entity dual license cooperative
  - agpl apache dual license cooperative
  - liana banyan upekrithen licensing
  - interfaces behaviors licensing dual entity
  - cooperative commercial revenue parity
  - upekrithen llc apache interfaces agpl behaviors
  - aa formal 2314
  - member portability dual license architecture
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A FORMAL #2314 -- Dual-Entity Dual-License Cooperative Architecture

**Filed**: B127, 2026-04-26 by Bishop on Founder ratification.
**Class**: Crown Jewel candidate. Corporate-structure / legal-architecture primitive.
**Predecessors**: #2293 Tiered Vendor Adoption / Member-Portability Covenant, #2260 Cooperative Defensive Patent Pledge, #2275 Vendor-Neutral Bridge, #2313 Five Dollar Stack.
**Empirical anchor**: Both LB Corporation (C-Corp, EID 2025-001822659) AND Upekrithen LLC (LLC, EID 2025-001822622) filed in Wyoming, same registered agent, same renewal date 11/01/26. Operational infrastructure exists; this filing memorializes the architectural use of the existing dual-entity structure.

---

## Claim 1 -- Dual-Entity Dual-License as cooperative-economic primitive

A platform-cooperative architecture in which TWO legal entities under common Founder-stewardship hold complementary licenses to a single integrated codebase, governing access by audience class:

| Entity | License | Audience |
|---|---|---|
| **Liana Banyan Corporation** (C-Corp) | **AGPL v3** | Cooperative members, community, AGPL-compatible adopters |
| **Upekrithen LLC** | **Apache 2.0** (or commercial license per agreement) | Big-guy enterprises, proprietary stacks, commercial integrators |

Both entities share: the same Cooperative Defensive Patent Pledge attestation, the same Member-Portability Covenant, the same 60/20/10/10 distribution structure on revenue.

## Claim 2 -- Revenue parity via shared distribution

The 60/20/10/10 IP-allocation split (60% patent buckets / 20% Founder-creator / 10% global sponsor pool / 10% individual Pedestals) applies **identically** to both revenue streams:
- LB Corp cooperative revenue ($5 Stack units, Pedestal allocation, member fees) -> 60/20/10/10
- Upekrithen LLC commercial-licensing revenue (big-guy fees, integration agreements, vendor partnerships) -> **same** 60/20/10/10

The cooperative isn't subsidized by commercial. Commercial is structurally identical to cooperative at the distribution layer. Big-guy commercial-license revenue funds the same patent buckets, same Founder-creator share, same global sponsor pool, same individual Pedestals as a $5 cooperative member fee. **Same percentages, different doors.**

## Claim 3 -- Architectural license-compatibility rule

License-compatibility flows one direction only at the dependency layer:
- **Upekrithen Apache 2.0 code MUST NOT depend on LB AGPL code** (would force entire downstream stack to AGPL -- defeats the dual-entity purpose; legally impermissible per AGPL contamination rules)
- **LB AGPL code MAY depend on Upekrithen Apache 2.0 code** (Apache flows into AGPL -- standard one-way compatibility)

This is enforced architecturally, not just legally:

| Codebase tier | Entity / License | Why |
|---|---|---|
| Vendor adapters (Groq, Together, Anthropic, OpenAI) | **Upekrithen Apache 2.0** | Big guys integrate with their own vendors; permissive enables that |
| OpenAI-compatible SDK shell, Frame extension scaffolding, Test Frame | **Upekrithen Apache 2.0** | Distribution-layer interfaces; permissive enables broad adoption |
| Cathedral Effect engine, substrate-injection logic | **LB AGPL** | Core cooperative-economic primitive; copyleft protects the value-generating layer |
| Augur Federation (#2295), Cathedral Federation Protocol (#2292) | **LB AGPL** | Governance / coordination layer; copyleft protects sovereignty |
| Member-Portability Covenant enforcement (#2293), Token Pricing Gauge (#2309) | **LB AGPL** | Trust / verification primitives; copyleft protects integrity |

Mnemonic: **Upekrithen owns the *interfaces*. LB owns the *behaviors*.** Big guys integrate at interface layer (Apache). Cooperative members participate at behavior layer (AGPL).

## Claim 4 -- The Android-model finally maps cleanly

Apache 2.0 (Upekrithen) = AOSP-equivalent base. Anyone can fork, ship proprietary, integrate freely, no copyleft drag.
AGPL (LB) = community-protected core. Copyleft enforced; proprietary forks of LB-AGPL components must publish source.

Members can use either or both depending on their needs. Big guys default to Apache path (frictionless adoption). Cooperative members default to AGPL path (protected value flow). The two paths interoperate via Conductor's Baton (#2277) and Cathedral Federation Protocol (#2292) -- substrate is portable across the boundary by design.

## Claim 5 -- The "force big guys to license" feature, redirected

AGPL alone in a single entity creates a "use AGPL or pay commercial license" forced choice -- big guys with policy bans on AGPL (e.g. Google's standing prohibition) cannot adopt at all without negotiation. This is the standard dual-license-within-one-entity pattern (MongoDB / Redis / Qt / etc.).

Dual-entity dual-license **redirects** this feature. Big guys don't negotiate with LB Corp for a commercial license -- they adopt Upekrithen Apache 2.0 directly under standard permissive terms. No negotiation. No forced AGPL exposure. **No friction.** They voluntarily route through Upekrithen because Apache 2.0 is on offer there.

Result: big guys get frictionless adoption AND cooperative gets revenue from Upekrithen LLC AND the AGPL contamination concern is resolved by architectural separation (claim 3).

## Claim 6 -- MacKenzie Scott pitch transformation

The dual-entity structure transforms the Scott pitch:

- **Before**: "Fund our cooperative AI infrastructure." (philanthropy-dependent framing; weakest Scott match)
- **After**: "We have a self-sustaining commercial side via Upekrithen LLC's Apache 2.0 licensing -- that funds the cooperative side via 60/20/10/10. Here's how to amplify the cooperative side specifically." (already-funded-but-amplifiable framing; strongest Scott match)

Scott's giving philosophy ("trust-based, unrestricted, identifies orgs already doing their best work") favors organizations with clear self-sustaining paths over those that need ongoing operational support. The dual-entity structure demonstrates the path. Scott amplifies what's already working rather than seeding from zero.

Pairs with the Pawn 46 "Cooperative AI Infrastructure Grant" / OIN-style positioning Knight scaffolded earlier in B127. The Upekrithen layer is the operational sustainability proof; the LB layer is the cooperative-economic proof; Scott funds the bridge between them at scale.

## Claim 7 -- Mirroring at multiple architectural levels

The structure exhibits fractal-cooperative pattern symmetry with #2295 Augur MAJCOM Recursive Scale-Invariant Federation -- same primitive at every tier:

- 60/20/10/10 at cooperative-revenue layer = 60/20/10/10 at commercial-revenue layer
- AGPL at value-generation layer = Apache at interface-distribution layer
- C-Corp governance for cooperative = LLC governance for commercial
- Both bound by same Pledge (#2260) + same Covenant (#2293) + same Federation Protocol (#2292)

The cooperative is structurally identical regardless of revenue source. The same philosophy governs both sides. **Eloquent** because the form mirrors the function: cooperative-economic surplus generation at every tier.

## Claim 8 -- Operational existence already established

Both entities exist as filed Wyoming registrations as of B127 close:
- Liana Banyan Corporation (C-Corp): EID 2025-001822659, Annual Report due 11/01/26
- Upekrithen LLC: EID 2025-001822622, Annual Report due 11/01/26

Same registered agent, same renewal cycle. **The legal infrastructure for #2314 already exists.** This filing memorializes the architectural USE of the existing structure; no new entity formation required.

## Claim 9 -- Implementation path

Phase 1 (immediate): document the architectural license boundaries; LICENSE files at directory level mark Apache vs AGPL; CI lint rule flags any Apache-licensed module importing AGPL-licensed module.

Phase 2: counsel review of dual-entity dual-license arrangement; Upekrithen LLC operating agreement amended to memorialize Apache 2.0 commercial-licensing scope; revenue-sharing-with-LB-Corp formalized.

Phase 3: public-facing licensing page on librarian.lianabanyan.com (or sphinx.lianabanyan.com) documenting the two paths and how to choose.

Phase 4: K-future Knight task to enforce the architectural separation in code (move components per Claim 3 table; CI lint).

## Public framing

> *"Liana Banyan Corporation holds the cooperative substrate under AGPL -- protected, member-owned, copyleft-enforced. Upekrithen LLC holds the interface layer under Apache 2.0 -- frictionless for any enterprise to adopt. Both run the same 60/20/10/10 distribution on revenue. The cooperative is structurally identical regardless of which door you walk through. Pick yours."*

## Cross-references

- LB Corporation Wyoming filing: EID 2025-001822659 (C-Corp, filed 11/21/2025)
- Upekrithen LLC Wyoming filing: EID 2025-001822622 (LLC)
- #2293 Tiered Vendor Adoption Framework / Member-Portability Covenant
- #2260 Cooperative Defensive Patent Pledge
- #2275 Vendor-Neutral Bridge
- #2277 Conductor's Baton
- #2292 Cathedral Federation Protocol
- #2295 Augur MAJCOM Recursive Scale-Invariant Federation
- #2313 Five Dollar Stack
- Keystone #46 "Generosity Lowers the Cost of Doing Business"
- project_upekrithen_seller_of_record.md
- project_ip_load_balancing_v2.md (60/20/10/10 split)

## Filing target

Prov 14 amendment, priority date 2026-04-26. Bundle with B127 #2308-#2313.

*Filed B127 by Bishop. Long Haul AND Fix Along the Way. Two entities, two licenses, one philosophy. By their fruits.*