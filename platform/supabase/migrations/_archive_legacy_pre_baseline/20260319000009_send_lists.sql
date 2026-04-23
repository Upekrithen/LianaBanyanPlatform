-- ============================================================================
-- Migration: 20260319000009_send_lists.sql
-- Session 39 Task B: Send Lists, Recipients, Audit trail
-- ============================================================================

-- ═══ SEND LISTS ═══
CREATE TABLE IF NOT EXISTS send_lists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  list_type   text NOT NULL CHECK (list_type IN ('cue_card', 'crown_letter', 'event_invitation', 'announcement')),
  description text,
  status      text NOT NULL CHECK (status IN ('draft', 'stamp_1', 'review', 'stamp_2', 'sending', 'sent')) DEFAULT 'draft',
  stamp_1_at  timestamptz,
  stamp_2_at  timestamptz,
  sent_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE send_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "send_lists_select_own" ON send_lists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "send_lists_insert_own" ON send_lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "send_lists_update_own" ON send_lists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "send_lists_delete_own" ON send_lists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ═══ SEND LIST RECIPIENTS ═══
CREATE TABLE IF NOT EXISTS send_list_recipients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_list_id    uuid NOT NULL REFERENCES send_lists(id) ON DELETE CASCADE,
  recipient_name  text NOT NULL,
  delivery_method text NOT NULL CHECK (delivery_method IN ('email', 'sms', 'in_platform')),
  delivery_address text,
  card_type       text,
  status          text NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed')) DEFAULT 'pending',
  sent_at         timestamptz
);

ALTER TABLE send_list_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "send_list_recipients_select_own" ON send_list_recipients FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM send_lists WHERE send_lists.id = send_list_recipients.send_list_id AND send_lists.user_id = auth.uid()));
CREATE POLICY "send_list_recipients_insert_own" ON send_list_recipients FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM send_lists WHERE send_lists.id = send_list_recipients.send_list_id AND send_lists.user_id = auth.uid()));
CREATE POLICY "send_list_recipients_update_own" ON send_list_recipients FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM send_lists WHERE send_lists.id = send_list_recipients.send_list_id AND send_lists.user_id = auth.uid()));
CREATE POLICY "send_list_recipients_delete_own" ON send_list_recipients FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM send_lists WHERE send_lists.id = send_list_recipients.send_list_id AND send_lists.user_id = auth.uid()));

-- ═══ SEND LIST AUDIT (append-only) ═══
CREATE TABLE IF NOT EXISTS send_list_audit (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_list_id  uuid REFERENCES send_lists(id) ON DELETE CASCADE,
  action        text NOT NULL,
  performed_by  uuid REFERENCES auth.users(id),
  performed_at  timestamptz DEFAULT now(),
  details       jsonb
);

ALTER TABLE send_list_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "send_list_audit_select_own" ON send_list_audit FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM send_lists WHERE send_lists.id = send_list_audit.send_list_id AND send_lists.user_id = auth.uid()));
CREATE POLICY "send_list_audit_insert_own" ON send_list_audit FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM send_lists WHERE send_lists.id = send_list_audit.send_list_id AND send_lists.user_id = auth.uid()));
