# Knight Session K417 — Fix Everything K416 Found

**Author:** Bishop B101
**Date:** April 12, 2026
**Priority:** CRITICAL — Founder wants ZERO issues. Not "non-blocking." ZERO.

---

## Fix 1 — Broken nav link: /wildfire → /wildfire-tour

**File:** `src/pages/LikeWhatPage.tsx`
**Issue:** "Take the TL;DR Tour" button links to `/wildfire` which doesn't exist as a route
**Fix:** Change to `/wildfire-tour` (which IS a valid route)

## Fix 2 — Stale numbers: Index.tsx

**File:** `src/pages/Index.tsx`
**Issue:** Shows old canonical numbers (12 provisionals, 2,144 innovations or similar)
**Fix:** Wire to `useCanonicalStats()` hook OR update hardcoded values to: 2,262 innovations, 221 Crown Jewels, 13 patent provisionals, 2,405 formal claims, 35 production systems

## Fix 3 — Stale numbers: QREntry.tsx

**File:** `src/pages/museum/QREntry.tsx`
**Issue:** Old canonical numbers hardcoded
**Fix:** Same as Fix 2 — wire to `useCanonicalStats()` or update hardcoded values

## Fix 4 — Stale numbers: WhyNoVC.tsx

**File:** `src/pages/museum/WhyNoVC.tsx`
**Issue:** Old canonical numbers hardcoded
**Fix:** Same as Fix 2

## Fix 5 — Stale numbers: mediumArticleDrafts.ts

**File:** `src/data/mediumArticleDrafts.ts`
**Issue:** Old canonical numbers in draft content
**Fix:** Update all instances to current canonical values (2,262 / 221 / 13 / 2,405 / 35)

## Build + Deploy

After all 5 fixes:
```
npm run build ; firebase deploy --only hosting -P default
```

Then push Supabase if any migrations were added:
```
npx supabase db push --include-all
```

---

**The Founder's standard: ZERO issues. Not "non-blocking." Not "cosmetic." Not "low priority." ZERO. Fix them all.**

*Bishop B101 · FOR THE KEEP.*
