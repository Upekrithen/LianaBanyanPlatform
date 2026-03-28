-- Migration: Cephas Knowledge Graph
-- Innovations #2005 (Community-Curated Resource Linking) and #2006 (Bidirectional Knowledge Graph)
-- Bishop 036

-- ============================================================
-- TABLE 1: cephas_resource_links
-- Community-submitted resources linked to Cephas articles
-- Voting thresholds drive status promotion and Marks rewards
-- ============================================================
CREATE TABLE IF NOT EXISTS cephas_resource_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_slug    TEXT NOT NULL,
    submitted_by    UUID NOT NULL REFERENCES auth.users(id),
    url             TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    resource_type   TEXT CHECK (resource_type IN (
                        'tutorial','tool','example','documentation',
                        'video','podcast','book','other'
                    )),
    upvotes         INTEGER DEFAULT 0,
    downvotes       INTEGER DEFAULT 0,
    flags           INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'pending' CHECK (status IN (
                        'pending',      -- just submitted
                        'community',    -- 3+ upvotes, visible in "Community Resources"
                        'recommended',  -- 10+ upvotes, promoted to "Recommended"
                        'featured',     -- 25+ upvotes AND 0 flags, featured with contributor credit
                        'hidden'        -- flagged/removed
                    )),
    marks_earned    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLE 2: cephas_resource_votes
-- One vote per user per resource; supports upvote, downvote, flag
-- ============================================================
CREATE TABLE IF NOT EXISTS cephas_resource_votes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id     UUID NOT NULL REFERENCES cephas_resource_links(id) ON DELETE CASCADE,
    voter_id        UUID NOT NULL REFERENCES auth.users(id),
    vote            INTEGER CHECK (vote IN (-1, 0, 1)),  -- -1 = downvote, 0 = flag, 1 = upvote
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(resource_id, voter_id)
);

-- ============================================================
-- TABLE 3: knowledge_graph_edges
-- Bidirectional links between Cephas articles, platform features,
-- production systems, and innovations
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type     TEXT NOT NULL CHECK (source_type IN (
                        'cephas_article','platform_feature',
                        'production_system','innovation'
                    )),
    source_id       TEXT NOT NULL,
    target_type     TEXT NOT NULL CHECK (target_type IN (
                        'cephas_article','platform_feature',
                        'production_system','innovation'
                    )),
    target_id       TEXT NOT NULL,
    edge_type       TEXT NOT NULL CHECK (edge_type IN (
                        'explains','references','teaches',
                        'extends','implements','related'
                    )),
    created_by      UUID REFERENCES auth.users(id),
    auto_generated  BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source_type, source_id, target_type, target_id, edge_type)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_cephas_resource_links_article_slug
    ON cephas_resource_links(article_slug);

CREATE INDEX idx_cephas_resource_links_status
    ON cephas_resource_links(status);

CREATE INDEX idx_knowledge_graph_edges_source
    ON knowledge_graph_edges(source_type, source_id);

CREATE INDEX idx_knowledge_graph_edges_target
    ON knowledge_graph_edges(target_type, target_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- cephas_resource_links
ALTER TABLE cephas_resource_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved resource links"
    ON cephas_resource_links FOR SELECT
    USING (status IN ('community', 'recommended', 'featured'));

CREATE POLICY "Authenticated users can submit resource links"
    ON cephas_resource_links FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Submitters can update own pending links"
    ON cephas_resource_links FOR UPDATE
    TO authenticated
    USING (auth.uid() = submitted_by AND status = 'pending')
    WITH CHECK (auth.uid() = submitted_by);

-- cephas_resource_votes
ALTER TABLE cephas_resource_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes"
    ON cephas_resource_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote"
    ON cephas_resource_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Voters can change own vote"
    ON cephas_resource_votes FOR UPDATE
    TO authenticated
    USING (auth.uid() = voter_id)
    WITH CHECK (auth.uid() = voter_id);

-- knowledge_graph_edges
ALTER TABLE knowledge_graph_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read graph edges"
    ON knowledge_graph_edges FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create edges"
    ON knowledge_graph_edges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- SEED: Initial knowledge graph edges
-- Connect production system features to Cephas article slugs
-- ============================================================
INSERT INTO knowledge_graph_edges (source_type, source_id, target_type, target_id, edge_type, auto_generated)
VALUES
    ('platform_feature', '/beacons',        'cephas_article', 'how-beacon-runs-work', 'explains', true),
    ('platform_feature', '/family-table',   'cephas_article', 'family-table-guide',   'explains', true),
    ('platform_feature', '/campaigns',      'cephas_article', 'business-campaigns',   'explains', true),
    ('platform_feature', '/guilds/hub',     'cephas_article', 'why-start-a-guild',    'explains', true),
    ('platform_feature', '/tribes/create',  'cephas_article', 'why-start-a-tribe',    'explains', true),
    ('platform_feature', '/design/themes',  'cephas_article', 'design-democracy',     'explains', true)
ON CONFLICT DO NOTHING;
