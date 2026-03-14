-- =============================================================================
-- INNOVATION LOG — #1541-#1572 (Session 8A/8B + Vault Resilience)
-- Date: March 13, 2026
-- Purpose: Account for every innovation; add Session 8A/8B and Pawn+Bishop
--          vault resilience (emergency repair, backup, governance) for
--          ONE SINGLE PROVISIONAL FILING.
-- Idempotent: ON CONFLICT (innovation_number) DO NOTHING
-- =============================================================================

-- Session 8A/8B (#1541-#1560) — platform features, assigned to Single Provisional
INSERT INTO innovation_log (innovation_number, title, description, category, patent_bag, status) VALUES
(1541, 'Project Pledge System', 'Guild NOID integration for project backing and pledge tracking.', 'Economics', 'Single Provisional', 'pending'),
(1542, 'BackProjectDialog', 'UI for backing projects with pledge amounts and confirmation.', 'UX', 'Single Provisional', 'pending'),
(1543, 'Project Pledge Progress', 'Progress display and fulfillment tracking for pledges.', 'UX', 'Single Provisional', 'pending'),
(1544, 'My Pledges Dashboard', 'Member view of all pledges and status.', 'UX', 'Single Provisional', 'pending'),
(1545, 'Platform Analytics System', 'Analytics events and dashboard for platform metrics.', 'Infrastructure', 'Single Provisional', 'pending'),
(1546, 'Transactional Email System', 'Send transactional email via Resend for platform notifications.', 'Infrastructure', 'Single Provisional', 'pending'),
(1547, 'Company Island Page', 'Company island showcase and initiative hub.', 'UX', 'Single Provisional', 'pending'),
(1548, 'Admin Analytics Dashboard', 'Admin-facing analytics and metrics.', 'Infrastructure', 'Single Provisional', 'pending'),
(1549, 'Flagship Project Seeding', 'Seed and showcase flagship projects.', 'Content', 'Single Provisional', 'pending'),
(1550, 'Side Quests System', 'Gamified side quests and optional objectives.', 'Gamification', 'Single Provisional', 'pending'),
(1551, 'Preference Switch Confirmation Dialog', 'UI for confirming preference changes.', 'UX', 'Single Provisional', 'pending'),
(1552, 'Universal Hex Terrain Retention via Lithographic Compliant Pincers', 'SlottedTop pincers grip any 32-35mm flat hex terrain tile; compatible with Open WarHex, BattleTech, 33mm standard. Trap mechanism preserved.', 'hexel-cad', 'Single Provisional', 'pending'),
(1553, 'Placeholder 1553', 'Reserved for Session 8A/8B innovation.', 'Platform', 'Single Provisional', 'pending'),
(1554, 'Interactive Showcase Simulation', 'WildFire Tour / showcase simulation for demos.', 'UX', 'Single Provisional', 'pending'),
(1555, 'A.T.T.I. Campaign (All That That Implies)', 'Distributed physical-to-digital marketing infrastructure.', 'Marketing', 'Single Provisional', 'pending'),
(1556, 'MoneyPenny Virtual Assistant', 'Publication submissions, communication logs, and task tracking for outreach.', 'Operations', 'Single Provisional', 'pending'),
(1557, 'Placeholder 1557', 'Reserved for Session 8A/8B innovation.', 'Platform', 'Single Provisional', 'pending'),
(1558, 'Expanding Retrieval Practice Engine', 'Academy retrieval practice and learning pathway expansion.', 'Education', 'Single Provisional', 'pending'),
(1559, 'Placeholder 1559', 'Reserved for Session 8A/8B innovation.', 'Platform', 'Single Provisional', 'pending'),
(1560, 'Developer Portal External Talent Pools', 'Connect external talent to Liana Banyan projects; plugins syncing bounty system with external marketplaces.', 'Infrastructure', 'Single Provisional', 'pending')
ON CONFLICT (innovation_number) DO NOTHING;

-- Vault Resilience / Emergency Repair & Backup (#1561-#1572) — from Pawn+Bishop SPEC_VAULT_RESILIENCE_UNIFIED.md
INSERT INTO innovation_log (innovation_number, title, description, category, patent_bag, status) VALUES
(1561, 'Vault Versioned Data Model', 'Versioned, snapshotted namespace over heterogeneous assets (files, models, docs) with Item/Version/Snapshot entities and content-addressed storage.', 'Infrastructure', 'Single Provisional', 'pending'),
(1562, 'Three-Layer Safety Model (Hot/Warm/Cold)', 'Hot operational copy, warm snapshot layer for rollback, cold off-site backup. No single failure can destroy data on all three.', 'Infrastructure', 'Single Provisional', 'pending'),
(1563, 'Snapshot and Rollback API', 'Create point-in-time snapshots with signed manifest; rollback as governed operation with pre-execution snapshot.', 'Infrastructure', 'Single Provisional', 'pending'),
(1564, 'Destructive Operation Governance', 'Quorum approval (2-of-3), 72-hour quarantine, pre-execution snapshot, immutable audit entry for any destructive op.', 'Governance', 'Single Provisional', 'pending'),
(1565, 'AI Agent Sandbox Contracts', 'Constrained view over vaults per agent: path filters, data filters, query limits, time bounds. No direct vault write.', 'AI', 'Single Provisional', 'pending'),
(1566, 'Emergency Recovery via Layer 2/3', 'Recovery from volume shadow or cold backup when hot layer lost; manifest integrity verification.', 'Infrastructure', 'Single Provisional', 'pending'),
(1567, 'Change Proposal Contracts', 'Agents emit typed proposals (add_tag, move_item, etc.); governance engine applies; no direct canonical write.', 'AI', 'Single Provisional', 'pending'),
(1568, 'Soft-Delete and Mutation Audit', 'No physical row delete; deleted_at timestamp; audit log for who/what/when/why/how on every mutation.', 'Infrastructure', 'Single Provisional', 'pending'),
(1569, 'Cold Backup Encryption (CFO-Held Keys)', 'Cold layer encrypted at rest; keys held by CFO Crown; cross-jurisdiction storage for IP-critical data.', 'Security', 'Single Provisional', 'pending'),
(1570, 'Resilience as Governance Metric', 'Senate-visible metrics: backup freshness, snapshot integrity, rollback readiness, destructive-op log.', 'Governance', 'Single Provisional', 'pending'),
(1571, 'Runtime Isolation for Agents', 'Agents run in hardened containers; no direct filesystem access to vault; scoped tokens, time-bounded leases.', 'Security', 'Single Provisional', 'pending'),
(1572, 'Pre-Destruction Snapshot Automation', 'Before any destructive operation, system automatically creates warm snapshot of blast radius; 90-day retention.', 'Infrastructure', 'Single Provisional', 'pending')
ON CONFLICT (innovation_number) DO NOTHING;

COMMENT ON TABLE public.innovation_log IS 'Innovation registry. Contains 1,572 innovations as of March 13, 2026. #1-#1540 from prior migrations; #1541-#1572 Session 8A/8B + Vault Resilience (Single Provisional). RANGE: #1-#1572.';

-- Register Single Provisional in filing plan (one application for all unfiled innovations)
INSERT INTO public.patent_bag_filing_plan (bag_id, display_name, filing_status, claim_count_estimate, notes, consolidated_into)
VALUES ('Single Provisional', 'Single provisional filing — 258 unfiled innovations (1594 − 1336)', 'set_to_file', 258, 'One application. Math: 1,594 total − 1,336 already filed = 258. Export the 258 (innovations not in the 6 apps) for filing manifest.', NULL)
ON CONFLICT (bag_id) DO UPDATE SET display_name = EXCLUDED.display_name, filing_status = EXCLUDED.filing_status, claim_count_estimate = EXCLUDED.claim_count_estimate, notes = EXCLUDED.notes, updated_at = now();
