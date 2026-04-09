# KNIGHT SESSION: Auto-Wire Stitchpunk Corps → Staff of Librarians → Cephas

## MISSION
Connect the Stitchpunk Corps (Python backend automation) to the Staff of Librarians (DB content pipeline) so that content auto-flows from file system → database → review → Cephas publication. Bishop has built the Python side (SP-3/SP-8/SP-10). Knight builds the DB, edge functions, and UI.

## CONTEXT
- SP-10 Pipeline Bridge (Python) POSTs a JSON batch to `ingest-corps-content` edge function
- Content enters at `draft`/`seed` status — NEVER auto-published. Staff reviews first.
- SP-3 Classifier maps files to 7 Section Librarians (matching `librarian_section_map`)
- SP-8 Herald generates Fly on the Wall + Under the Hood entries per session
- The edge function pattern to follow: `supabase/functions/categorize-tour-note/index.ts`

---

## STEP 1: Migration — domain_taxonomy_bridge table

Create: `supabase/migrations/YYYYMMDD000001_corps_staff_auto_wire.sql`

```sql
-- ============================================================
-- CORPS → STAFF AUTO-WIRE: Domain Taxonomy Bridge + Schema Updates
-- Innovation: Staff of Librarians Pipeline (#2117)
-- ============================================================

-- 1. Domain taxonomy bridge — canonical mapping between SP-3, Section Librarians, MCP domains
CREATE TABLE IF NOT EXISTS domain_taxonomy_bridge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sp3_section TEXT NOT NULL,
  section_librarian INTEGER NOT NULL CHECK (section_librarian BETWEEN 1 AND 7),
  mcp_domains TEXT[] DEFAULT '{}',
  cephas_category TEXT,
  helm_content_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 10 canonical mappings
INSERT INTO domain_taxonomy_bridge (sp3_section, section_librarian, mcp_domains, cephas_category, helm_content_type, description) VALUES
  ('01_BLUEPRINTS', 4, ARRAY['helm','innovation'], 'system_design', 'cephas_article', 'Blueprints → Technology & Architecture'),
  ('02_WRITTEN', 6, ARRAY['content','outreach'], 'article', 'pudding_essay', 'Written content → Content & Articles'),
  ('03_PATENT_BAGS', 5, ARRAY['innovation','defense'], 'innovation', NULL, 'Patents → Legal & Compliance (manual review)'),
  ('04_PRESS_ARTICLES', 2, ARRAY['outreach','social_media'], 'article', 'press_material', 'Press → Letters & Outreach'),
  ('05_TECHNICAL_SPECS', 4, ARRAY['helm','manufacturing','governance'], 'system_design', 'cephas_article', 'Tech specs → Technology & Architecture'),
  ('06_CAMPAIGN_MATERIALS', 3, ARRAY['beacon','storefront','hex_isle'], 'initiative', 'media_post', 'Campaigns → Initiatives & Programs'),
  ('07_REFERENCE_MATERIALS', 6, ARRAY['content','ghost_world'], 'reference', 'cephas_article', 'Reference → Content & Articles'),
  ('08_JOURNALS', 6, ARRAY['content'], 'article', 'cephas_article', 'Journals → Content & Articles'),
  ('09_CONTEXT_MANAGEMENT', 4, ARRAY['helm'], 'system_design', NULL, 'Context → Technology & Architecture (internal)'),
  ('10_LETTERS', 2, ARRAY['outreach','political'], 'crown_letter', 'crown_letter', 'Letters → Letters & Outreach')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE domain_taxonomy_bridge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read domain_taxonomy_bridge" ON domain_taxonomy_bridge FOR SELECT USING (true);

-- 2. Add corps_source columns to existing tables

-- content_pipeline: track auto-ingested content provenance
ALTER TABLE content_pipeline
  ADD COLUMN IF NOT EXISTS corps_source JSONB,
  ADD COLUMN IF NOT EXISTS section_librarian INTEGER;

-- helm_content_queue: track auto-ingested content + flag
ALTER TABLE helm_content_queue
  ADD COLUMN IF NOT EXISTS corps_source JSONB,
  ADD COLUMN IF NOT EXISTS section_librarian INTEGER,
  ADD COLUMN IF NOT EXISTS auto_ingested BOOLEAN DEFAULT false;

-- Index for auto-ingested queries
CREATE INDEX IF NOT EXISTS idx_helm_content_queue_auto_ingested
  ON helm_content_queue (auto_ingested) WHERE auto_ingested = true;

-- 3. Expand cephas_content_registry category CHECK
-- Drop existing constraint and recreate with new values
ALTER TABLE cephas_content_registry DROP CONSTRAINT IF EXISTS cephas_content_registry_category_check;
ALTER TABLE cephas_content_registry ADD CONSTRAINT cephas_content_registry_category_check
  CHECK (category IN (
    'academic_paper', 'crown_letter', 'outreach_letter', 'open_letter',
    'system_design', 'initiative', 'innovation', 'hexisle', 'article',
    'vault_archive', 'reference', 'founder', 'pitch', 'business-plan',
    'fly_on_the_wall', 'under_the_hood'
  ));
```

