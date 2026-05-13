-- SAGA 6 Phase A: IP Ledger v2 — append-only + supersedes chain
-- BP041 Founder direct: "we need a way to make a LOOP that RESETS the authentic owner as the owner
-- — so that it is still always recorded, never erased."
-- Doctrine: project_ip_ledger_correction_branch_supersedes_pattern_bp041.md
-- BLOOD RULE: registered_by = cooperative-substrate member_id ONLY; never real-name
-- Federal Body Cam doctrine: always recorded, never erased, never updated in place

-- ─── Core IP Ledger (cooperative-public attribution) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.ip_ledger (
    ledger_id             text PRIMARY KEY,
    type                  text NOT NULL CHECK (type IN (
                              'registration',
                              'correction',
                              'supersession_marker',
                              'adjudication'
                          )),
    registered_at         timestamptz NOT NULL DEFAULT now(),
    -- BLOOD RULE: member_id only; real-name ↔ identity map held by Harper Guild ONLY
    registered_by         text NOT NULL,
    claim                 text NOT NULL,
    claim_body            text,
    evidence              jsonb NOT NULL DEFAULT '[]'::jsonb,
    category              text NOT NULL DEFAULT 'innovation'
                              CHECK (category IN (
                                  'innovation', 'crown', 'paper', 'provisional',
                                  'sub-panel', 'portal_search', 'plugin', 'correction', 'other'
                              )),
    -- Supersedes chain (correction-branch primitive)
    supersedes            text REFERENCES public.ip_ledger(ledger_id),
    superseded_by         text REFERENCES public.ip_ledger(ledger_id),
    supersedes_reason     text CHECK (supersedes_reason IN (
                              'ip_theft_proven', 'honest_mistake',
                              'prior_art_discovered', 'misattribution', NULL
                          )),
    adjudicators          text[]    NOT NULL DEFAULT '{}',
    adjudication_evidence text[]    NOT NULL DEFAULT '{}',
    status                text NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'superseded', 'disputed'))
);

-- ─── Append-only enforcement (Federal Body Cam doctrine) ─────────────────────

CREATE OR REPLACE FUNCTION public.ip_ledger_append_only_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        'IP Ledger is append-only. INSERT correction entries instead of UPDATE/DELETE. '
        'Federal Body Cam doctrine. Doctrine ref: project_ip_ledger_correction_branch_supersedes_pattern_bp041.md';
END;
$$;

CREATE TRIGGER ip_ledger_no_update
    BEFORE UPDATE ON public.ip_ledger
    FOR EACH ROW EXECUTE FUNCTION public.ip_ledger_append_only_guard();

CREATE TRIGGER ip_ledger_no_delete
    BEFORE DELETE ON public.ip_ledger
    FOR EACH ROW EXECUTE FUNCTION public.ip_ledger_append_only_guard();

-- ─── Portal Events (Brand-Stamped Use + Triple-Stamp log) ────────────────────
-- Every Portal interaction by law enforcement / external parties is logged here.
-- Privacy-by-default per Harper Guild canon; disclosure_status administers visibility.

CREATE TABLE IF NOT EXISTS public.ip_ledger_portal_events (
    event_id              text PRIMARY KEY,
    event_type            text NOT NULL CHECK (event_type IN (
                              'portal_search', 'case_unlock', 'case_reopen',
                              'stamp_issue',   'stamp_revoke'
                          )),
    -- Brand-Stamped Use: always an individual person, never anonymous, never shared ID
    stamped_individual_id text NOT NULL,
    agency_id             text,
    legal_basis_ref       text,
    -- SHA-256 of raw search query; raw query never stored (Privacy-by-default)
    query_hash            text,
    result_scope          text NOT NULL DEFAULT 'none'
                              CHECK (result_scope IN ('full', 'aggregate', 'none')),
    -- Harper Guild rule that governs disclosure of this event
    disclosure_rule       text CHECK (disclosure_rule IN (
                              'HG-101', 'HG-102', 'HG-103', 'HG-201', 'HG-301', NULL
                          )),
    disclosure_status     text NOT NULL DEFAULT 'private'
                              CHECK (disclosure_status IN (
                                  'disclosed', 'private', 'sealed', 'pending_review'
                              )),
    seal_expires_at       timestamptz,
    member_notified       boolean NOT NULL DEFAULT false,
    member_notified_at    timestamptz,
    created_at            timestamptz NOT NULL DEFAULT now(),
    -- Triple-Stamp state at time of event (Personal + Agency + Legal Basis)
    stamp1_personal       boolean NOT NULL DEFAULT false,
    stamp2_agency         boolean NOT NULL DEFAULT false,
    stamp3_legal_basis    boolean NOT NULL DEFAULT false,
    -- Forensic fingerprint (watermark chain basis)
    ip_address_hash       text,   -- SHA-256 of IP; never raw IP stored
    user_agent            text
);

