-- Crew testimonials (mini-reviews after fulfillment) — Session 3
-- Bishop runs this migration before Session 3 Cycle 2.

CREATE TABLE IF NOT EXISTS crew_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES auth.users(id),
  to_user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crew_testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON crew_testimonials FOR SELECT USING (true);
CREATE POLICY "testimonials_insert" ON crew_testimonials FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE INDEX IF NOT EXISTS idx_crew_testimonials_crew ON crew_testimonials(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_testimonials_to ON crew_testimonials(to_user_id);

-- Allow crew members to update other members' backed_by/backed_amount/status (for backing flow)
CREATE POLICY "crew_members_update_same_crew" ON crew_members FOR UPDATE
  USING (crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid()));

-- Allow crew members to mark crew as completed when Run #1 is done (status only)
CREATE POLICY "crews_update_complete_by_member" ON crews FOR UPDATE
  USING (id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid()))
  WITH CHECK (status = 'completed');
