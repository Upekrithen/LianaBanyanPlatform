-- =============================================================================
-- MIGRATION: 20260328000004_seed_la_capital
-- PURPOSE:   Seed La Capital del Sabor as first real business campaign +
--            restaurant listing for the Cookbook/Family Table system.
-- DATE:      2026-03-28  |  Bishop 036
-- =============================================================================

-- Seed into restaurant_listings for the /cookbook/:restaurantId page
INSERT INTO public.restaurant_listings (
  name, address, city, state, cuisine, price_range,
  partnership_tier, discount_pct, description, delivery_options,
  scheduling_available
) VALUES (
  'La Capital del Sabor',
  'Bandera Rd',
  'San Antonio',
  'TX',
  ARRAY['Mexican', 'Latin American'],
  '$6.99-$14.55',
  'c90',
  10,
  'Authentic Mexican restaurant — the first Captain Pitch target. Family-owned, community-rooted. Known for handmade tortillas, slow-cooked meats, and family-size portions that bring the neighborhood together. Featured on mysanantonio.com/food. La Capital is the proof that cooperative commerce starts with the places people already love.',
  ARRAY['pickup', 'own_delivery'],
  true
) ON CONFLICT DO NOTHING;

-- Seed into business_campaigns (requires nominated_by — use first admin user)
-- If no admin user exists, skip gracefully
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT user_id INTO admin_uid FROM public.user_roles WHERE role = 'admin' LIMIT 1;

  IF admin_uid IS NOT NULL THEN
    INSERT INTO public.business_campaigns (
      business_name, business_type, business_city, business_state,
      business_address, slug, description, nominated_by,
      nomination_reason, proposed_discount_pct, pledge_threshold, status
    ) VALUES (
      'La Capital del Sabor',
      'restaurant',
      'San Antonio',
      'TX',
      'Bandera Rd',
      'la-capital-del-sabor',
      'First Captain Pitch target. Family-owned Mexican restaurant testing the full Captain System: Walking Billboard, Tiered Commitment (C+20 through C+90), Family Table Cookbook integration, and Delivery Driver Discovery Funnel. If this works here, it works everywhere.',
      admin_uid,
      'First Captain Pitch — proof of concept for the entire cooperative restaurant onboarding pipeline.',
      20.0,
      30,
      'gathering'
    ) ON CONFLICT (slug) DO UPDATE SET
      description = EXCLUDED.description,
      status = EXCLUDED.status;
  END IF;
END $$;
