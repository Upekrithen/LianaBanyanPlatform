-- The "Split Actions to Prevent Overlap" Fix for Supabase Security Advisor
-- The linter is flagging "Multiple Permissive Policies" because the "Enable write access for authenticated users" 
-- policy uses FOR ALL. Since ALL includes SELECT, and we already have a FOR SELECT policy for public, 
-- the linter sees two SELECT policies for authenticated users (since authenticated is a subset of public).
-- We must split the write policy into explicit INSERT, UPDATE, and DELETE policies to avoid overlapping with SELECT.

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
        -- 1. Drop EVERYTHING
        FOR p IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = t.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', p.policyname, t.tablename);
        END LOOP;

        -- 2. Create Public Read Policy (SELECT only)
        EXECUTE format('
            CREATE POLICY "Enable read access for all users" ON public.%I
            AS PERMISSIVE FOR SELECT
            TO public
            USING (true);
        ', t.tablename);

        -- 3. Create Authenticated INSERT Policy
        EXECUTE format('
            CREATE POLICY "Enable insert for authenticated users" ON public.%I
            AS PERMISSIVE FOR INSERT
            TO authenticated
            WITH CHECK ((select auth.uid()) = user_id);
        ', t.tablename);

        -- 4. Create Authenticated UPDATE Policy
        EXECUTE format('
            CREATE POLICY "Enable update for authenticated users" ON public.%I
            AS PERMISSIVE FOR UPDATE
            TO authenticated
            USING ((select auth.uid()) = user_id)
            WITH CHECK ((select auth.uid()) = user_id);
        ', t.tablename);

        -- 5. Create Authenticated DELETE Policy
        EXECUTE format('
            CREATE POLICY "Enable delete for authenticated users" ON public.%I
            AS PERMISSIVE FOR DELETE
            TO authenticated
            USING ((select auth.uid()) = user_id);
        ', t.tablename);

    END LOOP;
END;
$$;