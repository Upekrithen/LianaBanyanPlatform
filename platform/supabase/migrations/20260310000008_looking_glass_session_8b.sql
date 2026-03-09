-- ================================================================
-- LOOKING GLASS — Session 8B Updates
-- ================================================================
-- Updates stale entries and adds new milestones from Session 8B.
-- Innovation count: 1,551 (was 1,187 in original entries)
-- Patent claims: 218 (was 210)
-- Routes: 374 (was 100+)
-- Database tables: 253 migrations (was 190+)
-- ================================================================

-- Update the Patent Portfolio entry with current counts
UPDATE public.looking_glass_entries
SET body = '1,551 innovations documented across 7 patent applications with 218 formal claims.',
    updated_at = NOW()
WHERE title = 'Patent Portfolio'
  AND entry_type = 'milestone';

-- Update Platform Launch entry with current counts
UPDATE public.looking_glass_entries
SET body = 'Liana Banyan Platform deployed with 374 routes, 253 database migrations, and all 16 initiatives wired across 10 Firebase hosting sites.',
    updated_at = NOW()
WHERE title = 'Platform Launch'
  AND entry_type = 'milestone';

-- Insert new Session 8B milestone entries
INSERT INTO public.looking_glass_entries (entry_type, title, body, category, visibility, source_agent)
VALUES
  ('milestone', 'Session 8B — Flagship Projects',
   'Seeded Coaster Medallion and Let''s Make Dinner as flagship projects with production levels, pledge system, and funding progress tracking.',
   'platform', 'public', 'BISHOP'),

  ('milestone', 'Session 8B — Side Quests System',
   'Launched flexible Side Quests: 12 categories, 4 difficulty levels, Three-Gear Currency rewards (Credits + Marks + Joules + XP). Boaz Principle: zero barriers to entry.',
   'features', 'public', 'BISHOP'),

  ('milestone', 'Session 8B — SEC Language Compliance',
   'Completed SEC language cleanup across 63+ files. Renamed database columns: equity to participation, investor to backer across 13 tables. Four critical files flagged for removal.',
   'legal', 'public', 'BISHOP'),

  ('milestone', 'Session 8B — Code Splitting & Performance',
   'Implemented vendor chunk splitting: React, UI, Data, Viz, Web3, i18n. Main bundle reduced from 5,219KB to 4,265KB (20% reduction).',
   'platform', 'public', 'BISHOP'),

  ('decision', 'No Cloudflare Dependency',
   'Founder directive: no third-party CDN dependency. All domains route directly from registrar to Firebase Hosting. Client-side SPA routing (hofund/bifrost) handles portal switching.',
   'governance', 'public', 'BISHOP'),

  ('milestone', 'Session 8B — Custom Domains Complete',
   'All 10 Firebase hosting sites configured with custom domains. 7 www variants added. SSL certificates active through May 2026.',
   'platform', 'public', 'BISHOP'),

  ('log', 'Innovation Count Updated to 1,551',
   'Three new innovations added in Session 8B: #1549 Flagship Project Seeding, #1550 Side Quests System, #1551 Preference Switch Confirmation Dialog.',
   'patents', 'public', 'BISHOP')

ON CONFLICT DO NOTHING;
