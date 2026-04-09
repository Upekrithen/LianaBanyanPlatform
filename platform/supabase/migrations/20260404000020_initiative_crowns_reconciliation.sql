-- ============================================================================
-- Initiative crowns reconciliation (B076 / Session 275)
-- - Introduces multi-crown support
-- - Reconciles initiatives table to canonical Sweet Sixteen
-- - Seeds canonical crown assignments
-- ============================================================================

-- Part 1: Create normalized multi-crown table
CREATE TABLE IF NOT EXISTS public.initiative_crowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id TEXT NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  crown_name TEXT NOT NULL,
  crown_title TEXT NOT NULL,
  crown_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (crown_status IN ('vacant','pending','offered','accepted','declined','active')),
  crown_order INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (initiative_id, crown_name)
);

CREATE INDEX IF NOT EXISTS idx_initiative_crowns_initiative
  ON public.initiative_crowns(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initiative_crowns_status
  ON public.initiative_crowns(crown_status);

ALTER TABLE public.initiative_crowns ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'initiative_crowns'
      AND policyname = 'Anyone can read initiative crowns'
  ) THEN
    CREATE POLICY "Anyone can read initiative crowns"
      ON public.initiative_crowns
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Part 2: Deduplicate initiatives table and remove known legacy drift
DELETE FROM public.initiatives d
USING public.initiatives c
WHERE d.initiative_number IS NULL
  AND c.initiative_number IS NOT NULL
  AND lower(trim(d.name)) = lower(trim(c.name));

DELETE FROM public.initiatives
WHERE initiative_number IS NULL
  AND (
    lower(trim(name)) = 'defense claws'
    OR lower(trim(initiative_slug)) = 'defense-claws'
  );

-- Part 3: Correct canonical initiative names
UPDATE public.initiatives
SET name = 'Tatiana Schlossberg Health Accords'
WHERE initiative_number = 6;

UPDATE public.initiatives
SET name = 'Power to the People',
    initiative_slug = 'power-to-the-people'
WHERE initiative_number = 15;

-- Canonical clean-up for #14 naming consistency
UPDATE public.initiatives
SET name = 'Didasko'
WHERE initiative_number = 14;

-- Part 4: Seed canonical crown assignments
DELETE FROM public.initiative_crowns
WHERE initiative_id IN (
  SELECT id FROM public.initiatives WHERE initiative_number IS NOT NULL
);

INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, s.crown_name, s.crown_title, s.crown_status, s.crown_order
FROM public.initiatives i
JOIN (
  VALUES
    (1,  'Maneet Chauhan',                  'Crown (Grand Chef)',                                   'offered', 1),
    (3,  'Mary Beth Laughton',              'Crown',                                                 'offered', 1),
    (5,  'Ai-jen Poo',                      'Household Steward',                                     'pending', 1),
    (5,  'Ashton Applewhite',               'Age Champion',                                          'pending', 2),
    (5,  'Dr. Marc Freedman',               'Bridge Builder',                                        'pending', 3),
    (8,  'Robert Kaiser',                   'First Shield UK',                                       'pending', 1),
    (9,  'Kimberly A. Williams',            'Crown',                                                 'offered', 1),
    (10, 'Cathie Mahon',                    'Crown',                                                 'offered', 1),
    (12, 'Brené Brown',                     'Harper Prime',                                          'pending', 1),
    (14, 'Sal Khan',                        'Chancellor',                                            'offered', 1),
    (15, 'Arnold Schwarzenegger',           'Crown',                                                 'pending', 1),
    (15, 'Sandra Bullock',                  'Crown',                                                 'pending', 2),
    (15, 'Keanu Reeves',                    'Crown',                                                 'pending', 3),
    (15, 'Alexandria Ocasio-Cortez',        'Crown',                                                 'pending', 4),
    (16, 'Dale Dougherty',                  'Maker Mentor, Lord Banyan of Brass Tacks',             'pending', 1)
) AS s(initiative_number, crown_name, crown_title, crown_status, crown_order)
  ON i.initiative_number = s.initiative_number;

-- Part 5: Trigger to sync primary crown fields back to initiatives
CREATE OR REPLACE FUNCTION public.sync_primary_crown_to_initiative()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.initiatives i
  SET crown_name = p.crown_name,
      crown_status = p.crown_status
  FROM (
    SELECT c.crown_name, c.crown_status
    FROM public.initiative_crowns c
    WHERE c.initiative_id = COALESCE(NEW.initiative_id, OLD.initiative_id)
    ORDER BY c.crown_order ASC, c.created_at ASC
    LIMIT 1
  ) p
  WHERE i.id = COALESCE(NEW.initiative_id, OLD.initiative_id);

  IF NOT EXISTS (
    SELECT 1
    FROM public.initiative_crowns c
    WHERE c.initiative_id = COALESCE(NEW.initiative_id, OLD.initiative_id)
  ) THEN
    UPDATE public.initiatives
    SET crown_name = NULL,
        crown_status = 'vacant'
    WHERE id = COALESCE(NEW.initiative_id, OLD.initiative_id);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_primary_crown ON public.initiative_crowns;
CREATE TRIGGER sync_primary_crown
AFTER INSERT OR UPDATE OR DELETE ON public.initiative_crowns
FOR EACH ROW EXECUTE FUNCTION public.sync_primary_crown_to_initiative();

-- Backfill current primary crown fields for all canonical initiatives
UPDATE public.initiatives
SET crown_name = NULL,
    crown_status = 'vacant'
WHERE initiative_number IS NOT NULL;

UPDATE public.initiatives i
SET crown_name = p.crown_name,
    crown_status = p.crown_status
FROM (
  SELECT DISTINCT ON (initiative_id)
    initiative_id,
    crown_name,
    crown_status
  FROM public.initiative_crowns
  ORDER BY initiative_id, crown_order ASC, created_at ASC
) p
WHERE i.id = p.initiative_id;

-- Part 6: Helper view for UI access to all crowns
CREATE OR REPLACE VIEW public.initiatives_with_all_crowns AS
SELECT
  i.id,
  i.initiative_number,
  i.name,
  i.initiative_slug,
  i.category,
  i.tagline,
  COALESCE(
    json_agg(
      json_build_object(
        'name', ic.crown_name,
        'title', ic.crown_title,
        'status', ic.crown_status,
        'order', ic.crown_order
      )
      ORDER BY ic.crown_order, ic.created_at
    ) FILTER (WHERE ic.id IS NOT NULL),
    '[]'::json
  ) AS crowns
FROM public.initiatives i
LEFT JOIN public.initiative_crowns ic ON ic.initiative_id = i.id
WHERE i.initiative_number IS NOT NULL
GROUP BY i.id, i.initiative_number, i.name, i.initiative_slug, i.category, i.tagline
ORDER BY i.initiative_number;
