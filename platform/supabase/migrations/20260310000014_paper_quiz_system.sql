-- ============================================================
-- PAPER QUIZ SYSTEM — Golden Key Comprehension Quizzes
-- ============================================================
-- Read the full paper → 10 Mark Golden Key
-- Take a 5-question quiz → proportional Marks:
--   5 correct = 10, 4 = 8, 3 = 6, 2 = 4, 1 = 2, 0 = 0
--
-- The quiz is NOT a replacement for reading — it's a
-- second path for people who want to prove comprehension
-- without self-attesting they read the whole thing.
-- ============================================================

-- ─── Paper Quiz Definitions ───
-- Each paper can have ONE quiz definition with metadata.
CREATE TABLE IF NOT EXISTS paper_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id TEXT NOT NULL UNIQUE,              -- Matches cephasIndex.json "id" field
  paper_title TEXT NOT NULL,
  paper_url TEXT,                              -- Link to the Cephas paper
  question_count INT NOT NULL DEFAULT 5,      -- How many questions to pull
  marks_per_correct INT NOT NULL DEFAULT 2,   -- 2 marks per correct = 10 max for 5/5
  full_read_marks INT NOT NULL DEFAULT 10,    -- Marks for self-attesting full read
  max_attempts INT NOT NULL DEFAULT 3,        -- Max quiz attempts per user
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Quiz Questions ───
-- Pool of questions per paper. Quiz pulls question_count from this pool.
CREATE TABLE IF NOT EXISTS paper_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES paper_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  -- Multiple choice: 4 options, one correct
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  -- Difficulty affects question selection (easy first, then harder)
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  -- Explanation shown after answering (educational, not punitive)
  explanation TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Quiz Attempts ───
-- Records each attempt with answers and score.
CREATE TABLE IF NOT EXISTS paper_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES paper_quizzes(id) ON DELETE CASCADE,
  -- Store the question IDs and answers for this attempt
  questions_presented UUID[] NOT NULL,        -- Ordered question IDs shown
  answers_given CHAR(1)[] NOT NULL,           -- User's answers (a/b/c/d per question)
  correct_answers CHAR(1)[] NOT NULL,         -- Correct answers (for verification)
  score INT NOT NULL DEFAULT 0,               -- Number correct
  total_questions INT NOT NULL DEFAULT 5,
  marks_awarded INT NOT NULL DEFAULT 0,       -- Marks earned this attempt
  -- Best score tracking
  is_best_attempt BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Paper Read Completions ───
-- Self-attestation: "I read the full paper" → 10 Marks (one-time per paper).
CREATE TABLE IF NOT EXISTS paper_read_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paper_id TEXT NOT NULL,                     -- Matches cephasIndex.json "id"
  marks_awarded INT NOT NULL DEFAULT 10,
  -- Time tracking (soft anti-gaming: if you "read" 50 papers in 1 hour, Harper Guild flags it)
  read_started_at TIMESTAMPTZ,               -- When user opened the paper
  read_completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One completion per user per paper
  UNIQUE(user_id, paper_id)
);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_paper_quiz_questions_quiz_id
  ON paper_quiz_questions(quiz_id);

CREATE INDEX IF NOT EXISTS idx_paper_quiz_attempts_user_quiz
  ON paper_quiz_attempts(user_id, quiz_id);

CREATE INDEX IF NOT EXISTS idx_paper_quiz_attempts_best
  ON paper_quiz_attempts(quiz_id, score DESC)
  WHERE is_best_attempt = true;

CREATE INDEX IF NOT EXISTS idx_paper_read_completions_user
  ON paper_read_completions(user_id);

-- ─── RLS Policies ───
ALTER TABLE paper_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_read_completions ENABLE ROW LEVEL SECURITY;

-- Paper quizzes: everyone can read active quizzes
CREATE POLICY "Anyone can view active quizzes"
  ON paper_quizzes FOR SELECT
  USING (is_active = true);

-- Quiz questions: everyone can read (needed to display quiz)
CREATE POLICY "Anyone can view quiz questions"
  ON paper_quiz_questions FOR SELECT
  USING (true);

-- Quiz attempts: users see only their own
CREATE POLICY "Users can view own quiz attempts"
  ON paper_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON paper_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Paper read completions: users see/create only their own
CREATE POLICY "Users can view own read completions"
  ON paper_read_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own read completions"
  ON paper_read_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin override: Founder can manage all quiz content
CREATE POLICY "Admin can manage quizzes"
  ON paper_quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin can manage quiz questions"
  ON paper_quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin can view all quiz attempts"
  ON paper_quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

CREATE POLICY "Admin can view all read completions"
  ON paper_read_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );

