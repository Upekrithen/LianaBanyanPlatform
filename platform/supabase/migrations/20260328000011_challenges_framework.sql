-- K151: Generic Challenge Framework + Say It Fast seeding
-- Reusable challenge system for skill-based promotions and sweepstakes.

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('skill', 'sweepstakes')),
  marks_reward INTEGER NOT NULL DEFAULT 5,
  max_marks INTEGER NOT NULL DEFAULT 25,
  referral_bonus INTEGER NOT NULL DEFAULT 5,
  rules_json JSONB NOT NULL DEFAULT '{}',
  legal_disclaimer TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  platform_dispatched_to TEXT[] DEFAULT '{}',
  marks_awarded INTEGER NOT NULL DEFAULT 0,
  referral_marks INTEGER NOT NULL DEFAULT 0,
  referred_by UUID REFERENCES auth.users(id),
  verified BOOLEAN NOT NULL DEFAULT false,
  submission_url TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_member
  ON challenge_completions(member_id);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge
  ON challenge_completions(challenge_id);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (active = true);

CREATE POLICY "Members can view own completions"
  ON challenge_completions FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Members can insert own completions"
  ON challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- Seed: Say It Fast challenge
INSERT INTO challenges (slug, title, subtitle, description, type, marks_reward, max_marks, referral_bonus, rules_json, legal_disclaimer)
VALUES (
  'say-it-fast',
  'Say It Fast',
  'Can you say it 3 times fast?',
  'Record yourself saying "I''m a Patriotic Interdependentalist" three times fast. Dispatch to your connected social platforms via Battery Dispatch. Earn Marks for each platform you share to.',
  'skill',
  5,
  25,
  5,
  '{
    "phrase": "I''m a Patriotic Interdependentalist",
    "repetitions": 3,
    "base_marks": 5,
    "per_platform_marks": 2,
    "max_platform_bonus": 10,
    "max_referral_bonus": 5,
    "referral_levels": 1
  }'::jsonb,
  'The Say It Fast challenge is a skill-based promotion, not a game of chance; participants qualify by completing the defined challenge criteria, and rewards are fixed in the form of Marks credited to member accounts. No purchase is necessary to participate. Void where prohibited. Liana Banyan does not use blockchain technology. Dispatch records are maintained in a standard verified database ledger.'
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE challenges IS 'Generic challenge framework — skill-based promotions and sweepstakes.';
COMMENT ON TABLE challenge_completions IS 'Tracks member completion of challenges with platform dispatch and referral data.';
