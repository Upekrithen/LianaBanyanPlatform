-- ═══════════════════════════════════════════════════════════════════════════════
-- INNOVATION LOG — Session 7C (March 8, 2026)
-- Innovations #1511-#1515
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add missing columns if needed
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS session_tag TEXT;
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Add unique constraint on innovation_number if missing
CREATE UNIQUE INDEX IF NOT EXISTS innovation_log_innovation_number_key ON innovation_log(innovation_number);

INSERT INTO innovation_log (innovation_number, title, description, category, session_tag) VALUES
(1511, 'Content Pipeline Management UI', 'Full React page for managing SEED to PAPER pipeline with creation modal, stage advancement, reading level preview, validation feedback, statistics dashboard, and filtering system.', 'UX/Content', 'Session 7C'),
(1512, 'HexIsle Phase MimicTrunk Bridge', 'Architecture connecting HexIsle 3D world to Phase MimicTrunk personal server instances. Portal definitions at Guild Towers and Keeps. Phase status visualization with connection-state-aware color coding.', 'Gaming/Architecture', 'Session 7C'),
(1513, 'Phase Portal 3D Renderer', 'Three.js/R3F component rendering Phase portals as glowing torus rings with pulsing animation tied to DNA chain validation status. Includes Phase Keep diamond beacons and floating status labels.', 'Gaming/3D', 'Session 7C'),
(1514, 'Firebase UTF-8 Charset Headers', 'Explicit Content-Type charset=UTF-8 headers across all 8 Firebase hosting targets for HTML, JS, and CSS files. Prevents emoji double-encoding and garbled Unicode characters on live site.', 'Infrastructure', 'Session 7C'),
(1515, 'Content Pipeline Supabase Type Integration', 'Full typed schema for content_pipeline table added to Supabase generated types. Enables type-safe database operations for the sequential content evolution system across all pipeline stages.', 'Data Architecture', 'Session 7C')
ON CONFLICT (innovation_number) DO NOTHING;
