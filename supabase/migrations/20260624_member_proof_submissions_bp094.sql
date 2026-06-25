-- BP094 2026-06-24: Member proof submissions with cryptographic provenance vetting
-- No em-dashes in comments per canon feedback_no_em_dashes_anywhere

CREATE TABLE public.member_proof_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES auth.users(id),
  harness_version text NOT NULL,
  questions_attempted integer NOT NULL,
  questions_correct integer NOT NULL,
  accuracy numeric(5,2) NOT NULL,
  wall_clock_seconds integer NOT NULL,
  result_json_storage_path text NOT NULL,
  member_signature_ed25519 text NOT NULL,
  signature_verified boolean NOT NULL DEFAULT false,
  posse_spot_check_status text NOT NULL DEFAULT 'pending',
  posse_spot_check_match boolean,
  ip_ledger_stamp_id text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_mps_accuracy_desc ON public.member_proof_submissions(accuracy DESC);
CREATE INDEX idx_mps_member_id ON public.member_proof_submissions(member_id);
CREATE INDEX idx_mps_submitted_at ON public.member_proof_submissions(submitted_at DESC);
CREATE INDEX idx_mps_verified ON public.member_proof_submissions(signature_verified, posse_spot_check_status);

ALTER TABLE public.member_proof_submissions ENABLE ROW LEVEL SECURITY;

-- Anon: only see verified + passed rows
CREATE POLICY mps_anon_select_verified ON public.member_proof_submissions
  FOR SELECT TO anon
  USING (signature_verified = true AND posse_spot_check_status = 'passed');

-- Authenticated: insert own rows only
CREATE POLICY mps_auth_insert_own ON public.member_proof_submissions
  FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid());

-- Authenticated: see all rows (including own pending/flagged)
CREATE POLICY mps_auth_select_all ON public.member_proof_submissions
  FOR SELECT TO authenticated
  USING (true);

-- Service role: full access for edge functions and admin
CREATE POLICY mps_service_role_all ON public.member_proof_submissions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
