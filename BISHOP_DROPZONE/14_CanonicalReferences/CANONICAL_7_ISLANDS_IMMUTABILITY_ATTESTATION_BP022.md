# Canonical-7 Islands Immutability Attestation

**Bushel 31 Phase E | BP022 | 2026-05-03 AD**  
**Document class:** Canonical Attestation  
**Composes with:** Substrate-As-Immutable-Backup (BP019 Crown-Jewel); Fire Code Universal Gate (BP019); Mordecai-Esther Decree-Composition (BP021); hexisleProjectSpec.ts

---

## The Canonical-7 Islands

The following seven islands are the **Founder-authored canonical-7** of HexIsle. They are sourced from `platform/src/lib/hexisleProjectSpec.ts` and are permanently immutable. No member addition, no member-island creation, no Pedestal Forum decree — nothing — modifies these islands.

| # | Canonical Name | Cephas Name | Theme | Business Skill |
|---|---|---|---|---|
| 1 | Harvest Island | Crafter's Cove | Manufacturing | Production & supply chain |
| 2 | Navigate Island | Merchant's Mile | Sales | Market navigation & trade |
| 3 | Engineer Island | Scholar's Spire | R&D | Research & development |
| 4 | Battle Island | Builder's Basin | Competition | Competitive strategy |
| 5 | Seek Island | Healer's Haven | Quality | Quality assurance & testing |
| 6 | Magic Island | Ranger's Rest | Service | Customer service & delight |
| 7 | Train Island | Council Keep | Leadership | Team building & management |

**Source:** `platform/src/lib/hexisleProjectSpec.ts` — `SEVEN_ISLANDS` array + `CEPHAS_ISLAND_NAMES` map.

---

## The Immutability Contract

### Law of the Medes and Persians (Esther 8)

The canonical-7 islands are permanently immutable. This contract has no exception class, no appeal path, and no Founder-override (even the Founder cannot un-write the canonical-7; only additions can be made alongside).

Member-N islands — all member-authored islands created via `/hexisle/create-island` — compose **alongside** the canonical-7. They do not modify, replace, extend the specs of, or interact with the canonical-7 island specs directly. The canonical-7 are the immutable foundation of HexIsle's Ghost-World / Real-World lore-space.

### What "immutable" means in practice

1. **No migration** will ever `UPDATE` or `DELETE` any field of the canonical-7 island specs
2. **No RPC** in the `member_islands` or `island_pedestal_forum_additions` tables references the canonical-7 by foreign key
3. **Pedestal Forum decrees** in `island_pedestal_forum_additions` reference `island_id` from `member_islands` — they are structurally incapable of addressing canonical-7 islands
4. **Canon-class promotion** via `rpc_promote_island_to_canon` does not promote a member-island to "canonical-7-class" — it promotes to `canon_promoted` (member-N-canon), a distinct status
5. **The canonical-7 source of truth** is `platform/src/lib/hexisleProjectSpec.ts` — a TypeScript constant, not a mutable database row

---

## Member-N Islands: Compose Alongside

Member-authored islands (all Tier 6 Member-Island-Creator submissions) are stored in `member_islands` with `canon_class_status` defaulting to `member_class`. Per the Mordecai-Esther Decree-Composition pattern:

- Member-N islands and the canonical-7 exist **simultaneously** in HexIsle lore-space
- Neither supersedes the other; both are simultaneously valid
- The canonical-7 occupy their own tensor coordinates (Locations × Dimensions × Times)
- Member-N islands occupy distinct member-authored tensor coordinates

This is the co-equal-authority pattern: the original (canonical-7) is immutable AND the co-equal additions (member-N islands) are permanently authored alongside. Both are simultaneously canonically valid per the Law of the Medes and Persians.

---

## Canon-Class Promotion Gate: Founder Fire Code

The `rpc_promote_island_to_canon` function requires a **Founder Fire Code token**. This gate is intentional and has no bypass class.

### What promotion means

A `canon_promoted` member-island:
- Gains Wrasse anchor priority (sub-ms substrate retrieval; queues above `member_class` in Federation routing)
- Gets cross-island federation routing switched to default-on
- Engages the IP allocation 60/20/10/10 framework
- Is noted as "Founder Fire Code promoted" in provenance record

### What promotion does NOT mean

- `canon_promoted` ≠ canonical-7-class. The canonical-7 are a separate category — they are the Founder's original lore-class. `canon_promoted` member-islands are the highest elevation a member can reach, but they are structurally and lore-wise distinct from the original seven.
- Promotion does not modify the canonical-7 islands or their specs
- Promotion does not allow the promoted island's spec to be retroactively altered

---

## #2260 Cooperative Defensive Patent Pledge

Every Tier 6 Member-Island-Creator submission must carry a **#2260 Cooperative Defensive Patent Pledge co-signature** on file (`member_island_creator_eligibility.cooperative_defensive_pledge_signed_at` timestamp).

This means:
1. Every member-island created through Bushel 31's infrastructure is co-signed into the Cooperative Defensive Patent framework
2. The collective Federation's defensive coverage extends to each member-island
3. No single member's island can be used offensively against other Federation members; the co-signature is a mutual protection instrument

The #2260 co-signature is not optional for Tier 6 access. It is an eligibility gate — not a checkbox, a structural requirement.

---

## Summary: The Three Immutability Layers

| Layer | Scope | Enforced by |
|---|---|---|
| **Canonical-7 island specs** | `hexisleProjectSpec.ts` TypeScript constants | Source code; never migrated to DB rows |
| **Member-island original spec** | `member_islands.ghost_world_state` column | DB row immutable after insert; `enforce_island_pedestal_append_only` trigger |
| **Pedestal Forum decree rows** | `island_pedestal_forum_additions` rows | `trg_island_pedestal_append_only` trigger; `original_island_immutable_attestation = TRUE` CHECK constraint |

All three layers compose under the same doctrinal principle: **the original is permanent; additions compose alongside without modifying it**. Substrate-As-Immutable-Backup and Mordecai-Esther are the same pattern at different architectural levels.

---

*Attestation issued at Bushel 31 Phase E / BP022 / 2026-05-03 AD.*  
*This document is itself an append-only canonical record. It cannot be reconciled away by future migratings. Contradictions compose alongside per Mordecai-Esther — they do not replace this attestation.*
