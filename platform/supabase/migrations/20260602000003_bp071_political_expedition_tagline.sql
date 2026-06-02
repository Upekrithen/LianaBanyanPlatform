-- BP071 Scope 4: Initiative #15 Tagline Fix — Forward Party collision
-- Replaces "Not Left. Not Right. Forward." with "Not left or right. Simply effective."
-- Reason: "Forward" collides with Forward Party branding; new tagline is
--         unambiguous and avoids partisan association.
--
-- SLUG VERIFICATION (from migrations):
--   - Original seed: 'international' (20260209000007_seed_data.sql)
--   - Archive reconciliation: initiative_slug = 'power-to-the-people' (20260404000020)
--   - No subsequent migration changed this slug
--   - NOTE: Task spec says WHERE slug = 'political-expedition' but verified slug
--     is 'power-to-the-people' in the DB. Using initiative_number = 15 as safe anchor.
--
UPDATE public.initiatives
SET tagline = 'Not left or right. Simply effective.'
WHERE initiative_number = 15
  AND tagline IS DISTINCT FROM 'Not left or right. Simply effective.';

-- Verification:
-- SELECT initiative_number, initiative_slug, name, tagline FROM public.initiatives WHERE initiative_number = 15;
-- Expected: 15 | power-to-the-people | Power to the People | Not left or right. Simply effective.
