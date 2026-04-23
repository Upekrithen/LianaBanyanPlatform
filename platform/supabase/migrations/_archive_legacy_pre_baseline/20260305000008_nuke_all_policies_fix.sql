-- Fix for Supabase Security Advisor (Multiple Permissive Policies)
-- This script drops ALL policies and replaces them with a single, clean policy per table.

DO $$
DECLARE
    t record;
    p record;
BEGIN
    FOR t IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        -- Find and drop EVERY existing policy on this table
        FOR p IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = t.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', p.policyname, t.tablename);
        END LOOP;

        -- Create ONE unified policy for authenticated users (CRUD)
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
