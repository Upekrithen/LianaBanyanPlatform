# KNIGHT SESSION 22: Corrections, Implementation, and LAST PASS
**Assigned by:** Bishop (Session 006, March 15, 2026)
**Priority:** URGENT — Founder wants everything pushed out the door TONIGHT
**Previous Session:** Knight Session 21 (commits 2f80abc through adc17b7)

---

## READ FIRST
1. `MILESTONE_HANDOFF_MARCH_2026.md` (full state)
2. `BISHOP_DROPZONE/Bishop006.md` (Bishop's session report)
3. This prompt

---

## PHASE 1: CORRECTIONS (Do these FIRST)

### 1.1 Handoff Numbers Are Stale
The MILESTONE_HANDOFF_MARCH_2026.md has outdated numbers in several places:

- **Innovation count:** Should be **1,662** everywhere (check all instances)
- **Patent claims:** Should be **1,336+** across **7** provisionals (was "6 provisional applications" in many places)
- **Latest application:** Add **64/006,010** (filed March 15, 2026) to all patent references
- **Copy-paste prompt at bottom:** Still says "1,560" and "928+" — update to 1,662 and 1,336+
- **"Latest commit" reference:** Update to current HEAD
- **Session number:** We're now at Session 22+

### 1.2 Cephas Stale Numbers
Knight Session 21 fixed the innovation-footer.html (150+ → 1,662). But check ALL Cephas content for stale numbers:
- `press/_index.md` — Still says "90+ innovations, 380+ claims, 8 initiatives"
- Any other pages with old counts
- About page — may reference old filing counts
- Run: `grep -r "90+" content/ | grep -i innov` and `grep -r "150+" content/` and `grep -r "380+" content/`

### 1.3 Platform Stale References
Search the platform codebase for outdated references:
```bash
grep -r "Lovable" src/ --include="*.tsx" --include="*.ts" -l  # 18 known references in non-user-facing
grep -r "90 innovations" src/ -l
grep -r "150 innovations" src/ -l
grep -r "380 claims" src/ -l
grep -r "928 claims" src/ -l
grep -r "6 provisional" src/ -l  # Should be 7 now
```

### 1.4 Missing 7th Application in Patent References
Anywhere the platform or Cephas lists the 6 provisional applications, add the 7th:
- **64/006,010** — Filed March 15, 2026 — 653 innovations (#1001-#1662) with full specifications

---

## PHASE 2: IMPLEMENTATION

### 2.1 Push Git to Remote
The repo is 19+ commits ahead of origin/main. Push:
```bash
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"
git push origin main
```

### 2.2 Ingest Pawn's Valuation Report
When Pawn completes `BEHEMOTH_REBORN_VALUATION_MARCH_2026.md`:
1. Create Cephas page: `content/patents/valuation-march-2026.md`
2. Include executive summary + valuation tables
3. Link from patents/_index.md
4. Rebuild Hugo and redeploy Cephas

### 2.3 Crown Jewels Verification
Verify the Crown Jewels page at `content/innovations/crown-jewels.md`:
- All 123 innovations listed with correct titles
- Bag assignments correct (Bags 1-10)
- No placeholder text remaining
- Links work

### 2.4 Prior Art Page Verification
Verify `content/patents/prior-art-research.md`:
- All 16 innovations covered (#1600-#1614, #1623)
- Novelty assessments accurate
- Patent numbers cited correctly

---

## PHASE 3: LAST PASS (After Pawn delivers)

### 3.1 Crown Letters Check
The letters section in Cephas is a STUB (`letters/_index.md` — 15 lines only). The Founder wants letters prepped. Check:
- How many Crown Letters exist in `01 MarkupFiles/`?
- Which are ready for publication vs. internal-only?
- **DO NOT** publish any letter that contains real names of recipients (Founder privacy rules)
- Create proper letter index in Cephas if content is ready

### 3.2 Full Build + Deploy
```bash
# Platform
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"
npm run build
firebase deploy --only hosting:main -P default

# Cephas
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
hugo --minify
firebase deploy
```

### 3.3 Smoke Test
After deploy, verify:
- [ ] lianabanyan.com loads, auth works
- [ ] the2ndsecond.com loads, Crown Jewels page renders
- [ ] /innovations/crown-jewels/ — all 123 listed
- [ ] /patents/prior-art-research/ — 16 innovations covered
- [ ] /patents/ index shows 7 provisionals
- [ ] Innovation footer says "1,662"
- [ ] No "Lovable" branding visible on any user-facing page
- [ ] No SEC-dangerous language on any user-facing page

---

## PHASE 4: LETTERS (Founder directs which to publish)

The Founder said "After that, we do the letters." This means:
1. Wait for Founder to specify which Crown Letters to publish
2. Create individual Cephas pages for each approved letter
3. Build the letters index page
4. Rebuild and redeploy

**Known Crown Letter Assignments (from Bishop's deep read):**
- Buffett → "French Fleet" (ONLY $ ask)
- Scott → Board Chair ("Cardboard Boots")
- Seibel → CEO
- Tom Simon → CFO
- Khan → Didasko Chancellor
- Dougherty → Industry Chancellor / Lord Banyan of the Forge
- Newmark → Infrastructure Chancellor
- ForgeCore/Colby → COO candidate ("Most Wanted")
- Plus academic red carpet, defense, rally, shield knight assignments

**Privacy Rules:** Do NOT publish real names. Use titles/roles only. Founder must approve each letter before publication.

---

## CRITICAL REMINDERS
- SEC language rules: equity→participation, invest→sponsor, ROI→service value, shares→membership participation
- Military service = HARD BOUNDARY — never press for details
- All corrections terminology from MEMORY.md applies
- Commit each phase separately with descriptive messages
- Ask Founder before any destructive git operations
