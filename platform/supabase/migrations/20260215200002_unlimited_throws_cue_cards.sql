-- ═══════════════════════════════════════════════════════════════
-- UNLIMITED THROWS CUE CARDS
-- "What If the Carnival Game Was Free?"
-- For Medium, SSIR, and viral sharing
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.cue_card_templates (template_type, initiative_slug, title, subtitle, body_text, hashtags, card_style, twitter_text, linkedin_text, facebook_text) VALUES

-- Main hook (the HN quote)
('article', 'lets-make-bread',
 'Rich Kids Get Unlimited Throws',
 'What if the carnival game was free?',
 '"Entrepreneurship is like one of those carnival games where you throw darts. Middle class kids can afford one throw. Most miss. Rich kids can afford many throws. Poor kids aren''t visiting the carnival. They''re the ones working it." — So I built a free carnival.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'HexIsle', 'Entrepreneurship', 'FairChance'],
 'quote',
 '"Rich kids get unlimited throws. Middle class kids get one. Poor kids work the carnival."

So I built a free carnival. One throw per day for everyone. Unlimited for $5/year.

lianabanyan.com
#UnlimitedThrows',
 '"Entrepreneurship is like a carnival game where you throw darts. Middle class kids can afford one throw. Rich kids can afford many throws. Poor kids aren''t visiting the carnival — they''re working it."

That 2017 Hacker News thread resonated with hundreds. The consensus: life isn''t fair.

But that''s a description, not a design. And design is the part we can change.

So I built a free carnival. The HexIsle Business Simulator lets anyone practice entrepreneurship at near-zero risk. Free once per day. Unlimited for $5/year.

Read the full essay.',
 'Rich kids get unlimited throws at the entrepreneurship carnival. Middle class kids get one. Poor kids work the carnival.

What if we made the game free?

I built a business simulator where you can throw darts all day and never go broke. Free once per day. Unlimited for $5/year.'),

-- The dart game problem
('article', 'lets-make-bread',
 'The Problem Isn''t the Dart',
 'It''s the price of throwing.',
 'The game itself — starting a business, testing an idea, iterating — isn''t that hard to learn if you can survive the learning. Every failed startup costs money. Every pivot costs time. Every "learning experience" shows up as rent due. The game is rigged because the price of each throw eliminates most players.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'FailFast', 'Entrepreneurship'],
 'standard',
 'The dart game isn''t rigged because the target is impossible.

It''s rigged because the price of each throw eliminates most players before they ever develop the arm.

#UnlimitedThrows',
 NULL,
 NULL),

-- Megamind philosophy
('article', 'lets-make-bread',
 'The Benefit of Losing',
 'You get to learn from your mistakes.',
 'Megamind: "There''s a benefit to losing: you get to learn from your mistakes." Roxanne Ritchi: "The Megamind I knew would never have run from a fight, even when he knew he had absolutely no chance of winning. It was your best quality." That''s the philosophy of HexIsle.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'Megamind', 'FailForward'],
 'quote',
 '🎯 "There''s a benefit to losing: you get to learn from your mistakes." — Megamind

The willingness to fight even hopelessly is what separates those who eventually win from those who never throw.

#FailForward',
 NULL,
 NULL),

-- Chess stats credibility
('article', 'lets-make-bread',
 '25,399 Games. Win Rate Under 50%.',
 'How you treat each loss: shame or tuition?',
 'I''ve played 25,000+ chess games. Peak rating: 2118 (top 0.5% worldwide). Win rate: under 50%. I live in the top tier and lose as much as I win. How? Every loss taught me something. The edge doesn''t come from never losing. It comes from treating each loss as tuition, not shame.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'Chess', 'Growth', 'Persistence'],
 'standard',
 '♟️ 25,399 games of chess
🏆 Top 0.5% rating
📉 Win rate: under 50%

The edge doesn''t come from never losing. It comes from how you treat each loss — as shame, or as tuition.

#Persistence',
 '25,000+ chess games on one account. Peak rating around 2118 — roughly the top half-percent worldwide. Win rate: under 50%.

How do you stay in the top tier while losing half your games?

Because every loss taught me something. As you improve, you face stronger opposition. The losses get harder — which means the education gets deeper.

The edge doesn''t come from never losing. It comes from treating each loss as tuition.',
 NULL),

-- Calvin Coolidge persistence
('article', 'lets-make-bread',
 'Persistence Alone Is Omnipotent',
 'Once the cost of trying is low enough.',
 'Calvin Coolidge was right: persistence alone is omnipotent. The catch: only once the cost of trying is low enough. So I built a simulator where every throw is free or nearly free. Practice until persistence becomes your edge.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'Persistence', 'Coolidge'],
 'quote',
 '"Persistence alone is omnipotent." — Calvin Coolidge

The catch: only once the cost of trying is low enough.

So I built a free business simulator.

#Persistence',
 NULL,
 NULL),

-- Bomb rules written in blood
('article', 'lets-make-bread',
 'Bomb Rules Written in Blood',
 'A brutally effective strategy — when the path is shared.',
 'The rules of how to defuse bombs are written in blood; but there are only so many rules to learn. Every entrepreneur who fails learns something. The problem: most learn it alone, and the lesson dies with their business. So I''m charting failures on a treasure map for anyone who follows.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'LearnFromFailure', 'TreasureMap'],
 'standard',
 '💣 Bomb rules are written in blood. But there are only so many rules.

Every entrepreneur who fails learns something. Most learn it alone. The lesson dies with their business.

So I''m charting failures on a treasure map.

#LearnFromFailure',
 NULL,
 NULL),

-- Free daily throw CTA
('article', 'lets-make-bread',
 'Free Once Per Day',
 'Unlimited for $5/year.',
 'The annual membership is $5. The daily throw is free. The lessons are shared. The crews are real. The businesses you practice with become the businesses you launch. Play HexIsle, learn with your crew, then launch for real.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'HexIsle', 'FreeTrial'],
 'bold',
 '🎯 FREE once per day
♾️ Unlimited for $5/year
🤝 Crews are real
🚀 Practice → Launch

The carnival game is free now.
lianabanyan.com

#HexIsle #UnlimitedThrows',
 NULL,
 'The annual membership is $5. The daily throw is free. The lessons are shared. The crews you practice with become the crews you launch with.

Play HexIsle. Learn the system. Launch for real.

The carnival game is free now.'),

-- Jim Carrey quote hook
('article', 'lets-make-bread',
 'Tired of Eking By?',
 'The rational frustration of capable people.',
 'Jim Carrey in Dumb and Dumber: "Don''t you just get tired of eking by?" That ache — looking at the carnival game thinking "I could hit that target if they''d just let me throw" — is not laziness. It''s rational frustration at a system that charges admission for the privilege of trying.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'EkingBy', 'FairChance'],
 'quote',
 '"Don''t you just get tired of eking by?"

That ache — "I could hit that target if they''d just let me throw" — isn''t laziness. It''s rational frustration at a system that charges admission for trying.

#FairChance',
 NULL,
 NULL),

-- HN thread response
('article', 'lets-make-bread',
 'The HN Thread Got It Wrong',
 'The free carnival is already built.',
 'The 2017 Hacker News thread arrived at resignation: life isn''t fair, wealth concentrates, shrug. Here''s what they missed: the free carnival is already built. 16 initiatives. Fixed 20% margin. Business simulator. Near-zero risk practice. We didn''t wait for life to become fair. We built a corner that''s fair enough.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'HackerNews', 'WeBuiltIt'],
 'standard',
 'The 2017 HN thread ended in resignation: "Life isn''t fair."

What they missed: the free carnival is already built.

- 16 initiatives
- Fixed 20% margin
- Business simulator
- Near-zero risk

We didn''t wait. We built.

#WeBuiltIt',
 'The 2017 Hacker News thread on entrepreneurial inequality ended in collective resignation. Life isn''t fair. Wealth concentrates. The carnival game is what it is.

Here''s what they missed: the free carnival is already built, and it''s growing.

Liana Banyan: 16 charitable initiatives, fixed 20% margin locked by operating agreement, and a business simulator that lets anyone practice entrepreneurship at near-zero risk.

We didn''t wait for life to become fair. We built a corner of it that''s fair enough to start.',
 NULL),

-- Medium CTA card
('article', 'lets-make-bread',
 'Join Us',
 'Megamind never ran from a fight.',
 'Megamind never ran from a fight, even when he knew he had absolutely no chance of winning. Neither do we — and we''re busy making our own chances. If you want more throws at the dartboard and you''re willing to share what you learn when you miss, the door is open.',
 ARRAY['UnlimitedThrows', 'LianaBanyan', 'Megamind', 'JoinUs'],
 'bold',
 '🦸 Megamind never ran from a fight, even when he had no chance.

Neither do we — and we''re busy making our own chances.

Want more throws? Willing to share what you learn when you miss?

The door is open.
lianabanyan.com

#JoinUs',
 NULL,
 NULL);
