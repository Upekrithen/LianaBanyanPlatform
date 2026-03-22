-- Calendar system — FullCalendar-powered personal/business/family calendar
-- Innovation references: #1859, #1865-#1868

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_type TEXT NOT NULL CHECK (calendar_type IN (
    'personal', 'family', 'business', 'coalition', 'route', 'defense', 'education'
  )),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  location TEXT,
  color TEXT,
  source_type TEXT CHECK (source_type IS NULL OR source_type IN (
    'manual', 'storefront', 'subscription', 'order_cutoff', 'delivery_window', 'beacon'
  )),
  source_id UUID,
  is_private BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_owner_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_type TEXT NOT NULL,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id),
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(calendar_owner_id, calendar_type, shared_with_id)
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_events" ON calendar_events
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "shared_users_view" ON calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calendar_shares
      WHERE shared_with_id = auth.uid()
        AND calendar_owner_id = calendar_events.owner_id
        AND calendar_type = calendar_events.calendar_type
    )
  );

CREATE POLICY "admin_manage_events" ON calendar_events
  FOR ALL USING (public.is_admin());

CREATE POLICY "owners_manage_shares" ON calendar_shares
  FOR ALL USING (auth.uid() = calendar_owner_id);

CREATE INDEX idx_calendar_events_owner ON calendar_events(owner_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(calendar_type);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);
CREATE INDEX idx_calendar_shares_shared ON calendar_shares(shared_with_id);
