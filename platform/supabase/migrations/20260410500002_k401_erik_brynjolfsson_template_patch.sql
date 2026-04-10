-- ============================================================================
-- K401: Erik Brynjolfsson Letter — Hardcoded "2,000 formal" → Template Variable
-- ============================================================================
-- Session: K401 (Bishop B094 patch)
-- Issue:   K400 Task 3D leak report flagged Erik Brynjolfsson's letter body
--          containing the rhetorical phrase "2,000 formal" — a round-number
--          reference that K399's targeted sweep did not match (K399 looked
--          for 2,393 / 2,199 / 2,187 / 2,091 specifically).
-- Fix:     Replace "2,000 formal" with "{{patentClaims}} formal" so the
--          template renderer substitutes the live canonical number (2393).
-- Scope:   Single letter, Brynjolfsson only. Idempotent: re-running is a
--          no-op because the WHERE clause filters on the presence of the
--          leaked phrase.
-- ============================================================================

UPDATE letter_dispatch_queue
SET letter_body = regexp_replace(letter_body, '2,000 formal', '{{patentClaims}} formal', 'g'),
    updated_at = NOW()
WHERE recipient_name ILIKE '%brynjolfsson%'
  AND letter_body ~ '2,000 formal';

-- Verification (uncomment to run manually in dashboard after apply):
-- SELECT recipient_name,
--   letter_body ~ '2,000 formal' AS still_has_leak,
--   letter_body LIKE '%{{patentClaims}}%' AS has_template
-- FROM letter_dispatch_queue
-- WHERE recipient_name ILIKE '%brynjolfsson%';
-- Expected: still_has_leak=FALSE, has_template=TRUE
