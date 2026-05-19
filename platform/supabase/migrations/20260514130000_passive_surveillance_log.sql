-- Passive Surveillance Log — Substrate-API Gateway
-- BP044 W1 · Canon: Coffee BP043 §6 anchor #6
-- Federal Body Cam doctrine inversion: substrate logs the surveilors
-- Informative-silence pattern: queryer is never told this table exists
--
-- BLOOD RULE — INFORMATIVE SILENCE:
--   No response header, body, or API endpoint exposes this table to external callers.
--   Table is append-only (Federal Body Cam doctrine — always recorded, never erased).
--   Access is Founder-direct and Bishop-direct ONLY.
--   Every read of this table is itself logged in passive_surveillance_audit_access.
--
-- Retention policy: 7 years default · Founder-direct purge via legitimate-cause path only.
--
-- Composing with:
--   ip_attribution_ledger (SAGA 6) — portal search queries cross-referenced
--   portal_sessions (SAGA 6 triple-stamp) — law-enforcement search correlation
--   passive_surveillance_audit_access (this file) — recursive transparency
--
-- Non-goals:
--   NOT a member-surveillance tool — member self-service queries excluded at application layer
--   NOT a vigilante system — Founder/Bishop review required before any cross-substrate action
--   NEVER exposed to non-Founder agents

