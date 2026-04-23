-- K355 Pending: Seed subscription tiers, crew call roles, backfill owner_user_id, create storage bucket

-- =====================
-- 1. Backfill storefronts.owner_user_id from user_id
-- =====================
UPDATE storefronts SET owner_user_id = user_id WHERE owner_user_id IS NULL AND user_id IS NOT NULL;

-- =====================
-- 2. Seed subscription tiers for service-oriented storefronts
--    Original columns: (business_id, tier_name, frequency_per_week, discount_percent, min_categories, is_active)
--    K355-added columns: (storefront_id, service_frequency, service_description)
-- =====================
DO $$
DECLARE
  coop_class_id uuid;
  bounty_photo_id uuid;
BEGIN
  SELECT id INTO coop_class_id FROM storefronts WHERE slug = 'cooperative-classroom' LIMIT 1;
  SELECT id INTO bounty_photo_id FROM storefronts WHERE slug = 'bounty-photography' LIMIT 1;

  IF coop_class_id IS NOT NULL THEN
    INSERT INTO subscription_tiers (business_id, tier_name, frequency_per_week, discount_percent, storefront_id, service_frequency, service_description)
    VALUES
      (coop_class_id, 'Weekly Tutoring Session', 1, 0, coop_class_id, 'weekly',
       '1-on-1 tutoring session via Zoom. 45 minutes. Subject of your choice. $25/session.'),
      (coop_class_id, 'Biweekly Study Group', 1, 5.0, coop_class_id, 'biweekly',
       'Small group session (up to 4 students). 60 minutes. Math, science, or language. $15/session.'),
      (coop_class_id, 'Monthly Masterclass', 1, 10.0, coop_class_id, 'monthly',
       'Deep-dive masterclass with specialist tutor. 90 minutes. Recorded for replay. $40/session.')
    ON CONFLICT DO NOTHING;
  END IF;

  IF bounty_photo_id IS NOT NULL THEN
    INSERT INTO subscription_tiers (business_id, tier_name, frequency_per_week, discount_percent, storefront_id, service_frequency, service_description)
    VALUES
      (bounty_photo_id, 'Monthly Event Coverage', 1, 0, bounty_photo_id, 'monthly',
       'One event per month. Up to 2 hours. 50 edited photos delivered within 48 hours. $120/month.'),
      (bounty_photo_id, 'Weekly Social Content', 1, 5.0, bounty_photo_id, 'weekly',
       '5 product/lifestyle photos per week for your storefront and social media. $45/week.'),
      (bounty_photo_id, 'Quarterly Brand Refresh', 1, 10.0, bounty_photo_id, 'quarterly',
       'Full brand photo shoot. Headshots, product photos, storefront imagery. 100+ edited photos. $200/quarter.')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================
-- 3. Seed crew_call_roles linked to storefronts
--    Original required columns: (role_name, category, description, commitment_tier)
--    K355-added columns: (storefront_id, hourly_rate, schedule_description)
-- =====================
DO $$
DECLARE
  coop_class_id uuid;
  bounty_photo_id uuid;
  montana_id uuid;
  hexisle_id uuid;
  factory_id uuid;
BEGIN
  SELECT id INTO coop_class_id FROM storefronts WHERE slug = 'cooperative-classroom' LIMIT 1;
  SELECT id INTO bounty_photo_id FROM storefronts WHERE slug = 'bounty-photography' LIMIT 1;
  SELECT id INTO montana_id FROM storefronts WHERE slug = 'montana-makers' LIMIT 1;
  SELECT id INTO hexisle_id FROM storefronts WHERE slug = 'hexisle-terrain-shop' LIMIT 1;
  SELECT id INTO factory_id FROM storefronts WHERE slug = 'the-2nd-second-factory' LIMIT 1;

  IF coop_class_id IS NOT NULL THEN
    INSERT INTO crew_call_roles (role_name, category, description, commitment_tier, storefront_id, hourly_rate, schedule_description)
    VALUES
      ('Math Tutor', 'education', 'Teach algebra, geometry, or calculus to middle/high school students via Zoom.',
       'primary', coop_class_id, 20.00, '3-5 sessions/week, flexible hours'),
      ('ESL Instructor', 'education', 'Teach English as a Second Language. Conversational focus. All levels.',
       'secondary', coop_class_id, 18.00, '2-4 sessions/week, evenings preferred')
    ON CONFLICT DO NOTHING;
  END IF;

  IF bounty_photo_id IS NOT NULL THEN
    INSERT INTO crew_call_roles (role_name, category, description, commitment_tier, storefront_id, hourly_rate, schedule_description)
    VALUES
      ('Event Photographer', 'creative', 'Cover community events, storefront openings, and Cold Start launches.',
       'primary', bounty_photo_id, 25.00, 'Weekend events, 2-4 hours each'),
      ('Product Photographer', 'creative', 'Shoot product photos for marketplace storefronts. Studio or on-location.',
       'secondary', bounty_photo_id, 22.00, 'Weekday mornings, 3-4 shoots/week')
    ON CONFLICT DO NOTHING;
  END IF;

  IF montana_id IS NOT NULL THEN
    INSERT INTO crew_call_roles (role_name, category, description, commitment_tier, storefront_id, hourly_rate, schedule_description)
    VALUES
      ('Woodworking Apprentice', 'manufacturing', 'Learn timber work alongside master craftspeople. Cutting boards, furniture, custom pieces.',
       'primary', montana_id, 15.00, '3 days/week, full days, on-site Montana')
    ON CONFLICT DO NOTHING;
  END IF;

  IF hexisle_id IS NOT NULL THEN
    INSERT INTO crew_call_roles (role_name, category, description, commitment_tier, storefront_id, hourly_rate, schedule_description)
    VALUES
      ('3D Modeler', 'digital', 'Design hex terrain tiles, character bases, and terrain accessories in Blender/Fusion 360.',
       'primary', hexisle_id, 30.00, 'Remote, 10-20 hrs/week'),
      ('Print Farm Operator', 'manufacturing', 'Run and maintain 3D printers for terrain production. Quality control on every batch.',
       'secondary', hexisle_id, 18.00, 'On-site, 4 days/week')
    ON CONFLICT DO NOTHING;
  END IF;

  IF factory_id IS NOT NULL THEN
    INSERT INTO crew_call_roles (role_name, category, description, commitment_tier, storefront_id, hourly_rate, schedule_description)
    VALUES
      ('Assembly Technician', 'manufacturing', 'Assemble Canister System components. Quality check snap-fit tolerances.',
       'primary', factory_id, 16.00, 'On-site, 5 days/week, 6hr shifts'),
      ('Shipping Coordinator', 'logistics', 'Pack, label, and ship pre-orders. Coordinate with Printful and local carriers.',
       'secondary', factory_id, 15.00, '3 days/week, flexible')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================
-- 4. Create storage bucket for service completion photos
-- =====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-photos',
  'service-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (use DO block to skip if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_photos_insert_auth') THEN
    CREATE POLICY "service_photos_insert_auth"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'service-photos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_photos_select_public') THEN
    CREATE POLICY "service_photos_select_public"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'service-photos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_photos_update_own') THEN
    CREATE POLICY "service_photos_update_own"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'service-photos' AND (storage.foldername(name))[2] = auth.uid()::text);
  END IF;
END $$;