**IMPORTANT:** Check the exact existing CHECK constraint name on `cephas_content_registry.category` before dropping. Use `\d cephas_content_registry` or read the migration that created it (`20260314000020`). If the constraint name differs, adjust the DROP.

---

## STEP 2: Edge Function — ingest-corps-content

Create: `supabase/functions/ingest-corps-content/index.ts`

Follow the same pattern as `categorize-tour-note/index.ts` (Deno.serve, createClient with service role, CORS headers).

```typescript
/**
 * INGEST-CORPS-CONTENT — Pipeline Bridge endpoint
 * ================================================
 * Receives batch from SP-10 Pipeline Bridge.
 * Routes entries to content_pipeline, helm_content_queue, or tour_notes_submitted.
 * ALL content enters at draft/seed — nothing auto-publishes.
 *
 * Auth: Service role key (Bearer token from SP-10 Python script)
 * Input: { entries: Array<CorpsEntry> }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CorpsEntry {
  type: string;           // fly_on_the_wall | under_the_hood | classified_content | dropzone_arrival
  slug: string;
  title: string;
  content_markdown?: string | null;
  content_type: string;   // cephas_article | crown_letter | pudding_essay | press_material | etc
  category: string;       // cephas registry category
  section_librarian?: number | null;
  session_id: string;
  agent: string;
  source_file_path?: string;
  creation_context?: string;
  bishop_session?: string | null;
  knight_session?: string | null;
  decision_log?: string[];
  technical_summary?: string;
  implementation_status?: string;
  innovation_ids?: string[];
  system_components?: string[];
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { entries } = await req.json() as { entries: CorpsEntry[] };
    if (!entries?.length) {
      return new Response(JSON.stringify({ error: 'entries array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        const corpsSource = {
          sp: 'SP-10',
          session_id: entry.session_id,
          agent: entry.agent,
          source_file: entry.source_file_path,
          bridged_at: entry.timestamp,
          entry_type: entry.type,
        };

        if (entry.type === 'fly_on_the_wall' || entry.type === 'under_the_hood') {
          // FOTW/UTH → content_pipeline (seed) + helm_content_queue (draft)

          // Upsert into content_pipeline
          const { error: pipeErr } = await supabase
            .from('content_pipeline')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              seed_content: entry.content_markdown,
              current_stage: 'seed',
              status: 'draft',
              category: entry.category,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
            }, { onConflict: 'slug' });
          if (pipeErr) errors.push(`content_pipeline/${entry.slug}: ${pipeErr.message}`);

          // Upsert into helm_content_queue
          const { error: helmErr } = await supabase
            .from('helm_content_queue')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              content_type: entry.content_type,
              content_markdown: entry.content_markdown,
              status: 'draft',
              auto_ingested: true,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
              creation_context: entry.creation_context,
              bishop_session: entry.bishop_session,
              knight_session: entry.knight_session,
              decision_log: entry.decision_log,
              technical_summary: entry.technical_summary,
              implementation_status: entry.implementation_status,
            }, { onConflict: 'slug' });
          if (helmErr) errors.push(`helm_content_queue/${entry.slug}: ${helmErr.message}`);
          else inserted++;

        } else if (entry.type === 'classified_content') {
          // Classified files → content_pipeline only (seed stage)
          const { error: pipeErr } = await supabase
            .from('content_pipeline')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              seed_content: entry.content_markdown,
              current_stage: 'seed',
              status: 'draft',
              category: entry.category,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
            }, { onConflict: 'slug' });
          if (pipeErr) errors.push(`content_pipeline/${entry.slug}: ${pipeErr.message}`);
          else inserted++;

        } else if (entry.type === 'dropzone_arrival') {
          // New dropzone files → helm_content_queue for Staff review
          const { error: helmErr } = await supabase
            .from('helm_content_queue')
            .upsert({
              slug: entry.slug,
              title: entry.title,
              content_type: entry.content_type,
              content_markdown: entry.content_markdown,
              status: 'draft',
              auto_ingested: true,
              corps_source: corpsSource,
              section_librarian: entry.section_librarian,
              creation_context: entry.creation_context,
            }, { onConflict: 'slug' });
          if (helmErr) errors.push(`helm_content_queue/${entry.slug}: ${helmErr.message}`);
          else inserted++;

        } else {
          skipped++;
        }
      } catch (entryErr) {
        errors.push(`${entry.slug}: ${entryErr.message}`);
      }
    }

    return new Response(
      JSON.stringify({ inserted, updated, skipped, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
```

