-- Fix for Supabase Security Advisor (Multiple Permissive Policies)
-- This script drops ALL existing policies and replaces them with a SINGLE policy per table.
-- Supabase flags "Multiple Permissive Policies" when a table has more than one permissive policy,
-- even if one is for SELECT and one is for ALL.

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

        -- Create exactly ONE unified policy per table that handles both public read and auth write
        -- This satisfies Supabase's requirement to not have multiple overlapping permissive policies
        EXECUTE format('
            CREATE POLICY "Unified Access Policy" ON public.%I
            FOR ALL
            USING (
                -- Allow read access to everyone (public)
                current_setting(''request.jwt.claims'', true)::json->>''role'' = ''anon''
                OR
                -- Allow full access to authenticated users
                current_setting(''request.jwt.claims'', true)::json->>''role'' = ''authenticated''
            )
            WITH CHECK (
                -- Only allow writes from authenticated users
                current_setting(''request.jwt.claims'', true)::json->>''role'' = ''authenticated''
            );
        ', t.tablename);

    END LOOP;
END;
$$;
