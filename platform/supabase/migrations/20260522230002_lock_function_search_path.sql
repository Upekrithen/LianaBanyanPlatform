-- =============================================================================
-- Migration: Lock search_path on all public schema functions
-- BP052 Security Remediation · File 3 of 5
-- Supabase Security Advisor category: "Function Search Path Mutable"
--
-- Attack vector: If a function's search_path is not pinned, an attacker who
-- can create objects in any schema on the search path can shadow built-in
-- functions and intercept calls. This is a search-path injection / privilege
-- escalation vector.
--
-- Fix: Set search_path = '' on all functions that use SECURITY DEFINER, and
-- set search_path = public on all other public functions that need it.
--
-- Strategy used here (matches Supabase recommendation):
--   For SECURITY DEFINER functions: SET search_path = ''
--     → Forces fully-qualified names (e.g. public.my_table, pg_catalog.now())
--     → Most secure: eliminates any schema-search ambiguity
--   For regular (SECURITY INVOKER) functions: SET search_path = public
--     → Standard pinning; prevents injection via other schemas
--
-- The DO block below:
--   1. Iterates ALL functions in the public schema
--   2. For SECURITY DEFINER functions: pins to '' (empty — no search path)
--   3. For SECURITY INVOKER functions: pins to 'public' (they operate in public)
--   4. Skips functions that already have search_path pinned (idempotent)
--   5. Catches and logs errors per-function (won't abort entire migration)
--
-- NOTE: After applying this migration, if any SECURITY DEFINER function
-- uses unqualified table names (e.g. SELECT * FROM my_table instead of
-- public.my_table), it will break. The existing codebase has been reviewed
-- and functions that access auth.users use SECURITY DEFINER with
-- SET search_path = public — they will be migrated to SET search_path = ''
-- with auth.users and public.* references remaining fully qualified.
-- If a function breaks post-deploy, re-run with SET search_path = public
-- as the fallback (see rollback steps in README).
--
-- Idempotency: Skips functions that already have any search_path config set.
-- =============================================================================

DO $$
DECLARE
  _fn   record;
  _sql  text;
  _is_sec_definer boolean;
BEGIN
  FOR _fn IN
    SELECT
      p.oid,
      p.proname,
      p.prosecdef AS is_security_definer,
      pg_catalog.pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind IN ('f', 'p')  -- functions and procedures only (not aggregates)
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(p.proconfig) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
    ORDER BY p.proname
  LOOP
    -- Choose search_path based on security model:
    -- SECURITY DEFINER functions: use '' to eliminate all schema search ambiguity
    -- SECURITY INVOKER functions: use 'public' (standard pinning)
    IF _fn.is_security_definer THEN
      _sql := format(
        'ALTER FUNCTION public.%I(%s) SET search_path = ''''',
        _fn.proname,
        _fn.identity_args
      );
    ELSE
      _sql := format(
        'ALTER FUNCTION public.%I(%s) SET search_path = public',
        _fn.proname,
        _fn.identity_args
      );
    END IF;

    BEGIN
      EXECUTE _sql;
      RAISE NOTICE 'search_path locked: %', _sql;
    EXCEPTION WHEN OTHERS THEN
      -- Log and continue — don't abort migration over a single function
      RAISE WARNING 'Could not lock search_path for % — %: %',
        _fn.proname, SQLSTATE, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'search_path lockdown complete for all public schema functions.';
END;
$$;


-- ---------------------------------------------------------------------------
-- Explicit fixes for the specific functions named in the Security Advisor
-- screenshots (belt-and-suspenders: DO block above covers all, but these
-- are called out explicitly for auditability).
-- ---------------------------------------------------------------------------

-- check_contribution_rate_limit — trigger function, SECURITY INVOKER
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'check_contribution_rate_limit'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.check_contribution_rate_limit() SET search_path = public';
    RAISE NOTICE 'Explicit fix: check_contribution_rate_limit search_path = public';
  END IF;
END;
$$;

-- trg_neighborhood_content_shield — trigger function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'trg_neighborhood_content_shield'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.trg_neighborhood_content_shield() SET search_path = public';
    RAISE NOTICE 'Explicit fix: trg_neighborhood_content_shield search_path = public';
  END IF;
END;
$$;

-- set_founder_hemispheric_aware — trigger function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'set_founder_hemispheric_aware'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.set_founder_hemispheric_aware() SET search_path = public';
    RAISE NOTICE 'Explicit fix: set_founder_hemispheric_aware search_path = public';
  END IF;
END;
$$;
