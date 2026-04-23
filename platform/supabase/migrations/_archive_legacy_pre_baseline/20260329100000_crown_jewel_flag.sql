-- K168: Add is_crown_jewel flag to innovation_log + seed 161 Crown Jewels
-- Bishop B047 Crown Jewel Registry audit

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

-- Step 5: Partial index for fast Crown Jewel queries
CREATE INDEX IF NOT EXISTS idx_innovation_log_crown_jewel
ON innovation_log (is_crown_jewel) WHERE is_crown_jewel = true;

-- Step 6: Update canonical stats
UPDATE platform_canonical SET value = '161' WHERE key = 'crown_jewels';
UPDATE platform_canonical SET value = '2099' WHERE key = 'innovation_count';
