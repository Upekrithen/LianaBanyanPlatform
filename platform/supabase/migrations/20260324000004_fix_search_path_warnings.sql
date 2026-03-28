-- Fix "Function Search Path Mutable" warnings in Supabase Security Advisor
--
-- Dynamically finds ALL public functions that don't have search_path pinned
-- and sets search_path = public on each one.
-- This is idempotent and skips functions that already have it set.

DO $$
DECLARE
  _fn record;
  _sql text;
BEGIN
  FOR _fn IN
    SELECT
      p.oid,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind IN ('f', 'p')  -- functions and procedures
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(p.proconfig) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  LOOP
    _sql := format(
      'ALTER FUNCTION public.%I(%s) SET search_path = public',
      _fn.proname,
      _fn.identity_args
    );
    BEGIN
      EXECUTE _sql;
      RAISE NOTICE 'Fixed: %', _sql;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped (error): % — %', _sql, SQLERRM;
    END;
  END LOOP;
END;
$$;
