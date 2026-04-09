-- K242: Reading Beacon extension on existing beacons table

-- Add reading-specific columns to existing beacons table.
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id);
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_ref_code TEXT;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_paper_key TEXT;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_position INTEGER DEFAULT 0;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_depth INTEGER DEFAULT 1 CHECK (reading_depth BETWEEN 1 AND 4);
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS reading_completed_at TIMESTAMPTZ;
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Allow reading subtype in Orange Protocol.
ALTER TABLE public.beacons DROP CONSTRAINT IF EXISTS beacons_orange_subtype_check;
ALTER TABLE public.beacons
  ADD CONSTRAINT beacons_orange_subtype_check
  CHECK (
    orange_subtype IS NULL OR orange_subtype IN (
      'game_marker',
      'share_person',
      'social_cue',
      'gift',
      'treasure',
      'learning',
      'trade_route',
      'custom',
      'reading'
    )
  );

-- Keep member_id in sync with historical user_id shape.
UPDATE public.beacons
SET member_id = user_id
WHERE member_id IS NULL
  AND user_id IS NOT NULL;

-- Ensure updated_at moves on write.
CREATE OR REPLACE FUNCTION public.set_beacons_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_beacons_set_updated_at ON public.beacons;
CREATE TRIGGER tr_beacons_set_updated_at
  BEFORE UPDATE ON public.beacons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_beacons_updated_at();

-- Fast lookup for reading wallet queries.
CREATE INDEX IF NOT EXISTS idx_beacons_reading_wallet
  ON public.beacons (user_id, reading_paper_key, updated_at DESC)
  WHERE orange_subtype = 'reading';

CREATE INDEX IF NOT EXISTS idx_beacons_member_reading_wallet
  ON public.beacons (member_id, reading_paper_key, updated_at DESC)
  WHERE orange_subtype = 'reading';

CREATE UNIQUE INDEX IF NOT EXISTS idx_beacons_unique_user_reading_paper
  ON public.beacons (user_id, reading_paper_key)
  WHERE orange_subtype = 'reading';
