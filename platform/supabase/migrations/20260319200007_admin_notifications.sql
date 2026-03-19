-- Admin Notifications System
-- Stores platform events for admin dashboard visibility + email escalation
-- Used by: admin-notify edge function, MoneyPenny dashboard

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_notifications_unread ON admin_notifications (read, created_at DESC) WHERE read = FALSE;
CREATE INDEX idx_admin_notifications_severity ON admin_notifications (severity, created_at DESC);
CREATE INDEX idx_admin_notifications_event_type ON admin_notifications (event_type, created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read all notifications
CREATE POLICY "Admins read all notifications"
  ON admin_notifications FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- Admins can update (mark as read)
CREATE POLICY "Admins update notifications"
  ON admin_notifications FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- Service role inserts (edge functions use service key)
CREATE POLICY "Service role inserts notifications"
  ON admin_notifications FOR INSERT
  WITH CHECK (TRUE);

-- Seed: mark the system as initialized
INSERT INTO admin_notifications (event_type, severity, title, details)
VALUES (
  'system_init',
  'low',
  'Admin Notification System Initialized',
  '{"session": 50, "date": "2026-03-19"}'::jsonb
);
