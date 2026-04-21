-- Fix for Supabase Security Advisor (Function Search Path Mutable)
-- This script alters functions to explicitly set the search_path,
-- which prevents malicious users from overriding the search path to execute arbitrary code.

DO $$
DECLARE
    f record;
BEGIN
    FOR f IN
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        -- Alter the function to set search_path = public
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public;', f.proname, f.args);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if the function can't be altered (e.g., system functions or triggers that require specific paths)
            RAISE NOTICE 'Could not alter function %', f.proname;
        END;
    END LOOP;
END;
$$;
