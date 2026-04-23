# Pudding #132 — The Captain System

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 132
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_CAPTAIN_SYSTEM.md

---

## The Pudding

# Your Captain Has Arrived

## What Does a Captain Actually Do?

A Captain walks into local businesses — restaurants, shops, service providers — and shows them what the cooperative can offer. More customers. Lower delivery costs. A community that already wants to buy local.

The Captain carries a Pitch Packet: a one-page printable document with real numbers. How many members are nearby. What the average order looks like. What the business would keep (83.3% of every transaction — always).

The Captain does not sell anything. The Captain shows business owners a better deal than what they are currently getting from DoorDash, UberEats, or Yelp.

---

## How Do You Become One?

Captains are not appointed. They earn it through a progression system we call the Moses Model — named after the idea that leaders emerge from the community they serve.

**Stage 1 — Walking Billboard.** You start by simply being visible. Wearing the brand. Sharing your QR-coded Calling Card. Every scan earns you Marks.

**Stage 2 — Apprentice.** Once you have shown consistency, you shadow an existing Captain. Learn the pitch. See how the conversations go. Practice with the Tiered Commitment Chart (the C+20 through C+90 negotiation framework).

**Stage 3 — Captain.** You get your own territory — a Geographic Corridor. The platform gives you a dashboard showing which businesses in your area are not yet onboarded. You get batch order tools, delivery tracking, and a Pedestal (a public leadership profile where the community can see your track record and support you).

**Stage 4 — Senior Captain.** You have proven results. Multiple businesses onboarded. Consistent delivery. You start training new Apprentices. The cycle continues.

---

## What Do Captains Earn?

Captains earn Marks for every business they onboard, every order they facilitate, and every Apprentice they train. Marks unlock volume discounts, governance weight, and cooperative benefits.

Captains also get a Calling Card — a personalized QR card powered by Durin's Door that routes people directly to their local cooperative page. Hand it to a restaurant owner, and they scan straight to their onboarding flow. Hand it to a neighbor, and they scan straight to membership signup.

One card. Infinite uses. And every scan is tracked, so the Captain gets credit for the connection.

---

## The Captain's Toolkit

- **Pitch Packet** — printable one-page with local stats and the Cost+20% value proposition
- **Tiered Commitment Chart** — the C+20 through C+90 escalation framework for restaurant negotiations
- **Calling Card** — QR-coded personal access card via Durin's Door
- **Captain's Dashboard** — real-time view of territory, businesses, orders, and Apprentices
- **Pedestal** — public leadership profile with community support signals
- **Batch Order Tools** — manage multiple business orders with stake-based commitment

---

## Why It Works

Most platforms hire salespeople. Liana Banyan grows Captains from the community. A Captain is a neighbor talking to a neighbor. They eat at the restaurants they onboard. They know the mechanic they are signing up. They live in the corridor they serve.

That trust cannot be hired. It can only be earned.

---

*Interested in becoming a Captain? Start by getting your Calling Card and sharing it with five local businesses. The platform tracks your progress automatically.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_CAPTAIN_SYSTEM.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| paprika (domain) | Primary |
| oregano (domain) | Secondary |
| basil (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  132,
  'The Captain System',
  'the-captain-system-132',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_CAPTAIN_SYSTEM.md',
  534,
  'Your Captain Has Arrived What Does a Captain Actually Do? A Captain walks into local businesses — restaurants, shops, service providers — and shows them what the cooperative can offer. More customers. Lower delivery costs. A community that already wants to buy local. The Captain carries a Pitch Packet: a one-page printable document with real numbers. How many members are nearby. What the average order looks like. What the business would keep (83.3% of every transaction — always). The Captain does not sell anything. The Captain shows business owners a better deal than what they are currently getting from DoorDash, UberEats, or Yelp. --- How Do You Become One? Captains are not appointed. They earn it through a progression system we call the Moses Model — named after the idea that leaders emerge from the community they serve. Stage 1 — Walking Billboard. You start by simply being visible. Wearing the brand. Sharing your QR-coded Calling Card. Every scan earns you Marks. Stage 2 — Apprentice. Once you have shown consistency, you shadow an existing Captain. Learn the pitch. See how the conversations go. Practice with the Tiered Commitment Chart (the C+20 through C+90 negotiation framework). Stage 3 — Captain. You get your own territory — a Geographic Corridor. The platform gives you a dashboard showing which businesses in your area are not yet onboarded. You get batch order tools, delivery tracking, and a Pedestal (a public leadership profile where the community can see your track record and support you). Stage 4 — Senior Captain. You have proven results. Multiple businesses onboarded. Consistent delivery. You start training new Apprentices. The cycle continues. --- What Do Captains Earn? Captains earn Marks for every business they onboard, every order they facilitate, and every Apprentice they train. Marks unlock volume discounts, governance weight, and cooperative benefits. Captains also get a Calling Card — a personalized QR card powered by Durin''s Door that routes people directly to their local cooperative page. Hand it to a restaurant owner, and they scan straight to their onboarding flow. Hand it to a neighbor, and they scan straight to membership signup. One card. Infinite uses. And every scan is tracked, so the Captain gets credit for the connection. --- The Captain''s Toolkit - Pitch Packet — printable one-page with local stats and the Cost+20% value prop',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_CAPTAIN_SYSTEM.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'paprika',
  ARRAY['oregano','basil']::text[],
  ARRAY[1963, 1966, 1975, 1978, 1985, 1988]::int[],
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
