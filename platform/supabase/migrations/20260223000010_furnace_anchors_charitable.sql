-- ═══════════════════════════════════════════════════════════════
-- THE FURNACE + ANCHORS + CHARITABLE BUSINESS TIERS
-- QR verification registry, external business integration, and
-- charitable giving tiers for partnered businesses.
-- ═══════════════════════════════════════════════════════════════

-- ─── CHARITABLE BUSINESS TIERS (must be created first for FK) ───
-- Tiered system for businesses that donate portion of sales to initiatives.
-- "Kindling" metaphor: businesses add fuel to the fire of community benefit.

CREATE TABLE IF NOT EXISTS public.charitable_business_tiers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tier definition
  tier_name           TEXT NOT NULL UNIQUE,  -- 'ember', 'flame', 'blaze', 'inferno'
  tier_level          INTEGER NOT NULL,      -- 1, 2, 3, 4

  -- Display
  display_name        TEXT NOT NULL,         -- 'Ember Partner', 'Flame Partner', etc.
  icon                TEXT NOT NULL,         -- 🔥, 🔥🔥, 🔥🔥🔥, 🔥🔥🔥🔥
  badge_color         TEXT NOT NULL,         -- orange-300, orange-500, orange-600, orange-700
  description         TEXT,

  -- Requirements
  min_donation_percent DECIMAL(5,2) NOT NULL,  -- minimum % of sales donated
  max_donation_percent DECIMAL(5,2),           -- maximum (for display range)

  -- Benefits
  trust_score_bonus   INTEGER DEFAULT 0,       -- added to base trust score
  featured_placement  BOOLEAN DEFAULT false,   -- shown in featured section
  matching_eligible   BOOLEAN DEFAULT false,   -- eligible for patent fund matching
  matching_cap_percent DECIMAL(5,2),           -- max matching from 60% patent fund

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the tiers
INSERT INTO public.charitable_business_tiers
  (tier_name, tier_level, display_name, icon, badge_color, description, min_donation_percent, max_donation_percent, trust_score_bonus, featured_placement, matching_eligible, matching_cap_percent)
VALUES
  ('ember', 1, 'Ember Partner', '🔥', 'orange-300',
   'Entry-level charitable partnership. Every spark helps.',
   1.00, 2.99, 5, false, false, NULL),

  ('flame', 2, 'Flame Partner', '🔥🔥', 'orange-500',
   'Growing commitment to community benefit.',
   3.00, 4.99, 10, false, true, 25.00),

  ('blaze', 3, 'Blaze Partner', '🔥🔥🔥', 'orange-600',
   'Significant contributor to initiative funding.',
   5.00, 9.99, 15, true, true, 50.00),

  ('inferno', 4, 'Inferno Partner', '🔥🔥🔥🔥', 'orange-700',
   'Maximum commitment. Leading by example.',
   10.00, NULL, 25, true, true, 100.00)
ON CONFLICT (tier_name) DO NOTHING;

-- ─── ANCHORS (External Business Destinations) ───
-- Registered external URLs that Cue Cards can route to via Slingshot.

CREATE TABLE IF NOT EXISTS public.anchors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Destination info
  destination_url     TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  description         TEXT,
  business_type       TEXT,  -- 'etsy', 'shopify', 'amazon', 'website', 'other'

  -- Verification
  verification_method TEXT,  -- 'dns_txt', 'meta_tag', 'file_upload'
  verification_code   TEXT,
  verified_at         TIMESTAMPTZ,
  is_verified         BOOLEAN DEFAULT false,

  -- Pass-through level
  pass_through_level  INTEGER DEFAULT 1,  -- 1=transparent, 2=rewarded, 3=interactive

  -- Charitable tier (now references table created above)
  charitable_tier_id  UUID REFERENCES public.charitable_business_tiers(id),

  -- Trust metrics
  trust_score         INTEGER DEFAULT 50,  -- 0-100
  total_pass_throughs INTEGER DEFAULT 0,

  -- Status
  status              TEXT DEFAULT 'pending',  -- pending, active, suspended, revoked

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anchors_owner ON public.anchors(owner_id);
CREATE INDEX idx_anchors_verified ON public.anchors(is_verified) WHERE is_verified = true;
CREATE INDEX idx_anchors_status ON public.anchors(status);

