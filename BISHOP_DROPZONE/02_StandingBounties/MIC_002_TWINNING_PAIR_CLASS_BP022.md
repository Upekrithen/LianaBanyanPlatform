# MIC-002 — Twinning-Pair-Class Member Island

**Standing Bounty | Tier 6 Member-Island-Creator | BP022**  
**Slug:** `mic-002-twinning-pair-class-member-island`  
**Tier class:** `tier_6_member_island_creator`  
**Marks multiplier:** 4.0× base (400 Marks reward)  
**Status:** Open  
**DB seeded:** Bushel 31 Phase A migration `20260503190000_bushel31_phase_a_tier6_member_island_creator.sql`

---

## The Bounty

**Stake a Real-World location. Build its Ghost-World shadow. Canonical bidirectional link.**

This is the **Multi-dim Twinning tensor made tangible** — Locations × Dimensions × Times. You personally know a real place: a town, a street corner, a building, a natural feature, a cultural site. Author its Ghost-World analog in HexIsle lore-space. The twin-pair is canonically bidirectional — each world references the other in tensor metadata.

---

## What You're Building

A member-island that IS a Twinning pair:

**Real-World side:**
- Geographic or symbolic anchor (lat/lon OR cultural/structural descriptor)
- What this place means in the real world
- Why you chose it (founding story optional but powerful)

**Ghost-World side:**
- The island in HexIsle lore-space that shadows this real location
- How the island's character, terrain, and lore reflect its Real-World twin
- What the Ghost-World version changes, amplifies, or distills

**Bidirectional link:**
- `tensor_coordinate.location` contains Real-World anchor data
- `ghost_world_state.real_world_twin_reference` points back to Real-World anchor
- Both sides are canonically linked in metadata — the twinning is permanent

---

## Eligibility Checklist

Before submitting, verify ALL of the following:

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
| `real_world_twinning_anchor` | jsonb: `{lat_lon?: string, symbolic_anchor: string, cultural_descriptor: string, structural_descriptor?: string}` |
| `ghost_world_analog_description` | text, ≥150 chars |
| `tensor_coordinate.location` | Real-World anchor encoded |
| `tensor_coordinate.dimension` | Ghost-World layer (default: `ghost_world_canonical`) |
| `tensor_coordinate.time_anchor` | Chronos timestamp (default: `present_perpetuity`) |
| `bidirectional_link_confirmed` | boolean — must be `true` |

Optional: `photo_or_map_reference`, `founding_story`, `cultural_significance_notes`.

---

## IP Ledger + Marks Payout

At submission:

1. **IP Ledger stamp** — you are on record as the architect of this twinning pair. The bidirectional link is permanently attributed to you.
2. **Marks per visit** — 83.3% creator-keeps; platform Cost+20%. The Twinning pair produces ongoing Marks accrual as other members visit both sides.
3. **Tier 6 multiplier** — 4.0× base Marks pay rate (Marks economics; LB membership $5/year unchanged).
4. **#2260 framework** — your twinning pair inherits the Cooperative Defensive Patent Pledge.

---

## validate_bounty_receipt G-gate Criteria (G1)

Receipt accepted when:

1. `real_world_twinning_anchor` jsonb non-empty with at minimum `symbolic_anchor` + `cultural_descriptor`
2. `ghost_world_analog_description` ≥150 chars
3. `tensor_coordinate.location` encodes Real-World anchor
4. `tensor_coordinate.dimension` is a valid Ghost-World layer identifier
5. `bidirectional_link_confirmed = true`
6. IP Ledger stamp UUID confirmed
7. Tier 6 eligibility confirmed

---

## Composes With

- **Multi-dim Twinning tensor** — `multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md`
- **FLAG_MARKER FM-001** — 3-access-key gating applies to cross-island visits
- **CAI ◌ NotCents brand** — `/hexisle/create-island` interface
- **Substrate-As-Immutable-Backup** — your twinning pair is Wrasse-anchored, permanently retrievable

---

*Bushel 31 Phase A — Member-Island-Creation Bounty | BP022 | 2026-05-03 AD*
