-- ============================================================================
-- K438a (B117) — Member-Facing Scribes Cathedral schema
-- ============================================================================
-- Backbone for #2268 Member-Owned Scribes Cathedral, deployed against the
-- #2270 Cathedral architecture and the #2269 Three Fates routing pipeline.
--
-- Three-schema separation pattern (per K431):
--   public      — cooperative-governance + commerce (member roster, tiers)
--   upekrithen  — Pedestal Stake commercial track (Reg CF, KYC, holders)
--   cathedral   — per-member Cathedral state (Scribes, entries, routing log)
--
-- Cross-schema FKs are deliberately avoided. The ONLY FK out of `cathedral`
-- is to `auth.users(id)` (authentication identity). A natural person's
-- Cathedral is portable across membership states — even if a member's
-- public.* row is deleted, the Cathedral stays attached to the auth user
-- until the member explicitly invokes delete-all-data (K438b Phase E).
--
-- Append-only invariants:
--   cathedral.scribe_entries  — INSERT-only; NO UPDATE, NO DELETE policies
--   cathedral.fates_log       — INSERT-only; NO UPDATE, NO DELETE policies
--   cathedral.tidbits         — INSERT-only; NO UPDATE, NO DELETE policies
--   member_cathedrals          — UPDATE allowed only on (tier, last_sync_at,
--                                export_count, export_last_at)
--   member_scribes             — full CRUD by owner (Scribe metadata is
--                                editable; existing entries are immutable)
--
-- Cross-member visibility for Guild/Tribe shares is STAGED but inert:
--   share_target_id is a generic UUID with no FK. A future migration
--   (K438b/c) will add cathedral.guild_membership / cathedral.tribe_membership
--   tables and replace the placeholder RLS predicate with real lookups.
--
-- Schema-level notes referencing canonical specs:
--   #2268 Claim 1(a): per-member directory of specialists, append-only
--                     storage per specialist, routing log
--   #2268 Claim 1(d): export-on-close handled by K438b Phase E
--   #2270 Claim 1(c): primary-first retrieval — implemented in MCP layer,
--                     not in this schema (this schema is the storage substrate)
--   #2269 Claim 1(e): routing record persisted in fates_log (this migration)
-- ============================================================================

-- 1. Schema + Postgrest exposure ---------------------------------------------

CREATE SCHEMA IF NOT EXISTS cathedral;

GRANT USAGE ON SCHEMA cathedral TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cathedral TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA cathedral
    GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA cathedral
    GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cathedral TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA cathedral
    GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;

