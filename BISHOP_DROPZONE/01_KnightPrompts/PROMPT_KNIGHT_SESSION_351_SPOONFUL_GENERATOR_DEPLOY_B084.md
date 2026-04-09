# K351: Deploy Spoonful Generator — Pudding → Social Media Posts
# Priority: CRITICAL — enables automated content distribution from puddings
# Bishop: B084 | Date: 2026-04-07

## THE PROBLEM

187 puddings exist. The Battery Dispatch framework is active (hourly cron). But there's no automated pipeline turning puddings into social media posts. The Spoonfuls channel is defined in the dispatch config but no generator function is deployed.

SP-13 exists as a Python script (`librarian-mcp/stitchpunks/sp13_archive_spoonful_generator.py`) that generated 49 episodes from archive documents. But it needs to also handle puddings, and it needs to be deployable as a Supabase edge function for automatic scheduling.

## OBJECTIVE

Deploy an edge function that:
1. Reads puddings from `cephas_puddings`
2. Extracts 5-8 compelling passages per pudding (~280 chars each)
3. Formats them as Spoonfuls with links back to Cephas
4. Inserts into `crewman_episodes` for dispatch
5. Runs on schedule via cron

## PHASE 1: Edge Function — generate-spoonfuls

Create `platform/supabase/functions/generate-spoonfuls/index.ts`:

```typescript
// Reads cephas_puddings WHERE status IN ('draft', 'canonical')
// For each pudding not yet processed:
//   1. Split pudding_text into paragraphs
//   2. Score paragraphs by: length (prefer 200-300 chars), position (prefer opening),
//      keyword density (Credits, Marks, Joules, cooperative, member)
//   3. Extract top 5-8 passages
//   4. Format each as:
//      "[passage]... — from [title] | Read more: lianabanyan.com/cephas/pudding/[slug]"
//   5. Insert into crewman_episodes with:
//      - chapter_id: the active spoonfuls chapter
//      - sequence_number: auto-increment
//      - content: formatted spoonful text
//      - platform_variants: { twitter: truncated, linkedin: full, bluesky: full }
//      - status: 'queued'
//   6. Mark pudding as processed (add to content_pipeline with source_type='spoonful')

// Limit: process max 10 puddings per invocation to stay within edge function timeout
```

## PHASE 2: Cron Job

Add to pg_cron (migration):
```sql
-- Generate spoonfuls daily at 3 AM
SELECT cron.schedule(
  'generate-spoonfuls-daily',
  '0 3 * * *',
  $$SELECT net.http_post(
    url := 'https://bqlspngmrhcurqfnwupo.supabase.co/functions/v1/generate-spoonfuls',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  )$$
);
```

## PHASE 3: Chapter Staging

Create a "Spoonfuls" chapter in `crewman_chapters`:
```sql
INSERT INTO crewman_chapters (title, description, status, channel)
VALUES ('Pudding Spoonfuls — Automated',
        'Auto-generated micro-posts from 187 pudding articles',
        'streaming',
        'spoonfuls')
ON CONFLICT DO NOTHING;
```

This chapter starts in 'streaming' status so the hourly dispatch cron picks up its episodes immediately.

## PHASE 4: Platform Variant Formatting

Each spoonful gets platform-specific variants:
- **Twitter/X**: Max 280 chars, include link, hashtags (#LianaBanyan #Cooperative)
- **LinkedIn**: Full passage + professional framing + link
- **Bluesky**: Full passage + link
- **Threads**: Full passage + link
- **Facebook**: Full passage + link + question prompt ("What do you think?")

## PHASE 5: Content Pipeline Tracking

For each pudding processed, insert into `content_pipeline`:
```sql
INSERT INTO content_pipeline (source_type, source_table, source_id, title, content_preview, status, distribution_channels)
VALUES ('spoonful', 'cephas_puddings', pudding_id, pudding_title, LEFT(pudding_text, 280), 'distributed', ARRAY['social'])
```

## VALIDATION

1. Run the edge function manually: `supabase functions invoke generate-spoonfuls`
2. Check `crewman_episodes` for new queued episodes
3. Verify the hourly dispatch cron picks them up
4. Verify platform variants are correctly formatted
5. Check `content_pipeline` for spoonful entries

## EXPECTED OUTPUT

187 puddings × 5-8 spoonfuls each = **935-1,496 distributable micro-posts**
At 24 posts/day across channels, that's **39-62 days** of unique pudding content before any repeats.

## REFERENCE

- SP-13 script: `librarian-mcp/stitchpunks/sp13_archive_spoonful_generator.py`
- Dispatch executor: `platform/supabase/functions/dispatch-executor/index.ts`
- Crewman dispatch: `platform/supabase/functions/dispatch-crewman-episode/index.ts`
- Battery config: `battery_dispatch_platform_config` table
- Cron jobs: `crewman-dispatch-hourly` (active), `crewman-engagement-quarter-hour` (active)
- Puddings: `cephas_puddings` table (187 entries)
