# KNIGHT SESSION 275 — "All the Pudding" TV Guide Page
## Bishop B075 | April 4, 2026

---

## MISSION

Build a Cephas page at `/cephas/all-the-pudding` (subtitle: "There is No Spoon") that displays all 122+ Puddings, BST Episodes, Spoonfuls, and Skipping Stones as a TV Guide programming schedule + searchable listings.

---

## CONTEXT

The Founder's vision: members should discover content like browsing an old TV Guide — visual programming blocks showing what's "on" and what's "coming up," with the option to switch to listings/search for deep exploration. This is Cephas as cooperative public television.

**The Matrix reference**: "There is no spoon" — the subtitle connects to the broader teaching arc. The content IS the spoon. The menu IS the meal. Layered meaning connects to The Spice Rack, Recipe Pot, and Bring Popcorn innovations.

---

## DELIVERABLES

### 1. New Route

```tsx
// platform/src/routes/tools.tsx or cephas routes
<Route path="/cephas/all-the-pudding" element={<AllThePuddingPage />} />
```

### 2. Page Component

`platform/src/pages/cephas/AllThePuddingPage.tsx`

### 3. Layout

**Header:**
- Title: "All the Pudding"
- Subtitle: "There is No Spoon"
- Tagline: "Everything the cooperative has written — scheduled for your viewing."

**View Mode Toggle:**
- 📋 Listings
- 📺 Schedule (TV Guide)
- 📅 Calendar

**Filter Bar:**
- Spice tag multi-select (10 spices from The Spice Rack)
- Series filter (BST / Spoonfuls / Puddings / Skipping Stones / Papers)
- Depth layer (Skipping Stone / Pudding / This-is-NOT-Pudding)
- Date range picker
- Reading time filter (quick <3min / medium 3-10min / deep >10min)

### 4. Listings View

Traditional card grid:
- Each card shows: title, excerpt (first 150 chars), spice icon, depth badge, date, "Schedule Viewing" button
- Sort options: newest, most-read, highest-rated (from Pudding Pepper Rating K272)
- Pagination: 20 per page

### 5. Schedule View (TV Guide Style)

**Horizontal time axis**: next 7 days
**Vertical channel lanes**:
- BST Episodes
- Spoonfuls
- Skipping Stones
- Puddings
- News Slot

**Programming blocks:**
- Sized by estimated reading time
- Show: title, short description, duration, spice tag
- Color-coded by spice
- Current-time indicator bar (red vertical line)
- Click block → content detail sidebar + "Schedule Viewing" button
- Rotation: "Now Airing" → "Up Next" → "Later Today" → "Tomorrow" → "This Week"

**Aesthetic options (staff can toggle):**
- Old-school TV Guide (brown/amber/newspaper style)
- Modern streaming (Netflix-style tiles with hover previews)

### 6. Calendar View

Month grid with content density heatmap. Click a date → that day's listings appear below. Members can navigate forward/back through months and years.

### 7. Integration with Viewing Beacon (K276)

Each content item has a "Schedule Viewing" button that opens the `<SchedulingEntryBox>` component (shared primitive from K277). User fills in time, date, recurrence, reminder offset → beacon saved to their Helm Calendar.

### 8. Data Sources

Pull from:
- `cephas_puddings` (Puddings + ratings)
- `crewman_episodes` (BST + Spoonfuls + Skipping Stones)
- `distribution_news_slots` (News Slot content)

Unified query via a view or materialized view that normalizes the content types.

```sql
CREATE OR REPLACE VIEW all_cephas_content AS
SELECT
  'pudding' AS content_type,
  pudding_number::TEXT AS content_id,
  title,
  LEFT(pudding_text, 150) AS excerpt,
  primary_spice,
  secondary_spices,
  created_at AS publish_date,
  NULL::INT AS estimated_reading_minutes
FROM cephas_puddings
WHERE status = 'draft' OR status = 'published'

UNION ALL

SELECT
  'bst_episode' AS content_type,
  id::TEXT AS content_id,
  COALESCE(chapter_title, 'BST Episode') AS title,
  LEFT(content, 150) AS excerpt,
  primary_spice,
  secondary_spices,
  created_at AS publish_date,
  1 AS estimated_reading_minutes
FROM crewman_episodes
WHERE series = 'bst'

UNION ALL

SELECT
  'spoonful' AS content_type,
  id::TEXT AS content_id,
  COALESCE(chapter_title, 'Spoonful') AS title,
  LEFT(content, 150) AS excerpt,
  primary_spice,
  secondary_spices,
  created_at AS publish_date,
  1 AS estimated_reading_minutes
FROM crewman_episodes
WHERE series = 'spoonfuls';
```

---

## ACCEPTANCE CRITERIA

- [ ] `/cephas/all-the-pudding` route wired
- [ ] Header shows title + subtitle "There is No Spoon"
- [ ] Three view modes working (Listings / Schedule / Calendar)
- [ ] Filter bar functional (spice, series, depth, date, reading time)
- [ ] TV Guide schedule view renders programming blocks correctly
- [ ] "Schedule Viewing" button opens entry box (requires K276)
- [ ] `all_cephas_content` view created
- [ ] `npm run build` passes

## DO NOT

- Make the TV Guide view so visually heavy it takes >2s to load
- Break mobile responsiveness
- Skip the "There is No Spoon" subtitle
- Over-engineer the aesthetic toggle (ship with old-school TV Guide default)
