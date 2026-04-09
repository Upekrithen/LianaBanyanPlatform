# PROMPT — Knight Session 33
## Written by Bishop Session 012 (continued) — March 18, 2026
## Predecessor: Knight Session 31 (commit 3e20ef5), Bishop Session 012 commits through a7a3240

---

## SESSION CONTEXT

**Canonical innovation count:** 1,748
**Last Knight commit:** `3e20ef5` (Knight 31 — All Live Initiative Transformation, Attack Wheel)
**Last Bishop commits (this session):**
- `7fba868` — FAQ Chapter 10: Founder's Vernacular (22 entries)
- `acac7e9` — "ACTUAL real life value" on Patent Portfolio
- `45931a1` — "Like What?" examples page at `/like-what`
- `7febda3` — ScrollToTop component (every page loads at top)
- `1426b33` — Paper interest level buttons (At a Glance / More Info / Full Detail)
- `04855d1` — Reorder interest level buttons left-to-right, default At a Glance
- `7967b71` — Share buttons (SocialShareBar) on Papers, Patent Portfolio, Like What
- `c77469a` — Fable subtitle fixes, chalk outline clipping fix, spotlight bottom cards
- `a7a3240` — Watch dropdown opens upward (z-index fix)

**Deploy status:** LIVE as of March 18, 2026
**Last migration:** `20260319000001` (launch_conditions — Knight 31)

---

## ⚡ PRIORITY 1: TL;DR Tour Wildfire Run (Founder-approved)

### What It Is
A guided 6-stop onboarding path through the platform's key pages. Earned a Golden Key on completion. Part of the Wildfire Beacon Run system.

### Implementation

Add to `src/data/wildfireRuns.ts`:
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

Add to **Denken Menu** as 6th option (lightning bolt icon, "TL;DR Tour").

---

## ⚡ PRIORITY 2: Moneypenny Phase 1 — Edge Functions + Admin Dashboard

### Founder's Exact Words
"Generate a report that I can read, on demand, of what responses I have gotten from whom and when, and what I need to do, and possibilities for social media posts and then show me so I can sign off on them. ACTUALLY like an administrative assistant. Keep my schedule, record and pollinate my ideas."

### Key Principle
This is NOT a chatbot. This is a structured admin dashboard that SHOWS the Founder what needs attention and lets him act with one click.

### 2A. Edge Functions (make Moneypenny autonomous)

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

### 2B. Morning Briefing Dashboard — `/moneypenny/briefing`

New route, lazy-loaded. Five panels:

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

### 2C. Database Tables

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

-- red_carpet_signals (auto-trigger system)
CREATE TABLE IF NOT EXISTS red_carpet_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitee_name text,
  invitee_email text,
  signal_type text NOT NULL, -- welcome, threshold_alert, crown_response_needed, milestone
  trigger_condition text,
  template_id text,
  sent_at timestamptz,
  status text DEFAULT 'pending', -- pending, sent, failed
  created_at timestamptz DEFAULT now()
);
```

### Knight-Bishop Bridge Integration
- Moneypenny writes relay files to bridge
- Bishop reads on next session
- Enables: "Tell Bishop to add a FAQ entry for BandWagon" → Bishop executes

---

## PRIORITY 3: Remaining Session 32 Carryover

If Knight 31 did NOT complete all of these, finish them:
- Wrap remaining 11 initiative pages with LaunchConditionOverlay
- Hitbase Counter Showcase + Character Layer Explorer
- Wire Demand Signaling + Pledged Mark Voting to Supabase
- X-Ray Goggles audit + FAQ connection verification

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/functions/moneypenny-intake/index.ts` | Inbound email/comms processor Edge Function |
| `supabase/functions/moneypenny-daily-digest/index.ts` | 8 AM daily summary Edge Function |
| `supabase/functions/moneypenny-signal/index.ts` | NoReply@ automated trigger Edge Function |
| `supabase/migrations/NEXT_moneypenny_briefing_tables.sql` | All 6 tables (inbox, actions, social_drafts, ideas, schedule, red_carpet_signals) |
| `src/pages/MoneypennyBriefing.tsx` | Morning Briefing dashboard page |
| `src/components/moneypenny/ResponseTracker.tsx` | Response tracker panel |
| `src/components/moneypenny/ActionQueue.tsx` | Action items queue with checkboxes |
| `src/components/moneypenny/SocialDraftStation.tsx` | Social media draft/approve UI |
| `src/components/moneypenny/IdeaCapture.tsx` | Idea input + relay to Bishop |
| `src/components/moneypenny/ScheduleView.tsx` | Timeline of upcoming deadlines |

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/moneypenny/briefing` route (lazy-loaded), TL;DR tour route if needed |
| `src/pages/MoneyPenny.tsx` | Add navigation link to `/moneypenny/briefing` |
| `src/data/wildfireRuns.ts` | Add TLDR_TOUR_RUN |
| Denken menu component | Add TL;DR Tour as 6th option |

---

## CRITICAL RULES

1. **Innovation count = 1,748** — verify after any changes
2. **SEC language** — no "invest", "return", "profit", "dividend", "yield" in user-facing copy
3. **Marks = effort-debt currency** — never "granted as gifts", always from differential
4. **"As You Wish"** = universal transaction confirmation
5. **Moneypenny is NOT a chatbot** — structured dashboard, one-click actions
6. Build must pass `npx tsc --noEmit` before deploy

---

## COMMIT MESSAGE FORMAT

```
Session 33: [summary], [innovation count], POLLINATE if applicable
```
