-- Migration: BP039 Three-Currency Ledger (Credits/Marks/Joules)
-- Date: 2026-05-12 12:00:00
-- Description: Implements append-only ledger for cooperative currencies with NO-FIAT-CONVERSION enforcement

-- ============================================================================
-- 1. CREATE ENUM TYPE FOR COOPERATIVE CURRENCIES
-- ============================================================================

DO $$
BEGIN
    CREATE TYPE cooperative_currency AS ENUM ('credits', 'marks', 'joules');
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Type already exists, safe to continue
END $$;

-- ============================================================================
-- 2. CREATE APPEND-ONLY CURRENCY LEDGER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.append_only_currency_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_at timestamptz NOT NULL DEFAULT now(),

    -- Participant references (nullable to support different transaction types)
    from_member_id uuid REFERENCES public.members(id) ON DELETE RESTRICT,
    to_member_id uuid REFERENCES public.members(id) ON DELETE RESTRICT,
    from_provider_id uuid REFERENCES public.participating_providers(id) ON DELETE RESTRICT,
    to_provider_id uuid REFERENCES public.participating_providers(id) ON DELETE RESTRICT,

    -- Transaction details
    currency cooperative_currency NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    substitution_kind text NOT NULL CHECK (
        substitution_kind IN (
            'purchase',
            'transfer',
            'reward',
            'redistribution',
            'mutual-aid'
        )
    ),

    -- Optional initiative context
    initiative_id uuid REFERENCES public.initiatives(id) ON DELETE SET NULL,

    -- Cryptographic chain integrity
    prior_txn_hash text,
    txn_hash text NOT NULL,

    -- NO-FIAT-CONVERSION enforcement constraint
    CONSTRAINT no_fiat_conversion CHECK (
        currency IN ('credits', 'marks', 'joules')
    ),

    -- Ensure at least one participant is specified
    CONSTRAINT at_least_one_participant CHECK (
        from_member_id IS NOT NULL OR
        to_member_id IS NOT NULL OR
        from_provider_id IS NOT NULL OR
        to_provider_id IS NOT NULL
    )
);

-- ============================================================================
-- 3. CREATE IMMUTABILITY RULES (APPEND-ONLY ENFORCEMENT)
-- ============================================================================

DO $$
BEGIN
    CREATE RULE no_update_ledger AS
        ON UPDATE TO public.append_only_currency_ledger
        DO INSTEAD NOTHING;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Rule already exists
END $$;

DO $$
BEGIN
    CREATE RULE no_delete_ledger AS
        ON DELETE TO public.append_only_currency_ledger
        DO INSTEAD NOTHING;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Rule already exists
END $$;

