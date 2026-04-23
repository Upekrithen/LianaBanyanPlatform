# Pudding #133 — Cold Start Hub

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 133
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_COLD_START_HUB.md

---

## The Pudding

# Six Doors In

## Door 1: Food (Orange Path)

"I want to feed my family better and cheaper."

This is the most natural entry point. Join a meal plan. Order from a local restaurant through the cooperative instead of through a delivery app. Start a Breakfast Runner node in your neighborhood. The food path gets people in the door with something they need every single day.

## Door 2: Manufacturing (Slate Path)

"I want to make things."

The Canister System, HexIsle terrain, 3D printing, desktop injection molding. If you are a maker, a hobbyist, or someone who wants to learn — this path connects you with tools, materials, and other makers. Start with a bounty. Build something. Earn Marks.

## Door 3: Service (Blue Path)

"I have a skill people need."

Mechanic, tutor, photographer, cleaner, driver, designer, developer. The service path matches your skills with people in your area who need them. Set your own rates. The platform takes Cost+20%. You keep 83.3%.

## Door 4: Local Business (Emerald Path)

"I own a business and want more customers."

A Captain shows up with a Pitch Packet. The numbers make sense. You onboard through the cooperative, get access to a pre-built customer base, and pay less than you pay DoorDash or UberEats. Your business gets a Cue Card, a listing, and a direct connection to local demand.

## Door 5: Guild (Purple Path)

"I want to organize with people in my profession."

Guilds are professional groups. Photographers. Developers. Chefs. Mechanics. A Guild gets its own treasury, visual identity, volume discounts, and benefit cascade. If you are good at what you do and want to be part of a professional network that actually helps you earn more — start or join a Guild.

## Door 6: Tribe (Gold Path)

"I want to connect with people who share my life."

Tribes are personal groups. Your church. Your running club. Your neighborhood block. Your homeschool co-op. A Tribe gets its own Family Table (shared meal planning), treasury, and visual identity. You can belong to as many Tribes as you want. Guilds are professional. Tribes are personal.

---

## Why Six Paths?

Because not everyone joins a cooperative for the same reason. A single mom joins because she wants cheaper groceries. A maker joins because she wants access to an injection molder. A restaurant owner joins because a Captain showed him the math.

Six paths means six different "aha" moments. Six different ways to answer the question: "Why should I join?"

And once you are in through any door, you can see all the others. The food member discovers the service marketplace. The maker discovers the Guild system. The restaurant owner discovers the delivery network.

One door in. The whole cooperative opens up.

---

*Not sure which path is right for you? Visit the Cold Start Hub — it asks three questions and points you to the door that fits.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_COLD_START_HUB.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
The full technical and implementation detail remains in the original vault document and related Cephas publication routes.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full technical documentation + implementation details |
| 4 | Reading Beacon | Schedule your return |

---

## Spice Tags

| Tag | Type |
|-----|------|
| sugar (domain) | Primary |
| paprika (domain) | Secondary |
| oregano (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  133,
  'Cold Start Hub',
  'cold-start-hub',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_COLD_START_HUB.md',
  486,
  'Six Doors In Door 1: Food (Orange Path) "I want to feed my family better and cheaper." This is the most natural entry point. Join a meal plan. Order from a local restaurant through the cooperative instead of through a delivery app. Start a Breakfast Runner node in your neighborhood. The food path gets people in the door with something they need every single day. Door 2: Manufacturing (Slate Path) "I want to make things." The Canister System, HexIsle terrain, 3D printing, desktop injection molding. If you are a maker, a hobbyist, or someone who wants to learn — this path connects you with tools, materials, and other makers. Start with a bounty. Build something. Earn Marks. Door 3: Service (Blue Path) "I have a skill people need." Mechanic, tutor, photographer, cleaner, driver, designer, developer. The service path matches your skills with people in your area who need them. Set your own rates. The platform takes Cost+20%. You keep 83.3%. Door 4: Local Business (Emerald Path) "I own a business and want more customers." A Captain shows up with a Pitch Packet. The numbers make sense. You onboard through the cooperative, get access to a pre-built customer base, and pay less than you pay DoorDash or UberEats. Your business gets a Cue Card, a listing, and a direct connection to local demand. Door 5: Guild (Purple Path) "I want to organize with people in my profession." Guilds are professional groups. Photographers. Developers. Chefs. Mechanics. A Guild gets its own treasury, visual identity, volume discounts, and benefit cascade. If you are good at what you do and want to be part of a professional network that actually helps you earn more — start or join a Guild. Door 6: Tribe (Gold Path) "I want to connect with people who share my life." Tribes are personal groups. Your church. Your running club. Your neighborhood block. Your homeschool co-op. A Tribe gets its own Family Table (shared meal planning), treasury, and visual identity. You can belong to as many Tribes as you want. Guilds are professional. Tribes are personal. --- Why Six Paths? Because not everyone joins a cooperative for the same reason. A single mom joins because she wants cheaper groceries. A maker joins because she wants access to an injection molder. A restaurant owner joins because a Captain showed him the math. Six paths means six different "aha" moments. Six different ways to answer the question',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_COLD_START_HUB.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'sugar',
  ARRAY['paprika','oregano']::text[],
  ARRAY[2007, 2009]::int[],
  'B075',
  'draft'
)
ON CONFLICT (pudding_number) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  source_paper = EXCLUDED.source_paper,
  source_paper_word_count = EXCLUDED.source_paper_word_count,
  pudding_text = EXCLUDED.pudding_text,
  not_pudding_summary = EXCLUDED.not_pudding_summary,
  primary_spice = EXCLUDED.primary_spice,
  secondary_spices = EXCLUDED.secondary_spices,
  innovations_referenced = EXCLUDED.innovations_referenced,
  bishop_session = EXCLUDED.bishop_session,
  status = EXCLUDED.status;
```
