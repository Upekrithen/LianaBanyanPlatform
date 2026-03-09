-- ═══════════════════════════════════════════════════════════════
-- SPONSOR TO OWN — VIRAL CUE CARDS
-- "Help someone else join. Own our patents."
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.cue_card_templates (template_type, initiative_slug, title, subtitle, body_text, hashtags, card_style, twitter_text, linkedin_text, facebook_text) VALUES

-- Main hook card
('general', NULL,
 'Help Someone Else Join.',
 'Own Our Patents.',
 'The most counterintuitive offer you''ll see today: Give us $25 to help OTHER people join our platform. In exchange, we give YOU fractional ownership of our utility patent portfolio. 8 definite patents, 9 more possible, across 1,000+ innovations. Real IP. Real ownership.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'PatentOwnership', 'CooperativeEconomics'],
 'bold',
 '🎁 Help someone else join. Own our patents. $25 = 5 new members + your fractional patent stake. lianabanyan.com/sponsor #SponsorToOwn #LianaBanyan',
 'The most counterintuitive offer in tech: Give $25 to help OTHER people join a cooperative platform. In exchange, receive fractional ownership of 210 patent claims across 7 filed applications. When those patents are licensed, you get paid. Real IP ownership, not tokens.',
 'What if helping other people join a platform gave YOU ownership of its patents? $25 sponsors 5 new members AND gives you fractional ownership of 210 patent claims. When companies license our innovations, you get paid.'),

-- The math card
('general', NULL,
 '$25 = 5 Members + Patent Ownership',
 'Do the math.',
 '$25 sponsors 5 new members. You receive fractional ownership of 210 patent claims. When patents are licensed: 60% to operations, 20% to inventors, 20% to YOU (the Sponsor Pool). Real ownership. Real royalties.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'PatentMath', 'RealOwnership'],
 'standard',
 '📊 $25 = 5 new members + patent stake. When patents license: 60% ops, 20% inventors, 20% YOU. lianabanyan.com/sponsor #SponsorToOwn',
 NULL,
 NULL),

-- Tiers card
('general', NULL,
 'Sponsor Tiers',
 '$25 to $5,000 — Real patent ownership at every level',
 '$25 Seedling = 5 members (0.001%). $100 Sapling = 20 members (0.005%). $500 Tree = 100 members (0.025%). $1,000 Grove = 200 members (0.05%). $5,000 Forest = 1,000 members (0.25%). Every tier owns patents.',
 ARRAY['LianaBanyan', 'SponsorTiers', 'PatentOwnership'],
 'minimal',
 '🌱 Seedling: $25 → Sapling: $100 → Tree: $500 → Grove: $1K → Forest: $5K. Every tier owns patents. lianabanyan.com/sponsor #SponsorToOwn',
 'Sponsor tiers: $25 Seedling (5 members, 0.001% patents), $100 Sapling (20 members), $500 Tree (100 members), $1,000 Grove (200 members), $5,000 Forest (1,000 members, 0.25% patents). Real ownership at every level.',
 NULL),

-- What you own card
('general', NULL,
 'What You Actually Own',
 '210 patent claims. Real IP.',
 'Not tokens. Not "shares." Real utility patents: 8 definite, 9 more possible, across 1,000+ innovations. The 300 Governance, Harper Certification, Tab System, Three-Gear Currency. When ANY company licenses these, sponsors get paid.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'RealPatents', 'ActualOwnership'],
 'bold',
 '📜 Not tokens. Real patents. 8 definite, 9 more possible across 1,000+ innovations. When they license, you get paid. lianabanyan.com/sponsor #RealOwnership',
 'What you actually own as a Sponsor: 8 definite utility patents (9 more possible) covering decentralized governance, automated trust systems, and cooperative economics. When any company licenses these innovations, the Sponsor Pool gets 20% of royalties.',
 NULL),

-- Giving is getting card
('general', NULL,
 'The More You Give Away',
 'The More You Own.',
 'Traditional investing: You give money to get ownership. Sponsor Pool: You give money to help OTHERS — and get ownership anyway. The more people you sponsor, the larger your patent stake. Giving IS getting.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'GivingIsGetting', 'CooperativeOwnership'],
 'quote',
 '🎁 The more you give away, the more you own. Sponsor others → own patents. lianabanyan.com/sponsor #GivingIsGetting #LianaBanyan',
 NULL,
 NULL),

-- 80% of something card
('general', NULL,
 '80% of Something',
 '> 100% of Nothing',
 'The founder could have kept 100% of the patents. Instead, he''s giving 20% to anyone willing to help others join. Why? Because 80% of something millions defend is worth more than 100% of something nobody uses.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'FounderLogic', 'PatentPool'],
 'quote',
 '📐 "80% of something > 100% of nothing." That''s why 20% of patents go to sponsors. lianabanyan.com/sponsor #SponsorToOwn',
 'The founder''s logic: "I could keep 100% of patents with no users. Or give 20% to sponsors who help millions join. 80% of something millions defend beats 100% of something nobody uses."',
 NULL),

