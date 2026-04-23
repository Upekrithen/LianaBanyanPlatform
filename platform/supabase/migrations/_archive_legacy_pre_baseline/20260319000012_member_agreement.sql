-- ============================================================================
-- Migration: 20260319000012_member_agreement.sql
-- Session 41 Task B: Member Agreement acceptance tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_agreement_acceptances (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_version text NOT NULL,
  accepted_at       timestamptz DEFAULT now(),
  ip_address        text
);

ALTER TABLE member_agreement_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agreement_select_own" ON member_agreement_acceptances FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "agreement_insert_own" ON member_agreement_acceptances FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
