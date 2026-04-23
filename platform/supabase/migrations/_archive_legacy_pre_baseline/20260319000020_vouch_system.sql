-- ============================================================================
-- Migration: 20260319000020_vouch_system.sql
-- Session 45 Task B: Vouch / Recommend + Crown Letter delegation chains
-- ============================================================================

CREATE TABLE IF NOT EXISTS vouches (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vouchee_name            text NOT NULL,
  vouchee_email           text,
  vouch_type              text NOT NULL CHECK (vouch_type IN ('vouch','recommend')),
  relationship            text NOT NULL,
  reason                  text NOT NULL,
  strength                integer NOT NULL CHECK (strength >= 1 AND strength <= 5),
  original_crown_letter_id uuid,
  status                  text NOT NULL CHECK (status IN ('pending','accepted','declined','expired')) DEFAULT 'pending',
  created_at              timestamptz DEFAULT now()
);

ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouches_select_own" ON vouches FOR SELECT TO authenticated USING (auth.uid() = voucher_user_id);
CREATE POLICY "vouches_insert_own" ON vouches FOR INSERT TO authenticated WITH CHECK (auth.uid() = voucher_user_id);
CREATE POLICY "vouches_update_own" ON vouches FOR UPDATE TO authenticated USING (auth.uid() = voucher_user_id) WITH CHECK (auth.uid() = voucher_user_id);
CREATE POLICY "vouches_delete_own" ON vouches FOR DELETE TO authenticated USING (auth.uid() = voucher_user_id);

CREATE TABLE IF NOT EXISTS crown_letter_delegations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id    uuid NOT NULL,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id   uuid REFERENCES auth.users(id),
  to_name      text NOT NULL,
  to_email     text,
  action       text NOT NULL CHECK (action IN ('accept','delegate','pass_along','recommend')),
  message      text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE crown_letter_delegations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cld_select_participant" ON crown_letter_delegations FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "cld_insert_own" ON crown_letter_delegations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);
