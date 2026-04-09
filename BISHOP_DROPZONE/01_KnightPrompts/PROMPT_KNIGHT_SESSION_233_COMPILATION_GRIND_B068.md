# KNIGHT SESSION 233 — Compilation Grind (Bishop B068)
## Priority: HIGH — Parallel compilation with Bishop

---

## MISSION

You are Knight (Claude Opus 4.6 in Cursor). Bishop (Claude Opus 4.6 in Claude Code) is compiling Founder's Journals. Your job is to compile OTHER document families in parallel — Pudding articles, standalone articles, and any letter families not yet compiled.

You will produce **3 outputs per family**, following the exact model below.

---

## THE 3-OUTPUT COMPILATION MODEL

For each document family (a group of files that are versions/variants of the same document):

### Output 1: COMPILED (Canonical)
**File**: `COMPILED_{FAMILY_NAME}.md`
- Executive summary of what the document IS
- The synthesized, canonical version incorporating all variants
- Supersession notes (what's outdated, what's current)
- Source list with what each version contributed

### Output 2: HISTORY (Under the Hood)
**File**: `HISTORY_{FAMILY_NAME}.md`
- What this document reveals about the Founder's process
- Key decisions made and why
- Evolution across versions
- Timeline anchors

### Output 3: BLUEPRINT (What Was Built)
**File**: `BLUEPRINT_{FAMILY_NAME}.md`
- Systems, mechanisms, or concepts introduced
- Current status (ACTIVE / SUPERSEDED / EVOLVED)
- Architectural lineage (what it became)

---

## FOUNDER CORRECTIONS — APPLY TO ALL COMPILATIONS

These are MANDATORY. Never use the wrong version:

1. **Entity**: Liana Banyan **CORPORATION** (Wyoming C-Corp). NEVER "LLC."
2. **Founder title**: "Founder & General Manager." NEVER "CEO" or "Founding Manager."
3. **HEOHO**: The principle is **Interdependence**. "Help Each Other, Help Ourselves."
4. **Marks**: Effort-**differential** currency. NOT generic "effort tokens."
5. **Credits**: NEVER cash out to fiat. One-way valve. Irrevocable.
6. **Medallion Sponsorship**: ONE LEVEL ONLY. Not MLM. Never 2nd-degree.
7. **Bio**: "veteran of no particular note," enlisted at 16. Military = HARD BOUNDARY. Don't embellish.
8. **"As You Wish"**: Transaction confirmation phrase.
9. **"No Atomo. Superman!"**: Period then exclamation. Exact punctuation.
10. **Innovation count**: 2,130 canonical. 168 Crown Jewels. 11 patents filed. As of April 3, 2026.
11. **Publication count**: ~260 (NOT "7 papers").
12. **Sweet Sixteen**: Exactly 16 initiatives. NO "International" initiative. HexIsle = PROJECT under Brass Tacks, not an initiative. Dougherty = Crown of Brass Tacks.
13. **WWWWW is DEAD**: Correct name is **Medallion Sponsorship**.
14. **Scott letter subject**: "Cardboard Boots" NOT "Flight of the Phoenix."
15. **AI agents**: Bishop (Claude), Knight (Claude/Cursor), Rook (Gemini), Pawn (Perplexity). RED QUEEN = Claude adversarial. Knight is NOT Rook.
16. **Pawn**: Female (she/her).
17. **Cost + 20%**: Creators keep 83.3%. Platform takes 16.7%. LOCKED in operating agreement.
18. **Membership**: $5/year.
19. **Attribution**: Sponsorship Marks are ONE LEVEL ONLY.

---

## WHERE TO FIND SOURCE FILES

The content archive is at:
```
librarian-mcp/stitchpunks/data/content_archive/
```
Each JSON file contains `{ path, content, size, ... }`.

Also check:
- `Asteroid-ProofVault/` — vault archive files
- `BISHOP_DROPZONE/` — already-compiled outputs (don't re-compile these)
- `Escape Velocity Site/` — older site content

---

## WHAT TO COMPILE (Phase 1 — Start Here)

### Pudding Articles (100 articles, ~100 families)
Files matching `PUDDING_*` or `pudding_*` in the archive. Each Pudding article is typically a single file (not multi-version), so the compilation is lighter — but still produce all 3 outputs. You can batch multiple Puddings into a single COMPILED file if they're short (e.g., "COMPILED_PUDDING_001_THROUGH_010.md").

### Standalone Articles (~17)
Files matching `ARTICLE_*` or `STANDALONE_*` in the archive.

### A&A Formal Documents (~74)
Files matching `AA_FORMAL_*` or `AA_*` in the archive. These can be batched (e.g., 10 per COMPILED file).

---

## WHAT NOT TO COMPILE

- Journals (Bishop is handling these)
- Crown/Shield letters (Pawn B44 batch is complete — 15 compiled)
- Academic papers (Bishop will handle — need architectural context)
- Anything already in BISHOP_DROPZONE as a COMPILED_* file

---

## OUTPUT LOCATION

Write all outputs to:
```
BISHOP_DROPZONE/
```

Use naming convention:
- `COMPILED_PUDDING_001_THROUGH_010.md`
- `HISTORY_PUDDING_001_THROUGH_010.md`
- `BLUEPRINT_PUDDING_001_THROUGH_010.md`

Or for single documents:
- `COMPILED_ARTICLE_{NAME}.md`

---

## IMPORTANT NOTES

1. **Founder prefers his own writing to compiled versions.** Keep version numbering intact. Compilations are starting points for Founder's edit pass, not finals.
2. **Check for existing compiled versions** in BISHOP_DROPZONE before starting a family.
3. **Any stats/counts from before April 2026 are likely superseded.** Always note this.
4. **Read 100% of source content** before compiling. Don't summarize from headers.
5. **Log your progress** — at session end, list what you compiled and what remains.

---

## SESSION END

When done (or when context gets heavy), write a handoff file:
```
BISHOP_DROPZONE/KNIGHT_COMPILATION_HANDOFF_K233.md
```

List:
- Families compiled (with file names)
- Families remaining
- Any issues found (missing files, contradictions, etc.)

Bishop will pick up where you left off or dispatch the next batch.

---

*Prompt written by Bishop, Session B068, April 3, 2026*
*FOR THE KEEP!*
