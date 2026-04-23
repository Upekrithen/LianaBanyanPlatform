# Pudding #116 — The Missing Claims

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 116
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 compilation of Patent Bag 8 (LMD + JukeBox + VSL)

---

## The Pudding

Patent Bag 8 is 795 lines long in the Emperor directory.

It is 683 lines long in the Archive copy.

That is 112 missing lines.

One hundred twelve lines of Very Short Lending claims — the micro-duration lending mechanism where cooperative members lend Credits to each other for hours or days, collateralized by Joules, at zero interest because members do not charge each other interest. The lending pool is self-funded through Joule collateral. These claims describe how the cooperative replaces payday lenders. They describe how you borrow $50 for three days without being extracted by a 400% APR loan shark. They describe a micro-lending primitive that did not exist in the prior art.

And they existed in ONE copy of the patent filing. The Emperor copy.

The other copy — the Archive copy — was written from an earlier draft. Whoever duplicated the file did so before the VSL claims were added. Then the Emperor version got the additional claims and the Archive version stayed frozen in its earlier state.

Both files sat in the vault for months. Identical names. Different content. 112 lines apart.

Had the lawyer filed from the Archive copy, the VSL claims would not have been filed. They would not have been protected. Someone else could have patented them. The cooperative would have lost the intellectual property that distinguishes its lending mechanism from every predatory alternative.

The compilation caught it.

This is what the Attic is for. Not just storage. Verification. Reconciliation. Catching the moments when two copies of the same document diverge without anyone noticing.

Every other Patent Bag in the vault — Bags 5, 6, 7, 9, 10 — passed the variant check. All copies identical across all locations. Only Bag 8 had a discrepancy. Only Bag 8 had claims that existed in one version but not another.

The compilation caught it.

---

## This is NOT Pudding

Patent Bag 8 (`PATENT_BAG_8_LMD_JUKEBOX_VSL.md`) covers 14 innovations (#88-#101) across Let's Make Dinner (cooperative meal coordination), JukeBox (creative licensing), and VSL (Very Short Lending). The canonical Emperor version includes 52 claims total, with expanded VSL lending mechanism specifications that do not appear in the Archive duplicate. Bishop B075 compilation identified the discrepancy during variant audit of Patent Bags 5-10. The Emperor version is the authoritative filing version.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Patent Bag 8 specifications (Emperor canonical version) with VSL lending claims |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Emperor version line count | 795 |
| Archive version line count | 683 |
| Missing lines | 112 |
| Patent Bags audited | 6 (Bags 5-10) |
| Bags with discrepancies | 1 (Bag 8 only) |
| Claims affected | VSL lending mechanism |
| Innovations in Bag 8 | 14 (#88-#101) |
| Total claims in Bag 8 | 52 |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Pepper (Legal/Compliance) | Primary — IP protection, filing accuracy, legal risk |
| Oregano (Coordination/Governance) | Secondary — archive discipline, version control |
| Cumin (Engineering/Architecture) | Secondary — file system integrity, reconciliation |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  116,
  'The Missing Claims',
  'the-missing-claims',
  'Patent Bag 8 (LMD + JukeBox + VSL) — variant audit discovery',
  NULL,
  'Patent Bag 8 is 795 lines long in the Emperor directory. It is 683 lines long in the Archive copy. That is 112 missing lines...',
  'Patent Bag 8 specifications including 14 innovations covering cooperative meal coordination, creative licensing, and micro-duration lending (VSL).',
  'pepper',
  ARRAY['oregano', 'cumin'],
  ARRAY[88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101],
  'B075',
  'draft'
);
```
