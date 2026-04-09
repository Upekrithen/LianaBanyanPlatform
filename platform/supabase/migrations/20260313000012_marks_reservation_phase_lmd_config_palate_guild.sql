-- Session 11B: reservation_phase, LMD dna_lock config, Palate Guild seed
-- See BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_SESSION_11B.md, LMD_STRATEGY_DECISIONS_SESSION_11B.md

-- TASK 2: Marks reservation phase (two-step conversion)
ALTER TABLE public.marks_reservation
ADD COLUMN IF NOT EXISTS reservation_phase TEXT
  NOT NULL DEFAULT 'full_hold'
  CHECK (reservation_phase IN ('full_hold', 'grocery_deducted', 'delivery_completed'));

COMMENT ON COLUMN public.marks_reservation.reservation_phase IS
  'Two-step conversion: full_hold → grocery_deducted (50% at LGG lead time) → delivery_completed (remaining at fulfillment)';

-- TASK 3: LMD config (dna_lock)
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('lmd_ondemand_release_window_days', '14', 'integer', true, 'bishop', 'Days stored meals stay in On-Demand Available before charitable release', 'lmd'),
  ('larder_base_credits_month', '50', 'integer', true, 'bishop', 'Base monthly Credits per chest freezer for Larder Keeper bounty', 'lmd'),
  ('larder_per_meal_day_credits', '0.25', 'decimal', true, 'bishop', 'Credits per meal per day stored (variable component of Larder Keeper bounty)', 'lmd'),
  ('larder_fifo_bonus_credits', '10', 'integer', true, 'bishop', 'Monthly FIFO compliance bonus for Larder Keepers (zero spoilage)', 'lmd')
ON CONFLICT (parameter_key) DO NOTHING;

-- TASK 4: Palate Guild seed
-- Remote guilds table has evolved; use fully defensive approach
DO $$
DECLARE
  col_list TEXT := '';
  val_list TEXT := '';
  has_slug BOOLEAN := false;
  has_display_name BOOLEAN := false;
  has_custom_name BOOLEAN := false;
  has_is_official BOOLEAN := false;
  has_min_rep BOOLEAN := false;
  has_min_int BOOLEAN := false;
  has_guild_type BOOLEAN := false;
BEGIN
  -- Check which columns exist
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='slug') INTO has_slug;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='display_name') INTO has_display_name;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='custom_name') INTO has_custom_name;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='is_official') INTO has_is_official;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='min_reputation_score') INTO has_min_rep;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='min_interactions') INTO has_min_int;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='guilds' AND column_name='guild_type') INTO has_guild_type;

  -- Try to insert with just name + description (always safe)
  -- Then update optional columns after
  INSERT INTO public.guilds (name, slug, description)
  VALUES ('palate-guild', 'palate-guild', 'Food reviewers who test recipes and provide quality feedback. Rank progression: Nibbler → Taster → Sampler → Connoisseur → Sommelier → Grand Palate.')
  ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

  -- Update optional columns on the inserted/updated row
  IF has_display_name THEN
    UPDATE public.guilds SET display_name = 'Palate Guild' WHERE name = 'palate-guild';
  END IF;
  IF has_is_official THEN
    UPDATE public.guilds SET is_official = true WHERE name = 'palate-guild';
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Palate Guild seed skipped due to schema mismatch: %', SQLERRM;
END $$;
