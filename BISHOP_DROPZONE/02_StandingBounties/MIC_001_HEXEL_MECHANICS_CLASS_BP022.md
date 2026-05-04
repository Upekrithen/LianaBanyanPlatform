# MIC-001 — Hexel-Mechanics-Class Member Island

**Standing Bounty | Tier 6 Member-Island-Creator | BP022**  
**Slug:** `mic-001-hexel-mechanics-class-member-island`  
**Tier class:** `tier_6_member_island_creator`  
**Marks multiplier:** 4.0× base (400 Marks reward)  
**Status:** Open  
**DB seeded:** Bushel 31 Phase A migration `20260503190000_bushel31_phase_a_tier6_member_island_creator.sql`

---

## The Bounty

Build an island where a **novel mechanical innovation lives in the terrain itself**.

HexIsle has 33 patented mech innovations (see `platform/src/lib/hexisleProjectSpec.ts`). Your member-island must embed, demonstrate, or house a mech-class innovation — whether a variation of an existing mech (e.g., a modified Ouralis tide variant, a Sawtooth60 channel variant) or a genuinely new mech that composes with the 33-mech base inventory.

This is the **Hexel-Mechanics-Class** bounty because the innovation is structural — it lives in the game-physics of your island, not just the lore.

---

## What You're Building

A member-island with:

- **Island name** (your choice)
- **Real-World Twinning anchor** — a geographic / cultural / structural location bidirectionally linked to your island
- **Ghost-World state** (island-spec body): mech innovation description + lore summary + game-mechanic integration
- **Mechanic-class field**: names the innovation + cites which of the 33 base mechs it composes with
- **Tensor coordinate** (Locations × Dimensions × Times per Multi-dim Twinning canon)
- **3-access-key configuration** (Deck Card / Guide / Babylon Candle — at minimum Deck Card durable)
- **IP Ledger stamp** (auto-fires at submission via `/hexisle/create-island`)

---

## Eligibility Checklist

Before submitting, verify ALL of the following:

- [ ] Active LB membership ($5/year — pricing identical for all members from day one through year fifty; lifetime guarantee at signup price)
- [ ] Pedestal active in your member profile
- [ ] IP Ledger registered (your innovations receive creator-stamp attribution)
- [ ] **#2260 Cooperative Defensive Patent Pledge** co-signature on file — every Tier 6 member-island inherits the cooperative defensive framework

Contact support if any eligibility item is incomplete before submission.

---

## Output Deliverable

Submit via `/hexisle/create-island` (CAI ◌ NotCents interface). Your empirical receipt must include:

| Field | Required |
|---|---|
| `island_id` | UUID — allocated at creation |
| `ip_ledger_stamp_id` | UUID — fires at submission |
| `real_world_twinning_anchor` | jsonb with lat/lon or symbolic anchor + cultural/structural descriptor |
| `mech_innovation_description` | text, ≥100 chars |
| `composing_base_mech` | integer 1–33 (which base mech does it compose with?) |
| `ghost_world_state` | jsonb with lore summary + mechanic-class field |
| `tensor_coordinate` | `{location, dimension, time_anchor}` |
| `access_key_config` | jsonb (`deck_card_durable: true` minimum) |

Optional but welcomed: `cross_island_routing_class`, `pedestal_forum_class_eligibility`, founding story.

---

## IP Ledger + Marks Payout

At submission, the `/hexisle/create-island` interface fires:

1. **IP Ledger stamp** — your creator-stamp is permanent. You are on record as the island's originator.
2. **Marks payout per visit** — 83.3% creator-keeps; platform Cost+20%. Every time another member visits your island, Marks accrue to your Pedestal.
3. **Tier 6 multiplier** — 4.0× base Marks pay rate applies to this bounty class (Marks economics; LB membership $5/year unchanged).
4. **#2260 framework engagement** — your island is co-signed into the Cooperative Defensive Patent Pledge framework.

---

## validate_bounty_receipt G-gate Criteria (G1)

This bounty is closed (receipt accepted) when:

1. `tier_6_member_island_creator` enum value is confirmed present in `bounty_tier_class`
2. Island-spec JSON submitted via `/hexisle/create-island` with `mech_innovation_description` ≥100 chars
3. `composing_base_mech` integer 1–33 verified against `hexisleProjectSpec.ts`
4. IP Ledger stamp UUID confirmed in `member_islands.ip_ledger_stamp_id`
5. Real-World Twinning anchor present (non-empty jsonb)
6. Tier 6 eligibility confirmed (all 4 eligibility checks passed)

---

## Composes With

- **HexIsle 33-mech innovations** — `platform/src/lib/hexisleProjectSpec.ts`
- **Multi-dim Twinning tensor** — `multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md`
- **CAI ◌ NotCents brand** — `/hexisle/create-island` interface
- **#2277 Conductor's Baton** — Conductor routes design intent → subagent fan-out
- **#2260 Cooperative Defensive Patent Pledge** — every island inherits framework

---

*Bushel 31 Phase A — Member-Island-Creation Bounty | BP022 | 2026-05-03 AD*