-- ─── Seed Initial Quizzes ───
-- Start with 4 papers that already have treasure keys.
-- Questions are intentionally comprehension-based (not trivia).

-- 1. "Attention as Funding" paper
INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'academic-attention-as-funding',
  'Attention as Funding',
  'https://cephas.lianabanyan.com/academic/attention-as-funding/'
);

-- 2. "The Boaz Principle" paper (tl;dr)
INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'academic-boaz-principle-tldr-md',
  'The Boaz Principle: The tl;dr',
  'https://cephas.lianabanyan.com/academic/boaz-principle-tldr/'
);

-- 3. "Three-Gear Currency" paper (tl;dr)
INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'academic-three-gear-currency-tldr-md',
  'Three-Gear Currency: The tl;dr',
  'https://cephas.lianabanyan.com/academic/three-gear-currency-tldr/'
);

-- 4. "Ghost Credits" paper (tl;dr)
INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'academic-ghost-credits-tldr-md',
  'Ghost Credits: The tl;dr',
  'https://cephas.lianabanyan.com/academic/ghost-credits-tldr/'
);

-- ─── Seed Questions for "Attention as Funding" ───
-- 8 questions in the pool; quiz pulls 5 at random.

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT
  pq.id,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option,
  q.difficulty,
  q.explanation,
  q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What does "Attention as Funding" propose as the primary resource that drives platform value?',
   'Venture capital from outside backers',
   'User attention and engagement directed toward innovations',
   'Government grants allocated per project',
   'Advertising revenue from third-party sponsors',
   'b', 1,
   'The paper argues that focused user attention — not external capital — is the most valuable resource a platform can channel toward innovations.',
   1),
  ('How does the platform avoid the traditional advertising model according to this paper?',
   'By charging higher subscription fees',
   'By selling user data to fund operations',
   'By converting attention directly into platform value without intermediary advertisers',
   'By using blockchain tokens as advertising currency',
   'c', 1,
   'The paper explicitly rejects the advertising middleman, arguing attention should flow directly from users to creators.',
   2),
  ('What is the "triangulation" concept referenced in the paper?',
   'A three-step verification process for user identity',
   'Three independent signals that confirm genuine engagement rather than passive scrolling',
   'A mathematical formula for calculating fair pricing',
   'The three currencies working together',
   'b', 2,
   'Triangulation ensures engagement is real — multiple signals confirm a user actually absorbed the content.',
   3),
  ('Why does the paper argue that traditional venture capital is misaligned with platform goals?',
   'Because VC firms only care about technology, not people',
   'Because VCs require equity and exit timelines that distort the platform mission',
   'Because venture capital is too expensive to access',
   'Because VCs always demand advertising integration',
   'b', 2,
   'The core argument: VC equity models force platforms toward extraction and exit, not service and sustainability.',
   4),
  ('What role does the "viewport" concept play in the attention economy described?',
   'It measures screen resolution for responsive design',
   'It tracks how much of a document a user actually viewed and engaged with',
   'It is a financial instrument for measuring market cap',
   'It refers to the browser window size optimization',
   'b', 2,
   'Viewport in this context is an engagement metric — tracking real reading/viewing behavior, not just page loads.',
   5),
  ('According to the paper, what happens when attention is treated as a scarce resource?',
   'Platforms must compete for shorter attention spans',
   'Content quality increases because creators must earn genuine engagement',
   'Users become overwhelmed with information',
   'Advertising becomes more aggressive',
   'b', 3,
   'When attention is the currency, creators are incentivized to make content worth paying attention to — quality over quantity.',
   6),
  ('How does the paper connect attention metrics to the MARKS currency system?',
   'MARKS are purchased with attention tokens',
   'Sustained, verified attention to content generates MARKS as a recognition of effort',
   'MARKS automatically deduct when a user stops paying attention',
   'There is no connection — MARKS are separate from attention',
   'b', 3,
   'MARKS emerge from genuine effort and engagement — reading deeply, contributing quality work, and sustaining attention are all effort worthy of recognition.',
   7),
  ('What is the "cafeteria" model of content distribution described in the paper?',
   'A subscription model where users pay for unlimited access to all content',
   'A self-service model where users choose what deserves their attention, not an algorithm',
   'A free trial model where basic content is free but premium is paid',
   'A model where content is distributed randomly to prevent filter bubbles',
   'b', 3,
   'The cafeteria model puts choice back with the user — no algorithmic manipulation, no dopamine engineering, just a spread of options.',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'academic-attention-as-funding';

-- ─── Seed Questions for "The Boaz Principle" ───

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT
  pq.id,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option,
  q.difficulty,
  q.explanation,
  q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What biblical figure is the Boaz Principle named after, and why?',
   'King Solomon — known for wisdom in judging disputes',
   'Boaz — who left grain in his fields for the poor to glean',
   'Moses — who led people to a promised land of abundance',
   'David — who shared his resources with his soldiers',
   'b', 1,
   'Boaz intentionally left grain behind for Ruth and other gleaners — generosity built into the economic structure, not charity after the fact.',
   1),
  ('What is the core economic principle the paper derives from the Boaz story?',
   'That charity should replace taxation',
   'That generosity should be structurally embedded in economic systems, not bolted on as an afterthought',
   'That the wealthy should donate a fixed percentage of income',
   'That government programs are the best way to redistribute wealth',
   'b', 1,
   'The paper argues for structural generosity — building it into the rules, not relying on individual goodwill.',
   2),
  ('How does the Boaz Principle connect to the platform Cost+20% pricing model?',
   'The 20% is a charitable donation to external nonprofits',
   'The 20% margin is structurally set — the "gleaning" is built into every transaction, not discretionary',
   'Cost+20% means products are 20% cheaper than competitors',
   'The 20% funds executive compensation',
   'c', 2,
   'Cost+20% IS the Boaz Principle in action — the margin is structural, transparent, and purposeful.',
   3),
  ('What does the paper identify as the fundamental flaw in traditional corporate philanthropy?',
   'It is too expensive for companies to maintain',
   'It treats generosity as optional and disconnected from the business model that creates the wealth',
   'It focuses too much on local communities instead of global impact',
   'It requires too much government oversight',
   'b', 2,
   'The paper argues that CSR is fundamentally flawed because it separates profit-making from purpose — generosity becomes a marketing expense.',
   4),
  ('According to the paper, what is "reverse gleaning" and why is it problematic?',
   'When the wealthy take resources from the poor — the opposite of Boaz',
   'When charities refuse donations from certain companies',
   'When farmworkers are forced to return excess produce',
   'When customers demand discounts below cost',
   'a', 2,
   'Reverse gleaning is extractive economics — instead of leaving resources for the vulnerable, the system pulls resources away from them.',
   5),
  ('How does the paper suggest the Boaz Principle should apply to intellectual property?',
   'All IP should be free and open source',
   'IP should be shared through structured access that protects creators while enabling broad use',
   'IP should only be accessible to paying customers',
   'IP protection should be eliminated entirely',
   'b', 3,
   'The paper envisions IP that is protected but accessible — creators earn from their work, but the system ensures broad benefit.',
   6),
  ('What is the "gleaning window" concept introduced in the paper?',
   'A physical window in a store where free items are displayed',
   'A time-limited period where new members can access premium content as a structured onramp',
   'A tax deduction window for charitable donations',
   'The browser window where content is displayed for free users',
   'b', 3,
   'The gleaning window is structural — it is built into the system so newcomers can participate meaningfully before they have full resources.',
   7)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'academic-boaz-principle-tldr-md';

