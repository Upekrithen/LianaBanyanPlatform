-- BP039: LOC Ingest Service Schema
-- Daily ingestion of Library of Congress legislative data

-- Manifest table: one record per daily ingest run
CREATE TABLE IF NOT EXISTS public.loc_ingest_manifests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_date date NOT NULL UNIQUE,
    manifest_sha256 text NOT NULL,
    total_polled integer NOT NULL,
    new_items integer NOT NULL,
    amendments integer NOT NULL,
    novacula_batches jsonb NOT NULL,
    generated_at timestamptz DEFAULT now()
);

-- Individual ingest items: bills, regulations, etc.
CREATE TABLE IF NOT EXISTS public.loc_ingest_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id uuid NOT NULL REFERENCES public.loc_ingest_manifests(id) ON DELETE CASCADE,
    source_feed text NOT NULL,
    canonical_identifier text NOT NULL,
    content_hash text NOT NULL,
    ingest_status text NOT NULL CHECK (ingest_status IN ('new', 'amendment', 'deduped')),
    topic_class text,
    composing_hints text[],
    bounty_poster_slug text,
    council_vetting_status text DEFAULT 'pending',
    UNIQUE(source_feed, canonical_identifier, content_hash)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_loc_ingest_items_manifest_id
    ON public.loc_ingest_items(manifest_id);

CREATE INDEX IF NOT EXISTS idx_loc_ingest_items_ingest_status
    ON public.loc_ingest_items(ingest_status);

CREATE INDEX IF NOT EXISTS idx_loc_ingest_items_topic_class
    ON public.loc_ingest_items(topic_class);

CREATE INDEX IF NOT EXISTS idx_loc_ingest_manifests_date
    ON public.loc_ingest_manifests(manifest_date DESC);

-- Comments
COMMENT ON TABLE public.loc_ingest_manifests IS 'Daily manifest of LOC legislative data ingestion runs';
COMMENT ON TABLE public.loc_ingest_items IS 'Individual legislative items from LOC feeds';
COMMENT ON COLUMN public.loc_ingest_items.ingest_status IS 'new: first appearance, amendment: updated content, deduped: duplicate item';
COMMENT ON COLUMN public.loc_ingest_items.council_vetting_status IS 'Council review status: pending, approved, rejected';
