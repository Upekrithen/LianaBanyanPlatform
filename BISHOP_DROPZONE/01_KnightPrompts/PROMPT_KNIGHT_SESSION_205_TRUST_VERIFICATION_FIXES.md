# KNIGHT SESSION 205 — Trust Verification + Feature Fixes
## Bishop B054 | April 1, 2026
## Priority: HIGH — Family Launch Day

---

## CONTEXT

Bishop B054 performed a full audit of all 18 chat transcripts and the entire codebase. Multiple features claimed as "done" across B031-B053 were found to be broken, incomplete, or never implemented. This session fixes the remaining feature-level issues that require Knight-level component work.

**CRITICAL RULE FOR THIS SESSION**: After EVERY fix, Bishop will verify it independently. Do NOT claim something is done unless you have tested it. If something can't be tested in dev, say so explicitly.

---

## TASK 1: Trail Map — Make It Render Meaningful Content

**Problem**: Founder said "doesn't render anything meaningful" (B052). The Trail Map page exists but shows empty or placeholder content.

**File**: `src/pages/TreasureMaps.tsx` (or related Trail Map component)

**Fix**: The Trail Map should show the user's discovery journey — what they've explored, what's available, recommended next steps. Check if it's pulling data from Supabase or just rendering static placeholders. If static, wire it to pull from the user's actual activity/discovery data.

**Verification**: Navigate to the Trail Map page as a logged-in user. It should show real content, not "Coming Soon" or empty cards.

---

## TASK 2: The 2nd Second — Kit Flip + How It Works Interactivity

**Problem**: Founder reported "the level 1 Kit doesn't flip, nor give more info" and "each of these need to actually flip and do something" and "the sign in doesn't even do anything" (B053).

**Files**: Check the DSS app at `dss-the2ndsecond/` — likely `src/pages/` or `src/components/`

**Fix**:
1. Kit cards should flip on click to reveal details (3D flip animation like TreasureMaps K164)
2. "How It Works" cards should expand or flip to show content
3. Sign-in button should actually navigate to auth

**Verification**: On the2ndsecond.com, click each Kit card — it should flip. Click How It Works cards — they should expand. Click Sign In — should navigate to auth page.

---

## TASK 3: The 2nd Second Production Route

**Problem**: `the2ndsecond.com/production` shows a blank page. Route doesn't exist in DSSApp.

**Fix**: Add a `/production` route to the DSS app that shows active production projects filtered for The 2nd Second portal.

**Verification**: Navigate to the2ndsecond.com/production — should show production projects, not blank.

---

## TASK 4: HexIsle Initiative Content

**Problem**: HexIsle initiative page shows "Coming Soon" with no actual content seeded.

**File**: Check `src/pages/HexIsle.tsx` and related initiative pages

**Fix**: Seed meaningful content — HexIsle has 200+ innovations, the hydraulic water table system, hexagonal tile grammar, etc. This should show the actual HexIsle ecosystem, not a placeholder.

**Verification**: Navigate to the HexIsle initiative page. Should show real content about the hexagonal system.

---

## TASK 5: Letter Templatization (84 files)

**Problem**: B049 produced a complete manifest (`BISHOP_DROPZONE/STATS_UPDATE_MANIFEST_84_LETTERS_B049.md`) for converting 84 letter files from hardcoded stats to `{{variable}}` template syntax. This was NEVER executed. Zero letters are templatized.

**Fix**: Execute the B049 manifest. For all non-LOCKED letter files:
- Replace hardcoded innovation counts with `{{innovationCount}}`
- Replace hardcoded patent counts with `{{patentCount}}`
- Replace hardcoded formal claims with `{{formalClaimsCount}}`
- Replace hardcoded Crown Jewel counts with `{{crownJewelCount}}`
- Leave LOCKED files untouched

**Verification**: Grep for `{{innovationCount}}` across letter files — should match 80+ files. Grep for hardcoded "2,007" or "2,105" or "2,125" — should match zero (except LOCKED files).

---

## TASK 6: Run Health Check After All Fixes

**MANDATORY**: After completing all tasks, run:
```bash
cd platform && bash scripts/health-check.sh
```

This script checks for stale stats, missing routes, broken imports, and entity errors. It must return **16/16 ALL CLEAR** before this session is considered complete.

Also run:
```bash
cd platform && bash scripts/stats-audit.sh
```

And paste the output in your handoff so Bishop can verify.

---

## DEPLOY SEQUENCE

After all fixes:
```bash
cd platform
npm run build
firebase deploy --only hosting:main -P default
```

If DSS was changed:
```bash
cd dss-the2ndsecond
npm run build
firebase deploy --only hosting:2ndsecond -P default
```

---

## WHAT BISHOP ALREADY FIXED IN B054

Do NOT redo these — they are deployed and verified:

1. **Stale stats across ~50+ files** — all "2,007" → "2,128", all "10 provisional" → "11", all "1,511" → "2,097"
2. **Landing page stats** — Index.tsx, spotlightAlgorithm.ts updated
3. **Email footer** — send-transactional-email updated and deployed
4. **Cue Card email wiring** — CueCardCreator.tsx now imports useSendEmail, sends outreach email + auto-registers in Red Carpet
5. **useCanonicalStats fallbacks** — all updated
6. **RedCarpetWalkthrough, RedCarpet, SaltMines** — Crown Jewel and innovation counts fixed
7. **nervous-system/index.ts** — canonical constants updated
8. **foundingTransactions.ts** — all counts updated
9. **Opening Gambit scripts** — both scheduleOpeningGambit.ts and scheduleOpeningGambitPosts.ts stats fixed
10. **Health check scripts created** — `scripts/health-check.sh` and `scripts/stats-audit.sh`

---

*Bishop verified. Knight executes. Both accountable.*
*FOR THE KEEP!*