-- ─── Seed Questions for "Three-Gear Currency" ───

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT
  pq.id,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option,
  q.difficulty,
  q.explanation,
  q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What are the three currencies in the platform system?',
   'Bitcoin, Ethereum, and Dogecoin',
   'Credits, Marks, and Joules',
   'Dollars, Points, and Tokens',
   'Gold, Silver, and Bronze',
   'b', 1,
   'Credits (service access), Marks (reputation/effort), and Joules (locked-value surplus storage) — three gears that mesh together.',
   1),
  ('What is the fundamental difference between Credits and Marks?',
   'Credits are for rich users, Marks are for poor users',
   'Credits are purchased with money; Marks emerge from verified effort and cannot be bought',
   'Credits expire after 30 days; Marks are permanent',
   'There is no difference — they are interchangeable names',
   'b', 1,
   'Credits are the access currency (buy with fiat). Marks are the effort currency (earn through work). You cannot buy reputation.',
   2),
  ('What is the "forever stamp" mechanic that governs Joules?',
   'Joules never expire, unlike Credits which expire annually',
   'The exchange rate locks at the moment of earning — 1 Joule always buys what it could when you earned it',
   'Joules are permanently visible on your public profile',
   'Joules can be passed down to family members forever',
   'b', 2,
   'The forever stamp protects early contributors — if you earned Joules when the platform was small, they retain that purchasing power forever.',
   3),
  ('Why does the paper argue against allowing Marks to be purchased with money?',
   'Because Marks are technically too difficult to price',
   'Because purchasing reputation destroys trust — if effort can be bought, it means nothing',
   'Because government regulations prohibit it',
   'Because the technology does not support financial transactions for Marks',
   'b', 2,
   'If you could buy Marks, the entire reputation system collapses — effort must be real, verified, and earned.',
   4),
  ('How do the three currencies relate to each other in value?',
   'Credits are worth more than Marks, which are worth more than Joules',
   '1 Credit = 1 Mark = 1 Joule — same value, different acquisition paths',
   'Their relative values fluctuate based on market conditions',
   'Joules are worth 5x Credits at the premint stage',
   'b', 2,
   'Equal value, different purpose — like a wrench, screwdriver, and hammer all cost the same but do different things.',
   5),
  ('What does the paper mean by "closed-loop" for Credits?',
   'Credits can only be used on the platform — they do not convert back to fiat currency',
   'Credits loop back to the user after each transaction',
   'Credits are recycled when a user account is deleted',
   'Credits automatically renew each month',
   'a', 2,
   'Closed-loop means Credits stay in the ecosystem. You buy in, but you cannot cash out — this prevents speculation and extraction.',
   6),
  ('What problem does the three-gear system solve that single-currency systems cannot?',
   'It makes the platform more confusing, which reduces fraud',
   'It separates access, effort, and surplus storage so each can serve its purpose without corrupting the others',
   'It allows the platform to charge three different fees',
   'It enables faster transaction processing through parallel currencies',
   'b', 3,
   'A single currency conflates all functions. Three gears mean access does not corrupt reputation, and surplus does not distort effort.',
   7),
  ('According to the paper, what prevents Joules from becoming a speculative asset?',
   'Government regulation classifies them as service credits',
   'Joules never change in value based on project performance and cannot be converted to cash',
   'There is a maximum number of Joules any user can hold',
   'Joules automatically depreciate over time',
   'b', 3,
   'Joules are internal working power. They lock value at earning time, never become equity, never fluctuate with performance, and never convert to cash.',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'academic-three-gear-currency-tldr-md';

-- ─── Seed Questions for "Ghost Credits" ───

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT
  pq.id,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option,
  q.difficulty,
  q.explanation,
  q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What are "Ghost Credits" as described in the paper?',
   'Credits that have been spent and are no longer active',
   'Temporary credits that exist during a trial period, allowing participation before financial commitment',
   'Fraudulent credits created through system exploitation',
   'Credits that are invisible to other users on the platform',
   'b', 1,
   'Ghost Credits let people participate before they have real Credits — a structural onramp, not a free trial.',
   1),
  ('What is the primary purpose of Ghost Credits in the platform ecosystem?',
   'To increase platform revenue through trial-to-paid conversion',
   'To lower the barrier to entry so anyone can participate and demonstrate value before committing financially',
   'To reward users who refer new members',
   'To provide a discount on premium features',
   'b', 1,
   'Ghost Credits embody the Boaz Principle — let people glean first, contribute, prove themselves, then invest.',
   2),
  ('How do Ghost Credits differ from a traditional "free trial"?',
   'They last longer than typical free trials',
   'They are designed to let users contribute value and earn real standing, not just consume passively',
   'They require a credit card on file to activate',
   'They provide more features than free trials',
   'b', 2,
   'Free trials assume passive consumption. Ghost Credits assume active contribution — you work, you earn, you decide if this is your place.',
   3),
  ('What happens to Ghost Credits when a user converts to a full member?',
   'They are deleted and replaced with purchased Credits',
   'They crystallize — the effort during the ghost period becomes real platform standing',
   'They are banked as bonus Credits on top of purchased Credits',
   'They expire and the user starts fresh',
   'b', 2,
   'Crystallization means your ghost-period contributions were real — they just needed the commitment to become permanent.',
   4),
  ('What anti-abuse mechanism does the paper propose for Ghost Credits?',
   'Requiring phone verification for all ghost accounts',
   'Time-bounded participation windows with effort-based metrics that flag non-genuine engagement',
   'Charging a small non-refundable deposit',
   'Limiting ghost accounts to one per IP address',
   'b', 2,
   'The system tracks effort, not just presence. If you are not contributing, the ghost period does not extend — this prevents freeloading.',
   5),
  ('How do Ghost Credits connect to the Shadow Marks system?',
   'They are the same thing with different names',
   'Ghost Credits fund the creation of Shadow Marks',
   'Both exist in a temporary state that becomes permanent through verified effort and community validation',
   'Shadow Marks are used to purchase Ghost Credits',
   'c', 3,
   'Both systems share the principle of provisional value that crystallizes through genuine participation — different mechanisms, same philosophy.',
   6),
  ('What economic principle from the paper explains why Ghost Credits are not charity?',
   'Trickle-down economics',
   'Supply and demand equilibrium',
   'Structural access — the system is designed so everyone can participate, making generosity a feature of the architecture, not a gift',
   'Market competition drives prices down naturally',
   'c', 3,
   'Ghost Credits are Boaz Principle applied to access — it is not giving people something for nothing, it is designing a system where contributing is possible from day one.',
   7)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'academic-ghost-credits-tldr-md';
