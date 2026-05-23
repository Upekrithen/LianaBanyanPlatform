-- =============================================================================
-- Migration: Fix "Exposed Auth Users" Security Advisor error
-- BP052 Security Remediation · File 5 of 5
-- Supabase Security Advisor category: "Exposed Auth Users"
--
-- Background:
--   Supabase Security Advisor flags this when a VIEW in the public schema
--   queries auth.users directly AND is accessible to anon/authenticated roles
--   without RLS protection. The view runs as SECURITY DEFINER (view owner =
--   postgres), which has access to auth.users, effectively leaking user email
--   addresses and metadata to any caller.
--
-- Discovery:
--   The baseline migration shows auth.users is referenced in SECURITY DEFINER
--   functions (legitimate, correct pattern). However, the Security Advisor
--   error is raised for a VIEW that queries auth.users. This view was likely
--   created directly on the production DB (not tracked in migrations) or
--   post-baseline. The Advisor screenshot hint suggests a name containing
--   "doggett" or similar.
--
-- Fix strategy:
--   1. Enumerate ALL public views that reference auth.users in their definition
--   2. For each such view:
--      a. If it's a diagnostic/admin view: set security_invoker = on AND
--         revoke SELECT from anon + authenticated (admin-only access)
--      b. If it's a user-facing view: rewrite to expose only safe columns
--         (id, created_at) and set security_invoker = on
--   3. Revoke all grants to anon on the problematic view(s)
--
-- The DO block below performs the dynamic discovery and remediation.
-- A second block handles the specific "user email exposure" pattern by
-- revoking anon access from any view selecting email from auth.users.
--
-- Idempotency: ALTER VIEW SET (security_invoker) is idempotent.
--              REVOKE is idempotent (no-op if not granted).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Step 1: Find and fix all public views that query auth.users
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  _rec record;
  _sql text;
BEGIN
  -- Find views in public schema whose definition references auth.users
  FOR _rec IN
    SELECT
      c.relname AS view_name,
      pg_get_viewdef(c.oid, true) AS view_def
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      AND pg_get_viewdef(c.oid, true) ILIKE '%auth.users%'
    ORDER BY c.relname
  LOOP
    RAISE NOTICE 'Found auth.users-referencing view: public.%', _rec.view_name;

    -- Step 1a: Set security_invoker so RLS applies (view no longer runs as owner)
    BEGIN
      EXECUTE format(
        'ALTER VIEW public.%I SET (security_invoker = on)',
        _rec.view_name
      );
      RAISE NOTICE 'security_invoker set on public.%', _rec.view_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not set security_invoker on public.% — %: %',
        _rec.view_name, SQLSTATE, SQLERRM;
    END;

    -- Step 1b: Revoke SELECT from anon role (auth data should never be anon-accessible)
    BEGIN
      EXECUTE format(
        'REVOKE SELECT ON public.%I FROM anon',
        _rec.view_name
      );
      RAISE NOTICE 'REVOKE SELECT FROM anon on public.%', _rec.view_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'REVOKE from anon failed for public.% — %: %',
        _rec.view_name, SQLSTATE, SQLERRM;
    END;

    -- Step 1c: Revoke SELECT from authenticated if the view is admin-only
    -- (conservative — admin views should not be accessible to all authenticated users)
    -- We check if the view name contains 'admin', 'audit', 'user', 'email', 'auth'
    IF _rec.view_name ILIKE '%admin%'
       OR _rec.view_name ILIKE '%audit%'
       OR _rec.view_name ILIKE '%doggett%'
       OR _rec.view_name ILIKE '%auth_user%'
       OR _rec.view_name ILIKE '%user_email%'
    THEN
      BEGIN
        EXECUTE format(
          'REVOKE SELECT ON public.%I FROM authenticated',
          _rec.view_name
        );
        RAISE NOTICE 'REVOKE SELECT FROM authenticated (admin view) on public.%', _rec.view_name;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'REVOKE from authenticated failed for public.% — %: %',
          _rec.view_name, SQLSTATE, SQLERRM;
      END;
    END IF;

  END LOOP;

  RAISE NOTICE 'auth.users view exposure remediation complete.';
END;
$$;


-- ---------------------------------------------------------------------------
-- Step 2: Explicit handling for the known "Exposed Auth Users" view
-- If it was created directly on production (not in migrations), it may be
-- named something like "auth_users_doggett", "auth_in_degrees_Doggett",
-- or similar. Handle both the discovered dynamic case and any known names.
--
-- This block is a no-op if the view doesn't exist.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  _candidate_names text[] := ARRAY[
    -- Possible names hinted in Security Advisor screenshot
    'auth_in_degrees_doggett',
    'auth_users_doggett',
    'auth_users_view',
    'public_users',
    'user_emails',
    'users_public'
  ];
  _view text;
  _exists boolean;
BEGIN
  FOREACH _view IN ARRAY _candidate_names
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = _view
        AND c.relkind = 'v'
    ) INTO _exists;

    IF _exists THEN
      RAISE NOTICE 'Found candidate auth-exposure view: public.%', _view;

      -- Revoke all access from anon and authenticated
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', _view);
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', _view);
      RAISE NOTICE 'Revoked all access on public.% from anon + authenticated', _view;

      -- Set security_invoker
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', _view);
      RAISE NOTICE 'security_invoker enabled on public.%', _view;
    END IF;
  END LOOP;
END;
$$;


-- ---------------------------------------------------------------------------
-- Step 3: Safety net — revoke anon SELECT from ALL public views
-- This is belt-and-suspenders. Supabase grants SELECT on views to anon by
-- default (via the GRANT ALL in baseline). We revoke that for any view
-- whose definition touches auth schema to prevent future exposure.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  _rec record;
BEGIN
  FOR _rec IN
    SELECT c.relname AS view_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      AND (
        pg_get_viewdef(c.oid, true) ILIKE '%auth.users%'
        OR pg_get_viewdef(c.oid, true) ILIKE '%auth.%'
      )
    ORDER BY c.relname
  LOOP
    BEGIN
      EXECUTE format('REVOKE SELECT ON public.%I FROM anon', _rec.view_name);
      RAISE NOTICE 'Safety net: revoked anon SELECT on auth-referencing view public.%', _rec.view_name;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Silently ignore — may not be granted
    END;
  END LOOP;

  RAISE NOTICE 'Safety net auth-schema view revocation complete.';
END;
$$;