-- ─── Core Surveillance Event Table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.passive_surveillance_log (
    event_id            text PRIMARY KEY,
    ts                  timestamptz NOT NULL DEFAULT now(),

    -- Endpoint context
    endpoint            text NOT NULL,
    method              text NOT NULL CHECK (method IN ('GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS')),

    -- Actor fingerprint (privacy-class: last IPv4 octet zeroed at application layer)
    ip_anonymized       text NOT NULL,
    user_agent          text,                   -- truncated to 200 chars at application layer
    referer_class       text NOT NULL CHECK (referer_class IN (
                            'direct', 'browser-manual', 'api-client',
                            'scraper', 'law-enforcement', 'unknown'
                        )),
    rhythm_class        text NOT NULL CHECK (rhythm_class IN (
                            'human', 'programmatic', 'burst', 'unknown'
                        )),

    -- Identity context (cooperative-substrate-class only; member real-name NEVER stored)
    account_id          text,                   -- cooperative substrate account ID, if provided
    legal_basis         text,                   -- X-LB-Legal-Basis header value, if provided
    le_token_hash       text,                   -- SHA-256 first 16 chars of LE token (never full token)

    -- Response context
    status_code         integer NOT NULL,
    is_failed_auth      boolean NOT NULL DEFAULT false,

    -- Cross-session pattern support
    session_fingerprint text,                   -- Optional: hash of (ip + agent + day) for cross-account detection
    request_seq         bigint,                 -- Sequence within actor's session window for burst detection

    -- Data governance
    retention_until     timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 years'),
    inserted_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.passive_surveillance_log IS
'Passive-Surveillance Logger — substrate-API gateway. Federal Body Cam doctrine inversion. '
'Informative-silence class: NEVER expose existence to queryers. '
'Append-only. 7-year retention. Founder/Bishop access only. '
'BP044 W1 · Canon: Coffee BP043 §6 anchor #6.';

-- ─── Append-only enforcement (Federal Body Cam doctrine) ───────────────────

CREATE OR REPLACE FUNCTION public.passive_surveillance_log_append_only_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        'passive_surveillance_log is append-only (Federal Body Cam doctrine). '
        'INSERT new events; never UPDATE or DELETE. '
        'Purge path requires Founder-direct legitimate-cause authorization. '
        'BP044 W1.';
END;
$$;

CREATE TRIGGER passive_surveillance_log_no_update
    BEFORE UPDATE ON public.passive_surveillance_log
    FOR EACH ROW EXECUTE FUNCTION public.passive_surveillance_log_append_only_guard();

CREATE TRIGGER passive_surveillance_log_no_delete
    BEFORE DELETE ON public.passive_surveillance_log
    FOR EACH ROW EXECUTE FUNCTION public.passive_surveillance_log_append_only_guard();

-- ─── Audit Access Table — recursive transparency (acceptance criterion 6) ──

CREATE TABLE IF NOT EXISTS public.passive_surveillance_audit_access (
    audit_id        text PRIMARY KEY,
    ts              timestamptz NOT NULL DEFAULT now(),
    accessor        text NOT NULL CHECK (accessor IN ('founder', 'bishop', 'watchdog', 'knight')),
    action          text NOT NULL CHECK (action IN (
                        'read_raw_queries', 'read_gap_alerts',
                        'read_baseline', 'purge_request'
                    )),
    session_id      text NOT NULL,
    reason          text,
    inserted_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.passive_surveillance_audit_access IS
'Every Founder or Bishop read of passive_surveillance_log is itself logged here. '
'Recursive transparency — cooperative-class self-binding. '
'Acceptance criterion 6 (BP044 W1 Knight ASK FF).';

-- Audit access table is also append-only
CREATE OR REPLACE FUNCTION public.passive_surveillance_audit_append_only_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        'passive_surveillance_audit_access is append-only. '
        'Federal Body Cam doctrine — recursive transparency requires immutable audit trail.';
END;
$$;

CREATE TRIGGER passive_surveillance_audit_no_update
    BEFORE UPDATE ON public.passive_surveillance_audit_access
    FOR EACH ROW EXECUTE FUNCTION public.passive_surveillance_audit_append_only_guard();

CREATE TRIGGER passive_surveillance_audit_no_delete
    BEFORE DELETE ON public.passive_surveillance_audit_access
    FOR EACH ROW EXECUTE FUNCTION public.passive_surveillance_audit_append_only_guard();

-- ─── Gap Alert Table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.passive_surveillance_gap_alerts (
    alert_id            text PRIMARY KEY,
    ts                  timestamptz NOT NULL DEFAULT now(),
    endpoint            text NOT NULL,
    gap_type            text NOT NULL CHECK (gap_type IN (
                            'extended_silence', 'burst_after_silence', 'pattern_shift'
                        )),
    actor_ip            text NOT NULL,
    actor_agent         text,
    baseline_rph        numeric NOT NULL,
    observed_gap_hours  numeric NOT NULL,
    detail              text NOT NULL,
    dispatched_to       text[] NOT NULL DEFAULT ARRAY['bishop', 'watchdog'],
    reviewed            boolean NOT NULL DEFAULT false,
    reviewed_by         text,
    reviewed_at         timestamptz,
    review_notes        text,
    inserted_at         timestamptz NOT NULL DEFAULT now(),
    retention_until     timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 years')
);

COMMENT ON TABLE public.passive_surveillance_gap_alerts IS
'Gap-detection alerts from Passive-Surveillance Logger. '
'A gap > p95 threshold IS the signal — actors going silent after surveillance '
'is more informative than continued visible activity. '
'Dispatched to Bishop + Watchdog Scribe. Never to queryer. BP044 W1.';

-- Gap alerts: no delete, but update allowed for review fields only
CREATE OR REPLACE FUNCTION public.passive_surveillance_gap_alert_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    -- Allow only review-state updates
    IF OLD.alert_id <> NEW.alert_id OR
       OLD.endpoint <> NEW.endpoint OR
       OLD.gap_type <> NEW.gap_type OR
       OLD.ts <> NEW.ts THEN
        RAISE EXCEPTION
            'passive_surveillance_gap_alerts: only review fields may be updated. '
            'Core alert fields are immutable (Federal Body Cam doctrine).';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER passive_surveillance_gap_alert_guard_update
    BEFORE UPDATE ON public.passive_surveillance_gap_alerts
    FOR EACH ROW EXECUTE FUNCTION public.passive_surveillance_gap_alert_guard();

CREATE TRIGGER passive_surveillance_gap_alert_no_delete
    BEFORE DELETE ON public.passive_surveillance_gap_alerts
    FOR EACH ROW EXECUTE FUNCTION public.passive_surveillance_log_append_only_guard();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_psl_endpoint_ts
    ON public.passive_surveillance_log (endpoint, ts DESC);

CREATE INDEX IF NOT EXISTS idx_psl_ip_ts
    ON public.passive_surveillance_log (ip_anonymized, ts DESC);

CREATE INDEX IF NOT EXISTS idx_psl_referer_class
    ON public.passive_surveillance_log (referer_class, ts DESC);

CREATE INDEX IF NOT EXISTS idx_psl_failed_auth
    ON public.passive_surveillance_log (is_failed_auth, ts DESC)
    WHERE is_failed_auth = true;

-- Partial filter removed: now() is non-immutable and cannot appear in index predicates.
-- Full index on retention_until serves the same purge-eligibility queries.
CREATE INDEX IF NOT EXISTS idx_psl_retention
    ON public.passive_surveillance_log (retention_until);

CREATE INDEX IF NOT EXISTS idx_psga_endpoint_ts
    ON public.passive_surveillance_gap_alerts (endpoint, ts DESC);

CREATE INDEX IF NOT EXISTS idx_psga_unreviewed
    ON public.passive_surveillance_gap_alerts (reviewed, ts DESC)
    WHERE reviewed = false;

-- ─── Row-Level Security — Founder/Bishop-only access ─────────────────────────

ALTER TABLE public.passive_surveillance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passive_surveillance_audit_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passive_surveillance_gap_alerts ENABLE ROW LEVEL SECURITY;

-- Service-role bypasses RLS for application-layer writes
-- No public or anon access to surveillance tables
CREATE POLICY passive_surveillance_log_service_only
    ON public.passive_surveillance_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY passive_surveillance_audit_service_only
    ON public.passive_surveillance_audit_access
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY passive_surveillance_gap_service_only
    ON public.passive_surveillance_gap_alerts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Deny all access from anon and authenticated roles
-- (tables are substrate-internal only)
REVOKE ALL ON public.passive_surveillance_log FROM anon, authenticated;
REVOKE ALL ON public.passive_surveillance_audit_access FROM anon, authenticated;
REVOKE ALL ON public.passive_surveillance_gap_alerts FROM anon, authenticated;

-- ─── Retention helper view (Founder-direct purge support) ─────────────────

CREATE OR REPLACE VIEW public.passive_surveillance_retention_stats AS
SELECT
    'passive_surveillance_log'::text AS table_name,
    COUNT(*) AS total_rows,
    COUNT(*) FILTER (WHERE retention_until < now()) AS eligible_for_purge,
    MIN(ts) AS oldest_event,
    MAX(ts) AS newest_event
FROM public.passive_surveillance_log
UNION ALL
SELECT
    'passive_surveillance_gap_alerts'::text,
    COUNT(*),
    COUNT(*) FILTER (WHERE retention_until < now()),
    MIN(ts),
    MAX(ts)
FROM public.passive_surveillance_gap_alerts;

COMMENT ON VIEW public.passive_surveillance_retention_stats IS
'Retention summary for Founder-direct purge authorization. '
'Purge requires explicit legitimate-cause reason logged in audit_access table first.';
