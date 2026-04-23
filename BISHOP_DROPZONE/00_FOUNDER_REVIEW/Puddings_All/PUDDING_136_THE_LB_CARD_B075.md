# Pudding #136 — The LB Card

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 136
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_LB_CARD.md

---

## The Pudding

# The LB Card: Your Cooperative Wallet

## How It Works

Your LB Card is a Stripe-powered prepaid card tied to your membership. You load Credits onto it (remember: $1 = 1 Credit, one-way — Credits never convert back to dollars). Then you use those Credits at participating restaurants, shops, and service providers.

When you spend 10 Credits at a local restaurant through the cooperative:
- The restaurant gets 8.33 Credits (83.3%)
- The platform gets 1.67 Credits (Cost+20%)
- The restaurant pays less than they pay DoorDash or UberEats
- You pay less than retail because of cooperative volume pricing

Everyone wins except the extractive middleman.

---

## Scheduled Funding

You can set up automatic funding — load your card on a schedule. Every Monday, add 20 Credits. Every payday, add 50. Set it and forget it.

This matters because predictable funding means predictable demand. When 500 members all load their cards on Monday, the cooperative knows how much purchasing power is coming. That lets Captains negotiate better deals with local businesses. Guaranteed demand is the most powerful negotiating tool in commerce.

---

## Community-Supported Funding

Here is where it gets interesting. Authorized community funders can add Credits to other members' LB Cards.

A Guild can fund its members' cards for work-related purchases. A Tribe can pool resources for shared meals. A sponsor can seed new members' cards as part of an onboarding campaign.

This is not charity. It is cooperative economics. The community invests in its members, and those members spend locally, and that spending comes back as lower prices and better services for everyone.

---

## Charity Card Linking

Every LB Card can be linked to a charity partner. When you spend, a percentage flows to the charitable organization of your choice — automatically, transparently, every transaction.

You do not have to think about it. You do not have to write a check. You just live your life, spend your Credits, and your community benefits.

---

## What the Card Is Not

The LB Card is not a credit card. There is no debt, no interest, no credit score impact. It is prepaid — you can only spend what you have loaded.

The LB Card is not a bank account. Liana Banyan is not a bank. Credits are prepaid service access within the cooperative, not deposits.

The LB Card is not an investment. Credits do not appreciate. They do not earn returns. They are spent on goods and services within the cooperative economy.

---

*Ready to get your LB Card? It activates automatically with your $5 annual membership.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_LB_CARD.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| pepper (domain) | Secondary |
| paprika (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  136,
  'The LB Card',
  'the-lb-card-136',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_LB_CARD.md',
  431,
  'The LB Card: Your Cooperative Wallet How It Works Your LB Card is a Stripe-powered prepaid card tied to your membership. You load Credits onto it (remember: $1 = 1 Credit, one-way — Credits never convert back to dollars). Then you use those Credits at participating restaurants, shops, and service providers. When you spend 10 Credits at a local restaurant through the cooperative: - The restaurant gets 8.33 Credits (83.3%) - The platform gets 1.67 Credits (Cost+20%) - The restaurant pays less than they pay DoorDash or UberEats - You pay less than retail because of cooperative volume pricing Everyone wins except the extractive middleman. --- Scheduled Funding You can set up automatic funding — load your card on a schedule. Every Monday, add 20 Credits. Every payday, add 50. Set it and forget it. This matters because predictable funding means predictable demand. When 500 members all load their cards on Monday, the cooperative knows how much purchasing power is coming. That lets Captains negotiate better deals with local businesses. Guaranteed demand is the most powerful negotiating tool in commerce. --- Community-Supported Funding Here is where it gets interesting. Authorized community funders can add Credits to other members'' LB Cards. A Guild can fund its members'' cards for work-related purchases. A Tribe can pool resources for shared meals. A sponsor can seed new members'' cards as part of an onboarding campaign. This is not charity. It is cooperative economics. The community invests in its members, and those members spend locally, and that spending comes back as lower prices and better services for everyone. --- Charity Card Linking Every LB Card can be linked to a charity partner. When you spend, a percentage flows to the charitable organization of your choice — automatically, transparently, every transaction. You do not have to think about it. You do not have to write a check. You just live your life, spend your Credits, and your community benefits. --- What the Card Is Not The LB Card is not a credit card. There is no debt, no interest, no credit score impact. It is prepaid — you can only spend what you have loaded. The LB Card is not a bank account. Liana Banyan is not a bank. Credits are prepaid service access within the cooperative, not deposits. The LB Card is not an investment. Credits do not appreciate. They do not earn returns. They are spent on goo',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_LB_CARD.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'garlic',
  ARRAY['pepper','paprika']::text[],
  ARRAY[1967, 1971, 2008, 2009]::int[],
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
