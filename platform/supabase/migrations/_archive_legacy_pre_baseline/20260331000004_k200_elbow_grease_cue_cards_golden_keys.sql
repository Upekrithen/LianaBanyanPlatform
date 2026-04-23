-- K200: Elbow Grease + Printable Cue Cards + Golden Key Codebreaker overlay
-- Uses existing tables: xray_daily_stats, treasure_keys, key_submissions,
-- cue_card_share_clicks, user_preferences

-- Add elbow_grease_level to innovation_log for categorization
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS elbow_grease_level INTEGER DEFAULT 1;

-- Update platform_canonical
UPDATE platform_canonical SET value = 2125, updated_at = now()
WHERE key = 'innovation_count' AND value::int < 2125;

UPDATE platform_canonical SET value = 167, updated_at = now()
WHERE key = 'crown_jewel_count';

UPDATE platform_canonical SET value = 2097, updated_at = now()
WHERE key = 'formal_claims_count';

-- Log innovations
INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES
(2123, 'Elbow Grease Visual Effort Scale', 'Ten-level effort classification with flippable badge showing process and cooperative earnings comparison, integrated with X-Ray Goggles.', 'user_experience', 'implemented', true),
(2124, 'Printable Cue Card Business Cards', 'Member-generated print-ready business cards with Red Carpet QR codes for business recruitment.', 'outreach', 'implemented', false),
(2125, 'Golden Key Codebreaker Overlay Mode', 'Notes Overlay Codebreaker mode triggered by clicking Golden Key icons in content, with answer validation and Marks earning.', 'engagement', 'implemented', false)
ON CONFLICT (innovation_number) DO NOTHING;
