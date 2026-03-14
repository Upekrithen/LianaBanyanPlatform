-- Session 11B Batch 5: Creator Draft Pick & Influencer Recruitment — innovations #1631-#1639

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1631, 'Creator Draft Pick Protocol (Bag 8)', 'Instagram-to-LB creator recruitment pipeline. First 5 identified creators; cue card and referral flow for bringing creators onto the platform.', 'Creator Recruitment', 'Bag 8', 'pending'),
  (1632, 'Verified Pre-Order Production Scaling (Bag 7)', 'Pre-orders drive production scale with verification; connects to demand aggregation and node-density intelligence.', 'Platform Data / Production', 'Bag 7', 'pending'),
  (1633, 'Multi-Path Creator Pitch Page (Bag 8)', 'Single landing page with questionnaire: Physical Products, Art & Design, Food, Music & Content, Business Ideas. Each path links to relevant initiative and Cost+20/Medallion/Influencer benefits.', 'Creator Recruitment', 'Bag 8', 'pending'),
  (1634, 'Red Carpet Creator Integration (Bag 8)', 'URL params ?ref=USERNAME and ?type=maker|food|art|music|business for personalized creator pitch and pre-selected category.', 'Creator Recruitment', 'Bag 8', 'pending'),
  (1635, 'Creator-to-Creator Daisy Chain (Bag 8)', 'Referral rewards for inviting creators; creator_referrals table and six-tier diminishing reward structure.', 'Creator Recruitment', 'Bag 8', 'pending'),
  (1636, 'Creator Benefits Showcase Card (Bag 8)', 'Benefits card on pitch page: Medallion tiers, Influencer status, Cost+20 pricing.', 'Creator Recruitment', 'Bag 8', 'pending'),
  (1637, 'Six-Tier Diminishing Referral Reward (Bag 7)', 'Pioneer (first 100, 10 Marks), Vanguard (101-500, 5), Pathfinder (501-2K, 3), Trailblazer (2K-10K, 2), Guide (10K-50K, 1.5), Ambassador (50K+, 1). dna_lock config.', 'Creator Recruitment', 'Bag 7', 'pending'),
  (1638, 'Cue Card Recruitment Protocol (Bag 8)', 'InviteCreatorCard: handle input, platform selector, cue card preview, Send creates creator_referrals row. Placement on Dashboard, CreatorPitchPage, Marketplace.', 'Creator Recruitment', 'Bag 8', 'pending'),
  (1639, 'In-Platform Social Media Viewer (Bag 9)', 'CreatorShowcase: creator name/avatar, See their work (Instagram/external), product images, Cost+20, Back this creator (BandWagon), Medallion tier. Marketplace integration.', 'Creator Recruitment', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
