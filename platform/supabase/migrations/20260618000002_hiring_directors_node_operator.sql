-- Hiring Directors + Node Operators · BP085 · Founder-approved Option A
-- Deferred to v2: (1) hired-user project_count eligibility, (2) node_operator_since timestamp, (3) ouster_pending state

CREATE TABLE IF NOT EXISTS public.hiring_directors (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    project_count        INTEGER     NOT NULL DEFAULT 0,
    hired_user_count     INTEGER     NOT NULL DEFAULT 0,
    node_operator_status BOOLEAN     NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_updated         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hiring_directors_user_id ON public.hiring_directors(user_id);
CREATE INDEX IF NOT EXISTS idx_hiring_directors_node_op ON public.hiring_directors(node_operator_status);

-- Eligibility view: node_operators = hiring directors with project_count >= 1 AND hired_user_count >= 1
CREATE VIEW public.node_operators AS
    SELECT * FROM public.hiring_directors WHERE node_operator_status = true;

-- RLS: members read their own row; admins read all
ALTER TABLE public.hiring_directors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hiring_directors_read_own" ON public.hiring_directors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "hiring_directors_insert_own" ON public.hiring_directors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "hiring_directors_update_own" ON public.hiring_directors
    FOR UPDATE USING (auth.uid() = user_id);

-- Auto-update last_updated on row change
CREATE OR REPLACE FUNCTION public.hiring_directors_set_last_updated()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.last_updated = now();
    -- Auto-promote to node_operator when eligibility met
    IF NEW.project_count >= 1 AND NEW.hired_user_count >= 1 THEN
        NEW.node_operator_status = true;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER hiring_directors_last_updated_trigger
    BEFORE UPDATE ON public.hiring_directors
    FOR EACH ROW EXECUTE FUNCTION public.hiring_directors_set_last_updated();
