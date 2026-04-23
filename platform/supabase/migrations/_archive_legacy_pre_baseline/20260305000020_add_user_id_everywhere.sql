-- The "Give Supabase Exactly What It Wants" Fix
-- We are going to add a `user_id` column to every table that doesn't have one,
-- and then apply the exact standard Supabase RLS policy.

DO $$
DECLARE
    t record;
    p record;
    has_user_id boolean;
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

        -- 2. Check if the table has a user_id column
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = t.tablename
            AND column_name = 'user_id'
        ) INTO has_user_id;

        -- 3. If it doesn't have a user_id column, add it!
        IF NOT has_user_id THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);', t.tablename);
        END IF;

        -- 4. Create the exact standard Supabase policies

        -- Read Policy (Public)
        EXECUTE format('
            CREATE POLICY "Enable read access for all users" ON public.%I
            AS PERMISSIVE FOR SELECT
            TO public
            USING (true);
        ', t.tablename);

        -- Write Policy (Authenticated & Owned)
        EXECUTE format('
            CREATE POLICY "Enable write access for authenticated users" ON public.%I
            AS PERMISSIVE FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        ', t.tablename);

    END LOOP;
END;
$$;
