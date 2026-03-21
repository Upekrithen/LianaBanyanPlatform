-- =============================================================================
-- INNOVATION LOG — Bishop Session 018F — 3 innovations #1806-#1808
-- Defense Klaus Banner, Crown Letter Updates, Make it Local Template
-- =============================================================================
-- Source: BISHOP_DROPZONE/AA_SESSION_018F_FINAL_ROUND.md
-- Count after: 1,808

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1806, 'Defense Klaus I Need a Hero Initiative Banner', 'Permanent banner on Defense Klaus Pedestal and Detail pages: $5/Week I Need a Hero — 3 Elves + 3 Spotters minimum per activation. Never respond alone. Subscription funds standing bounty. Primary CTA for Defense Klaus initiative.', 'UX / Marketing / Safety', 'Bag 9', 'pending'),
  (1807, 'Crown Letter Living Update Links', 'Every Crown Letter gets persistent update link at bottom: lianabanyan.com/updates/crown/{slug}. Shows original letter date, timeline of changes, current state, personalized What Changed That Matters To You section. Cross-pollinates with Daily News — updates become News Items. Write once, distribute twice.', 'Communications / Content Strategy', 'Bag 9', 'pending'),
  (1808, 'Make it Local International Onboarding Template', 'Repeatable template for international creator/service provider onboarding. Shows: current revenue model, how LB supplements not replaces, LB economics applied to their situation, mini business plan, Make it Local value prop. Founding Medallion offer in exchange for case study permission. Dual-platform revenue analysis.', 'Business Planning / Onboarding', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
