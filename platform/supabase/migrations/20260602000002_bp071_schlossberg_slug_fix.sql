-- BP071 Scope 3: Tatiana Schlossberg Slug Fix
-- Initiative #6 "Tatiana Schlossberg Health Accords"
-- Corrects slug typo: schlossburg (wrong, U) → schlossberg (correct, E/Berg)
--
-- VERIFICATION RESULT (pre-migration check via migrations/seed history):
--   - Original seed (20260209000007): initiative_slug = 'lifeline-medications'
--   - Archive reconciliation (20260404000020): name updated to 'Tatiana Schlossberg Health Accords'
--     but NO slug change in that migration
--   - canonical_values.yaml (BP044 W1) notes: canonical_exception = "Tatiana Schlossburg"
--     (with U) suggesting the slug may have been set to 'tatiana-schlossburg-health-accords'
--     directly in the DB or via a dashboard edit not tracked in migration files
--   - Search found NO migration file that explicitly set slug to 'schlossburg'
--   - Per task: write only if slug IS 'schlossburg' — this WHERE clause is safe (no-op if unmatched)
--
-- PRIMARY: Fix schlossburg → schlossberg (the task-specified correction)
UPDATE public.initiatives
SET initiative_slug = 'tatiana-schlossberg-health-accords'
WHERE initiative_slug = 'tatiana-schlossburg-health-accords';

-- ALSO correct any bare 'schlossburg' slug variant
UPDATE public.initiatives
SET initiative_slug = 'schlossberg'
WHERE initiative_slug = 'schlossburg';

-- ALSO correct the name spelling if still using "Schlossburg" (U) variant
UPDATE public.initiatives
SET name = 'Tatiana Schlossberg Health Accords'
WHERE initiative_number = 6
  AND name IS DISTINCT FROM 'Tatiana Schlossberg Health Accords';

-- No RLS policies reference this slug directly (verified: RLS policies in
-- 20260522230000_enable_rls_on_public_tables.sql use table-level policies only)

-- Verification:
-- SELECT initiative_number, initiative_slug, name FROM public.initiatives WHERE initiative_number = 6;
-- Expected: 6 | tatiana-schlossberg-health-accords | Tatiana Schlossberg Health Accords
