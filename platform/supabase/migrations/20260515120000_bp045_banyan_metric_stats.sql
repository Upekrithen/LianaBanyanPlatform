-- ════════════════════════════════════════════════════════════════════════════
-- BP045 W1 — Banyan Metric Aggregate Stats
-- Powers live /download/ numbers. Honest-Alpha variance-bands.
-- SEG-DIG-E · cooperative-class peer-class member-class infrastructure-design
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.banyan_metric_stats (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bp_session                TEXT        NOT NULL,
  iteration_name            TEXT        NOT NULL,
  iteration_ordinal         INT         NOT NULL CHECK (iteration_ordinal BETWEEN 1 AND 50),
  metric_axis               TEXT        NOT NULL,
  value_low                 NUMERIC     NOT NULL,
  value_high                NUMERIC     NOT NULL CHECK (value_high >= value_low),
  value_point               NUMERIC,
  unit                      TEXT        NOT NULL CHECK (unit IN (
    'multiplier','dollars_per_year','percent','boolean','count','ms','tokens','ratio','x_faster','x_cheaper'
  )),
  display_label             TEXT,
  display_format            TEXT,
  receipt_ref               TEXT        NOT NULL,
  receipt_sha256            TEXT,
  computed_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  bp_session_closed_at      TIMESTAMPTZ,
  honest_alpha_methodology  TEXT        NOT NULL,
  publication_status        TEXT        NOT NULL DEFAULT 'draft' CHECK (publication_status IN (
    'draft','bishop_vetted','founder_ratified','published','superseded'
  )),
  superseded_by_id          UUID        REFERENCES public.banyan_metric_stats(id) ON DELETE SET NULL,
  founder_ratified_at       TIMESTAMPTZ,
  founder_ratified_quote    TEXT,
  notes                     TEXT,
  created_by                TEXT
);

CREATE INDEX IF NOT EXISTS idx_bms_published
  ON public.banyan_metric_stats (iteration_name, metric_axis)
  WHERE publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_bms_bp_session
  ON public.banyan_metric_stats (bp_session);

