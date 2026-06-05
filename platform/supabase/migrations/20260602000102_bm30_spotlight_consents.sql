-- BM30 Scope 30: Spotlight / Eyewitness consent table
-- Members who agree to be featured earn Marks; consent is stamped to the IP Ledger.

CREATE TABLE IF NOT EXISTS public.spotlight_consents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consented_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  marks_granted    INTEGER DEFAULT 50 NOT NULL,
  ip_ledger_stamp  TEXT,  -- sha256(member_id || consented_at ISO string)
  story_title      TEXT,
  revoked_at       TIMESTAMPTZ
);

COMMENT ON TABLE public.spotlight_consents IS
  'Records member consent to be featured in the Eyewitness: Your Story cooperative spotlight program. '
  'Marks represent participation in the cooperative story -- not equity, shares, or investment returns.';

ALTER TABLE public.spotlight_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own spotlight consents"
  ON public.spotlight_consents FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Members can insert own spotlight consents"
  ON public.spotlight_consents FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admins can read all spotlight consents"
  ON public.spotlight_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND membership_status IN ('admin', 'staff')
    )
  );
