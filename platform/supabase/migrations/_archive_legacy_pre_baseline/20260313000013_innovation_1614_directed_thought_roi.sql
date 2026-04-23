-- Session 11B: Innovation #1614 — Directed-Thought ROI (No Atomo paper)
-- See INNOVATION_NO_ATOMO_AI_COLLABORATION_VALUE.md

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES (
  1614,
  'Directed-Thought ROI in Human-AI Collaboration',
  'The theorem that a founder''s strategic prompt (~$0.10 in tokens) produces orders of magnitude more value than the cost of wrong implementations it prevents. Demonstrated: 14 innovations from one conversational message. The directed thought is the highest-value resource in human-AI collaboration.',
  'Platform',
  'Single Provisional',
  'pending'
)
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
