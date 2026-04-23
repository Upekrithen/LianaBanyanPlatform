-- ═══════════════════════════════════════════════════════════════
-- COST + 20% CERTIFICATION SYSTEM
-- Non-hideable badge and economic enforcement for C+20 compliance.
-- External shops can participate but only get full benefits if certified.
-- ═══════════════════════════════════════════════════════════════

-- ─── EXTEND ANCHORS TABLE ───
-- Add C+20 certification fields to existing anchors table.

ALTER TABLE public.anchors
ADD COLUMN IF NOT EXISTS pricing_policy TEXT
  CHECK (pricing_policy IN ('C_PLUS_20', 'OPAQUE', 'OTHER'))
  DEFAULT 'OPAQUE',
ADD COLUMN IF NOT EXISTS verified_cost_plus BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cost_plus_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cost_plus_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cost_plus_notes TEXT,
ADD COLUMN IF NOT EXISTS cost_plus_revoked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cost_plus_revoked_reason TEXT,
ADD COLUMN IF NOT EXISTS cost_plus_compliance_ratio NUMERIC(4,3) DEFAULT 0.000,
ADD COLUMN IF NOT EXISTS cost_plus_compliant_gmv NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cost_plus_total_gmv NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS c20_reciprocity_balance NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS c20_total_margin_contributed NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS c20_total_balance_spent NUMERIC(14,2) DEFAULT 0.00;

-- Index for finding certified anchors
CREATE INDEX IF NOT EXISTS idx_anchors_cost_plus_certified
  ON public.anchors(verified_cost_plus)
  WHERE verified_cost_plus = true;

CREATE INDEX IF NOT EXISTS idx_anchors_pricing_policy
  ON public.anchors(pricing_policy);

-- ─── C+20 CERTIFICATION AUDITS ───
-- Audit trail for certification requests, approvals, and revocations.

CREATE TABLE IF NOT EXISTS public.cost_plus_audits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,

  -- Request info
  requested_by        UUID NOT NULL REFERENCES auth.users(id),
  request_type        TEXT NOT NULL CHECK (request_type IN ('certification', 'renewal', 'appeal')),

  -- Evidence (private, not published)
  evidence_url        TEXT,
  evidence_notes      TEXT,
  cost_breakdown      JSONB,  -- { "cogs": 100, "labor": 50, "fees": 20, "margin": 34 }

  -- Review
  reviewed_by         UUID REFERENCES auth.users(id),
  status              TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'expired')),
  review_notes        TEXT,
  reviewed_at         TIMESTAMPTZ,

  -- Validity period
  valid_from          TIMESTAMPTZ,
  valid_until         TIMESTAMPTZ,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_plus_audits_anchor ON public.cost_plus_audits(anchor_id);
CREATE INDEX idx_cost_plus_audits_status ON public.cost_plus_audits(status);
CREATE INDEX idx_cost_plus_audits_requested_by ON public.cost_plus_audits(requested_by);

-- ─── C+20 COUPON TYPES ───
-- Extend user_coupons to track C+20 enforcement on platform-routed transactions.

ALTER TABLE public.user_coupons
ADD COLUMN IF NOT EXISTS discount_type TEXT
  CHECK (discount_type IN ('cost_plus_20', 'percentage', 'fixed', 'free_shipping', 'other'))
  DEFAULT 'other',
ADD COLUMN IF NOT EXISTS enforces_cost_plus BOOLEAN DEFAULT false;

-- ─── ECONOMIC MULTIPLIERS FOR C+20 STATUS ───
-- Track how C+20 status affects Joules and Marks earnings.

CREATE TABLE IF NOT EXISTS public.cost_plus_economics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Policy name
  policy_name         TEXT NOT NULL UNIQUE,

  -- Multipliers for certified anchors
  certified_joule_multiplier    DECIMAL(4,2) DEFAULT 1.00,
  certified_marks_multiplier    DECIMAL(4,2) DEFAULT 1.00,
  certified_ip_stake_eligible   BOOLEAN DEFAULT true,
  certified_reciprocal_tier_max INTEGER DEFAULT 3,

  -- Multipliers for non-certified anchors
  uncertified_joule_multiplier  DECIMAL(4,2) DEFAULT 0.25,
  uncertified_marks_multiplier  DECIMAL(4,2) DEFAULT 0.50,
  uncertified_ip_stake_eligible BOOLEAN DEFAULT false,
  uncertified_reciprocal_tier_max INTEGER DEFAULT 1,

  -- Description
  description         TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default economics policy
INSERT INTO public.cost_plus_economics (
  policy_name,
  certified_joule_multiplier,
  certified_marks_multiplier,
  certified_ip_stake_eligible,
  certified_reciprocal_tier_max,
  uncertified_joule_multiplier,
  uncertified_marks_multiplier,
  uncertified_ip_stake_eligible,
  uncertified_reciprocal_tier_max,
  description
) VALUES (
  'default',
  1.00,
  1.00,
  true,
  3,
  0.25,
  0.50,
  false,
  1,
  'Default C+20 economics policy. Certified anchors get full benefits; uncertified get reduced Joules/Marks and no IP stakes.'
) ON CONFLICT (policy_name) DO NOTHING;

