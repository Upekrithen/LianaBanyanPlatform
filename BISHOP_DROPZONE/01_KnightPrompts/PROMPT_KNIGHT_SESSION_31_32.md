# PROMPT — Knight Sessions 31-32
## Written by Bishop Session 012 (continued) — March 18, 2026
## Predecessor: Knight Session 30 (commit bf6a7bd), Bishop Session 012 (commit 838d22f)

---

## SESSION CONTEXT

**Canonical innovation count:** 1,748 (after Bishop 012 migrations)
**Last commits:** `bf6a7bd` (Knight 30), `838d22f` (Bishop 012 continued)
**Last migration:** `20260318000004` (Gameplay Mechanics #1740-#1748) — PUSHED
**Campaign count:** 14 (Character Base added as Campaign 6)
**Deploy status:** LIVE as of March 18, 2026

Knight Session 30 built: Shadow Mark Demand Signaling (`/demand`), FAQ chain linking (data + Chapter 9), POLLINATED 1,709→1,719.

Bishop Session 012 (continued) built:
- Battle Philosophy page (`/hexisle/battle-philosophy`) — Paper 8 game lore + real-life application
- FAQ "See Also" UI (chain-linked pills in FAQ.tsx)
- Pledged Mark Voting page (`/hexisle/vote`) — 14 campaign candidates
- HexIsle Cue Card (`/cue-cards/hexisle`) — dual-audience referral card
- Migrations 000002/000003/000004 — 29 innovations (#1720-#1748), all PUSHED
- POLLINATED 1,719→1,748 across 22+ source files
- 11 new FAQ entries in knowledgeBase (attack wheel, cairn alliance, brand marks, terrain, deterministic chance, hitbase counter, coin-terrain, level overlay, character layers, root lock)
- Updated HexIsle Chain from 13→14 campaigns (65%→70% max bonus)
- Campaign 6 (Character Base / Hitbase Counter) — full copy with patent detail
- Removed floating Patent Portfolio ticker and LIVE — ALPHA RELEASE buttons
- IP Portfolio Bag 8 expanded: #1720-#1748 (29 innovations)
- Silver Candlesticks quote added to patent pages
- Papers 8 + 9 written (academic-papers/)

---

## ⚡ NEW TOP PRIORITY: "ALL LIVE" INITIATIVE TRANSFORMATION

### The Concept

**Founder directive:** Replace ALL grayed-out "Coming Soon" initiative pages with LIVE pages that show launch conditions and real progress.

Instead of:
```
┌──────────────────────────┐
│   🔒 Coming Soon         │
│   [Grayed out content]   │
└──────────────────────────┘
```

Build:
```
┌──────────────────────────────────────────────┐
│   🟢 LIVE — Launches When Conditions Met     │
│                                               │
│   Leadership:     ████████░░  80%            │
│   Members:        ██░░░░░░░░  15/500         │
│   Pre-Order Fund: █░░░░░░░░░  $2K / $25K     │
│                                               │
│   [Full page content visible and explorable]  │
└──────────────────────────────────────────────┘
```

### Why This Matters

The Founder's node scaling analogy: "Going from 1 kid to 2 kids is a LOT more than 1. And 3 is still a big adjustment from 2. But 4 and on is pretty much like having a soccer team — you already have the van."

Translation: The FIRST node/location is the hard one. It needs ~500-1,000 people in ANY location. Once that first node works, every subsequent node is incremental — the infrastructure, processes, training, and supply chain already exist. Show visitors that most initiatives are closer to launch than they think.

### Implementation Spec

#### A. Create `LaunchConditionOverlay` Component

`src/components/LaunchConditionOverlay.tsx`

```tsx
interface LaunchCondition {
  label: string;           // "Leadership" | "Members" | "Pre-Order Funding"
  current: number;
  target: number;
  unit?: string;           // "people", "$", "roles filled"
  supabaseTable?: string;  // where to read real-time data
  supabaseColumn?: string;
}

interface LaunchConditionOverlayProps {
  initiativeName: string;
  conditions: LaunchCondition[];
  launchMessage?: string;  // "When all bars hit 100%, this initiative goes live"
  children: React.ReactNode;  // The actual page content (VISIBLE, not grayed)
}
```

Key behaviors:
- Content is FULLY VISIBLE and explorable underneath
- Overlay is a SUBTLE top banner or floating card — NOT a blocking modal
- Progress bars use platform colors (amber for in-progress, green for met)
- Each bar shows fraction and percentage
- "Help accelerate this" CTA links to relevant action (sign up, share cue card, pre-order)
- Dismissible — user can close overlay to browse freely
- Persists as small pill/badge in corner after dismissal

#### B. Create `launch_conditions` Supabase Table

Migration: `20260319000001_launch_conditions.sql`

```sql
CREATE TABLE IF NOT EXISTS public.launch_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_slug TEXT NOT NULL,          -- matches Sweet Sixteen slug
  condition_type TEXT NOT NULL,           -- 'leadership' | 'members' | 'funding'
  label TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  unit TEXT DEFAULT 'people',
  auto_source TEXT,                       -- NULL = manual, or table.column for auto-calc
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(initiative_slug, condition_type)
);

-- RLS: everyone can read, only service role can write
ALTER TABLE public.launch_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read launch conditions"
  ON public.launch_conditions FOR SELECT USING (true);
```

#### C. Seed Data for All 16 Initiatives

Seed with realistic conditions per initiative. Every initiative gets THREE conditions:

| # | Initiative | Leadership Target | Member Target | Funding Target |
|---|-----------|-------------------|---------------|----------------|
| 1 | HexIsle | Game Director (1) | 500 pre-orders | $25,000 |
| 2 | Let's Make Bread | Incubator Director (1) | 200 members | $10,000 |
| 3 | JukeBox | Music Director (1) | 300 members | $15,000 |
| 4 | Mall / Emporium | Marketplace Manager (1) | 100 sellers | $5,000 |
| 5 | Household Concierge | Operations Lead (1) | 50 households | $8,000 |
| 6 | Voucher Short Loans | VSL Administrator (1) | 100 members | $20,000 |
| 7 | Medical Savings Accounts | MSA Director (1) | 200 members | $15,000 |
| 8 | Didasko | Education Director (1) | 100 students | $10,000 |
| 9 | Santa Ever After | Jesper Coordinator (1) | 50 members | $5,000 |
| 10 | Harper Guild | Chief Harper (1) | 25 auditors | $3,000 |
| 11 | Coverage Minutes | Pnyx Moderator (1) | 50 speakers | $2,000 |
| 12 | Star Chamber | Oracle (1) | 100 members | $5,000 |
| 13 | Defense Klaus | Shield Knight (1) | 50 members | $5,000 |
| 14 | Family Table | Family Steward (1) | 20 families | $2,000 |
| 15 | Power to the People | Political Director (1) | 500 members | $10,000 |
| 16 | Seed the Quan | Community Lead (1) | 1,000 members | $25,000 |

**NOTE:** These are starting targets. They can be adjusted. The point is showing PROGRESS, not perfection.

#### D. Update Every Initiative Page

For each of the Sweet Sixteen initiative pages:
1. Wrap page content in `<LaunchConditionOverlay>`
2. Pass initiative-specific conditions
3. Remove any "Coming Soon" / grayed-out / locked styling
4. Make ALL content visible and interactive
5. Each page should feel REAL — like it's about to launch any day

Pages to update (check `src/pages/` and `src/App.tsx` for current routes):
- Every initiative that currently shows "Coming Soon" or placeholder content
- If a page doesn't exist yet, create a REAL page with actual content from the Sweet Sixteen descriptions

#### E. Dashboard: Initiative Launch Tracker

Create `/launch-tracker` page showing ALL 16 initiatives in a grid:
- Card per initiative with mini progress bars
- Sort by "closest to launch" (highest average completion)
- Color coding: 🟢 all conditions met, 🟡 >50% average, 🔴 <50%
- Links to each initiative page
- "This is what we're building together" messaging

#### F. Auto-Calculation Hooks

Where possible, wire `current_value` to auto-calculate from existing Supabase data:
- Members count → `profiles` table COUNT
- Pre-orders → future `preorders` table SUM
- Leadership → `roles` or manual until role system exists

For now, manual update is fine — but leave the `auto_source` column ready for future wiring.

---

## PRIORITY 2: BUILD HEXISLE FEATURES (from original Knight 31)

### 2A. Hitbase Counter Showcase Component

Create `src/components/hexisle/HitbaseCounterShowcase.tsx` — interactive visual explainer:
- Animated diagram: character pushed → piston displaces → cog advances → counter ring rotates
- 6-position numbered display (1-6 HP states)
- Supine-lock visual at HP=0 (character falls)
- Danger Tab level selector (shows HP/Mana ratio change)
- Link from HexIsle portal page and Campaign 6 context

Key innovations to reference: #1579 (Push-to-Hit Piston), #1580 (HP/Mana Dual Counter), #1583 (Root Lock 5 shapes)

### 2B. Character Layer System Interactive Display

Create `src/components/hexisle/CharacterLayerExplorer.tsx`:
- Two progression paths: Sword Path and Crown Path
- Visual layer stack: click to add/remove layers on the base body
- Sword: Peasant → +ToolBelt (Farmer) → +ScaleMail+TerrainArmor (Warrior) → +Crown (King)
- Crown: +Cloak (Merchant) → +Herbs+Staff (Healer) → -Cloak (Assassin) → +Wings+CrownHelmet (Queen)
- Campaign number badges on each progression stage
- "Ships complete at this stage" callout per campaign

Key innovations: #1720-#1730

### 2C. Attack Wheel Interactive Demo

Create `src/components/hexisle/AttackWheelDemo.tsx`:
- Visual spinning wheel with hit/miss segments per level
- Level selector (L1-L6) showing pattern change
- "Click to attack" button that advances wheel one position
- "Shoot at tree" button that advances without combat effect
- Running history log showing how "luck" is really sequence
- Cost-per-shot display that increases with level
- Level patterns (CANONICAL — do not deviate):
  - L1: miss, miss, hit (cost: 1 coin)
  - L2: miss, hit (cost: 2 coins)
  - L3: hit, miss, hit, miss (cost: 3 coins)
  - L4: hit, hit, miss, miss (cost: 4 coins)
  - L5: hit, hit, miss (cost: 5 coins)
  - L6: hit, hit, hit, miss (cost: 6 coins)

---

## PRIORITY 3: WIRE TO SUPABASE

### 3A. Wire Demand Signaling to Supabase

The `/demand` page currently shows mock data from `SAMPLE_PEDESTALS` in `demandSignalingService.ts`.

Create migration + wire to real Supabase tables:
- `pedestals` table (id, feature_name, description, area, status, activation_threshold, current_commitments, etc.)
- `shadow_mark_allocations` table (user_id, pedestal_id, fresh_today, carry_forward, total, consecutive_days, crystallized, last_allocated_at)
- `beacon_streaks` table (user_id, current_streak, longest_streak, last_active_at)
- Seed with the 8 sample pedestals already defined in code
- Wire `DemandSignaling.tsx` to fetch from Supabase instead of mock data
- RLS: users can read all pedestals, read/write own allocations

### 3B. Wire Pledged Mark Voting to Supabase

The `/hexisle/vote` page currently shows mock data from `CANDIDATES` array.

Create migration:
- `vote_candidates` table (id, name, description, campaign_number, type, status)
- `pledged_mark_votes` table (user_id, candidate_id, marks_pledged, pledged_at)
- Seed with 14 campaign candidates
- Wire `HexIsleVote.tsx` to fetch/write from Supabase
- RLS: users can read all candidates, read/write own votes

---

## PRIORITY 4: X-RAY GOGGLES + FAQ DEEP WIRING

### 4A. X-Ray Goggles on Every Page

Ensure every page in the platform has X-Ray Goggles integration:
- Hover/click on any concept → tooltip with FAQ explanation
- Innovation numbers displayed in X-Ray mode
- "Learn more" links to relevant FAQ entries
- Use existing `knowledgeBase.ts` FAQ entries as the data source

### 4B. FAQ Connection Audit

Run through ALL FAQ entries and verify:
- Every `relatedEntries` reference points to a real entry ID
- Every initiative page links to its relevant FAQ entries
- Chain linking works (entry A → B → C navigable)

---

## PRIORITY 5: POLLINATE + DEPLOY

### 5A. Verify POLLINATION

Grep for any remaining stale references:
- "1,719" or "1,730" → should be "1,748"
- "13-campaign" or "13 campaign" → should be "14"
- "65%" chain bonus → should be "70%"

### 5B. Build + Deploy

```bash
npm run build
npx firebase deploy --only hosting
```

Both targets: `lianabanyan-main.web.app` and `cephas-lianabanyan.web.app`

---

## SESSION SPLIT GUIDANCE

### Knight 31 (First Session)
Focus: "All Live" Initiative Transformation
- Create LaunchConditionOverlay component
- Create launch_conditions Supabase table + seed data
- Update 3-5 initiative pages as proof of concept
- Create Launch Tracker dashboard page
- Build Attack Wheel interactive demo

### Knight 32 (Second Session)
Focus: Remaining Features + TL;DR Tour + Moneypenny Phase 1
- Update remaining 11 initiative pages with LaunchConditionOverlay
- Build Hitbase Counter Showcase + Character Layer Explorer
- Wire Demand Signaling + Pledged Mark Voting to Supabase

#### NEW: TL;DR Tour Wildfire Run (Founder-approved)
Create a new Wildfire Beacon Run in `src/data/wildfireRuns.ts`:
```
TLDR_TOUR_RUN: WildfireRun = {
  id: "tldr-tour",
  slug: "tldr-tour",
  name: "The TL;DR Tour",
  description: "See it all in 10 minutes — the 'Okay, this is real' path",
  category: "onboarding",
  difficulty: "beginner",
  estimatedMinutes: 10,
  icon: "⚡",
  totalNodes: 6,
  nodes: [
    { route: "/like-what",                title: "Like What?",           description: "Projects + Vernacular glossary" },
    { route: "/patent-portfolio",          title: "Patent Portfolio",     description: "$116M equivalent, declared at $630K" },
    { route: "/hexisle/battle-philosophy", title: "Battle Philosophy",    description: "No dice — luck is consequence" },
    { route: "/economics",                 title: "Economic Model",       description: "Cost+20%, three currencies, no VC" },
    { route: "/faq#vernacular",            title: "Founder's Vernacular", description: "The language we invented" },
    { route: "/launch-tracker",            title: "Launch Tracker",       description: "How close each initiative is" },
  ]
}
```
Add to Denken Menu as 6th option (lightning bolt icon, "TL;DR Tour").

#### NEW: Moneypenny Phase 1 — Edge Functions (Founder-approved)

**Context:** MoneyPenny UI exists at `/moneypenny`. Database tables exist (`moneypenny_tasks`, `communication_log`, `communication_categories`, `publication_submissions`). Google Voice setup exists (406-578-1232). What's MISSING is the Edge Functions that make it autonomous.

**Email accounts to manage:** CFO@lianabanyan.com, support@lianabanyan.com, Founder@lianabanyan.com, CTO@lianabanyan.com, NoReply@lianabanyan.com

**Build these Supabase Edge Functions:**

1. **`moneypenny-intake`** — Inbound email/comms processor
   - Receives webhook from Resend (inbound email) or Gmail forwarding
   - Parses sender, subject, body, which @lianabanyan.com account it was sent to
   - Categorizes: Crown Response / Press / Member / Support / Unknown
   - Inserts into `communication_log` with priority (1=Crown/Press, 2=Member, 3=Support, 4=Unknown)
   - Creates `moneypenny_tasks` entry if action needed
   - Returns acknowledgment

2. **`moneypenny-daily-digest`** — 8 AM daily summary
   - Scheduled function (cron: `0 8 * * *` CST)
   - Compiles: new communications, pending tasks, Shadow Mark crystallizations, member signups, launch condition changes
   - Sends HTML email to Founder@lianabanyan.com via Resend
   - Marks digest items as "reported"

3. **`moneypenny-signal`** — NoReply@ automated trigger system
   - Create `red_carpet_signals` table: (id, invitee_name, invitee_email, signal_type, trigger_condition, template_id, sent_at, status)
   - When trigger conditions met (new member signup, pedestal threshold, etc.), sends templated email from NoReply@lianabanyan.com
   - Signal types: 'welcome', 'threshold_alert', 'crown_response_needed', 'milestone'

4. **Wire MoneyPenny.tsx to real data** — Replace mock data with Supabase queries
   - Communication Log tab → `communication_log` table
   - Tasks tab → `moneypenny_tasks` table
   - Publications tab → `publication_submissions` table
   - Overview tab → aggregate queries

#### NEW: Moneypenny Admin Assistant — Tier 1: Report Dashboard

##### What Moneypenny Does (Founder's Words)
"Generate a report that I can read, on demand, of what responses I have gotten from whom and when, and what I need to do, and possibilities for social media posts and then show me so I can sign off on them. ACTUALLY like an administrative assistant. Keep my schedule, record and pollinate my ideas."

##### Implementation: `/moneypenny/briefing` Route

**Morning Briefing Page** (new route, lazy-loaded):

**1. Response Tracker Panel**
- Pull from `red_carpet_signals` table: who signed up, when, referral source
- Pull from email intake (Edge Function parses incoming to `moneypenny_inbox`)
- Show: Name, Date, Channel (email/web/phone), Status (new/replied/needs-action), Summary
- Sort by urgency: needs-action first, then new, then replied

**2. Action Items Queue**
- Auto-generated from response tracker: "Reply to [name]", "Follow up on [topic]"
- Manual items Founder adds
- Checkbox to mark done
- Carries forward until completed

**3. Social Media Draft Station**
- Template-based post generator using platform content
- Shows draft posts for: Twitter/X, general social
- Founder clicks "Approve" → copies to clipboard (Phase 1) or auto-posts (Phase 2)
- Content sources: new papers, patent milestones, innovation count updates, initiative launches

**4. Idea Capture + Relay**
- Text input: "Tell Bishop to..." or "New idea:"
- Saves to `BISHOP_DROPZONE/MONEYPENNY_RELAY/` as timestamped markdown files
- Bishop picks up on next session
- Also saves to `moneypenny_ideas` table for persistence

**5. Schedule View**
- Simple timeline/list of upcoming deadlines
- Patent filing dates, deploy schedules, outreach follow-ups
- Manual entry by Founder

##### Database Tables Needed

```sql
-- moneypenny_inbox (email intake)
CREATE TABLE moneypenny_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email text,
  sender_name text,
  subject text,
  body_preview text,
  received_at timestamptz DEFAULT now(),
  status text DEFAULT 'new', -- new, read, needs-action, replied, archived
  action_notes text,
  created_at timestamptz DEFAULT now()
);

-- moneypenny_actions (to-do queue)
CREATE TABLE moneypenny_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  source text, -- 'auto' or 'manual'
  source_ref uuid, -- links to inbox item or signal
  priority text DEFAULT 'normal', -- urgent, normal, low
  status text DEFAULT 'pending', -- pending, done, dismissed
  due_date date,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- moneypenny_social_drafts (social media queue)
CREATE TABLE moneypenny_social_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text DEFAULT 'twitter', -- twitter, general
  content text NOT NULL,
  content_source text, -- what triggered this draft
  status text DEFAULT 'draft', -- draft, approved, posted, rejected
  approved_at timestamptz,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- moneypenny_ideas (idea capture)
CREATE TABLE moneypenny_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  relay_to text, -- 'bishop', 'knight', 'founder-review'
  status text DEFAULT 'captured', -- captured, relayed, processed
  created_at timestamptz DEFAULT now()
);

-- moneypenny_schedule (calendar items)
CREATE TABLE moneypenny_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  category text, -- patent, deploy, outreach, personal
  status text DEFAULT 'upcoming', -- upcoming, done, overdue
  created_at timestamptz DEFAULT now()
);
```

##### Edge Functions (from prior spec, still needed)
1. `moneypenny-email-intake` — receives forwarded emails, parses, stores
2. `moneypenny-daily-digest` — generates morning briefing data
3. `moneypenny-signal` — NoReply@ auto-response trigger

##### Knight-Bishop Bridge Integration
- Moneypenny writes relay files to bridge
- Bishop reads on next session
- Enables: "Tell Bishop to add a FAQ entry for BandWagon" → Bishop executes

##### Key Principle
This is NOT a chatbot. This is a structured admin dashboard that SHOWS the Founder what needs attention and lets him act with one click. Moneypenny's "personality" comes through in the copy and the organization, not through conversation.

##### Files to Add for Moneypenny Tier 1

| File | Purpose |
|------|---------|
| `src/pages/MoneypennyBriefing.tsx` | Morning Briefing dashboard page |
| `src/components/moneypenny/ResponseTracker.tsx` | Response tracker panel |
| `src/components/moneypenny/ActionQueue.tsx` | Action items queue with checkboxes |
| `src/components/moneypenny/SocialDraftStation.tsx` | Social media draft/approve UI |
| `src/components/moneypenny/IdeaCapture.tsx` | Idea input + relay to Bishop |
| `src/components/moneypenny/ScheduleView.tsx` | Timeline of upcoming deadlines |
| `supabase/migrations/NEXT_moneypenny_briefing_tables.sql` | All 5 Moneypenny Tier 1 tables |

##### Files to Modify for Moneypenny Tier 1

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/moneypenny/briefing` route (lazy-loaded) |
| `src/pages/MoneyPenny.tsx` | Add navigation link to `/moneypenny/briefing` |

### Knight 33 (Third Session, if needed)
- X-Ray Goggles deep audit
- Final pollination + deploy
- Any remaining Moneypenny wiring

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/components/LaunchConditionOverlay.tsx` | Initiative launch progress overlay |
| `src/pages/LaunchTracker.tsx` | All-initiatives progress dashboard |
| `src/components/hexisle/HitbaseCounterShowcase.tsx` | Interactive Hitbase Counter explainer |
| `src/components/hexisle/CharacterLayerExplorer.tsx` | Layer progression visualizer |
| `src/components/hexisle/AttackWheelDemo.tsx` | Interactive attack wheel demonstration |
| `supabase/migrations/NEXT_launch_conditions.sql` | Launch conditions table |
| `supabase/migrations/NEXT_pedestals_and_shadow_marks.sql` | Demand Signaling tables |
| `supabase/migrations/NEXT_pledged_mark_votes.sql` | Voting tables |
| `supabase/functions/moneypenny-intake/index.ts` | Inbound email/comms processor Edge Function |
| `supabase/functions/moneypenny-daily-digest/index.ts` | 8 AM daily summary Edge Function |
| `supabase/functions/moneypenny-signal/index.ts` | NoReply@ automated trigger Edge Function |
| `supabase/migrations/NEXT_red_carpet_signals.sql` | Red carpet signal triggers table |
| `src/pages/MoneypennyBriefing.tsx` | Moneypenny Tier 1 Morning Briefing dashboard |
| `src/components/moneypenny/ResponseTracker.tsx` | Response tracker panel |
| `src/components/moneypenny/ActionQueue.tsx` | Action items queue with checkboxes |
| `src/components/moneypenny/SocialDraftStation.tsx` | Social media draft/approve UI |
| `src/components/moneypenny/IdeaCapture.tsx` | Idea input + relay to Bishop |
| `src/components/moneypenny/ScheduleView.tsx` | Timeline of upcoming deadlines |
| `supabase/migrations/NEXT_moneypenny_briefing_tables.sql` | Moneypenny Tier 1 tables (inbox, actions, social_drafts, ideas, schedule) |

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes: `/launch-tracker`, new initiative pages |
| `src/pages/*.tsx` | Remove "Coming Soon" → add LaunchConditionOverlay |
| `src/pages/DemandSignaling.tsx` | Wire to Supabase |
| `src/pages/HexIsleVote.tsx` | Wire to Supabase |
| `src/pages/HexIsle*.tsx` | Add Character Layer + Hitbase + Attack Wheel sections |
| `src/App.tsx` | Also add `/moneypenny/briefing` route (lazy-loaded) |
| `src/pages/MoneyPenny.tsx` | Add navigation link to `/moneypenny/briefing` |

---

## CRITICAL RULES

1. **"ALL LIVE" means ALL LIVE** — No grayed-out content. Every page shows real content + launch conditions.
2. **Characters are SAME BODY with snap-on layers** — NOT separate miniatures
3. **14 campaigns** — Campaign 6 = Character Base (Hitbase Counter System)
4. **Chain bonus max = 70%** (5% × 14 campaigns)
5. **Innovation count = 1,748** — verify after any changes
6. **SEC language** — no "invest", "return", "profit", "dividend", "yield" in user-facing copy
7. **Marks = effort-debt currency** — never "granted as gifts", always from differential
8. **"As You Wish"** = universal transaction confirmation
9. **Attack wheel patterns are CANONICAL** — L1-L6 as specified above, do NOT deviate
10. Build must pass `npx tsc --noEmit` before deploy

---

## COMMIT MESSAGE FORMAT

```
Session 31: [summary], 1748 innovations, POLLINATE if applicable
Session 32: [summary], [innovation count], POLLINATE if applicable
```
