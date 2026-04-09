-- ============================================
-- K192: LB Card — Lithic Provider Activation + Abstraction Layer
-- DD-2 Resolution: First provider to approve goes live.
-- Lithic sandbox is instant; Stripe Issuing pending approval.
-- ============================================

-- Set lb_card_provider to lithic (sandbox-ready, no approval required)
UPDATE founder_feature_flags
SET is_enabled = true,
    enabled_at = NOW(),
    notes = 'lithic'
WHERE feature_key = 'lb_card_provider';

-- Ensure lb_card_enabled stays on
UPDATE founder_feature_flags
SET is_enabled = true,
    enabled_at = COALESCE(enabled_at, NOW()),
    notes = 'LIVE — Lithic sandbox active (K192), Stripe Issuing pending approval'
WHERE feature_key = 'lb_card_enabled';

-- Update canonical stats: knight_sessions = 192
UPDATE platform_canonical
SET value = 192, updated_at = NOW()
WHERE key = 'knight_sessions';
