-- ═══════════════════════════════════════════════════════════════
-- K420 Task 2: Paper Patch — "The Five Dollar Career" — Section 8
-- Cross-reference to Pudding #183 Cold Start pathway argument
-- TouchStone: B096-paper-patch-five-dollar-career
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.cephas_content_registry (
  slug,
  title,
  category,
  source_path,
  style,
  content_markdown,
  abstract,
  author,
  author_title,
  publication_type,
  bishop_session,
  knight_session,
  implementation_status,
  related_slugs,
  created_at,
  updated_at
)
VALUES (
  'five-dollar-career',
  'The Five Dollar Career',
  'academic_paper',
  'articles/five-dollar-career.md',
  'clean_academic',
  E'## Section 8 — The Cold Start Proof\n\nPudding #183 demonstrates the full Cold Start pathway in practice: Cue Cards test demand in Marks before dollars are spent. Treasure Maps crowdsource audience discovery. Campaign Forge builds materials using shared tools. The Red Carpet connects founders to mentors. The Recipe Pot assembles teams paid in Marks. The Commerce Engine handles compliance. The result: a founder deploys their $2,000–$5,000 only after the platform has validated the idea. The Five Dollar Career doesn''t start with five dollars. It starts with effort.',
  'How a $5/year membership creates a viable career pathway through cooperative infrastructure, Cold Start validation tools, and near-zero-risk business simulation.',
  'Jonathan Jones',
  'Founder, Liana Banyan Corporation',
  'academic_paper',
  'B102',
  'K420',
  'live',
  ARRAY['pudding-183-triple-double-lottery-ticket-monkeys', 'cold-start-pathway'],
  now(),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  content_markdown = cephas_content_registry.content_markdown
    || E'\n\n## Section 8 — The Cold Start Proof\n\nPudding #183 demonstrates the full Cold Start pathway in practice: Cue Cards test demand in Marks before dollars are spent. Treasure Maps crowdsource audience discovery. Campaign Forge builds materials using shared tools. The Red Carpet connects founders to mentors. The Recipe Pot assembles teams paid in Marks. The Commerce Engine handles compliance. The result: a founder deploys their $2,000–$5,000 only after the platform has validated the idea. The Five Dollar Career doesn''t start with five dollars. It starts with effort.',
  related_slugs = array_cat(
    COALESCE(cephas_content_registry.related_slugs, ARRAY[]::text[]),
    ARRAY['pudding-183-triple-double-lottery-ticket-monkeys']
  ),
  knight_session = 'K420',
  updated_at = now();
