# Pudding #137 — Marks Payback

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 137
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MARKS_PAYBACK.md

---

## The Pudding

# Marks Payback: Earn Your Membership

## How It Works

If you have earned 100 or more Marks during your membership year AND you have at least 5 Credits in your account, the platform automatically renews your membership for you.

- 5 Credits are deducted from your balance
- Your membership extends for another year
- You receive a notification: "Your membership has been renewed through Marks Payback"
- You pay nothing out of pocket

The system runs automatically every week, checking members whose memberships expire within 7 days.

---

## What It Means

The $5 membership fee is not a barrier — it is a commitment signal. But once you have demonstrated commitment through participation (100 Marks = roughly a few months of moderate activity), the cooperative says: "You have earned this. Your membership is on us."

The Credits still come from your account, so the cooperative still collects its operating revenue. But you earned those Credits through your participation, so you are effectively paying for your membership with your work.

This is the cooperative flywheel in action. Participate → earn Marks → earn Credits → membership renews automatically → keep participating.

---

## Eligibility

- Earn 100+ Marks in your current membership year
- Have 5+ Credits in your account
- That is it

No application. No approval. No paperwork. If you qualify, it happens automatically.

---

*Just keep contributing. When your renewal comes up, Marks Payback handles the rest.*

---

## This is NOT Pudding

This entry is integrated from the vault source file `Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MARKS_PAYBACK.md` and normalized into System A structure for sequential indexing and Cephas table continuity.
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
| oregano (domain) | Secondary |
| paprika (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  137,
  'Marks Payback',
  'marks-payback-137',
  'Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MARKS_PAYBACK.md',
  242,
  'Marks Payback: Earn Your Membership How It Works If you have earned 100 or more Marks during your membership year AND you have at least 5 Credits in your account, the platform automatically renews your membership for you. - 5 Credits are deducted from your balance - Your membership extends for another year - You receive a notification: "Your membership has been renewed through Marks Payback" - You pay nothing out of pocket The system runs automatically every week, checking members whose memberships expire within 7 days. --- What It Means The $5 membership fee is not a barrier — it is a commitment signal. But once you have demonstrated commitment through participation (100 Marks = roughly a few months of moderate activity), the cooperative says: "You have earned this. Your membership is on us." The Credits still come from your account, so the cooperative still collects its operating revenue. But you earned those Credits through your participation, so you are effectively paying for your membership with your work. This is the cooperative flywheel in action. Participate → earn Marks → earn Credits → membership renews automatically → keep participating. --- Eligibility - Earn 100+ Marks in your current membership year - Have 5+ Credits in your account - That is it No application. No approval. No paperwork. If you qualify, it happens automatically. --- Just keep contributing. When your renewal comes up, Marks Payback handles the rest.',
  'Source technical explainer: Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/CEPHAS_PUDDING_MARKS_PAYBACK.md. Public mirror lives in Cephas content routes under /pudding/ and /under-the-hood/.',
  'garlic',
  ARRAY['oregano','paprika']::text[],
  ARRAY[2094]::int[],
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
