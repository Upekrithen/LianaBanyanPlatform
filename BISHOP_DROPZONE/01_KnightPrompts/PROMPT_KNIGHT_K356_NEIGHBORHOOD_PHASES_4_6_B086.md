# Knight Session K356 — Neighborhood System Phases 4-6
# Bishop B086 | Priority: HIGH | Depends on: K353 (Phase 1-3 DEPLOYED)

## CONTEXT
K353 deployed the Neighborhood System Phase 1-3: neighborhoods table, neighborhood_members junction, neighborhood_reviews, NeighborhoodBrowsePage, NeighborhoodDetailPage, NeighborhoodBuilderPage, sidebar integration. San Antonio Makers Row demo seeded.

This session completes Phases 4-6: Trunk Mirror, Harper Auto-Suspension, and City Aggregation.

## PHASE 4: TRUNK MIRROR
The Neighborhood's storefront data should mirror the compiled_documents trunk system so content flows both ways.

### Tasks
1. **neighborhood_content_links table** — bridge between neighborhoods and compiled_documents
   ```sql
   CREATE TABLE neighborhood_content_links (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
     document_id UUID REFERENCES compiled_documents(id) ON DELETE CASCADE,
     link_type TEXT CHECK (link_type IN ('featured', 'pinned', 'community', 'auto')),
     position INTEGER DEFAULT 0,
     added_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE(neighborhood_id, document_id)
   );
   ```
2. **NeighborhoodContentPanel** component — shows linked trunk content on the detail page
3. **Auto-link logic** — when a storefront is in a neighborhood, its compiled_documents auto-link with type='auto'

## PHASE 5: HARPER AUTO-SUSPENSION
Harper Guild reputation governs neighborhood health. When a neighborhood's harper_score drops below threshold, it gets auto-suspended.

### Tasks
1. **check-neighborhood-health** Edge Function (cron, daily)
   - Query all active neighborhoods
   - For each: compute aggregate harper_score from neighborhood_members' profiles
   - If aggregate < 2.0: set status='suspended', log to neighborhood_reviews
   - If suspended and aggregate >= 3.0: set status='active' (auto-reinstate)
   - Log all actions to cron_job_log
2. **NeighborhoodHealthBadge** component — shows green/yellow/red based on harper_score
3. **Suspension notice** on NeighborhoodDetailPage when status='suspended'
4. **pg_cron schedule** — `SELECT cron.schedule('neighborhood-health-check', '0 6 * * *', ...)`

## PHASE 6: CITY AGGREGATION
Browse neighborhoods grouped by city. Aggregate stats across a city's neighborhoods.

### Tasks
1. **CityAggregationPage** (`/neighborhoods/city/:citySlug`)
   - List all neighborhoods in that city
   - Aggregate: total storefronts, total visitors, average rating, active vs suspended count
   - Map view placeholder (static image or simple grid)
2. **city_neighborhood_stats** view (materialized or simple)
   ```sql
   CREATE VIEW city_neighborhood_stats AS
   SELECT city, state,
     COUNT(*) as neighborhood_count,
     SUM(storefront_count) as total_storefronts,
     SUM(visitor_count) as total_visitors,
     AVG(rating_avg) as avg_rating,
     COUNT(*) FILTER (WHERE status = 'active') as active_count
   FROM neighborhoods
   GROUP BY city, state;
   ```
3. **CityBrowsePage** (`/neighborhoods/cities`) — list all cities with neighborhoods
4. **Route updates** — add `/neighborhoods/city/:citySlug` and `/neighborhoods/cities` to routes

## FILES TO CREATE/MODIFY
- `platform/supabase/migrations/YYYYMMDDHHMMSS_k356_neighborhood_phases_4_6.sql`
- `platform/supabase/functions/check-neighborhood-health/index.ts`
- `platform/src/pages/v2/neighborhoods/CityBrowsePage.tsx`
- `platform/src/pages/v2/neighborhoods/CityAggregationPage.tsx`
- `platform/src/components/neighborhoods/NeighborhoodContentPanel.tsx`
- `platform/src/components/neighborhoods/NeighborhoodHealthBadge.tsx`
- Modify `platform/src/pages/v2/neighborhoods/NeighborhoodDetailPage.tsx` — add health badge + content panel + suspension notice
- Modify routes file — add city routes

## CONSTRAINTS
- Cost+20% floor is IMMUTABLE — do not allow neighborhoods to override
- Harper score aggregation: average of all neighborhood_members' harper_score from profiles
- RLS: neighborhood owners can manage content links; public reads active only
- Follow existing V2 FocusShell pattern for new pages

## DONE WHEN
- [ ] Trunk content links table + auto-link logic works
- [ ] Health check Edge Function runs and suspends/reinstates correctly
- [ ] City aggregation pages render with real data
- [ ] San Antonio Makers Row demo shows content + health badge
- [ ] All routes accessible from sidebar under Community section
