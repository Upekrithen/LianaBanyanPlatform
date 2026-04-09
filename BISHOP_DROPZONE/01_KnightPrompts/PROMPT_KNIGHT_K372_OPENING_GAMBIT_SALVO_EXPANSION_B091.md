# Knight Session K372 — Opening Gambit Salvo Expansion (14-day, 5-stream, 57 posts)

**Bishop:** B091 | **Priority:** HIGH | **Depends on:** K366 (done), K367 (partial)

## Context

K367 built a 7-day, 18-post Opening Gambit campaign wired into TheBattery.tsx. The original spec called for a **14-day, 5-stream concurrent campaign with ~57 posts** providing social media air cover before/during letter dispatch. The existing `scheduleOpeningGambitPosts.ts` has 18 posts across 7 days. We need to expand this to the full salvo.

**Existing files:**
- `platform/src/scripts/scheduleOpeningGambit.ts` — 16 raw post definitions
- `platform/src/scripts/scheduleOpeningGambitPosts.ts` — 18 posts, 7-day campaign
- `platform/src/components/TheBattery.tsx` — "Opening Gambit" campaign wired

## What to Build

### TASK 1: Expand to 5 concurrent content streams across 14 days

Create `platform/src/scripts/scheduleOpeningGambitSalvo.ts` with these 5 streams:

**Stream 1 — Platform Identity Posts (daily, Days 1-14)**
- 14 posts across X, LinkedIn, Bluesky, Threads
- Each post highlights one aspect: Cost+20%, 83.3% creator keeps, $5/year, 3 currencies, cooperative ownership, 2,224 innovations, 12 patents, 202 Crown Jewels, no VC, Fair means everyone, HEOHO, 16 initiatives, 35 production systems, 6 cold start pathways

**Stream 2 — Cue Card Posts (2x daily, Days 1-14)**
- 28 posts — each shares a cue card image concept (text description, the cards themselves are in the platform)
- Platforms: X, Threads, Bluesky
- Link back to `/cue-cards` or `/share/cuecard/{id}`

**Stream 3 — Academic/Thought Leader Tags (Days 1-7)**
- 7 posts tagging or referencing the academic targets from Phase 2 dispatch
- Platform: X, LinkedIn
- Frame as "fascinating research" not cold outreach — reference their work, connect to LB's approach

**Stream 4 — Medium Articles (Days 1, 4, 7, 10)**
- 4 articles (3 new + 1 existing):
  1. "12 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform"
  2. "The 83.3% Platform: Why Cost+20% Changes Everything"
  3. "Political Expedition: What If Your Political Voice Had Economic Weight?"
  4. (existing) Ambassador of the Quan or Buffett Open Letter
- Create article draft content in `platform/src/data/mediumArticleDrafts.ts` (title, subtitle, body outline, tags)

**Stream 5 — LinkedIn Deep Posts (Days 2, 5, 8, 11)**
- 4 long-form LinkedIn posts (~300 words each)
- Topics: The Founder's Story (veteran, 8 kids, AI team), The Economics (Cost+20%), The IP Fortress (12 patents), The Launch (Opening Gambit)

### TASK 2: Create salvo migration

Create `20260409000002_k372_opening_gambit_salvo.sql`:
- Insert ~57 posts into `scheduled_posts` table
- Each post has: platform, content, scheduled_date (relative to campaign start), stream_name, campaign='opening_gambit_salvo'
- Set all to status='draft' — Founder activates when ready

### TASK 3: Wire salvo into TheBattery

In `TheBattery.tsx`:
- Add "Opening Gambit Salvo" as a separate loadable campaign alongside existing "Opening Gambit"
- Show stream breakdown: 5 streams, 14 days, ~57 posts
- Add stream filter (show/hide individual streams)
- Show calendar view of post distribution across 14 days

### TASK 4: Write 3 Medium article drafts

Create `BISHOP_DROPZONE/09_Articles/` files:
1. `ARTICLE_MEDIUM_12_PATENTS_NO_VC.md` — ~1,500 words. Hook: One founder, four AI agents, 2,224 innovations, 12 provisional patents, zero investors. Focus on the AI team (Bishop, Knight, Rook, Pawn), the patent strategy, and why no VC.
2. `ARTICLE_MEDIUM_83_PERCENT_PLATFORM.md` — ~1,500 words. Hook: On every platform, creators lose 30-50% to fees. LB takes Cost+20% — creator keeps 83.3%. Explain the economics, the margin lock, the one-way valve.
3. `ARTICLE_MEDIUM_POLITICAL_EXPEDITION.md` — ~1,500 words. Hook: What if your political voice had economic weight? Explain the Political Expedition system, how spending patterns create real data, how it's not voting — it's economic expression.

**IMPORTANT — Founder corrections for articles:**
- Entity is CORPORATION (Wyoming C-Corp), NOT LLC
- Founder is "veteran of no particular note" — military is HARD BOUNDARY, don't glorify
- HEOHO = Help Each Other Help Ourselves = Interdependence (NOT independence)
- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- Sponsorship Marks are ONE LEVEL ONLY. Not MLM. Never 2nd-degree.
- "As You Wish" = transaction confirmation phrase
- Show is about LIANA BANYAN, not the Founder

## Done-when

- [ ] scheduleOpeningGambitSalvo.ts with 5 streams, ~57 posts across 14 days
- [ ] Migration inserts all posts as drafts
- [ ] TheBattery shows both campaigns with stream filtering
- [ ] 3 Medium article drafts written with correct Founder voice
- [ ] All articles use current canonical numbers (2,224/202/12/2,393)
- [ ] Build passes
