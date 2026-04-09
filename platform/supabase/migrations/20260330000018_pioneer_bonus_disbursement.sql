-- K189: Pioneer Bonus Disbursement (#2112)
-- Automated monthly Mark bonuses for all Pioneer tiers.

CREATE TABLE IF NOT EXISTS pioneer_bonus_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pioneer_id UUID REFERENCES pioneers(id) NOT NULL,
  member_id UUID NOT NULL,
  role TEXT NOT NULL,
  tier TEXT NOT NULL,
  bonus_marks INTEGER NOT NULL,
  billing_month TEXT NOT NULL,
  status TEXT DEFAULT 'disbursed'
    CHECK (status IN ('disbursed', 'skipped', 'expired')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pioneer_id, billing_month)
);

CREATE INDEX IF NOT EXISTS idx_pioneer_bonus_log_member ON pioneer_bonus_log(member_id);
CREATE INDEX IF NOT EXISTS idx_pioneer_bonus_log_month ON pioneer_bonus_log(billing_month);

ALTER TABLE pioneer_bonus_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own bonus log"
  ON pioneer_bonus_log FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Service role can insert bonus log"
  ON pioneer_bonus_log FOR INSERT
  WITH CHECK (true);

-- pg_cron: monthly disbursement on 1st of each month at 00:05 UTC
-- Falls back to manual admin trigger in AdminEscrowDashboard if pg_cron/pg_net not available
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND
     EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM cron.schedule(
      'pioneer-bonus-monthly',
      '5 0 1 * *',
      $cron$SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/disburse-pioneer-bonuses',
        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
        body := '{}'::jsonb
      )$cron$
    );
    RAISE NOTICE 'pg_cron job pioneer-bonus-monthly scheduled';
  ELSE
    RAISE NOTICE 'pg_cron or pg_net not available — use manual admin trigger in AdminEscrowDashboard';
  END IF;
END $outer$;

-- Innovation log
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (2112, 'Pioneer Bonus Disbursement Engine', 'Automated monthly Mark bonus system for Pioneer tiers. Founders'' Circle gets 50 Marks/month for 12 months, Trailblazers 25/month for 6, Pathfinders 15/month for 3, Early Adopters 5 Marks one-time. Edge Function processes all eligible pioneers with dedup via unique constraint. Admin trigger in dashboard, member-facing bonus history in Helm.', 'economic_engine', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;

-- Canonical stats bump
UPDATE platform_canonical SET value = 2112 WHERE key = 'innovation_count';
