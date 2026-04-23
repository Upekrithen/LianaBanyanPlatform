-- ============================================================================
-- Session 25: Quiz tables + Scott/Buffett question seed
-- Adds missing columns to existing tables, then seeds quiz data.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.paper_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.paper_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.paper_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.paper_quizzes
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS source_path TEXT,
  ADD COLUMN IF NOT EXISTS dispatch_id UUID,
  ADD COLUMN IF NOT EXISTS questions_per_attempt INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS marks_per_correct INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS self_attest_marks INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_quizzes' AND column_name='paper_id' AND is_nullable='NO') THEN
    ALTER TABLE public.paper_quizzes ALTER COLUMN paper_id DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_quizzes' AND column_name='paper_title' AND is_nullable='NO') THEN
    ALTER TABLE public.paper_quizzes ALTER COLUMN paper_title DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE public.paper_quiz_questions
  ADD COLUMN IF NOT EXISTS quiz_id UUID,
  ADD COLUMN IF NOT EXISTS question_number INT,
  ADD COLUMN IF NOT EXISTS question_text TEXT,
  ADD COLUMN IF NOT EXISTS option_a TEXT,
  ADD COLUMN IF NOT EXISTS option_b TEXT,
  ADD COLUMN IF NOT EXISTS option_c TEXT,
  ADD COLUMN IF NOT EXISTS option_d TEXT,
  ADD COLUMN IF NOT EXISTS correct_answer CHAR(1),
  ADD COLUMN IF NOT EXISTS explanation TEXT;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_quiz_questions' AND column_name='correct_option' AND is_nullable='NO') THEN
    ALTER TABLE public.paper_quiz_questions ALTER COLUMN correct_option DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE public.paper_quiz_attempts
  ADD COLUMN IF NOT EXISTS quiz_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attempt_number INT DEFAULT 1;

ALTER TABLE paper_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_quiz_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active quizzes') THEN
    CREATE POLICY "Anyone can read active quizzes" ON paper_quizzes FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read quiz questions') THEN
    CREATE POLICY "Anyone can read quiz questions" ON paper_quiz_questions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users manage own attempts') THEN
    CREATE POLICY "Auth users manage own attempts" ON paper_quiz_attempts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- QUIZ: MacKenzie Scott Open Letter
