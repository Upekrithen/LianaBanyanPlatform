# KNIGHT SESSION 271 — Systematic Duplicate Cleanup
## Bishop B075 | April 4, 2026

---

## MISSION

Archive all 7 systematic `_1 copy.md` duplicates identified during B075 compilation sweep, and expand the search to catch other duplication patterns (`copy.md`, `_copy.md`, `-copy.md`, numerical suffixes like `_2.md` without version context).

---

## CONTEXT

During B075 compilation, a systematic sweep identified 7 files with the `_1 copy.md` suffix pattern across 4 directories. These are filesystem artifacts from Explorer/Finder duplication operations, not content versions.

**Identified duplicates:**
1. `02_CROWN_LETTERS/MarkupFiles/ACADEMIC_PAPER_1_MARKET_VALUATION_001_1 copy.md`
2. `02_CROWN_LETTERS/MarkupFiles/CONVERTIBLE_NOTE_PITCH_001_1 copy.md`
3. `02_CROWN_LETTERS/MarkupFiles/INVESTOR_CONVERSATION_QUICKREF_1 copy.md`
4. `02_WRITTEN/05_Academic_Papers/ACADEMIC_PAPER_1_MARKET_VALUATION_001_1 copy.md`
5. `02_WRITTEN/ACADEMIC_PAPER_1_MARKET_VALUATION_001_1 copy.md`
6. `04_PRESS_ARTICLES/CONVERTIBLE_NOTE_PITCH_001_1 copy.md`
7. `05_TECHNICAL_SPECS/Legal/INVESTOR_CONVERSATION_QUICKREF_1 copy.md`

---

## STEP 1: Expand Search for All Duplicate Patterns

Run these find commands:

```bash
cd "C:/Users/Administrator/Documents/LianaBanyanPlatform/Asteroid-ProofVault/"

# Pattern 1: "_1 copy.md"
find . -name "*_1 copy.md" 2>/dev/null

# Pattern 2: " copy.md" (with space)
find . -name "* copy.md" 2>/dev/null

# Pattern 3: "_copy.md" (with underscore)
find . -name "*_copy.md" 2>/dev/null

# Pattern 4: "-copy.md" (with dash)
find . -name "*-copy.md" 2>/dev/null

# Pattern 5: Also check docx
find . -name "* copy.docx" 2>/dev/null

# Pattern 6: "2.docx" pattern (like ENTREPRENEUR_FOUNDER_ARTICLE 2.docx)
find . -name "* 2.docx" 2>/dev/null
```

## STEP 2: Content Comparison

For each identified duplicate, compare its content with the presumed original:

```bash
# For each pair, run diff
diff "ORIGINAL.md" "DUPLICATE_1 copy.md"

# If identical: confirm safe to archive
# If different: flag for human review (may be a genuine version)
```

## STEP 3: Archive Duplicates

Create a new archive directory and move confirmed duplicates:

```bash
mkdir -p "_DUPLICATES_ARCHIVE_B075"

# Move each confirmed duplicate (NOT delete — move)
mv "path/to/FILE_1 copy.md" "_DUPLICATES_ARCHIVE_B075/"
```

**Record each move in a manifest**: `_DUPLICATES_ARCHIVE_B075/MANIFEST.md` listing:
- Original file path
- Archive destination
- Content identical to original? (yes/no)
- Date archived
- Bishop session (B075)

## STEP 4: Address Multi-Location Copies

For documents that exist in MULTIPLE directories (not just `_1 copy` duplicates):

**ACADEMIC_PAPER_1_MARKET_VALUATION_001.md exists in THREE locations:**
- `02_CROWN_LETTERS/MarkupFiles/`
- `02_WRITTEN/05_Academic_Papers/`
- `02_WRITTEN/` (root)

Determine the CANONICAL location and archive or symlink the others.

**Recommendation**: Academic Papers should live ONLY in `02_WRITTEN/05_Academic_Papers/`. The MarkupFiles and root copies should be archived.

**CONVERTIBLE_NOTE_PITCH_001.md exists in TWO locations:**
- `02_CROWN_LETTERS/MarkupFiles/`
- `04_PRESS_ARTICLES/`

Canonical: `04_PRESS_ARTICLES/` (convertible notes are press/investor materials, not letters).

**INVESTOR_CONVERSATION_QUICKREF.md exists in TWO locations:**
- `02_CROWN_LETTERS/MarkupFiles/`
- `05_TECHNICAL_SPECS/Legal/`

Canonical: `05_TECHNICAL_SPECS/Legal/` (investor conversations are legal/business strategy).

## STEP 5: Update Archivist Report

Re-run `librarian-mcp/stitchpunks/sp2_archivist.py` to regenerate the archivist report with duplicates now archived.

## STEP 6: Report to Founder

Produce `_DUPLICATES_ARCHIVE_B075/REPORT.md` with:
- Total duplicates found (by pattern)
- Files archived
- Files requiring human review
- Canonical location decisions
- Before/after file counts

---

## ACCEPTANCE CRITERIA

- [ ] All 7 known `_1 copy.md` duplicates archived
- [ ] Expanded search completed (5 patterns)
- [ ] Any NEW duplicates identified and archived
- [ ] Multi-location documents reduced to single canonical locations
- [ ] Manifest + Report written
- [ ] Archivist report regenerated

## DO NOT

- DELETE any files — only MOVE to `_DUPLICATES_ARCHIVE_B075/`
- Archive files with DIFFERENT content (those are genuine versions, flag for review)
- Move LOCKED files (those are intentional revision history)
- Change the main archivist report structure
