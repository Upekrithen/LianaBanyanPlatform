-- ═══════════════════════════════════════════════════════════════
-- CANADA 40K RESCUE FLEET CUE CARDS
-- "The Rose Was Empty. We Have A Play."
-- ═══════════════════════════════════════════════════════════════

-- Main Rescue Fleet appeal card
INSERT INTO public.cue_card_templates (template_type, initiative_slug, title, subtitle, body_text, hashtags, card_style, twitter_text, linkedin_text, facebook_text) VALUES
('letter', 'international', 
 'The Rose Was Empty. We Have A Play.', 
 'To the 40,000 stranded Canadian founders',
 'Canada canceled 40,000 startup visas. That''s 40,000 founders with skills, ideas, and nowhere to go. We have a platform with 16 initiatives, 928 innovations, and no one to operate it. You clearly need us. We clearly need you. Let''s go.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'StartupVisa', 'Founders'],
 'bold',
 '🚢 Canada canceled 40K startup visas. We have a platform ready. You clearly need us. We clearly need you. cephas.lianabanyan.com/letters/rescue-fleet/canada-40k-appeal/ #Canada40K #RescueFleet',
 'To the 40,000 founders stranded by Canada''s visa cancellation: The Rose was empty. Shakespeare had a play. Canada canceled your visa. We have a platform — 928 innovations, 16 initiatives, waiting for operators. $5 to join. Ownership. Governance. Real work. Read the full appeal.',
 'Canada just canceled 40,000 startup visas. 40,000 entrepreneurs with skills, ideas, and nowhere to go. We have a platform with 16 initiatives ready to launch and no one to operate them. "The Rose was empty. We have a play." Read the full appeal.'),

-- Skills-focused card
('letter', 'international',
 'Your Startup Skills → Our Platform',
 'Positions waiting. Ownership included.',
 'You came to Canada to build a company. We have 16 initiatives that need operators. Your technical skills become platform development. Your business acumen becomes guild leadership. Your network becomes our network. $5 to join. 83.3% forever.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'FounderOpportunity'],
 'standard',
 '💼 Your startup skills → Platform operations. Your network → Our network. 83.3% forever. $5 to join. lianabanyan.com/join #Canada40K #LianaBanyan',
 'You were going to build a company. We have 16 initiatives that need operators. Your technical skills become platform development. Your business acumen becomes guild leadership. $5 membership. 83.3% creator retention. Governance rights. Real ownership.',
 NULL),

-- The Math card
('letter', 'international',
 'The Math for Stranded Founders',
 '40,000 founders × 1 platform = everyone wins',
 'You: Visa canceled, skills unused, network scattered. Us: Platform ready, positions open, infrastructure waiting. Math: 40,000 founders × 1 cooperative platform = mutual survival. $5/year. Real work. Real ownership.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'TheMath'],
 'minimal',
 '📊 40,000 founders × 1 platform = everyone wins. Visa canceled? Skills wasted? Not anymore. lianabanyan.com #Canada40K #RescueFleet',
 NULL,
 NULL),

-- Boaz Principle card  
('letter', 'international',
 'The Boaz Principle',
 'Not charity. Deliberately easier paths.',
 'In the Book of Ruth, Boaz instructed harvesters to "pull out some stalks" for Ruth to gather. Not charity — dignity. The opportunity to work for what you earn, with the path deliberately made easier. We''re pulling out stalks. Founder@LianaBanyan.com — Subject: "Rescue Fleet"',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'BoazPrinciple', 'Dignity'],
 'quote',
 '🌾 "Pull out some stalks." Not charity — dignity. Deliberately easier paths for those who need them. Founder@LianaBanyan.com Subject: "Rescue Fleet" #Canada40K #LianaBanyan',
 'The Boaz Principle: "Pull out some stalks and leave them for her to gather." Not charity — dignity. The opportunity to work for what you earn, with the path deliberately made easier. To stranded founders: we''re pulling out stalks. Join us.',
 NULL),

-- Shakespeare in Love reference card
('letter', 'international',
 'Canada Canceled Your Visa',
 'We Have A Platform.',
 'In Shakespeare in Love, the Rose Theatre stood empty. The players had scattered. Then Shakespeare showed up with a play. Ready to perform. The Rose needed a play. Shakespeare needed a theatre. You clearly need us. We clearly need you.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'ShakespeareInLove'],
 'quote',
 '🎭 The Rose was empty. Shakespeare had a play. Canada canceled your visa. We have a platform. lianabanyan.com #Canada40K #RescueFleet',
 NULL,
 NULL),

-- Direct call to action
('letter', 'international',
 'Rescue Fleet: How to Join',
 'Founder@LianaBanyan.com — Subject: "Rescue Fleet"',
 '1. Email: Founder@LianaBanyan.com — Subject: "Rescue Fleet" 2. Include: Your skills, your situation, what you want to build. 3. Receive: Position matching, onboarding, immediate opportunities. Or just join at lianabanyan.com/join — we''ll find you.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'JoinNow'],
 'standard',
 '📧 Join the Rescue Fleet: Founder@LianaBanyan.com Subject: "Rescue Fleet" — or just join at lianabanyan.com/join #Canada40K #RescueFleet',
 'How to join the Rescue Fleet: 1. Email Founder@LianaBanyan.com with subject "Rescue Fleet" 2. Include your skills, situation, and what you want to build 3. Receive position matching and immediate opportunities. Or join at lianabanyan.com/join',
 NULL),

-- You're Not Refugees card
('letter', 'international',
 'You''re Not Refugees.',
 'You''re Reinforcements.',
 'You came to build something. The visa got canceled, but the skills didn''t. The ambition didn''t. The drive didn''t. You''re not refugees from a canceled program. You''re reinforcements for what we''re building. Join us.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'Reinforcements'],
 'bold',
 '⚔️ You''re not refugees. You''re REINFORCEMENTS. The visa got canceled. The skills didn''t. lianabanyan.com/join #Canada40K #RescueFleet',
 'To every founder affected by Canada''s visa cancellation: You''re not refugees from a failed program. You''re reinforcements for what we''re building. Your skills, your drive, your ambition — intact. Join us. Build with us.',
 NULL);
