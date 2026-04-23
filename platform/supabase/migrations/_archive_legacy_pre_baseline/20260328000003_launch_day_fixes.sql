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
  slug, business_name, description, business_type, business_city, business_state,
  nominated_by, status, created_at
) VALUES (
  'la-capital-del-sabor',
  'La Capital del Sabor',
  'Authentic Mexican restaurant — the first Captain Pitch target. Family-owned, community-rooted. Testing the full Captain System: Walking Billboard, Tiered Commitment (C+20 through C+90), Family Table Cookbook integration, and Delivery Driver Discovery Funnel.',
  'restaurant',
  'San Antonio',
  'TX',
  '330eafae-4dfe-4e01-941f-47e7df55b7b5',
  'active',
  now()
) ON CONFLICT (slug) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ─── B-8: Stats sync ────────────────────────────────────────────────────────
-- Update platform_canonical key-value pairs to match Bishop 037 counts
INSERT INTO public.platform_canonical (key, value, description, last_updated_by, updated_at)
VALUES
  ('innovation_count', 2078, 'Total documented innovations', 'K148+', now()),
  ('production_systems', 28, 'Production systems count', 'K148+', now()),
  ('crown_jewels', 146, 'Crown Jewels filed across provisionals', 'K148+', now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  last_updated_by = EXCLUDED.last_updated_by,
  updated_at = now();
