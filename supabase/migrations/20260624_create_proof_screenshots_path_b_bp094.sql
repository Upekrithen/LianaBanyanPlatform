CREATE TABLE public.proof_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_ref_id text NOT NULL,
  title text NOT NULL,
  caption text,
  storage_path text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  member_only boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_proof_screenshots_proof_ref ON public.proof_screenshots(proof_ref_id, display_order);
ALTER TABLE public.proof_screenshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY proof_screenshots_anon_select_pinned ON public.proof_screenshots
  FOR SELECT TO anon
  USING (is_pinned = true AND member_only = false);
CREATE POLICY proof_screenshots_auth_select_all ON public.proof_screenshots
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY proof_screenshots_service_role_all ON public.proof_screenshots
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
