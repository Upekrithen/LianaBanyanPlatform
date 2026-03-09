-- ═══════════════════════════════════════════════════════════════════════════
-- DASHBOARD DISCOVERY CARDS SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds discoverable cards for the Dashboard's progressive disclosure system.
-- Cards are discovered when users visit the corresponding routes.
-- 
-- Schema reference (from 20260210000001_discovery_system.sql):
--   discovery_categories: slug, name, description, icon, sort_order, trigger_type, trigger_value, max_visible_slots
--   discoverable_cards: slug, category_slug, name, description, icon, destination_route (NOT NULL), 
--                       card_type, hint_text, discovery_route, sort_order, glow_level
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure categories exist
INSERT INTO discovery_categories (slug, name, description, sort_order, max_visible_slots, icon, trigger_type)
VALUES 
  ('essentials', 'Essentials', 'Core membership features always visible', 1, 5, 'star', 'always'),
  ('initiatives', 'Initiatives', 'The Sweet 16 cooperative initiatives', 2, 16, 'rocket', 'visit'),
  ('exploration', 'Exploration', 'Discover crowdfunding, studios, and tools', 3, 10, 'compass', 'visit'),
  ('economy', 'Economy', 'Credits, EOI, investments', 4, 8, 'coins', 'visit'),
  ('governance', 'Governance', 'Legal, voting, and cooperative governance', 5, 6, 'scale', 'visit'),
  ('tools', 'Tools', 'Utilities and admin features', 6, 10, 'wrench', 'visit')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ═══════════════════════════════════════════════════════════════════════════
-- ESSENTIALS (always visible)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, card_type)
VALUES 
  ('membership-status', 'essentials', 'Membership Status', 'Your LB membership and stake status', 'badge', '/dashboard', '/dashboard', 'Already discovered - this is your home base', 'location'),
  ('guild-stake', 'essentials', 'Guild Stake', 'Progress through guild tiers', 'shield', '/dashboard', '/dashboard', 'Already discovered - track your guild progression', 'location')
ON CONFLICT (slug) DO UPDATE SET 
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route;

-- ═══════════════════════════════════════════════════════════════════════════
-- INITIATIVES (Sweet 16)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, card_type)
VALUES 
  ('lets-make-dinner', 'initiatives', 'Let''s Make Dinner', 'Order meals from community cooks', 'utensils', '/initiatives/lets-make-dinner', '/initiatives/lets-make-dinner', 'Visit the Let''s Make Dinner page to discover community cooking', 'location'),
  ('defense-klaus', 'initiatives', 'Defense Klaus™', 'Safety bracelet funding LB Legal Defense', 'shield', '/initiatives/defense-klaus', '/initiatives/defense-klaus', 'Learn about the "For Someone You Love" initiative', 'location'),
  ('lets-get-groceries', 'initiatives', 'Let''s Get Groceries', 'Bulk grocery coordination', 'shopping-cart', '/initiatives/lets-get-groceries', '/initiatives/lets-get-groceries', 'Discover bulk grocery ordering for communities', 'location'),
  ('lets-go-shopping', 'initiatives', 'Let''s Go Shopping', 'Cooperative retail marketplace', 'shopping-bag', '/initiatives/lets-go-shopping', '/initiatives/lets-go-shopping', 'Explore the cooperative retail experience', 'location'),
  ('household-concierge', 'initiatives', 'Household Concierge', 'Home services coordination', 'home', '/initiatives/household-concierge', '/initiatives/household-concierge', 'Discover coordinated home services', 'location'),
  ('family-table', 'initiatives', 'The Family Table', 'Multi-generational meal planning', 'users', '/initiatives/family-table', '/initiatives/family-table', 'Learn about family-focused meal coordination', 'location'),
  ('lifeline-medications', 'initiatives', 'LifeLine Medications', 'Prescription assistance program', 'heart', '/initiatives/lifeline-medications', '/initiatives/lifeline-medications', 'Discover medication assistance programs', 'location'),
  ('msa', 'initiatives', 'MSA', 'Member Services Agreement', 'file-text', '/initiatives/msa', '/initiatives/msa', 'Learn about member service agreements', 'location'),
  ('rally-group', 'initiatives', 'Rally Group', 'Community mobilization platform', 'flag', '/initiatives/rally-group', '/initiatives/rally-group', 'Discover community organizing tools', 'location'),
  ('vsl', 'initiatives', 'VSL', 'Virtual Shared Living', 'building', '/initiatives/vsl', '/initiatives/vsl', 'Explore virtual shared living concepts', 'location'),
  ('lets-make-bread', 'initiatives', 'Let''s Make Bread', 'Bakery cooperative', 'cake', '/initiatives/lets-make-bread', '/initiatives/lets-make-bread', 'Discover the bakery initiative', 'location'),
  ('harper-guild', 'initiatives', 'Harper Guild', 'Publishing cooperative', 'book-open', '/initiatives/harper-guild', '/initiatives/harper-guild', 'Learn about cooperative publishing', 'location'),
  ('jukebox', 'initiatives', 'JukeBox', 'Music distribution platform', 'music', '/initiatives/jukebox', '/initiatives/jukebox', 'Discover fair music distribution', 'location'),
  ('didasko', 'initiatives', 'Didasko', 'Academic learning platform', 'graduation-cap', '/initiatives/didasko', '/initiatives/didasko', 'Explore cooperative education', 'location'),
  ('international', 'initiatives', 'International', 'Global cooperative network', 'globe', '/initiatives/international', '/initiatives/international', 'Discover the international cooperative network', 'location'),
  ('brass-tacks', 'initiatives', 'Brass Tacks', 'Hardware and manufacturing', 'hammer', '/initiatives/brass-tacks', '/initiatives/brass-tacks', 'Learn about cooperative manufacturing', 'location')
