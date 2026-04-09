# KNIGHT SESSION 260 — Content Archive Incremental Refresh + News Slot in Distribution Grid
## Bishop B075 | April 4, 2026

---

## MISSION

Two tasks:

1. **Extend SP-10 Content Reader** for incremental archive updates (currently only does full runs)
2. **Add a "News Slot"** to the distribution grid — a daily time slot that defaults to platform stats but can be bumped by breaking news

---

## TASK 1: SP-10 Incremental Archive Refresh

### Context

`librarian-mcp/stitchpunks/sp10_content_reader.py` read 9,837 files into `data/content_archive/` on April 3. Since then, B066-B075 produced: BST Chapters 5-9, Puddings 101-111, Spoonfuls Batches 12-15, new papers, new innovations #2131-#2144. None of this new content is in the archive.

### Implementation

Add an `--incremental` flag to `sp10_content_reader.py`:

1. Load `data/cartographer_manifest.json` (current file list)
2. Load `data/content_archive_index.json` (previously archived files)
3. Compute diff: files in manifest but not in archive index = new files
4. For each new file:
   - Read content (up to 10K chars)
   - Generate JSON archive entry (same schema as existing archive)
   - Save to `data/content_archive/`
   - Update archive index
5. Optionally push new entries to Supabase via Phase 2 logic
6. Report: new files archived, total archive size

### Run

```bash
cd librarian-mcp
python stitchpunks/sp10_content_reader.py --incremental
```

---

## TASK 2: News Slot in Distribution Grid

### Context

The Concurrent Distribution Grid (#2141) schedules ~24 posts/day across all channels. The Founder wants a reserved daily time slot (e.g., 12pm CT / 17:00 UTC) that:

- **Default content**: Platform stats/updates (member count, transaction volume, innovation count, content stats)
- **Bumpable**: When breaking news arrives (e.g., a Crown letter response, a partnership announcement), the default content is deferred to the next day and the breaking news takes the slot
- **Auto-rollover**: Deferred content integrates into the next day's stats slot automatically

### Implementation

1. Add a `news_slot` content type to `crewman_episodes` (or a new table `distribution_news_slots`):

```sql
CREATE TABLE IF NOT EXISTS distribution_news_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date DATE NOT NULL,
  slot_time TIME NOT NULL DEFAULT '17:00:00',
  content_type TEXT NOT NULL DEFAULT 'stats', -- 'stats' | 'breaking_news' | 'deferred'
  content TEXT NOT NULL,
  original_date DATE, -- if deferred, what date was this originally for?
  breaking_news_source TEXT, -- e.g., 'trebor_scholz_response'
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'dispatched' | 'deferred'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily lookup
CREATE INDEX idx_news_slots_date ON distribution_news_slots(scheduled_date, status);
```

2. Add a `generate-daily-stats` edge function that:
   - Queries current platform stats (innovation count, member count, BST episode count, etc.)
   - Generates a ~280-char stats post
   - Inserts into `distribution_news_slots` with `content_type = 'stats'`
   - Runs daily at midnight (cron job or called by dispatch)

3. Add a `bump-news-slot` edge function that:
   - Takes `breaking_news_content` and `source` as params
   - Marks today's existing slot as `status = 'deferred'`, sets `original_date`
   - Inserts breaking news with `content_type = 'breaking_news'`
   - Creates a new stats slot for tomorrow that merges today's deferred content

4. Update `dispatch-crewman-episode` to check `distribution_news_slots` at the 17:00 UTC slot time and dispatch the active (non-deferred) entry.

5. Add a simple UI in `LaunchSchedulePage.tsx`: a "News Slot" section showing today's slot, with a "Bump with Breaking News" button that opens a textarea.

### Verify

```sql
-- Check table exists
SELECT * FROM distribution_news_slots ORDER BY scheduled_date DESC LIMIT 5;

-- Test bump flow
INSERT INTO distribution_news_slots (scheduled_date, content_type, content)
VALUES (CURRENT_DATE, 'stats', 'Platform update: 2,144 innovations, 182 Crown Jewels, 865 distributable episodes, $5 to join.');

-- Then bump it
-- (via edge function call)
```

---

## ACCEPTANCE CRITERIA

- [ ] `sp10_content_reader.py --incremental` archives only new files
- [ ] `distribution_news_slots` table created
- [ ] `generate-daily-stats` edge function works
- [ ] `bump-news-slot` edge function correctly defers and replaces
- [ ] LaunchSchedulePage shows News Slot section
- [ ] `npm run build` passes

## DO NOT

- Re-archive already archived files in incremental mode
- Change the existing dispatch-crewman-episode cron schedule
- Make the news slot replace any existing BST/Spoonfuls scheduling
