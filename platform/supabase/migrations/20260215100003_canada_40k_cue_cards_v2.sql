-- ═══════════════════════════════════════════════════════════════
-- CANADA 40K RESCUE FLEET CUE CARDS — v2 (Corrected Numbers + New Cards)
-- "You Have A Play. I Have A Stage."
-- ═══════════════════════════════════════════════════════════════

-- Update existing cards to reflect correct innovation/patent numbers
-- and consistent "You Have A Play. I Have A Stage." framing

-- Main appeal card with corrected numbers
INSERT INTO public.cue_card_templates (template_type, initiative_slug, title, subtitle, body_text, hashtags, card_style, twitter_text, linkedin_text, facebook_text) VALUES

-- Primary Twitter card (280 chars)
('letter', 'international', 
 'You Have A Play. I Have A Stage.', 
 'To the 40,000 stranded Canadian founders',
 'Canada canceled 40,000 startup visas. 43,200 vetted entrepreneurs — with plans, skills, and courage — stranded. You have a play. I have a stage. Your dream didn''t get cancelled. Come build.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'StartupVisa', 'CooperativeEconomy'],
 'bold',
 'Canada cancelled 40,000 startup visas. 43,200 vetted entrepreneurs — with plans, skills, and courage — stranded.

You have a play. I have a stage.

Your dream didn''t get cancelled. Come build.
lianabanyan.com
#Canada40K #CooperativeEconomy',
 'Canada froze its Start-Up Visa program. 43,200 vetted entrepreneurs — people who wrote business plans, secured letters of support, proved their skills, and uprooted their lives — just lost their path forward.

You have a play. I have a stage.

Liana Banyan is a cooperative platform with 16 charitable initiatives, 1,000+ innovations, and patent claims across 6 applications (8 definite utility patents, 9 more possible). We need CTOs, developers, designers, marketers, operators. We''re offering ownership — real, constitutionally locked ownership — not jobs.

Your visa got cancelled. Your dream didn''t.

Read the full appeal → cephas.lianabanyan.com/letters/rescue-fleet/canada-40k-appeal/

#CooperativeEconomy #StartUpVisa #Canada40K #LianaBanyan',
 '40,000 entrepreneurs just lost their path to Canada. They did everything right. Canada shut the door anyway.

I''ve been building a cooperative platform for 9 years. I have the stage. You have the play.

If you know someone affected — or if you ARE someone affected — read this.

cephas.lianabanyan.com/letters/rescue-fleet/canada-40k-appeal/'),

-- Email subject line card
('letter', 'international',
 'Your Visa Got Cancelled. Your Dream Didn''t.',
 'Email subject line version',
 'Open letter to 40,000 stranded entrepreneurs: You have a play. I have a stage. Liana Banyan — 16 initiatives, 1,000+ innovations, real ownership. $5 to join. Come build.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'EmailSubject'],
 'minimal',
 NULL,
 NULL,
 NULL),

-- The Rose / Shakespeare consistency card
('letter', 'international',
 'The Rose Needs A Company',
 'You have a play. I have a stage.',
 'In Shakespeare in Love, the Rose Theatre stood empty. Shakespeare had a play. Ready. Written. The Rose needed a play. Shakespeare needed a theatre. Right now, you''re Shakespeare with a play and no stage. I have a stage. Let''s fill the theatre together.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'ShakespeareInLove', 'MutualRescue'],
 'quote',
 '🎭 The Rose needs a company. You have a play. I have a stage. 40,000 founders stranded — 1 cooperative platform ready. lianabanyan.com #Canada40K #MutualRescue',
 'It''s a mystery how it all works out. But the play is written. The stage is built. And the Rose needs a company.

You have a play. I have a stage.

To 40,000 stranded founders: Your visa got cancelled. Your dream didn''t.',
 NULL),

-- Corrected numbers showcase card
('letter', 'international',
 'What We''ve Built (For You To Operate)',
 '1,200+ CAD diagrams. 1,000+ innovations. 6 patent applications.',
 '9 years building. 1,200+ CAD diagrams. 1,000+ documented innovations. Patent claims across 6 applications (8 definite utility patents, 9 more possible from first 130 vetted with USPTO). Handwritten journals back to 2003. All documented at the2ndsecond.com. All waiting for operators.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'Infrastructure', 'PatentPortfolio'],
 'standard',
 '🏗️ 9 years building. 1,000+ innovations. 8+ utility patents. 16 initiatives. All waiting for operators. You have a play. I have a stage. lianabanyan.com #Canada40K',
 '9 years of building. What we have:

• 1,200+ CAD diagrams
• 1,000+ documented innovations  
• Patent claims across 6 applications
• 8 definite utility patents (9 more possible)
• 16 charitable initiatives ready to launch
• Handwritten journals back to prototypes from 2003

All documented at the2ndsecond.com. All waiting for operators.

You have a play. I have a stage.',
 NULL),

-- Mutual rescue framing
('letter', 'international',
 'Mutual Rescue',
 'This isn''t charity. This isn''t a handout.',
 'You need: A path to build your business, infrastructure, ownership. I need: CTOs, developers, designers, marketers, 150+ innovations need builders, 16 initiatives need leaders. You clearly need us. We clearly need you. Let''s go.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'MutualRescue'],
 'bold',
 '🤝 This isn''t charity. This isn''t a handout. This is MUTUAL RESCUE. You need infrastructure. We need operators. lianabanyan.com #Canada40K #MutualRescue',
 'This isn''t charity. This isn''t a handout. This is mutual rescue.

You need:
• A path to build your business — no visa required
• Infrastructure that''s already built
• Ownership stake through contribution, not capital

We need:
• CTOs, developers, designers, marketers, operations leads
• 150+ innovations need builders
• 16 initiatives need leaders at every level

You clearly need us. We clearly need you.',
 NULL),

-- Platform Joules explanation
('letter', 'international',
 'Not Stock Options. Real Ownership.',
 'Platform Joules: constitutionally protected cooperative ownership',
 'Stock options evaporate. Platform Joules don''t. Every hour you invest compounds into real, recorded, pro-rata ownership in a cooperative that''s designed to last. Your cash comes from your own business running on the platform''s rails.',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'PlatformJoules', 'RealOwnership'],
 'standard',
 '⚡ Not stock options. Platform Joules. Real ownership that doesn''t evaporate. Every hour compounds. lianabanyan.com #Canada40K #RealOwnership',
 NULL,
 NULL),

