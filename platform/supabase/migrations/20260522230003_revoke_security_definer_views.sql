-- =============================================================================
-- Migration: Convert SECURITY DEFINER views to SECURITY INVOKER
-- BP052 Security Remediation · File 4 of 5
-- Supabase Security Advisor category: "Security Definer View"
--
-- By default in PostgreSQL, views are created with SECURITY DEFINER semantics:
-- the view runs as the view OWNER (typically postgres/service_role), bypassing
-- RLS on the underlying tables. This means even anon users can read rows from
-- RLS-protected tables via a view.
--
-- Fix: ALTER VIEW ... SET (security_invoker = on)
--   → The view now executes with the permissions of the CALLING role
--   → RLS policies on underlying tables are evaluated for the querying user
--   → This is the correct pattern for user-facing views
--
-- Views intentionally KEPT as SECURITY DEFINER (aggregate/public stats that
-- require cross-user data access — they have no RLS to bypass, or they are
-- legitimate public dashboards):
--   - defense_klaus_cold_start_stats  (admin aggregate stats, no user PII)
--   - defense_klaus_daisy_chain_stats (admin aggregate stats)
--   - initiative_stats                (public platform stats)
--   - node_status_dashboard           (public node status)
--   - v_current_transparency_metrics  (public transparency dashboard)
--   - lmd_demand_summary              (public demand data — no PII)
--
-- All other public views without security_invoker are converted below.
-- The DO block uses ALTER VIEW ... SET (security_invoker = on) which is
-- idempotent (setting it again on an already-invoker view is a no-op).
--
-- Postgres 15+ required for security_invoker view option (Supabase uses PG 15+).
-- =============================================================================

DO $$
DECLARE
  _view_name text;
  _views_to_fix text[] := ARRAY[
    -- Views identified from baseline.sql that lack security_invoker
    -- (plain SECURITY DEFINER by PG default)
    'all_cephas_content',
    'analytics_daily_summary',
    'analytics_page_views',
    'battery_dispatch_access_status',
    'beacon_wallet',
    'chapter_unlock_progress',
    'city_neighborhood_stats',
    'demand_pedestal_stats',
    'dispatch_schedule_admin_view',
    'engagement_events_per_platform_hour',
    'engagement_ingestion_coverage_gaps',
    'funder_credit_summary',
    'geographic_cold_start_progress',
    'hexisle_vote_tallies',
    'initiatives_with_all_crowns',
    'ledger_patronage_summary',
    'lmd_recipe_popularity_by_area',
    'member_patronage_summary',
    'project_cap_status',
    'project_funding_summary',
    'seeding_pool_summary',
    'side_quest_stats',
    'v_barter_wash_summary',
    'v_c20_reciprocity_leaderboard',
    'v_certified_anchors',
    'walking_billboard_summary',
    'war_chest_summary'
  ];
  _sql text;
BEGIN
  FOREACH _view_name IN ARRAY _views_to_fix
  LOOP
    -- Only ALTER if the view exists in public schema
    IF EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = _view_name
        AND c.relkind = 'v'  -- regular view
    ) THEN
      _sql := format(
        'ALTER VIEW public.%I SET (security_invoker = on)',
        _view_name
      );
      BEGIN
        EXECUTE _sql;
        RAISE NOTICE 'security_invoker set: public.%', _view_name;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not set security_invoker on public.% — %: %',
          _view_name, SQLSTATE, SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'View public.% not found — skipping', _view_name;
    END IF;
  END LOOP;

  RAISE NOTICE 'Security Definer view remediation complete.';
END;
$$;


-- ---------------------------------------------------------------------------
-- Enumerate any remaining plain SECURITY DEFINER views dynamically
-- (catches any views added after baseline that were not in the list above)
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  _rec record;
  _sql text;
  -- Views we INTENTIONALLY keep as SECURITY DEFINER
  _keep_definer text[] := ARRAY[
    'defense_klaus_cold_start_stats',
    'defense_klaus_daisy_chain_stats',
    'initiative_stats',
    'node_status_dashboard',
    'v_current_transparency_metrics',
    'lmd_demand_summary'
  ];
BEGIN
  FOR _rec IN
    SELECT c.relname AS view_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      -- security_invoker not set: either reloptions is null or doesn't contain security_invoker=true/on
      AND NOT (
        c.reloptions IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM unnest(c.reloptions) opt
          WHERE opt ILIKE 'security_invoker%'
        )
      )
      AND c.relname <> ALL (_keep_definer)
    ORDER BY c.relname
  LOOP
    _sql := format(
      'ALTER VIEW public.%I SET (security_invoker = on)',
      _rec.view_name
    );
    BEGIN
      EXECUTE _sql;
      RAISE NOTICE 'Dynamic fix — security_invoker set: public.%', _rec.view_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Dynamic fix failed for public.% — %: %',
        _rec.view_name, SQLSTATE, SQLERRM;
    END;
  END LOOP;
END;
$$;
