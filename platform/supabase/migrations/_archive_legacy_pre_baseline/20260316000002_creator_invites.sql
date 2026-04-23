-- Creator Invites + Project Drafts
-- Knight Session 26 — Chalk Outline Onboarding persistence

CREATE TABLE IF NOT EXISTS public.creator_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_handle TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id UUID
);

CREATE TABLE IF NOT EXISTS public.project_drafts (
  id TEXT PRIMARY KEY,
  invite_id UUID REFERENCES public.creator_invites(id),
  field_data JSONB NOT NULL DEFAULT '{}',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invites by code"
  ON public.creator_invites FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update their invite"
  ON public.creator_invites FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read drafts"
  ON public.project_drafts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upsert drafts"
  ON public.project_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update drafts"
  ON public.project_drafts FOR UPDATE
  USING (true);
