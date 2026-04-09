# Knight Session 133 — Guild & Tribe System + Six-Path Cold Start + Banner Contests

**Priority:** HIGH
**Innovations:** #2014-#2020
**Depends on:** K128 (Cold Start Hub), K120 (Contest Pipeline), K129 (Captain's Dashboard)
**CORRECTED:** March 27, 2026 — MANY Guilds per member (not one). Guild = professional, Tribe = personal. Both allow multiple membership.

---

## MISSION

Build the Guild and Tribe system. Extend the Cold Start Hub from 4 pathways to 6 (add Guild + Tribe). Create Guild/Tribe treasury, Banner Contests, and visual identity infrastructure. Connect Family-type Tribes to Family Table (K130).

---

## DELIVERABLE 1: Migration — Guild & Tribe Tables

```sql
-- Guilds (professional groups)
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  guild_type TEXT NOT NULL, -- 'makers', 'designers', 'farmers', 'drivers', 'tutors', 'captains', 'developers', 'artists', 'other'
  leader_id UUID REFERENCES auth.users(id) NOT NULL,
  banner_url TEXT,
  icon_url TEXT,
  mascot_url TEXT,
  color_primary TEXT DEFAULT '#7c3aed',
  color_secondary TEXT,
  theme_css TEXT,
  treasury_credits INTEGER NOT NULL DEFAULT 0,
  treasury_reserve_pct NUMERIC NOT NULL DEFAULT 0.10,
  spending_threshold INTEGER NOT NULL DEFAULT 50,
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tribes (personal groups)
CREATE TABLE IF NOT EXISTS tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tribe_type TEXT NOT NULL CHECK (tribe_type IN ('family', 'neighborhood', 'interest', 'cultural', 'hybrid')),
  elder_id UUID REFERENCES auth.users(id) NOT NULL,
  banner_url TEXT,
  icon_url TEXT,
  mascot_url TEXT,
  color_primary TEXT DEFAULT '#d97706',
  color_secondary TEXT,
  theme_css TEXT,
  treasury_credits INTEGER NOT NULL DEFAULT 0,
  treasury_reserve_pct NUMERIC NOT NULL DEFAULT 0.10,
  spending_threshold INTEGER NOT NULL DEFAULT 50,
  family_table_id UUID,
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guild Membership — MANY guilds per member
CREATE TABLE IF NOT EXISTS guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id) -- one membership per guild, MANY guilds per member
);

-- Tribe Membership — MANY tribes per member
CREATE TABLE IF NOT EXISTS tribe_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('elder', 'keeper', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tribe_id, user_id) -- one membership per tribe, MANY tribes per member
);

-- Treasury Transactions (shared for guilds and tribes)
CREATE TABLE IF NOT EXISTS group_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('contribution', 'contest_prize', 'purchase', 'bounty', 'event', 'reserve_access')),
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  description TEXT,
  approved_by UUID REFERENCES auth.users(id),
  vote_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Design Contests
CREATE TABLE IF NOT EXISTS design_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL,
  contest_type TEXT NOT NULL CHECK (contest_type IN ('banner', 'theme', 'mascot', 'icon', 'color_palette', 'seasonal')),
  title TEXT NOT NULL,
  description TEXT,
  prize_credits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'voting', 'decided', 'cancelled')),
  submissions_close_at TIMESTAMPTZ,
  voting_close_at TIMESTAMPTZ,
  winner_submission_id UUID,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contest Submissions
CREATE TABLE IF NOT EXISTS design_contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES design_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  asset_url TEXT NOT NULL,
  preview_url TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- Contest Votes
CREATE TABLE IF NOT EXISTS design_contest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES design_contest_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, user_id)
);
```

---

## DELIVERABLE 2: Hooks

- `src/hooks/useGuilds.ts` — useGuilds(), useGuild(slug), useCreateGuild(), useJoinGuild(), useLeaveGuild(), useMyGuilds()
- `src/hooks/useTribes.ts` — useTribes(), useTribe(slug), useCreateTribe(), useJoinTribe(), useLeaveTribe(), useMyTribes()
- `src/hooks/useGroupTreasury.ts` — useTreasury(type, id), useContribute(), useRequestSpend()
- `src/hooks/useDesignContests.ts` — useContests(groupType, groupId), useCreateContest(), useSubmitDesign(), useVoteDesign()

---

## DELIVERABLE 3: Cold Start Hub — Six Pathways

Modify `ColdStartHub.tsx`: Add Card 5 (Guild, purple) and Card 6 (Tribe, gold). 3×2 grid on desktop, 1-col on mobile.

New: `GuildFormationWizard.tsx` — 5 steps: Define → Banner → Recruit → Fund → First Contest
New: `TribeFormationWizard.tsx` — 5 steps: Name → Invite → Set Table → Seed → First Banner

---

## DELIVERABLE 4: Directory + Detail Pages

- `/guilds` — GuildDirectory (browse, banner previews, member counts)
- `/guilds/:slug` — GuildDetail (banner, members, treasury, contests, join)
- `/tribes` — TribeDirectory (filter by type)
- `/tribes/:slug` — TribeDetail (same structure)

---

## DELIVERABLE 5: Design Contest Page

- `/guilds/:slug/contests/:contestId` or `/tribes/:slug/contests/:contestId`
- Reuse patterns from K120 ContestDirectory/ContestEntryForm

---

## DELIVERABLE 6: Navigation + Routes

6 lazy imports + 6 routes in App.tsx. "Guilds" + "Tribes" in Network portal nav.

---

## KEY RULES

- **MANY Guilds per member** (professional — you can be a designer AND a farmer)
- **MANY Tribes per member** (personal — family AND neighborhood AND interest)
- **Guild = professional. Tribe = personal.** That's the distinction.
- Family-type Tribes auto-link to Family Table (K130)
- Treasury Credits: one-way valve, never cash out
- Banner Contests: Document Voting (reputation-only)
- Theme governance: Personal Override > Active Tribe > Active Guild > Community Default
- NO securities language

---

FOR THE KEEP.
