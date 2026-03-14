-- HexIsle Kickstarter waitlist (Session 11)
CREATE TABLE IF NOT EXISTS public.hexisle_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.hexisle_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert for waitlist"
  ON public.hexisle_waitlist FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role full access"
  ON public.hexisle_waitlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.hexisle_waitlist IS 'Email signups for HexIsle Kickstarter launch notification';
