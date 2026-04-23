# Pudding #135 — The Guest Marks Wallet

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 135
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GUEST_MARKS_WALLET.md

---

## The Pudding

# Try Before You Join

## How It Works

When you enter a contest or complete a challenge on the platform, you earn Marks. If you are not a member yet, those Marks go into a Guest Wallet tied to your email address.

Your Guest Wallet holds your Marks for 90 days. During that time, you can see what you have earned, but you cannot spend them yet.

When you decide to join (it is $5 per year), your Guest Wallet balance transfers to your member account instantly. Every Mark you earned before joining is yours.

---

## Why This Exists

Two reasons.

First, it solves a legal problem. Contests and challenges that offer prizes need a genuine "no purchase necessary" alternative. The Guest Wallet is that alternative — you can participate and earn without spending a dollar.

Second, it solves a trust problem. Nobody wants to commit to a new platform before they know if it is worth it. The Guest Wallet lets you do real work, earn real value, and decide for yourself.

---

## The Rules

- Guest Wallets expire after 90 days if you do not sign up
- Guest Marks cannot be transferred, sold, or converted to cash
- One Guest Wallet per email address
- When you become a member, your balance moves automatically — nothing is lost

---

*Saw a challenge that looks interesting? Jump in. You do not need to be a member yet.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GUEST_MARKS_WALLET.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| garlic (domain) | Primary |
| ginger (domain) | Secondary |
| sugar (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  135,
  'The Guest Marks Wallet',
  'the-guest-marks-wallet',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GUEST_MARKS_WALLET.md',
  242,
  'Try Before You Join How It Works When you enter a contest or complete a challenge on the platform, you earn Marks. If you are not a member yet, those Marks go into a Guest Wallet tied to your email address. Your Guest Wallet holds your Marks for 90 days. During that time, you can see what you have earned, but you cannot spend them yet. When you decide to join (it is $5 per year), your Guest Wallet balance transfers to your member account instantly. Every Mark you earned before joining is yours. --- Why This Exists Two reasons. First, it solves a legal problem. Contests and challenges that offer prizes need a genuine "no purchase necessary" alternative. The Guest Wallet is that alternative — you can participate and earn without spending a dollar. Second, it solves a trust problem. Nobody wants to commit to a new platform before they know if it is worth it. The Guest Wallet lets you do real work, earn real value, and decide for yourself. --- The Rules - Guest Wallets expire after 90 days if you do not sign up - Guest Marks cannot be transferred, sold, or converted to cash - One Guest Wallet per email address - When you become a member, your balance moves automatically — nothing is lost --- Saw a challenge that looks interesting? Jump in. You do not need to be a member yet.',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_GUEST_MARKS_WALLET.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'garlic',
  ARRAY['ginger','sugar']::text[],
  ARRAY[2034]::int[],
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
