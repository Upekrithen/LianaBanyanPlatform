-- ============================================================================
-- Session 30: Shadow Mark Demand Signaling innovations (#1710-#1719)
-- Source: SHADOW_MARK_DEMAND_SIGNALING_SYSTEM.md (Bishop Session 012)
-- 10 innovations total
-- ============================================================================

INSERT INTO innovation_log (innovation_number, title, description, category, status, patent_bag)
VALUES
  (1710, 'Shadow Mark Per-Area Demand Allocation', 'Context-triggered Shadow Mark allocation when users enter platform areas (Marketplace 50 SM, Services 30 SM, Infrastructure 40 SM, Governance 20 SM, HexIsle 50 SM, Community 30 SM). Visit-required demand signaling with 24-hour cooldown per area. The ACT OF VISITING is itself a signal.', 'platform-economics', 'documented', NULL),
  (1711, 'Brewster''s Millions Forced Distribution', 'Mandatory spend-or-lose Shadow Mark distribution across pre-operational feature pedestals. Cannot hoard, cannot equalize without visiting. HOW users distribute reveals genuine demand priority through forced ranking.', 'platform-economics', 'documented', NULL),
  (1712, '50% Carry-Forward Persistence Compounding', 'Next-day Shadow Mark persistence at 50% decay rate creating geometric series convergence (limit = 2x daily allocation). Rewards consistent interest, filters impulse signals. Day 1 impulse dies fast; Day 3+ consistent allocation compounds.', 'platform-economics', 'documented', NULL),
  (1713, '3-Day Crystallization Threshold', 'Persistent Shadow Mark allocation converts to real Marks after 3 consecutive days of allocation to same pedestal. Only the carry-forward portion crystallizes (not fresh daily allocation). Backed by patent portfolio under IP Load Balance (60/20/10/10 split).', 'platform-economics', 'documented', NULL),
  (1714, 'Beacon Streak Persistence Amplifier', 'Consecutive engagement streaks increase carry-forward rate (50% base to 75% at 90-day streak) and decrease crystallization threshold (3 days to 2 days). Long-term engaged members get stronger demand signaling power because they''ll actually USE the features.', 'platform-economics', 'documented', NULL),
  (1715, 'Pre-Operational Feature Thermometer', 'Live progress page for each pre-development feature showing Shadow Mark commitments plus Credit pledges vs. activation threshold. Displays Alpha/Beta/Operational lead time estimates, user''s personal allocation with persistence day count, and crystallization countdown.', 'ux-design', 'documented', NULL),
  (1716, 'Ranked Choice Production Tier Lock-In', 'Multi-preference ordering with time-bounded cascade: primary tier (fills within N days) cascades to fallback tier (fills within M days) then expires with Credit return. Eliminates decision paralysis and optimizes batch fill rates.', 'platform-economics', 'documented', NULL),
  (1717, 'Cascade-Down Unit Amplification', 'When user''s preference cascades to cheaper production tier, same Credits automatically cover MORE units (250 Credits at Tier 3 = 1,000 cards; cascaded to Tier 4 = 1,667 cards). Rewards patience with volume amplification.', 'platform-economics', 'documented', NULL),
  (1718, 'Shadow Mark Persistence Regardless of Credit Return', 'Demand signal (Shadow Marks) persists even when Credit commitment expires or returns. Preserves interest data for future thermometer tracking independent of financial commitment. Shadow Marks and Credits are decoupled signal layers.', 'platform-economics', 'documented', NULL),
  (1719, 'Moneypenny Administrative Threshold Monitor', 'AI administrative assistant processing daily Shadow Mark crystallizations, cascade triggers, thermometer threshold alerts, and vendor batch coordination. Phase 1: cron + email digest. Phase 2: interactive assistant. Phase 3: full AI admin.', 'ux-design', 'documented', NULL)
ON CONFLICT (innovation_number) DO NOTHING;

-- Update canonical count 1709 → 1719
UPDATE platform_canonical SET value = '1719', updated_at = NOW() WHERE key = 'innovation_count';
