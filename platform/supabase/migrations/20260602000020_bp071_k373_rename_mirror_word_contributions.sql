-- Migration: 20260602000020_bp071_k373_rename_mirror_word_contributions
-- BP071 · Scope 16 · Safety rename guard
-- The k373 original migration (20260409000003) was amended in-place to use
-- mirror_word_contributions from the start. This migration is a safety net:
-- IF the old translation_contributions (k373 version) was applied to prod
-- before the amendment, rename it. Uses IF EXISTS so it is a no-op if
-- the table was never created under the old name.

-- Also ensures mirror_word_contributions exists with correct RLS policies.

DO $$
BEGIN
  -- Only rename if the OLD k373 table exists AND the new name does NOT yet exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'translation_contributions_k373'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'mirror_word_contributions'
  ) THEN
    ALTER TABLE public.translation_contributions_k373
      RENAME TO mirror_word_contributions;
  END IF;
END $$;

-- Ensure RLS is enabled and canonical policies exist
-- (safe to re-run; CREATE POLICY will fail silently if already present via
-- the surrounding DO block with exception handling)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'mirror_word_contributions'
  ) THEN
    EXECUTE 'ALTER TABLE public.mirror_word_contributions ENABLE ROW LEVEL SECURITY';

    -- members_insert_mirror_words
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename  = 'mirror_word_contributions'
        AND policyname = 'members_insert_mirror_words'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "members_insert_mirror_words"
          ON public.mirror_word_contributions
          FOR INSERT
          WITH CHECK (auth.uid() IS NOT NULL)
      $p$;
    END IF;

    -- members_read_own_mirror_words
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename  = 'mirror_word_contributions'
        AND policyname = 'members_read_own_mirror_words'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "members_read_own_mirror_words"
          ON public.mirror_word_contributions
          FOR SELECT
          USING (user_id = auth.uid())
      $p$;
    END IF;

    -- admins_all_mirror_words
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename  = 'mirror_word_contributions'
        AND policyname = 'admins_all_mirror_words'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "admins_all_mirror_words"
          ON public.mirror_word_contributions
          FOR ALL
          USING (auth.jwt() ->> 'role' = 'admin')
      $p$;
    END IF;
  END IF;
END $$;
