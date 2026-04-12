-- K409: Crown Letter Response Log — Pitfall 3 response playbook wiring
-- Append-only tracking table for letter dispatch, response, and followup events.
-- B097 source.

CREATE TABLE IF NOT EXISTS public.crown_letter_response_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_by       UUID REFERENCES auth.users(id),
  recipient_name  TEXT NOT NULL,
  event_kind      TEXT NOT NULL CHECK (event_kind IN ('letter_dispatched', 'response_received', 'followup_sent')),
  response_type   TEXT CHECK (response_type IS NULL OR response_type IN (
    'yes', 'curious', 'no_thanks', 'needs_clarification', 'delegation', 'meeting_scheduled', 'other'
  )),
  summary         TEXT DEFAULT '',
  event_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crown_letter_response_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read response log"
  ON public.crown_letter_response_log FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert response log"
  ON public.crown_letter_response_log FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_response_log_recipient
  ON public.crown_letter_response_log (recipient_name);
CREATE INDEX IF NOT EXISTS idx_response_log_event_kind
  ON public.crown_letter_response_log (event_kind);
CREATE INDEX IF NOT EXISTS idx_response_log_event_at
  ON public.crown_letter_response_log (event_at);
