-- The "Subquery Optimization" Fix for Supabase Security Advisor
-- The linter is complaining that `auth.uid()` is being evaluated for every single row,
-- which causes poor performance on large tables.
-- The fix is to wrap it in a subquery: `(select auth.uid())` so Postgres evaluates it once per query.

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

        -- 2. Create Public Read Policy
        EXECUTE format('
            CREATE POLICY "Enable read access for all users" ON public.%I
            AS PERMISSIVE FOR SELECT
            TO public
            USING (true);
        ', t.tablename);

        -- 3. Create Authenticated Write Policy using the (select auth.uid()) optimization
        EXECUTE format('
            CREATE POLICY "Enable write access for authenticated users" ON public.%I
            AS PERMISSIVE FOR ALL
            TO authenticated
            USING ((select auth.uid()) = user_id)
            WITH CHECK ((select auth.uid()) = user_id);
        ', t.tablename);

    END LOOP;
END;
$$;
