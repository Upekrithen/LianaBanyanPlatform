-- XP Score System — multiplicative accomplishment scoring (Session 17)
-- XP = cumulative accomplishment metric (separate from five-category reputation)

CREATE TABLE IF NOT EXISTS public.xp_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  bounties_completed INTEGER DEFAULT 0,
  average_accomplishment_score NUMERIC(3,2) DEFAULT 0.00,
  highest_single_xp INTEGER DEFAULT 0,
  founding_status BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_xp_scores_user ON public.xp_scores(user_id);

ALTER TABLE public.xp_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read xp scores" ON public.xp_scores FOR SELECT USING (true);
CREATE POLICY "Service role manage xp scores" ON public.xp_scores FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bounty_id UUID,
  bounty_points INTEGER NOT NULL,
  accomplishment_score NUMERIC(3,2) NOT NULL CHECK (accomplishment_score >= 0.5 AND accomplishment_score <= 5.0),
  xp_earned INTEGER NOT NULL,
  stamped_by UUID REFERENCES auth.users(id),
  stamp_timestamp TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_stamped_by ON public.xp_transactions(stamped_by);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own xp transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manage xp transactions" ON public.xp_transactions FOR ALL USING (auth.role() = 'service_role');

-- RLS: prevent self-STAMP — row must have stamped_by != user_id (client cannot stamp own work)
CREATE POLICY "No self stamp insert" ON public.xp_transactions FOR INSERT WITH CHECK (stamped_by IS DISTINCT FROM user_id);
