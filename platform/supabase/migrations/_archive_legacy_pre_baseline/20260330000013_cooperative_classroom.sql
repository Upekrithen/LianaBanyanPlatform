-- Cooperative Classroom (Innovation #2103)
-- K183 — Home Teaching via Zoom: group subscriptions + individual tutoring
-- Teacher keeps 83.3%. Platform hosts zero video. Zoom handles delivery.

-- ════════════════════════════════════════════
-- 1. Teacher Profiles
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  subjects TEXT[] NOT NULL,
  qualifications TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  bio TEXT,
  hourly_rate NUMERIC CHECK (hourly_rate > 0),
  group_rate NUMERIC CHECK (group_rate > 0),
  zoom_link TEXT,
  pioneer_number INTEGER CHECK (pioneer_number BETWEEN 1 AND 10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active teachers"
  ON teacher_profiles FOR SELECT
  USING (active = true);

CREATE POLICY "Teachers manage own profile"
  ON teacher_profiles FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE INDEX idx_teacher_profiles_subjects ON teacher_profiles USING GIN (subjects);
CREATE INDEX idx_teacher_profiles_languages ON teacher_profiles USING GIN (languages);
CREATE INDEX idx_teacher_profiles_active ON teacher_profiles(active) WHERE active = true;

-- ════════════════════════════════════════════
-- 2. Teacher Schedule
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS teacher_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('group_class', 'individual', 'unavailable')),
  group_class_title TEXT,
  max_students INTEGER DEFAULT 15,
  recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE teacher_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teacher schedules"
  ON teacher_schedule FOR SELECT
  USING (true);

CREATE POLICY "Teachers manage own schedule"
  ON teacher_schedule FOR ALL
  USING (
    teacher_id IN (SELECT id FROM teacher_profiles WHERE member_id = auth.uid())
  )
  WITH CHECK (
    teacher_id IN (SELECT id FROM teacher_profiles WHERE member_id = auth.uid())
  );

CREATE INDEX idx_teacher_schedule_teacher ON teacher_schedule(teacher_id);
CREATE INDEX idx_teacher_schedule_day ON teacher_schedule(day_of_week, slot_type);

-- ════════════════════════════════════════════
-- 3. Class Bookings
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  teacher_id UUID REFERENCES teacher_profiles(id) NOT NULL,
  schedule_slot_id UUID REFERENCES teacher_schedule(id),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('individual', 'group_subscription')),
  subscription_id UUID,
  booking_date DATE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  zoom_link TEXT,
  amount_paid NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'marks' CHECK (currency IN ('marks', 'credits', 'joules', 'dollars')),
  creator_amount NUMERIC DEFAULT 0,
  platform_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own bookings"
  ON class_bookings FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers see bookings for their classes"
  ON class_bookings FOR SELECT
  USING (
    teacher_id IN (SELECT id FROM teacher_profiles WHERE member_id = auth.uid())
  );

CREATE POLICY "Students manage own bookings"
  ON class_bookings FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE INDEX idx_class_bookings_student ON class_bookings(student_id);
CREATE INDEX idx_class_bookings_teacher ON class_bookings(teacher_id);
CREATE INDEX idx_class_bookings_date ON class_bookings(booking_date) WHERE status = 'confirmed';

-- ════════════════════════════════════════════
-- 4. Auto-assign pioneer number to first 10 teachers
-- ════════════════════════════════════════════
CREATE OR REPLACE FUNCTION assign_teacher_pioneer()
RETURNS TRIGGER AS $$
DECLARE
  next_pioneer INTEGER;
BEGIN
  SELECT COALESCE(MAX(pioneer_number), 0) + 1 INTO next_pioneer
  FROM teacher_profiles
  WHERE pioneer_number IS NOT NULL;

  IF next_pioneer <= 10 THEN
    NEW.pioneer_number := next_pioneer;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_teacher_pioneer
  BEFORE INSERT ON teacher_profiles
  FOR EACH ROW
  WHEN (NEW.pioneer_number IS NULL)
  EXECUTE FUNCTION assign_teacher_pioneer();

-- ════════════════════════════════════════════
-- 5. Home Teacher Cue Card Template
-- ════════════════════════════════════════════
INSERT INTO cue_card_templates (
  initiative_slug, template_type, title, subtitle, body_text, hashtags,
  background_type, background_value, accent_color, card_style
) VALUES (
  'didasko', 'initiative',
  'Home Teacher',
  'Teach what you know. Keep 83.3% of every dollar.',
  E'What you do: Teach from your living room via Zoom. Group classes or 1-on-1 tutoring.\n\nWhat you earn: $520–1,200/month at 11–20 hours/week\n\nWhat you need: A subject you know, a Zoom account (free tier works), a $5/year membership\n\nMonthly potential:\n• 3 group classes/week × 25 students × $25/mo = $520 (after platform share)\n• 8 tutoring sessions/week × $25 × 4 weeks = $666 (after platform share)\n\nTime: 11–20 hours/week\nPioneer bonus: First 10 get 50 Marks/month for 12 months + Pioneer Medallion',
  ARRAY['HomeTeacher', 'CooperativeClassroom', 'Didasko', 'LianaBanyan', 'TeachFromHome'],
  'gradient', 'from-indigo-500/20 to-purple-500/20', 'indigo', 'bold'
) ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════
-- 6. Canonical Stats Update
-- ════════════════════════════════════════════
INSERT INTO platform_canonical (key, value)
VALUES ('innovation_count', 2107)
ON CONFLICT (key) DO UPDATE SET value = 2107;

INSERT INTO platform_canonical (key, value)
VALUES ('knight_sessions', 183)
ON CONFLICT (key) DO UPDATE SET value = 183;
