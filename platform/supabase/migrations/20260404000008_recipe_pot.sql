-- Recipe Pot (#2143): project skill matching via spice taxonomy

CREATE TABLE IF NOT EXISTS public.project_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  cold_start_pathway TEXT CHECK (cold_start_pathway IN ('food', 'manufacturing', 'service', 'local_business', 'guild', 'tribe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_spice_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.project_recipes(id) ON DELETE CASCADE,
  spice public.spice_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'owner')),
  filled_by UUID REFERENCES auth.users(id),
  filled_at TIMESTAMPTZ,
  description TEXT,
  UNIQUE(recipe_id, spice, filled_by)
);

CREATE TABLE IF NOT EXISTS public.member_spice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  spice public.spice_type NOT NULL,
  proficiency INTEGER NOT NULL DEFAULT 1 CHECK (proficiency BETWEEN 1 AND 5),
  projects_completed INTEGER NOT NULL DEFAULT 0,
  UNIQUE(member_id, spice)
);

CREATE TABLE IF NOT EXISTS public.default_recipe_blends (
  pathway TEXT PRIMARY KEY,
  default_spices public.spice_type[] NOT NULL
);

INSERT INTO public.default_recipe_blends (pathway, default_spices) VALUES
  ('food', ARRAY['salt', 'garlic', 'sugar', 'pepper']::public.spice_type[]),
  ('manufacturing', ARRAY['cumin', 'salt', 'pepper', 'garlic']::public.spice_type[]),
  ('service', ARRAY['cinnamon', 'sugar', 'salt', 'oregano']::public.spice_type[]),
  ('local_business', ARRAY['salt', 'sugar', 'cinnamon', 'garlic']::public.spice_type[]),
  ('guild', ARRAY['oregano', 'salt', 'basil']::public.spice_type[]),
  ('tribe', ARRAY['salt', 'cinnamon', 'oregano']::public.spice_type[])
ON CONFLICT (pathway) DO UPDATE
SET default_spices = EXCLUDED.default_spices;

CREATE INDEX IF NOT EXISTS idx_recipe_slots_open
  ON public.recipe_spice_slots (spice)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_member_spice
  ON public.member_spice_profiles (spice);

CREATE INDEX IF NOT EXISTS idx_project_recipes_owner
  ON public.project_recipes (owner_id);

CREATE INDEX IF NOT EXISTS idx_project_recipes_project_name
  ON public.project_recipes (project_name);

ALTER TABLE public.project_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_spice_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_spice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.default_recipe_blends ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'project_recipes'
      AND policyname = 'Public read recipes'
  ) THEN
    CREATE POLICY "Public read recipes"
      ON public.project_recipes
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'project_recipes'
      AND policyname = 'Owners manage recipes'
  ) THEN
    CREATE POLICY "Owners manage recipes"
      ON public.project_recipes
      FOR ALL
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recipe_spice_slots'
      AND policyname = 'Public read slots'
  ) THEN
    CREATE POLICY "Public read slots"
      ON public.recipe_spice_slots
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recipe_spice_slots'
      AND policyname = 'Recipe owners manage slots'
  ) THEN
    CREATE POLICY "Recipe owners manage slots"
      ON public.recipe_spice_slots
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.project_recipes
          WHERE id = recipe_id
            AND owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.project_recipes
          WHERE id = recipe_id
            AND owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'member_spice_profiles'
      AND policyname = 'Members read own profile'
  ) THEN
    CREATE POLICY "Members read own profile"
      ON public.member_spice_profiles
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'member_spice_profiles'
      AND policyname = 'Members manage own profile'
  ) THEN
    CREATE POLICY "Members manage own profile"
      ON public.member_spice_profiles
      FOR ALL
      USING (auth.uid() = member_id)
      WITH CHECK (auth.uid() = member_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'default_recipe_blends'
      AND policyname = 'Public read default recipe blends'
  ) THEN
    CREATE POLICY "Public read default recipe blends"
      ON public.default_recipe_blends
      FOR SELECT
      USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_project_recipes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_project_recipes_updated_at ON public.project_recipes;
CREATE TRIGGER trg_touch_project_recipes_updated_at
BEFORE UPDATE ON public.project_recipes
FOR EACH ROW
EXECUTE FUNCTION public.touch_project_recipes_updated_at();
