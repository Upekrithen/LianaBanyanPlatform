-- ═══════════════════════════════════════════════════════════════════════════════
-- CONTENT PIPELINE SEED DATA — Session 48
-- March 19, 2026
-- ═══════════════════════════════════════════════════════════════════════════════
-- 5 seed items across different stages to populate the pipeline for demos
-- and to establish the content evolution pattern.
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO content_pipeline (slug, title, subtitle, category, tags, author_name, current_stage, stages, seed_content, tldr_content, blog_content, article_content, status, word_count, reading_time_minutes, coverage_minutes_value, innovation_numbers)
VALUES
(
  'cost-plus-twenty-explained',
  'Cost + 20%: Why It Matters',
  'The economics of cooperative platforms',
  'economics',
  ARRAY['economics', 'cost-plus-20', 'platform', 'cooperative'],
  'Founder',
  'blog',
  '[{"stage":"seed","enteredAt":"2026-03-01T00:00:00Z","completedAt":"2026-03-02T00:00:00Z","wordCount":28},{"stage":"tldr","enteredAt":"2026-03-02T00:00:00Z","completedAt":"2026-03-05T00:00:00Z","wordCount":150},{"stage":"blog","enteredAt":"2026-03-05T00:00:00Z","wordCount":680}]'::jsonb,
  'Liana Banyan takes Cost + 20% on every transaction. The creator keeps 83.3%. This is constitutionally locked and can never be changed by anyone.',
  'Most platforms take 30-50% of creator earnings. Liana Banyan takes Cost + 20%, meaning the creator keeps 83.3% of every transaction. On a $500 sale, the creator gets $416.67. This margin is locked in the operating agreement — no board, no investor, no future CEO can ever raise it. The platform is designed to be economically efficient, not extractive. Break-even occurs at just 500 members per locale, and profitability at 1,000. The model was developed over 37 years, from LOCALCY currency concepts in 2011 to the current implementation. It proves that a platform can serve its community without bleeding it dry.',
  E'# Cost + 20%: Why It Matters\n\nEvery platform takes a cut. Uber takes 25%. Airbnb takes up to 20%. The App Store takes 30%. Amazon Marketplace takes 15-45%. These aren''t small numbers — they''re the difference between a creator thriving and barely surviving.\n\nLiana Banyan does it differently. Our margin is **Cost + 20%**. That means the creator keeps **83.3%** of every transaction. On a $500 sale, the creator receives $416.67.\n\nBut here''s what makes it revolutionary: **this number is constitutionally locked**. It''s written into the operating agreement. No board vote, no investor pressure, no future CEO can ever raise it.\n\n## How We Got Here\n\nThis model didn''t appear overnight. It evolved over 37 years, from the LOCALCY currency system in 2011 to the current Liana Banyan implementation. The Founder tested these economics as a helicopter pilot, an IT developer, and a father of eight — each role revealing what families actually need from a platform.\n\n## The Math\n\n| Transaction | Creator Gets | Platform Gets |\n|---|---|---|\n| $100 | $83.33 | $16.67 |\n| $500 | $416.67 | $83.33 |\n| $1,000 | $833.33 | $166.67 |\n\n## Break-Even\n\nThe platform reaches break-even at 500 members per locale. Profitability at 1,000. This means we don''t need millions of users to survive — we need communities.\n\n## Why "Constitutionally Locked"?\n\nBecause every platform eventually faces the temptation to extract more. Uber raised prices. Netflix raised prices. Amazon raised seller fees. We removed the temptation entirely by making it structurally impossible.\n\nThis is not charity. This is infrastructure BY the people, FOR the people. Built RIGHT.',
  NULL,
  'published',
  680,
  3,
  3,
  ARRAY[1, 2, 3]
),
(
  'shadow-marks-reputation-without-surveillance',
  'Shadow Marks: Reputation Without Surveillance',
  NULL,
  'technology',
  ARRAY['shadow-marks', 'reputation', 'privacy'],
  'Founder',
  'tldr',
  '[{"stage":"seed","enteredAt":"2026-03-10T00:00:00Z","completedAt":"2026-03-11T00:00:00Z","wordCount":32},{"stage":"tldr","enteredAt":"2026-03-11T00:00:00Z","wordCount":180}]'::jsonb,
  'Shadow Marks are reputation tokens that decay over time. They cannot be traded, gamed, or accumulated past a ceiling. Your reputation reflects what you are doing, not what you did.',
  'Traditional reputation systems are broken. Five-star ratings get gamed. Likes become currency. Review bombing is a weapon. Shadow Marks solve this by introducing time-decay into reputation. Your marks reflect your CURRENT contribution, not your historical accumulation. A creator who was active three years ago but has since gone dormant sees their marks naturally fade. A new creator who is contributing daily sees theirs grow. This prevents reputation hoarding — a form of digital feudalism where early adopters permanently outrank newcomers. Shadow Marks also cannot be traded between users, eliminating reputation markets.',
  NULL,
  NULL,
  'draft',
  180,
  1,
  0,
  ARRAY[1218, 1219, 1220]
),
(
  'defense-klaus-for-someone-you-love',
  'Defense Klaus: For Someone You Love',
  NULL,
  'community',
  ARRAY['defense-klaus', 'safety', 'community'],
  'Founder',
  'seed',
  '[{"stage":"seed","enteredAt":"2026-03-15T00:00:00Z","wordCount":35}]'::jsonb,
  'Defense Klaus is a community safety initiative where neighbors protect neighbors. Named after the concept of defending what matters most — for someone you love. Not vigilantism. Infrastructure.',
  NULL,
  NULL,
  NULL,
  'draft',
  35,
  1,
  0,
  ARRAY[]::integer[]
),
(
  'the-muffled-rule-fair-debate',
  'The Muffled Rule: Fair Debate in 3-Minute Chunks',
  'Coverage Minutes and the economics of civil discourse',
  'civic',
  ARRAY['muffled-rule', 'coverage-minutes', 'debate', 'civic'],
  'Founder',
  'article',
  '[{"stage":"seed","enteredAt":"2026-02-20T00:00:00Z","completedAt":"2026-02-21T00:00:00Z","wordCount":40},{"stage":"tldr","enteredAt":"2026-02-21T00:00:00Z","completedAt":"2026-02-25T00:00:00Z","wordCount":200},{"stage":"blog","enteredAt":"2026-02-25T00:00:00Z","completedAt":"2026-03-01T00:00:00Z","wordCount":800},{"stage":"article","enteredAt":"2026-03-01T00:00:00Z","wordCount":1800}]'::jsonb,
  'The Muffled Rule limits any single speaker to 3-minute chunks during community debates. Coverage Minutes are earned, not infinite. This prevents filibustering and rewards preparation.',
  'Debates fail when one voice drowns out all others. The Muffled Rule fixes this by limiting each speaker to 3-minute chunks. Coverage Minutes are a finite resource — earned by civic participation, not purchased. This means every voice gets equal weight, and filibustering becomes structurally impossible.',
  E'# The Muffled Rule\n\nOnline debates are broken. One loud voice can dominate a thread. Trolls have unlimited ammunition. The Muffled Rule changes this by introducing Coverage Minutes — a finite resource that each participant earns through civic engagement.\n\nEach speaking turn is exactly 3 minutes. When your minutes run out, you listen. This isn''t censorship — it''s infrastructure for civil discourse.\n\n## How to Earn Coverage Minutes\n\n- Attend a town hall: +15 minutes\n- Complete civic education module: +30 minutes\n- Vote on community proposals: +10 minutes\n- Serve as a debate moderator: +45 minutes\n\nThe earned nature of Coverage Minutes means participants are invested. They''ve demonstrated civic engagement before being granted a voice in debate.',
  E'# The Muffled Rule: Fair Debate in 3-Minute Chunks\n\n## Abstract\n\nOnline civic discourse has devolved into attention warfare. Whoever speaks loudest, longest, and most provocatively wins — not whoever has the best ideas. The Muffled Rule is an innovation in deliberative democracy that introduces scarcity into speech through Coverage Minutes.\n\n## The Problem\n\nTraditional online forums give every user infinite speaking time. This creates perverse incentives:\n- **Filibustering**: One user can dominate a thread with volume\n- **Trolling**: Bad-faith actors face no cost for disruption\n- **Disengagement**: Good-faith participants leave when overwhelmed\n- **Echo chambers**: The loudest voices attract the most attention\n\nThis is not a technical problem. It is an economic one. Speech has zero marginal cost online, so it gets overproduced by those with the most time and the least regard for quality.\n\n## The Solution: Coverage Minutes\n\nCoverage Minutes are a finite resource earned through civic participation. Each debate contribution consumes exactly 3 minutes of Coverage Minutes. When a participant''s minutes are exhausted, they listen until they earn more.\n\n### Earning Mechanisms\n\n| Activity | Minutes Earned |\n|---|---|\n| Attend town hall | +15 |\n| Complete civic module | +30 |\n| Vote on proposals | +10 |\n| Serve as moderator | +45 |\n| File a petition | +20 |\n| Mentor a new member | +25 |\n\n### The 3-Minute Chunk\n\nWhy 3 minutes? Research on attention spans and argument structure suggests that a well-prepared speaker can make a complete point — claim, evidence, conclusion — in approximately 3 minutes. Longer contributions tend toward repetition or tangent.\n\n## Implementation\n\nThe Coverage Minutes system is integrated into Liana Banyan''s Political Expedition initiative. The Switzerland Protocol ensures the platform itself takes no political position — it provides infrastructure for discourse, not direction.\n\n## Economic Analysis\n\nBy making speech costly (in earned minutes, not money), the Muffled Rule creates a market for quality. Participants must choose their moments carefully. A member with 30 Coverage Minutes will use them on their strongest arguments, not on trolling.\n\nThis mirrors real-world legislative bodies where speaking time is allocated and managed. The innovation is making it democratic — anyone can earn minutes through civic engagement, regardless of status.\n\n## Conclusion\n\nThe Muffled Rule does not limit what people say. It limits how much airtime any single voice can consume. The result is debates where preparation matters more than persistence, and where every voice — not just the loudest — gets heard.',
  'review',
  1800,
  8,
  6,
  ARRAY[1505]
),
(
  'sweet-sixteen-integrated-ecosystem',
  'The Sweet Sixteen: How 16 Initiatives Work Together',
  NULL,
  'general',
  ARRAY['sweet-sixteen', 'initiatives', 'ecosystem'],
  'Founder',
  'seed',
  '[{"stage":"seed","enteredAt":"2026-03-18T00:00:00Z","wordCount":42}]'::jsonb,
  'Liana Banyan has 16 integrated initiatives spanning food, health, finance, manufacturing, education, and community safety. They share infrastructure, credits, and members. Together they create a cooperative ecosystem.',
  NULL,
  NULL,
  NULL,
  'draft',
  42,
  1,
  0,
  ARRAY[]::integer[]
)
ON CONFLICT (slug) DO NOTHING;
