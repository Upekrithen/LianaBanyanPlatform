-- ═══════════════════════════════════════════════════════════════
-- K420 Task 1: Paper Patch — "What If You Had Unlimited Throws?"
-- Cross-reference to Pudding #183 (Triple Double + Lottery Ticket Monkeys)
-- TouchStone: B096-paper-patch-unlimited-throws
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
  'unlimited-throws-carnival-game',
  'Unlimited Throws: What If the Carnival Game Was Free?',
  'academic_paper',
  'articles/unlimited-throws-carnival-game.md',
  'clean_academic',
  E'## See Also\n\nPudding #183, *The Triple Double and the Lottery Ticket Monkeys,* applies the Unlimited Throws framework to the Triple Double Ladder — a concrete motivation system built on three doublings from a $100/day base. The carnival dart game framing is central to its argument that attempts, not outcomes, are the metric that matters.',
  'Why I built a free business simulator — and how failure becomes tuition instead of ruin. Explores the structural inequality of entrepreneurial access through the metaphor of a carnival dart game.',
  'Jonathan Jones',
  'Founder, Liana Banyan Corporation',
  'academic_paper',
  'B102',
  'K420',
  'live',
  ARRAY['pudding-183-triple-double-lottery-ticket-monkeys', 'hexisle-business-simulator'],
  now(),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  content_markdown = cephas_content_registry.content_markdown
    || E'\n\n## See Also\n\nPudding #183, *The Triple Double and the Lottery Ticket Monkeys,* applies the Unlimited Throws framework to the Triple Double Ladder — a concrete motivation system built on three doublings from a $100/day base. The carnival dart game framing is central to its argument that attempts, not outcomes, are the metric that matters.',
  related_slugs = array_cat(
    COALESCE(cephas_content_registry.related_slugs, ARRAY[]::text[]),
    ARRAY['pudding-183-triple-double-lottery-ticket-monkeys']
  ),
  knight_session = 'K420',
  updated_at = now();
