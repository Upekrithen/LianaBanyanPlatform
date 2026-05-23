-- =============================================================================
-- Migration: Enable RLS on 3 public tables missing row-level security
-- BP052 Security Remediation · File 1 of 5
-- Supabase Security Advisor category: "RLS Disabled in Public"
--
-- Tables:
--   public.captain_level_requirements
--   public.librarian_section_map
--   public.lnc_ingest_manifests  (LOC ingest service — may be loc_ingest_manifests)
--
-- Usage analysis:
--   captain_level_requirements:  READ by authenticated users via useCaptain.ts hook
--                                (.from("captain_level_requirements").select("*"))
--                                No frontend writes found. Static config data.
--   librarian_section_map:       READ by authenticated users (LibrarianDashboardPage.tsx)
--                                and by Edge function categorize-tour-note (service_role client)
--                                No frontend writes found. Static config data.
--   lnc_ingest_manifests:        LOC legislative ingest service. No frontend reads found.
--                                Service-role / backend writes only.
--
-- Policy design:
--   - All three tables are read-only config/reference data or internal service tables
--   - SELECT policies grant authenticated users read-only access to config tables
--   - Service_role bypasses RLS by default in Supabase (BYPASSRLS privilege)
--   - ALL (write) policies are gated to service_role only for defence in depth
--   - anon role gets NO access (not needed by any detected client path)
--
-- Idempotency: uses CREATE POLICY IF NOT EXISTS (Postgres 15+)
--              and ENABLE ROW LEVEL SECURITY (idempotent — safe to re-run)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. public.captain_level_requirements
--    Config table: captain level thresholds. Authenticated members read it to
--    display their progress. No user-specific rows — it's a reference table.
-- ---------------------------------------------------------------------------

ALTER TABLE public.captain_level_requirements ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all level requirements (public config data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'captain_level_requirements'
      AND policyname = 'captain_level_requirements_authenticated_select'
  ) THEN
    CREATE POLICY "captain_level_requirements_authenticated_select"
      ON public.captain_level_requirements
      FOR SELECT
      TO authenticated
      USING (true);
    COMMENT ON POLICY "captain_level_requirements_authenticated_select"
      ON public.captain_level_requirements
      IS 'Members can read all captain level config rows — static reference data, no PII.';
  END IF;
END;
$$;

-- Service role full access (Edge functions / admin ops)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'captain_level_requirements'
      AND policyname = 'captain_level_requirements_service_role_all'
  ) THEN
    CREATE POLICY "captain_level_requirements_service_role_all"
      ON public.captain_level_requirements
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    COMMENT ON POLICY "captain_level_requirements_service_role_all"
      ON public.captain_level_requirements
      IS 'service_role (Edge functions, admin) has full access to manage level config.';
  END IF;
END;
$$;


-- ---------------------------------------------------------------------------
-- 2. public.librarian_section_map
--    Config table: maps section numbers to names/categories. Read by the
--    LibrarianDashboardPage and the categorize-tour-note Edge function.
--    Static reference data; no user-specific rows.
-- ---------------------------------------------------------------------------

ALTER TABLE public.librarian_section_map ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read the section map (needed for Librarian dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'librarian_section_map'
      AND policyname = 'librarian_section_map_authenticated_select'
  ) THEN
    CREATE POLICY "librarian_section_map_authenticated_select"
      ON public.librarian_section_map
      FOR SELECT
      TO authenticated
      USING (true);
    COMMENT ON POLICY "librarian_section_map_authenticated_select"
      ON public.librarian_section_map
      IS 'Authenticated users can read section map config — needed by LibrarianDashboardPage and categorize-tour-note Edge function.';
  END IF;
END;
$$;

-- Service role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'librarian_section_map'
      AND policyname = 'librarian_section_map_service_role_all'
  ) THEN
    CREATE POLICY "librarian_section_map_service_role_all"
      ON public.librarian_section_map
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    COMMENT ON POLICY "librarian_section_map_service_role_all"
      ON public.librarian_section_map
      IS 'service_role has full access to manage the librarian section map.';
  END IF;
END;
$$;


-- ---------------------------------------------------------------------------
-- 3a. public.lnc_ingest_manifests  (live production table name per Security Advisor)
--     LOC legislative ingest manifests. Internal service table — no frontend
--     reads detected. Backend/Edge function writes only.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  -- Only enable RLS if the table exists (handles lnc vs loc naming discrepancy)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'lnc_ingest_manifests'
  ) THEN
    EXECUTE 'ALTER TABLE public.lnc_ingest_manifests ENABLE ROW LEVEL SECURITY';

    -- Service role only — no frontend access needed
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename  = 'lnc_ingest_manifests'
        AND policyname = 'lnc_ingest_manifests_service_role_all'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "lnc_ingest_manifests_service_role_all"
          ON public.lnc_ingest_manifests
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true)
      $p$;

      EXECUTE $p$
        COMMENT ON POLICY "lnc_ingest_manifests_service_role_all"
          ON public.lnc_ingest_manifests
          IS 'service_role only — LOC ingest is a backend service. No authenticated/anon access.'
      $p$;
    END IF;

    RAISE NOTICE 'RLS enabled on public.lnc_ingest_manifests';
  ELSE
    RAISE NOTICE 'public.lnc_ingest_manifests not found — skipping (check table name)';
  END IF;
END;
$$;


-- ---------------------------------------------------------------------------
-- 3b. public.loc_ingest_manifests  (migration-defined table name)
--     Apply identical policy if this variant exists.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'loc_ingest_manifests'
  ) THEN
    EXECUTE 'ALTER TABLE public.loc_ingest_manifests ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename  = 'loc_ingest_manifests'
        AND policyname = 'loc_ingest_manifests_service_role_all'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "loc_ingest_manifests_service_role_all"
          ON public.loc_ingest_manifests
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true)
      $p$;

      EXECUTE $p$
        COMMENT ON POLICY "loc_ingest_manifests_service_role_all"
          ON public.loc_ingest_manifests
          IS 'service_role only — LOC ingest is a backend service. No authenticated/anon access.'
      $p$;
    END IF;

    RAISE NOTICE 'RLS enabled on public.loc_ingest_manifests';
  ELSE
    RAISE NOTICE 'public.loc_ingest_manifests not found — skipping (check table name)';
  END IF;
END;
$$;
