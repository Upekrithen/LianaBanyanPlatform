-- K413: Canonical Count Reconciliation (Bishop B100)
-- Backfills innovations #2244-#2262 that were assigned by Bishop in
-- A&A formals but never registered in a Knight migration.
-- All inserts are idempotent (ON CONFLICT DO NOTHING via WHERE NOT EXISTS).

-- ═══════════════════════════════════════════════════════════════
-- Task 1: Backfill innovations into innovation_log
-- ═══════════════════════════════════════════════════════════════

-- Batch A: #2244-#2245, #2248-#2250 (may already exist from earlier migrations — verify+skip)
INSERT INTO innovation_log (innovation_number, title, description, is_crown_jewel, session_id)
SELECT * FROM (VALUES
  (2244, 'IP Revenue Waterfall Constitutional Allocation', 'Constitutional allocation framework for intellectual property revenue distribution across patent buckets', true, 'B098'),
  (2245, 'Patron-Member Proximity Matching', 'Algorithmic matching system pairing patrons with geographically and interest-proximate members', true, 'B098'),
  (2248, 'Hemispheric Protocol', 'Time-based grid validator enforcing work-life boundary dispatch windows for platform communications', true, 'B096'),
  (2249, 'ROM-First AI Inference Cost Architecture', 'Architecture requiring AI inference costs to be optimized for read-only memory patterns before deployment', true, 'B096'),
  (2250, 'Algorithmic Efficiency Mandate (Legislative)', 'Legislative framework mandating algorithmic cost efficiency standards for cooperative platforms', true, 'B096')
) AS new_innovations(innovation_number, title, description, is_crown_jewel, session_id)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il
  WHERE il.innovation_number = new_innovations.innovation_number
);

-- Batch B: #2251-#2255 (B093 orphans renumbered in B098)
INSERT INTO innovation_log (innovation_number, title, description, is_crown_jewel, session_id)
SELECT * FROM (VALUES
  (2251, 'Cooperative Member Verification Protocol', 'Multi-step verification protocol for validating cooperative membership eligibility and standing', false, 'B098'),
  (2252, 'Distributed Governance Checkpoint', 'Checkpoint mechanism for distributed governance decisions requiring multi-node consensus', false, 'B098'),
  (2253, 'Patronage Volume Attestation', 'Attestation system for verifying patronage volume claims across cooperative service tiers', false, 'B098'),
  (2254, 'Cross-Cooperative License Portability', 'License portability framework allowing cooperative credentials and rights to transfer across sister cooperatives', true, 'B098'),
  (2255, 'Bylaw Amendment Ratification Pipeline', 'Structured pipeline for proposing, voting on, and ratifying cooperative bylaw amendments', false, 'B098')
) AS new_innovations(innovation_number, title, description, is_crown_jewel, session_id)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il
  WHERE il.innovation_number = new_innovations.innovation_number
);

-- Batch C: #2256-#2261 (B096 promoted stubs renumbered in B098)
INSERT INTO innovation_log (innovation_number, title, description, is_crown_jewel, session_id)
SELECT * FROM (VALUES
  (2256, 'Hemispheric Dispatch Grid Validator', 'Validator function enforcing Founder hemispheric grid constraints on task dispatch timing', false, 'B098'),
  (2257, 'The Glove (MoneyPenny Email Channel)', 'Email dispatch channel for MoneyPenny reminder system via Resend transactional pipeline', false, 'B098'),
  (2258, 'Cascade Failure Isolation Protocol', 'Isolation protocol preventing cascading failures across interconnected cooperative service systems', true, 'B098'),
  (2259, 'Multi-Agent Session Handoff Standard', 'Standard for preserving context and state when transferring work between AI agent sessions', false, 'B098'),
  (2260, 'Cooperative Defensive Patent Pledge', 'Pledge framework where cooperative patents are used only defensively, never offensively against members', true, 'B098'),
  (2261, 'ROM-First Algorithmic Efficiency Mandate', 'Mandate requiring all cooperative algorithms to optimize for ROM-first read patterns before write operations', true, 'B098')
) AS new_innovations(innovation_number, title, description, is_crown_jewel, session_id)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il
  WHERE il.innovation_number = new_innovations.innovation_number
);

-- Batch D: #2262 (B099 — The Glass Door)
INSERT INTO innovation_log (innovation_number, title, description, is_crown_jewel, session_id)
SELECT * FROM (VALUES
  (2262, 'The Glass Door (Public-by-Default Outreach with Member-Voted Dispatch)', 'Public-by-default system where all outbound platform communications are visible and voteable by members before dispatch', true, 'B099')
) AS new_innovations(innovation_number, title, description, is_crown_jewel, session_id)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il
  WHERE il.innovation_number = new_innovations.innovation_number
);

-- ═══════════════════════════════════════════════════════════════
-- Task 2: Update platform_canonical from actual counts
-- ═══════════════════════════════════════════════════════════════

UPDATE platform_canonical SET value = (
  SELECT MAX(innovation_number) FROM innovation_log
) WHERE key = 'innovation_count';

UPDATE platform_canonical SET value = (
  SELECT MAX(innovation_number) FROM innovation_log
) WHERE key = 'canonical_chain_end';

UPDATE platform_canonical SET value = (
  SELECT COUNT(*) FROM innovation_log WHERE is_crown_jewel = true
) WHERE key = 'crown_jewel_count';

UPDATE platform_canonical SET value = (
  SELECT COUNT(*) FROM innovation_log WHERE is_crown_jewel = true
) WHERE key = 'crown_jewels';