**IMPORTANT BEFORE CODING:**
- Check if `content_pipeline` has a `slug` column with UNIQUE constraint. If not, add it in the migration.
- Check if `helm_content_queue` has a `slug` column with UNIQUE constraint. If not, add it in the migration.
- Both tables need `slug TEXT UNIQUE` for the upsert `onConflict: 'slug'` to work.
- If slug columns don't exist, add them:
  ```sql
  ALTER TABLE content_pipeline ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
  ALTER TABLE helm_content_queue ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
  ```

---

## STEP 3: Edge Function — publish-approved-content

Create: `supabase/functions/publish-approved-content/index.ts`

```typescript
/**
 * PUBLISH-APPROVED-CONTENT — Staff approval → Cephas publication
 * ==============================================================
 * Called when Staff clicks "Approve & Publish" on LibrarianDashboardPage.
 * Reads approved helm_content_queue row, upserts into cephas_content_registry.
 *
 * Auth: Authenticated user (must be Founder or Section Librarian)
 * Input: { helm_queue_id: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map helm content_type → cephas category
const TYPE_TO_CATEGORY: Record<string, string> = {
  cephas_article: 'article',
  pudding_essay: 'article',
  academic_paper: 'academic_paper',
  press_material: 'article',
  media_post: 'article',
  // fly_on_the_wall and under_the_hood pass through as-is from corps_source
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { helm_queue_id } = await req.json();
    if (!helm_queue_id) {
      return new Response(JSON.stringify({ error: 'helm_queue_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Read the approved queue item
    const { data: queueItem, error: fetchErr } = await supabase
      .from('helm_content_queue')
      .select('*')
      .eq('id', helm_queue_id)
      .single();

    if (fetchErr || !queueItem) {
      return new Response(JSON.stringify({ error: 'Queue item not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Letter types don't publish to Cephas — they go to send queue
    const letterTypes = ['crown_letter', 'outreach_letter', 'partnership_letter', 'political_letter'];
    if (letterTypes.includes(queueItem.content_type)) {
      await supabase
        .from('helm_content_queue')
        .update({ status: 'ready_to_send' })
        .eq('id', helm_queue_id);

      return new Response(
        JSON.stringify({ success: true, action: 'marked_ready_to_send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Determine cephas category
    const corpsSource = queueItem.corps_source || {};
    let cephasCategory = TYPE_TO_CATEGORY[queueItem.content_type] || 'article';
    // FOTW/UTH entries preserve their category from corps_source
    if (corpsSource.entry_type === 'fly_on_the_wall') cephasCategory = 'fly_on_the_wall';
    if (corpsSource.entry_type === 'under_the_hood') cephasCategory = 'under_the_hood';

    // 3. Upsert into cephas_content_registry
    const { error: cephasErr } = await supabase
      .from('cephas_content_registry')
      .upsert({
        slug: queueItem.slug,
        title: queueItem.title,
        category: cephasCategory,
        content_markdown: queueItem.content_markdown,
        source_path: corpsSource.source_file || null,
        style: 'clean_academic',
        creation_context: queueItem.creation_context,
        bishop_session: queueItem.bishop_session || corpsSource.session_id,
        knight_session: queueItem.knight_session,
        decision_log: queueItem.decision_log,
        technical_summary: queueItem.technical_summary,
        implementation_status: queueItem.implementation_status,
      }, { onConflict: 'slug' });

    if (cephasErr) throw cephasErr;

    // 4. Update queue item status to 'published'
    await supabase
      .from('helm_content_queue')
      .update({ status: 'published' })
      .eq('id', helm_queue_id);

    // 5. Sync content_pipeline if matching slug exists
    await supabase
      .from('content_pipeline')
      .update({ cephas_sync_status: 'synced' })
      .eq('slug', queueItem.slug);

    return new Response(
      JSON.stringify({ success: true, action: 'published_to_cephas', slug: queueItem.slug }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
```

---

## STEP 4: UI — LibrarianDashboardPage Enhancements

File: `platform/src/pages/LibrarianDashboardPage.tsx`