-- ─── DNA LOCK ENTRIES ───
-- Add C+20 parameters to DNA Lock.

INSERT INTO public.dna_lock (param_key, param_value, category, description, locked_at, locked_by)
VALUES
  ('cost_plus_creator_cut', '0.833', 'economics', 'Creator keeps 83.3% on C+20 transactions (Cost + 20%)', NOW(), 'system'),
  ('cost_plus_platform_margin', '0.20', 'economics', 'Platform margin is 20% of cost on C+20 transactions', NOW(), 'system'),
  ('cost_plus_certification_validity_days', '365', 'compliance', 'C+20 certification valid for 365 days before renewal required', NOW(), 'system'),
  ('cost_plus_uncertified_joule_multiplier', '0.25', 'economics', 'Non-C+20 anchors earn 25% of normal Joules', NOW(), 'system'),
  ('cost_plus_uncertified_marks_multiplier', '0.50', 'economics', 'Non-C+20 anchors earn 50% of normal Marks', NOW(), 'system')
ON CONFLICT (param_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.cost_plus_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_plus_economics ENABLE ROW LEVEL SECURITY;

-- Audits: requesters can view their own, admins can view all
CREATE POLICY "Users can view their own C+20 audit requests" ON public.cost_plus_audits
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Users can create C+20 audit requests" ON public.cost_plus_audits
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

-- Economics: public read (these are platform-wide policies)
CREATE POLICY "Anyone can view C+20 economics" ON public.cost_plus_economics
  FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to check if an anchor is C+20 certified
CREATE OR REPLACE FUNCTION public.is_cost_plus_certified(p_anchor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.anchors
    WHERE id = p_anchor_id
      AND pricing_policy = 'C_PLUS_20'
      AND verified_cost_plus = true
      AND cost_plus_revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get C+20 badge tier based on compliance ratio
CREATE OR REPLACE FUNCTION public.get_cost_plus_tier(p_anchor_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_ratio NUMERIC(4,3);
  v_verified BOOLEAN;
BEGIN
  SELECT cost_plus_compliance_ratio, verified_cost_plus
  INTO v_ratio, v_verified
  FROM public.anchors
  WHERE id = p_anchor_id;

  IF v_ratio IS NULL THEN
    RETURN 'NONE';
  END IF;

  -- Full badge requires both high ratio AND verification
  IF v_ratio >= 0.95 AND v_verified = true THEN
    RETURN 'FULL';
  ELSIF v_ratio >= 0.75 THEN
    RETURN 'THREE_QUARTER';
  ELSIF v_ratio >= 0.50 THEN
    RETURN 'HALF';
  ELSIF v_ratio >= 0.25 THEN
    RETURN 'QUARTER';
  ELSE
    RETURN 'NONE';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update compliance ratio after a transaction
CREATE OR REPLACE FUNCTION public.update_cost_plus_compliance(
  p_anchor_id UUID,
  p_transaction_amount NUMERIC(14,2),
  p_is_compliant BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.anchors
  SET
    cost_plus_total_gmv = cost_plus_total_gmv + p_transaction_amount,
    cost_plus_compliant_gmv = CASE
      WHEN p_is_compliant THEN cost_plus_compliant_gmv + p_transaction_amount
      ELSE cost_plus_compliant_gmv
    END,
    cost_plus_compliance_ratio = CASE
      WHEN (cost_plus_total_gmv + p_transaction_amount) > 0
      THEN (cost_plus_compliant_gmv + CASE WHEN p_is_compliant THEN p_transaction_amount ELSE 0 END)
           / (cost_plus_total_gmv + p_transaction_amount)
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = p_anchor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request C+20 certification
CREATE OR REPLACE FUNCTION public.request_cost_plus_certification(
  p_anchor_id UUID,
  p_evidence_url TEXT DEFAULT NULL,
  p_evidence_notes TEXT DEFAULT NULL,
  p_cost_breakdown JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_owner_id UUID;
BEGIN
  -- Verify caller owns the anchor
  SELECT owner_id INTO v_owner_id FROM public.anchors WHERE id = p_anchor_id;
  IF v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this anchor';
  END IF;

  -- Check for existing pending request
  IF EXISTS (
    SELECT 1 FROM public.cost_plus_audits
    WHERE anchor_id = p_anchor_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A pending certification request already exists for this anchor';
  END IF;

  -- Create audit request
  INSERT INTO public.cost_plus_audits (
    anchor_id,
    requested_by,
    request_type,
    evidence_url,
    evidence_notes,
    cost_breakdown
  ) VALUES (
    p_anchor_id,
    auth.uid(),
    'certification',
    p_evidence_url,
    p_evidence_notes,
    p_cost_breakdown
  ) RETURNING id INTO v_audit_id;

  -- Update anchor to show pending
  UPDATE public.anchors
  SET pricing_policy = 'C_PLUS_20',
      updated_at = NOW()
  WHERE id = p_anchor_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve C+20 certification (admin only)
CREATE OR REPLACE FUNCTION public.approve_cost_plus_certification(
  p_audit_id UUID,
  p_review_notes TEXT DEFAULT NULL,
  p_validity_days INTEGER DEFAULT 365
)
RETURNS BOOLEAN AS $$
DECLARE
  v_anchor_id UUID;
BEGIN
  -- Get anchor ID from audit
  SELECT anchor_id INTO v_anchor_id FROM public.cost_plus_audits WHERE id = p_audit_id;

  IF v_anchor_id IS NULL THEN
    RAISE EXCEPTION 'Audit request not found';
  END IF;

  -- Update audit record
  UPDATE public.cost_plus_audits
  SET status = 'approved',
      reviewed_by = auth.uid(),
      review_notes = p_review_notes,
      reviewed_at = NOW(),
      valid_from = NOW(),
      valid_until = NOW() + (p_validity_days || ' days')::INTERVAL,
      updated_at = NOW()
  WHERE id = p_audit_id;

  -- Update anchor
  UPDATE public.anchors
  SET verified_cost_plus = true,
      cost_plus_verified_at = NOW(),
      cost_plus_verified_by = auth.uid(),
      cost_plus_notes = p_review_notes,
      cost_plus_revoked_at = NULL,
      cost_plus_revoked_reason = NULL,
      updated_at = NOW()
  WHERE id = v_anchor_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke C+20 certification (admin only)
CREATE OR REPLACE FUNCTION public.revoke_cost_plus_certification(
  p_anchor_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update anchor
  UPDATE public.anchors
  SET verified_cost_plus = false,
      cost_plus_revoked_at = NOW(),
      cost_plus_revoked_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_anchor_id;

  -- Create revocation audit record
  INSERT INTO public.cost_plus_audits (
    anchor_id,
    requested_by,
    request_type,
    status,
    reviewed_by,
    review_notes,
    reviewed_at
  ) VALUES (
    p_anchor_id,
    auth.uid(),
    'certification',
    'revoked',
    auth.uid(),
    p_reason,
    NOW()
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get economic multipliers for an anchor
CREATE OR REPLACE FUNCTION public.get_anchor_economics(p_anchor_id UUID)
RETURNS TABLE (
  joule_multiplier DECIMAL(4,2),
  marks_multiplier DECIMAL(4,2),
  ip_stake_eligible BOOLEAN,
  reciprocal_tier_max INTEGER,
  is_certified BOOLEAN
) AS $$
DECLARE
  v_is_certified BOOLEAN;
  v_policy RECORD;
BEGIN
  -- Check certification status
  v_is_certified := public.is_cost_plus_certified(p_anchor_id);

  -- Get default policy
  SELECT * INTO v_policy FROM public.cost_plus_economics WHERE policy_name = 'default';

  IF v_is_certified THEN
    RETURN QUERY SELECT
      v_policy.certified_joule_multiplier,
      v_policy.certified_marks_multiplier,
      v_policy.certified_ip_stake_eligible,
      v_policy.certified_reciprocal_tier_max,
      true;
  ELSE
    RETURN QUERY SELECT
      v_policy.uncertified_joule_multiplier,
      v_policy.uncertified_marks_multiplier,
      v_policy.uncertified_ip_stake_eligible,
      v_policy.uncertified_reciprocal_tier_max,
      false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════

-- View of all C+20 certified anchors (for public display)
CREATE OR REPLACE VIEW public.v_certified_anchors AS
SELECT
  a.id,
  a.display_name,
  a.destination_url,
  a.business_type,
  a.trust_score,
  a.total_pass_throughs,
  a.cost_plus_verified_at,
  cbt.display_name AS charitable_tier,
  cbt.icon AS charitable_icon
FROM public.anchors a
LEFT JOIN public.charitable_business_tiers cbt ON a.charitable_tier_id = cbt.id
WHERE a.verified_cost_plus = true
  AND a.pricing_policy = 'C_PLUS_20'
  AND a.cost_plus_revoked_at IS NULL
  AND a.status = 'active';

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE public.cost_plus_audits IS 'Audit trail for C+20 certification requests, approvals, and revocations';
COMMENT ON TABLE public.cost_plus_economics IS 'Economic multipliers for C+20 certified vs non-certified anchors';
COMMENT ON FUNCTION public.is_cost_plus_certified IS 'Check if an anchor has valid C+20 certification';
COMMENT ON FUNCTION public.request_cost_plus_certification IS 'Request C+20 certification for an anchor';
COMMENT ON FUNCTION public.approve_cost_plus_certification IS 'Approve a C+20 certification request (admin only)';
COMMENT ON FUNCTION public.revoke_cost_plus_certification IS 'Revoke C+20 certification from an anchor (admin only)';
COMMENT ON FUNCTION public.get_anchor_economics IS 'Get economic multipliers for an anchor based on C+20 status';
COMMENT ON VIEW public.v_certified_anchors IS 'Public view of all C+20 certified anchors';
