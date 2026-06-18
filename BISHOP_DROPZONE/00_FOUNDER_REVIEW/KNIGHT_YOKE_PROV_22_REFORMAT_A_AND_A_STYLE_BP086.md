# KNIGHT YOKE — PROV_22 A&A Style Reformat (B-stream addendum)

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Founder direct:** *"Provisional patent isn't bad but it's ugly and doesn't follow the TOC and needs a much shorter title, can you please apply the Provisional 21 and all the way back to 16 formatting?"*

**Queue position:** Drop into ACTIVE Knight session (BLACK MAMBA × 30 + F-stream). Do NOT spawn new Knight. §2 BLOOD.

**Knight preamble (BP084):** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §2 100%-READ before edit.

---

## What's wrong with v05_FINAL

Per Founder eyeball:
1. **Ugly** — heading hierarchy + spacing + page formatting drift from canonical A&A house style
2. **No TOC** — PROV_16-21 all have a Table of Contents; v05_FINAL doesn't
3. **Title too long** — current title is ~55+ words (auto-grown by appending every CG name during integration). PROV_16-21 titles are tight.

Source artifacts on disk:
- `PROV_22_DRAFT_v05_FINAL.md` (current, 214,639 bytes)
- `PROV_22_FILING_PDF_v05_FINAL.pdf` (current, 99 pages)
- A&A references: `legal/provisionals/PROVISIONAL_16_*/` (confirmed exists) + `Asteroid-ProofVault/PROV_21_ADDENDUM_EMPIRICAL_BP067.{md,pdf}` (the only PROV_21 artifacts on disk per BP086 audit — note this is the "ADDENDUM" not the base PROV_21)

If PROV_17/18/19/20 exist anywhere, glob first — they would be additional A&A references.

---

## SEGs

### SEG-B7 · A&A STYLE FREEZE (PROV_16-21 recon)

Read each available reference PDF/markdown 100% sequentially. Extract canonical style attributes:

- **Title pattern:** word count range · format ("System and method for X" · "Apparatus for X" · etc.) · use of subtitle if any
- **TOC structure:** placement (after title page? after manifest?) · indent depth · page-number column format
- **YAML frontmatter** schema (title/subtitle/author/date/version fields)
- **Filing Manifest table** structure (column headers · row format · how innovations are listed)
- **Heading hierarchy:** H1/H2/H3 used for what · numbering scheme (Roman numerals? Arabic? mixed?)
- **Claim notation:** PROV_16 uses `**Claim N**` (independent) + bulleted `(a)/(b)/(c)` sub-clauses · vs current PROV_22 v05's `**N.1**/**N.2**` decimal prose · pick canonical
- **Figure/drawing block** format
- **Abstract** length cap (USPTO 150 words; check what PROV_16 actually does)
- **Filing Gate Status** section structure
- **Pledge #2260** citation format (full text? reference? both?)
- **Page header/footer:** is there a running header with title or page-of-N footer?

