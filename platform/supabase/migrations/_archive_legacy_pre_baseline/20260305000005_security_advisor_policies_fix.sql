-- Fix for Supabase Security Advisor (Multiple Permissive Policies)
-- This script consolidates the permissive policies we created earlier into a single, cleaner policy per table.
-- It drops the old "Baseline" policies and replaces them with a single, unified authenticated policy.

DO $$
DECLARE
    t record;
BEGIN
    FOR t IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        -- Drop the previous baseline policies to clear the "Multiple Permissive Policies" warning
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "Baseline Read Access" ON public.%I;', t.tablename);
            EXECUTE format('DROP POLICY IF EXISTS "Baseline Auth Write Access" ON public.%I;', t.tablename);

            -- Also drop any other generic permissive policies that might exist
            EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON public.%I;', t.tablename);
            EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.%I;', t.tablename);
            EXECUTE format('DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.%I;', t.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors
        END;

        -- Create ONE unified policy for authenticated users (CRUD)
        -- Note: For a true production app, this should be scoped to owner_id.
        -- This is a temporary fix to clear the Supabase warnings while keeping the app functional.
        EXECUTE format('
            CREATE POLICY "Unified Auth Access" ON public.%I
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
        ', t.tablename);

        -- Create ONE unified policy for public read access
        EXECUTE format('
            CREATE POLICY "Unified Public Read" ON public.%I
            FOR SELECT
            TO public
            USING (true);
        ', t.tablename);

    END LOOP;
END;
$$;
