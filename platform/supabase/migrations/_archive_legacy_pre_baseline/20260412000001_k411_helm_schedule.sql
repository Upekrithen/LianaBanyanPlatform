-- K411 Helm Schedule / MoneyPenny Reminders (Phase 1)
-- Innovation #2248 (Hemispheric Protocol composition) + #2257 (Glove email channel)
-- Bishop B099 spec: HELM_SCHEDULE_MONEYPENNY_REMINDERS_SPEC_B099.md

CREATE TABLE IF NOT EXISTS helm_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  fire_at TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'sms', 'in_app', 'all')),
  priority_tier SMALLINT DEFAULT 5,
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'fired', 'snoozed', 'completed', 'cancelled', 'failed')),
  source_kind TEXT,
  source_ref TEXT,
  recurrence_rule TEXT,
  hemispheric_aware BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fired_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_helm_tasks_member_state ON helm_tasks (member_id, state);
CREATE INDEX idx_helm_tasks_fire_at ON helm_tasks (fire_at) WHERE state = 'pending';

CREATE TABLE IF NOT EXISTS helm_task_dispatch_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES helm_tasks(task_id) ON DELETE CASCADE,
  dispatched_at TIMESTAMPTZ DEFAULT now(),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  external_id TEXT
);

CREATE INDEX idx_helm_task_dispatch_log_task ON helm_task_dispatch_log (task_id);

-- Founder's tasks default to hemispheric_aware = TRUE
CREATE OR REPLACE FUNCTION set_founder_hemispheric_aware()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_id = (SELECT id FROM auth.users WHERE email = 'jonathan@lianabanyan.com' LIMIT 1) THEN
    NEW.hemispheric_aware := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_helm_tasks_founder_hemispheric
BEFORE INSERT ON helm_tasks
FOR EACH ROW
EXECUTE FUNCTION set_founder_hemispheric_aware();

-- Hemispheric grid validator: Phase 1 (Founder hardcoded grid)
CREATE OR REPLACE FUNCTION is_valid_hemispheric_slot(
  p_member_id UUID,
  p_fire_at TIMESTAMPTZ
) RETURNS TABLE(is_valid BOOLEAN, next_valid TIMESTAMPTZ) AS $$
DECLARE
  v_local_time TIMESTAMP;
  v_dow INT;
  v_hour INT;
  v_founder_id UUID;
BEGIN
  SELECT id INTO v_founder_id FROM auth.users WHERE email = 'jonathan@lianabanyan.com' LIMIT 1;

  IF p_member_id != v_founder_id THEN
    RETURN QUERY SELECT TRUE, p_fire_at;
    RETURN;
  END IF;

  v_local_time := p_fire_at AT TIME ZONE 'America/Chicago';
  v_dow := EXTRACT(DOW FROM v_local_time);   -- 0=Sun, 6=Sat
  v_hour := EXTRACT(HOUR FROM v_local_time);

  -- Saturday and Sunday = family time (HARD STOP)
  IF v_dow IN (0, 6) THEN
    RETURN QUERY SELECT FALSE,
      (date_trunc('day', v_local_time) + INTERVAL '1 day' + INTERVAL '8 hours') AT TIME ZONE 'America/Chicago';
    RETURN;
  END IF;

  -- Quiet hours: 10pm-6am local
  IF v_hour < 6 OR v_hour >= 22 THEN
    IF v_hour >= 22 THEN
      RETURN QUERY SELECT FALSE,
        (date_trunc('day', v_local_time) + INTERVAL '1 day' + INTERVAL '8 hours') AT TIME ZONE 'America/Chicago';
    ELSE
      RETURN QUERY SELECT FALSE,
        (date_trunc('day', v_local_time) + INTERVAL '8 hours') AT TIME ZONE 'America/Chicago';
    END IF;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, p_fire_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS
ALTER TABLE helm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY helm_tasks_member_select ON helm_tasks FOR SELECT
  USING (auth.uid() = member_id);
CREATE POLICY helm_tasks_member_insert ON helm_tasks FOR INSERT
  WITH CHECK (auth.uid() = member_id);
CREATE POLICY helm_tasks_member_update ON helm_tasks FOR UPDATE
  USING (auth.uid() = member_id);
CREATE POLICY helm_tasks_member_delete ON helm_tasks FOR DELETE
  USING (auth.uid() = member_id);

ALTER TABLE helm_task_dispatch_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY helm_task_dispatch_log_member_select ON helm_task_dispatch_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM helm_tasks t
      WHERE t.task_id = helm_task_dispatch_log.task_id
        AND t.member_id = auth.uid()
    )
  );

-- Service role bypass for edge functions dispatching tasks
CREATE POLICY helm_tasks_service_all ON helm_tasks FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY helm_task_dispatch_log_service_all ON helm_task_dispatch_log FOR ALL
  USING (auth.role() = 'service_role');