-- ═══════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (id, title, source_path, questions_per_attempt, marks_per_correct, max_attempts, self_attest_marks)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'An Open Letter to MacKenzie Scott',
  'BISHOP_DROPZONE/QUIZ_SCOTT_OPEN_LETTER.md',
  5, 2, 3, 10
) ON CONFLICT (id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('11111111-1111-1111-1111-111111111111', 1,
 'What does the founder specifically ask MacKenzie Scott for?',
 'A large financial donation to fund the platform launch',
 'References and recommendations from her network',
 'A public endorsement on social media',
 'Board membership on Liana Banyan Corporation',
 'B', 'The letter explicitly states "I don''t want your money" and asks for references — operators who excel at scaling community-driven solutions, and ethical CEO/CFO/CTO candidates.'),

('11111111-1111-1111-1111-111111111111', 2,
 'What does the roommate''s suit story illustrate?',
 'That wealthy people are less generous than poor people',
 'That a sacrifice from someone with little means more than an easy gift from someone with much',
 'That the founder couldn''t afford professional clothing',
 'That college roommates should share resources equally',
 'B', 'The poor roommate gave one of his TWO suits. The wealthy roommate offered one of fifteen — only after the sacrifice was already made.'),

('11111111-1111-1111-1111-111111111111', 3,
 'How are the fifteen charitable initiatives funded?',
 'Through donations and crowdfunding campaigns',
 'Through government grants and nonprofit status',
 'Through commercial portals that sustainably fund them via a baked-in 20% margin',
 'Through MacKenzie Scott''s philanthropic giving pledge',
 'C', 'The architecture is "not charity TO the people but infrastructure BY the people FOR the people" — commercial portals fund charitable initiatives through the Cost + 20% structure.'),

('11111111-1111-1111-1111-111111111111', 4,
 'What does the founder mean by "I have two suits"?',
 'He owns exactly two professional outfits',
 'He''s filing two lawsuits',
 'The roommate''s generosity shaped him, and he still carries both the suit and the lesson',
 'He has two business proposals ready',
 'C', '"I still have two suits" bookends the letter — the literal suits from college, and the lasting impact of that sacrifice on the founder''s philosophy of generosity from scarcity.'),

('11111111-1111-1111-1111-111111111111', 5,
 'Why does the founder reference Paul Mantz in the P.P.S.?',
 'Paul Mantz was a famous philanthropist',
 'Paul Mantz was a stunt pilot who died during filming of Flight of the Phoenix — the founder knows the risks of flying solo',
 'Paul Mantz was MacKenzie Scott''s financial advisor',
 'Paul Mantz invented the medallion system',
 'B', 'Paul Mantz died filming Flight of the Phoenix. The subtitle of the letter is "Flight of the Phoenix" — the founder is saying he knows building this alone is dangerous.'),

('11111111-1111-1111-1111-111111111111', 6,
 'What is the medallion system designed to do?',
 'Serve as a cryptocurrency investment',
 'Give physical collectibles AND actual ownership stakes that can be split and shared',
 'Track volunteer hours for tax deductions',
 'Replace traditional banking for the unbanked',
 'B', 'Each $100 medallion is both a physical collectible and an ownership stake. Recipients can split into ten $10 stakes, bringing their communities into ownership.'),

('11111111-1111-1111-1111-111111111111', 7,
 'Who receives the first 50 medallions?',
 'Venture capital investors and tech founders',
 'MacKenzie Scott''s recommended candidates',
 'Waitresses, bus drivers, and laborers — service workers who''ve never had equity in anything',
 'The founder''s family and close friends',
 'C', 'The founder specifically targets people who would "never otherwise know about or see any of these opportunities" — service workers, not tech insiders.'),

('11111111-1111-1111-1111-111111111111', 8,
 'What does "I bargained with Life for a penny" reference?',
 'The $5 membership cost',
 'A Jessie B. Rittenhouse poem about settling for too little because you didn''t ask for more',
 'The founder''s paper route at 13 years old',
 'The cost of minting blockchain medallions',
 'B', 'The Rittenhouse poem warns that Life pays exactly what you ask for — if you only ask for a penny, that''s all you get.');

-- ═══════════════════════════════════════════════════════════════
-- QUIZ: Warren Buffett Open Letter
-- ═══════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (id, title, source_path, questions_per_attempt, marks_per_correct, max_attempts, self_attest_marks)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'An Open Letter to Warren Buffett',
  'BISHOP_DROPZONE/QUIZ_BUFFETT_OPEN_LETTER.md',
  5, 2, 3, 10
) ON CONFLICT (id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('22222222-2222-2222-2222-222222222222', 1,
 'What is the founder''s central argument about the Giving Pledge?',
 'It should be abolished because philanthropy doesn''t work',
 'Giving money away doesn''t solve wealth concentration — it just flows out and concentrates again',
 'All 256 signatories have failed to fulfill their commitments',
 'Warren Buffett should donate directly to Liana Banyan',
 'B', 'The founder acknowledges the Pledge''s intent but argues the underlying problem is structural: money redistributed through philanthropy re-concentrates.'),

('22222222-2222-2222-2222-222222222222', 2,
 'How does the Cost + 20% margin prevent wealth concentration?',
 'It caps how much any individual can earn',
 'It fixes the platform''s take so creators keep 83.3%, preventing extractive margin creep',
 'It redistributes 20% of all income to the poorest members',
 'It limits membership to people below a certain income level',
 'B', 'The margin is locked in the operating agreement. Creators keep $416.67 of every $500 transaction. The platform can''t increase its cut.'),

('22222222-2222-2222-2222-222222222222', 3,
 'What does HexIsle prove about the manufacturing model?',
 'That automation will replace all manual labor',
 'That a single person with accessible equipment can produce precision components at 95% less cost than traditional manufacturing',
 'That 3D printing is always superior to injection molding',
 'That manufacturing must be centralized for quality control',
 'B', 'HexIsle demonstrates that modular design enables distributed manufacturing — "the same product can be made in a garage in Texas or an apartment in Tokyo."'),

('22222222-2222-2222-2222-222222222222', 4,
 'What does the founder actually ask Warren Buffett for?',
 'A large investment in the platform',
 'To become the CEO of Liana Banyan',
 'His honest assessment of whether the economic model works, plus potential guidance or board recommendations',
 'To sign the Giving Pledge on behalf of Liana Banyan',
 'C', '"Does this one work?" — the founder asks Buffett''s opinion as someone who understands business economics, not as an investor.'),

('22222222-2222-2222-2222-222222222222', 5,
 'Why does the letter mention the Canada 40K crisis?',
 'To criticize Canadian immigration policy',
 'To show timely alignment — 40,000 stranded entrepreneurs need a platform, and the platform needs builders',
 'To suggest Buffett invest in Canadian startups',
 'To argue against startup visa programs',
 'B', '"They need a platform. We need builders. The alignment is obvious." The Canada 40K reference demonstrates real-world demand and timing.'),

('22222222-2222-2222-2222-222222222222', 6,
 'What distinguishes this platform from traditional gig economy platforms?',
 'It pays higher hourly wages',
 'Participants earn actual ownership stakes with governance rights through blockchain-verified medallions',
 'It only operates in the United States',
 'It requires no membership fee',
 'B', 'Unlike gig platforms where workers are users, Liana Banyan distributes ownership through medallions — actual equity proportional to participation.'),

('22222222-2222-2222-2222-222222222222', 7,
 'What is the "business incubator" the letter describes?',
 'A venture capital fund for startup founders',
 'A physical office space for entrepreneurs',
 'Infrastructure where people can build real businesses with a $5 entry point, learning by doing at stakes they can afford',
 'A university program for business students',
 'C', '"A teenager in Des Moines can start a music licensing business for $5." The incubator lets people learn by doing without losing their shirt.'),

('22222222-2222-2222-2222-222222222222', 8,
 'What does the P.S. mean: "We literally can''t enshittify"?',
 'The platform uses only biodegradable materials',
 'The fixed margin in the operating agreement structurally prevents the platform from degrading service to extract more profit over time',
 'The founder promises never to sell the company',
 'The platform has no advertisements',
 'B', '"Enshittification" is the process where platforms gradually increase extraction from users. Because the Cost + 20% margin is locked in the operating agreement, the platform is architecturally prevented from this.');
