-- ═══════════════════════════════════════════════════════════════════════════════
-- CONCENTRIC CIRCLES — Ring Members + Feedback
-- Session 49 — March 19, 2026
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ring members
CREATE TABLE IF NOT EXISTS concentric_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ring_id integer NOT NULL CHECK (ring_id >= 1 AND ring_id <= 5),
  cue_card_sent boolean NOT NULL DEFAULT false,
  cue_card_sent_date date,
  signed_up boolean NOT NULL DEFAULT false,
  signed_up_date date,
  testing_goals_completed integer NOT NULL DEFAULT 0,
  testing_goals_total integer NOT NULL DEFAULT 6,
  feedback_given boolean NOT NULL DEFAULT false,
  feedback_count integer NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Feedback items
CREATE TABLE IF NOT EXISTS concentric_circle_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_id integer NOT NULL CHECK (ring_id >= 1 AND ring_id <= 5),
  member_id uuid REFERENCES concentric_circle_members(id),
  member_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('bug', 'ux_confusion', 'feature_request', 'praise')),
  severity text CHECK (severity IN ('critical', 'major', 'minor', 'cosmetic')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ring status tracking (supplements RING_DEFINITIONS constants)
CREATE TABLE IF NOT EXISTS concentric_circle_rings (
  id integer PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'ready', 'locked')) DEFAULT 'locked',
  activated_date timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE concentric_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE concentric_circle_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE concentric_circle_rings ENABLE ROW LEVEL SECURITY;

-- Members: read all, admin write
CREATE POLICY "cc_members_read" ON concentric_circle_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "cc_members_admin" ON concentric_circle_members FOR ALL TO authenticated USING (public.is_admin());

-- Feedback: read all, authenticated insert, admin all
CREATE POLICY "cc_feedback_read" ON concentric_circle_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "cc_feedback_insert" ON concentric_circle_feedback FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cc_feedback_admin" ON concentric_circle_feedback FOR ALL TO authenticated USING (public.is_admin());

-- Rings: read all, admin write
CREATE POLICY "cc_rings_read" ON concentric_circle_rings FOR SELECT TO authenticated USING (true);
CREATE POLICY "cc_rings_admin" ON concentric_circle_rings FOR ALL TO authenticated USING (public.is_admin());

-- Seed rings
INSERT INTO concentric_circle_rings (id, name, status, activated_date) VALUES
  (1, 'Immediate Family', 'active', '2026-03-18T00:00:00Z'),
  (2, 'Extended Family', 'ready', NULL),
  (3, 'Wider Family', 'locked', NULL),
  (4, 'Friends', 'locked', NULL),
  (5, 'The 300 / Strategic Allies', 'locked', NULL);

-- Seed members (Ring 1 active, Ring 2 ready)
INSERT INTO concentric_circle_members (name, ring_id, cue_card_sent, cue_card_sent_date, signed_up, signed_up_date, testing_goals_completed, testing_goals_total, feedback_given, feedback_count) VALUES
  ('Family Member A', 1, true, '2026-03-16', true, '2026-03-16', 6, 6, true, 5),
  ('Family Member B', 1, true, '2026-03-16', true, '2026-03-17', 5, 6, true, 4),
  ('Family Member C', 1, true, '2026-03-16', true, '2026-03-17', 4, 6, true, 3),
  ('Family Member D', 1, true, '2026-03-16', true, '2026-03-18', 2, 6, false, 0),
  ('Family Member E', 1, true, '2026-03-17', false, NULL, 0, 6, false, 0),
  ('Family Member F', 1, true, '2026-03-17', false, NULL, 0, 6, false, 0),
  ('Extended A', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended B', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended C', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended D', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended E', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended F', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended G', 2, false, NULL, false, NULL, 0, 6, false, 0),
  ('Extended H', 2, false, NULL, false, NULL, 0, 6, false, 0);