-- ============================================================================
-- 4. CREATE PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ledger_from_member
    ON public.append_only_currency_ledger(from_member_id)
    WHERE from_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ledger_to_member
    ON public.append_only_currency_ledger(to_member_id)
    WHERE to_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ledger_from_provider
    ON public.append_only_currency_ledger(from_provider_id)
    WHERE from_provider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ledger_to_provider
    ON public.append_only_currency_ledger(to_provider_id)
    WHERE to_provider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ledger_txn_at
    ON public.append_only_currency_ledger(txn_at DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_currency
    ON public.append_only_currency_ledger(currency);

CREATE INDEX IF NOT EXISTS idx_ledger_initiative
    ON public.append_only_currency_ledger(initiative_id)
    WHERE initiative_id IS NOT NULL;

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.append_only_currency_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: Members can read their own transactions
DROP POLICY IF EXISTS ledger_read_own ON public.append_only_currency_ledger;
CREATE POLICY ledger_read_own
    ON public.append_only_currency_ledger
    FOR SELECT
    USING (
        auth.uid() = from_member_id OR
        auth.uid() = to_member_id
    );

-- Policy: Service role has full read access (for aggregations/reporting)
DROP POLICY IF EXISTS ledger_read_service ON public.append_only_currency_ledger;
CREATE POLICY ledger_read_service
    ON public.append_only_currency_ledger
    FOR SELECT
    TO service_role
    USING (true);

-- Policy: Authenticated users can insert (application logic validates)
DROP POLICY IF EXISTS ledger_insert_authenticated ON public.append_only_currency_ledger;
CREATE POLICY ledger_insert_authenticated
    ON public.append_only_currency_ledger
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- 6. CREATE MEMBER CURRENCY BALANCES VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.member_currency_balances AS
SELECT
    m.id AS member_id,
    c.currency,
    COALESCE(
        SUM(CASE WHEN l.to_member_id = m.id THEN l.amount ELSE 0 END) -
        SUM(CASE WHEN l.from_member_id = m.id THEN l.amount ELSE 0 END),
        0
    ) AS balance
FROM
    public.members m
CROSS JOIN (
    SELECT unnest(enum_range(NULL::cooperative_currency)) AS currency
) c
LEFT JOIN public.append_only_currency_ledger l
    ON (l.from_member_id = m.id OR l.to_member_id = m.id)
    AND l.currency = c.currency
GROUP BY
    m.id, c.currency
ORDER BY
    m.id, c.currency;

-- Grant access to the view
GRANT SELECT ON public.member_currency_balances TO authenticated;

-- RLS for view: Members can only see their own balances
ALTER VIEW public.member_currency_balances SET (security_invoker = true);

-- ============================================================================
-- 7. CREATE PROVIDER CURRENCY BALANCES VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.provider_currency_balances AS
SELECT
    p.id AS provider_id,
    c.currency,
    COALESCE(
        SUM(CASE WHEN l.to_provider_id = p.id THEN l.amount ELSE 0 END) -
        SUM(CASE WHEN l.from_provider_id = p.id THEN l.amount ELSE 0 END),
        0
    ) AS balance
FROM
    public.participating_providers p
CROSS JOIN (
    SELECT unnest(enum_range(NULL::cooperative_currency)) AS currency
) c
LEFT JOIN public.append_only_currency_ledger l
    ON (l.from_provider_id = p.id OR l.to_provider_id = p.id)
    AND l.currency = c.currency
GROUP BY
    p.id, c.currency
ORDER BY
    p.id, c.currency;

-- Grant access to the view
GRANT SELECT ON public.provider_currency_balances TO authenticated;

-- ============================================================================
-- 8. HELPER FUNCTION: CALCULATE TRANSACTION HASH
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_txn_hash(
    p_txn_at timestamptz,
    p_from_member_id uuid,
    p_to_member_id uuid,
    p_from_provider_id uuid,
    p_to_provider_id uuid,
    p_currency cooperative_currency,
    p_amount numeric,
    p_substitution_kind text,
    p_prior_txn_hash text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN encode(
        digest(
            COALESCE(p_txn_at::text, '') || '|' ||
            COALESCE(p_from_member_id::text, '') || '|' ||
            COALESCE(p_to_member_id::text, '') || '|' ||
            COALESCE(p_from_provider_id::text, '') || '|' ||
            COALESCE(p_to_provider_id::text, '') || '|' ||
            p_currency::text || '|' ||
            p_amount::text || '|' ||
            p_substitution_kind || '|' ||
            COALESCE(p_prior_txn_hash, ''),
            'sha256'
        ),
        'hex'
    );
END;
$$;

-- ============================================================================
-- 9. TRIGGER: AUTO-CALCULATE TRANSACTION HASH ON INSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_calculate_txn_hash()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_latest_hash text;
BEGIN
    -- Get the most recent transaction hash for chain integrity
    SELECT txn_hash INTO v_latest_hash
    FROM public.append_only_currency_ledger
    ORDER BY txn_at DESC, id DESC
    LIMIT 1;

    -- Set prior hash if not provided
    IF NEW.prior_txn_hash IS NULL THEN
        NEW.prior_txn_hash := v_latest_hash;
    END IF;

    -- Calculate and set transaction hash
    NEW.txn_hash := public.calculate_txn_hash(
        NEW.txn_at,
        NEW.from_member_id,
        NEW.to_member_id,
        NEW.from_provider_id,
        NEW.to_provider_id,
        NEW.currency,
        NEW.amount,
        NEW.substitution_kind,
        NEW.prior_txn_hash
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_calculate_txn_hash ON public.append_only_currency_ledger;
CREATE TRIGGER trigger_auto_calculate_txn_hash
    BEFORE INSERT ON public.append_only_currency_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_calculate_txn_hash();

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.append_only_currency_ledger TO authenticated;
GRANT INSERT ON public.append_only_currency_ledger TO authenticated;
GRANT SELECT ON public.member_currency_balances TO authenticated;
GRANT SELECT ON public.provider_currency_balances TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- SELECT COUNT(*) FROM public.append_only_currency_ledger;
-- Expected: 0 (clean install)

-- \d public.append_only_currency_ledger
-- Expected: Table structure with all columns and constraints

-- SELECT * FROM pg_type WHERE typname = 'cooperative_currency';
-- Expected: 1 row showing the enum type

-- SELECT * FROM pg_rules WHERE tablename = 'append_only_currency_ledger';
-- Expected: 2 rows (no_update_ledger, no_delete_ledger)

-- SELECT indexname FROM pg_indexes WHERE tablename = 'append_only_currency_ledger';
-- Expected: Multiple indexes on from_member_id, to_member_id, txn_at, etc.

-- SELECT * FROM public.member_currency_balances LIMIT 5;
-- Expected: Balances view with member_id, currency, balance columns

-- SELECT * FROM public.provider_currency_balances LIMIT 5;
-- Expected: Balances view with provider_id, currency, balance columns

-- Test immutability (should fail):
-- INSERT INTO public.append_only_currency_ledger
--   (from_member_id, to_member_id, currency, amount, substitution_kind, txn_hash)
--   VALUES (gen_random_uuid(), gen_random_uuid(), 'credits', 100, 'transfer', 'test');
-- UPDATE public.append_only_currency_ledger SET amount = 200 WHERE id IS NOT NULL;
-- Expected: UPDATE should do nothing (0 rows affected)
-- DELETE FROM public.append_only_currency_ledger WHERE id IS NOT NULL;
-- Expected: DELETE should do nothing (0 rows affected)
