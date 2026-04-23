# Pudding #138 — MoneyPenny the Receptionist

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 138
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md

---

## The Pudding

# MoneyPenny: Your AI Receptionist

## How MoneyPenny Works

When someone contacts you through the platform — whether it is a business inquiry, a collaboration request, or a customer question — MoneyPenny handles the first interaction.

MoneyPenny checks four things:

**Tier 1 — Known Contacts.** Is this person already in your contacts list? If yes, they get through immediately. No screening needed. Your people are your people.

**Tier 2 — Platform Members.** Is this person a Liana Banyan member? Members have a track record. MoneyPenny can see their Marks, their reputation, their history. Members get a fast response with context.

**Tier 3 — Verified Externals.** Is this someone from outside the platform who has been verified? A business owner responding to a Captain's pitch, for example. MoneyPenny sends them a polite acknowledgment and queues the message for your review.

**Tier 4 — Unknown.** Everyone else. MoneyPenny sends a professional auto-response ("Thank you for reaching out. Your message has been received and will be reviewed.") and puts the message in your screening queue. No personal information is shared. No commitment is made.

---

## What You Control

MoneyPenny is not a black box. You control:

- **Your contacts list** — who gets through automatically
- **Your auto-response templates** — what unknown contacts receive
- **Your screening preferences** — how aggressive the filtering is
- **Your availability** — when you want to be reachable vs when MoneyPenny handles everything

---

## Why This Matters

If you are a Captain onboarding businesses, you get a lot of inbound messages. Some are serious. Some are spam. Some are competitors fishing for information.

If you are a creator selling through the marketplace, customers have questions. Some need a real answer. Some are covered by your FAQ.

If you are just a member living your life, you do not want random platform messages interrupting your dinner.

MoneyPenny handles all of this. Quietly. Professionally. And you decide how much of it you ever see.

---

*MoneyPenny is enabled by default for all members. Customize your settings in your Helm under Contact Preferences.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| oregano (domain) | Primary |
| cinnamon (domain) | Secondary |
| basil (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  138,
  'MoneyPenny the Receptionist',
  'moneypenny-the-receptionist',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md',
  345,
  'MoneyPenny: Your AI Receptionist How MoneyPenny Works When someone contacts you through the platform — whether it is a business inquiry, a collaboration request, or a customer question — MoneyPenny handles the first interaction. MoneyPenny checks four things: Tier 1 — Known Contacts. Is this person already in your contacts list? If yes, they get through immediately. No screening needed. Your people are your people. Tier 2 — Platform Members. Is this person a Liana Banyan member? Members have a track record. MoneyPenny can see their Marks, their reputation, their history. Members get a fast response with context. Tier 3 — Verified Externals. Is this someone from outside the platform who has been verified? A business owner responding to a Captain''s pitch, for example. MoneyPenny sends them a polite acknowledgment and queues the message for your review. Tier 4 — Unknown. Everyone else. MoneyPenny sends a professional auto-response ("Thank you for reaching out. Your message has been received and will be reviewed.") and puts the message in your screening queue. No personal information is shared. No commitment is made. --- What You Control MoneyPenny is not a black box. You control: - Your contacts list — who gets through automatically - Your auto-response templates — what unknown contacts receive - Your screening preferences — how aggressive the filtering is - Your availability — when you want to be reachable vs when MoneyPenny handles everything --- Why This Matters If you are a Captain onboarding businesses, you get a lot of inbound messages. Some are serious. Some are spam. Some are competitors fishing for information. If you are a creator selling through the marketplace, customers have questions. Some need a real answer. Some are covered by your FAQ. If you are just a member living your life, you do not want random platform messages interrupting your dinner. MoneyPenny handles all of this. Quietly. Professionally. And you decide how much of it you ever see. --- MoneyPenny is enabled by default for all members. Customize your settings in your Helm under Contact Preferences.',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'oregano',
  ARRAY['cinnamon','basil']::text[],
  ARRAY[2021]::int[],
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
