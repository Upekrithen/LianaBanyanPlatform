-- member_preference_inferred RLS
-- BP087 Wave 3 SEG-G1 - Knight ships - Bishop applies via psql
--
-- IDENTITY COLUMN: member_user_id (UUID REFERENCES auth.users(id))
-- Confirmed from migration 20260619000002_bp087_substrate_market_preference_inferred.sql
--
-- PRE-EXISTING STATE NOTE:
-- Migration 20260619000002 already includes:
--   ALTER TABLE member_preference_inferred ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "member_own_preferences" FOR ALL USING (auth.uid() = member_user_id);
--   CREATE POLICY "service_role_full_pref" FOR ALL USING (auth.role() = 'service_role');
-- If that migration has already been applied, the broad FOR ALL policy exists.
-- Drop it first before adding granular policies to avoid overlapping permissive policies.
-- If the migration has NOT been applied yet, the DROP will be a no-op (IF EXISTS).

ALTER TABLE member_preference_inferred ENABLE ROW LEVEL SECURITY;

-- Drop broad FOR ALL policy if it exists (replaced by granular policies below)
DROP POLICY IF EXISTS "member_own_preferences" ON member_preference_inferred;

CREATE POLICY "member_preference_inferred_authenticated_select_own"
  ON member_preference_inferred
  FOR SELECT
  TO authenticated
  USING (auth.uid() = member_user_id);

CREATE POLICY "member_preference_inferred_authenticated_delete_own"
  ON member_preference_inferred
  FOR DELETE
  TO authenticated
  USING (auth.uid() = member_user_id);

CREATE POLICY "member_preference_inferred_authenticated_update_own"
  ON member_preference_inferred
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = member_user_id)
  WITH CHECK (auth.uid() = member_user_id);

-- service_role_full_pref remains from migration (covers INSERT + service writes).
-- If service_role_full_pref was not applied yet, re-create it:
CREATE POLICY "service_role_full_pref" ON member_preference_inferred
  FOR ALL USING (auth.role() = 'service_role');
