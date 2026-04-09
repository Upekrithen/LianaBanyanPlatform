-- K243: Reading Beacon Influencer Bridge (#2137)

-- Extend linchpin connections for reading-sourced attribution.
ALTER TABLE IF EXISTS public.linchpin_connections
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'direct'
  CHECK (source_type IN ('direct', 'cue_card', 'reading_beacon', 'deck_card'));

ALTER TABLE IF EXISTS public.linchpin_connections
  ADD COLUMN IF NOT EXISTS source_beacon_id UUID REFERENCES public.beacons(id);

ALTER TABLE IF EXISTS public.linchpin_connections
  ADD COLUMN IF NOT EXISTS source_paper_key TEXT;

DO $$
BEGIN
  IF to_regclass('public.linchpin_connections') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_linchpin_connections_source_type
      ON public.linchpin_connections (source_type);

    CREATE INDEX IF NOT EXISTS idx_linchpin_connections_source_beacon
      ON public.linchpin_connections (source_beacon_id);
  END IF;
END $$;
