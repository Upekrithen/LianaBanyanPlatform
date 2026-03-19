-- RLS Hardening — Session 47
-- Fixes P0/P1 security gaps identified in audit

-- ============================================================================
-- FIX 1: qa_entries — replace permissive "any authenticated" with is_admin()
-- ============================================================================

DROP POLICY IF EXISTS "Admin full access" ON qa_entries;
CREATE POLICY "Admin full access qa_entries" ON qa_entries
  FOR ALL USING (public.is_admin());

CREATE POLICY "Authenticated read qa_entries" ON qa_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- FIX 2: social_interactions — same fix
-- ============================================================================

DROP POLICY IF EXISTS "Admin full access" ON social_interactions;
CREATE POLICY "Admin full access social_interactions" ON social_interactions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Authenticated read social_interactions" ON social_interactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- FIX 3: manufacturing_modules — restrict admin management
-- ============================================================================

DROP POLICY IF EXISTS "admin_all_modules" ON manufacturing_modules;
CREATE POLICY "Admin manage modules" ON manufacturing_modules
  FOR ALL USING (public.is_admin());

-- Keep read access for authenticated users
DROP POLICY IF EXISTS "read_active_modules" ON manufacturing_modules;
CREATE POLICY "Authenticated read modules" ON manufacturing_modules
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- FIX 4: forge_crew_applications — restrict admin + owner access
-- ============================================================================

DROP POLICY IF EXISTS "admin_all_applications" ON forge_crew_applications;
CREATE POLICY "Admin manage applications" ON forge_crew_applications
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "user_own_applications" ON forge_crew_applications;
CREATE POLICY "Users read own applications" ON forge_crew_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own applications" ON forge_crew_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FIX 5: moneypenny tables — restrict to admin only
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'moneypenny_inbox',
      'moneypenny_actions',
      'moneypenny_social_drafts',
      'moneypenny_ideas',
      'moneypenny_schedule',
      'red_carpet_signals'
    ])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('DROP POLICY IF EXISTS "Manage %s" ON %I', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "manage_%s" ON %I', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "%s_all" ON %I', tbl, tbl);
      EXECUTE format(
        'CREATE POLICY "Admin only %s" ON %I FOR ALL USING (public.is_admin())',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================================================
-- FIX 6: creator_invites — restrict writes to admin only
-- (column names vary; safest is admin-only for write operations)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'creator_invites') THEN
    EXECUTE 'DROP POLICY IF EXISTS "creator_invites_update" ON creator_invites';
    EXECUTE 'DROP POLICY IF EXISTS "update_creator_invites" ON creator_invites';
    EXECUTE '
      CREATE POLICY "Admin update creator_invites" ON creator_invites
        FOR UPDATE USING (public.is_admin())';
  END IF;
END;
$$;

-- ============================================================================
-- FIX 7: project_drafts — restrict writes to admin only
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_drafts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "project_drafts_insert" ON project_drafts';
    EXECUTE 'DROP POLICY IF EXISTS "project_drafts_update" ON project_drafts';
    EXECUTE 'DROP POLICY IF EXISTS "insert_project_drafts" ON project_drafts';
    EXECUTE 'DROP POLICY IF EXISTS "update_project_drafts" ON project_drafts';
    EXECUTE '
      CREATE POLICY "Admin insert project_drafts" ON project_drafts
        FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE '
      CREATE POLICY "Admin update project_drafts" ON project_drafts
        FOR UPDATE USING (public.is_admin())';
  END IF;
END;
$$;

-- ============================================================================
-- FIX 8: social_daily_digests — add admin restriction
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_daily_digests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON social_daily_digests';
    EXECUTE '
      CREATE POLICY "Admin manage digests" ON social_daily_digests
        FOR ALL USING (public.is_admin())';
    EXECUTE '
      CREATE POLICY "Authenticated read digests" ON social_daily_digests
        FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END;
$$;
