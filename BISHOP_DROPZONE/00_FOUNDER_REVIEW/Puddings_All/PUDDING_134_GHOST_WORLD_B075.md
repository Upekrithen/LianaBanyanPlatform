# Pudding #134 — Ghost World

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 134
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GHOST_WORLD.md

---

## The Pudding

# Ghost World: Your Digital Storefront

## What Is Ghost World?

Ghost World is the visual layer of the cooperative economy. Think of it as a map made of hexagonal tiles, where each tile represents a real member, business, or service.

Your storefront sits on your home island. Nearby tiles show other members and businesses in your area. The closer they are on the map, the closer they are in real life.

It is not a game. It is a visual way to discover what your community has to offer.

---

## Your First Store Is Free

Every member gets one storefront at no cost. Set it up in minutes:

1. Name your store
2. Describe what you offer (products, services, skills)
3. Set your prices (in Credits)
4. Upload photos
5. You are live

Your storefront syncs with your real-world presence. If you update your hours, your Ghost World store updates. If you add a new product, it appears on your tile. Real store = Ghost Store.

---

## Pop-Up Kiosks

Want to be visible in another neighborhood? Set up a Pop-Up Kiosk on a different island. Pop-Ups are temporary storefronts that let you test new markets without commitment.

A baker in one neighborhood can pop up on an island across town. A designer can set up a kiosk at a virtual craft fair. A service provider can place kiosks wherever demand is highest.

---

## Discovery

The hex grid is not just for looking at. It is a discovery engine.

Browse nearby tiles to find services you did not know existed. Filter by category — food, services, makers, entertainment. See which storefronts are popular (the busier the tile, the brighter it glows).

The Cross-Island Discovery Feed shows you trending storefronts, new arrivals, and businesses that match your past purchases.

---

## Deck Cards

Every storefront has a Deck Card — a digital business card that can be shared, collected, and displayed. Deck Cards are part of the Loteria system: collect cards from businesses you visit, and unlock rewards.

Your Deck Card is your identity in Ghost World. Make it memorable.

---

*Your storefront is waiting. Set it up in your Helm under "My Store."*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GHOST_WORLD.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| cinnamon (domain) | Primary |
| cumin (domain) | Secondary |
| basil (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  134,
  'Ghost World',
  'ghost-world-134',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GHOST_WORLD.md',
  366,
  'Ghost World: Your Digital Storefront What Is Ghost World? Ghost World is the visual layer of the cooperative economy. Think of it as a map made of hexagonal tiles, where each tile represents a real member, business, or service. Your storefront sits on your home island. Nearby tiles show other members and businesses in your area. The closer they are on the map, the closer they are in real life. It is not a game. It is a visual way to discover what your community has to offer. --- Your First Store Is Free Every member gets one storefront at no cost. Set it up in minutes: 1. Name your store 2. Describe what you offer (products, services, skills) 3. Set your prices (in Credits) 4. Upload photos 5. You are live Your storefront syncs with your real-world presence. If you update your hours, your Ghost World store updates. If you add a new product, it appears on your tile. Real store = Ghost Store. --- Pop-Up Kiosks Want to be visible in another neighborhood? Set up a Pop-Up Kiosk on a different island. Pop-Ups are temporary storefronts that let you test new markets without commitment. A baker in one neighborhood can pop up on an island across town. A designer can set up a kiosk at a virtual craft fair. A service provider can place kiosks wherever demand is highest. --- Discovery The hex grid is not just for looking at. It is a discovery engine. Browse nearby tiles to find services you did not know existed. Filter by category — food, services, makers, entertainment. See which storefronts are popular (the busier the tile, the brighter it glows). The Cross-Island Discovery Feed shows you trending storefronts, new arrivals, and businesses that match your past purchases. --- Deck Cards Every storefront has a Deck Card — a digital business card that can be shared, collected, and displayed. Deck Cards are part of the Loteria system: collect cards from businesses you visit, and unlock rewards. Your Deck Card is your identity in Ghost World. Make it memorable. --- Your storefront is waiting. Set it up in your Helm under "My Store."',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GHOST_WORLD.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'cinnamon',
  ARRAY['cumin','basil']::text[],
  ARRAY[]::int[],
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
