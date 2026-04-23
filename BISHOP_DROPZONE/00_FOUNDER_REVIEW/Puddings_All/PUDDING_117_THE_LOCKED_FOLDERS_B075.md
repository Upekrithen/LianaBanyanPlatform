# Pudding #117 — The Locked Folders

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 117
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 compilation of Crown-Tier Letters archive discipline

---

## The Pudding

In the archive for Craig Newmark's Infrastructure Chancellor letter, there are seven files.

CROWN_LETTER_CRAIG_NEWMARK_V2.md. CROWN_LETTER_CRAIG_NEWMARK_V3.md. CROWN_LETTER_CRAIG_NEWMARK_V4_DRAFT.md. And then in the Archive folder, three files with a prefix that makes the discipline visible: LOCKED01_CROWN_LETTER_CRAIG_NEWMARK_INFRASTRUCTURE_CHANCELLOR.md. LOCKED01_CROWN_LETTER_CRAIG_NEWMARK_V2.md. LOCKED02_CROWN_LETTER_CRAIG_NEWMARK_V2.md. LOCKED03_CROWN_LETTER_CRAIG_NEWMARK_V3.md.

Seven variants of a single letter, to a single person, asking him to take a single role.

This is not messiness. This is the opposite. Every version is preserved. Every iteration is timestamped. Every "locked" file represents a moment when the draft was stable enough to freeze — a snapshot that cannot be edited, only surpassed by the next version.

The Founder is asking Craig Newmark to serve as the Infrastructure Chancellor of a cooperative platform. That ask has to be right. The language has to honor Newmark's decades of digital infrastructure philanthropy. The framing has to connect Craigslist's founding ethic — never extract, always serve — to the cooperative's constitutional Cost+20% margin. The role description has to be concrete enough to evaluate but flexible enough to grow.

Each iteration of the letter refined the ask. V1 was the first attempt. V2 sharpened the ask. V3 locked V2's language and went further. V4 is the current DRAFT, not yet locked.

Compare this to how most organizations handle important letters. One draft, maybe two. Send it. If it fails, move on. If it works, delete the drafts. The final version becomes the only version.

Liana Banyan keeps the drafts.

Because someday, when the cooperative is explaining to an auditor or a historian or a new executive how a particular role was defined, the drafts will show the iteration. They will show that the language was tested and refined. They will show that the ask was considered. They will show that the role was not invented casually.

Michael Seibel's CEO offer has five variants, archived the same way. Casey Newton's pitch has five. Tim Ingham's has three. The highest-stakes letters have the most iterations. Naturally.

And hidden in the folder structure — `Archive/LOCKED03_CROWN_LETTER_CRAIG_NEWMARK_V3.md` — the prefix system tells you at a glance which versions are superseded and which are current. LOCKED means: frozen. Reviewed. Stable. Do not edit. V3 means: third iteration. 03 means: third locked snapshot.

This is institutional memory as file system discipline. The cooperative's iteration history is not a story told after the fact. It is a directory listing.

---

## This is NOT Pudding

The LOCKED prefix system in the Liana Banyan Crown Letter archive preserves revision history with IP-protection rigor. During B075 compilation, seven variants of the Craig Newmark Infrastructure Chancellor letter were identified, with four LOCKED snapshots (V1, V1, V2, V3) in the Archive subfolder. Michael Seibel CEO offer had five variants with two LOCKED snapshots. Pattern observed across all Crown-tier role-assignment letters: iteration count correlates with stakes. Highest-stakes asks have the most preserved revisions.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Crown Letter archive structure with version chains and LOCKED snapshot discipline |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Craig Newmark letter variants | 7+ |
| LOCKED snapshots for Newmark | 4 |
| Michael Seibel CEO letter variants | 5+ |
| LOCKED snapshots for Seibel | 2 |
| Casey Newton Platformer variants | 5 |
| Tim Ingham MBW variants | 3 |
| Crown-tier letters audited | 5 families |
| Pattern | Variant count ∝ ask stakes |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Oregano (Coordination/Governance) | Primary — archive discipline, institutional memory |
| Paprika (Leadership/Vision) | Secondary — role definition, executive recruitment |
| Pepper (Legal/Compliance) | Secondary — IP preservation, audit trail |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  117,
  'The Locked Folders',
  'the-locked-folders',
  'Crown-Tier Letters archive discipline (Bishop B075 compilation)',
  NULL,
  'In the archive for Craig Newmark Infrastructure Chancellor letter, there are seven files...',
  'Crown-Tier letter archive structure documenting version chains and LOCKED snapshot discipline across 5 letter families.',
  'oregano',
  ARRAY['paprika', 'pepper'],
  ARRAY[],
  'B075',
  'draft'
);
```
