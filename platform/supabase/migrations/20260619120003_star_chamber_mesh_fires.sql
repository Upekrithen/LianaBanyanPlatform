-- BP087 MAMBA-ε: star_chamber_mesh_fires table
-- Logs each Star Chamber benchmark verification fire (Ascending Andon escalations).
-- Three honest falsification criteria are recorded with every fire.
-- Used in THUNDERCLAP receipt for Star Chamber variance + outcome audit trail.
--
-- Canon: canon_star_chamber_mesh_integrated_verification_andon_escalation_bp087

CREATE TABLE IF NOT EXISTS star_chamber_mesh_fires (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id          TEXT        NOT NULL,
  domain               TEXT        NOT NULL,
  question             TEXT        NOT NULL,
  confidence_variance  NUMERIC(8,4),
  andon_threshold      NUMERIC(8,4),
  peer_answers_json    JSONB,
  star_chamber_answer  TEXT,         -- final Star Chamber answer letter (A-J)
  judge_answers        JSONB,        -- array of per-judge answer letters
  judge_confidences    JSONB,        -- array of per-judge confidence scores
  h_score              NUMERIC(8,6), -- H = Variance / 100; <= 0.15 = consensus
  consensus_reached    BOOLEAN       NOT NULL DEFAULT FALSE,
  falsification_criteria JSONB,      -- three FC strings pre-recorded before fire
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- RLS: service_role writes; anon reads (for receipt compilation)
ALTER TABLE star_chamber_mesh_fires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_star_chamber_mesh_fires"
  ON star_chamber_mesh_fires FOR SELECT
  USING (true);

CREATE POLICY "service_role_all_star_chamber_mesh_fires"
  ON star_chamber_mesh_fires FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_star_chamber_mesh_fires_dispatch
  ON star_chamber_mesh_fires (dispatch_id);

CREATE INDEX IF NOT EXISTS idx_star_chamber_mesh_fires_domain
  ON star_chamber_mesh_fires (domain, created_at DESC);

COMMENT ON TABLE star_chamber_mesh_fires IS
  'MAMBA-ε: each row = one Star Chamber benchmark verification fire triggered by '
  'Ascending Andon (peer confidence variance > threshold). '
  'Three falsification criteria pre-recorded per fire per canon. '
  'Used in THUNDERCLAP receipt audit trail.';
