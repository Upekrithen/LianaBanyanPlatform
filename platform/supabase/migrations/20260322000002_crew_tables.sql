-- Crew Tables: collaborative project assembly on BandWagon
-- Innovation references: #1886-#1896 (Arena/Crew Table/Ghost Marks)

CREATE TABLE IF NOT EXISTS crew_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  template_type TEXT,
  treasure_map_ref TEXT,
  stage_current INT DEFAULT 1,
  stage_1_items JSONB DEFAULT '[]',
  stage_2_items JSONB DEFAULT '[]',
  stage_3_items JSONB DEFAULT '[]',
  min_seats_to_activate INT DEFAULT 3,
  is_active BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crew_table_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES crew_tables(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  slot_type TEXT NOT NULL DEFAULT 'primary',
  member_id UUID REFERENCES auth.users(id),
  seated_at TIMESTAMPTZ,
  payment_amount DECIMAL(10,2),
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crew_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_table_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tables" ON crew_tables
  FOR SELECT USING (true);

CREATE POLICY "Creators manage own tables" ON crew_tables
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Admin manages all tables" ON crew_tables
  FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view seats" ON crew_table_seats
  FOR SELECT USING (true);

CREATE POLICY "Members can claim open seats" ON crew_table_seats
  FOR UPDATE USING (member_id IS NULL OR auth.uid() = member_id);

CREATE POLICY "Admin manages all seats" ON crew_table_seats
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_crew_tables_creator ON crew_tables(creator_id);
CREATE INDEX idx_crew_tables_active ON crew_tables(is_active);
CREATE INDEX idx_crew_table_seats_table ON crew_table_seats(table_id);
CREATE INDEX idx_crew_table_seats_member ON crew_table_seats(member_id);

-- Auto-activate table when min seats are filled
CREATE OR REPLACE FUNCTION check_crew_table_activation()
RETURNS TRIGGER AS $$
DECLARE
  filled_count INT;
  min_seats INT;
BEGIN
  IF NEW.member_id IS NOT NULL AND (OLD IS NULL OR OLD.member_id IS NULL) THEN
    SELECT COUNT(*) INTO filled_count
    FROM crew_table_seats
    WHERE table_id = NEW.table_id
      AND member_id IS NOT NULL
      AND is_required = true;

    SELECT ct.min_seats_to_activate INTO min_seats
    FROM crew_tables ct
    WHERE ct.id = NEW.table_id;

    IF filled_count >= min_seats THEN
      UPDATE crew_tables
      SET is_active = true, updated_at = now()
      WHERE id = NEW.table_id AND is_active = false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crew_seat_activation_check
  AFTER UPDATE ON crew_table_seats
  FOR EACH ROW
  EXECUTE FUNCTION check_crew_table_activation();
