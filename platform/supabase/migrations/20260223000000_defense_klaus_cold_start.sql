-- Defense Klaus Cold Start Plan 001
-- Email-only registration with proxy identifiers for privacy

-- Voucher records table
CREATE TABLE IF NOT EXISTS public.defense_klaus_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proxy_id TEXT UNIQUE NOT NULL, -- DF-0000001 format
  email_hash TEXT NOT NULL, -- SHA-256 hash of email for lookup
  voucher_type TEXT CHECK (voucher_type IN ('bracelet', 'membership', 'both')) DEFAULT 'both',
  is_donated BOOLEAN DEFAULT false, -- Platform donation or user donation
  donor_user_id UUID REFERENCES auth.users(id), -- NULL for platform donations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  qr_code_data TEXT NOT NULL,
  
  -- Prevent duplicate emails
  CONSTRAINT unique_email_hash UNIQUE (email_hash)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_dk_vouchers_proxy_id ON public.defense_klaus_vouchers(proxy_id);
CREATE INDEX IF NOT EXISTS idx_dk_vouchers_email_hash ON public.defense_klaus_vouchers(email_hash);
CREATE INDEX IF NOT EXISTS idx_dk_vouchers_is_donated ON public.defense_klaus_vouchers(is_donated);

-- Ledger transactions for tracking (if not exists)
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'credits',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ledger
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.ledger_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON public.ledger_transactions(transaction_type);

-- View for cold start stats
CREATE OR REPLACE VIEW public.defense_klaus_cold_start_stats AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE is_donated = true) as free_signups,
  COUNT(*) FILTER (WHERE is_donated = false) as paid_signups,
  COUNT(*) FILTER (WHERE donor_user_id IS NOT NULL) as user_donated,
  COUNT(*) FILTER (WHERE donor_user_id IS NULL AND is_donated = true) as platform_donated,
  5000 - COUNT(*) as remaining_slots,
  ROUND((COUNT(*)::numeric / 5000) * 100, 2) as percent_complete
FROM public.defense_klaus_vouchers;

-- RLS policies
ALTER TABLE public.defense_klaus_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert vouchers (for registration)
CREATE POLICY "Anyone can register for voucher" ON public.defense_klaus_vouchers
  FOR INSERT WITH CHECK (true);

-- Only system can read vouchers (privacy)
CREATE POLICY "System can read vouchers" ON public.defense_klaus_vouchers
  FOR SELECT USING (auth.role() = 'service_role');

-- Users can see their own donations
CREATE POLICY "Users can see own donations" ON public.defense_klaus_vouchers
  FOR SELECT USING (donor_user_id = auth.uid());

-- Ledger: users can see their own transactions
CREATE POLICY "Users can see own ledger" ON public.ledger_transactions
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert ledger" ON public.ledger_transactions
  FOR INSERT WITH CHECK (true);

-- Function to get next proxy ID
CREATE OR REPLACE FUNCTION get_next_dk_proxy_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(proxy_id FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.defense_klaus_vouchers;
  
  RETURN 'DF-' || LPAD(next_num::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Lawyer bounty board table
CREATE TABLE IF NOT EXISTS public.defense_klaus_lawyer_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  practice_areas TEXT[], -- e.g., ['criminal defense', 'civil rights']
  compensation_type TEXT CHECK (compensation_type IN ('hourly', 'flat_fee', 'contingency', 'pro_bono')),
  compensation_details TEXT,
  requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer applications
CREATE TABLE IF NOT EXISTS public.defense_klaus_lawyer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES public.defense_klaus_lawyer_bounties(id),
  user_id UUID REFERENCES auth.users(id),
  bar_number TEXT,
  jurisdictions TEXT[],
  experience_years INTEGER,
  statement TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial lawyer bounty
INSERT INTO public.defense_klaus_lawyer_bounties (
  title,
  description,
  practice_areas,
  compensation_type,
  compensation_details,
  requirements
) VALUES (
  'Defense Klaus Legal Defense Fund - Founding Attorneys',
  'Join the founding team of attorneys for the Defense Klaus Legal Defense Fund. Provide legal defense services to members who purchase the Defense Klaus bracelet. Pooled fund model ensures sustainable compensation.',
  ARRAY['criminal defense', 'civil rights', 'personal injury', 'family law'],
  'hourly',
  'Competitive hourly rates paid from pooled fund. Rates negotiated based on jurisdiction and experience. Minimum guaranteed hours for active cases.',
  ARRAY[
    'Active bar membership in good standing',
    'Minimum 3 years practice experience',
    'Malpractice insurance',
    'Commitment to Cost+20% pricing model',
    'Agreement to platform ethics standards'
  ]
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.defense_klaus_vouchers IS 'Defense Klaus Cold Start Plan 001 - Email-only voucher registration with privacy-preserving proxy IDs';

-- Daisy Chain Referral System
CREATE TABLE IF NOT EXISTS public.defense_klaus_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_proxy_id TEXT NOT NULL,
  recipient_email_hash TEXT NOT NULL,
  slot_number INTEGER CHECK (slot_number IN (1, 2)) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Each referrer can only use each slot once
  CONSTRAINT unique_referrer_slot UNIQUE (referrer_proxy_id, slot_number)
);

-- Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_dk_referrals_referrer ON public.defense_klaus_referrals(referrer_proxy_id);
CREATE INDEX IF NOT EXISTS idx_dk_referrals_status ON public.defense_klaus_referrals(status);

-- RLS for referrals
ALTER TABLE public.defense_klaus_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create referrals" ON public.defense_klaus_referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update referral status" ON public.defense_klaus_referrals
  FOR UPDATE USING (true);

-- View for daisy chain stats
CREATE OR REPLACE VIEW public.defense_klaus_daisy_chain_stats AS
SELECT 
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_referrals,
  COUNT(DISTINCT referrer_proxy_id) as unique_referrers,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'accepted')::numeric / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as acceptance_rate
FROM public.defense_klaus_referrals;

COMMENT ON TABLE public.defense_klaus_referrals IS 'Defense Klaus Daisy Chain - Each signup gets 2 gift passes to share';