-- ─── CUE CARD REGISTRY (Leviathan-backed) ───
-- Central registry for all Cue Cards with verification data.

CREATE TABLE IF NOT EXISTS public.cue_card_registry (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Payload identification
  payload_hash        TEXT NOT NULL UNIQUE,  -- SHA-256 of signed payload

  -- Links
  template_id         UUID REFERENCES public.cue_card_templates(id),
  creator_id          UUID NOT NULL REFERENCES auth.users(id),
  anchor_id           UUID REFERENCES public.anchors(id),  -- if routing to external

  -- Security
  signature           TEXT NOT NULL,
  security_state      TEXT DEFAULT 'valid',  -- valid, tampered, revoked, expired

  -- Usage stats
  total_scans         INTEGER DEFAULT 0,
  total_verifications INTEGER DEFAULT 0,  -- Furnace checks
  first_seen          TIMESTAMPTZ DEFAULT NOW(),
  last_seen           TIMESTAMPTZ,

  -- Trust
  trust_score         INTEGER DEFAULT 50,
  report_count        INTEGER DEFAULT 0,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cue_card_registry_hash ON public.cue_card_registry(payload_hash);
CREATE INDEX idx_cue_card_registry_creator ON public.cue_card_registry(creator_id);
CREATE INDEX idx_cue_card_registry_anchor ON public.cue_card_registry(anchor_id);
CREATE INDEX idx_cue_card_registry_state ON public.cue_card_registry(security_state);

-- ─── FURNACE VERIFICATIONS ───
-- Log of all verification checks through The Furnace.

CREATE TABLE IF NOT EXISTS public.furnace_verifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was verified
  cue_card_id         UUID REFERENCES public.cue_card_registry(id),
  payload_checked     TEXT,  -- raw payload if card not found

  -- How it was verified
  verification_method TEXT NOT NULL,  -- 'url', 'image_upload', 'camera', 'paste'

  -- Result
  result              TEXT NOT NULL,  -- 'verified', 'suspicious', 'unknown', 'counterfeit'
  trust_score_shown   INTEGER,

  -- Anonymous tracking (no PII)
  ip_hash             TEXT,  -- hashed IP for rate limiting
  user_agent_hash     TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_furnace_verifications_card ON public.furnace_verifications(cue_card_id);
CREATE INDEX idx_furnace_verifications_result ON public.furnace_verifications(result);
CREATE INDEX idx_furnace_verifications_date ON public.furnace_verifications(created_at);

-- ─── FURNACE REPORTS ───
-- User-submitted reports of suspicious/counterfeit Cue Cards.

CREATE TABLE IF NOT EXISTS public.furnace_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What's being reported
  cue_card_id         UUID REFERENCES public.cue_card_registry(id),
  payload_data        JSONB,  -- raw payload if card not in registry
  image_url           TEXT,   -- uploaded image of suspicious card

  -- Reporter info
  reporter_id         UUID REFERENCES auth.users(id),  -- null if anonymous
  reporter_email      TEXT,  -- if provided for follow-up

  -- Report details
  report_type         TEXT NOT NULL,  -- 'counterfeit', 'malicious', 'spam', 'impersonation', 'other'
  description         TEXT,

  -- Processing
  status              TEXT DEFAULT 'pending',  -- pending, investigating, confirmed, dismissed
  reviewed_by         UUID REFERENCES auth.users(id),
  reviewed_at         TIMESTAMPTZ,
  resolution_notes    TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_furnace_reports_status ON public.furnace_reports(status);
CREATE INDEX idx_furnace_reports_card ON public.furnace_reports(cue_card_id);

-- (charitable_business_tiers already created above)

-- ─── CHARITABLE DONATIONS TRACKING ───
-- Track donations from charitable business partners.

CREATE TABLE IF NOT EXISTS public.charitable_business_donations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who donated
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id),
  business_owner_id   UUID NOT NULL REFERENCES auth.users(id),

  -- Donation details
  transaction_amount  DECIMAL(12,2) NOT NULL,  -- total transaction
  donation_percent    DECIMAL(5,2) NOT NULL,   -- % donated
  donation_amount     DECIMAL(12,2) NOT NULL,  -- actual donation

  -- Where it goes
  initiative_slug     TEXT,  -- specific initiative, or null for general fund

  -- Matching (if applicable)
  matching_eligible   BOOLEAN DEFAULT false,
  matching_amount     DECIMAL(12,2) DEFAULT 0,
  matching_source     TEXT,  -- '60_percent_patent_fund'

  -- Timestamps
  transaction_date    TIMESTAMPTZ NOT NULL,
  recorded_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charitable_donations_anchor ON public.charitable_business_donations(anchor_id);
