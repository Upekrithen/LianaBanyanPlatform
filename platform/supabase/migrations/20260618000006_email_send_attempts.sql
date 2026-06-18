-- BP086 BLACK MAMBA Amendment · email_send_attempts table
-- Tracks share-from-mnemosynec sends, including deferred rows when
-- mnemosynec.org domain is still verifying with Resend.
-- recipient_email stored server-side only; service_role RLS enforced.

CREATE TABLE IF NOT EXISTS email_send_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_hash text NOT NULL,
  sender_ip_hash text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'deferred-domain-verifying', 'failed')),
  error_detail text,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE(recipient_hash, sender_ip_hash)
);

ALTER TABLE email_send_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_send_service_only
  ON email_send_attempts
  FOR ALL
  TO service_role
  USING (true);
