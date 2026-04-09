# KNIGHT SESSION 141 — X-Ray Bounty Arena
## Bishop 036 | March 27, 2026
## Innovations: #2023-#2028

---

## CONTEXT

The X-Ray Goggles overlay (K135, #2010) lets members click on any element and submit design proposals. This session GAMIFIES the entire system into a Marks-earning error-hunting game with daily trackers, tiered rewards, competitive design auctions, and self-generating bounties. This is Production System #28.

**Depends on:** K135 (Design Democracy, element_overlays table), K133 (Guild/Tribe), K131 (Programmable Card for bounty marketplace), Marks currency system.

---

## DELIVERABLE 1: Migration — `20260327000012_xray_bounty_arena.sql`

```sql
-- K141: X-Ray Bounty Arena (Innovations #2023-#2028)

-- Error reports (Tier 1: Find)
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  element_selector TEXT,
  element_screenshot_url TEXT,
  error_type TEXT NOT NULL CHECK (error_type IN (
    'visual','layout','typo','broken','accessibility','performance','other'
  )),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open','documented','fix_proposed','fix_accepted','resolved','duplicate','invalid'
  )),
  marks_allocated NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read error reports" ON error_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users create error reports" ON error_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters manage own reports" ON error_reports FOR UPDATE
  USING (auth.uid() = reporter_id);

-- Error documentation (Tier 2: Document)
CREATE TABLE IF NOT EXISTS error_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL REFERENCES error_reports(id) ON DELETE CASCADE,
  documenter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  expected_behavior TEXT,
  browser_info TEXT,
  device_info TEXT,
  steps_to_reproduce TEXT,
  severity TEXT CHECK (severity IN ('critical','major','minor','cosmetic')),
  marks_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_documentation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read documentation" ON error_documentation FOR SELECT USING (true);
CREATE POLICY "Authenticated users create documentation" ON error_documentation FOR INSERT
  WITH CHECK (auth.uid() = documenter_id);

-- Fix proposals (Tier 3: Fix)
CREATE TABLE IF NOT EXISTS fix_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL REFERENCES error_reports(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fix_type TEXT NOT NULL CHECK (fix_type IN ('css','content','layout','functional','other')),
  proposed_css TEXT,
  proposed_html TEXT,
  proposed_content TEXT,
  description TEXT NOT NULL,
  marks_earned NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending','approved','rejected','implemented'
  )),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fix_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fix proposals" ON fix_proposals FOR SELECT USING (true);
CREATE POLICY "Authenticated users create fix proposals" ON fix_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

-- Bounties (self-generating)
CREATE TABLE IF NOT EXISTS error_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES error_reports(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  marks_reward NUMERIC NOT NULL DEFAULT 0,
  marks_pool NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','fulfilled','expired','cancelled')),
  fulfilled_by UUID REFERENCES profiles(id),
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bounties" ON error_bounties FOR SELECT USING (true);
CREATE POLICY "Authenticated users create bounties" ON error_bounties FOR INSERT
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators manage own bounties" ON error_bounties FOR UPDATE
  USING (auth.uid() = creator_id);

-- Bounty contributions (community amplification)
CREATE TABLE IF NOT EXISTS bounty_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID NOT NULL REFERENCES error_bounties(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_amount NUMERIC NOT NULL CHECK (marks_amount > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bounty_id, contributor_id)
);

ALTER TABLE bounty_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read contributions" ON bounty_contributions FOR SELECT USING (true);
CREATE POLICY "Authenticated users contribute" ON bounty_contributions FOR INSERT
  WITH CHECK (auth.uid() = contributor_id);

-- Design auction entries
CREATE TABLE IF NOT EXISTS design_auction_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fix_proposal_id UUID REFERENCES fix_proposals(id) ON DELETE CASCADE,
  element_overlay_id UUID REFERENCES element_overlays(id) ON DELETE CASCADE,
  submitter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auction_cycle DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  nickname TEXT,
  bid_total NUMERIC DEFAULT 0,
  display_duration_seconds INTEGER DEFAULT 10,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE design_auction_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read auction entries" ON design_auction_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users submit entries" ON design_auction_entries FOR INSERT
  WITH CHECK (auth.uid() = submitter_id);

-- Auction bids (Marks-weighted governance votes)
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES design_auction_entries(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_weight NUMERIC NOT NULL CHECK (marks_weight > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, bidder_id)
);

ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bids" ON auction_bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users bid" ON auction_bids FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

-- Daily tracker (per-user daily stats)
CREATE TABLE IF NOT EXISTS xray_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  errors_found INTEGER DEFAULT 0,
  errors_documented INTEGER DEFAULT 0,
  fixes_proposed INTEGER DEFAULT 0,
  bounties_created INTEGER DEFAULT 0,
  bounties_fulfilled INTEGER DEFAULT 0,
  marks_earned NUMERIC DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stat_date)
);

ALTER TABLE xray_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stats" ON xray_daily_stats FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON xray_daily_stats FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_page ON error_reports(page_url);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON error_bounties(status);
CREATE INDEX IF NOT EXISTS idx_auction_cycle ON design_auction_entries(auction_cycle, is_winner);
CREATE INDEX IF NOT EXISTS idx_xray_stats_user_date ON xray_daily_stats(user_id, stat_date);
```

---

## DELIVERABLE 2: Hooks — `useXRayBountyArena.ts`

Create `/src/hooks/useXRayBountyArena.ts` with:

```typescript
// Combined hook file for all X-Ray Bounty Arena functionality

// useErrorReports — CRUD for error_reports + auto-screenshot
// - reportError(pageUrl, elementSelector, errorType) → creates report + coin animation trigger
// - getOpenErrors(pageUrl?) → list errors, optionally filtered by page
// - getMyReports() → user's own reports
// - updateErrorStatus(id, status) → update status

// useErrorDocumentation — Tier 2 documentation
// - documentError(errorId, description, severity, ...) → create documentation
// - getDocumentation(errorId) → list documentation for an error
// - getMyDocumentation() → user's documentation history

// useFixProposals — Tier 3 fix proposals
// - proposeFix(errorId, fixType, description, proposedCss?, proposedHtml?, proposedContent?) → create proposal
// - getProposals(errorId) → list proposals for an error
// - approveProposal(proposalId) → mark as approved
// - getMyProposals() → user's proposals

// useBounties — Self-generating bounty system
// - createBounty(title, description, marksReward, errorId?, expiresAt?) → create bounty
// - contributeToBounty(bountyId, marksAmount) → add Marks to pool
// - fulfillBounty(bountyId, fixProposalId?) → claim fulfillment
// - getOpenBounties() → marketplace listing
// - getMyBounties() → user's created bounties

// useDesignAuction — Auction mechanics
// - submitEntry(fixProposalId?, overlayId?, title, nickname?) → submit to today's auction
// - bidOnEntry(entryId, marksWeight) → place bid
// - getTodayAuction() → current cycle entries
// - getAuctionWinners(startDate?, endDate?) → historical winners
// - getCurrentWinner(elementSelector?) → what's currently displayed

// useDailyTracker — Daily stats + streak + coin animation
// - getDailyStats() → today's stats
// - getStreak() → consecutive days
// - incrementStat(statType) → bump counter + trigger coin animation
// - getLeaderboard(period: 'daily' | 'weekly' | 'monthly') → top contributors
```

Each sub-hook manages its own Supabase queries. Export individually AND as a combined `useXRayBountyArena()` that returns all sub-hooks.

---

## DELIVERABLE 3: Coin Animation Component — `CoinFlipAnimation.tsx`

Create `/src/components/xray/CoinFlipAnimation.tsx`:

- **Visual:** Gold coin (LB logo or Marks "M" symbol) that flips upward from the click point, Mario-style
- **Animation:** CSS keyframe — coin appears at click coordinates, spins on Y-axis while rising ~60px, then fades out. Duration: ~800ms.
- **Sound toggle:** Check user settings for `xray_coin_sound` preference
  - If ON: play a short coin sound effect (use Web Audio API to generate a simple chime — TWO quick ascending tones, ~100ms total, no external audio file needed)
  - If OFF (default): silent animation only
  - Toggle accessible from X-Ray settings panel
- **Marks amount:** Display "+1M" (or earned amount) next to the coin during animation
- **Trigger:** Exported function `triggerCoinFlip(x, y, amount)` that any error-report action can call

The sound should be GENERATED via Web Audio API (OscillatorNode), not a loaded file. Two quick ascending sine wave blips — think NES coin sound. This keeps the bundle small and avoids audio file management.

---

## DELIVERABLE 4: X-Ray Bounty Dashboard — `XRayBountyDashboard.tsx`

Create `/src/pages/XRayBountyDashboard.tsx` at route `/dashboard/bounty-arena`:

**Layout (3 tabs):**

**Tab 1: "My Stats"**
- Daily tracker card: errors found / documented / fixes proposed today
- Marks earned today (large number, coin icon)
- Streak counter (flame icon + consecutive days)
- Role badge: Scout / Scribe / Fixer / All-Rounder (based on where most Marks earned)
- Weekly sparkline chart of daily Marks
- Sound toggle switch for coin effect

**Tab 2: "Bounty Board"**
- List of open bounties, sorted by reward size
- Each bounty shows: title, description, Marks reward, pool total, number of contributors, expiry
- "Create Bounty" button → modal with title, description, Marks stake, optional error link, expiry date
- "Contribute" button on each bounty → add Marks to pool
- "I Can Fix This" button → links to Tier 3 fix proposal flow
- Filter: All / My Created / My Fulfilled

**Tab 3: "Auction"**
- Current cycle entries in a horizontal carousel
- Each entry shows as a card with: title, nickname, preview thumbnail, current bid total, submitter
- "Bid" button on each card → pledge Marks weight
- Timer showing time remaining in current 24-hour cycle
- Previous winners gallery (scrollable history)
- "My Display Preference" dropdown: Classic / Current Winner / Specific Submission (by serial or nickname)

**Navigation:** Add "Bounty Arena" (Trophy icon) to the dashboard sidebar.

---

## DELIVERABLE 5: X-Ray Error Overlay Enhancement — Update `XRayOverlay.tsx`

Enhance the existing X-Ray overlay from K135 with bounty game actions:

When a member clicks an element in X-Ray mode, the overlay popup now shows:

1. **"Report Error"** (Tier 1) — One click. Auto-captures: page URL, element selector, screenshot. Triggers coin flip animation. FAST.
2. **"Document This"** (Tier 2) — Opens inline form: description, severity, steps to reproduce. More Marks.
3. **"Propose Fix"** (Tier 3) — Opens the Design Democracy editor (existing from K135) with fix proposal fields. Most Marks.
4. **"Create Bounty"** — Opens bounty creation modal, pre-linked to this element.
5. **"View Reports"** — Shows existing error reports and bounties for this element.

Each action that earns Marks triggers the coin flip animation at the click point.

The floating daily tracker widget appears when X-Ray mode is active:
- Compact pill in bottom-right: "🪙 12M today | 🔥 5 days"
- Expandable to show full daily breakdown
- Collapsible back to pill

---

## DELIVERABLE 6: Design Auction Event Page — `DesignAuctionPage.tsx`

Create `/src/pages/DesignAuctionPage.tsx` at route `/auction`:

**Auction Viewer:**
- Full-screen card display mode
- Each proposed change shows for **10 seconds** with a countdown timer
- Auto-advances to next entry (like a slideshow)
- Bid button overlaid on each card — click to pledge Marks
- Pause/resume controls
- Can be run synchronously (daily event at scheduled time) or async (browse anytime)

**Winner Display:**
- Current winning design shown prominently at top
- "Displayed until replaced" indicator
- History of past winners with dates

**My Preferences:**
- Radio buttons: Classic / Current Winner / By Submission # / By Nickname
- Search box for finding specific submissions
- Preview of selected preference

---

## DELIVERABLE 7: Routes, Navigation, and Stats

**Routes (add to App.tsx with lazy imports):**
```
/dashboard/bounty-arena → XRayBountyDashboard
/auction → DesignAuctionPage
```

**Navigation:**
- Dashboard sidebar: "Bounty Arena" with Trophy icon
- Marketplace sidebar: "Design Auction" with Gavel icon

**Stats:** Update `useCanonicalStats.ts`:
- innovationCount: 2063 → **2069**
- productionSystems: 27 → **28**
- crownJewels: 137 → **140**

---

## CRITICAL RULES

1. **Marks are NOT spent in auction bidding.** They're pledged as governance weight. This is voting, not purchasing.
2. **C+20% floor applies** to any bounty rewards that involve Credits.
3. **Coin sound is OFF by default.** Accessibility first. Users opt IN.
4. **Self-fulfillment is allowed** on bounties. Creator gets Marks back if they fulfill their own.
5. **Daily tracker resets at midnight LOCAL time** (not UTC).
6. **Auction cycle is 24 hours**, starting at midnight UTC.
7. **Winner displayed until replaced** — not time-limited. But users can override in their preferences.

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `supabase/migrations/20260327000012_xray_bounty_arena.sql` | CREATE |
| 2 | `src/hooks/useXRayBountyArena.ts` | CREATE |
| 3 | `src/components/xray/CoinFlipAnimation.tsx` | CREATE |
| 4 | `src/pages/XRayBountyDashboard.tsx` | CREATE |
| 5 | `src/components/xray/XRayOverlay.tsx` | MODIFY (add bounty actions) |
| 6 | `src/pages/DesignAuctionPage.tsx` | CREATE |
| 7 | `src/App.tsx` | MODIFY (routes) |
| 8 | `src/components/layout/DashboardSidebar.tsx` | MODIFY (nav) |
| 9 | `src/hooks/useCanonicalStats.ts` | MODIFY (2069/28/140) |

**9 files (6 new, 3 modified). Production System #28: X-Ray Bounty Arena.**

---

**FOR THE KEEP.** 🏰
