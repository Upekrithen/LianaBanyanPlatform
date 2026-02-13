-- ============================================================================
-- FIX: Add missing 'description' column to innovation_log
-- Run this BEFORE the complete innovation registry migration
-- ============================================================================

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN description text;
    RAISE NOTICE 'Added description column to innovation_log';
  ELSE
    RAISE NOTICE 'description column already exists';
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'innovation_log'
ORDER BY ordinal_position;
