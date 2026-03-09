-- ============================================================
-- JOULE & MEDALLION BYLAWS — February 10, 2026
-- ============================================================
-- Three new structural bylaws + DNA Lock + Joule purpose bylaw
-- ============================================================

-- ─── NEW STRUCTURAL BYLAWS ───

INSERT INTO structural_bylaws (id, name, description, category, protection_level, amendment_requirement)
VALUES
  ('bylaw-no-appreciation', 'No Appreciation Tokens', 'Platform credits, Joules, and medallions do not grant fractional claims on project- or platform-level profits and do not appreciate in dollar value based on campaign performance or enterprise valuation. Backers receive fixed-value credits or Joules for overpayment, which increase their internal purchasing power and contract-backing capacity, not their right to external cash returns. System-level benefits (better prices, more initiatives) are the mechanism for shared prosperity, not token price increases.', 'economics', 'structural', '80% vote + Founder veto'),
  ('bylaw-joule-purpose', 'Joule Purpose', 'Joules are higher-order internal units that (a) back member offers and contracts, (b) may convert into Credits on more favorable terms for active contributors, and (c) may be offered at promotional exchange rates during defined events. Joules facilitate members'' ability to earn and trade within the cooperative but are never redeemable for cash or transferable outside the platform.', 'economics', 'structural', '80% vote + Founder veto'),
  ('bylaw-medallion-access', 'Project Medallion Access Rights', 'When a member backs a project at a premium, that support is recorded as a project-stamped medallion plus awarded Joules in the IP ledger. In future campaigns directly related to that project, the platform may grant first-access and pre-order rights up to the amount of the original support gap, but this access is a non-cash perk, does not change the exchange rate of Joules or Credits, and does not create any right to past or future revenue from that project. Project medallions can unlock priority and participation, but never cash or variable token pricing.', 'economics', 'structural', '80% vote + Founder veto')
ON CONFLICT (id) DO NOTHING;

-- ─── DNA LOCK: Joule behavior parameters ───

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('joule_cash_redeemable',     'false',   'boolean', true, 'SYSTEM', 'Joules can never be redeemed for cash',                              'economics'),
  ('joule_transferable',        'false',   'boolean', true, 'SYSTEM', 'Joules can never be transferred between users',                      'economics'),
  ('joule_appreciation_tied',   'false',   'boolean', true, 'SYSTEM', 'Joule value does not appreciate based on project performance',       'economics'),
  ('joule_special_rate',        '1.2',     'decimal', true, 'SYSTEM', 'Special event Joule purchase rate multiplier',                       'economics'),
  ('joule_tier_discount',       '5',       'integer', true, 'SYSTEM', 'Percent discount on Joules every 10th tier increase',                'economics'),
  ('medallion_grants_revenue',  'false',   'boolean', true, 'SYSTEM', 'Medallions never grant rights to project revenue',                   'economics'),
  ('medallion_grants_rofr',     'true',    'boolean', true, 'SYSTEM', 'Medallions may grant first-access rights to future related campaigns','economics'),
  ('sponsor_min_amount',        '25',      'integer', true, 'SYSTEM', 'Minimum sponsor amount in dollars',                                  'economics'),
  ('sponsor_ownership_pool',    '20',      'integer', true, 'SYSTEM', 'Percent of patent portfolio available via sponsor pool',              'economics')
ON CONFLICT (parameter_key) DO NOTHING;
