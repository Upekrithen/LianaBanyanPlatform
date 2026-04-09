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

ALTER TABLE public.battery_dispatch_platform_config
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('live_fire', 'community', 'professional', 'evergreen', 'episodic')),
  ADD COLUMN IF NOT EXISTS preferred_windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stagger_offset_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekday_only BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tz TEXT NOT NULL DEFAULT 'America/Chicago';

INSERT INTO public.battery_dispatch_platform_config
  (platform, min_burst_size, max_burst_size, min_spacing_seconds, max_spacing_seconds, notes)
VALUES
  ('x',         4, 7,  15, 45, 'Pawn B48: avoid 1-sec bot detection; 4-7 post sweet spot for CTR'),
  ('threads',   3, 5,  20, 60, 'Pawn B48: conversational depth, reply-first'),
  ('linkedin',  1, 2, 300, 600, 'Pawn B48: 1-2 larger posts, spread for morning peak'),
  ('facebook',  1, 2, 300, 600, 'Pawn B48: visual series framing'),
  ('instagram', 1, 2, 300, 600, 'Pawn B48: Reels/episodic')
ON CONFLICT (platform) DO NOTHING;

UPDATE public.battery_dispatch_platform_config
SET role = 'live_fire',
    preferred_windows = '[{"start":"10:00","end":"12:00"},{"start":"17:00","end":"19:00"}]'::jsonb,
    stagger_offset_minutes = 0,
    weekday_only = false,
    tz = 'America/Chicago',
    updated_at = now()
WHERE platform = 'x';

UPDATE public.battery_dispatch_platform_config
SET role = 'community',
    preferred_windows = '[{"start":"11:00","end":"13:00"},{"start":"18:00","end":"21:00"}]'::jsonb,
    stagger_offset_minutes = 60,
    weekday_only = false,
    tz = 'America/Chicago',
    updated_at = now()
WHERE platform = 'threads';

UPDATE public.battery_dispatch_platform_config
SET role = 'professional',
    preferred_windows = '[{"start":"07:30","end":"09:30"}]'::jsonb,
    stagger_offset_minutes = 0,
    weekday_only = true,
    tz = 'America/Chicago',
    updated_at = now()
WHERE platform = 'linkedin';

UPDATE public.battery_dispatch_platform_config
SET role = 'evergreen',
    preferred_windows = '[{"start":"16:00","end":"20:00"}]'::jsonb,
    stagger_offset_minutes = 0,
    weekday_only = false,
    tz = 'America/Chicago',
    updated_at = now()
WHERE platform = 'facebook';

UPDATE public.battery_dispatch_platform_config
SET role = 'episodic',
    preferred_windows = '[{"start":"17:00","end":"21:00"}]'::jsonb,
    stagger_offset_minutes = 0,
    weekday_only = false,
    tz = 'America/Chicago',
    updated_at = now()
WHERE platform = 'instagram';
