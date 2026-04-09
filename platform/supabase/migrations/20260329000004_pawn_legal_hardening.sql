-- ============================================
-- Pawn Legal Hardening — Knight Session 156
-- Feature 1: Roommate FHA/Appeal/Grace/Photo/Rating
-- Feature 2: Backer Receipt Decision Form
-- Feature 3: Guest Marks Wallet
-- ============================================

-- =====================
-- 1A. FHA Reasonable Accommodation
-- =====================

ALTER TABLE roommate_applications
  ADD COLUMN IF NOT EXISTS accommodation_requested BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS accommodation_notes TEXT;

-- =====================
-- 1B. 3-Level Appeal Process
-- =====================

CREATE TABLE IF NOT EXISTS roommate_stamp_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_id UUID NOT NULL REFERENCES roommate_stamps(id),
  appeal_level INT NOT NULL CHECK (appeal_level IN (1, 2, 3)),
  appellant_id UUID NOT NULL REFERENCES auth.users(id),
  appeal_reason TEXT NOT NULL,
  evidence_notes TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stamp_id, appeal_level)
);

ALTER TABLE roommate_stamp_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appellants view own appeals" ON roommate_stamp_appeals
  FOR SELECT USING (auth.uid() = appellant_id OR is_admin());
CREATE POLICY "Appellants create appeals" ON roommate_stamp_appeals
  FOR INSERT WITH CHECK (auth.uid() = appellant_id);
CREATE POLICY "Admins manage appeals" ON roommate_stamp_appeals
  FOR ALL USING (is_admin());

-- Add 'appealed' status to stamps
ALTER TABLE roommate_stamps DROP CONSTRAINT IF EXISTS roommate_stamps_status_check;
ALTER TABLE roommate_stamps ADD CONSTRAINT roommate_stamps_status_check
  CHECK (status IN ('filed', 'contested', 'upheld', 'dismissed', 'resolved_by_steward', 'appealed'));

CREATE INDEX IF NOT EXISTS idx_stamp_appeals_stamp ON roommate_stamp_appeals(stamp_id);
CREATE INDEX IF NOT EXISTS idx_stamp_appeals_appellant ON roommate_stamp_appeals(appellant_id);

-- =====================
-- 1C. Grace Period 48 → 72 hours
-- =====================

ALTER TABLE roommate_stamps
  ALTER COLUMN grace_period_ends SET DEFAULT (now() + interval '72 hours');

-- =====================
-- 1D. Photo Consent on Agreement
-- =====================

ALTER TABLE roommate_applications
  ADD COLUMN IF NOT EXISTS consent_to_photograph BOOLEAN DEFAULT false;

-- =====================
-- 1E. Rating Bias Safeguard
-- =====================

ALTER TABLE roommate_agreements
  ADD COLUMN IF NOT EXISTS reputation_weight_floor NUMERIC DEFAULT 0.5;

-- =====================
-- 2. Backer Receipt Decision Form
-- =====================

CREATE TABLE IF NOT EXISTS backer_elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  election_type TEXT NOT NULL CHECK (election_type IN ('gift', 'credits', 'community_fund')),
  amount_cents INT NOT NULL DEFAULT 0,
  elected_at TIMESTAMPTZ DEFAULT now(),
  signature_hash TEXT,
  irrevocable BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id)
);

ALTER TABLE backer_elections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own election" ON backer_elections
  FOR SELECT USING (auth.uid() = member_id OR is_admin());
CREATE POLICY "Members create own election" ON backer_elections
  FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "Admins manage elections" ON backer_elections
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_backer_elections_member ON backer_elections(member_id);

-- =====================
-- 3. Guest Marks Wallet
-- =====================

CREATE TABLE IF NOT EXISTS guest_marks_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  marks_balance INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  converted_to_member_id UUID REFERENCES auth.users(id),
  conversion_date TIMESTAMPTZ
);

ALTER TABLE guest_marks_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create guest wallets" ON guest_marks_wallets
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Guest reads own wallet by email" ON guest_marks_wallets
  FOR SELECT USING (true);
CREATE POLICY "Admins manage guest wallets" ON guest_marks_wallets
  FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_guest_wallets_email ON guest_marks_wallets(email);
CREATE INDEX IF NOT EXISTS idx_guest_wallets_expires ON guest_marks_wallets(expires_at);