-- 2. Enums --------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE cathedral.tier_enum AS ENUM ('free', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE cathedral.share_level_enum AS ENUM (
        'private',  -- member-only; the default
        'guild',    -- shared with one declared Guild
        'tribe',    -- shared with one declared Tribe
        'commons'   -- shared globally with all enrolled members (opt-in)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Mirrors librarian-mcp/src/scribes/cathedral.ts ScribeSource type.
-- Kept as TEXT-with-CHECK rather than ENUM so MCP can extend without DDL.
-- (Bishop B117 may add 'companion_bridge' or similar in the K445 Companion ship.)

-- 3. member_cathedrals --------------------------------------------------------
-- One row per enrolled member. Provisioned lazily on first call to
-- cathedral.ensure_member_cathedral() — typically wired to a post-signup hook.

CREATE TABLE IF NOT EXISTS cathedral.member_cathedrals (
    member_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    tier             cathedral.tier_enum NOT NULL DEFAULT 'free',
    last_sync_at     TIMESTAMPTZ,
    export_count     INTEGER NOT NULL DEFAULT 0,
    export_last_at   TIMESTAMPTZ,
    -- Free-text "professional domain" the member declared at enrollment.
    -- Used to seed the 'Work' starter Scribe's primary field per #2268.
    -- Optional: NULL is acceptable; UI prompts on first /my/cathedral visit.
    professional_domain TEXT,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cathedral.member_cathedrals IS
    '#2268 Claim 1(a): per-member Cathedral root. One row per enrolled member.';

-- 4. member_scribes -----------------------------------------------------------
-- Per-member Scribe registry. Each row is one specialist (#2270 Claim 1(a)).
-- adjacents JSONB schema: array of {level: int 2..12, field: text}, max length 12.

CREATE TABLE IF NOT EXISTS cathedral.member_scribes (
    scribe_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    primary_field    TEXT NOT NULL,
    adjacents        JSONB NOT NULL DEFAULT '[]'::jsonb,
    keywords         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    active           BOOLEAN NOT NULL DEFAULT true,
    share_level      cathedral.share_level_enum NOT NULL DEFAULT 'private',
    -- For share_level IN ('guild','tribe'), points at the target group's
    -- UUID. For 'private' or 'commons', MUST be NULL. No FK on purpose:
    -- Guild/Tribe tables land in K438b/c.
    share_target_id  UUID,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Adjacents ≤ 12 (#2270 Claim 1(a)). Empty array allowed for sparse Scribes.
    CONSTRAINT member_scribes_adjacents_max_12 CHECK (
        jsonb_array_length(adjacents) <= 12
    ),
    -- share_target_id must be set iff share_level IN ('guild','tribe')
    CONSTRAINT member_scribes_share_target_consistency CHECK (
        (share_level IN ('guild','tribe') AND share_target_id IS NOT NULL)
        OR (share_level IN ('private','commons') AND share_target_id IS NULL)
    ),
    -- Names are unique within a member's Cathedral (case-insensitive enforced
    -- via a unique functional index below).
    CONSTRAINT member_scribes_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_member_scribes_member_name_unique
    ON cathedral.member_scribes (member_id, lower(name));
CREATE INDEX IF NOT EXISTS idx_member_scribes_member
    ON cathedral.member_scribes (member_id);
CREATE INDEX IF NOT EXISTS idx_member_scribes_active_share
    ON cathedral.member_scribes (active, share_level)
    WHERE active = true;

COMMENT ON TABLE cathedral.member_scribes IS
    '#2270 Claim 1(a): specialist registry, one row per Scribe. adjacents '
    'JSONB array of {level, field} with level 2..12 (PhD-adjacent 2-3, '
    'junior-adjacent 4-6, ancillary 7-12). Max 12 adjacents.';

-- 5. scribe_entries -----------------------------------------------------------
-- Append-only tablet entries (#2270 Claim 1(b)). Materialized `shared` flag
-- captures the Scribe's share_level at INSERT time and is immutable thereafter
-- (#2268 sharing semantics: existing entries don't retroactively change
-- visibility when the member adjusts the Scribe's share_level later).

CREATE TABLE IF NOT EXISTS cathedral.scribe_entries (
    entry_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scribe_id        UUID NOT NULL REFERENCES cathedral.member_scribes(scribe_id) ON DELETE CASCADE,
    member_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ts               TIMESTAMPTZ NOT NULL DEFAULT now(),
    session_id       TEXT,
    observation      TEXT NOT NULL,
    source           TEXT NOT NULL DEFAULT 'founder_dialogue',
    canonical_ref    TEXT,
    tags             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- `shared` is the materialized share_level at write-time, captured as a
    -- snapshot enum so the immutability invariant is enforced at the row level
    -- regardless of later Scribe.share_level edits.
    shared_level     cathedral.share_level_enum NOT NULL DEFAULT 'private',
    -- `shared` (bool) per K438 prompt schema — true iff shared_level != 'private'
    -- at write time. Populated by a BEFORE-INSERT trigger so the boolean stays
    -- a derivative of shared_level and never drifts.
    shared           BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT scribe_entries_observation_not_empty CHECK (length(trim(observation)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_scribe_entries_scribe_ts
    ON cathedral.scribe_entries (scribe_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_scribe_entries_member_ts
    ON cathedral.scribe_entries (member_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_scribe_entries_session
    ON cathedral.scribe_entries (session_id) WHERE session_id IS NOT NULL;
-- Commons feed index: shared entries across all members, sorted recent-first.
CREATE INDEX IF NOT EXISTS idx_scribe_entries_commons
    ON cathedral.scribe_entries (ts DESC)
    WHERE shared = true AND shared_level = 'commons';

COMMENT ON TABLE cathedral.scribe_entries IS
    '#2270 Claim 1(b): append-only Scribe tablet entries. NO UPDATE, NO DELETE '
    'policies (RLS deny by default). shared_level is materialized at INSERT '
    'time from the parent Scribe and is IMMUTABLE per #2268 semantics.';

-- BEFORE-INSERT trigger to materialize shared_level/shared from member_scribes.
-- K438a behavior: ALWAYS copy the parent Scribe's share_level at write time.
-- The materialized snapshot is then immutable for the life of the entry.
-- (K438b/c will add an optional per-entry downgrade override for #2268
-- entry-level consent granularity. Per-entry elevation above the Scribe's
-- ceiling is intentionally never supported.)
CREATE OR REPLACE FUNCTION cathedral.materialize_scribe_entry_share()
RETURNS TRIGGER AS $$
DECLARE
    v_share_level cathedral.share_level_enum;
    v_scribe_member UUID;
BEGIN
    SELECT share_level, member_id INTO v_share_level, v_scribe_member
    FROM cathedral.member_scribes
    WHERE scribe_id = NEW.scribe_id;

    IF v_share_level IS NULL THEN
        RAISE EXCEPTION 'cathedral.scribe_entries insert: scribe_id % not found', NEW.scribe_id;
    END IF;
    IF v_scribe_member <> NEW.member_id THEN
        RAISE EXCEPTION 'cathedral.scribe_entries insert: member_id mismatch (entry=%, scribe owner=%)',
            NEW.member_id, v_scribe_member;
    END IF;

    NEW.shared_level := v_share_level;
    NEW.shared       := (v_share_level <> 'private');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = cathedral, public;

DROP TRIGGER IF EXISTS trg_scribe_entries_materialize ON cathedral.scribe_entries;
CREATE TRIGGER trg_scribe_entries_materialize
    BEFORE INSERT ON cathedral.scribe_entries
    FOR EACH ROW EXECUTE FUNCTION cathedral.materialize_scribe_entry_share();

-- 6. fates_log ----------------------------------------------------------------
-- Routing audit (#2269 Claim 1(e)). One row per Three Fates dispatch.

CREATE TABLE IF NOT EXISTS cathedral.fates_log (
    log_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id       TEXT,
    ts               TIMESTAMPTZ NOT NULL DEFAULT now(),
    content_hash     TEXT NOT NULL,
    themes           JSONB NOT NULL DEFAULT '[]'::jsonb,
    scores           JSONB NOT NULL DEFAULT '{}'::jsonb,
    dispatches       JSONB NOT NULL DEFAULT '[]'::jsonb,
    coverage_gaps    JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_fates_log_member_ts
    ON cathedral.fates_log (member_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_fates_log_session
    ON cathedral.fates_log (session_id) WHERE session_id IS NOT NULL;

COMMENT ON TABLE cathedral.fates_log IS
    '#2269 Claim 1(e): Three Fates routing record. One row per dispatch. '
    'No UPDATE, no DELETE — append-only audit substrate.';

-- 7. tidbits ------------------------------------------------------------------
-- SP-21 verify-action ledger per member (#2271, sibling of fates_log).

-- Column names match the K438a prompt verbatim (artifact_served, bridle_rule_invoked).
-- librarian-mcp/stitchpunks/scribes/tidbits.jsonl uses different keys; the
-- mapping happens in the K438b MCP wiring layer.
CREATE TABLE IF NOT EXISTS cathedral.tidbits (
    tidbit_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ts                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    agent                TEXT NOT NULL,
    session_id           TEXT,
    category             TEXT NOT NULL,
    observation          TEXT NOT NULL,
    artifact_served      TEXT,
    bridle_rule_invoked  TEXT,
    CONSTRAINT tidbits_observation_not_empty CHECK (length(trim(observation)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_tidbits_member_ts
    ON cathedral.tidbits (member_id, ts DESC);

COMMENT ON TABLE cathedral.tidbits IS
    '#2271 SP-21 Tidbit Scribe per-member ledger. Verify-action discipline '
    'record, deliberately separate from domain-content Scribes.';

-- 8. updated_at trigger -------------------------------------------------------

CREATE OR REPLACE FUNCTION cathedral.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_cathedrals_updated_at ON cathedral.member_cathedrals;
CREATE TRIGGER trg_member_cathedrals_updated_at
    BEFORE UPDATE ON cathedral.member_cathedrals
    FOR EACH ROW EXECUTE FUNCTION cathedral.set_updated_at();

DROP TRIGGER IF EXISTS trg_member_scribes_updated_at ON cathedral.member_scribes;
CREATE TRIGGER trg_member_scribes_updated_at
    BEFORE UPDATE ON cathedral.member_scribes
    FOR EACH ROW EXECUTE FUNCTION cathedral.set_updated_at();

-- 9. Starter-pack provisioning ------------------------------------------------
-- 5 starter Scribes per K438 Phase B spec. Each Scribe ships with default
-- adjacents and keyword seeds so retrieval (Phase F test #8) has signal
-- from day one. Members can rename / extend / archive any Scribe via
-- /my/cathedral/<scribe_id> after enrollment.

CREATE OR REPLACE FUNCTION cathedral.provision_starter_scribes(p_member_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_inserted INTEGER := 0;
BEGIN
    -- Idempotent: skip any name that already exists for this member.
    -- Uses ON CONFLICT against the unique index on (member_id, lower(name)).

    INSERT INTO cathedral.member_scribes
        (member_id, name, primary_field, adjacents, keywords, active, share_level)
    VALUES
        (p_member_id, 'Work',
         'your professional domain',
         '[
            {"level": 2, "field": "current role and responsibilities"},
            {"level": 3, "field": "team and collaborators"},
            {"level": 3, "field": "tools and software you rely on"},
            {"level": 4, "field": "industry context and trends"},
            {"level": 5, "field": "career goals and trajectory"}
          ]'::jsonb,
         ARRAY['work','job','role','team','project','meeting','client','colleague'],
         true, 'private'),

        (p_member_id, 'Learning',
         'what you are currently studying',
         '[
            {"level": 2, "field": "courses and curricula"},
            {"level": 3, "field": "books and articles"},
            {"level": 4, "field": "concepts and frameworks"},
            {"level": 5, "field": "questions you are still resolving"}
          ]'::jsonb,
         ARRAY['learn','study','read','course','book','class','tutorial','concept'],
         true, 'private'),

        (p_member_id, 'Projects',
         'active projects',
         '[
            {"level": 2, "field": "milestones and deadlines"},
            {"level": 3, "field": "blockers and dependencies"},
            {"level": 3, "field": "stakeholders and reviewers"},
            {"level": 5, "field": "lessons learned"}
          ]'::jsonb,
         ARRAY['project','milestone','deadline','build','ship','launch','release'],
         true, 'private'),

        (p_member_id, 'Health',
         'personal health context, medications, providers',
         '[
            {"level": 2, "field": "providers and appointments"},
            {"level": 3, "field": "medications and dosages"},
            {"level": 4, "field": "symptoms and observations"},
            {"level": 5, "field": "diet and exercise routines"}
          ]'::jsonb,
         ARRAY['doctor','medication','appointment','symptom','exercise','sleep','diet'],
         true, 'private'),

        (p_member_id, 'Family',
         'family members, dates, preferences, traditions',
         '[
            {"level": 2, "field": "names and relationships"},
            {"level": 3, "field": "birthdays and anniversaries"},
            {"level": 4, "field": "preferences and dislikes"},
            {"level": 5, "field": "traditions and recurring events"}
          ]'::jsonb,
         ARRAY['family','spouse','partner','child','parent','sibling','birthday','anniversary'],
         true, 'private')
    ON CONFLICT (member_id, lower(name)) DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    RETURN v_inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = cathedral, public;

COMMENT ON FUNCTION cathedral.provision_starter_scribes IS
    'Idempotently inserts 5 starter Scribes (Work, Learning, Projects, Health, '
    'Family) per K438 Phase B spec. Returns count of newly inserted rows.';

-- 10. ensure_member_cathedral -------------------------------------------------
-- Idempotent provisioning entry point. Safe to call from app code on every
-- /my/cathedral page load AND from the auth.users trigger below.

CREATE OR REPLACE FUNCTION cathedral.ensure_member_cathedral(
    p_member_id UUID,
    p_professional_domain TEXT DEFAULT NULL
)
RETURNS cathedral.member_cathedrals AS $$
DECLARE
    v_row cathedral.member_cathedrals;
    v_was_new BOOLEAN := false;
BEGIN
    INSERT INTO cathedral.member_cathedrals (member_id, professional_domain)
    VALUES (p_member_id, p_professional_domain)
    ON CONFLICT (member_id) DO NOTHING
    RETURNING * INTO v_row;

    IF v_row.member_id IS NULL THEN
        -- Already exists; load it. Optionally backfill professional_domain
        -- if the caller supplied one and the existing row has none.
        SELECT * INTO v_row FROM cathedral.member_cathedrals WHERE member_id = p_member_id;
        IF p_professional_domain IS NOT NULL
           AND (v_row.professional_domain IS NULL OR length(trim(v_row.professional_domain)) = 0)
        THEN
            UPDATE cathedral.member_cathedrals
               SET professional_domain = p_professional_domain
             WHERE member_id = p_member_id
            RETURNING * INTO v_row;
        END IF;
    ELSE
        v_was_new := true;
    END IF;

    -- Always attempt starter-pack provisioning; ON CONFLICT inside the
    -- function makes this a no-op if Scribes already exist.
    PERFORM cathedral.provision_starter_scribes(p_member_id);

    RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = cathedral, public;

COMMENT ON FUNCTION cathedral.ensure_member_cathedral IS
    'Idempotent: inserts member_cathedrals row + 5 starter Scribes if absent. '
    'Safe to call from auth.users trigger AND from app code.';

-- Alias matching the K438a prompt's API name (cathedral.seed_starter_pack)
-- so any app-side code that follows the prompt verbatim still works.
CREATE OR REPLACE FUNCTION cathedral.seed_starter_pack(p_member_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM cathedral.ensure_member_cathedral(p_member_id, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = cathedral, public;

COMMENT ON FUNCTION cathedral.seed_starter_pack IS
    'Alias for cathedral.ensure_member_cathedral(p_member_id, NULL). Matches '
    'the K438a prompt API surface; either name is callable from supabase.rpc().';

-- 11. auth.users INSERT trigger (post-signup hook) ---------------------------
-- Fires once per new authenticated user; provisions their Cathedral.
-- The trigger function runs with SECURITY DEFINER so it bypasses RLS.

CREATE OR REPLACE FUNCTION cathedral.on_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM cathedral.ensure_member_cathedral(NEW.id, NULL);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Never block auth signup if Cathedral provisioning fails.
    -- Failure surfaces on next /my/cathedral page load (UI calls
    -- ensure_member_cathedral RPC again).
    RAISE WARNING 'cathedral.on_auth_user_created failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = cathedral, public;

DROP TRIGGER IF EXISTS trg_on_auth_user_created_cathedral ON auth.users;
CREATE TRIGGER trg_on_auth_user_created_cathedral
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION cathedral.on_auth_user_created();

-- 12. Row-Level Security ------------------------------------------------------

ALTER TABLE cathedral.member_cathedrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cathedral.member_scribes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cathedral.scribe_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cathedral.fates_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cathedral.tidbits           ENABLE ROW LEVEL SECURITY;

-- ---- member_cathedrals ----
CREATE POLICY mc_own_select ON cathedral.member_cathedrals
    FOR SELECT USING (member_id = auth.uid());

CREATE POLICY mc_own_insert ON cathedral.member_cathedrals
    FOR INSERT WITH CHECK (member_id = auth.uid());

-- UPDATE: members may only mutate their own row, and only the editable fields
-- (tier upgrade flow, sync timestamps, professional_domain).
-- Postgres RLS doesn't natively constrain WHICH columns; we constrain by
-- USING + WITH CHECK on member_id, and rely on the column-level GRANT below
-- to lock down the immutable columns (created_at, member_id, export_count).
CREATE POLICY mc_own_update ON cathedral.member_cathedrals
    FOR UPDATE USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());

REVOKE UPDATE (member_id, created_at, export_count, export_last_at)
    ON cathedral.member_cathedrals FROM authenticated;
GRANT UPDATE (tier, last_sync_at, professional_domain)
    ON cathedral.member_cathedrals TO authenticated;

-- ---- member_scribes ----
-- Members CRUD their own. Cross-member SELECT for Guild/Tribe/Commons is
-- staged via a placeholder predicate that resolves to FALSE until K438b/c
-- adds cathedral.guild_membership / cathedral.tribe_membership tables.

CREATE POLICY ms_own_all ON cathedral.member_scribes
    FOR ALL USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());

-- Commons: any authenticated enrolled member may SELECT another member's
-- Scribe metadata IF the Scribe is shared to commons (the listing surface
-- for /my/cathedral/explore — not in K438a UI but enabled at storage layer).
CREATE POLICY ms_commons_select ON cathedral.member_scribes
    FOR SELECT USING (
        active = true
        AND share_level = 'commons'
        AND EXISTS (
            SELECT 1 FROM cathedral.member_cathedrals
            WHERE member_id = auth.uid()
        )
    );

-- Guild / Tribe placeholder — STAGED but inert. Resolves to FALSE until the
-- group-membership tables land. Documented here to make the K438b/c diff
-- a one-line predicate swap rather than a new policy creation.
CREATE POLICY ms_guild_tribe_select ON cathedral.member_scribes
    FOR SELECT USING (
        active = true
        AND share_level IN ('guild','tribe')
        AND share_target_id IS NOT NULL
        AND false  -- TODO(K438b): replace with EXISTS (... cathedral.guild_membership ...)
    );

-- ---- scribe_entries ----
-- INSERT: Scribe owner only. The materialize trigger double-checks
-- member_id matches the parent Scribe's owner.
CREATE POLICY se_own_insert ON cathedral.scribe_entries
    FOR INSERT WITH CHECK (
        member_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM cathedral.member_scribes
            WHERE scribe_id = scribe_entries.scribe_id
              AND member_id = auth.uid()
        )
    );

-- SELECT: own entries always.
CREATE POLICY se_own_select ON cathedral.scribe_entries
    FOR SELECT USING (member_id = auth.uid());

-- SELECT: commons entries from any member's commons-shared Scribe, but only
-- entries that were materialized as shared at write-time.
CREATE POLICY se_commons_select ON cathedral.scribe_entries
    FOR SELECT USING (
        shared = true
        AND shared_level = 'commons'
        AND EXISTS (
            SELECT 1 FROM cathedral.member_cathedrals
            WHERE member_id = auth.uid()
        )
    );

-- SELECT: guild/tribe entries — STAGED inert (mirrors ms_guild_tribe_select).
CREATE POLICY se_guild_tribe_select ON cathedral.scribe_entries
    FOR SELECT USING (
        shared = true
        AND shared_level IN ('guild','tribe')
        AND false  -- TODO(K438b): replace with cathedral.guild_membership lookup
    );

-- DELIBERATELY NO UPDATE OR DELETE policies → RLS denies by default.
-- Append-only is enforced by the absence of mutation policies.

-- ---- fates_log ----
CREATE POLICY fl_own_select ON cathedral.fates_log
    FOR SELECT USING (member_id = auth.uid());
CREATE POLICY fl_own_insert ON cathedral.fates_log
    FOR INSERT WITH CHECK (member_id = auth.uid());
-- NO UPDATE, NO DELETE.

-- ---- tidbits ----
CREATE POLICY tb_own_select ON cathedral.tidbits
    FOR SELECT USING (member_id = auth.uid());
CREATE POLICY tb_own_insert ON cathedral.tidbits
    FOR INSERT WITH CHECK (member_id = auth.uid());
-- NO UPDATE, NO DELETE.

-- 13. Helpful views for the UI -----------------------------------------------
-- Cathedral health card surface — Scribe count, entry count, last sync.

CREATE OR REPLACE VIEW cathedral.member_cathedral_health
WITH (security_invoker = true) AS
SELECT
    mc.member_id,
    mc.tier,
    mc.created_at AS cathedral_created_at,
    mc.last_sync_at,
    mc.export_count,
    mc.export_last_at,
    mc.professional_domain,
    COALESCE(s.scribe_count, 0)   AS scribe_count,
    COALESCE(s.active_scribe_count, 0) AS active_scribe_count,
    COALESCE(e.entry_count, 0)    AS entry_count,
    e.last_entry_at
FROM cathedral.member_cathedrals mc
LEFT JOIN (
    SELECT member_id,
           count(*)                                  AS scribe_count,
           count(*) FILTER (WHERE active)            AS active_scribe_count
    FROM cathedral.member_scribes
    GROUP BY member_id
) s ON s.member_id = mc.member_id
LEFT JOIN (
    SELECT member_id,
           count(*)               AS entry_count,
           max(ts)                AS last_entry_at
    FROM cathedral.scribe_entries
    GROUP BY member_id
) e ON e.member_id = mc.member_id;

GRANT SELECT ON cathedral.member_cathedral_health TO authenticated, service_role;

COMMENT ON VIEW cathedral.member_cathedral_health IS
    'Aggregated health card for /my/cathedral landing. security_invoker=true '
    'so the underlying member_cathedrals RLS policy filters to the caller.';

-- 14. End ---------------------------------------------------------------------
-- K438a Phase A complete.
-- Next: Phase B (UI routes) in the same session.
-- Deferred to K438b: member_consult_scribes MCP tool (Phase C),
--   member-scoped Fates session listener (Phase D),
--   ZIP export + standalone reader + import (Phase E),
--   22+ test cases (Phase F).
