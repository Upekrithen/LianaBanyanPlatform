# KNIGHT SESSION 137 — Cephas Bidirectional Knowledge Graph
## Community-Curated Resource Linking + Feature↔Knowledge Navigation
**Innovations:** #2005, #2006 | **Bishop:** 035 | **Date:** March 27, 2026

---

## CONTEXT
Migration `20260327000008_cephas_knowledge_graph.sql` is ALREADY PUSHED to remote Supabase. Three tables exist:
- `cephas_resource_links` — community-submitted resources with voting thresholds
- `cephas_resource_votes` — upvote/downvote/flag per user per resource
- `knowledge_graph_edges` — bidirectional links between cephas articles and platform features

6 seed edges already exist connecting features to article slugs.

## DELIVERABLES

### Deliverable 1: Hooks
Create `platform/src/hooks/useCephasKnowledge.ts`:
- useResourceLinks(articleSlug) — resources for a specific article, ordered by status then votes
- useSubmitResource() — submit a new resource link (url, title, description, type)
- useResourceVote() — cast upvote/downvote/flag on a resource
- useKnowledgeEdges(sourceType, sourceId) — get all edges FROM a node
- useReverseEdges(targetType, targetId) — get all edges TO a node (bidirectional lookup)
- useCreateEdge() — create a new knowledge graph edge (admin/contributor)

### Deliverable 2: ResourceLinksPanel Component
Create `platform/src/components/cephas/ResourceLinksPanel.tsx`:
- Renders below article content on Cephas pages
- Shows resources grouped by status: Featured (25+ upvotes, 0 flags) → Recommended (10+) → Community (3+)
- Each resource shows: title, URL, type badge, vote count, contributor name
- Submit button opens inline form for adding a new resource
- Vote buttons (upvote/downvote/flag) on each resource
- Contributors earn Marks for resources reaching each threshold (display "🎖️ Marks earned" badge)

### Deliverable 3: KnowledgeGraphSidebar Component
Create `platform/src/components/cephas/KnowledgeGraphSidebar.tsx`:
- Renders in sidebar or below content on BOTH Cephas articles AND platform feature pages
- On a Cephas article: shows "Try It Now" buttons linking to live platform features
- On a platform feature page: shows "Learn More" links to relevant Cephas articles
- Edge types rendered differently: explains (📖), references (🔗), teaches (🎓), extends (🔀), implements (⚙️), documents (📄)
- Collapsible sections by edge type

### Deliverable 4: CephasArticlePage Enhancement
Find the existing Cephas article display component/page and add:
- ResourceLinksPanel below article content
- KnowledgeGraphSidebar in sidebar or below ResourceLinksPanel
- "Contribute a resource" CTA for authenticated users

### Deliverable 5: Feature Page "Learn More" Integration
Add a reusable `<KnowledgeGraphBadge />` component that can be dropped into ANY feature page:
- Small "📖 Learn how this works" link that expands to show connected Cephas articles
- Uses useReverseEdges('platform_feature', featureId) to find relevant articles
- Add to at least 3 existing feature pages as examples (Beacon Run, Family Table, Cold Start Hub)

### Deliverable 6: Knowledge Graph Admin
Create `platform/src/pages/KnowledgeGraphAdmin.tsx` at `/admin/knowledge-graph`:
- Protected route (admin only)
- List all edges with source/target info
- Create new edges (dropdowns for type, text inputs for IDs)
- Delete edges
- View resource moderation queue (flagged resources)

### Deliverable 7: Routes + Stats
- `/admin/knowledge-graph` — ProtectedRoute → KnowledgeGraphAdmin
- Update useCanonicalStats if needed

## RULES
- Credits NEVER cash out. One-way valve.
- No securities language.
- Resource links must be validated URLs (basic check).
- Flag threshold: 3 flags → auto-hide resource pending moderation.
- Marks earned for resources: 1 Mark at Community (3 votes), 3 Marks at Recommended (10), 5 Marks at Featured (25).

## BUILD ORDER
1. Hooks → 2. ResourceLinksPanel → 3. KnowledgeGraphSidebar → 4. KnowledgeGraphBadge → 5. Article enhancement → 6. Feature page integration → 7. Admin → 8. Routes → Build → Deploy

FOR THE KEEP!
