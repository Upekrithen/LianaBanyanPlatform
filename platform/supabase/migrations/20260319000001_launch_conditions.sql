-- Launch Conditions: "All Live" Initiative Transformation
-- Every initiative shows launch conditions instead of "Coming Soon"
-- Session 31 — March 19, 2026

CREATE TABLE IF NOT EXISTS public.launch_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_slug TEXT NOT NULL,
  condition_type TEXT NOT NULL,  -- 'leadership' | 'members' | 'funding'
  label TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  unit TEXT DEFAULT 'people',
  auto_source TEXT,  -- NULL = manual, or 'table.column' for future auto-calc
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(initiative_slug, condition_type)
);

ALTER TABLE public.launch_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read launch conditions"
  ON public.launch_conditions FOR SELECT USING (true);

-- Seed all 16 initiatives with 3 conditions each
-- Leadership (roles filled), Members (sign-ups), Funding (pre-order pool)

INSERT INTO public.launch_conditions (initiative_slug, condition_type, label, current_value, target_value, unit) VALUES
  -- 1. HexIsle
  ('hexisle', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('hexisle', 'members', 'Pre-Orders', 0, 500, 'people'),
  ('hexisle', 'funding', 'Funding', 0, 25000, '$'),
  -- 2. Let's Make Bread
  ('lets-make-bread', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('lets-make-bread', 'members', 'Members', 0, 200, 'people'),
  ('lets-make-bread', 'funding', 'Funding', 0, 10000, '$'),
  -- 3. JukeBox
  ('jukebox', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('jukebox', 'members', 'Members', 0, 300, 'people'),
  ('jukebox', 'funding', 'Funding', 0, 15000, '$'),
  -- 4. Let's Go Shopping
  ('lets-go-shopping', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('lets-go-shopping', 'members', 'Sellers', 0, 100, 'people'),
  ('lets-go-shopping', 'funding', 'Funding', 0, 5000, '$'),
  -- 5. Household Concierge
  ('household-concierge', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('household-concierge', 'members', 'Households', 0, 50, 'people'),
  ('household-concierge', 'funding', 'Funding', 0, 8000, '$'),
  -- 6. VSL (Voucher Short Loans)
  ('vsl', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('vsl', 'members', 'Members', 0, 100, 'people'),
  ('vsl', 'funding', 'Funding', 0, 20000, '$'),
  -- 7. MSA (Medical Savings Accounts)
  ('msa', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('msa', 'members', 'Members', 0, 200, 'people'),
  ('msa', 'funding', 'Funding', 0, 15000, '$'),
  -- 8. Didasko
  ('didasko', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('didasko', 'members', 'Students', 0, 100, 'people'),
  ('didasko', 'funding', 'Funding', 0, 10000, '$'),
  -- 9. Let's Make Dinner
  ('lets-make-dinner', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('lets-make-dinner', 'members', 'Members', 0, 50, 'people'),
  ('lets-make-dinner', 'funding', 'Funding', 0, 5000, '$'),
  -- 10. Harper Guild
  ('harper-guild', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('harper-guild', 'members', 'Auditors', 0, 25, 'people'),
  ('harper-guild', 'funding', 'Funding', 0, 3000, '$'),
  -- 11. Coverage Minutes
  ('coverage-minutes', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('coverage-minutes', 'members', 'Speakers', 0, 50, 'people'),
  ('coverage-minutes', 'funding', 'Funding', 0, 2000, '$'),
  -- 12. Star Chamber
  ('star-chamber', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('star-chamber', 'members', 'Members', 0, 100, 'people'),
  ('star-chamber', 'funding', 'Funding', 0, 5000, '$'),
  -- 13. Defense Klaus
  ('defense-klaus', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('defense-klaus', 'members', 'Members', 0, 50, 'people'),
  ('defense-klaus', 'funding', 'Funding', 0, 5000, '$'),
  -- 14. The Family Table
  ('family-table', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('family-table', 'members', 'Families', 0, 20, 'people'),
  ('family-table', 'funding', 'Funding', 0, 2000, '$'),
  -- 15. Power to the People
  ('power-to-the-people', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('power-to-the-people', 'members', 'Members', 0, 500, 'people'),
  ('power-to-the-people', 'funding', 'Funding', 0, 10000, '$'),
  -- 16. Brass Tacks
  ('brass-tacks', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('brass-tacks', 'members', 'Members', 0, 1000, 'people'),
  ('brass-tacks', 'funding', 'Funding', 0, 25000, '$')
ON CONFLICT (initiative_slug, condition_type) DO NOTHING;

-- Canonical innovation count already at 1748 from Bishop Session 012 migrations
