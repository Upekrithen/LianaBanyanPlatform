# Knight Session K415 — Launch Day Bug Fixes

**Author:** Bishop B101
**Date:** April 12, 2026
**Priority:** CRITICAL — Opening Gambit fires TODAY
**Context:** Founder is deploying the build NOW. These are the bugs found during Bishop live-site verification that need code fixes.

---

## Bug 1 — CRITICAL: /like-what card text invisible

**URL:** https://lianabanyan.com/like-what
**Symptom:** Project cards under "The Projects" section show icons and "Explore →" links, but card titles and descriptions are invisible. Text color appears to match or nearly match the card background.
**File:** Likely in the component rendering project cards on the LikeWhat page. Check for text color classes — probably `text-white` or `text-foreground` on a white/light card background.
**Fix:** Ensure card title and description text has sufficient contrast against the card background. Use `text-gray-900` or `text-foreground` with a card that has a contrasting background, or vice versa.

## Bug 2 — HIGH: Patent Portfolio shows 2,224 innovations (should be 2,262)

**URL:** https://lianabanyan.com/patent-portfolio
**Symptom:** Header text says "2,224 documented innovations" — this is a hardcoded or stale-queried number.
**Root cause:** The page may use a hardcoded count, an old query, or the `innovation_log` table is incomplete (only 2,059 of 2,262 entries per K414 audit). The `platform_canonical` table was updated by K414 but the page may not read from it.
**Fix:** Ensure the Patent Portfolio page reads innovation_count from `platform_canonical` (which now has 2262), NOT from `count(*)` on `innovation_log` (which is incomplete). Same for Crown Jewel count — should show 221, not a derived count.

## Bug 3 — HIGH: Glass Door shows "No outreach letters published"

**URL:** https://lianabanyan.com/outreach
**Symptom:** Page renders but shows empty state despite 95 letters in `outreach_letters` table.
**Root cause:** K414 promoted letters from `draft` to `proposed` state. The frontend query in `useOutreachLetter` hook likely filters for `state = 'published'` or some other state that doesn't match `proposed`.
**Fix:** Check the query in `useOutreachLetter.ts` (or the outreach index page component). Either:
  - Change the filter to include `proposed` state letters (for advisory voting phase), OR
  - Update the 95 letters to `state = 'published'` if that's the intended public state

## Bug 4 — MEDIUM: LRH mascot / Helm layout issues

**Symptom:** Founder reports LRH character has the open Helm next to her, and "US" underneath. Layout overlap or positioning issue.
**File:** Check HelmPage.tsx, MuseumShell, and any mascot rendering components on the Helm page.
**Fix:** Inspect the layout and fix positioning/z-index/margin issues.

## Bug 5 — LOW: Mascot art upgrade (8 new characters)

**Location:** `platform/src/assets/mascots/son-final-art/` — 24 new PNG files (8 characters × 3 variants)
**Characters:** Owl, Pig, Fox, Cat, Beaver, Chicken, Rabbit, Turtle
**Action:** Replace placeholder sketches in `src/data/mascots.ts` with the new final art files. Each character has 3 variants (e.g., PFPowl1.png, PFPowl2.png, PFPowl3.png). Use variant 1 as default.
**Note:** Chicken and Turtle may need role assignments in the mascot registry. Check with Bishop.

## Bug 6 — LOW: upekrithen.lianabanyan.com DNS

**Symptom:** Custom domain doesn't resolve. `.web.app` domain works fine.
**Fix:** Add CNAME record in domain registrar pointing `upekrithen.lianabanyan.com` to the Firebase hosting target.

---

## Deploy Notes

Founder may have already deployed by the time Knight picks this up. Check whether the build on Firebase is current before making changes. If it is, just fix the bugs and redeploy. If it isn't, do a full deploy first:

```bash
cd platform
npm run build
firebase deploy --only hosting:main -P default
```

For Supabase migrations:
```bash
cd platform
npx supabase db push
npx supabase functions deploy --no-verify-jwt
```

**Bugs 1-3 are launch-blocking. Fix those first. Bugs 4-6 can follow.**

---

*Bishop B101 — Launch Day. FOR THE KEEP.*