Write style freeze doc to: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/PROV_22_REFORMAT/A_AND_A_STYLE_FREEZE_BP086.md`

**Deliverable:** structured spec doc Knight will apply in SEG-B8.

### SEG-B8 · TITLE CANDIDATES + FOUNDER GATE

Propose 3 candidate titles matching the A&A canonical pattern surfaced in SEG-B7. Constraints:

- Word count within the PROV_16-21 observed range (likely 8-20 words)
- Covers the substrate-architecture core innovation
- Does NOT enumerate every CG name (that's what the claims section is for — title should set the umbrella)
- Suggested anchor phrases (Bishop drafts): "Cooperative Substrate Architecture" · "Local-First Cooperative AI Substrate" · "Federated AI Knowledge Substrate" · "Verified-Cooperative Substrate Pipeline" — Knight evaluates against the reference style

Recommended Bishop candidates (Knight refines + picks the closest A&A-canonical form):

1. **"Cooperative Substrate Pipeline System and Method for Local-First Artificial Intelligence with Verified Knowledge Growth"** (15 words)
2. **"System and Method for a Cooperative Local-First AI Substrate with Multi-Specialist Plow and Adversarial Verification"** (17 words)
3. **"Cooperative-Architecture Substrate Pipeline for Local-First AI with Verified-Cooperative Knowledge Growth"** (12 words)

Knight picks one based on closest A&A match. Logs the chosen title + the runners-up in the reformat report. Founder reads at end-of-cycle; if he wants a different title it's a 1-line edit.

### SEG-B9 · REFORMAT v05_FINAL → v06_AA_STYLE

Apply the style freeze to v05_FINAL. Specifically:

1. **Replace title** with chosen candidate from SEG-B8
2. **Insert TOC** in PROV_16-21 canonical position (likely after Title page + Filing Manifest, before Field of Invention)
3. **Restructure headings** to match canonical hierarchy
4. **Convert claim notation** to canonical form if PROV_16/21 use a different convention than v05 (Bishop has noted v05 uses `**N.1**` decimal; if A&A canonical is `**Claim N**` + bullets, convert all 37 CGs — large mechanical job, SEG handles)
5. **Add Filing Manifest table** if missing
6. **Add Path B discipline section** if missing
7. **Add Filing Window / Priority section** if missing
8. **Page header/footer** alignment per reference
9. **Re-verify forbidden-word scan** is still clean after edits
10. **Re-verify abstract** is still ≤150 words (USPTO cap)

Save as: `PROV_22_DRAFT_v06_AA_STYLE.md`

### SEG-B10 · PDF RE-RENDER + GATE

Render `PROV_22_FILING_PDF_v06_AA_STYLE.pdf` via the same toolchain B1 used (pandoc + Chrome headless per `PROV_22_PDF_RENDER_SPEC.md`).

**Gates:**
- Page count: ≥ 95 AND ≤ 100 (the canonical filing gate — reformat must not blow it)
- TOC renders correctly with page numbers
- All 37 CGs still present
- All BP086 mandatory advantages still cited (CG35 Hex · CG36 Brain-Swap · CG37 Mimic Trunks)
- No widow/orphan disasters in rendered output (eyeball check)
- Forbidden-word scan still CLEAN

If page count drifts:
- < 95 → review claim group bullets/explanation expansion candidates; do NOT pad with filler
- > 100 → trim from Background section verbose prose (do NOT trim claim language)
- Iterate up to 5 times within the gate

### SEG-B11 · COMMIT + STAGE FOR FOUNDER

- Git commit + push (`feat(patent): v06 A&A canonical reformat`)
- Write yoke-return at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/YOKE_RETURN_PROV_22_REFORMAT_BP086.md` with:
  - Style freeze findings (canonical A&A spec)
  - Title chosen + runners-up
  - Final page count
  - Path to `PROV_22_FILING_PDF_v06_AA_STYLE.pdf`
  - "Ready for USPTO upload" stamp

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| B7 | STYLE_FREEZE_DONE | PROV_16 + PROV_21 canonical attributes documented in style-freeze doc |
| B8 | TITLE_CHOSEN | 3 candidates evaluated · 1 picked matching A&A pattern · runners-up logged |
| B9 | V06_REFORMAT_APPLIED | `PROV_22_DRAFT_v06_AA_STYLE.md` exists at canonical PATENTS path with TOC + new title + canonical hierarchy + Filing Manifest + Path B + Filing Window sections |
| B10 | V06_PDF_RENDERED | `PROV_22_FILING_PDF_v06_AA_STYLE.pdf` exists · 95 ≤ pages ≤ 100 · TOC renders · 37 CGs present · forbidden-word scan CLEAN |
| B11 | YOKE_RETURN_FILED | committed + pushed · yoke-return doc written with title + page count + path |

---

## Composition

Independent of all other in-flight streams (A6-A11, F4, F5/F6/F7) — this only touches `Asteroid-ProofVault/PATENTS/PROVISIONAL_22_BP083/`. Fan freely.

---

**Composed by Bishop BP086. Drop-in B-stream addendum to BLACK MAMBA × 30.**
