-- BP090 Marathon 11: License acceptance audit table
-- Records every explicit SSPL/Apache license acceptance from the Tower download page
-- and the Electron installer (Block 2 + Block 3 surfaces).
-- Canon anchor: canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086
-- "No silent install. Ever."
-- REVISED BP090 2026-06-21 ~22:00 Central: added phase_at_acceptance column + CHECK constraint.
-- SCHEMA UNCHANGED 2026-06-22: Block 4 schema is stable. T11 gate lives in Block 3 + edge function.

CREATE TABLE IF NOT EXISTS public.license_acceptances (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  accepted_at           timestamptz   NOT NULL DEFAULT now(),
  path_chosen           text          NOT NULL CHECK (path_chosen IN ('SSPL', 'Apache')),
  phase_at_acceptance   text          NOT NULL CHECK (phase_at_acceptance IN (
                                        'soft_launch',
                                        'window_1',
                                        'window_2',
                                        'window_3',
                                        'window_4',
                                        'window_5',
                                        'frand_only'
                                      )),
  ip_hash_optional      text,
  user_agent            text,
  mnemo_session_id      text,
  referrer_url          text,
  notes                 text,
  version_downloaded    text,
  build_date            date,
  founding_licensee_amount_paid   integer,
  founding_licensee_tier          text
);

-- RLS: anon INSERT only via RPC; service_role SELECT
ALTER TABLE public.license_acceptances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon_can_insert_acceptance" ON public.license_acceptances
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "service_can_read_acceptances" ON public.license_acceptances
    FOR SELECT USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_license_acceptances_path
  ON public.license_acceptances(path_chosen);
CREATE INDEX IF NOT EXISTS idx_license_acceptances_accepted_at
  ON public.license_acceptances(accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_acceptances_session
  ON public.license_acceptances(mnemo_session_id)
  WHERE mnemo_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_license_acceptances_phase
  ON public.license_acceptances(phase_at_acceptance);

-- RPC: log_license_acceptance
-- Called from Tower page JS and installer acceptance surface (anon-safe).
-- Server-side validates that p_phase_at_acceptance matches current date per Point #3 table.
CREATE OR REPLACE FUNCTION public.log_license_acceptance(
  p_path_chosen           text,
  p_phase_at_acceptance   text,
  p_ip_hash               text    DEFAULT NULL,
  p_user_agent            text    DEFAULT NULL,
  p_mnemo_session_id      text    DEFAULT NULL,
  p_referrer_url          text    DEFAULT NULL,
  p_notes                 text    DEFAULT NULL,
  p_version_downloaded    text    DEFAULT NULL,
  p_build_date            date    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id            uuid;
  v_server_phase  text;
  v_now           date := (NOW() AT TIME ZONE 'America/Chicago')::date;
BEGIN
  IF p_path_chosen NOT IN ('SSPL', 'Apache') THEN
    RAISE EXCEPTION 'Invalid path_chosen: %', p_path_chosen;
  END IF;

  IF p_phase_at_acceptance NOT IN (
    'soft_launch', 'window_1', 'window_2', 'window_3',
    'window_4', 'window_5', 'frand_only'
  ) THEN
    RAISE EXCEPTION 'Invalid phase_at_acceptance: %', p_phase_at_acceptance;
  END IF;

  v_server_phase := CASE
    WHEN v_now BETWEEN '2026-06-22' AND '2026-06-30' THEN 'soft_launch'
    WHEN v_now BETWEEN '2026-07-01' AND '2026-07-30' THEN 'window_1'
    WHEN v_now BETWEEN '2026-07-31' AND '2026-08-29' THEN 'window_2'
    WHEN v_now BETWEEN '2026-08-30' AND '2026-09-28' THEN 'window_3'
    WHEN v_now BETWEEN '2026-09-29' AND '2026-10-28' THEN 'window_4'
    WHEN v_now BETWEEN '2026-10-29' AND '2026-11-27' THEN 'window_5'
    ELSE 'frand_only'
  END;

  IF p_phase_at_acceptance != v_server_phase THEN
    RAISE EXCEPTION 'phase_at_acceptance mismatch: client claims %, server computes % for date %',
      p_phase_at_acceptance, v_server_phase, v_now;
  END IF;

  INSERT INTO public.license_acceptances (
    path_chosen,
    phase_at_acceptance,
    ip_hash_optional,
    user_agent,
    mnemo_session_id,
    referrer_url,
    notes,
    version_downloaded,
    build_date
  ) VALUES (
    p_path_chosen,
    v_server_phase,
    p_ip_hash,
    p_user_agent,
    p_mnemo_session_id,
    p_referrer_url,
    p_notes,
    p_version_downloaded,
    p_build_date
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_license_acceptance TO anon;
