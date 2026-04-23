-- K276: Scheduled Viewing Beacon system

CREATE TABLE IF NOT EXISTS public.viewing_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('pudding', 'bst_episode', 'spoonful', 'skipping_stone', 'paper')),
  content_id TEXT NOT NULL,
  content_title TEXT NOT NULL,
  content_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  reminder_offset INTERVAL DEFAULT '15 minutes',
  recurrence_rule TEXT,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dispatched', 'cancelled', 'completed')),
  dispatched_at TIMESTAMPTZ,
  helm_calendar_event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewing_beacons_member ON public.viewing_beacons (member_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_viewing_beacons_status ON public.viewing_beacons (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_viewing_beacons_calendar_event_id ON public.viewing_beacons (helm_calendar_event_id);

ALTER TABLE public.viewing_beacons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'viewing_beacons'
      AND policyname = 'Members manage own beacons'
  ) THEN
    CREATE POLICY "Members manage own beacons"
      ON public.viewing_beacons
      FOR ALL
      USING (auth.uid() = member_id)
      WITH CHECK (auth.uid() = member_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'viewing_beacons'
      AND policyname = 'Admins manage all viewing beacons'
  ) THEN
    CREATE POLICY "Admins manage all viewing beacons"
      ON public.viewing_beacons
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_viewing_beacons_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_viewing_beacons_updated_at ON public.viewing_beacons;
CREATE TRIGGER tr_viewing_beacons_updated_at
  BEFORE UPDATE ON public.viewing_beacons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_viewing_beacons_updated_at();
