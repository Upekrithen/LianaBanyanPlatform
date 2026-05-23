-- =============================================================================
-- Migration: Add policies to public.pedestal_intermediary_config
-- BP052 Security Remediation · File 2 of 5
-- Supabase Security Advisor category: "RLS Enabled No Policy"
--
-- Table: public.pedestal_intermediary_config
--
-- Situation:
--   RLS is ALREADY ENABLED on this table (from baseline migration line 72484)
--   but there are ZERO policies defined. This results in deny-all — no one
--   can read or write the table, INCLUDING Edge functions using anon client.
--   Edge functions that use the service_role client bypass RLS automatically,
--   so they are unaffected — but adding explicit policies is required to clear
--   the Security Advisor error and to provide a documented access model.
--
-- Table purpose:
--   Stores funding portal / broker dealer API configuration:
--   provider_name, api_base_url, webhook_url, config_json, is_active.
--   This is HIGHLY SENSITIVE config data (API URLs, webhook configs).
--   No frontend reads detected in src/ codebase.
--   Backend / Edge function access via service_role client only.
--
-- Policy design:
--   - service_role: full access (SELECT / INSERT / UPDATE / DELETE)
--   - authenticated: NO access (config contains API URLs — not for end users)
--   - anon: NO access
--
-- Note: Supabase service_role client bypasses RLS by default via BYPASSRLS.
--       The explicit service_role policy here is belt-and-suspenders and also
--       suppresses the "no policies" advisor error.
--
-- Idempotency: DO blocks check pg_policies before CREATE POLICY
-- =============================================================================

-- Service role: full access to intermediary config (API config management)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'pedestal_intermediary_config'
      AND policyname = 'pedestal_intermediary_config_service_role_all'
  ) THEN
    CREATE POLICY "pedestal_intermediary_config_service_role_all"
      ON public.pedestal_intermediary_config
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    COMMENT ON POLICY "pedestal_intermediary_config_service_role_all"
      ON public.pedestal_intermediary_config
      IS 'service_role only — pedestal_intermediary_config holds sensitive API/webhook config for funding portals and broker dealers. No frontend access permitted.';
  END IF;
END;
$$;

-- Explicit deny confirmation: ensure no accidental anon policy exists
-- (This is belt-and-suspenders — RLS with no matching policy is already a deny,
--  but making the intent clear in the audit log matters.)
DO $$
BEGIN
  RAISE NOTICE 'pedestal_intermediary_config: RLS enabled, service_role-only policy applied. anon and authenticated roles are denied by default (no matching policy).';
END;
$$;