CREATE INDEX idx_charitable_donations_date ON public.charitable_business_donations(transaction_date);
CREATE INDEX idx_charitable_donations_initiative ON public.charitable_business_donations(initiative_slug);

-- ─── CHARITABLE MATCHING POOL ───
-- Track matching funds available from 60% patent fund.

CREATE TABLE IF NOT EXISTS public.charitable_matching_pool (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pool info
  pool_name           TEXT NOT NULL DEFAULT 'patent_fund_matching',

  -- Amounts
  total_allocated     DECIMAL(12,2) DEFAULT 0,  -- total ever allocated
  total_matched       DECIMAL(12,2) DEFAULT 0,  -- total matched so far
  current_balance     DECIMAL(12,2) DEFAULT 0,  -- available for matching

  -- Limits
  annual_cap          DECIMAL(12,2),  -- max matching per year
  per_business_cap    DECIMAL(12,2),  -- max per business per year

  -- Period
  period_start        DATE,
  period_end          DATE,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PASS-THROUGH EVENTS ───
-- Log of all Slingshot pass-through events.

CREATE TABLE IF NOT EXISTS public.slingshot_pass_throughs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was passed through
  cue_card_id         UUID REFERENCES public.cue_card_registry(id),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id),

  -- Pass-through level
  level               INTEGER NOT NULL,  -- 1, 2, or 3

  -- User Coupon (if Level 2+)
  user_coupon_issued  BOOLEAN DEFAULT false,
  user_coupon_id      UUID,

  -- Marks earned
  marks_earned        INTEGER DEFAULT 0,

  -- Anonymous tracking
  ip_hash             TEXT,
  referrer_hash       TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_slingshot_anchor ON public.slingshot_pass_throughs(anchor_id);
CREATE INDEX idx_slingshot_card ON public.slingshot_pass_throughs(cue_card_id);
CREATE INDEX idx_slingshot_date ON public.slingshot_pass_throughs(created_at);

-- ─── USER COUPONS ───
-- Temporary member status for pass-through customers.

CREATE TABLE IF NOT EXISTS public.user_coupons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coupon details
  coupon_code         TEXT NOT NULL UNIQUE,

  -- Source
  pass_through_id     UUID REFERENCES public.slingshot_pass_throughs(id),
  anchor_id           UUID REFERENCES public.anchors(id),

  -- Scope
  scope               TEXT DEFAULT 'single_transaction',  -- single_transaction, time_limited
  valid_transactions  INTEGER DEFAULT 1,
  used_transactions   INTEGER DEFAULT 0,

  -- Validity
  expires_at          TIMESTAMPTZ NOT NULL,
  is_active           BOOLEAN DEFAULT true,

  -- Conversion tracking
  converted_to_member BOOLEAN DEFAULT false,
  converted_at        TIMESTAMPTZ,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_coupons_code ON public.user_coupons(coupon_code);
