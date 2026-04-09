# Knight Session 168 — Crown Jewel Database Migration + Stats Cascade
## Bishop B047 | March 29, 2026
## Priority: HIGH (blocks accurate Crown Jewel reporting across all surfaces)

---

## CONTEXT

Bishop B047 completed the CROWN JEWEL REGISTRY — a full audit of all Crown Jewel designations across the platform. The canonical count is now **161** (was 151 before Founder promoted 10 candidates).

The `innovation_log` table currently has NO Crown Jewel flag. Crown Jewels have been tracked only as a hardcoded canonical count. This migration adds `is_crown_jewel` to every innovation record and cascades the updated count to all surfaces.

Call `brief_me("Add is_crown_jewel column to innovation_log, seed 161 Crown Jewels, update canonical stats")` first.

---

## DELIVERABLE 1: Migration — Add is_crown_jewel column + seed data

Create migration `20260329100000_crown_jewel_flag.sql`:

```sql
-- Step 1: Add column
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS is_crown_jewel BOOLEAN DEFAULT false;

-- Step 2: Base 123 Crown Jewels (innovations #1-#123 are ALL Crown Jewels)
UPDATE innovation_log SET is_crown_jewel = true
WHERE innovation_number BETWEEN 1 AND 123;

-- Step 3: Post-base Crown Jewels (38 specific innovations)
UPDATE innovation_log SET is_crown_jewel = true
WHERE innovation_number IN (
  1663, -- Six Degrees Universal Connection Engine
  1914, -- Cue Card Slingshot
  1918, -- WaterWheel Multiplicity Effect
  1922, -- Lemon Lot
  1924, -- Vehicle Contribution Onboarding (PROMOTED B047)
  1925, -- Rally Group Transport Bundle Architecture (PROMOTED B047)
  1927, -- Cooperative Housing Acquisition
  1928, -- AirBnB Revenue Subsidy Model
  1929, -- Housing WaterWheel
  1931, -- Cooperative Commercial Real Estate
  1934, -- Unified Real Estate WaterWheel (PROMOTED B047)
  1936, -- Margin Economics as SEC Defense
  1943, -- Matched-Fund Tiered Production Cascade
  1948, -- Red Carpet Pre-Population
  1950, -- Community-Initiated Creator Recruitment
  1968, -- Restaurant Onboarding Campaign Cue Card (PROMOTED B047)
  1972, -- Universal Business Onboarding
  1975, -- Walking Billboard Signal
  1979, -- Tiered Commitment Chart C+20 to C+90
  1985, -- Captain's Calling Card
  1986, -- Sponsored LB Cards
  1987, -- Personalized QR Routing (Durin's Door)
  2011, -- Community-Governed Visual Design (Design Democracy)
  2022, -- Canister Modular Injection System (PROMOTED B047)
  2032, -- FHA Reasonable Accommodation Integration (PROMOTED B047)
  2034, -- Guest Marks Wallet for Contest Compliance (PROMOTED B047)
  2035, -- Irrevocable Backer Election (PROMOTED B047)
  2036, -- Platform-Specific Disclosure Templates (PROMOTED B047)
  2045, -- Element Overlays
  2079, -- Battery Dispatch
  2080, -- Stamp-to-Send Ledger
  2081, -- Circle in a Square Hole Adapter
  2085  -- Marks Payback Renewal
);

-- Step 4: PATENT_THRESH Crown Jewels (by title match — their canonical
-- numbers differ from the PATENT_THRESH internal filing numbers)
UPDATE innovation_log SET is_crown_jewel = true
WHERE (title ILIKE '%task-scoped context%' OR title ILIKE '%brief_me%')
   OR title ILIKE '%runtime portal detection%'
   OR title ILIKE '%cooperative housing revenue cascade%'
   OR (title ILIKE '%six-dimensional%' AND title ILIKE '%evaluation%')
   OR (title ILIKE '%adapt%' AND title ILIKE '%score%' AND category = 'governance');

-- Step 5: Create index for fast Crown Jewel queries
CREATE INDEX IF NOT EXISTS idx_innovation_log_crown_jewel
ON innovation_log (is_crown_jewel) WHERE is_crown_jewel = true;

-- Step 6: Update canonical stats
UPDATE platform_canonical SET value = '161' WHERE key = 'crown_jewels';
UPDATE platform_canonical SET value = '2099' WHERE key = 'innovation_count';
```

**IMPORTANT:** After running, verify: `SELECT COUNT(*) FROM innovation_log WHERE is_crown_jewel = true;` — should return **161** (or close — if PATENT_THRESH title matches find fewer than 4, investigate).

---

## DELIVERABLE 2: Update useCanonicalStats.ts

```typescript
// Update default value:
crownJewels: 161,
```

Also update the DB query mapping if it exists:
```typescript
crown_jewels: 'crownJewels',
```

---

## DELIVERABLE 3: Update redCarpetRecipients.ts

In the PLATFORM_STATS object:
```typescript
crownJewels: 161,
```

---

## DELIVERABLE 4: Fix stale Crown Jewel references

These files have STALE Crown Jewel numbers that need updating:

1. **foundingTransactions.ts** line 76: `crownJewels: 17` -> `crownJewels: 161`
2. **ipfsService.ts** lines 355-356: `crown_jewels_definite: 8, crown_jewels_possible: 9` -> `crown_jewels_definite: 161, crown_jewels_possible: 0`
3. **patentBuckets.ts** line 2135: The `crownJewels` array `[1228, 1233, 1239, 1245, 1261]` is stale — either remove it or update to reflect actual Crown Jewel innovation numbers (the full list is too long for an array here; consider querying the DB instead)

---

## DELIVERABLE 5: Update innovation count across platform

The current innovation count in the codebase is 2,093 (from Prov #11 filing). The canonical chain end is now #2099 (per B045). The next innovation registered will be #2100.

Update any hardcoded "2,093" references to "2,099" if not already done.

---

## DELIVERABLE 6: Crown Jewels Audit Button Enhancement

The existing Crown Jewels Audit button on the Upekrithen dashboard (from K105) queries innovation_log but displays a hardcoded count. Now that `is_crown_jewel` exists in the DB, update the audit modal to:

1. Query `SELECT * FROM innovation_log WHERE is_crown_jewel = true ORDER BY innovation_number`
2. Display actual Crown Jewel list with innovation numbers and titles
3. Show live count from DB instead of hardcoded value

---

## SEC RULES FOLLOWED
- No securities language
- Credits are prepaid service access, not investments
- Cost+20% is exact (83.3% to provider)
- Entity: Liana Banyan Corporation, EIN 41-2797446, Wyoming C-Corp

## CRITICAL RULES
- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- Sponsorship Marks are ONE LEVEL ONLY. Not MLM.
- Helm = member's personal space. Bridge = project control panel.
- Hugo is RELIC. All content from DB via React SPA.

---

**FOR THE KEEP.**
