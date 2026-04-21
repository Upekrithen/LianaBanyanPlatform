-- K414: Pre-Opening Gambit Verification Fixes
-- Session: K414 / B101 | April 12, 2026
-- Fixes discovered during live system verification sweep.

-- Fix 1: Canonical values — K413 derived from incomplete innovation_log
-- The innovation_log has only 2059 of 2262 entries, so COUNT(*) WHERE is_crown_jewel
-- returned 169 instead of the Bishop-authoritative 221. Direct-set to canonical values.
UPDATE platform_canonical SET value = 221 WHERE key = 'crown_jewel_count';
UPDATE platform_canonical SET value = 221 WHERE key = 'crown_jewels';
UPDATE platform_canonical SET value = 2405 WHERE key = 'patent_claims';
UPDATE platform_canonical SET value = 13 WHERE key = 'patent_applications';
UPDATE platform_canonical SET value = 13 WHERE key = 'provisional_count';

-- Fix 2: Glass Door letters stuck in 'draft' state
-- The b100_glass_door_backfill.sql correctly inserted 95 rows from letter_dispatch_queue,
-- but ALL letter_dispatch_queue rows had status='draft', so the CASE mapped them to
-- outreach_letters.state='draft' (invisible to the public /outreach page).
-- Promote all to 'proposed' (advisory voting mode) so they're publicly visible.
UPDATE outreach_letters
SET state = 'proposed',
    voting_mode = 'advisory',
    updated_at = now()
WHERE state = 'draft';
