-- Session 11B: reservation_phase, LMD dna_lock config, Palate Guild seed
-- See BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION_11B.md, LMD_STRATEGY_DECISIONS_SESSION_11B.md

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

-- TASK 4: Palate Guild seed (guilds table uses name, display_name, custom_name, guild_type, description, is_official, min_*)
INSERT INTO public.guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'palate-guild',
  'Palate Guild',
  'guild',
  'skill',
  'Food reviewers who test recipes and provide quality feedback. Rank progression: Nibbler → Taster → Sampler → Connoisseur → Sommelier → Grand Palate.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_name = EXCLUDED.display_name,
  is_official = true;