CREATE INDEX idx_user_coupons_anchor ON public.user_coupons(anchor_id);
CREATE INDEX idx_user_coupons_active ON public.user_coupons(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cue_card_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furnace_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furnace_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charitable_business_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charitable_business_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slingshot_pass_throughs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

-- Anchors: owners can manage their own
CREATE POLICY "Users can view their own anchors" ON public.anchors
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create anchors" ON public.anchors
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own anchors" ON public.anchors
  FOR UPDATE USING (auth.uid() = owner_id);

-- Cue Card Registry: creators can view their own, public can verify
CREATE POLICY "Creators can view their cards" ON public.cue_card_registry
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can verify cards" ON public.cue_card_registry
  FOR SELECT USING (true);  -- Furnace needs public read

-- Charitable tiers: public read
CREATE POLICY "Anyone can view charitable tiers" ON public.charitable_business_tiers
  FOR SELECT USING (true);

-- Furnace verifications: insert only (no read needed)
CREATE POLICY "Anyone can log verification" ON public.furnace_verifications
  FOR INSERT WITH CHECK (true);

-- Furnace reports: anyone can submit
CREATE POLICY "Anyone can submit report" ON public.furnace_reports
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Reporters can view their reports" ON public.furnace_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to verify a Cue Card payload
CREATE OR REPLACE FUNCTION public.verify_cue_card(p_payload_hash TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  trust_score INTEGER,
  business_name TEXT,
  anchor_url TEXT,
  charitable_tier TEXT,
  charitable_icon TEXT,
  first_seen TIMESTAMPTZ,
  total_scans INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (ccr.security_state = 'valid') AS is_valid,
    ccr.trust_score,
    a.display_name AS business_name,
    a.destination_url AS anchor_url,
    cbt.display_name AS charitable_tier,
    cbt.icon AS charitable_icon,
    ccr.first_seen,
    ccr.total_scans
  FROM public.cue_card_registry ccr
  LEFT JOIN public.anchors a ON ccr.anchor_id = a.id
  LEFT JOIN public.charitable_business_tiers cbt ON a.charitable_tier_id = cbt.id
  WHERE ccr.payload_hash = p_payload_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a pass-through and issue User Coupon if Level 2+
CREATE OR REPLACE FUNCTION public.record_pass_through(
  p_cue_card_id UUID,
  p_anchor_id UUID,
  p_level INTEGER,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_pass_through_id UUID;
  v_coupon_id UUID;
  v_marks INTEGER;
BEGIN
  -- Calculate marks based on level
  v_marks := p_level;  -- 1, 2, or 3 marks

  -- Insert pass-through record
  INSERT INTO public.slingshot_pass_throughs (
    cue_card_id, anchor_id, level, marks_earned, ip_hash
  ) VALUES (
    p_cue_card_id, p_anchor_id, p_level, v_marks, p_ip_hash
  ) RETURNING id INTO v_pass_through_id;

  -- Issue User Coupon if Level 2+
  IF p_level >= 2 THEN
    INSERT INTO public.user_coupons (
      coupon_code, pass_through_id, anchor_id, expires_at
    ) VALUES (
      'UC-' || substr(gen_random_uuid()::text, 1, 8),
      v_pass_through_id,
      p_anchor_id,
      NOW() + INTERVAL '7 days'
    ) RETURNING id INTO v_coupon_id;

    UPDATE public.slingshot_pass_throughs
    SET user_coupon_issued = true, user_coupon_id = v_coupon_id
    WHERE id = v_pass_through_id;
  END IF;

  -- Update anchor stats
  UPDATE public.anchors
  SET total_pass_throughs = total_pass_throughs + 1,
      updated_at = NOW()
  WHERE id = p_anchor_id;

  -- Update cue card stats
  UPDATE public.cue_card_registry
  SET total_scans = total_scans + 1,
      last_seen = NOW()
  WHERE id = p_cue_card_id;

  RETURN v_pass_through_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE public.anchors IS 'External business destinations for Slingshot pass-through routing';
COMMENT ON TABLE public.cue_card_registry IS 'Leviathan-backed registry of all Cue Cards for verification';
COMMENT ON TABLE public.furnace_verifications IS 'Log of all Furnace verification checks';
COMMENT ON TABLE public.furnace_reports IS 'User-submitted reports of suspicious Cue Cards';
COMMENT ON TABLE public.charitable_business_tiers IS 'Kindling tiers for charitable business partners';
COMMENT ON TABLE public.charitable_business_donations IS 'Donations from charitable business partners';
COMMENT ON TABLE public.slingshot_pass_throughs IS 'Log of all Slingshot pass-through events';
COMMENT ON TABLE public.user_coupons IS 'Temporary member status coupons for pass-through customers';
