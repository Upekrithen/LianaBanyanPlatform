-- ============================================================================
-- FIX: Add ALL missing columns to innovation_log
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
    RAISE NOTICE 'Added description column';
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN category text;
    RAISE NOTICE 'Added category column';
  END IF;
END $$;

-- Add patent_bag column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'patent_bag'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN patent_bag text;
    RAISE NOTICE 'Added patent_bag column';
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN status text DEFAULT 'documented';
    RAISE NOTICE 'Added status column';
  END IF;
END $$;

-- ============================================================================
-- FIX: Ensure current_metrics table exists with proper structure
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.current_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key text NOT NULL UNIQUE,
  metric_value numeric NOT NULL,
  metric_label text,
  updated_at timestamptz DEFAULT now()
);

-- Verify innovation_log columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'innovation_log'
ORDER BY ordinal_position;

-- Verify current_metrics exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'current_metrics'
ORDER BY ordinal_position;