CREATE TRIGGER ip_ledger_portal_no_update
    BEFORE UPDATE ON public.ip_ledger_portal_events
    FOR EACH ROW EXECUTE FUNCTION public.ip_ledger_append_only_guard();

CREATE TRIGGER ip_ledger_portal_no_delete
    BEFORE DELETE ON public.ip_ledger_portal_events
    FOR EACH ROW EXECUTE FUNCTION public.ip_ledger_append_only_guard();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ip_ledger_claim
    ON public.ip_ledger(claim);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_status
    ON public.ip_ledger(status);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_registered_by
    ON public.ip_ledger(registered_by);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_supersedes
    ON public.ip_ledger(supersedes)
    WHERE supersedes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ip_ledger_category
    ON public.ip_ledger(category);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_portal_individual
    ON public.ip_ledger_portal_events(stamped_individual_id);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_portal_created
    ON public.ip_ledger_portal_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_portal_event_type
    ON public.ip_ledger_portal_events(event_type);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_portal_disclosure
    ON public.ip_ledger_portal_events(disclosure_status);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.ip_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_ledger_portal_events ENABLE ROW LEVEL SECURITY;

-- IP Ledger is cooperative-public (Federal Body Cam doctrine): readable by authenticated members
CREATE POLICY ip_ledger_select
    ON public.ip_ledger FOR SELECT
    USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Any authenticated member may register or correct (adjudication validates at app layer)
CREATE POLICY ip_ledger_insert
    ON public.ip_ledger FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Portal events: service_role only (Harper Guild staff substrate API; not member-readable by default)
CREATE POLICY ip_ledger_portal_select
    ON public.ip_ledger_portal_events FOR SELECT
    USING (auth.role() = 'service_role');

CREATE POLICY ip_ledger_portal_insert
    ON public.ip_ledger_portal_events FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ─── Comments (doctrine anchors) ─────────────────────────────────────────────

COMMENT ON TABLE public.ip_ledger IS
    'Append-only IP attribution ledger. Federal Body Cam doctrine: always recorded, never erased. '
    'Supersedes-chain enables correction without erasure. AGPL-licensed. BP041.';

COMMENT ON TABLE public.ip_ledger_portal_events IS
    'Brand-Stamped Use log. Every Portal access by law enforcement or external parties is '
    'triple-stamp verified and append-only logged. Privacy-by-default; Harper Guild administers disclosure.';

COMMENT ON COLUMN public.ip_ledger.registered_by IS
    'Cooperative-substrate member_id ONLY. Real-name cross-reference held by Harper Guild ONLY. BLOOD RULE.';

COMMENT ON COLUMN public.ip_ledger.supersedes IS
    'ledger_id of the entry being corrected. Original entry status changed to superseded via '
    'supersession_marker INSERT (not UPDATE). Append-only correction-branch.';

COMMENT ON COLUMN public.ip_ledger_portal_events.query_hash IS
    'SHA-256 of raw search query. Raw query never stored. Privacy-by-default per Harper Guild canon.';

COMMENT ON COLUMN public.ip_ledger_portal_events.ip_address_hash IS
    'SHA-256 of requestor IP. Raw IP never stored. Watermark chain traced at Harper Guild request.';
