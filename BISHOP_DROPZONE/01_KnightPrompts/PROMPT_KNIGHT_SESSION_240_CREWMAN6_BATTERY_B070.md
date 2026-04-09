# KNIGHT SESSION 240 — CREWMAN #6 BATTERY INTEGRATION
## Dispatched by: Bishop B070
## Date: April 3, 2026
## Priority: HIGH — Build the automated serial publishing pipeline

---

## MISSION

Extend the Battery Dispatch system to support the Crewman #6 serialized content distribution: hourly automated posting from an episode queue, threading, engagement tracking, and vote-gate threshold checking.

---

## CONTEXT

Innovation #2133 (Crewman #6) defines a new content distribution model:
- Episodes (~280 chars each) post automatically every hour via Battery Dispatch
- Episodes are threaded (each replies to the previous)
- Engagement is tracked per episode and per chapter
- When a chapter's cumulative engagement crosses a defined threshold, the corresponding full paper/chapter publishes on Cephas
- When a chapter publishes, the next chapter's excerpt stream begins automatically

See: `BISHOP_DROPZONE/AA_FORMAL_2133_CREWMAN_6_SERIAL_PUBLISHING_B070.md`

---

## DELIVERABLES

### 1. Database Migration: `crewman_episodes` table

```sql
CREATE TABLE crewman_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES crewman_chapters(id),
  sequence_number integer NOT NULL,
  content text NOT NULL,          -- episode text (~280 chars)
  source_reference text,          -- e.g., "PAPER_STARSCREAMING:section_2:para_3"
  tags text[],                    -- hashtags
  platform text NOT NULL DEFAULT 'twitter',  -- twitter, linkedin, reddit
  status text NOT NULL DEFAULT 'queued',     -- queued, posted, failed
  posted_at timestamptz,
  platform_post_id text,          -- ID from the platform API (for threading)
  parent_post_id text,            -- ID of the previous episode's post (for reply threading)
  engagement_likes integer DEFAULT 0,
  engagement_replies integer DEFAULT 0,
  engagement_reposts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Database Migration: `crewman_chapters` table

```sql
CREATE TABLE crewman_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  source_document text,           -- e.g., "PAPER_STARSCREAMING_THROUGH_THE_AI_BRICK_WALL_B069.md"
  cephas_content_key text,        -- key for the staged Cephas content
  episode_count integer DEFAULT 0,
  vote_threshold integer NOT NULL DEFAULT 100,  -- engagement threshold to publish
  current_engagement integer DEFAULT 0,         -- cumulative engagement across all episodes
  status text NOT NULL DEFAULT 'staged',        -- staged, streaming, published, completed
  stream_started_at timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3. Edge Function: `dispatch-crewman-episode`

**Trigger**: Cron (every hour) OR manual invocation
**Logic**:
1. Find the current streaming chapter (status = 'streaming')
2. Find the next queued episode in that chapter (status = 'queued', lowest sequence_number)
3. Post to platform API (Twitter/X via API, LinkedIn via API)
4. If this is episode 2+, set `parent_post_id` to previous episode's `platform_post_id` (threading)
5. Update episode status to 'posted', store `platform_post_id` and `posted_at`
6. If no more queued episodes in this chapter AND chapter is not yet published → keep streaming (engagement still accumulating)
7. If no streaming chapter exists → check if next staged chapter should start

### 4. Edge Function: `track-crewman-engagement`

**Trigger**: Cron (every 15 minutes) OR manual invocation
**Logic**:
1. For each posted episode in the current streaming chapter:
   - Poll platform API for current engagement counts (likes, replies, reposts)
   - Update `engagement_likes`, `engagement_replies`, `engagement_reposts`
2. Calculate chapter cumulative engagement: SUM of all episode engagement in chapter
3. Update `crewman_chapters.current_engagement`
4. **Vote-Gate Check**: If `current_engagement >= vote_threshold`:
   - Publish the staged Cephas content (set chapter status = 'published')
   - Start the next chapter's stream (set next chapter status = 'streaming')
   - Log the publication event

### 5. Edge Function: `stage-crewman-chapter`

**Trigger**: Manual (Bishop loads new chapters)
**Logic**:
1. Accept chapter metadata (title, source document, episode array, vote threshold)
2. Create `crewman_chapters` record
3. Bulk insert episodes into `crewman_episodes`
4. Stage the corresponding Cephas content (unpublished)
5. Return chapter ID and episode count

### 6. UI: Crewman #6 Dashboard (page)

Simple dashboard showing:
- Current streaming chapter + progress bar (engagement/threshold)
- Episode queue status (posted/queued/total)
- Engagement chart (per-episode engagement over time)
- Chapter history (published chapters with timestamps)
- Manual controls: start stream, pause stream, advance chapter

---

## CANONICAL CORRECTIONS — ENFORCE EVERYWHERE

- Entity: **Liana Banyan CORPORATION** (Wyoming C-Corp)
- Creator keeps: **83.3%**
- Platform margin: **Cost+20%**
- Membership: **$5/year**
- SEC-safe language: "dividends" is common English, not securities terminology
- Galaxy Quest reference: Crewman #6 = the nobody who survives

---

## RLS POLICIES

- `crewman_episodes`: public read (episodes are social media posts — inherently public)
- `crewman_chapters`: public read for published chapters, admin-only for staged
- Write access: service_role only (automated system, not user-facing)

---

## COMPLETION CRITERIA

- [ ] 2 migration files created
- [ ] 3 edge functions created (dispatch, track, stage)
- [ ] 1 dashboard page created
- [ ] RLS policies applied
- [ ] Manual test: stage a chapter, start stream, dispatch one episode
- [ ] Session logged via Librarian `update_session(session_id="K240", ...)`

---

*Knight Session 240 — Crewman #6 Battery Integration*
*Dispatched by Bishop B070 | April 3, 2026*
*Build the pipeline that tells the story one bite at a time.*
*FOR THE KEEP!*