Add TWO new tabs to the existing tab structure:

### Tab: "Auto-Ingested"
- Query: `supabase.from('helm_content_queue').select('*').eq('auto_ingested', true).order('created_at', { ascending: false })`
- Display each item as a card with:
  - Title (bold)
  - `content_type` badge (use shadcn Badge component)
  - `section_librarian` badge (map number → name: 1=Economics, 2=Letters, 3=Initiatives, 4=Technology, 5=Legal, 6=Content, 7=HexIsle)
  - `status` badge (draft/in_review/approved/published)
  - `corps_source.agent` + `corps_source.session_id` metadata line
  - `corps_source.bridged_at` timestamp
- Action buttons per card:
  - **"Review"** → sets status to `in_review`
  - **"Approve & Publish"** → calls `publish-approved-content` edge function with the item's ID, then refreshes
  - **"Reject"** → sets status to `rejected`

### Tab: "Pipeline"
- Query: `supabase.from('content_pipeline').select('*').order('updated_at', { ascending: false }).limit(50)`
- Display each item showing:
  - Title
  - Stage indicator: SEED → TLDR → BLOG → ARTICLE → PAPER (highlight current)
  - `cephas_sync_status` badge (synced/pending/outdated/new)
  - `section_librarian` badge
  - `corps_source` metadata if present

---

## STEP 5: UI — FlyOnTheWallPage Enhancement

File: `platform/src/pages/FlyOnTheWallPage.tsx`

Add a "Session Updates" section at the TOP of the page (before existing content):
- Query: `supabase.from('cephas_content_registry').select('*').eq('category', 'fly_on_the_wall').order('created_at', { ascending: false })`
- Display as a vertical timeline of session progress cards
- Each card shows: session_id, agent, date, content_markdown (rendered as markdown)
- If no FOTW entries exist yet, show a placeholder: "Session updates will appear here once the auto-wire pipeline publishes its first Fly on the Wall entry."

---

## STEP 6: UI — UnderTheHoodPage Enhancement

File: `platform/src/pages/UnderTheHoodPage.tsx`

Add a "System Snapshots" section at the TOP of the page:
- Query: `supabase.from('cephas_content_registry').select('*').eq('category', 'under_the_hood').order('created_at', { ascending: false }).limit(10)`
- Display the LATEST snapshot prominently (full content rendered)
- Below: expandable list of historical snapshots (title + date, click to expand)
- If no UTH entries exist yet, show placeholder text

---

## STEP 7: Deploy

1. Apply migration: `npx supabase db push`
2. Deploy edge functions:
   ```bash
   npx supabase functions deploy ingest-corps-content --no-verify-jwt
   npx supabase functions deploy publish-approved-content --no-verify-jwt
   ```
   Note: `ingest-corps-content` uses service role key auth (not JWT) because it's called from Python. `publish-approved-content` should also use service role since it's called from the client with the function invoke pattern.
3. Deploy frontend: `firebase deploy --only hosting`

---

## VERIFICATION

After deployment:
1. Run from Bishop's stitchpunks dir: `python session_end.py BISHOP B064 "test auto-wire"`
2. Check `data/pipeline_bridge_log.json` — should show successful POST
3. Open LibrarianDashboardPage → "Auto-Ingested" tab → should see FOTW + UTH entries
4. Click "Approve & Publish" on one → should appear in cephas_content_registry
5. Open Fly on the Wall page → should see the session update
6. Open Under the Hood page → should see the system snapshot

---

## SECTION LIBRARIAN NAME MAP (for UI badges)

```typescript
const SECTION_NAMES: Record<number, string> = {
  1: 'Economics & Currency',
  2: 'Letters & Outreach',
  3: 'Initiatives & Programs',
  4: 'Technology & Architecture',
  5: 'Legal & Compliance',
  6: 'Content & Articles',
  7: 'HexIsle & Manufacturing',
};
```

---

## TABLES TOUCHED
- `domain_taxonomy_bridge` — NEW
- `content_pipeline` — ADD cols: corps_source, section_librarian
- `helm_content_queue` — ADD cols: corps_source, section_librarian, auto_ingested
- `cephas_content_registry` — EXPAND category CHECK

## EDGE FUNCTIONS CREATED
- `ingest-corps-content` — SP-10 → DB bridge
- `publish-approved-content` — Staff approval → Cephas publish

## PAGES MODIFIED
- `LibrarianDashboardPage.tsx` — Auto-Ingested + Pipeline tabs
- `FlyOnTheWallPage.tsx` — Session Updates section
- `UnderTheHoodPage.tsx` — System Snapshots section
