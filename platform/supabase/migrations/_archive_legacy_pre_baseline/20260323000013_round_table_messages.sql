-- Round Table Messages: real-time text discussion for Crew Tables
-- Enables team communication when assembling around a Treasure Map

CREATE TABLE IF NOT EXISTS round_table_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES crew_tables(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rtm_table_id ON round_table_messages(table_id);
CREATE INDEX idx_rtm_created ON round_table_messages(created_at);

ALTER TABLE round_table_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Table participants see messages" ON round_table_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT member_id FROM crew_table_seats WHERE table_id = round_table_messages.table_id AND member_id IS NOT NULL
    )
    OR auth.uid() IN (
      SELECT creator_id FROM crew_tables WHERE id = round_table_messages.table_id
    )
    OR public.is_admin()
  );

CREATE POLICY "Table participants post messages" ON round_table_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      auth.uid() IN (
        SELECT member_id FROM crew_table_seats WHERE table_id = round_table_messages.table_id AND member_id IS NOT NULL
      )
      OR auth.uid() IN (
        SELECT creator_id FROM crew_tables WHERE id = round_table_messages.table_id
      )
      OR public.is_admin()
    )
  );

-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE round_table_messages;
