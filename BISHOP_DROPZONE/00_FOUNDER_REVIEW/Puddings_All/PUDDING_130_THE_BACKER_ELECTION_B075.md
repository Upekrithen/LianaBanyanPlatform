# Pudding #130 — The Backer Election

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 130
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_BACKER_ELECTION.md

---

## The Pudding

# Your Money, Your Choice

## Three Options

When you fund a project, you select one of three options:

**Option A — Gift Receipt.** Your contribution is a gift. You expect nothing in return. Simple, clean, no strings.

**Option B — Credits Election.** Your contribution converts to Credits at $1 = 1 Credit. Those Credits live in your account and can be spent on goods and services within the cooperative. This is not an investment. Credits do not appreciate. They are prepaid service access.

**Option C — Community Fund.** Your contribution goes to the cooperative's community fund. It supports the platform's mission broadly — infrastructure, member programs, community initiatives. This is not a tax-deductible charitable donation.

---

## Why It Is Permanent

Your election is irrevocable. Once you choose, it cannot be changed. This is not a limitation — it is a protection.

For you: it means the terms of your contribution are locked in. Nobody can change what your money means after the fact.

For the cooperative: it means every dollar has a clear, documented purpose. No ambiguity. No disputes.

For legal compliance: it means the cooperative can demonstrate to regulators exactly what every contribution is and is not. Credits are not securities. Gifts are not investments. Community fund contributions are not charitable deductions.

---

## How It Works

1. You find a project you want to support
2. You choose your contribution amount
3. You select Option A, B, or C
4. You confirm with a digital signature
5. Your election is recorded permanently

That is it. No fine print. No hidden terms. One choice, clearly explained, permanently recorded.

---

*Ready to back a project? Your Backer Election is part of every funding flow on the platform.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_BACKER_ELECTION.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| paprika (domain) | Secondary |
| pepper (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  130,
  'The Backer Election',
  'the-backer-election',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_BACKER_ELECTION.md',
  289,
  'Your Money, Your Choice Three Options When you fund a project, you select one of three options: Option A — Gift Receipt. Your contribution is a gift. You expect nothing in return. Simple, clean, no strings. Option B — Credits Election. Your contribution converts to Credits at $1 = 1 Credit. Those Credits live in your account and can be spent on goods and services within the cooperative. This is not an investment. Credits do not appreciate. They are prepaid service access. Option C — Community Fund. Your contribution goes to the cooperative''s community fund. It supports the platform''s mission broadly — infrastructure, member programs, community initiatives. This is not a tax-deductible charitable donation. --- Why It Is Permanent Your election is irrevocable. Once you choose, it cannot be changed. This is not a limitation — it is a protection. For you: it means the terms of your contribution are locked in. Nobody can change what your money means after the fact. For the cooperative: it means every dollar has a clear, documented purpose. No ambiguity. No disputes. For legal compliance: it means the cooperative can demonstrate to regulators exactly what every contribution is and is not. Credits are not securities. Gifts are not investments. Community fund contributions are not charitable deductions. --- How It Works 1. You find a project you want to support 2. You choose your contribution amount 3. You select Option A, B, or C 4. You confirm with a digital signature 5. Your election is recorded permanently That is it. No fine print. No hidden terms. One choice, clearly explained, permanently recorded. --- Ready to back a project? Your Backer Election is part of every funding flow on the platform.',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_BACKER_ELECTION.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'oregano',
  ARRAY['paprika','pepper']::text[],
  ARRAY[2035]::int[],
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
