-- ============================================
-- AMBASSADOR LEVEL ASSESSMENT QUESTIONS (Session 5 V2)
-- Seed questions for Level 1→2 certification. 80% pass threshold.
-- ============================================

CREATE TABLE IF NOT EXISTS ambassador_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_level integer NOT NULL,
  to_level integer NOT NULL,
  question_order integer NOT NULL,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text,
  option_d text,
  correct_option text NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  category text CHECK (category IN ('scenario', 'process', 'temperament', 'platform', 'leadership', 'systems', 'regional')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_level, to_level, question_order)
);

ALTER TABLE ambassador_assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_questions_public_read" ON ambassador_assessment_questions FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_level ON ambassador_assessment_questions(from_level, to_level);

-- Seed Level 1→2 (10 questions)
INSERT INTO ambassador_assessment_questions (from_level, to_level, question_order, question_text, option_a, option_b, option_c, option_d, correct_option, category) VALUES
(1, 2, 1, 'A recruit says "this sounds like an MLM." What do you say?', 'Explain that there are no commissions or recruitment bonuses — only Marks for completed onboarding, and the platform takes Cost+20%.', 'Tell them to just try it and see.', 'Avoid the question and move on.', 'Compare it to other platforms.', 'a', 'scenario'),
(1, 2, 2, 'What is the Cost+20% floor and why does it matter?', 'Creators keep 83.3%; the platform takes only cost plus 20%. It ensures transparent, sustainable pricing.', 'It is a suggested minimum price.', 'It applies only to certain initiatives.', 'It is the same as a commission.', 'a', 'process'),
(1, 2, 3, 'When a mentee struggles, do you step in immediately or wait for them to ask?', 'Offer help once; if they prefer to try first, wait for them to ask.', 'Always step in immediately.', 'Never step in — let them figure it out.', 'Do their task for them.', 'a', 'temperament'),
(1, 2, 4, 'Explain the difference between Credits and Marks in one sentence.', 'Credits are spendable value; Marks are effort-debt earned for contributions and can unlock opportunities.', 'They are the same thing.', 'Credits are for members only; Marks are for Ambassadors.', 'Marks are money; Credits are points.', 'a', 'platform'),
(1, 2, 5, 'A recruit says they do not have time for the full walkthrough. What do you do?', 'Suggest the shortest path that still covers key steps; offer to pause and resume later.', 'Skip the walkthrough entirely.', 'Insist they complete it all in one sitting.', 'Send them a link and leave.', 'a', 'scenario'),
(1, 2, 6, 'How many Marks does an Ambassador earn per completed onboarding?', '10 Marks per completed onboarding.', 'It varies by recruit.', '25 Marks only when the recruit becomes an Ambassador.', 'Marks are only for crew activities.', 'a', 'process'),
(1, 2, 7, 'What should you do if a recruit asks about financial returns or guarantees?', 'Clarify that Marks are effort-debt and there are no commissions or investment returns; focus on the cooperative model.', 'Promise they will earn a certain amount.', 'Tell them it is like a side hustle.', 'Avoid financial topics.', 'a', 'scenario'),
(1, 2, 8, 'What are the 10 slots on your Ambassador dashboard for?', 'The 10 recruits you are responsible for onboarding; each slot tracks one person through the journey.', 'Any 10 people you refer.', '10 Ambassadors you train.', '10 crew members.', 'a', 'platform'),
(1, 2, 9, 'Why does the platform use "Ambassador" instead of terms like "referrer" or "affiliate"?', 'To reflect a guiding, non-commission role and to stay SEC-safe; we help people onboard, we do not sell or recruit for profit.', 'Because it sounds better.', 'Legal requirement only.', 'There is no difference.', 'a', 'process'),
(1, 2, 10, 'When is a recruit considered "completed" for your onboarding count?', 'When they have finished the walkthrough and met the completion criteria (e.g., signed up and joined a crew or first backing).', 'As soon as they sign up.', 'When they pay membership.', 'When they refer someone else.', 'a', 'platform')
ON CONFLICT (from_level, to_level, question_order) DO NOTHING;
