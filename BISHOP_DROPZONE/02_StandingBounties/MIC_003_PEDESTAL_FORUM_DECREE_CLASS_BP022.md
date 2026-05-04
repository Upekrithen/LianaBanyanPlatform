# MIC-003 — Pedestal-Forum-Decree-Class Member Island

**Standing Bounty | Tier 6 Member-Island-Creator | BP022**  
**Slug:** `mic-003-pedestal-forum-decree-class-member-island`  
**Tier class:** `tier_6_member_island_creator`  
**Marks multiplier:** 4.0× base (400 Marks reward)  
**Status:** Open  
**DB seeded:** Bushel 31 Phase A migration `20260503190000_bushel31_phase_a_tier6_member_island_creator.sql`

---

## The Bounty

**Design an island that invites co-authorship. Build the canonical welcome mat for decrees.**

The Mordecai-Esther Decree-Composition pattern governs how members add to each other's islands. Your island's ORIGINAL spec is IMMUTABLE — the Law of the Medes and Persians (Esther 8) makes it so. Nothing can un-write it. But other members can append co-equal-authority decrees that compose alongside the original, neither replacing nor overriding it.

This bounty asks you to **intentionally design an island for decree-density**: leave open threads, pose unresolved questions, plant invitation prompts for the community to respond to.

---

## The Mordecai-Esther Pattern

Per canonical Bushel 13 Pedestal Forum (commit `07a2173`), extended to islands in Bushel 31:

- **Original island spec** = IMMUTABLE once submitted (your authorship is permanent)
- **Member additions** = `island_pedestal_forum_additions` table rows, `original_island_immutable_attestation = TRUE`
- **Decree classes**: `extending` (builds on original) / `contradicting` (challenges original) / `composing` (both simultaneously)
- **Co-equal authority**: additions have the SAME standing as the original. Contradictions are legally valid alongside the original.
- **Law of the Medes and Persians**: no one — including you — can modify the original once submitted

---

## What You're Building

A member-island with:

1. **A purpose-built open lore thread** — something specifically left unresolved to invite co-authorship
2. **≥3 "welcome_decrees" prompts** in `ghost_world_state.welcome_decrees` — explicit written invitations for specific types of co-equal-authority additions
3. **Pedestal Forum active** — `pedestal_forum_decree_id` wired and live at submission
4. **At least 1 co-author decree received** — demonstrated operational (you can recruit a co-author for the test)

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
| `pedestal_forum_decree_id` | UUID — Pedestal Forum live |
| `welcome_decrees` | array of ≥3 open invitation prompts (in `ghost_world_state`) |
| `first_co_author_decree_id` | UUID — at least 1 decree appended post-submission |
| `immutability_attestation_confirmed` | boolean — must be `true` |

Optional: `decree_composition_invitation_style` (e.g., "open question", "lore gap", "contested canon"), `thematic_lore_arc`.

---

## Example: What a welcome_decrees entry looks like

```json
{
  "welcome_decrees": [
    "Who was the First Keeper of the Lighthouse before the Great Storm? Decrees welcome.",
    "The Eastern Passage was closed for 300 years. What happened? Compose alongside.",
    "Three factions claim the Coral Throne. None is canon yet. Add your decree."
  ]
}
```

Each prompt is an open question or unresolved lore thread explicitly naming the type of decree it invites.

---

## IP Ledger + Marks Payout

1. **IP Ledger stamp** — your authorship is permanent. Co-equal-authority additions never replace your credit.
2. **Marks per visit** — 83.3% creator-keeps; platform Cost+20%. Decree-dense islands attract more engagement and more visits.
3. **Tier 6 multiplier** — 4.0× base Marks pay rate (Marks economics; LB membership $5/year unchanged).
4. **#2260 framework** — your island inherits the Cooperative Defensive Patent Pledge.

---

## validate_bounty_receipt G-gate Criteria (G1)

Receipt accepted when:

1. `pedestal_forum_decree_id` UUID confirmed live in `island_pedestal_forum_additions`
2. `welcome_decrees` array has ≥3 entries in `ghost_world_state`
3. `first_co_author_decree_id` UUID confirmed in `island_pedestal_forum_additions` with `island_id` matching
4. `original_island_immutable_attestation = true` on the co-author decree row
5. `decree_class` is one of `extending` / `contradicting` / `composing`
6. IP Ledger stamp UUID confirmed
7. Tier 6 eligibility confirmed

---

## Composes With

- **Mordecai-Esther Decree-Composition** — `mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md`
- **Bushel 13 Pedestal Forum** — `paper_pedestal_forum_additions` table (commit `07a2173`) — same pattern extended to islands
- **CAI ◌ NotCents brand** — `/hexisle/create-island` interface
- **Substrate-As-Immutable-Backup** — the append-only ledger ensures original and all decrees are permanently Wrasse-anchored

---

*Bushel 31 Phase A — Member-Island-Creation Bounty | BP022 | 2026-05-03 AD*
