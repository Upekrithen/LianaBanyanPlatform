# Knight Session 133 — Guild & Tribe System + Six-Path Cold Start + Banner Contests

**Priority:** HIGH
**Innovations:** #2014-#2020
**Depends on:** K128 (Cold Start Hub), K120 (Contest Pipeline), K129 (Captain's Dashboard)

---

## MISSION

Build the Guild and Tribe system. Extend the Cold Start Hub from 4 pathways to 6 (add Guild + Tribe). Create Guild/Tribe treasury, Banner Contests, and visual identity infrastructure. Connect Family-type Tribes to Family Table (K130).

---

## DELIVERABLE 1: Migration — Guild & Tribe Tables

### New Tables

```sql
-- Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  guild_type TEXT NOT NULL, -- 'makers', 'designers', 'farmers', 'drivers', 'tutors', 'captains', 'developers', 'artists', 'other'
  leader_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Visual Identity
  banner_url TEXT,
  icon_url TEXT,
  mascot_url TEXT,
  color_primary TEXT DEFAULT '#7c3aed', -- purple default
  color_secondary TEXT,
  theme_css TEXT, -- custom CSS override (Layer 2)
  
  -- Treasury
  treasury_credits INTEGER NOT NULL DEFAULT 0,
  treasury_reserve_pct NUMERIC NOT NULL DEFAULT 0.10, -- 10% emergency reserve
  spending_threshold INTEGER NOT NULL DEFAULT 50, -- above this requires vote
  
  -- Stats
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tribes (many per member)
CREATE TABLE IF NOT EXISTS tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tribe_type TEXT NOT NULL CHECK (tribe_type IN ('family', 'neighborhood', 'interest', 'cultural', 'hybrid')),
  elder_id UUID REFERENCES auth.users(id) NOT NULL, -- "Tribe Elder" = Captain equivalent
  
  -- Visual Identity (same stack as guilds)
  banner_url TEXT,
  icon_url TEXT,
  mascot_url TEXT,
  color_primary TEXT DEFAULT '#d97706', -- gold default
  color_secondary TEXT,
  theme_css TEXT, -- custom CSS override (Layer 3)
  
  -- Treasury
  treasury_credits INTEGER NOT NULL DEFAULT 0,
  treasury_reserve_pct NUMERIC NOT NULL DEFAULT 0.10,
  spending_threshold INTEGER NOT NULL DEFAULT 50,
  
  -- Family Table connection
  family_table_id UUID, -- links to family_tables if tribe_type = 'family'
  
  -- Stats
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guild Membership (one guild per member)
CREATE TABLE IF NOT EXISTS guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- ONE guild per member
);

-- Tribe Membership (many tribes per member)
CREATE TABLE IF NOT EXISTS tribe_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('elder', 'keeper', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tribe_id, user_id) -- one membership per tribe, but many tribes per member
);

-- Treasury Transactions (shared for guilds and tribes)
CREATE TABLE IF NOT EXISTS group_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL, -- references guilds.id or tribes.id
  user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('contribution', 'contest_prize', 'purchase', 'bounty', 'event', 'reserve_access')),
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  description TEXT,
  approved_by UUID REFERENCES auth.users(id), -- NULL if auto-approved (below threshold)
  vote_id UUID, -- references a vote if approval was democratic
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Design Contests (for guild/tribe banners, themes, etc.)
CREATE TABLE IF NOT EXISTS design_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL,
  contest_type TEXT NOT NULL CHECK (contest_type IN ('banner', 'theme', 'mascot', 'icon', 'color_palette', 'seasonal')),
  title TEXT NOT NULL,
  description TEXT,
  prize_credits INTEGER NOT NULL DEFAULT 0,
  
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'voting', 'decided', 'cancelled')),
  submissions_close_at TIMESTAMPTZ,
  voting_close_at TIMESTAMPTZ,
  winner_submission_id UUID,
  
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Design Contest Submissions
CREATE TABLE IF NOT EXISTS design_contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES design_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  asset_url TEXT NOT NULL, -- uploaded image/CSS/file
  preview_url TEXT, -- thumbnail
  vote_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id) -- one submission per member per contest
);

-- Design Contest Votes
CREATE TABLE IF NOT EXISTS design_contest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES design_contest_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, user_id) -- one vote per member per submission
);
```

RLS: Guild/Tribe data viewable by all. Membership management by leaders. Treasury by members. Contest submissions/votes by authenticated users.

---

## DELIVERABLE 2: Hooks

### New Files
- `src/hooks/useGuilds.ts` — useGuilds(), useGuild(slug), useCreateGuild(), useJoinGuild(), useLeaveGuild()
- `src/hooks/useTribes.ts` — useTribes(), useTribe(slug), useCreateTribe(), useJoinTribe(), useLeaveTribe(), useMyTribes()
- `src/hooks/useGroupTreasury.ts` — useTreasury(type, id), useContribute(), useRequestSpend()
- `src/hooks/useDesignContests.ts` — useContests(groupType, groupId), useCreateContest(), useSubmitDesign(), useVoteDesign()

---

## DELIVERABLE 3: Cold Start Hub — Six Pathways

### Modified File
- `src/pages/ColdStartHub.tsx` — Add two new cards:

Card 5: **Guild** (purple gradient, Users icon)
- "Build Your Craft Together"
- Routes to `/start/cold-start/guild`

Card 6: **Tribe** (gold/amber gradient, Heart/Home icon)
- "Gather Your People"
- Routes to `/start/cold-start/tribe`

### New Files
- `src/pages/GuildFormationWizard.tsx` — 5-step wizard: Define → Banner → Recruit → Fund → First Contest
- `src/pages/TribeFormationWizard.tsx` — 5-step wizard: Name → Invite → Set Table → Seed Treasury → First Banner

### Layout
Change ColdStartHub from 2×2 grid to 3×2 grid (3 columns on desktop, 1 on mobile). Six cards with staggered animation.

---

## DELIVERABLE 4: Guild & Tribe Directory Pages

### New Files
- `src/pages/GuildDirectory.tsx` — `/guilds` — Browse all guilds with banner previews, member counts, active contest indicators
- `src/pages/GuildDetail.tsx` — `/guilds/:slug` — Guild page with banner, description, member list, treasury status, active contests, join button
- `src/pages/TribeDirectory.tsx` — `/tribes` — Browse all tribes filtered by type (Family/Neighborhood/Interest/Cultural)
- `src/pages/TribeDetail.tsx` — `/tribes/:slug` — Tribe page with same structure as Guild

---

## DELIVERABLE 5: Design Contest Pages

### New Files
- `src/pages/DesignContestPage.tsx` — `/guilds/:slug/contests/:contestId` or `/tribes/:slug/contests/:contestId`
- Shows: contest brief, prize pool, deadline, submissions gallery, vote buttons, current leader

### Reuse
- Contest voting UI can reuse patterns from `ContestDirectory.tsx` and `ContestEntryForm.tsx` (K120)

---

## DELIVERABLE 6: Navigation + Routes

### App.tsx
- 6 new lazy imports + 6 new routes (guild wizard, tribe wizard, guild directory, guild detail, tribe directory, tribe detail)
- Design contest routes nested under guild/tribe

### UnifiedNavigation.tsx
- Add "Guilds" (Users icon) to Network portal sidebar
- Add "Tribes" (Heart icon) to Network portal sidebar

---

## CANONICAL STATS

Update `useCanonicalStats.ts`:
- `innovationCount: 2061`
- `productionSystems: 26`

---

## KEY RULES

- ONE Guild per member (enforced by UNIQUE constraint on guild_members.user_id)
- MANY Tribes per member (no unique constraint on tribe_members.user_id, only on tribe+user pair)
- Family-type Tribes auto-link to Family Table (K130)
- Treasury Credits follow the one-way valve — never cash out
- Banner Contests use Document Voting (reputation-only, no Credits spent to vote)
- Treasury spending above threshold requires guild/tribe member vote
- Theme governance: Personal Override > Active Tribe > Guild > Community Default
- NO securities language in any guild/tribe treasury descriptions

---

FOR THE KEEP.
