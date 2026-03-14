-- =============================================================================
-- INNOVATION LOG — Filed vs Single Provisional (threshed)
-- Date: March 13, 2026
-- Purpose: Set status so we have exactly 1,336 "filed" and 258 for single
--          provisional. Rule: #1-#1336 = already in 6 apps; #1337-#1594 = 258.
-- =============================================================================

-- Already filed (in 6 provisionals 63/925,672 through 63/989,913): innovations 1-1336
UPDATE public.innovation_log
SET status = 'filed'
WHERE innovation_number BETWEEN 1 AND 1336;

-- Single provisional (258): innovations 1337-1594 — ensure they are not 'filed'
UPDATE public.innovation_log
SET status = 'pending'
WHERE innovation_number BETWEEN 1337 AND 1594
  AND (status IS NULL OR status != 'filed');

-- Optional: set patent_bag for the 258 so export is trivial
UPDATE public.innovation_log
SET patent_bag = 'Single Provisional'
WHERE innovation_number BETWEEN 1337 AND 1594;

COMMENT ON TABLE public.innovation_log IS 'Innovation registry. 1,594 total. #1-#1336 = filed (6 provisionals). #1337-#1594 = 258 for Single Provisional. Export single provisional: SELECT * FROM innovation_log WHERE innovation_number BETWEEN 1337 AND 1594 ORDER BY innovation_number.';
