-- 20260619000002_bp087_substrate_market_preference_inferred.sql
-- MAMBA-SM-beta: member_preference_inferred CREATE
-- NEVER populated from questionnaire data. Inferred from natural opt-in interaction only.
-- Per canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086
-- Knight ships. Bishop applies via psql.

CREATE TABLE IF NOT EXISTS member_preference_inferred (
  member_user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_tag          TEXT NOT NULL,
  weight_decimal     NUMERIC(5,4) NOT NULL DEFAULT 0.0
    CHECK (weight_decimal >= 0 AND weight_decimal <= 1),
  last_observation_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observation_count  INT NOT NULL DEFAULT 1,
  PRIMARY KEY (member_user_id, topic_tag)
);

COMMENT ON TABLE member_preference_inferred IS
  'NEVER populated from questionnaire data. Inferred from natural opt-in interaction only. Per canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086.';

CREATE INDEX IF NOT EXISTS idx_mpi_user_weight ON member_preference_inferred(member_user_id, weight_decimal DESC);
CREATE INDEX IF NOT EXISTS idx_mpi_topic ON member_preference_inferred(topic_tag);

ALTER TABLE member_preference_inferred ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_own_preferences" ON member_preference_inferred
  FOR ALL USING (auth.uid() = member_user_id);

CREATE POLICY "service_role_full_pref" ON member_preference_inferred
  FOR ALL USING (auth.role() = 'service_role');

-- Upsert function with decay
CREATE OR REPLACE FUNCTION upsert_member_preference_inferred(
  p_member_user_id UUID,
  p_topic_tag TEXT,
  p_weight_delta NUMERIC
) RETURNS void AS $$
DECLARE
  v_days_elapsed NUMERIC;
  v_new_weight NUMERIC;
BEGIN
  -- If row exists: decay existing weight by 0.95^(days_elapsed) then add delta, clamp [0,1]
  IF EXISTS (SELECT 1 FROM member_preference_inferred WHERE member_user_id = p_member_user_id AND topic_tag = p_topic_tag) THEN
    SELECT EXTRACT(EPOCH FROM (NOW() - last_observation_at)) / 86400.0 INTO v_days_elapsed
    FROM member_preference_inferred
    WHERE member_user_id = p_member_user_id AND topic_tag = p_topic_tag;

    SELECT GREATEST(0, LEAST(1, weight_decimal * POWER(0.95, v_days_elapsed) + p_weight_delta)) INTO v_new_weight
    FROM member_preference_inferred
    WHERE member_user_id = p_member_user_id AND topic_tag = p_topic_tag;

    UPDATE member_preference_inferred
    SET weight_decimal = v_new_weight,
        last_observation_at = NOW(),
        observation_count = observation_count + 1
    WHERE member_user_id = p_member_user_id AND topic_tag = p_topic_tag;
  ELSE
    INSERT INTO member_preference_inferred(member_user_id, topic_tag, weight_decimal)
    VALUES (p_member_user_id, p_topic_tag, GREATEST(0, LEAST(1, p_weight_delta)));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
