-- ============================================
-- MIGRATION: 20260323000026_membership_billing_coalition.sql
-- Knight Session 94: Membership Billing + Coalition Dashboard
-- 3 tables: membership_payments, coalition_alliances, coalition_members
-- ============================================

-- =====================
-- MEMBERSHIP PAYMENTS: Track $5 Access Key payments
-- =====================
CREATE TABLE IF NOT EXISTS membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  currency TEXT DEFAULT 'usd',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT (CURRENT_DATE + interval '1 year'),
  is_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own payments"
  ON membership_payments FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "System inserts payments"
  ON membership_payments FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admin manages payments"
  ON membership_payments FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_membership_payments_member ON membership_payments(member_id, status);
CREATE INDEX idx_membership_payments_stripe ON membership_payments(stripe_session_id);
CREATE INDEX idx_membership_payments_period ON membership_payments(period_end);

-- =====================
-- COALITION ALLIANCES: Business groups with shared benefits
-- =====================
CREATE TABLE IF NOT EXISTS coalition_alliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  alliance_type TEXT DEFAULT 'local' CHECK (alliance_type IN ('local', 'industry', 'regional', 'custom')),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  max_members INT DEFAULT 10,
  discount_tier TEXT DEFAULT 'bronze' CHECK (discount_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coalition_alliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active alliances"
  ON coalition_alliances FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators manage own alliances"
  ON coalition_alliances FOR ALL
  USING (auth.uid() = creator_id);

CREATE POLICY "Admin manages all alliances"
  ON coalition_alliances FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_coalition_type ON coalition_alliances(alliance_type, is_active);

-- =====================
-- COALITION MEMBERS: Businesses in each alliance
-- =====================
CREATE TABLE IF NOT EXISTS coalition_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID NOT NULL REFERENCES coalition_alliances(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL,
  member_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE coalition_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view coalition members"
  ON coalition_members FOR SELECT
  USING (true);

CREATE POLICY "Members manage own membership"
  ON coalition_members FOR ALL
  USING (auth.uid() = member_id);

CREATE POLICY "Admin manages all"
  ON coalition_members FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_coalition_members_alliance ON coalition_members(alliance_id, is_active);
CREATE INDEX idx_coalition_members_storefront ON coalition_members(storefront_id);

-- =====================
-- Add membership_status to member_profiles (from K91)
-- =====================
ALTER TABLE member_profiles
  ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'free' CHECK (membership_status IN ('free', 'active', 'expired', 'lifetime')),
  ADD COLUMN IF NOT EXISTS membership_expires_at DATE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
