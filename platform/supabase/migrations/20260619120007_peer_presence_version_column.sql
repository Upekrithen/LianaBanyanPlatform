-- BP087 MAMBA-zeta fleet-readiness gate 1: peer_presence.version column
-- Tracks installed MnemosyneC version per peer so gates_check.mjs can verify fleet homogeneity before THUNDERCLAP Trial 02 fire.
-- Authored: SEG-T BP087 close-out.
--
ALTER TABLE public.peer_presence
  ADD COLUMN IF NOT EXISTS version text;
CREATE INDEX IF NOT EXISTS idx_peer_presence_version ON public.peer_presence(version) WHERE version IS NOT NULL;
