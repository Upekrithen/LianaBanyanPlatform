-- Crown Letter Updates table
-- Stores living update timelines for each Crown Letter recipient.
-- Bishop populates; CrownLetterUpdate.tsx reads via slug.

CREATE TABLE IF NOT EXISTS public.crown_letter_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_slug TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  letter_sent_date TIMESTAMPTZ NOT NULL,
  updates JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.crown_letter_updates IS 'Living update pages for Crown Letter recipients — tracks what changed since the letter was sent.';
COMMENT ON COLUMN public.crown_letter_updates.updates IS 'JSONB array of {date, headline, body, relevance_tags[]} objects ordered newest-first.';

CREATE INDEX IF NOT EXISTS idx_crown_letter_updates_slug ON public.crown_letter_updates (letter_slug);

ALTER TABLE public.crown_letter_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for crown letter updates"
  ON public.crown_letter_updates FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage crown letter updates"
  ON public.crown_letter_updates FOR ALL
  USING (auth.role() = 'service_role');
