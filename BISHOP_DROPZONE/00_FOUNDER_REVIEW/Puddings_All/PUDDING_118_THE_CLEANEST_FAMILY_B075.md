# Pudding #118 — The Cleanest Family

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 118
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 compilation of Pitch Templates & Media Outreach

---

## The Pudding

There are seventy-plus pitch documents in the Liana Banyan archive.

TechCrunch. The Verge. Forbes. The Economist. MIT Technology Review. Harvard Business Review. Fast Company. Wired. Ars Technica. Jacobin. Reason Magazine. Christianity Today. Yes Magazine. Kaiser Health News. Stat News. Investopedia. NerdWallet. The Penny Hoarder. NPR Marketplace. Product Hunt. Hacker News. Shareable. SSIR. MIT Media Lab. WSJ (three distinct pitches). Regional pitches for Canada, EU, UK, Australia/NZ, Texas, Global South. Industry pitches for healthcare, education, 3D printing, cooperative economics, gaming.

Seventy publications. Seventy tailored pitches.

And out of all seventy, only TWO documents have multiple versions: PITCH-TEMPLATES-ALL.md (original + updated) and PITCH_LA_CAPITAL_DEL_SABOR.md (V1 + V2).

Every other publication-specific pitch is single-version. No iteration. No revisions stored in an Archive folder. No LOCKED snapshots. Just one draft, written carefully, stored cleanly.

This is not how most organizations handle media outreach.

Most organizations write dozens of drafts of the same pitch for the same publication, because each draft "isn't quite right yet," or because the person who wrote the previous draft left, or because the publication's editor changed, or because the news hook shifted, or because the founder kept revising. The result is piles of near-duplicate files that nobody can distinguish, and everyone is afraid to delete.

Liana Banyan did not do that.

The pitch template system is disciplined by architecture. There is a master template. It uses dynamic stats placeholders — `{{innovationCount}}`, `{{platformMargin}}`, `{{charitableInitiatives}}` — that auto-populate from the platform's canonical database. When the stats change, every pitch updates. No manual find-and-replace. No stale numbers. No "is this the current version?" confusion.

Each publication gets one customization: the news hook paragraph. Why THIS publication. Why NOW. Everything else comes from the template. Everything else updates automatically.

This is institutional discipline as code.

The pitch templates are the cleanest document family in the entire archive. Not because the founder was careful about deletions. Because the system made iteration unnecessary. Write once. Template everywhere. Update centrally. Distribute consistently.

And somewhere in the codebase, there is a `platform_canonical` table with key-value pairs that every pitch reads from. And when the innovation count ticks from 2,130 to 2,144, every pitch knows. Every outreach email, every media kit, every regional campaign, every founder bio — all of them update from one number in one table.

That is why the pitch template family is clean. The template replaces the drafts.

---

## This is NOT Pudding

The Liana Banyan pitch template system uses dynamic stats templating (`{{variableName}}` syntax) backed by the `platform_canonical` Supabase table. The Dynamic Stats Template System went live with K170. All Cephas content, pitches, letters, and outreach documents read canonical values from this single source of truth. No manual find/replace required. This architecture eliminates the drift between documents that plagues most organizational pitch systems.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Dynamic Stats Template System architecture + all 70+ pitch templates |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Publications with tailored pitches | 70+ |
| Pitches with multiple versions | 2 (out of 70+) |
| Dynamic stats variables | ~30 (innovations, claims, margin, CJs, etc.) |
| Template system activated | K170 (Bishop session) |
| Manual find/replace required | Zero |
| Drift risk | Zero (single source of truth) |
| Cleanest document family rank | #1 in the archive |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Sugar (Marketing/Outreach) | Primary — media pitches, publication targeting |
| Cumin (Engineering/Architecture) | Secondary — template system, canonical database |
| Oregano (Coordination/Governance) | Secondary — document discipline, version control |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  118,
  'The Cleanest Family',
  'the-cleanest-family',
  'Pitch Templates & Media Outreach (Bishop B075 compilation)',
  NULL,
  'There are seventy-plus pitch documents in the Liana Banyan archive...',
  'The Dynamic Stats Template System architecture enabling 70+ pitch templates to auto-update from a single canonical database.',
  'sugar',
  ARRAY['cumin', 'oregano'],
  ARRAY[],
  'B075',
  'draft'
);
```
