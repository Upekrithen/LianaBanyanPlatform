CREATE TABLE IF NOT EXISTS public.battery_dispatch_platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('x', 'threads', 'linkedin', 'facebook', 'instagram')),
  min_burst_size INTEGER NOT NULL DEFAULT 1,
  max_burst_size INTEGER NOT NULL DEFAULT 1,
  min_spacing_seconds INTEGER NOT NULL DEFAULT 1,
  max_spacing_seconds INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.battery_dispatch_platform_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'battery_dispatch_platform_config'
      AND policyname = 'Anyone can read dispatch config'
  ) THEN
    CREATE POLICY "Anyone can read dispatch config"
      ON public.battery_dispatch_platform_config
      FOR SELECT
      USING (true);
  END IF;
END $$;

INSERT INTO public.battery_dispatch_platform_config
  (platform, min_burst_size, max_burst_size, min_spacing_seconds, max_spacing_seconds, notes)
VALUES
  ('x',         4, 7,  15, 45, 'Pawn B48: avoid 1-sec bot detection; 4-7 post sweet spot for CTR'),
  ('threads',   3, 5,  20, 60, 'Pawn B48: conversational depth, reply-first'),
  ('linkedin',  1, 2, 300, 600, 'Pawn B48: 1-2 larger posts, spread for morning peak'),
  ('facebook',  1, 2, 300, 600, 'Pawn B48: visual series framing'),
  ('instagram', 1, 2, 300, 600, 'Pawn B48: Reels/episodic')
ON CONFLICT (platform) DO UPDATE SET
  min_burst_size = EXCLUDED.min_burst_size,
  max_burst_size = EXCLUDED.max_burst_size,
  min_spacing_seconds = EXCLUDED.min_spacing_seconds,
  max_spacing_seconds = EXCLUDED.max_spacing_seconds,
  notes = EXCLUDED.notes,
  updated_at = now();
