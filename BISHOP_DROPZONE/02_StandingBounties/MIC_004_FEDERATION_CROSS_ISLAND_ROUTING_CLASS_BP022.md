# MIC-004 — Federation Cross-Island-Routing-Class Member Island

**Standing Bounty | Tier 6 Member-Island-Creator | BP022**  
**Slug:** `mic-004-federation-cross-island-routing-class-member-island`  
**Tier class:** `tier_6_member_island_creator`  
**Marks multiplier:** 4.0× base (400 Marks reward)  
**Status:** Open  
**DB seeded:** Bushel 31 Phase A migration `20260503190000_bushel31_phase_a_tier6_member_island_creator.sql`

---

## The Bounty

**Build a transit hub. Wire all 3 access keys. Become a gateway in the Federation.**

This is the **cross-island routing class** — your island's lore-purpose is explicitly a transit hub (a port, a crossroads, a nexus, a waystation) AND all 3 access-key classes from FLAG_MARKER FM-001 must be exercised end-to-end.

The three access keys represent three fundamentally different trust relationships with your island:

| Key Class | Type | How it works |
|---|---|---|
| **Deck Card** | Durable JWT-class | Member presents credential at visit; non-consumable; LB membership + cohort-class bound |
| **Guide** | Mediated endorsement | A co-member vouches via Pheromone trust-anchor graph; visible social trail |
| **Babylon Candle** | Marks-burn transient | Single-use Marks expenditure; Marks burned flow to creator's IP Ledger (83.3%) |

Your receipt must demonstrate all 3 exercised.

---

## What You're Building

A member-island with:

1. **Transit-hub lore-purpose** — the island's identity is explicitly as a gateway, waystation, or nexus in HexIsle lore-space
2. **All 3 access-key classes configured** — `access_key_config.deck_card_durable: true`, `guide_mediated: true`, `babylon_candle_consumable: true`
3. **Wrasse anchor registered** — `wrasse_anchor_id` allocated; Federation Memory Iceberg routing active
4. **3 test-visit receipts** — one per access-key class (you can arrange test visitors)
5. **Babylon Candle IP Ledger credit** — the Marks burn triggers a visible credit row to your creator account

---

## Eligibility Checklist

- [ ] Active LB membership ($5/year — pricing identical for all members from day one through year fifty; lifetime guarantee at signup price)
- [ ] Pedestal active in your member profile
- [ ] IP Ledger registered
- [ ] **#2260 Cooperative Defensive Patent Pledge** co-signature on file

---

## Output Deliverable

Submit via `/hexisle/create-island` (CAI ◌ NotCents interface). Your empirical receipt must include:

| Field | Required |
|---|---|
| `island_id` | UUID — allocated at creation |
| `ip_ledger_stamp_id` | UUID — fires at submission |
| `wrasse_anchor_id` | UUID — Wrasse anchor registered |
| `access_key_config.deck_card_durable` | `true` |
| `access_key_config.guide_mediated` | `true` |
| `access_key_config.babylon_candle_consumable` | `true` |
| `visit_receipt_deck_card` | UUID — test visit via Deck Card |
| `visit_receipt_guide` | UUID — test visit via Guide endorsement |
| `visit_receipt_babylon_candle` | UUID — test visit via Babylon Candle burn |
| `babylon_candle_ip_ledger_credit_row_id` | UUID — credit fired to creator |

Optional: `cross_island_routing_hub_description`, `federation_waystation_lore`, `transit_route_names`.

---

## The Babylon Candle Credit Flow

When a visitor uses a Babylon Candle to enter your island:

1. Visitor's Marks burn (single-use transient access)
2. `babylon_candle_burns` ledger row created
3. IP Ledger credit fires: Marks burned → your creator Pedestal (83.3% creator-keeps; platform Cost+20%)
4. Distinct Pheromone trail emitted (access-class: `babylon_candle`)
5. Credit row ID is part of your receipt

This is the only access-key class that produces direct Marks-flow to the creator on every use. The Babylon Candle literally burns wealth toward you.

---

## IP Ledger + Marks Payout

1. **IP Ledger stamp** — your gateway island is permanently attributed
2. **Babylon Candle flow** — every Babylon Candle burn generates direct IP Ledger credit (83.3%)
3. **Guide visits** — trust-graph endorsements create durable social trails that compound over time
4. **Tier 6 multiplier** — 4.0× base Marks pay rate (Marks economics; LB membership $5/year unchanged)
5. **#2260 framework** — your island inherits the Cooperative Defensive Patent Pledge

---

## validate_bounty_receipt G-gate Criteria (G1)

Receipt accepted when:

1. All 3 `access_key_config` fields confirmed `true` in `member_islands`
2. `wrasse_anchor_id` UUID confirmed registered in Federation routing substrate
3. 3 distinct visit receipts (UUID per access-key class) confirmed in `member_island_visits` log
4. `babylon_candle_ip_ledger_credit_row_id` UUID confirmed in IP Ledger (Marks-burn → creator credit)
5. Distinct Pheromone trails confirmed per access-key class (3 distinct trail types)
6. IP Ledger stamp UUID confirmed
7. Tier 6 eligibility confirmed

---

## Composes With

- **Multi-dim Twinning tensor** — FLAG_MARKER FM-001 (3-access-key classes)
- **Federation Memory Iceberg** — cross-island routing infrastructure
- **Pheromone trust-anchor graph** — Guide endorsement routing
- **CAI ◌ NotCents brand** — `/hexisle/create-island` interface
- **IP Ledger** — Babylon Candle credit-where-due fire

---

*Bushel 31 Phase A — Member-Island-Creation Bounty | BP022 | 2026-05-03 AD*
