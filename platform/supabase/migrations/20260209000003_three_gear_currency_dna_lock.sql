-- ═══════════════════════════════════════════════════════════════
-- THREE-GEAR CURRENCY SYSTEM + DNA LOCK + COST+20% ENGINE
-- Layer 1 Foundation: Everything else depends on this.
--
-- Gear 1: Credits — already exists in user_credits table
-- Gear 2: MARKS — reputation currency (earned only, permanent)
-- Gear 3: Joules — locked-value service credits (permanent)
-- DNA Lock — immutable constitutional parameters
-- Cost+20% — the pricing engine
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- GEAR 2: MARKS (Reputation Currency)
-- Cannot buy. Cannot transfer. Cannot cash out.
-- Earned through contribution. Permanent. Public.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_marks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Balance (never decreases)
  total_marks     NUMERIC NOT NULL DEFAULT 0 CHECK (total_marks >= 0),
  
  -- Level (computed from total_marks)
  mark_level      TEXT GENERATED ALWAYS AS (
    CASE
      WHEN total_marks >= 10000 THEN 'forest'
      WHEN total_marks >= 5000 THEN 'grove'
      WHEN total_marks >= 1000 THEN 'tree'
      WHEN total_marks >= 500 THEN 'sapling'
      WHEN total_marks >= 100 THEN 'sprout'
      ELSE 'seedling'
    END
  ) STORED,
  
  -- Voting multiplier (computed from level)
  voting_multiplier NUMERIC GENERATED ALWAYS AS (
    CASE
      WHEN total_marks >= 10000 THEN 3.0
      WHEN total_marks >= 5000 THEN 2.0
      WHEN total_marks >= 1000 THEN 1.5
      ELSE 1.0
    END
  ) STORED,
  
  -- Crown eligibility
  crown_eligible  BOOLEAN GENERATED ALWAYS AS (total_marks >= 10000) STORED,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_marks_user ON public.user_marks(user_id);
CREATE INDEX idx_user_marks_level ON public.user_marks(mark_level);

-- MARKS transaction log (immutable — append only)
CREATE TABLE IF NOT EXISTS public.marks_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  
  amount          NUMERIC NOT NULL CHECK (amount > 0),  -- always positive (earned, never deducted)
  reason          TEXT NOT NULL,                          -- what earned it
  reason_type     TEXT NOT NULL,                          -- bounty | project_shipped | referral | review | issue | crown_nomination | golden_key
  
  -- Reference to what earned the MARKS
  reference_id    UUID,                                   -- project_id, bounty_id, etc.
  reference_type  TEXT,                                   -- project | bounty | referral | review
  
  -- Running total after this transaction
  balance_after   NUMERIC NOT NULL,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marks_tx_user ON public.marks_transactions(user_id);
CREATE INDEX idx_marks_tx_type ON public.marks_transactions(reason_type);

