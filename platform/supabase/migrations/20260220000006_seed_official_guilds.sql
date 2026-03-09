-- ═══════════════════════════════════════════════════════════════════
-- SEED OFFICIAL GUILDS
-- February 20, 2026
-- ═══════════════════════════════════════════════════════════════════
-- Creates the official guilds needed for the All Positions Hiring initiative

-- First, ensure we have the guild_type enum values we need
-- (This is safe to run multiple times)

-- ═══════════════════════════════════════════════════════════════════
-- OFFICIAL GUILDS
-- ═══════════════════════════════════════════════════════════════════

-- Design Guild — Visual Artists
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'design-guild',
  'Design Guild',
  'guild',
  'skill',
  'Visual artists creating deck cards, HexIsle assets, UI/UX designs, and brand materials. IP-backed compensation available.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Harper Guild — HR & Ethics
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'harper-guild',
  'Harper Guild',
  'guild',
  'industry',
  'HR and ethics oversight. Guild moderators, dispute resolution specialists, ethics review board members, and onboarding guides.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- 3D Makers Guild — Physical Production
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  '3d-makers-guild',
  '3D Makers Guild',
  'guild',
  'skill',
  '3D printing specialists, CNC operators, laser cutting experts, assembly coordinators, and quality control. Physical production network.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Tech Guild — Development
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'tech-guild',
  'Tech Guild',
  'guild',
  'skill',
  'Frontend developers, backend developers, smart contract developers, DevOps engineers, and QA testers. Platform development.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Content Guild — Writers & Editors
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'content-guild',
  'Content Guild',
  'guild',
  'skill',
  'Technical writers, marketing copywriters, letter drafters, documentation specialists, and proofreaders. Written content creation.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Animation Guild — Video Production
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'animation-guild',
  'Animation Guild',
  'guild',
  'skill',
  'Toonly-style animators, video editors, motion graphics artists, and explainer video creators. Visual storytelling.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- HexIsle Guild — Game Development
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'hexisle-guild',
  'HexIsle Guild',
  'guild',
  'skill',
  'Game designers, character artists, island environment creators, and game mechanics developers. HexIsle game development.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Merchant Guild — Business Operations
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'merchant-guild',
  'Merchant Guild',
  'guild',
  'industry',
  'Business operators, project managers, sales coordinators, and marketplace facilitators. Commercial operations.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Academic Guild — Research & Education
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'academic-guild',
  'Academic Guild',
  'guild',
  'industry',
  'Researchers, educators, curriculum developers, and academic advisors. College of Hard Knocks operations.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- ═══════════════════════════════════════════════════════════════════
-- DIVISIONS (Top-level organizational units)
-- ═══════════════════════════════════════════════════════════════════

-- Creative Division
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'creative-division',
  'Creative Division',
  'division',
  'division',
  'Oversees Design Guild, Animation Guild, HexIsle Guild, and Content Guild. All creative production.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Technical Division
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'technical-division',
  'Technical Division',
  'division',
  'division',
  'Oversees Tech Guild, 3D Makers Guild, and infrastructure operations. All technical production.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- Operations Division
INSERT INTO guilds (
  name, display_name, custom_name, guild_type, description, is_official,
  min_reputation_score, min_interactions
) VALUES (
  'operations-division',
  'Operations Division',
  'division',
  'division',
  'Oversees Harper Guild, Merchant Guild, Academic Guild, and business operations. All organizational functions.',
  true,
  0,
  0
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_official = true;

-- ═══════════════════════════════════════════════════════════════════
-- VERIFY
-- ═══════════════════════════════════════════════════════════════════

-- This should show 12 official guilds
-- SELECT name, display_name, guild_type, is_official FROM guilds WHERE is_official = true ORDER BY guild_type, name;