ON CONFLICT (slug) DO UPDATE SET 
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- ═══════════════════════════════════════════════════════════════════════════
-- EXPLORATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, card_type)
VALUES 
  ('crowdfunding-hub', 'exploration', 'Crowdfunding Hub', 'Manage external campaign integrations', 'rocket', '/crowdfunding', '/crowdfunding', 'Visit the Crowdfunding page to discover campaign tools', 'location'),
  ('medallion-management', 'exploration', 'Medallion Management', 'Design and track project medallions', 'award', '/medallion-management', '/medallion-management', 'Create or view medallions to discover this feature', 'location'),
  ('hofund-studio', 'exploration', 'Hofund Studio', 'Media production workspace', 'video', '/hofund-studio', '/hofund-studio', 'Visit Hofund Studio to discover media tools', 'location'),
  ('herald-subscription', 'exploration', 'Herald Subscription', 'Newsletter and content distribution', 'mail', '/herald-subscription', '/herald-subscription', 'Subscribe to The Herald to discover updates', 'location')
ON CONFLICT (slug) DO UPDATE SET 
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- ═══════════════════════════════════════════════════════════════════════════
-- ECONOMY
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, card_type)
VALUES 
  ('eoi-dashboard', 'economy', 'Expression of Interest', 'Toggle and manage your EOI', 'chart-bar', '/eoi', '/eoi', 'Toggle your EOI to discover investment preferences', 'location'),
  ('project-preferences', 'economy', 'Project Preferences', 'Rank projects you''re interested in', 'list', '/preferences', '/preferences', 'Set your project preferences', 'location'),
  ('equity-breakdown', 'economy', 'Equity Breakdown', 'View your equity distribution', 'pie-chart', '/portfolio', '/portfolio', 'View your portfolio to discover equity breakdown', 'location'),
  ('investment-timeline', 'economy', 'Investment Timeline', 'Track investment history', 'calendar', '/portfolio', '/portfolio', 'View your investment history', 'location')
ON CONFLICT (slug) DO UPDATE SET 
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- ═══════════════════════════════════════════════════════════════════════════
-- GOVERNANCE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, card_type)
VALUES 
  ('legal-formation', 'governance', 'Legal Formation', 'LLC/C-Corp formation services', 'scale', '/legal-formation', '/legal-formation', 'Learn about entity formation services', 'location'),
  ('charitable-loan', 'governance', 'Charitable Loans', 'Community lending program', 'hand-coins', '/charitable-loans', '/charitable-loans', 'Discover the charitable loan program', 'location'),
  ('voting-system', 'governance', 'Voting System', 'Participate in cooperative governance', 'vote', '/governance/voting', '/governance/voting', 'Participate in votes to discover governance', 'location'),
  ('proposals', 'governance', 'Proposals', 'Submit and review proposals', 'file-plus', '/governance/proposals', '/governance/proposals', 'View proposals to discover this feature', 'location')
ON CONFLICT (slug) DO UPDATE SET 
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- ═══════════════════════════════════════════════════════════════════════════
-- TOOLS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO discoverable_cards (slug, category_slug, name, description, icon, destination_route, discovery_route, hint_text, card_type)
VALUES 
  ('physical-badge', 'tools', 'Physical Badge', 'Order your membership badge', 'badge', '/badge-order', '/badge-order', 'Order your physical badge', 'location'),
  ('referral-manager', 'tools', 'Referral Manager', 'Invite others and track referrals', 'users', '/referrals', '/referrals', 'Invite someone to discover referrals', 'location'),
  ('admin-roles', 'tools', 'Admin Roles', 'Manage project roles and permissions', 'settings', '/admin/roles', '/admin/roles', 'Access admin features to discover this', 'ability'),
  ('workshop', 'tools', 'Workshop', 'Development and testing tools', 'wrench', '/workshop', '/workshop', 'Visit the Workshop to discover dev tools', 'location')
ON CONFLICT (slug) DO UPDATE SET 
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  destination_route = EXCLUDED.destination_route,
  discovery_route = EXCLUDED.discovery_route,
  hint_text = EXCLUDED.hint_text;

-- ═══════════════════════════════════════════════════════════════════════════
-- AUTO-DISCOVER ESSENTIALS FOR ALL EXISTING USERS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO user_discovery_state (user_id, category_slug, card_slug)
SELECT u.id, 'essentials', 'membership-status'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_discovery_state uds 
  WHERE uds.user_id = u.id AND uds.card_slug = 'membership-status'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_discovery_state (user_id, category_slug, card_slug)
SELECT u.id, 'essentials', 'guild-stake'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_discovery_state uds 
  WHERE uds.user_id = u.id AND uds.card_slug = 'guild-stake'
)
ON CONFLICT DO NOTHING;
