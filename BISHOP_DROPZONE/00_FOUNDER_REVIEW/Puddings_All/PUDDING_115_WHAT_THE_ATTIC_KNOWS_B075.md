# Pudding #115 — What the Attic Knows

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 115
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: B075 compilation grind — 6 families compiled from the Attic (content archive)

---

## The Pudding

Every organization accumulates an Attic.

Documents. Drafts. Letters to people who might matter someday. Patent filings with seventeen versions because the lawyer kept revising. Kickstarter campaigns designed, redesigned, then redesigned again. Pitches for publications that will never run the story. The Attic is where the iteration lives.

Most organizations treat the Attic like clutter. Something to clean out. Something to apologize for. "Oh, we have so many drafts lying around."

Liana Banyan treats its Attic as a witness.

Today the Attic told us six stories.

The Patent Bags are organized. Twelve bags compiled, ninety innovations, three hundred claims. Bag 8 is the only one with a variant discrepancy — the Archive copy is missing 112 lines of VSL lending claims that exist in the Emperor version. Had the lawyer filed from the Archive copy, those claims would be lost. The compilation caught it.

The Kickstarter campaigns exist in two strategic versions. Campaign 1 was originally "Tereno Water Table" at a $12,000 goal. Then someone had a better idea — start smaller, with just one hex tile at $1,000, and build up. The pivot is preserved in the Attic. Both versions exist. Someone will have to decide which to launch.

The pitch templates are the cleanest document family in the archive. Seventy publications. One master template. Two versions of La Capital del Sabor, two versions of the master template, and every other pitch is single-version. This discipline is unusual. It reflects a deliberate choice not to over-iterate.

The Crown letters are the opposite. Craig Newmark's Infrastructure Chancellor letter has seven variants. Michael Seibel's CEO offer has five. Casey Newton's Platformer pitch has five. These are high-stakes letters — invitations to take senior roles in a cooperative that does not yet exist at scale. The revision count reflects the weight of the ask.

And hidden in the LOCKED folders — CROWN_LETTER_CRAIG_NEWMARK_INFRASTRUCTURE_CHANCELLOR, CROWN_LETTER_MICHAEL_SEIBEL_CEO, CROWN_LETTER_CRAIG_NEWMARK_V2 and V3 — the archive discipline becomes visible. Previous versions are preserved with LOCKED prefixes and version numbers. This is not clutter. It is IP protection, legal audit trail, and revision history all in one.

Six families compiled. Dozens of variants merged. Zero content loss. The Attic keeps its promises.

---

## This is NOT Pudding

The compilation grind documented in this article covers 6 document families compiled from the Liana Banyan content archive (the Attic) during Bishop Session 075: Patent Bags 5-7, Patent Bags 8-10, Patent Bags 21-26 (Rook expansion), Kickstarter Campaigns 1-7, Pitch Templates & Media Outreach (70+ pitches), and Crown-Tier Letters (Casey Newton, Tim Ingham, Michael Seibel, Craig Newmark). Each compilation identifies the canonical version from multiple variants, documents revision chains, and flags discrepancies for correction. Full compilation files are in BISHOP_DROPZONE as `COMPILED_*.md`.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Six compilation documents with variant audits and canonical identification |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Files in the Attic | 10,039 (post-incremental refresh) |
| Variant families identified | 352 |
| Families compiled (pre-B075) | ~100 |
| Families compiled this session | 6 |
| Discrepancies caught | 1 major (Bag 8 missing 112 lines) |
| Strategic pivots preserved | 1 (Kickstarter Campaign 1) |
| Cleanest document family | Pitch Templates (70+ files, minimal variants) |
| Highest variant count | Craig Newmark Infrastructure Chancellor (7+ versions) |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Oregano (Coordination/Governance) | Primary — archive discipline, compilation methodology |
| Pepper (Legal/Compliance) | Secondary — IP protection, legal audit trails |
| Basil (Education/Creative) | Secondary — documentation as institutional memory |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  115,
  'What the Attic Knows',
  'what-the-attic-knows',
  'B075 compilation grind — 6 families from content archive',
  NULL,
  'Every organization accumulates an Attic. Documents. Drafts. Letters to people who might matter someday...',
  'Six compilation documents from the Liana Banyan content archive documenting Patent Bags, Kickstarter Campaigns, Pitch Templates, and Crown-Tier Letters with canonical version identification and variant audits.',
  'oregano',
  ARRAY['pepper', 'basil'],
  ARRAY[],
  'B075',
  'draft'
);
```
