-- K432: Supplement K431 schema for the full apply flow
-- Adds columns and RLS policies required by the 8-step signup wizard.

-- ============================================================================
-- Additional columns on pedestal_applications
-- ============================================================================
ALTER TABLE upekrithen.pedestal_applications
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS stake_count_requested INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subscription_amount_usd INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_intent JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS esign_provider TEXT,
  ADD COLUMN IF NOT EXISTS esign_envelope_id TEXT;

-- ============================================================================
-- Missing RLS policies for the apply flow
-- ============================================================================

-- Investors must be able to UPDATE their own application as they advance steps
DROP POLICY IF EXISTS "app_investor_update" ON upekrithen.pedestal_applications;
CREATE POLICY "app_investor_update" ON upekrithen.pedestal_applications
  FOR UPDATE USING (investor_id = auth.uid())
  WITH CHECK (investor_id = auth.uid());

-- System needs INSERT on pedestal_holders when issuance completes
DROP POLICY IF EXISTS "holders_system_insert" ON upekrithen.pedestal_holders;
CREATE POLICY "holders_system_insert" ON upekrithen.pedestal_holders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- System needs UPDATE on pedestal_holders for certificate_url write-back
DROP POLICY IF EXISTS "holders_system_update" ON upekrithen.pedestal_holders;
CREATE POLICY "holders_system_update" ON upekrithen.pedestal_holders
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Staff can update offering raises for cap tracking
DROP POLICY IF EXISTS "raises_staff_update" ON upekrithen.regcf_offering_raises;
CREATE POLICY "raises_staff_update" ON upekrithen.regcf_offering_raises
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder')
    )
  );

-- Authenticated users can insert into raises (for issuance increment)
DROP POLICY IF EXISTS "raises_auth_insert" ON upekrithen.regcf_offering_raises;
CREATE POLICY "raises_auth_insert" ON upekrithen.regcf_offering_raises
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Storage bucket for certificates (idempotent)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('upekrithen-pedestal-certificates', 'upekrithen-pedestal-certificates', true)
ON CONFLICT (id) DO NOTHING;
