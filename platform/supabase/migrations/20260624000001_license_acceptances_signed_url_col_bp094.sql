-- BP094 Marathon 11 Block 3: Add signed_url_issued_at to license_acceptances
-- T11 server-side gate: marks when a signed download URL was issued for an acceptance record.
ALTER TABLE public.license_acceptances
  ADD COLUMN IF NOT EXISTS signed_url_issued_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_license_acceptances_signed_url
  ON public.license_acceptances(signed_url_issued_at)
  WHERE signed_url_issued_at IS NOT NULL;
