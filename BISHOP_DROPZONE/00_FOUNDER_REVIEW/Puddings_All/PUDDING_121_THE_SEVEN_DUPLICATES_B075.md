# Pudding #121 — The Seven Duplicates

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 121
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 Attic sweep — systematic `_1 copy` duplicate detection

---

## The Pudding

Seven files. Same three names. Four different directories.

ACADEMIC_PAPER_1_MARKET_VALUATION_001_1 copy.md — in three locations.
CONVERTIBLE_NOTE_PITCH_001_1 copy.md — in two locations.
INVESTOR_CONVERSATION_QUICKREF_1 copy.md — in two locations.

Total: seven files. Each one ending with ` copy.md`. Each one created the same way — a filesystem copy operation that appended " copy" to the name, leaving both the original and the copy in the same directory. Then someone copied the directory. The copies copied with it.

These are not edits. They are not versions. They are filesystem echoes — the ghosts of drag-and-drop operations that happen when you're trying to organize something and accidentally leave fingerprints.

Most archives have these. They are embarrassing. They accumulate. They clutter every search. And they never say what they are — just ` copy` at the end, which tells you nothing about whether the copy is newer, older, divergent, or identical.

The Attic sweep caught all seven.

ACADEMIC_PAPER_1_MARKET_VALUATION is the most interesting. Its duplicates exist in:
- `02_CROWN_LETTERS/MarkupFiles/`
- `02_WRITTEN/05_Academic_Papers/`
- `02_WRITTEN/` (root level)

Three locations. One file name. Which means: at some point, someone was trying to figure out where the Academic Paper belonged. Was it a Crown Letter (because it supports the Letters)? An Academic Paper (obviously)? Or a written work (the parent category)? They copied it to all three. And each copy spawned its own ` copy` artifact.

The lesson is not "keep things tidy." The lesson is that file system hierarchies are a THEORY of how your documents relate to each other — and every time you move a file, you are testing that theory. When the theory is unclear, the files multiply.

Seven duplicates. Three unique documents. Four directories. The duplicates are the fossil record of an organization figuring out its own taxonomy.

The Attic caught them. The cleanup will archive them. And the next time a file belongs in three categories at once, the system needs to answer the question differently — with a tag, a cross-reference, or a single canonical location — instead of three copies.

---

## This is NOT Pudding

During B075 compilation, Bishop conducted a systematic sweep for `_1 copy.md` files across the Asteroid-ProofVault directory tree. Seven files were identified across four directories (02_CROWN_LETTERS/MarkupFiles, 02_WRITTEN root, 02_WRITTEN/05_Academic_Papers, 04_PRESS_ARTICLES, 05_TECHNICAL_SPECS/Legal). These are filesystem duplicate artifacts, not content versions. Recommendation: archive all `_1 copy.md` files and move any ambiguous-location files to single canonical directories with cross-references.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full directory audit with all 7 duplicate file paths |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Systematic duplicates found | 7 |
| Unique documents represented | 3 |
| Directories affected | 4 |
| ACADEMIC_PAPER_1_MARKET_VALUATION copies | 3 locations |
| CONVERTIBLE_NOTE_PITCH_001 copies | 2 locations |
| INVESTOR_CONVERSATION_QUICKREF copies | 2 locations |
| Attic sweep pattern used | `*_1 copy.md` |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Oregano (Coordination/Governance) | Primary — archive hygiene, taxonomy |
| Cumin (Engineering/Architecture) | Secondary — file system discipline |
| Basil (Education/Creative) | Secondary — organizational learning |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  121,
  'The Seven Duplicates',
  'the-seven-duplicates',
  'B075 Attic sweep — systematic `_1 copy.md` duplicate detection',
  NULL,
  'Seven files. Same three names. Four different directories...',
  'Directory audit identifying 7 filesystem duplicate artifacts representing 3 unique documents across 4 directories.',
  'oregano',
  ARRAY['cumin', 'basil'],
  ARRAY[],
  'B075',
  'draft'
);
```
