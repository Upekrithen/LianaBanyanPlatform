-- Add pathway_progress column to profiles table
-- Stores user's progress through the leveled pathway system

-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'pathway_progress'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN pathway_progress jsonb DEFAULT '{
      "completedPathways": [],
      "currentLevel": 1,
      "unlockedThreePacks": [],
      "pathwayProgress": {}
    }'::jsonb;

    COMMENT ON COLUMN public.profiles.pathway_progress IS
      'User progress through leveled pathway system. Contains completedPathways array, currentLevel (1-3), unlockedThreePacks array, and pathwayProgress percentages.';
  END IF;
END $$;

-- Create index for querying by level
CREATE INDEX IF NOT EXISTS idx_profiles_pathway_level
  ON public.profiles ((pathway_progress->>'currentLevel'));