-- Call to action card
('letter', 'international',
 'Now. Definitely. Let''s Go.',
 'Founder@LianaBanyan.com',
 'Forty-plus thousand vetted entrepreneurs just got told "not now, maybe never." I''m saying: Now. Definitely. Let''s go. Visit lianabanyan.com. Sign up ($5/year). Tell us what you''re building. Or write: Founder@LianaBanyan.com',
 ARRAY['Canada40K', 'RescueFleet', 'LianaBanyan', 'LetsGo', 'JoinNow'],
 'bold',
 '🚀 "Not now, maybe never" — that''s what Canada said. I''m saying: NOW. DEFINITELY. LET''S GO. lianabanyan.com #Canada40K #LetsGo',
 '40,000+ vetted entrepreneurs just got told "not now, maybe never."

I''m saying: Now. Definitely. Let''s go.

1. Visit lianabanyan.com
2. Look at the roles and initiatives
3. Sign up ($5/year — a signal, not a business model)
4. Tell us what you''re building

Or write directly: Founder@LianaBanyan.com',
 '40,000 entrepreneurs just got told "not now, maybe never."

I''m saying: NOW. DEFINITELY. LET''S GO.

$5/year. Real ownership. 16 initiatives waiting for operators.

Founder@LianaBanyan.com');
