DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'spice_type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.spice_type AS ENUM (
      'salt', 'garlic', 'sugar', 'cinnamon', 'pepper',
      'ginger', 'cumin', 'paprika', 'basil', 'oregano'
    );
  END IF;
END $$;

ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS primary_spice public.spice_type;
ALTER TABLE public.crewman_episodes ADD COLUMN IF NOT EXISTS secondary_spices public.spice_type[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.spice_rack (
  spice public.spice_type PRIMARY KEY,
  display_name TEXT NOT NULL,
  skill_domain TEXT NOT NULL,
  emoji TEXT NOT NULL,
  metaphor_description TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO public.spice_rack (spice, display_name, skill_domain, emoji, metaphor_description, sort_order) VALUES
  ('salt', 'Salt', 'Operations / Everyday Work', '🧂', 'Essential. Preserves everything. Salt of the earth.', 1),
  ('garlic', 'Garlic', 'Accounting / Finance', '🧄', 'Vital, strong. Keeps vampires (extractors) away.', 2),
  ('sugar', 'Sugar', 'Marketing / Outreach', '🍬', 'Sweetens the deal. Makes things attractive.', 3),
  ('cinnamon', 'Cinnamon', 'Design / UX', '✨', 'Warm, inviting. Makes things feel like home.', 4),
  ('pepper', 'Pepper', 'Legal / Compliance', '🌶️', 'A little heat. Keeps things honest.', 5),
  ('ginger', 'Ginger', 'Innovation / R&D', '🫚', 'Sharp, surprising, medicinal. Heals what is broken.', 6),
  ('cumin', 'Cumin', 'Engineering / Technical', '🟤', 'Earthy, foundational. The building block.', 7),
  ('paprika', 'Paprika', 'Leadership / Vision', '🔴', 'Color, warmth. Defines the whole dish.', 8),
  ('basil', 'Basil', 'Creative / Content', '🌿', 'Fresh, fragrant. The signature ingredient.', 9),
  ('oregano', 'Oregano', 'Project Management', '🫒', 'Ties everything together. Works with anything.', 10)
ON CONFLICT (spice) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  skill_domain = EXCLUDED.skill_domain,
  emoji = EXCLUDED.emoji,
  metaphor_description = EXCLUDED.metaphor_description,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE public.spice_rack ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'spice_rack'
      AND policyname = 'Public read spice rack'
  ) THEN
    CREATE POLICY "Public read spice rack"
      ON public.spice_rack
      FOR SELECT
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_crewman_episodes_spice
  ON public.crewman_episodes (primary_spice);
