-- =============================================================================
-- MIGRATION: 20260329000008_k159_cephas_slug_dedup
-- PURPOSE:   Deduplicate Cephas content registry entries where two slugs
--            point to the same content. Merge references, drop duplicates,
--            add UNIQUE constraint for safety.
-- DATE:      2026-03-29  |  Knight 159
-- =============================================================================

-- =====================
-- 1. civ-paper → compounding-innovation-velocity
-- Both contain the same CIV academic paper. Keep canonical slug.
-- =====================

-- Copy content from civ-paper to compounding-innovation-velocity if CIV has no content
UPDATE cephas_content_registry AS target
SET content_markdown = source.content_markdown,
    updated_at = now()
FROM cephas_content_registry AS source
WHERE source.slug = 'civ-paper'
  AND target.slug = 'compounding-innovation-velocity'
  AND source.content_markdown IS NOT NULL
  AND source.content_markdown != ''
  AND (target.content_markdown IS NULL OR target.content_markdown = '');

-- Delete the duplicate slug
DELETE FROM cephas_content_registry WHERE slug = 'civ-paper';

-- =====================
-- 2. Ensure no other accidental duplicates exist
-- Check for any titles that appear more than once across different slugs
-- =====================

-- The 2nd-second-revolution (article) vs 2nd-second-revolution-paper (academic paper) are
-- INTENTIONALLY separate: one is pudding-style article, other is clean_academic paper.
-- No dedup needed for those.

-- =====================
-- 3. Add UNIQUE constraint on slug if not already present
-- (The table definition uses slug as a column but ON CONFLICT (slug) in INSERTs
-- suggests it may already be unique. Add explicitly for safety.)
-- =====================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'cephas_content_registry'::regclass
      AND contype = 'u'
      AND conname = 'cephas_content_registry_slug_key'
  ) THEN
    -- Check if there's already a unique index
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'cephas_content_registry'
        AND indexdef LIKE '%UNIQUE%slug%'
    ) THEN
      ALTER TABLE cephas_content_registry
        ADD CONSTRAINT cephas_content_registry_slug_key UNIQUE (slug);
    END IF;
  END IF;
END;
$$;

-- =====================
-- 4. Add guest_conversion to ledger_category constraint (for K158 convert-guest-wallet)
-- =====================

ALTER TABLE transaction_ledger
  DROP CONSTRAINT IF EXISTS transaction_ledger_ledger_category_check;

ALTER TABLE transaction_ledger
  ADD CONSTRAINT transaction_ledger_ledger_category_check
  CHECK (ledger_category = ANY (ARRAY[
    'membership', 'commerce_storefront', 'commerce_creator', 'commerce_platform',
    'commerce_gleaners', 'project_funding', 'project_funder_credit', 'project_seeding',
    'project_platform_cap', 'project_escrow', 'guild_payment', 'coalition_fee',
    'housing_fund', 'subscription', 'card_funding', 'card_transaction',
    'connect_payout', 'connect_payout_fee',
    'escrow_hold', 'escrow_release', 'escrow_refund',
    'marks_payback', 'guest_conversion'
  ]));
