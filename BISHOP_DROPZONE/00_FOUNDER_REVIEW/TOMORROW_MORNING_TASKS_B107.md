# Tomorrow Morning — Task List
## April 18, 2026 — Pre-Launch Checklist
## Bishop Session B107

---

## BEFORE HITTING GO — HARD GATES

These must be done before April 29. Sorted by deadline urgency.

---

### 1. TRADEMARK FILINGS (DIY — USPTO.gov)
File before April 29 opening gambit. All self-filed.

| Mark | Class | Est. Fee | Status |
|---|---|---|---|
| Romulator 9000 (word mark) | 42 (software) | $250 | 🔲 File |
| Romulator-Compliant 9000 (certification mark) | 41/42 | $350 | 🔲 File |
| #2260 Cooperative Defensive Patent Pledge (service mark) | 45 | $250 | 🔲 File |
| NotCents (word mark — backwards C, two bars) | Multi-class | $250–500 | 🔲 File |
| NotCents (design mark — visual logo) | Design | $250 | 🔲 File |

**Total floor: ~$1,350**
**File at:** [USPTO TEAS Plus](https://www.uspto.gov/trademarks/apply)

---

### 2. NYT OPINION OP-ED — SUBMIT
- **Deadline to submit:** April 20–21
- **File:** `00_FOUNDER_REVIEW/NYT_OPINION_OPED_EIGHTY_PERCENT_B103.md`
- **Action:** Read through, fill in the 4 `[BISHOP DRAFT]` sections in your own voice, then submit
- **Submit to:** [NYT Opinion submissions](https://www.nytimes.com/article/letters-opinion-submissions.html) — or direct contact if you have it
- **Disclosure:** Tell them Business desk is being pitched separately same day

---

### 3. REVIEW ALL `00_FOUNDER_REVIEW` DOCS
- **Dates are off throughout** — many files reference February/March dates that need updating to April 2026 context
- **All 8 B107 drafts need Founder voice pass** before send
- Files to review (priority order):
  1. `NYT_OPINION_OPED_EIGHTY_PERCENT_B103.md` ← most urgent
  2. `CROWN_LETTER_TOM_SIMON_CFO_v008_B103.md` ← 1 stat placeholder remaining
  3. `CROWN_LETTER_SEIBEL_CEO_v002_B103.md`
  4. `SCOTT_PATENT_PROSECUTION_FUND_ADDENDUM_B103.md`
  5. `CHIEF_OF_STAFF_OUTREACH_TEMPLATE_B103.md`
  6. `FIRST_NODE_CAPTAIN_CUE_CARD_ROSARIO_B107.md` ← show to Rosario
  7. `FIRST_NODE_MIL_FOUR_OPTIONS_B107.md` ← share with Rosario

---

### 4. RUN TREBOR SCHOLZ PIPELINE
- Scripts are in `13_Ops_Deploy/`
- Run: `python3 trebor_run_pipeline.py`
- Or step-by-step:
  1. `python3 trebor_pawn_analysis.py` → outputs `trebor_pawn_findings.md`
  2. `python3 trebor_bishop_synthesis.py` → outputs `trebor_bishop_recommendations.md`
- Review both outputs, then Bishop builds V16

---

### 5. SITE VISUAL CHECK
- Walk through lianabanyan.com on mobile + desktop
- Check: front page, Red Carpet flow, Cephas pages
- Known issues from B105: 5 front page fixes pending deploy, Tour white screen on mobile
- Build command: `cd platform; npm run build; firebase deploy --only hosting:main -P default`
- Cephas deploy: `cd Cephas/cephas-hugo; hugo --minify; firebase deploy`

---

### 6. HERJAVEC LETTER — FINAL CHECK BEFORE APRIL 27 SEND
- File: check `06_Letters/` for current Herjavec letter
- Key update: price raised to $10M (from $5M) — verify this is in the current version
- Romulator section added (B103) — verify present
- Send date: April 27 (5-day private window before media lands April 29)

---

### 7. WAVE 1 LETTERS — CONFIRM PRESTAGED
- Review `Wave_1_Apr12-13_Soft_Open/` and `Wave_2_Apr14-15_Real_Launch_PRESTAGED/`
- Confirm dispatch is ready for April 22–28 bolus send
- Cross-check against `MASTER_TIMELINE_PATHWAYS_B107.md`

---

### 8. PRO BONO COUNSEL LETTERS (week of April 29)
- 3 letters: Kilpatrick Townsend, Fenwick & West, Cooley
- Not yet drafted — add to Bishop session

---

## NOTES FROM LAST NIGHT (B107)

- Session logged as B107 (corrected from B103)
- All 5 priority batch docs in `00_FOUNDER_REVIEW/`
- Rosario Captain Cue Card + 4 one-pagers written — she picks C (LifeLine) recommended
- All [FOUNDER: ...] gaps drafted by Bishop — need your voice before send
- Romulator competitive context (TurboQuant/Gemini) patched into all 3 Cephas files
- Trebor Scholz pipeline scripts ready to run
- Tom Simon letter: "three commercial websites" confirmed, "more than 200 prior art searches" updated

---

*FOR THE KEEP. Get some sleep.*
