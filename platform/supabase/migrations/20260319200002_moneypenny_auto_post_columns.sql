-- ═══════════════════════════════════════════════════════════════════════════════
-- MONEYPENNY AUTO-POST COLUMNS + RLS PHASE 2
-- Session 48 — March 19, 2026
-- ═══════════════════════════════════════════════════════════════════════════════
-- Adds post_url to moneypenny_social_drafts so auto-post can record where
-- each draft was published. The posted_at column already exists.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE moneypenny_social_drafts
  ADD COLUMN IF NOT EXISTS post_url TEXT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS PHASE 2 — Tighten matchtrade, project_invitations, and admin tables
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Matchtrade: Replace FOR ALL TO authenticated USING (true) ─────────────

DROP POLICY IF EXISTS "auth_matchtrade_offers" ON matchtrade_offers;
DROP POLICY IF EXISTS "auth_matchtrade_matches" ON matchtrade_matches;

CREATE POLICY "matchtrade_offers_select"
  ON matchtrade_offers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "matchtrade_offers_insert"
  ON matchtrade_offers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = offerer_id);

CREATE POLICY "matchtrade_offers_update"
  ON matchtrade_offers FOR UPDATE TO authenticated
  USING (auth.uid() = offerer_id);

CREATE POLICY "matchtrade_offers_delete"
  ON matchtrade_offers FOR DELETE TO authenticated
  USING (auth.uid() = offerer_id);

CREATE POLICY "matchtrade_offers_admin"
  ON matchtrade_offers FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "matchtrade_matches_select"
  ON matchtrade_matches FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "matchtrade_matches_insert"
  ON matchtrade_matches FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "matchtrade_matches_update"
  ON matchtrade_matches FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "matchtrade_matches_delete"
  ON matchtrade_matches FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── Project Invitations: Scope SELECT to invitee + inviter ────────────────

DROP POLICY IF EXISTS "project_invitations_select_auth" ON project_invitations;

CREATE POLICY "project_invitations_select_own"
  ON project_invitations FOR SELECT TO authenticated
  USING (
    auth.uid() = invited_by
    OR auth.uid() IN (
      SELECT id FROM auth.users WHERE email = invited_email
    )
    OR public.is_admin()
  );

-- ─── Admin tables: Replace auth.uid() IS NOT NULL with is_admin() ──────────

-- tereno_certifications
DROP POLICY IF EXISTS "admin_all_certifications" ON tereno_certifications;
CREATE POLICY "admin_manage_certifications"
  ON tereno_certifications FOR ALL TO authenticated
  USING (public.is_admin());

-- tereno_exclusions
DROP POLICY IF EXISTS "admin_crud_exclusions" ON tereno_exclusions;
CREATE POLICY "admin_manage_exclusions"
  ON tereno_exclusions FOR ALL TO authenticated
  USING (public.is_admin());

-- c20_pricing_examples
DROP POLICY IF EXISTS "admin_all_c20" ON c20_pricing_examples;
CREATE POLICY "admin_manage_c20"
  ON c20_pricing_examples FOR ALL TO authenticated
  USING (public.is_admin());

-- node_captain_profiles
DROP POLICY IF EXISTS "admin_all_node_captains" ON node_captain_profiles;
CREATE POLICY "admin_manage_node_captains"
  ON node_captain_profiles FOR ALL TO authenticated
  USING (public.is_admin());

-- production_campaigns
DROP POLICY IF EXISTS "admin_all_campaigns" ON production_campaigns;
CREATE POLICY "admin_manage_campaigns"
  ON production_campaigns FOR ALL TO authenticated
  USING (public.is_admin());

-- production_stamps
DROP POLICY IF EXISTS "admin_all_stamps" ON production_stamps;
CREATE POLICY "admin_manage_stamps"
  ON production_stamps FOR ALL TO authenticated
  USING (public.is_admin());

-- star_chamber_cases
DROP POLICY IF EXISTS "admin_all_cases" ON star_chamber_cases;
CREATE POLICY "admin_manage_cases"
  ON star_chamber_cases FOR ALL TO authenticated
  USING (public.is_admin());

-- santa_gifts
DROP POLICY IF EXISTS "admin_all_gifts" ON santa_gifts;
CREATE POLICY "admin_manage_gifts"
  ON santa_gifts FOR ALL TO authenticated
  USING (public.is_admin());

-- captain_collateral_profiles
DROP POLICY IF EXISTS "admin_all_captains" ON captain_collateral_profiles;
CREATE POLICY "admin_manage_captain_collateral"
  ON captain_collateral_profiles FOR ALL TO authenticated
  USING (public.is_admin());

-- ─── Keep anonymous read on open matchtrade offers ─────────────────────────
-- (anon_read_offers already exists from original migration)
