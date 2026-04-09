# KNIGHT SESSION 279 — BISHOP_DROPZONE Reorganization
## Bishop B075 | April 4, 2026

---

## MISSION

Reorganize `BISHOP_DROPZONE/` into numbered category folders so the Founder can find files without scrolling through 1,000+ loose items. Safe-move with manifest for reversibility.

---

## CURRENT STATE

- ~1,000+ loose files at dropzone root
- 247 PROMPT_KNIGHT_SESSION_*.md
- 13 PROMPT_PAWN_*.md
- 93 PAWN_B* files (some loose, some in subfolders)
- ~150+ PUDDING_*.md files
- ~20+ CREWMAN6_CHAPTER_*.md (BST episodes)
- ~20+ SPOONFULS_BATCH_*.md
- ~40+ COMPILED_*.md (from B063-B075 compilation work)
- ~100+ BISHOP_HANDOFF_SESSION_*.md
- ~30+ PAPER_*.md
- ~20+ ARTICLE_*.md
- Misc: ACADEMIC_*, CANONICAL_*, DESIGN_DOC_*, INNOVATION_*, PITCH_*, CUE_CARD_*, PUDDING_*, etc.
- 11 existing subdirectories: FLY_ON_THE_WALL, HUMANIZED_FINAL, OPENING_GAMBIT, PAPERS_CONVERSATIONAL, PAPERS_SIMPLE, PAWN_B44_FAMILY_PROMPTS, PAWN_FAMILY_SOURCES, PUDDING_FULL, ROOK_EXTRACTS, UNDER_THE_HOOD, __pycache__

---

## TARGET ORGANIZATION

```
BISHOP_DROPZONE/
├── 01_KnightPrompts/            ← PROMPT_KNIGHT_SESSION_*.md + KNIGHT_*.md
├── 02_PawnPrompts/              ← PROMPT_PAWN_*.md + PAWN_*.md (loose files)
│   ├── PAWN_B44_FAMILY_PROMPTS/ (existing subfolder, MOVED here)
│   └── PAWN_FAMILY_SOURCES/     (existing subfolder, MOVED here)
├── 03_BishopHandoffs/           ← BISHOP_HANDOFF_SESSION_*.md
├── 04_Compiled/                 ← COMPILED_*.md (from compilation grind)
├── 05_Puddings/                 ← PUDDING_*.md + PUDDING_FULL/ subfolder
├── 06_BST_Episodes/             ← CREWMAN6_CHAPTER_*.md
├── 07_Spoonfuls/                ← SPOONFULS_BATCH_*.md
├── 08_Papers/                   ← PAPER_*.md
├── 09_Articles/                 ← ARTICLE_*.md + PAPERS_CONVERSATIONAL/ + PAPERS_SIMPLE/ + HUMANIZED_FINAL/
├── 10_CueCards/                 ← CUE_CARD_*.md
├── 11_Pitches/                  ← PITCH_*.md + WSJ_* outputs
├── 12_Innovations_AA/           ← AA_FORMAL_*.md, INNOVATION_*.md
├── 13_Ops_Deploy/               ← DEPLOYMENT_*, LAUNCH_*, OPENING_GAMBIT/, ROOK_EXTRACTS/, FLY_ON_THE_WALL/, UNDER_THE_HOOD/
├── 14_CanonicalReferences/      ← CANONICAL_*, STATS_*, DESIGN_DOC_*, VAULT_CLEANUP_*
├── 99_Misc/                     ← Anything uncategorized
└── __pycache__/                 (leave as-is, Python artifact)
```

---

## IMPLEMENTATION

### Step 1: Create Manifest FIRST (do not move anything yet)

```bash
cd "C:/Users/Administrator/Documents/LianaBanyanPlatform/BISHOP_DROPZONE"

# Generate pre-move manifest
find . -maxdepth 1 -type f -name "*.md" > REORGANIZATION_MANIFEST_B075.txt
find . -maxdepth 1 -type d >> REORGANIZATION_MANIFEST_B075.txt
```

### Step 2: Create Target Directories

```bash
mkdir -p 01_KnightPrompts 02_PawnPrompts 03_BishopHandoffs 04_Compiled \
         05_Puddings 06_BST_Episodes 07_Spoonfuls 08_Papers 09_Articles \
         10_CueCards 11_Pitches 12_Innovations_AA 13_Ops_Deploy \
         14_CanonicalReferences 99_Misc
```

### Step 3: Move Files by Pattern (PRESERVING originals via mv, not cp)

Execute these moves in order. Use `mv` not `cp` — we're organizing, not duplicating.

