# Knight Session 74 — Cleanup, Wiring, and Onboarding Credit UI Redesign
## Innovation Count: 1,897
## Priority: HIGH — Fixes verified bugs + implements Founder-directed Onboarding Credit redesign
## Depends on: Sessions 71-73 complete

---

> **CONTEXT:** Bishop Session 020 verified the entire codebase. Found 2 bugs and 1 major UI redesign needed per Founder directive. This session fixes everything and wires the last loose ends.

---

## Task 1: Fix TreasureMaps Routing Bug

**Bug:** `/treasure-maps` route in App.tsx currently points to `DMKeepSystem` component instead of `TreasureMaps` component.

**Fix:** In `App.tsx`, change the `/treasure-maps` route to render `TreasureMaps` instead of `DMKeepSystem`.

**Verify:** Navigate to `/treasure-maps` → should show the 7 treasure map cards (Breakfast Runner, Lunch Runner, Taco Truck, Catering, Grocery, Service, Designer).

---

## Task 2: Wire "Become an LB Designer" into Treasure Map Quiz

**Bug:** The treasure map quiz engine has 6 plays but NO designer play. The "Become an LB Designer" card exists in TreasureMaps.tsx but can't be reached via the quiz.

**Fix:** In `src/components/treasure-map/treasureMapEngine.ts`, add a 7th play:

```typescript
designer: {
  id: 'designer',
  title: 'Become an LB Designer',
  description: 'Design Lotería cards, cue cards, logos, and templates. Earn royalties every time a business uses your work.',
  route: '/arena',
  tags: ['creative', 'digital', 'flexible', 'solo'],
  level: 'starter',
}
```

In `treasureMapQuestions.ts`, ensure questions can produce tags that match the designer play (e.g., 'creative', 'digital', 'flexible', 'solo'). Add or adjust tag scoring so someone who answers "I'm artistic" / "I work digitally" / "I prefer flexible hours" gets the designer play recommended.

---

## Task 3: Onboarding Credit UI Redesign (Backed Marks)

**Founder directive (#1897, A&A 020A):** The Onboarding Credit is NOT cash passive income. It generates **Backed Marks** (allocation authority). The Runner still earns REAL money from delivery fees — the Backed Marks are the ADDITIONAL governance reward.

### 3A: Update TreasureMaps.tsx (SEC fix)

Lines 189-196 currently say:
```
earn 3% passive from platform's share — forever
$900/mo passive income
```

Replace with:
```
earn allocation authority from platform's share — ongoing
$900/mo equivalent in Backed Marks (governance influence)
```

Full replacement for the progression callout:
```tsx
<p className="font-semibold text-amber-300">The Runner → Steward → Node Captain Path</p>
<p className="text-sm text-slate-400 mt-1">
  Start delivering (earn delivery fees). Onboard businesses (earn allocation authority through Backed Marks). 
  Become their Steward (add management influence). Your direct earnings grow AND your voice in cooperative governance grows.
</p>
```

### 3B: Update OnboarderDashboard.tsx

Redesign to show TWO sections:

**Section 1: "Your Direct Earnings"**
- Delivery fees earned this month
- Management fees (if Steward)
- Total direct income

**Section 2: "Your Allocation Authority"**
- Backed Marks earned this month (from 3% of onboarded businesses' revenue)
- Total SAA accumulated
- "What you can direct" — link to BandWagon
- Visual: growing bar or pie chart showing influence vs. platform total

Replace all "$735/month passive income" language with allocation authority framing.

### 3C: Update RunnerDashboard.tsx

In the onboarding credit tracking section:
- Show "Businesses You Onboarded: X"
- Show "Backed Marks Earned This Month: Y"
- Show "Total Allocation Authority: Z"
- Remove any "passive income" language

### 3D: Database Migration

Create migration `20260323000003_onboarding_credit_redesign.sql`:

```sql
-- Add allocation authority columns to onboarding_credits
ALTER TABLE onboarding_credits 
  ADD COLUMN IF NOT EXISTS backed_marks_earned DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saa_accumulated DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allocation_rate DECIMAL(4,2) DEFAULT 3.00;

-- Rename credit_percentage for clarity (keep old column for backwards compat)
COMMENT ON COLUMN onboarding_credits.credit_percentage IS 'DEPRECATED: Use allocation_rate instead. This percentage generates Backed Marks, not cash.';
```

---

## Task 4: Treasure Map Guide Pages (Step-by-Step)

**Spec:** `BISHOP_DROPZONE/TREASURE_MAP_STEP_BY_STEP_PAGES.md`

Each treasure map card should link to a detailed guide page instead of directly to the storefront builder.

### 4A: Create TreasureMapGuide.tsx

Create `src/pages/TreasureMapGuide.tsx`:
- Route: `/treasure-maps/:mapId`
- Dynamic page that loads the guide for the selected map

**Structure:**
```
Hero (icon, title, subtitle, "Who This Is For")
├── "What You Need" checklist
├── Economics table
├── Phase accordion (Scout → Pitch → Launch → Expand)
│   └── Each phase has numbered steps with detail text
├── Level progression cards (4 levels)
├── "Your Allocation Authority" section (Backed Marks explanation)
├── Tool links (Storefront Builder, Cue Card Generator, Dashboards)
└── SEC disclaimer
```

### 4B: Hardcoded Guide Data

Create `src/data/treasureMapGuides.ts` with the guide content from Bishop's spec. Each map has:
- `id`: matches the TreasureMaps card id
- `whoThisIsFor`: paragraph
- `whatYouNeed`: string array
- `economics`: table data
- `phases`: array of { name, steps: { title, detail }[] }
- `levelProgression`: same as current cards but expanded
- `toolLinks`: array of { name, route, description }

### 4C: Update TreasureMaps.tsx Card CTA

Change the "Start This Map" button to link to `/treasure-maps/:mapId` instead of `/tools/storefront-builder`.

The guide page itself will link to the storefront builder at the appropriate step.

---

## Task 5: Update Innovation Count

Update `useCanonicalStats.ts` default to **1,897**.

---

## Task 6: Deploy

```bash
npm run build
firebase deploy --only hosting:lianabanyan-main
```

Verify:
- `/treasure-maps` shows 7 cards (not DMKeepSystem)
- `/treasure-maps/breakfast-runner` shows detailed guide
- OnboarderDashboard shows allocation authority, not passive income
- TreasureMaps progression callout uses SEC-safe language

---

## Build Order

```
Task 1 (Routing fix) → FIRST (quick win)
Task 2 (Designer quiz wiring) → after routing fix
Task 5 (Innovation count) → any time
Task 3A (TreasureMaps SEC fix) → after routing
Task 3D (Database migration) → parallel with 3A
Task 3B-3C (Dashboard UI updates) → after migration
Task 4A-4C (Guide pages) → after dashboards
Task 6 (Deploy) → LAST
```

---

## Key Notes

- All "passive income" language in the platform must be replaced with "allocation authority" or "Backed Marks"
- The Founder's full metaphor: "You planted the tree. You eat the fruit (delivery fees). AND you get to say where the cooperative plants the next tree (allocation authority)."
- Direct earnings (delivery fees, management fees) are PROMINENTLY displayed — the Runner is NEVER unpaid
- Backed Marks are the BONUS governance reward on top of direct income
- See `BISHOP_DROPZONE/AA_SESSION_020A_ONBOARDING_CREDIT_REDESIGN.md` for full spec

---

**FOR THE KEEP.**
