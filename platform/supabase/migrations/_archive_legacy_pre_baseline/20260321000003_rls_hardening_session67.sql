-- RLS Hardening: Replace auth.uid() IS NOT NULL "admin" policies with public.is_admin()
-- These 11 tables had policies named "admin_*" that actually allowed ANY authenticated
-- user full CRUD access. This migration drops them and creates proper admin-only policies.

-- =============================================
-- manufacturing_modules
-- =============================================
DROP POLICY IF EXISTS "admin_all_modules" ON manufacturing_modules;
CREATE POLICY "admin_all_modules" ON manufacturing_modules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- forge_crew_applications
-- =============================================
DROP POLICY IF EXISTS "admin_all_applications" ON forge_crew_applications;
CREATE POLICY "admin_all_applications" ON forge_crew_applications
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- star_chamber_cases
-- =============================================
DROP POLICY IF EXISTS "admin_all_cases" ON star_chamber_cases;
CREATE POLICY "admin_all_cases" ON star_chamber_cases
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- santa_gifts
-- =============================================
DROP POLICY IF EXISTS "admin_all_gifts" ON santa_gifts;
CREATE POLICY "admin_all_gifts" ON santa_gifts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- captain_collateral_profiles
-- =============================================
DROP POLICY IF EXISTS "admin_all_captains" ON captain_collateral_profiles;
CREATE POLICY "admin_all_captains" ON captain_collateral_profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- node_captain_profiles
-- =============================================
DROP POLICY IF EXISTS "admin_all_node_captains" ON node_captain_profiles;
CREATE POLICY "admin_all_node_captains" ON node_captain_profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- production_campaigns
-- =============================================
DROP POLICY IF EXISTS "admin_all_campaigns" ON production_campaigns;
CREATE POLICY "admin_all_campaigns" ON production_campaigns
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- production_stamps
-- =============================================
DROP POLICY IF EXISTS "admin_all_stamps" ON production_stamps;
CREATE POLICY "admin_all_stamps" ON production_stamps
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- c20_pricing_examples
-- =============================================
DROP POLICY IF EXISTS "admin_all_c20" ON c20_pricing_examples;
CREATE POLICY "admin_all_c20" ON c20_pricing_examples
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- tereno_certifications
-- =============================================
DROP POLICY IF EXISTS "admin_all_certifications" ON tereno_certifications;
CREATE POLICY "admin_all_certifications" ON tereno_certifications
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- tereno_exclusions
-- =============================================
DROP POLICY IF EXISTS "admin_crud_exclusions" ON tereno_exclusions;
CREATE POLICY "admin_crud_exclusions" ON tereno_exclusions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- crown_letter_invitations: Scope INSERT to admins
-- =============================================
DROP POLICY IF EXISTS "Anyone can insert invitations" ON crown_letter_invitations;
DROP POLICY IF EXISTS "insert_invitations" ON crown_letter_invitations;
CREATE POLICY "admin_insert_invitations" ON crown_letter_invitations
  FOR INSERT WITH CHECK (public.is_admin());

-- =============================================
-- Moneypenny tables: Scope write to admin only
-- (Read remains open to authenticated users)
-- =============================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'moneypenny_inbox',
    'moneypenny_actions',
    'moneypenny_social_drafts',
    'moneypenny_ideas',
    'moneypenny_schedule',
    'red_carpet_signals'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "auth_full_access" ON %I', tbl);

    EXECUTE format(
      'CREATE POLICY "authenticated_read" ON %I FOR SELECT USING (auth.role() = ''authenticated'')',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "admin_write" ON %I FOR INSERT WITH CHECK (public.is_admin())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "admin_update" ON %I FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "admin_delete" ON %I FOR DELETE USING (public.is_admin())',
      tbl
    );
  END LOOP;
END $$;
