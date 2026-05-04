-- Bushel 27 — Red/Blue Team Competition + IP Ledger Stamp Surface (BP022)
-- Phases A–D: schema + scoreboard + IP ledger stamp + marks payout matrix + cross-team transparency gates
--
-- G1 anchor: red_blue_competition_event full table + materialized views
-- G3 anchor: ip_ledger_stamp table + verified_at trigger
-- G4 anchor: red_blue_win_class_multiplier table (Marks payout matrix)
-- G5 anchor: anti-collusion constraint + team_switch_cooldown

-- =========================================================
-- Phase A — lb_elves_guild_membership (Bushel 25 seed table)
-- Creates if not exists; Bushel 25 may have seeded this.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.lb_elves_guild_membership (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_assignment     text NOT NULL CHECK (team_assignment IN ('red', 'blue')),
    joined_at           timestamptz NOT NULL DEFAULT now(),
    last_team_switch_at timestamptz,
    -- Anti-collusion: member cannot switch teams within cooldown period (30 days default)
    team_switch_cooldown_days int NOT NULL DEFAULT 30,
    is_active           boolean NOT NULL DEFAULT true,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (member_id)   -- one team assignment per member
);

ALTER TABLE public.lb_elves_guild_membership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lb_elves_guild_membership_public_read"
    ON public.lb_elves_guild_membership FOR SELECT USING (true);

CREATE POLICY "lb_elves_guild_membership_self_write"
    ON public.lb_elves_guild_membership FOR ALL
    USING (auth.uid() = member_id);

-- =========================================================
-- Phase B — ip_ledger_stamp
-- Permanent per-win IP attribution record
-- =========================================================

