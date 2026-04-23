-- ECONOMIC LAWS DISCOVERY SYSTEM
-- ================================
-- Adds the "economic-laws" category and 16 paper cards to the discovery system.

-- 1. Create the economic-laws category
INSERT INTO discovery_categories (slug, name, icon, description, sort_order, trigger_type, trigger_value)
VALUES (
  'economic-laws',
  'Economic Laws',
  '⚖️',
  'The Five Economic Laws and 16 academic papers testing new economic theory.',
  15,
  'route',
  '/economics'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 2. Insert the 16 paper cards

-- Core Economic Laws (5)
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, sort_order, card_type)
VALUES
  ('three-gear-currency', 'economic-laws', 'Three-Gear Currency', 'Credits, Marks, and Joules — currency disparities absorbed at acquisition', '⚙️', '/economics/three-gear-currency', '/economics/three-gear-currency', 'Explore the three-gear currency system', 1, 'paper'),
  ('hivi', 'economic-laws', 'HIVI Index', 'Historical Influence Value Index — value from completed transactions', '📊', '/economics/hivi', '/economics/hivi', 'Learn about history-based valuation', 2, 'paper'),
  ('anti-extractive', 'economic-laws', 'Anti-Extractive Derivative', 'Locked margins force quality improvement', '📈', '/economics/anti-extractive', '/economics/anti-extractive', 'See how locked margins change incentives', 3, 'paper'),
  ('boaz-principle', 'economic-laws', 'The Boaz Principle', 'Structural gleaning — generosity built into math', '🌾', '/economics/boaz-principle', '/economics/boaz-principle', 'Discover the 3.3% Gleaner''s Corner', 4, 'paper'),
  ('one-way-valve', 'economic-laws', 'One-Way Valve', 'External signals captured once, then decoupled', '🔒', '/economics/one-way-valve', '/economics/one-way-valve', 'Understand economic isolation', 5, 'paper')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- System Design Papers (6)
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, sort_order, card_type)
VALUES
  ('ghost-credits', 'economic-laws', 'Ghost Credits', 'Test demand before you build', '👻', '/economics/ghost-credits', '/economics/ghost-credits', 'Learn about demand validation', 6, 'paper'),
  ('300-framework', 'economic-laws', 'The 300 Framework', 'Organizational scaling at human limits', '🛡️', '/economics/300-framework', '/economics/300-framework', 'Explore Dunbar-number organization', 7, 'paper'),
  ('transaction-anchored', 'economic-laws', 'Transaction-Anchored Economics', 'Value from completed work only', '⚓', '/economics/transaction-anchored', '/economics/transaction-anchored', 'See history-based value anchoring', 8, 'paper'),
  ('proof-of-transaction', 'economic-laws', 'Proof of Transaction', 'Blockchain for provenance, not trading', '🔗', '/economics/proof-of-transaction', '/economics/proof-of-transaction', 'Understand testnet permanence', 9, 'paper'),
  ('harper-certification', 'economic-laws', 'Harper Automated Trust', 'Multi-factor quality certification', '✅', '/economics/harper-certification', '/economics/harper-certification', 'Learn about automated trust', 10, 'paper'),
  ('star-chamber', 'economic-laws', 'Star Chamber Verification', 'Multi-AI consensus verification', '⭐', '/economics/star-chamber', '/economics/star-chamber', 'See how multiple AIs verify claims', 11, 'paper')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- Application Papers (5)
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, sort_order, card_type)
VALUES
  ('joules-explained', 'economic-laws', 'Joules Explained', 'The arcade token model for platform currency', '🎮', '/economics/joules-explained', '/economics/joules-explained', 'Understand Joules as Forever Stamps', 12, 'paper'),
  ('ip-load-balancing', 'economic-laws', 'IP Load Balancing', 'Patent distribution across the community', '⚖️', '/economics/ip-load-balancing', '/economics/ip-load-balancing', 'See how patent ownership is shared', 13, 'paper'),
  ('roi-predictability', 'economic-laws', 'ROI Predictability', 'Structural determinism in returns', '🎯', '/economics/roi-predictability', '/economics/roi-predictability', 'Learn about predictable returns', 14, 'paper'),
  ('pay-your-rent', 'economic-laws', 'Pay Your Rent with LB', 'Your business, your customers, your income', '🏠', '/economics/pay-your-rent', '/economics/pay-your-rent', 'See practical income strategies', 15, 'paper'),
  ('band-strategy', 'economic-laws', 'The Band Strategy', 'Maximum personal success through collaboration', '🎸', '/economics/band-strategy', '/economics/band-strategy', 'Learn the band collaboration model', 16, 'paper')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;
