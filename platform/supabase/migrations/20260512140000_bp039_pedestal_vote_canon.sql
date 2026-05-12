-- BP039: Red Carpet Dispatch Flow - Pedestal Vote Canon Table
-- This table tracks high-value recipients who receive personalized Frame bundles

CREATE TABLE IF NOT EXISTS public.pedestal_vote_canon (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name  text          NOT NULL,
  recipient_slug  text          NOT NULL UNIQUE,
  initiative_id   uuid          REFERENCES public.initiatives(id),
  pedestal_class  text          NOT NULL,
  vote_status     text          NOT NULL DEFAULT 'awaiting_initial_outreach'
                  CHECK (vote_status IN (
                    'awaiting_initial_outreach',
                    'dispatched',
                    'accepted',
                    'declined',
                    'non_response',
                    'recorded'
                  )),
  letter_path     text,
  bundle_id       text,
  dispatched_at   timestamptz,
  responded_at    timestamptz,
  response_notes  text,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pedestal_vote_canon_status
  ON public.pedestal_vote_canon(vote_status);

CREATE INDEX IF NOT EXISTS idx_pedestal_vote_canon_initiative
  ON public.pedestal_vote_canon(initiative_id);

-- Enable Row Level Security
ALTER TABLE public.pedestal_vote_canon ENABLE ROW LEVEL SECURITY;

-- Public read access (dispatch flow requires visibility)
CREATE POLICY pedestal_vote_read_all
  ON public.pedestal_vote_canon
  FOR SELECT
  USING (true);

-- Seed the gate sentinel: Jimmy Kimmel
-- This row acts as a production safety gate that blocks all dispatch
-- until either:
--   1. Jimmy Kimmel's status changes from 'awaiting_initial_outreach', OR
--   2. Founder provides explicit override flag
INSERT INTO public.pedestal_vote_canon (
  recipient_name,
  recipient_slug,
  pedestal_class,
  vote_status
)
VALUES (
  'Jimmy Kimmel',
  'jimmy-kimmel',
  'personal-anchor',
  'awaiting_initial_outreach'
)
ON CONFLICT (recipient_slug) DO NOTHING;