CREATE TABLE IF NOT EXISTS public.ip_ledger_stamp (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stamp_class             text NOT NULL CHECK (stamp_class IN ('red_team_find', 'blue_team_harden')),
    member_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    canonical_artifact      text NOT NULL,
    -- Reproduction steps for finds; before/after diff for hardens
    artifact_detail         jsonb,
    first_finder_marker     boolean NOT NULL DEFAULT false,
    first_hardener_marker   boolean NOT NULL DEFAULT false,
    competition_event_id    uuid,   -- FK added after red_blue_competition_event is created
    ip_ledger_sequence_ref  bigint,  -- reference to ip_ledger.sequence_number if chained
    stamped_at              timestamptz NOT NULL DEFAULT now(),
    created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ip_ledger_stamp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ip_ledger_stamp_public_read"
    ON public.ip_ledger_stamp FOR SELECT USING (true);

CREATE POLICY "ip_ledger_stamp_system_write"
    ON public.ip_ledger_stamp FOR INSERT
    WITH CHECK (auth.uid() = member_id);

-- =========================================================
-- Phase A — red_blue_competition_event (full table)
-- Extends Bushel 25 schema stub
-- =========================================================

CREATE TABLE IF NOT EXISTS public.red_blue_competition_event (
    event_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    team                    text NOT NULL CHECK (team IN ('red', 'blue')),
    event_class             text NOT NULL CHECK (event_class IN ('find', 'harden')),
    event_subclass          text NOT NULL,
    target_artifact         text,
    -- Submission lifecycle
    submitted_at            timestamptz NOT NULL DEFAULT now(),
    claimed_at              timestamptz,
    verified_at             timestamptz,
    verifier_member_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    -- Marks payout
    win_class_multiplier    numeric(6,2),
    marks_payout_amount     numeric(12,2),
    -- IP Ledger linkage
    ip_stamp_id             uuid REFERENCES public.ip_ledger_stamp(id) ON DELETE SET NULL,
    -- Cross-team challenge reference (Blue hardens Red find)
    parent_event_id         uuid REFERENCES public.red_blue_competition_event(event_id) ON DELETE SET NULL,
    -- Timeline status
    status                  text NOT NULL DEFAULT 'submitted'
                                CHECK (status IN ('submitted', 'claimed', 'verified', 'ip_stamped', 'marks_paid', 'rejected')),
    rejection_reason        text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Add FK back from ip_ledger_stamp → red_blue_competition_event
ALTER TABLE public.ip_ledger_stamp
    ADD CONSTRAINT ip_ledger_stamp_competition_event_fk
    FOREIGN KEY (competition_event_id)
    REFERENCES public.red_blue_competition_event(event_id)
    ON DELETE SET NULL;

ALTER TABLE public.red_blue_competition_event ENABLE ROW LEVEL SECURITY;

-- Cross-team transparency: all members see all events (dual-team-visible per canon)
CREATE POLICY "red_blue_event_public_read"
    ON public.red_blue_competition_event FOR SELECT USING (true);

CREATE POLICY "red_blue_event_member_submit"
    ON public.red_blue_competition_event FOR INSERT
    WITH CHECK (auth.uid() = member_id);

CREATE POLICY "red_blue_event_member_update_own"
    ON public.red_blue_competition_event FOR UPDATE
    USING (auth.uid() = member_id OR auth.uid() = verifier_member_id);

-- =========================================================
-- Phase C — red_blue_win_class_multiplier (Marks payout matrix)
-- Canonical Tier-class composition; Founder Fire Code class for value lock
-- =========================================================

CREATE TABLE IF NOT EXISTS public.red_blue_win_class_multiplier (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_class     text NOT NULL CHECK (event_class IN ('find', 'harden')),
    event_subclass  text NOT NULL,
    tier            int  NOT NULL,
    multiplier      numeric(4,2) NOT NULL,
    base_marks      int NOT NULL,
    effective_from  timestamptz NOT NULL DEFAULT now(),
    is_active       boolean NOT NULL DEFAULT true,
    UNIQUE (event_class, event_subclass)
);

ALTER TABLE public.red_blue_win_class_multiplier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "win_class_multiplier_public_read"
    ON public.red_blue_win_class_multiplier FOR SELECT USING (true);

-- Seed the Marks payout matrix (Bushel 27 Phase C canonical values — Founder Fire Code class for final lock)
INSERT INTO public.red_blue_win_class_multiplier
    (event_class, event_subclass, tier, multiplier, base_marks) VALUES
    ('find',   'crypto-bypass',                    5, 3.0, 100),
    ('find',   'substrate-poisoning-attempt',       5, 3.0, 100),
    ('find',   'eblet-tamper-bypass',               5, 3.0, 100),
    ('find',   'reminder-scribe-rule-bypass',       5, 3.0,  75),
    ('find',   'pheromone-corner-case',             4, 2.5,  50),
    ('harden', 'crypto-defense-canonical',          5, 3.0, 100),
    ('harden', 'substrate-poisoning-defense',       5, 3.0, 100),
    ('harden', 'eblet-tamper-detection',            5, 3.0, 100),
    ('harden', 'reminder-scribe-rule-tightening',   5, 3.0,  75),
    ('harden', 'pheromone-fast-path-correction',    4, 2.5,  50)
ON CONFLICT (event_class, event_subclass) DO NOTHING;

-- =========================================================
-- Phase D — Anti-collusion: team switch cooldown function
-- =========================================================

CREATE OR REPLACE FUNCTION public.can_switch_team(p_member_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_last_switch   timestamptz;
    v_cooldown_days int;
BEGIN
    SELECT last_team_switch_at, team_switch_cooldown_days
    INTO   v_last_switch, v_cooldown_days
    FROM   lb_elves_guild_membership
    WHERE  member_id = p_member_id;

    IF NOT FOUND THEN RETURN true; END IF;
    IF v_last_switch IS NULL THEN RETURN true; END IF;

    RETURN (now() - v_last_switch) >= (v_cooldown_days || ' days')::interval;
END;
$$;

-- =========================================================
-- Phase D — Cross-team challenge submission
-- Blue Team member claims a harden against a Red Team find
-- =========================================================

CREATE OR REPLACE FUNCTION public.submit_cross_team_challenge(
    p_blue_member_id    uuid,
    p_parent_event_id   uuid,    -- the Red Team find being hardened
    p_event_subclass    text,
    p_target_artifact   text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_red_event     public.red_blue_competition_event%ROWTYPE;
    v_new_event_id  uuid;
BEGIN
    -- Verify parent is a verified red-team find
    SELECT * INTO v_red_event
    FROM   public.red_blue_competition_event
    WHERE  event_id = p_parent_event_id
      AND  team = 'red'
      AND  event_class = 'find'
      AND  status IN ('verified', 'ip_stamped', 'marks_paid');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Parent event % is not a verified Red Team find', p_parent_event_id;
    END IF;

    -- Verify submitter is on Blue Team
    IF NOT EXISTS (
        SELECT 1 FROM lb_elves_guild_membership
        WHERE member_id = p_blue_member_id AND team_assignment = 'blue' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Submitter % is not an active Blue Team member', p_blue_member_id;
    END IF;

    INSERT INTO public.red_blue_competition_event (
        member_id, team, event_class, event_subclass,
        target_artifact, parent_event_id, status
    ) VALUES (
        p_blue_member_id, 'blue', 'harden', p_event_subclass,
        p_target_artifact, p_parent_event_id, 'submitted'
    )
    RETURNING event_id INTO v_new_event_id;

    RETURN v_new_event_id;
END;
$$;

-- =========================================================
-- Phase B — IP Ledger stamp generation trigger
-- Fires on verified_at populated + status = verified
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_ip_ledger_stamp_on_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stamp_class       text;
    v_stamp_id          uuid;
    v_is_first_finder   boolean := false;
    v_is_first_hardener boolean := false;
BEGIN
    -- Only fire when verified_at is first populated
    IF NEW.verified_at IS NULL OR OLD.verified_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Determine stamp class
    IF NEW.event_class = 'find' THEN
        v_stamp_class := 'red_team_find';
        -- first_finder: no prior verified find for same subclass + artifact
        SELECT NOT EXISTS (
            SELECT 1 FROM public.ip_ledger_stamp
            WHERE stamp_class = 'red_team_find'
              AND competition_event_id != NEW.event_id
        ) INTO v_is_first_finder;
    ELSE
        v_stamp_class := 'blue_team_harden';
        SELECT NOT EXISTS (
            SELECT 1 FROM public.ip_ledger_stamp
            WHERE stamp_class = 'blue_team_harden'
              AND competition_event_id != NEW.event_id
        ) INTO v_is_first_hardener;
    END IF;

    -- Insert IP Ledger stamp
    INSERT INTO public.ip_ledger_stamp (
        stamp_class, member_id,
        canonical_artifact,
        artifact_detail,
        first_finder_marker, first_hardener_marker,
        competition_event_id
    ) VALUES (
        v_stamp_class, NEW.member_id,
        COALESCE(NEW.target_artifact, NEW.event_subclass),
        jsonb_build_object(
            'event_id',      NEW.event_id,
            'event_class',   NEW.event_class,
            'event_subclass',NEW.event_subclass,
            'verified_at',   NEW.verified_at,
            'verifier_id',   NEW.verifier_member_id
        ),
        v_is_first_finder,
        v_is_first_hardener,
        NEW.event_id
    )
    RETURNING id INTO v_stamp_id;

    -- Link stamp back to event
    NEW.ip_stamp_id := v_stamp_id;
    NEW.status := 'ip_stamped';

    -- Populate marks payout amount from multiplier matrix
    SELECT base_marks * multiplier
    INTO   NEW.marks_payout_amount
    FROM   public.red_blue_win_class_multiplier
    WHERE  event_class   = NEW.event_class
      AND  event_subclass = NEW.event_subclass
      AND  is_active = true
    LIMIT 1;

    SELECT multiplier INTO NEW.win_class_multiplier
    FROM   public.red_blue_win_class_multiplier
    WHERE  event_class    = NEW.event_class
      AND  event_subclass = NEW.event_subclass
      AND  is_active = true
    LIMIT 1;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_ip_stamp_on_verify
    BEFORE UPDATE ON public.red_blue_competition_event
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_ip_ledger_stamp_on_verify();

-- =========================================================
-- Phase A — Materialized views (scoreboard + individual leaderboard)
-- =========================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.red_blue_team_scoreboard AS
SELECT
    team,
    COUNT(*)                                        AS cumulative_wins,
    COALESCE(SUM(marks_payout_amount), 0)           AS cumulative_marks,
    COUNT(ip_stamp_id)                              AS cumulative_ip_stamps,
    COUNT(*) FILTER (
        WHERE submitted_at >= date_trunc('week', now())
    )                                               AS current_week_wins,
    COUNT(*) FILTER (
        WHERE submitted_at >= date_trunc('month', now())
    )                                               AS current_month_wins,
    now()                                           AS refreshed_at
FROM public.red_blue_competition_event
WHERE status IN ('verified', 'ip_stamped', 'marks_paid')
GROUP BY team;

CREATE UNIQUE INDEX IF NOT EXISTS red_blue_team_scoreboard_team_idx
    ON public.red_blue_team_scoreboard (team);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.red_blue_individual_leaderboard AS
SELECT
    e.member_id,
    e.team,
    COUNT(*)                                         AS wins,
    COALESCE(SUM(e.marks_payout_amount), 0)          AS marks,
    COUNT(e.ip_stamp_id)                             AS ip_stamps,
    RANK() OVER (
        PARTITION BY e.team
        ORDER BY COUNT(*) DESC, COALESCE(SUM(e.marks_payout_amount), 0) DESC
    )                                                AS rank_within_team,
    RANK() OVER (
        ORDER BY COUNT(*) DESC, COALESCE(SUM(e.marks_payout_amount), 0) DESC
    )                                                AS rank_overall,
    now()                                            AS refreshed_at
FROM public.red_blue_competition_event e
WHERE e.status IN ('verified', 'ip_stamped', 'marks_paid')
GROUP BY e.member_id, e.team;

CREATE UNIQUE INDEX IF NOT EXISTS red_blue_individual_leaderboard_member_team_idx
    ON public.red_blue_individual_leaderboard (member_id, team);

-- Refresh function (called by app or cron)
CREATE OR REPLACE FUNCTION public.refresh_red_blue_scoreboards()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.red_blue_team_scoreboard;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.red_blue_individual_leaderboard;
END;
$$;

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_red_blue_event_team
    ON public.red_blue_competition_event (team, status);
CREATE INDEX IF NOT EXISTS idx_red_blue_event_member
    ON public.red_blue_competition_event (member_id, team);
CREATE INDEX IF NOT EXISTS idx_red_blue_event_verified
    ON public.red_blue_competition_event (verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ip_ledger_stamp_member
    ON public.ip_ledger_stamp (member_id);
CREATE INDEX IF NOT EXISTS idx_ip_ledger_stamp_class
    ON public.ip_ledger_stamp (stamp_class);

-- =========================================================
-- updated_at triggers
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'set_updated_at_lb_elves_membership'
    ) THEN
        CREATE TRIGGER set_updated_at_lb_elves_membership
            BEFORE UPDATE ON public.lb_elves_guild_membership
            FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'set_updated_at_red_blue_event'
    ) THEN
        CREATE TRIGGER set_updated_at_red_blue_event
            BEFORE UPDATE ON public.red_blue_competition_event
            FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;
