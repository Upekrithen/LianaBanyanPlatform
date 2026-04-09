-- K199: Marks Milestone Prize Panel with Three-Tab Business Launch
-- Uses existing tables: mark_work_records, user_preferences
-- Crown Jewel: First cooperative onramp from earning to launching a business

-- Ensure mark_work_records has category column for breakdown
ALTER TABLE mark_work_records ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Update platform_canonical
UPDATE platform_canonical SET value = value + 1, updated_at = now()
WHERE key = 'innovation_count';

-- Log innovation #2121 (Crown Jewel)
INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES (
  2121,
  'Marks Milestone Prize Panel with Three-Tab Business Launch',
  'Real-time celebration system triggering on Marks milestones with a three-tab Prize Panel at 100 Marks showing What Can I Get (spend), What Can I Do (platform actions), and How Can I Make Money (earning paths), with contextual card rotation based on earning category and Oar Slots cooperative multiplier visualization, creating a first-earning-to-business-launch loop.',
  'user_experience',
  'implemented',
  true
) ON CONFLICT (innovation_number) DO NOTHING;
