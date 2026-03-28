-- =============================================
-- LB CARD SYSTEM (Cash Domain)
-- Innovation #1758 + #1911 (Two-Domain Architecture)
-- =============================================

CREATE TABLE lb_cardholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_cardholder_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  card_balance_cents INTEGER NOT NULL DEFAULT 0,
  spending_limit_daily INTEGER DEFAULT 5000,
  spending_limit_monthly INTEGER DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE lb_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES lb_cardholders(id),
  stripe_card_id TEXT UNIQUE,
  card_type TEXT NOT NULL DEFAULT 'virtual',
  status TEXT NOT NULL DEFAULT 'inactive',
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lb_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES lb_cards(id),
  stripe_authorization_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  storefront_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lb_card_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cardholder_id UUID NOT NULL REFERENCES lb_cardholders(id),
  amount_cents INTEGER NOT NULL,
  funding_type TEXT NOT NULL,
  source_description TEXT,
  related_order_id UUID,
  related_project_id UUID,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WAR CHEST SYSTEM (Cooperative Domain tracking)
-- Innovation #1911
-- =============================================

CREATE TABLE mark_work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID,
  marks_earned NUMERIC(12,2) NOT NULL,
  work_description TEXT,
  is_funded BOOLEAN DEFAULT false,
  funded_at TIMESTAMPTZ,
  eligible_amount NUMERIC(12,2) DEFAULT 0,
  allocated_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE war_chest_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  source_work_record_id UUID NOT NULL REFERENCES mark_work_records(id),
  allocation_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  target_project_id UUID,
  target_bounty_id UUID,
  cash_paid_cents INTEGER,
  saa_earned NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW war_chest_summary AS
SELECT
  user_id,
  SUM(marks_earned) AS total_marks_earned,
  SUM(CASE WHEN is_funded THEN eligible_amount ELSE 0 END) AS total_eligible,
  SUM(allocated_amount) AS total_allocated,
  SUM(CASE WHEN is_funded THEN eligible_amount - allocated_amount ELSE 0 END) AS available_eligible
FROM mark_work_records
GROUP BY user_id;

-- =============================================
-- FOUNDER FEATURE FLAGS
-- =============================================

CREATE TABLE founder_feature_flags (
  feature_key TEXT PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES auth.users(id),
  notes TEXT
);

INSERT INTO founder_feature_flags VALUES
  ('war_chest_substitution', true, NOW(), NULL, 'LIVE — clean 1099-NEC tax treatment confirmed'),
  ('war_chest_sponsorship', true, NOW(), NULL, 'LIVE — SAA is non-transferable governance, not §83 property per Pawn Batch 10'),
  ('war_chest_commission', false, NULL, NULL, 'GRAYED OUT — constructive receipt confirmed, needs tax counsel for §125-style design');

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE lb_cardholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_card_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE mark_work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_chest_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cardholder" ON lb_cardholders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own cards" ON lb_cards
  FOR SELECT USING (
    cardholder_id IN (SELECT id FROM lb_cardholders WHERE user_id = auth.uid())
  );
CREATE POLICY "Users view own card txns" ON lb_card_transactions
  FOR SELECT USING (
    card_id IN (
      SELECT lc.id FROM lb_cards lc
      JOIN lb_cardholders lch ON lc.cardholder_id = lch.id
      WHERE lch.user_id = auth.uid()
    )
  );
CREATE POLICY "Users view own funding" ON lb_card_funding
  FOR SELECT USING (
    cardholder_id IN (SELECT id FROM lb_cardholders WHERE user_id = auth.uid())
  );
CREATE POLICY "Users view own work records" ON mark_work_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own allocations" ON war_chest_allocations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "All read feature flags" ON founder_feature_flags
  FOR SELECT USING (true);

CREATE POLICY "Admins manage cardholders" ON lb_cardholders FOR ALL USING (is_admin());
CREATE POLICY "Admins manage cards" ON lb_cards FOR ALL USING (is_admin());
CREATE POLICY "Admins manage card txns" ON lb_card_transactions FOR ALL USING (is_admin());
CREATE POLICY "Admins manage funding" ON lb_card_funding FOR ALL USING (is_admin());
CREATE POLICY "Admins manage work records" ON mark_work_records FOR ALL USING (is_admin());
CREATE POLICY "Admins manage allocations" ON war_chest_allocations FOR ALL USING (is_admin());
CREATE POLICY "Admins manage flags" ON founder_feature_flags FOR ALL USING (is_admin());