CREATE INDEX IF NOT EXISTS idx_bms_iteration_axis
  ON public.banyan_metric_stats (iteration_name, metric_axis, computed_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_bms_published_axis
  ON public.banyan_metric_stats (iteration_name, metric_axis)
  WHERE publication_status = 'published';

-- Companion view — surfaces only published rows for anon/authenticated readers
CREATE OR REPLACE VIEW public.v_banyan_metric_current AS
SELECT
  iteration_name,
  iteration_ordinal,
  metric_axis,
  value_low,
  value_high,
  value_point,
  unit,
  display_label,
  display_format,
  receipt_ref,
  bp_session,
  founder_ratified_at
FROM public.banyan_metric_stats
WHERE publication_status = 'published'
ORDER BY iteration_ordinal, metric_axis;

-- ────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────
ALTER TABLE public.banyan_metric_stats ENABLE ROW LEVEL SECURITY;

-- Public can read only published rows
CREATE POLICY "public_read_published" ON public.banyan_metric_stats
  FOR SELECT
  USING (publication_status IN ('published', 'founder_ratified'));

-- service_role has full access (Knight CI, Bishop threshing, Founder SQL)
CREATE POLICY "service_role_full" ON public.banyan_metric_stats
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant read access to view and base table
GRANT SELECT ON public.v_banyan_metric_current TO anon, authenticated;
GRANT SELECT ON public.banyan_metric_stats TO anon, authenticated;

-- ────────────────────────────────────────────────
-- Seed data — Cumulative (FOUNDER_RATIFIED · DIG-G)
-- ────────────────────────────────────────────────
INSERT INTO public.banyan_metric_stats (
  bp_session, iteration_name, iteration_ordinal, metric_axis,
  value_low, value_high, unit,
  display_label, display_format,
  receipt_ref, honest_alpha_methodology,
  publication_status, created_by, notes
) VALUES (
  'BP045_W1', 'Mnemosyne', 5, 'cumulative_amplification',
  60000000, 100000000, 'multiplier',
  'Cumulative Banyan Metric BP039→BP045 W1', '{low}M×–{high}M×',
  'BISHOP_DROPZONE/00_FOUNDER_REVIEW/DIG_G_BANYAN_METRIC_CUMULATIVE_BP039_BP045_RECEIPT.md',
  'Method C terminal-state with trajectory-as-evidence · per banyan_metric_method_c_canon_bp045 · six-session substrate-resident · floor exceeds CAI-9.6 55.9M× by 7%',
  'founder_ratified', 'bishop',
  'Cumulative-class · cooperative-class peer-witness · floor 60M×, ceiling 100M×, midpoint ~75M× · DIG-G filed'
);

-- ────────────────────────────────────────────────
-- Seed data — Pick-Six (DRAFT · pending Founder ratification)
-- ────────────────────────────────────────────────
INSERT INTO public.banyan_metric_stats (
  bp_session, iteration_name, iteration_ordinal, metric_axis,
  value_low, value_high, unit,
  display_label, display_format,
  receipt_ref, honest_alpha_methodology,
  publication_status, created_by, notes
) VALUES
  ('BP045_W1', 'Mnemosyne', 5, 'speed',
   1500, 3500, 'x_faster',
   'Speed · Mnemosyne', '{low}×–{high}×',
   'BISHOP_DROPZONE/00_FOUNDER_REVIEW/DIG_D_BANYAN_METRIC_BP045_W1_EMPIRICAL_RECEIPT.md',
   'Conservative speed band: 281-906 person-hr equiv ÷ 6-10 hr Founder-active · substrate-difficulty-adjusted · ceiling outliers excluded · DIG-D §4',
   'draft', 'bishop', 'Pick-Six card 1'),

  ('BP045_W1', 'Mnemosyne', 5, 'cost_reduction',
   3000, 10000, 'x_cheaper',
   'Cost Reduction · Mnemosyne', '{low}×–{high}×',
   'BISHOP_DROPZONE/00_FOUNDER_REVIEW/DIG_D_BANYAN_METRIC_BP045_W1_EMPIRICAL_RECEIPT.md',
   'Conservative cost band: $25-50 API spend vs $56,200-$362,400 conventional equivalent · infra-spend dilution applied · DIG-D §5',
   'draft', 'bishop', 'Pick-Six card 2'),

  ('BP045_W1', 'Mnemosyne', 5, 'accuracy',
   1.7, 2.1, 'multiplier',
   'Accuracy · Mnemosyne', '{low}×–{high}×',
   'BISHOP_DROPZONE/00_FOUNDER_REVIEW/DIG_D_BANYAN_METRIC_BP045_W1_EMPIRICAL_RECEIPT.md',
   'BP044 W1 anchor 2.0× · AUGUR violations observed → ceiling trimmed · Honest-Alpha penalty applied · DIG-D §6',
   'draft', 'bishop', 'Honest-Alpha trimmed · Pick-Six card 3'),

  ('BP045_W1', 'Mnemosyne', 5, 'free_forever',
   1, 1, 'boolean',
   'Free Forever · AGPL', '{value}',
   'CANON immutable $5/yr membership · AGPL license',
   'Founder-direct invariant · AGPL license · $5/yr cooperative membership · no per-use charge',
   'draft', 'bishop', 'AGPL · Pick-Six card 4'),

  ('BP045_W1', 'Mnemosyne', 5, 'immutable_backup',
   1, 1, 'boolean',
   'Immutable Backup · Eblets survive crashes', '{value}',
   'BISHOP_DROPZONE/00_FOUNDER_REVIEW/DIG_G_BANYAN_METRIC_CUMULATIVE_BP039_BP045_RECEIPT.md',
   'Eblet substrate persists across session crashes · append-only Cathedral architecture · crash-proof by construction',
   'draft', 'bishop', 'Eblets survive crashes · Pick-Six card 5'),

  ('BP045_W1', 'Mnemosyne', 5, 'federation_sharing',
   1, 1, 'boolean',
   'Federation Sharing · Peer-mesh', '{value}',
   'BISHOP_DROPZONE/00_FOUNDER_REVIEW/DIG_G_BANYAN_METRIC_CUMULATIVE_BP039_BP045_RECEIPT.md',
   'Peer-mesh cooperative federation · Dandelion Dispersion doctrine · cross-node substrate sharing architecture',
   'draft', 'bishop', 'Peer-mesh · Pick-Six card 6');