-- Seed feedback (needs member IDs — use subquery approach)
-- We'll reference by name since we don't know UUIDs at insert time
DO $$
DECLARE
  m1_id uuid; m2_id uuid; m3_id uuid;
BEGIN
  SELECT id INTO m1_id FROM concentric_circle_members WHERE name = 'Family Member A' LIMIT 1;
  SELECT id INTO m2_id FROM concentric_circle_members WHERE name = 'Family Member B' LIMIT 1;
  SELECT id INTO m3_id FROM concentric_circle_members WHERE name = 'Family Member C' LIMIT 1;

  INSERT INTO concentric_circle_feedback (ring_id, member_id, member_name, category, severity, title, description, resolved, created_at) VALUES
    (1, m1_id, 'Family Member A', 'bug', 'critical', 'Login page freezes on mobile Safari', 'When trying to sign in on iPhone, the page locks up after entering password.', true, '2026-03-16T10:00:00Z'),
    (1, m1_id, 'Family Member A', 'bug', 'major', 'Profile picture upload fails silently', 'Tried to upload a HEIC photo and nothing happened. No error message.', true, '2026-03-16T14:00:00Z'),
    (1, m2_id, 'Family Member B', 'bug', 'minor', 'Typo on onboarding screen', 'Step 3 says ''complte'' instead of ''complete''.', true, '2026-03-17T09:00:00Z'),
    (1, m3_id, 'Family Member C', 'bug', 'major', 'Demand signal button unresponsive', 'Clicked the signal button multiple times but count did not increase.', false, '2026-03-17T11:00:00Z'),
    (1, m1_id, 'Family Member A', 'bug', 'cosmetic', 'Footer overlaps content on small screens', 'On my phone the footer text covers the bottom of the store list.', true, '2026-03-17T15:00:00Z'),
    (1, m2_id, 'Family Member B', 'ux_confusion', NULL, 'Did not understand what Marks are', 'Saw references to Marks but could not figure out what they mean or how to get them.', false, '2026-03-16T16:00:00Z'),
    (1, m3_id, 'Family Member C', 'ux_confusion', NULL, 'Main Square navigation confusing', 'Could not figure out how to get back to the Main Square from a store page.', false, '2026-03-17T10:30:00Z'),
    (1, m1_id, 'Family Member A', 'ux_confusion', NULL, 'Cue Card sharing unclear', 'Tried to share a Cue Card but did not know if it actually sent.', true, '2026-03-17T12:00:00Z'),
    (1, m2_id, 'Family Member B', 'feature_request', NULL, 'Want dark mode toggle', 'The bright white screens are hard on the eyes at night.', false, '2026-03-16T20:00:00Z'),
    (1, m3_id, 'Family Member C', 'feature_request', NULL, 'Wish I could save favorite stores', 'Would be nice to bookmark stores I want to come back to.', false, '2026-03-17T14:00:00Z'),
    (1, m1_id, 'Family Member A', 'feature_request', NULL, 'Notification when new stores open', 'Want to know when new stores appear in the Main Square.', false, '2026-03-18T08:00:00Z'),
    (1, m1_id, 'Family Member A', 'praise', NULL, 'Love the onboarding flow', 'The step-by-step walkthrough was really clear and welcoming. Felt like someone was guiding me.', false, '2026-03-16T11:00:00Z'),
    (1, m2_id, 'Family Member B', 'praise', NULL, 'Cue Cards are a great idea', 'The physical-feeling cards are fun. Makes sharing feel personal.', false, '2026-03-17T09:30:00Z'),
    (1, m3_id, 'Family Member C', 'praise', NULL, 'Main Square looks beautiful', 'The store layouts in Main Square look really professional. Impressed.', false, '2026-03-17T13:00:00Z'),
    (1, m2_id, 'Family Member B', 'praise', NULL, 'Demand Signaling is intuitive', 'Once I figured out Marks, the demand signal concept clicked right away. Clever.', false, '2026-03-18T07:00:00Z');
END $$;
