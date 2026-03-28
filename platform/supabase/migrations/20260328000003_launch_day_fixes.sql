-- =============================================================================
-- MIGRATION: 20260328000003_launch_day_fixes
-- PURPOSE:   Launch day data fixes — SlottedTop download URL, stats sync,
--            campaign data, MoneyPenny digest config
-- DATE:      2026-03-28  |  Bishop 037
-- =============================================================================

-- ─── B-2: Seed SlottedTop download URL ──────────────────────────────────────
UPDATE public.hexisle_downloads
SET stl_url = '/models/slottedTop_v1.obj',
    thumbnail_url = '/images/medallion-front.png'
WHERE piece_slug = 'slotted-top';

-- ─── B-7: La Capital del Sabor — real campaign data ─────────────────────────
-- Seed as a real business campaign using Pawn B21 research
INSERT INTO public.business_campaigns (
  slug, name, description, business_type, location_city, location_state,
  status, captain_pitch_ready, created_at
) VALUES (
  'la-capital-del-sabor',
  'La Capital del Sabor',
  'Authentic Mexican restaurant — the first Captain Pitch target. Family-owned, community-rooted. Testing the full Captain System: Walking Billboard, Tiered Commitment (C+20 through C+90), Family Table Cookbook integration, and Delivery Driver Discovery Funnel.',
  'restaurant',
  'Billings',
  'MT',
  'active',
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  captain_pitch_ready = EXCLUDED.captain_pitch_ready,
  updated_at = now();

-- ─── B-8: Stats sync ────────────────────────────────────────────────────────
-- Update platform_canonical to match Bishop 037 counts
UPDATE public.platform_canonical
SET innovation_count = 2078,
    production_systems = 28,
    crown_jewels = 146
WHERE id = (SELECT id FROM public.platform_canonical LIMIT 1);

-- If no row exists, insert one
INSERT INTO public.platform_canonical (innovation_count, production_systems, crown_jewels)
SELECT 2078, 28, 146
WHERE NOT EXISTS (SELECT 1 FROM public.platform_canonical LIMIT 1);