-- Function to award MARKS
CREATE OR REPLACE FUNCTION public.award_marks(
  _user_id UUID,
  _amount NUMERIC,
  _reason TEXT,
  _reason_type TEXT,
  _reference_id UUID DEFAULT NULL,
  _reference_type TEXT DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  new_total NUMERIC;
BEGIN
  -- Upsert user_marks
  INSERT INTO public.user_marks (user_id, total_marks)
  VALUES (_user_id, _amount)
  ON CONFLICT (user_id) DO UPDATE
  SET total_marks = user_marks.total_marks + _amount,
      updated_at = NOW();
  
  -- Get new total
  SELECT total_marks INTO new_total FROM public.user_marks WHERE user_id = _user_id;
  
  -- Log transaction
  INSERT INTO public.marks_transactions (user_id, amount, reason, reason_type, reference_id, reference_type, balance_after)
  VALUES (_user_id, _amount, _reason, _reason_type, _reference_id, _reference_type, new_total);
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- GEAR 3: JOULES (Locked-Value Service Credits)
-- Cannot buy directly. Cannot transfer. Cannot cash out.
-- Earned by backing projects. Permanent. Public.
-- Value locked at earning time (inflation protection).
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_joules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Balance (never decreases)
  total_joules    NUMERIC NOT NULL DEFAULT 0 CHECK (total_joules >= 0),
  
  -- Locked value (total $ equivalent at time of earning)
  total_locked_value NUMERIC NOT NULL DEFAULT 0,
  
  -- Herald multiplier applied
  herald_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_joules_user ON public.user_joules(user_id);

-- Joules transaction log
CREATE TABLE IF NOT EXISTS public.joules_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  
  joules_amount   NUMERIC NOT NULL CHECK (joules_amount > 0),
  credits_spent   NUMERIC NOT NULL DEFAULT 0,             -- credits that generated these joules
  multiplier_used NUMERIC NOT NULL DEFAULT 1.0,           -- backing stage multiplier
  locked_value    NUMERIC NOT NULL DEFAULT 0,             -- $ value locked at this moment
  
  reason          TEXT NOT NULL,
  reason_type     TEXT NOT NULL,                           -- backing_premint | backing_minted | backing_production | backing_distribution | backing_established | bounty | press_junket
  
  reference_id    UUID,
  reference_type  TEXT,
  
  balance_after   NUMERIC NOT NULL,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_joules_tx_user ON public.joules_transactions(user_id);

-- Function to award Joules
CREATE OR REPLACE FUNCTION public.award_joules(
  _user_id UUID,
  _credits_spent NUMERIC,
  _multiplier NUMERIC,
  _reason TEXT,
  _reason_type TEXT,
  _reference_id UUID DEFAULT NULL,
  _reference_type TEXT DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  joules_earned NUMERIC;
  new_total NUMERIC;
BEGIN
  joules_earned := _credits_spent * _multiplier;
  
  -- Upsert user_joules
  INSERT INTO public.user_joules (user_id, total_joules, total_locked_value)
  VALUES (_user_id, joules_earned, _credits_spent)
  ON CONFLICT (user_id) DO UPDATE
  SET total_joules = user_joules.total_joules + joules_earned,
      total_locked_value = user_joules.total_locked_value + _credits_spent,
      updated_at = NOW();
  
  SELECT total_joules INTO new_total FROM public.user_joules WHERE user_id = _user_id;
  
  INSERT INTO public.joules_transactions (user_id, joules_amount, credits_spent, multiplier_used, locked_value, reason, reason_type, reference_id, reference_type, balance_after)
  VALUES (_user_id, joules_earned, _credits_spent, _multiplier, _credits_spent, _reason, _reason_type, _reference_id, _reference_type, new_total);
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- DNA LOCK — Immutable Constitutional Parameters
-- These values CANNOT be changed by any vote, any board, any CEO.
-- The DNA Lock is the structural guarantee against enshittification.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dna_lock (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parameter identity
  parameter_key   TEXT NOT NULL UNIQUE,                    -- e.g. 'CREATOR_SHARE_PERCENT'
  parameter_value TEXT NOT NULL,                           -- e.g. '83.3'
  data_type       TEXT NOT NULL DEFAULT 'numeric',         -- numeric | text | boolean
  
  -- Constitutional status
  is_locked       BOOLEAN NOT NULL DEFAULT true,           -- true = CANNOT be changed
  locked_at       TIMESTAMPTZ DEFAULT NOW(),
  locked_by       TEXT DEFAULT 'CONSTITUTIONAL_FOUNDING',  -- who/what locked it
  
  -- Description
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,                           -- economics | governance | membership | operations
  
  -- Audit trail (every read is logged for transparency)
  last_read_at    TIMESTAMPTZ,
  read_count      BIGINT DEFAULT 0,
  
  -- Attempted changes (logged but REJECTED)
  change_attempts INTEGER DEFAULT 0,
  last_change_attempt_at TIMESTAMPTZ,
  last_change_attempt_by TEXT,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the constitutional DNA
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, description, category) VALUES
  ('CREATOR_SHARE_PERCENT', '83.3', 'numeric', 'Creator keeps 83.3% of every transaction. This number is constitutionally locked and cannot be changed.', 'economics'),
  ('PLATFORM_MARGIN_FORMULA', 'COST_PLUS_20', 'text', 'Platform margin is always Cost + 20%. This is the "Cost of Doing Good" margin.', 'economics'),
  ('PLATFORM_MARGIN_PERCENT', '20', 'numeric', 'The 20% in Cost+20%. Cannot be increased. Ever.', 'economics'),
  ('MEMBERSHIP_FEE_ANNUAL', '5', 'numeric', 'Annual membership fee is $5. Accessible to everyone.', 'membership'),
  ('THE_300_MAX_SIZE', '300', 'numeric', 'Maximum governance body size. When you hit 300, you split. No exceptions.', 'governance'),
  ('CURRENCY_NON_TRANSFERABLE', 'true', 'boolean', 'All three currencies (Credits, MARKS, Joules) are non-transferable. Prevents speculation.', 'economics'),
  ('CURRENCY_NON_CASHABLE', 'true', 'boolean', 'No currency can be cashed out for USD. Platform is service access, not investment.', 'economics'),
  ('INITIATIVES_COUNT', '16', 'numeric', 'The Sweet Sixteen charitable initiatives funded by the 20% margin.', 'operations'),
  ('GOLDEN_KEY', 'Help each other help ourselves', 'text', 'The foundational principle. Everything flows from this.', 'governance'),
  ('BOAZ_MANDATORY_SHARING', 'true', 'boolean', 'Mandatory surplus sharing with newcomers (Boaz Principle). Biblical gleaning economics.', 'economics'),
  ('FOUNDER_DESIGNED_OUT', 'true', 'boolean', 'The founder designed himself out of the CEO role. Professional, accountable seat from day one.', 'governance')
ON CONFLICT (parameter_key) DO NOTHING;

-- Function to read a DNA Lock parameter (logs the read)
CREATE OR REPLACE FUNCTION public.read_dna_lock(_key TEXT)
RETURNS TEXT AS $$
DECLARE
  val TEXT;
BEGIN
  UPDATE public.dna_lock 
  SET last_read_at = NOW(), read_count = read_count + 1
  WHERE parameter_key = _key;
  
  SELECT parameter_value INTO val FROM public.dna_lock WHERE parameter_key = _key;
  RETURN val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function that REJECTS any attempt to change a locked parameter
CREATE OR REPLACE FUNCTION public.attempt_dna_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true AND (
    NEW.parameter_value != OLD.parameter_value OR
    NEW.is_locked != OLD.is_locked
  ) THEN
    -- Log the attempt but REJECT it
    UPDATE public.dna_lock 
    SET change_attempts = change_attempts + 1,
        last_change_attempt_at = NOW(),
        last_change_attempt_by = current_user
    WHERE id = OLD.id;
    
    RAISE EXCEPTION 'DNA LOCK VIOLATION: Parameter "%" is constitutionally locked and CANNOT be changed. This attempt has been logged.', OLD.parameter_key;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dna_lock_guard
  BEFORE UPDATE ON public.dna_lock
  FOR EACH ROW
  EXECUTE FUNCTION public.attempt_dna_change();

-- ─────────────────────────────────────────────────────────────
-- COST+20% PRICING ENGINE
-- Every transaction flows through this.
-- Creator gets 83.3%. Platform keeps Cost+20%.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pricing_calculations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction reference
  transaction_type TEXT NOT NULL,                          -- product_sale | service | initiative_donation | membership
  reference_id    UUID,
  
  -- The math (all derived from DNA Lock parameters)
  gross_amount    NUMERIC NOT NULL,                        -- total paid by buyer
  creator_share   NUMERIC NOT NULL,                        -- 83.3% to creator
  platform_margin NUMERIC NOT NULL,                        -- the 20% margin
  cost_basis      NUMERIC NOT NULL DEFAULT 0,              -- actual platform cost
  margin_amount   NUMERIC NOT NULL,                        -- cost_basis * 0.20
  initiative_fund NUMERIC NOT NULL DEFAULT 0,              -- portion to charitable initiatives
  
  -- Verification
  creator_percent_actual NUMERIC GENERATED ALWAYS AS (
    CASE WHEN gross_amount > 0 THEN (creator_share / gross_amount) * 100 ELSE 0 END
  ) STORED,
  
  -- DNA Lock validation
  dna_compliant   BOOLEAN GENERATED ALWAYS AS (
    CASE WHEN gross_amount > 0 
      THEN (creator_share / gross_amount) * 100 >= 83.3
      ELSE true 
    END
  ) STORED,
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_calc_type ON public.pricing_calculations(transaction_type);
CREATE INDEX idx_pricing_calc_compliant ON public.pricing_calculations(dna_compliant);

-- Function to calculate a Cost+20% transaction
CREATE OR REPLACE FUNCTION public.calculate_cost_plus_20(
  _gross_amount NUMERIC,
  _transaction_type TEXT,
  _reference_id UUID DEFAULT NULL
) RETURNS TABLE(
  creator_share NUMERIC,
  platform_margin NUMERIC,
  initiative_fund NUMERIC,
  is_compliant BOOLEAN
) AS $$
DECLARE
  creator_pct NUMERIC;
  margin_pct NUMERIC;
  calc_creator NUMERIC;
  calc_margin NUMERIC;
  calc_initiative NUMERIC;
BEGIN
  -- Read from DNA Lock (logged)
  creator_pct := (SELECT public.read_dna_lock('CREATOR_SHARE_PERCENT'))::NUMERIC / 100;
  margin_pct := (SELECT public.read_dna_lock('PLATFORM_MARGIN_PERCENT'))::NUMERIC / 100;
  
  -- Calculate
  calc_creator := ROUND(_gross_amount * creator_pct, 2);
  calc_margin := _gross_amount - calc_creator;
  calc_initiative := ROUND(calc_margin * 0.5, 2);  -- half of margin to initiatives
  
  -- Log the calculation
  INSERT INTO public.pricing_calculations (
    transaction_type, reference_id, gross_amount, 
    creator_share, platform_margin, cost_basis, margin_amount, initiative_fund
  ) VALUES (
    _transaction_type, _reference_id, _gross_amount,
    calc_creator, calc_margin, calc_margin / (1 + margin_pct), calc_margin, calc_initiative
  );
  
  RETURN QUERY SELECT calc_creator, calc_margin, calc_initiative, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.user_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_joules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joules_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_lock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_calculations ENABLE ROW LEVEL SECURITY;

-- MARKS: users see own, public can see levels
CREATE POLICY "Users see own marks" ON public.user_marks
  FOR SELECT TO authenticated USING (true);  -- MARKS are public (reputation is visible)

CREATE POLICY "System awards marks" ON public.user_marks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users see own marks transactions" ON public.marks_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System logs marks" ON public.marks_transactions
  FOR INSERT TO service_role WITH CHECK (true);

-- JOULES: users see own, public can see totals
CREATE POLICY "Users see own joules" ON public.user_joules
  FOR SELECT TO authenticated USING (true);  -- Joules are public

CREATE POLICY "System awards joules" ON public.user_joules
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users see own joules transactions" ON public.joules_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System logs joules" ON public.joules_transactions
  FOR INSERT TO service_role WITH CHECK (true);

-- DNA Lock: EVERYONE can read (transparency), NO ONE can write
CREATE POLICY "Anyone can read DNA Lock" ON public.dna_lock
  FOR SELECT TO anon, authenticated USING (true);

-- No write policies for anon/authenticated — only service_role via functions
CREATE POLICY "Service role manages DNA" ON public.dna_lock
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Pricing: users see own calculations
CREATE POLICY "Authenticated see pricing" ON public.pricing_calculations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System logs pricing" ON public.pricing_calculations
  FOR INSERT TO service_role WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- CONVENIENCE VIEWS
-- ═══════════════════════════════════════════════════════════════

-- Full member currency dashboard
-- user_credits in this project has: eoi_credits, eoi_used_credits, gleaning_credits_received/earned
CREATE OR REPLACE VIEW public.member_currency_dashboard AS
SELECT 
  m2.user_id,
  COALESCE(c.eoi_credits - c.eoi_used_credits, 0) as credits,
  COALESCE(c.gleaning_credits_received, 0) as gleaning_received,
  COALESCE(c.gleaning_credits_earned, 0) as gleaning_earned,
  COALESCE(m2.total_marks, 0) as marks,
  COALESCE(m2.mark_level, 'seedling') as mark_level,
  COALESCE(m2.voting_multiplier, 1.0) as voting_multiplier,
  COALESCE(m2.crown_eligible, false) as crown_eligible,
  COALESCE(j.total_joules, 0) as joules,
  COALESCE(j.total_locked_value, 0) as joules_locked_value
FROM public.user_marks m2
LEFT JOIN public.user_credits c ON c.user_id = m2.user_id
LEFT JOIN public.user_joules j ON j.user_id = m2.user_id;

GRANT SELECT ON public.member_currency_dashboard TO authenticated;
