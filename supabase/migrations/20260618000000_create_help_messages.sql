-- help_messages: peer-to-peer copy/paste pipeline
-- BP085 Help Tab — Founder↔Son shared message thread
-- MnemosyneC v0.5.1 · 2026-06-18

CREATE TABLE IF NOT EXISTS public.help_messages (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    from_peer         TEXT        NOT NULL,            -- peer UUID from getStablePeerId()
    to_peer           TEXT,                            -- NULL = broadcast to all connected peers
    content_text      TEXT        NOT NULL DEFAULT '',  -- may be empty if image-only message
    content_image_url TEXT,                            -- NULL if text-only message
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast thread query by peer pair
CREATE INDEX IF NOT EXISTS idx_help_messages_from_peer ON public.help_messages (from_peer, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_messages_to_peer   ON public.help_messages (to_peer,   created_at DESC);

-- Row-level security: peers can only read messages addressed to them or broadcast
ALTER TABLE public.help_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_messages" ON public.help_messages
    FOR SELECT USING (
        from_peer = current_setting('app.current_peer', true)
        OR to_peer  = current_setting('app.current_peer', true)
        OR to_peer  IS NULL
    );

CREATE POLICY "insert_own_messages" ON public.help_messages
    FOR INSERT WITH CHECK (
        from_peer = current_setting('app.current_peer', true)
    );
