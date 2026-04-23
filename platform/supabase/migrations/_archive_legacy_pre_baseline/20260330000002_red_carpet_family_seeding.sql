-- ============================================
-- MIGRATION: 20260330000002_red_carpet_family_seeding.sql
-- Knight Session 167: Red Carpet Family Seeding (DD-12)
-- Adds category column + seeds family entries for testing
-- ============================================

-- Add category column to red_carpet_recipients
ALTER TABLE red_carpet_recipients
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'outreach';

CREATE INDEX IF NOT EXISTS idx_rcp_category ON red_carpet_recipients(category);

-- Update existing entries with categories based on wave/role
UPDATE red_carpet_recipients SET category = 'crown'
  WHERE role_offered IN ('CEO', 'CFO', 'Chancellor', 'Infrastructure Chancellor',
    'Grand Chef', 'Industry Chancellor', 'Strategic Partner', 'French Fleet');

UPDATE red_carpet_recipients SET category = 'academic'
  WHERE role_offered = 'Academic Advisor';

UPDATE red_carpet_recipients SET category = 'journalist'
  WHERE role_offered = 'Press Coverage';

-- =====================
-- SEED: Family test entries
-- Wave 0 = family / internal testers
-- =====================
INSERT INTO red_carpet_recipients (
  email_domain, recipient_name, role_offered, initiative, wave,
  personalized_greeting, walkthrough_sections, category
) VALUES
('family', 'Jones Family', 'Family Tester', 'All Initiatives', 0,
 'Welcome home. Dad built this for us.',
 '["all_initiatives","founder_direct_line"]', 'family'),

('gmail.com:jones-family', 'Jones Family (Gmail)', 'Family Tester', 'All Initiatives', 0,
 'Welcome home. This is what Dad has been working on.',
 '["all_initiatives","founder_direct_line"]', 'family')
ON CONFLICT DO NOTHING;
