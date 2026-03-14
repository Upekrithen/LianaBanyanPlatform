-- =============================================================================
-- INNOVATION LOG — Reviewer Pipeline (Session 6) — 5 innovations #1595-#1599
-- =============================================================================

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1595, 'Blind review queue with polymorphic content support', 'Review queue supporting multiple content types (portfolio_item, recipe, business_plan, proposal, marketplace_listing, etc.) with content_snapshot and content_table for polymorphic lookup. Reviewers do not see submitter (blind review).', 'Platform', 'Single Provisional', 'pending'),
  (1596, 'SEC language auto-scanner with term dictionary', 'Automated scan of submitted content against sec_dangerous_terms table; highlights and suggests replacements; severity levels (critical, warning, info). Populates sec_flags and sec_flag_count on review_queue.', 'Platform', 'Single Provisional', 'pending'),
  (1597, 'Three-tier reviewer progression (Content → Stat → Harper)', 'Content Reviewer and Stat Reviewer tiers with application flow; Stat requires 50+ content reviews and Harper nomination; Harper tier for full Guild membership. reviewers table with tier, reviews_completed, accuracy_rate.', 'Platform', 'Single Provisional', 'pending'),
  (1598, 'Auto-submit triggers on content creation', 'When member creates or updates content requiring review, automatically insert into review_queue. Trigger points: Marketplace listing, Proposal, Recipe, Business plan. Auto SEC scan before insert.', 'Platform', 'Single Provisional', 'pending'),
  (1599, 'Reviewer accuracy tracking with overturn rate', 'reviews_overturned and generated accuracy_rate on reviewers table; review_history audit trail for claimed, approved, rejected, needs_revision, escalated, released, overturned.', 'Platform', 'Single Provisional', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
