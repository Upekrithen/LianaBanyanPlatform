-- K408: Three Open Water Cue Cards — cue_card_templates rows
-- Source: AA Formal #2240 "Member-Facing Framings" (B097)
-- Idempotent: uses ON CONFLICT DO NOTHING on initiative_slug

INSERT INTO public.cue_card_templates (
  initiative_slug,
  template_type,
  title,
  subtitle,
  body_text,
  hashtags,
  background_type,
  background_value,
  accent_color,
  card_style,
  twitter_text,
  linkedin_text,
  is_active
) VALUES
(
  'we-need-what-youre-good-at',
  'open-water',
  'We Need What You''re Good At',
  'The opening invitation to every potential Patron on Open Water.',
  'Whatever you are good at — we need it. Not credentials. Not prestige. Not scale-for-its-own-sake. Just lived competence at a specific thing one step beyond someone else who needs it. The first level of Patronship is someone who started to help someone who hasn''t. Billions of people qualify. That is the floor, and the floor is accessible to everyone who has ever done anything.',
  ARRAY['OpenWater', 'Patron', 'LianaBanyan'],
  'gradient',
  'from-teal-500/30 to-cyan-500/20',
  'teal',
  'quote',
  'Whatever you are good at — we need it. Not credentials, not prestige. Just lived competence one step beyond someone who needs it. #OpenWater #LianaBanyan',
  'Whatever you are good at — we need it. Not credentials. Not prestige. Just lived competence at a specific thing one step beyond someone else who needs it. The first level of Patronship is someone who started to help someone who hasn''t. Billions of people qualify.',
  true
),
(
  'you-have-a-play-i-have-a-stage',
  'open-water',
  'You Have a Play, I Have a Stage',
  'The governing metaphor for the Member-Patron-Ripple-Voucher relationship.',
  'You have a play. We have a stage. Bring the thing you want to do. The cooperative provides the infrastructure to execute it — Patrons, Ripples, Vouchers, Cold Start systems, the commerce engine, the letters of recommendation, the published guides, the full platform. We, collectively, are providing the stage. Show us what you got. At all levels.',
  ARRAY['OpenWater', 'CooperativeEconomy', 'LianaBanyan'],
  'gradient',
  'from-amber-500/30 to-yellow-500/20',
  'amber',
  'quote',
  'You have a play. We have a stage. Bring what you want to do — the cooperative provides the infrastructure. #OpenWater #LianaBanyan',
  'You have a play. We have a stage. Bring the thing you want to do. The cooperative provides the infrastructure to execute it — Patrons, Ripples, Vouchers, Cold Start systems, the full platform. Show us what you got. At all levels.',
  true
),
(
  'doing-something-is-what-it-takes-to-start',
  'open-water',
  'Doing Something is What It Takes to Start',
  'The Level 0 Dinghy anchor. The sod company entrepreneur''s principle, generalized.',
  'The hardest transition in the cooperative ladder is zero to one. Every other transition is about scaling — taking something that already works and making it work bigger. Zero to one is about starting — converting intent into action, idea into execution, "I could do this" into "I did this once." The specific first action is often incidental. The principle is: do something, because doing something makes the next step visible, while doing nothing keeps the next step hidden. Get a DBA. Make a phone call. Take the first dollar. List the first service. The next step reveals itself once you move.',
  ARRAY['OpenWater', 'ZeroToOne', 'LianaBanyan', 'Dinghy'],
  'gradient',
  'from-emerald-500/30 to-lime-500/20',
  'emerald',
  'quote',
  'The hardest transition is zero to one. Do something — because doing something makes the next step visible. #OpenWater #LianaBanyan',
  'The hardest transition in the cooperative ladder is zero to one. Every other transition is about scaling. Zero to one is about starting — converting intent into action. Do something, because doing something makes the next step visible, while doing nothing keeps the next step hidden.',
  true
)
ON CONFLICT DO NOTHING;
