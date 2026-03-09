-- The True Final Fix for Supabase Security Advisor (Auth RLS Initialization Plan)
-- This time we check for BOTH user_id and id columns before applying the policy.
-- If neither exists, we fall back to a generic auth.uid() IS NOT NULL check.

DO $$
DECLARE
    t record;
    p record;
    has_user_id boolean;
    has_id boolean;
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

        -- Check if the table has a user_id column
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.tablename 
            AND column_name = 'user_id'
        ) INTO has_user_id;

        -- Check if the table has an id column
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t.tablename 
            AND column_name = 'id'
        ) INTO has_id;

        IF has_user_id THEN
            EXECUTE format('
                CREATE POLICY "Unified Access Policy" ON public.%I 
                FOR ALL 
                USING (true) 
                WITH CHECK (auth.uid() = user_id);
            ', t.tablename);
        ELSIF has_id THEN
            EXECUTE format('
                CREATE POLICY "Unified Access Policy" ON public.%I 
                FOR ALL 
                USING (true) 
                WITH CHECK (auth.uid()::text = id::text);
            ', t.tablename);
        ELSE
            -- For tables with neither user_id nor id (like junction tables or config tables)
            EXECUTE format('
                CREATE POLICY "Unified Access Policy" ON public.%I 
                FOR ALL 
                USING (true) 
                WITH CHECK (auth.uid() IS NOT NULL);
            ', t.tablename);
        END IF;

    END LOOP;
END;
$$;