```bash
# Knight Prompts
mv PROMPT_KNIGHT_SESSION_*.md 01_KnightPrompts/ 2>/dev/null
mv KNIGHT_*.md 01_KnightPrompts/ 2>/dev/null

# Pawn Prompts (loose files + existing subfolders)
mv PROMPT_PAWN_*.md 02_PawnPrompts/ 2>/dev/null
mv PAWN_B*.md 02_PawnPrompts/ 2>/dev/null
mv PAWN_B44_FAMILY_PROMPTS 02_PawnPrompts/ 2>/dev/null
mv PAWN_FAMILY_SOURCES 02_PawnPrompts/ 2>/dev/null
mv PROMPT_PAWN_*.md 02_PawnPrompts/ 2>/dev/null

# Bishop Handoffs
mv BISHOP_HANDOFF_SESSION_*.md 03_BishopHandoffs/ 2>/dev/null
mv BISHOP_HANDOFF_*.md 03_BishopHandoffs/ 2>/dev/null

# Compiled Documents
mv COMPILED_*.md 04_Compiled/ 2>/dev/null
mv HISTORY_*.md 04_Compiled/ 2>/dev/null
mv BLUEPRINT_*.md 04_Compiled/ 2>/dev/null

# Puddings
mv PUDDING_*.md 05_Puddings/ 2>/dev/null
mv PUDDING_FULL 05_Puddings/ 2>/dev/null

# BST Episodes
mv CREWMAN6_CHAPTER_*.md 06_BST_Episodes/ 2>/dev/null

# Spoonfuls
mv SPOONFULS_BATCH_*.md 07_Spoonfuls/ 2>/dev/null

# Papers
mv PAPER_*.md 08_Papers/ 2>/dev/null
mv ACADEMIC_PAPER_*.md 08_Papers/ 2>/dev/null

# Articles (includes conversational/simple/humanized paper variants)
mv ARTICLE_*.md 09_Articles/ 2>/dev/null
mv PAPERS_CONVERSATIONAL 09_Articles/ 2>/dev/null
mv PAPERS_SIMPLE 09_Articles/ 2>/dev/null
mv HUMANIZED_FINAL 09_Articles/ 2>/dev/null

# Cue Cards
mv CUE_CARD_*.md 10_CueCards/ 2>/dev/null

# Pitches
mv PITCH_*.md 11_Pitches/ 2>/dev/null
mv WSJ_*.md 11_Pitches/ 2>/dev/null
mv BISHOP_REVIEW_WSJ_*.md 11_Pitches/ 2>/dev/null

# Innovations / A&A Formals
mv AA_FORMAL_*.md 12_Innovations_AA/ 2>/dev/null
mv INNOVATION_*.md 12_Innovations_AA/ 2>/dev/null

# Operations / Deploy
mv DEPLOYMENT_*.md 13_Ops_Deploy/ 2>/dev/null
mv LAUNCH_*.md 13_Ops_Deploy/ 2>/dev/null
mv OPENING_GAMBIT 13_Ops_Deploy/ 2>/dev/null
mv ROOK_EXTRACTS 13_Ops_Deploy/ 2>/dev/null
mv FLY_ON_THE_WALL 13_Ops_Deploy/ 2>/dev/null
mv UNDER_THE_HOOD 13_Ops_Deploy/ 2>/dev/null

# Canonical References
mv CANONICAL_*.md 14_CanonicalReferences/ 2>/dev/null
mv STATS_*.md 14_CanonicalReferences/ 2>/dev/null
mv DESIGN_DOC_*.md 14_CanonicalReferences/ 2>/dev/null
mv VAULT_CLEANUP_*.md 14_CanonicalReferences/ 2>/dev/null
mv URGENT_*.md 14_CanonicalReferences/ 2>/dev/null
```

### Step 4: Post-Move Sweep

Identify any remaining loose files at root:
```bash
find . -maxdepth 1 -type f -name "*.md" > LEFTOVER_FILES_B075.txt
```

Review the leftovers list manually, then either:
- Move matching files to appropriate folders
- Move genuine misc files to `99_Misc/`

### Step 5: Generate Post-Move Manifest

```bash
# Generate per-folder file counts
for dir in 0*/ 1*/ 9*/; do
  count=$(find "$dir" -type f | wc -l)
  echo "$dir: $count files"
done > REORGANIZATION_RESULT_B075.txt
```

### Step 6: Update References (if any)

Search BISHOP_DROPZONE subfolders and librarian-mcp scripts for any HARDCODED paths referencing loose files that are now in subfolders:
```bash
grep -r "BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION_" ../ 2>/dev/null | grep -v "BISHOP_DROPZONE/01_KnightPrompts/"
```

If references exist, they may need updating. Or add symlinks at root for backward compatibility (if critical references exist).

---

## ACCEPTANCE CRITERIA

- [ ] Pre-move manifest generated (REORGANIZATION_MANIFEST_B075.txt)
- [ ] 15 target directories created (01- through 14- plus 99_Misc)
- [ ] All files moved by pattern (mv, not cp)
- [ ] Leftover files identified and categorized
- [ ] Post-move manifest shows file counts per folder
- [ ] References checked (and updated if needed)
- [ ] Existing subfolders preserved (moved as directories, not merged)

---

## DO NOT

- **Delete any files** — only MOVE
- **Copy files** — only MOVE (preserves single source of truth)
- **Touch __pycache__/** (Python artifact, leave alone)
- **Merge subfolder contents** (PAWN_B44_FAMILY_PROMPTS stays as a subfolder, just moved)
- **Rename any files** (organization only, not renaming)
- **Proceed without manifest** (safety requirement — manifest enables rollback)

---

## ROLLBACK PLAN (if something breaks)

The manifest enables reversal. If a file needs to be restored:
```bash
# Example reversal for a moved file
mv 01_KnightPrompts/PROMPT_KNIGHT_SESSION_279_DROPZONE_REORGANIZATION_B075.md ./
```

Full rollback: use the pre-move manifest to iterate and move files back to root.

---

*Bishop B075 reorganization prompt. Organizes ~1,000+ loose dropzone files into 15 numbered categories. Safe-move with manifest. No deletions, no copies, no renames.*