-- Not a security card
('general', NULL,
 'Not a Security.',
 'A Gift.',
 'This isn''t investing. You''re funding memberships. We''re gifting you patent ownership in gratitude. If patents generate nothing, you helped people and got nothing. If they generate billions, you helped people and got paid.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'NotASecurity', 'PatentGift'],
 'minimal',
 '⚖️ Not a security. A gift. Fund memberships → receive patent ownership → maybe get paid when patents license. lianabanyan.com/sponsor #SponsorToOwn',
 NULL,
 NULL),

-- Comparison card
('general', NULL,
 'The Sponsor Pool vs. Everything Else',
 'Real ownership. Real IP. Real royalties.',
 'VC: Equity that dilutes, board maybe, exit IPO. Crowdfunding: Maybe a product, no control, no exit. Crypto: Speculative token, governance maybe, sell to greater fool. Sponsor Pool: REAL patent ownership, voting rights, sell stake back.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'RealOwnership', 'NotCrypto'],
 'standard',
 '📊 VC: dilutes. Crowdfunding: maybe a product. Crypto: speculation. Sponsor Pool: REAL patent ownership. lianabanyan.com/sponsor #RealOwnership',
 'Investment comparison: VC gives equity that dilutes + maybe a board seat. Crowdfunding gives maybe a product + no control. Crypto gives speculative tokens. Sponsor Pool gives REAL patent ownership + voting rights + ability to sell stake.',
 NULL),

-- Who should sponsor card
('general', NULL,
 'Perfect For:',
 'People who want to help AND own.',
 'Believe in coops but can''t run a business? Sponsor. Want exposure without extraction? Sponsor. Want ownership not thank-you notes? Sponsor. Don''t know how to help? Sponsor. $25 sponsors 5 people AND gives you patent stake.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'WhoShouldSponsor'],
 'standard',
 '✅ Believe in coops? Want real ownership? Don''t know how to help? $25 sponsors 5 people + patent stake. lianabanyan.com/sponsor #SponsorToOwn',
 NULL,
 NULL),

-- Bottom line card
('general', NULL,
 'Give $25. Help 5 People.',
 'Own 210 Patent Claims.',
 'Give $25 to help 5 people join. Receive fractional ownership of 8+ utility patents across 1,000+ innovations. Get paid when patents license. Or don''t — and those 5 people still got helped. That''s the offer.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'BottomLine', 'SimpleOffer'],
 'bold',
 '💎 $25 → 5 people helped → 8+ utility patents owned → royalties when licensed. Or just: 5 people helped. lianabanyan.com/sponsor #SponsorToOwn',
 'The bottom line: Give $25. Help 5 people join a cooperative platform. Receive fractional ownership of 8+ utility patents. Get paid when those patents are licensed. Or don''t — and those 5 people still got helped.',
 'Give $25. Help 5 people join. Own 8+ utility patents. Get paid when patents license. Or just know you helped 5 people. That''s it. That''s the whole offer.'),

-- Rescue Fleet combo card
('letter', 'international',
 'Sponsor a Stranded Founder',
 'Canada 40K + Patent Ownership',
 'Canada canceled 40,000 startup visas. Sponsor a stranded founder: Pay their membership. Fund their starter credits. Get them a position. Receive YOUR patent ownership stake. Help them build. Own what they build on.',
 ARRAY['Canada40K', 'SponsorToOwn', 'RescueFleet', 'LianaBanyan'],
 'bold',
 '🚢 Sponsor a stranded Canadian founder. They get a position. You get patent ownership. Everyone builds together. lianabanyan.com/sponsor #Canada40K #SponsorToOwn',
 'Canada canceled 40,000 startup visas. You can sponsor a stranded founder: fund their membership, give them starter credits, match them with a position on our platform. In exchange, receive fractional ownership of our patent portfolio. They build. You own.',
 NULL),

-- The hook card (viral format)
('general', NULL,
 'I Will Give You My Patents',
 'If You Help Someone Else Join.',
 'I spent 37 years building 1,000+ innovations. Filed 6 patent applications (8 definite, 9 more possible). I''m giving 20% of it to anyone willing to sponsor new members. Not investors. Not VCs. People who help other people. That''s the only qualification.',
 ARRAY['LianaBanyan', 'SponsorToOwn', 'FounderOffer', 'GiveItAway'],
 'quote',
 '🎁 "I''ll give you my patents — if you help someone else join." 37 years. 8+ utility patents, 1,000+ innovations. 20% goes to sponsors. lianabanyan.com/sponsor #SponsorToOwn',
 '37 years building innovations. 1,000+ documented, 6 patent applications filed (8 definite utility patents). I''m giving 20% to anyone who sponsors new members. Not to investors. Not to VCs. To people who help other people join. That''s the only qualification.',
 NULL);
