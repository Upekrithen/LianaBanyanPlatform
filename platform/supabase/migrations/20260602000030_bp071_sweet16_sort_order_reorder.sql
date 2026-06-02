-- BP071 Scope 1: Sweet-16 initiative reorder per Six Steps framework
-- Ratified by Founder 2026-06-02. Order: Feed (1-4) → Employ (5-8) → Build (9-10) →
-- Power (11-13) → Belong (14-16). Level the Field = MnemosyneC platform (no initiative slot).

-- Add sort_order column if it doesn't exist
ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS sort_order integer;

-- Map: new sort_order → current initiative_slug
UPDATE public.initiatives SET sort_order = 1  WHERE initiative_slug = 'lets-make-dinner';
UPDATE public.initiatives SET sort_order = 2  WHERE initiative_slug = 'lets-get-groceries';
UPDATE public.initiatives SET sort_order = 3  WHERE initiative_slug = 'family-table';
UPDATE public.initiatives SET sort_order = 4  WHERE initiative_slug = 'lets-make-bread';
UPDATE public.initiatives SET sort_order = 5  WHERE initiative_slug = 'lets-go-shopping';
UPDATE public.initiatives SET sort_order = 6  WHERE initiative_slug = 'household-concierge';
UPDATE public.initiatives SET sort_order = 7  WHERE initiative_slug = 'defense-klaus';
UPDATE public.initiatives SET sort_order = 8  WHERE initiative_slug = 'rally-group';
UPDATE public.initiatives SET sort_order = 9  WHERE initiative_slug = 'vsl';
UPDATE public.initiatives SET sort_order = 10 WHERE initiative_slug = 'brass-tacks';
UPDATE public.initiatives SET sort_order = 11 WHERE initiative_slug = 'power-to-the-people';
-- Health Accords slug may be 'tatiana-schlossburg-health-accords' (typo) or corrected form;
-- cover both so this migration is idempotent regardless of which slug fix ran first.
UPDATE public.initiatives SET sort_order = 12 WHERE initiative_slug IN (
  'tatiana-schlossburg-health-accords', 'tatiana-schlossberg-health-accords'
);
UPDATE public.initiatives SET sort_order = 13 WHERE initiative_slug = 'msa';
UPDATE public.initiatives SET sort_order = 14 WHERE initiative_slug = 'harper-guild';
UPDATE public.initiatives SET sort_order = 15 WHERE initiative_slug = 'jukebox';
UPDATE public.initiatives SET sort_order = 16 WHERE initiative_slug = 'didasko';
