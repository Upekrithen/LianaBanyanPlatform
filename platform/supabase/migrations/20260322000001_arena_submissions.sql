-- Arena Submissions: design upload → STAMP review → Emporium listing pipeline
-- Innovation references: #1876-#1896 (Lotería Deck Designer Bounty + Arena/CrewTable/Ghost)

CREATE TABLE IF NOT EXISTS arena_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'pending_review',
  stamp_reviewer_id UUID REFERENCES auth.users(id),
  stamp_rating DECIMAL(3,1),
  stamp_date TIMESTAMPTZ,
  battle_id UUID,
  royalty_uses INT DEFAULT 0,
  royalty_earnings DECIMAL(10,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE arena_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved submissions" ON arena_submissions
  FOR SELECT USING (status IN ('approved', 'in_battle', 'in_emporium'));

CREATE POLICY "Creators can view own submissions" ON arena_submissions
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own submissions" ON arena_submissions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own pending submissions" ON arena_submissions
  FOR UPDATE USING (auth.uid() = creator_id AND status = 'pending_review');

CREATE POLICY "Admin manages all submissions" ON arena_submissions
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_arena_submissions_category ON arena_submissions(category);
CREATE INDEX idx_arena_submissions_status ON arena_submissions(status);
CREATE INDEX idx_arena_submissions_creator ON arena_submissions(creator_id);

-- Auto-trigger: when a submission is approved, check for battle conditions
CREATE OR REPLACE FUNCTION check_arena_battle_trigger()
RETURNS TRIGGER AS $$
DECLARE
  approved_count INT;
  new_battle_id UUID;
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    SELECT COUNT(*) INTO approved_count
    FROM arena_submissions
    WHERE category = NEW.category
      AND status = 'approved'
      AND battle_id IS NULL
      AND created_at > now() - INTERVAL '7 days';

    IF approved_count >= 2 THEN
      new_battle_id := gen_random_uuid();

      INSERT INTO design_battles (
        id, bounty_id, bounty_title, status, skill_tier, timeframe,
        starts_at, ends_at, total_pot, platform_cut, net_pot,
        winner_payout, participant_count, community_votes
      ) VALUES (
        new_battle_id,
        'arena_' || NEW.category,
        'Design Battle: ' || initcap(replace(NEW.category, '_', ' ')),
        'voting',
        'journeyman',
        '2weeks',
        now(),
        now() + INTERVAL '48 hours',
        0, 0, 0, 0, 0, 0
      );

      UPDATE arena_submissions
      SET battle_id = new_battle_id, status = 'in_battle'
      WHERE category = NEW.category
        AND status = 'approved'
        AND battle_id IS NULL
        AND created_at > now() - INTERVAL '7 days';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER arena_submission_battle_check
  AFTER UPDATE ON arena_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_arena_battle_trigger();
