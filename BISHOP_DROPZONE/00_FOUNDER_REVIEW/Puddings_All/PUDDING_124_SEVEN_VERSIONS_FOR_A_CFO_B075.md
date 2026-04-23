# Pudding #124 — Seven Versions for a CFO

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 124
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 compilation of Crown Letters (122 files audited)

---

## The Pudding

The CFO letter has seven versions.

CROWN_LETTER_TOM_SIMON_CFO.md. Then CFO 02. Then CFO 03. Then CFO_004. Then CFO_005, 006, 007. Plus LOCKED01 and LOCKED04 snapshots in the archive. Seven numbered drafts of a single letter to a single person, asking him to take a single role.

This is more versions than any other Crown Letter. More than MacKenzie Scott (5). More than Craig Newmark Infrastructure Chancellor (5). More than Michael Seibel CEO (5). More than Jessica Jackley (5).

The CFO recruitment letter is the hardest ask.

Recruit a CFO into a Series B startup and you promise equity that will vest. Recruit a CFO into a Fortune 500 and you promise compensation benchmarked against industry percentiles. Recruit a CFO into a pre-revenue cooperative with constitutionally-locked margins, no venture capital, no equity dilution model, a three-currency system, and a $5/year membership cap — and what exactly are you offering?

You are offering a role. A title. A seat at the table where the platform's financial architecture is being built. You are offering the chance to help design cooperative capital structures that don't yet exist at scale. You are offering to work inside a constitutional margin rather than negotiate against it. You are offering Marks — effort-based governance weight that accumulates over time — but not stock options.

How do you write that letter?

Version 1 probably started with the platform's case. The Cost+20% margin. The $5 membership fee. The three-currency system. The revenue projections at 50,000 members. All the reasons Liana Banyan makes financial sense.

Version 2 probably realized: a CFO already understands the numbers. The numbers aren't the blocker. The blocker is: why would someone with CFO credentials take a role that doesn't follow any standard compensation pattern?

Version 3 shifted to the role definition. What does a cooperative CFO actually do? How is it different from a traditional CFO? What authority do they have?

Version 004 probably got more specific about reporting relationships. Who does the CFO work with? Who approves their decisions? Does the Founder veto?

Version 005 refined the opening. Maybe it tried a different hook. The veteran angle. The family-of-eight angle. The "9 years building, 46 days coding" angle.

Version 006 tightened language further. Cut paragraphs that weren't earning their space.

Version 007 — the current canonical — represents everything learned across the first six drafts.

And then LOCKED01 and LOCKED04 sit in the archive with their timestamps, preserving what the letter looked like at two specific moments when it was frozen for review.

Seven iterations because the ask is seven iterations hard. You cannot recruit a CFO into a cooperative with a generic executive pitch. You have to make a financial professional believe that cooperative architecture is the interesting problem — more interesting than a traditional growth-stage startup, more interesting than a Fortune 500 finance seat, more interesting than retirement.

The iteration count is a measure of the gap between conventional executive recruiting and cooperative executive recruiting. Seven drafts is approximately how far those two worlds are apart.

And that is what the archive preserves. Not just letters. A record of how hard it is to invite the conventional finance world into the cooperative finance world — and the evidence that the invitation must be rewritten seven times before it becomes worth sending.

---

## This is NOT Pudding

Bishop B075 compilation of `Asteroid-ProofVault/02_WRITTEN/01_Crown_Letters/` identified 122 files covering ~45 unique Crown recipients. The Tom Simon CFO recruitment letter has the highest iteration count in the entire archive: 7 numbered versions (CFO, 02, 03, 004, 005, 006, 007) plus LOCKED01 and LOCKED04 archived snapshots. This beats all other Crown Letters including MacKenzie Scott (5+), Craig Newmark (5+), Michael Seibel CEO (5), and Jessica Jackley (5). The iteration count correlates with ask difficulty — executive role offers require more refinement than philanthropic asks or media pitches.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full Crown Letters compilation with 122-file inventory |
| 4 | Reading Beacon | Schedule your return visit |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Tom Simon CFO letter versions | 7 (+ 2 LOCKED) |
| Runner-up (Craig Newmark) | 5+ (+ 4 LOCKED) |
| Third (MacKenzie Scott) | 5+ (+ 2 LOCKED) |
| Total Crown Letter files | 122 |
| Unique Crown recipients | ~45 |
| B046 coordinated refresh letters | 11 |
| LOCKED files across all recipients | 22 |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Paprika (Leadership/Vision) | Primary — executive recruitment, role definition |
| Garlic (Finance/Business) | Secondary — CFO-specific asks, compensation architecture |
| Pepper (Legal/Compliance) | Secondary — cooperative vs traditional governance |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  124,
  'Seven Versions for a CFO',
  'seven-versions-for-a-cfo',
  'Crown Letters master compilation (Bishop B075)',
  NULL,
  'The CFO letter has seven versions...',
  '122 Crown Letter files audited. Tom Simon CFO identified as most-iterated letter in the archive. Iteration count correlates with ask difficulty.',
  'paprika',
  ARRAY['garlic', 'pepper'],
  ARRAY[],
  'B075',
  'draft'
);
```
