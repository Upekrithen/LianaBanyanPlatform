# KNIGHT SESSION 265 — Social Media Maven Staff Dashboard
## Bishop B075 | April 4, 2026

---

## MISSION

Build a dedicated staff dashboard for the Social Media Maven role — the person who operates the daily distribution grid, manages news slots, reviews prefaces, and monitors engagement. This consolidates existing staff tools into one purpose-built view.

---

## CONTEXT

The Founder is hiring a Social Media Maven (likely a family member) to operate the distribution system. Existing tools are scattered:
- `LaunchSchedulePage` at `/staff/launch-schedule` — episode scheduling + news slots
- `dispatch-crewman-episode` — automated dispatch
- `episode_preface_templates` — preface content (K262)
- `dispatch_platform_config` — per-platform batch rules (K262)
- `distribution_analytics` — engagement tracking (K251)

The Maven needs ONE page that shows everything they need to operate daily distribution.

---

## DELIVERABLE: `/staff/social-media` — SocialMediaDashboard.tsx

### Layout: Three-Column Dashboard

**Column 1: Today's Schedule**
- Hour-by-hour timeline showing what's scheduled to dispatch
- Each entry shows: time, platform icons, series badge (BST/Spoonfuls), episode preview (first 50 chars)
- Preface preview before each burst (collapsible)
- Status indicators: scheduled / dispatched / failed
- "Dispatch Now" test button (reuse from LaunchSchedulePage)
- News Slot card at the top: shows today's slot content, "Bump" button

**Column 2: Engagement Monitor**
- Pull from `distribution_analytics` table
- Per-platform metrics: posts today, total reach, engagement rate
- Top-performing episode of the day (highest engagement)
- Channel comparison: Twitter vs LinkedIn vs others
- 7-day trend sparkline chart
- "Breaking News" quick-post form: textarea + source field + "Bump & Dispatch" button

**Column 3: Content Pipeline**
- Upcoming episodes queue (next 24 hours)
- Series progress: BST Chapter X, Episode Y of Z (with progress bar)
- Spoonfuls queue depth
- Preface template browser: view/edit preface text for each chapter
- "Content Calendar" mini-view: next 7 days, color-coded by series

### Top Bar
- Date picker (view any day's schedule)
- Platform filter toggles (Twitter / LinkedIn / All)
- Status summary: "X dispatched today, Y scheduled, Z in queue"
- Maven name/role badge

---

## IMPLEMENTATION

### 1. Create the page

```
platform/src/pages/staff/SocialMediaDashboard.tsx
```

### 2. Wire the route

Add to App.tsx routes:
```tsx
<Route path="/staff/social-media" element={<SocialMediaDashboard />} />
```

Add to staff sidebar navigation.

### 3. Data queries

```typescript
// Today's schedule
const { data: todaySchedule } = useQuery({
  queryKey: ['dispatch-schedule', selectedDate],
  queryFn: () => supabase
    .from('crewman_episodes')
    .select('*')
    .gte('scheduled_for', startOfDay)
    .lt('scheduled_for', endOfDay)
    .order('scheduled_for', { ascending: true })
});

// News slot
const { data: newsSlot } = useQuery({
  queryKey: ['news-slot', selectedDate],
  queryFn: () => supabase
    .from('distribution_news_slots')
    .select('*')
    .eq('scheduled_date', selectedDate)
    .eq('status', 'scheduled')
    .single()
});

// Engagement (last 7 days)
const { data: analytics } = useQuery({
  queryKey: ['distribution-analytics'],
  queryFn: () => supabase
    .from('distribution_analytics')
    .select('*')
    .gte('dispatch_date', sevenDaysAgo)
    .order('dispatch_date', { ascending: false })
});

// Pipeline
const { data: pipeline } = useQuery({
  queryKey: ['content-pipeline'],
  queryFn: () => supabase
    .from('crewman_episodes')
    .select('series, chapter, count')
    .is('scheduled_for', null)
    .eq('status', 'staged')
});
```

### 4. Breaking News Quick-Post

Wire the "Bump & Dispatch" button to:
1. Call `bump-news-slot` edge function
2. Then immediately call `dispatch-crewman-episode`
3. Refresh all dashboard queries
4. Show toast: "Breaking news dispatched to [platforms]"

---

## ACCEPTANCE CRITERIA

- [ ] `/staff/social-media` page loads with three-column layout
- [ ] Today's schedule shows hour-by-hour dispatch timeline
- [ ] News Slot card shows current slot + Bump button
- [ ] Engagement section shows per-platform metrics
- [ ] Content pipeline shows queue depth and series progress
- [ ] Breaking News quick-post form works end-to-end
- [ ] Route wired in App.tsx + sidebar link added
- [ ] `npm run build` passes

## DO NOT

- Replace LaunchSchedulePage (keep it as the detailed admin view)
- Expose this dashboard to non-staff users
- Modify any dispatch logic (this is a read + trigger interface only)
