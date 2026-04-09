# KNIGHT SESSION 120: Capstone Terrain Contest Infrastructure + Stripe Connect Integration

## Brief
Call `brief_me("capstone terrain contest, stripe connect, payment infrastructure, design contest pipeline")`

## Context
K116: Turn-Key + Cue Cards (DEPLOYED). K117: Red Carpet Showcase (DEPLOYED). K118: Treasure Maps (queued). K119: Social Import (queued). K120 builds two critical pieces:

1. **Capstone Contest Infrastructure** (#1958) — The first design contest, targeting r/TerrainBuilding. Contest entries ARE Turn-Key projects. Votes ARE demand signals. Every contestant is onboarded.
2. **Stripe Connect** — Real payment infrastructure. Without this, Credits are database numbers. With this, Credits are real dollars.

Canonical stats: 2,000 innovations | 1,511 claims | 10 provisionals | 22 production systems

**CRITICAL RULE:** Platform tokens/credits are NOT securities. Never use investment language.

## Deliverable 1: Contest Infrastructure

### Migration: `20260326000015_contests.sql`
```sql
CREATE TABLE IF NOT EXISTS platform_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  rules TEXT NOT NULL,
  
  -- Contest type
  craft_type TEXT NOT NULL,
  portal TEXT DEFAULT 'marketplace',
  
  -- Timeline
  submission_start TIMESTAMPTZ NOT NULL,
  submission_end TIMESTAMPTZ NOT NULL,
  voting_start TIMESTAMPTZ NOT NULL,
  voting_end TIMESTAMPTZ NOT NULL,
  
  -- Prizes
  prize_description TEXT NOT NULL,
  winner_production BOOLEAN DEFAULT true, -- winning design enters production
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'submissions_open', 'voting_open', 'judging', 'complete')),
  
  -- Results
  winner_project_id UUID REFERENCES turnkey_projects(id),
  runner_up_ids JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES platform_contests(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Entry metadata
  entry_statement TEXT, -- "Why I designed this"
  
  -- Voting
  vote_count INT DEFAULT 0,
  pledge_total INT DEFAULT 0,
  
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_id, user_id) -- one entry per user per contest
);

CREATE TABLE IF NOT EXISTS contest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES platform_contests(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES contest_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  vote_type TEXT DEFAULT 'want' CHECK (vote_type IN ('want', 'pledge')),
  credits_pledged INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_id, entry_id, user_id)
);

ALTER TABLE platform_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contests" ON platform_contests FOR SELECT USING (true);
CREATE POLICY "Anyone can view entries" ON contest_entries FOR SELECT USING (true);
CREATE POLICY "Users manage own entries" ON contest_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view votes" ON contest_votes FOR SELECT USING (true);
CREATE POLICY "Users manage own votes" ON contest_votes FOR ALL USING (auth.uid() = user_id);

-- Seed the first contest: Capstone Terrain Design
INSERT INTO platform_contests (title, slug, description, rules, craft_type, portal, submission_start, submission_end, voting_start, voting_end, prize_description) VALUES (
  'Capstone Terrain Design Contest',
  'capstone-terrain-2026',
  'Design a Capstone terrain module for the SlottedTop hex system. Your design could be the next piece in the HexIsle collection — produced and sold with you earning from every unit.',
  E'1. Create a free account on Liana Banyan ($5/year membership required to submit)\n2. Create a Turn-Key Project with your Capstone design\n3. Include at least 3 photos or renders of your design\n4. Describe how your Capstone uses pass-through connection points\n5. One entry per person\n6. You retain full ownership of your design\n7. Winning design enters production — you earn from every unit sold',
  'terrain',
  'hexisle',
  now() + interval '7 days',
  now() + interval '35 days',
  now() + interval '35 days',
  now() + interval '49 days',
  'Winning design enters the HexIsle production pipeline. Designer earns from every unit sold through the Tiered Production Cascade. Runner-up designs receive featured placement on the marketplace.'
) ON CONFLICT (slug) DO NOTHING;
```

### Pages

**`/contests` — Contest Directory**
- Lists all active and upcoming contests
- Each contest card shows: title, craft type, timeline, entry count, prize info
- Filter by portal (all, hexisle, marketplace, etc.)

**`/contests/:slug` — Contest Detail**
- Contest description, rules, timeline with visual progress bar
- Entry gallery: grid of Turn-Key project cards (contest entries)
- Vote/pledge buttons on each entry (during voting phase)
- Leaderboard: top entries by vote count + pledge total
- "Enter This Contest" button → routes to /projects/create with contest_id param

**`/contests/:slug/enter` — Contest Entry Flow**
- If user has no account: signup prompt ($5/year)
- If user has account: routes to Turn-Key wizard with contest_id pre-set
- Entry form adds "entry_statement" field ("Why I designed this")
- On submit: creates Turn-Key project + contest_entry record

### Components
- `ContestCard.tsx` — Card for contest directory
- `ContestDetail.tsx` — Full contest page with entries and voting
- `ContestEntryGallery.tsx` — Grid of contest entries (Turn-Key project cards with vote counts)
- `ContestLeaderboard.tsx` — Ranked list of entries by votes + pledges
- `ContestVoteButton.tsx` — Vote/pledge button for entries
- `ContestTimeline.tsx` — Visual timeline showing submission/voting/judging phases
- `ContestEntryForm.tsx` — Entry statement + link to Turn-Key wizard

### Hooks
- `useContests()` — fetch all contests
- `useContest(slug)` — fetch single contest with entries
- `useContestEntries(contestId)` — fetch entries with vote counts
- `useVoteEntry()` — mutation for voting/pledging on an entry
- `useSubmitEntry()` — mutation for submitting a contest entry

## Deliverable 2: Stripe Connect Foundation

### Migration: `20260326000016_stripe_connect.sql`
```sql
-- Stripe Connect account linking
CREATE TABLE IF NOT EXISTS creator_stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  stripe_account_id TEXT NOT NULL,
  account_type TEXT DEFAULT 'express' CHECK (account_type IN ('standard', 'express', 'custom')),
  
  -- Onboarding status
  onboarding_complete BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  
  -- Platform fee
  platform_fee_pct NUMERIC(5,2) DEFAULT 20.00, -- Cost+20%
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit purchase records (when users buy Credits with real money)
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_credits INT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payout records (when creators receive money)
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES turnkey_projects(id),
  amount_credits INT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  platform_fee_usd NUMERIC(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE creator_stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stripe account" ON creator_stripe_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own purchases" ON credit_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own payouts" ON creator_payouts FOR SELECT USING (auth.uid() = user_id);
```

### Supabase Edge Functions

**`stripe-connect-onboard`** — Creates Stripe Express account and returns onboarding link
**`stripe-create-checkout`** — Creates Stripe Checkout session for buying Credits
**`stripe-webhook`** — Handles Stripe webhooks (payment_intent.succeeded, account.updated, transfer.created)

### Pages

**`/dashboard/payments` — Creator Payment Dashboard**
- Stripe Connect status (connected / needs onboarding / pending verification)
- "Connect Stripe" button → initiates Express onboarding flow
- Payout history: list of payouts with amounts, dates, status
- Available balance (Credits that can be paid out)

**`/buy-credits` — Buy Credits Page**
- Simple pricing: $1 = 1 Credit
- Quantity selector: 10, 25, 50, 100, 250, 500, Custom
- "Buy Credits" button → Stripe Checkout session
- Purchase history below

### Components
- `StripeConnectStatus.tsx` — Shows connection status + onboard button
- `PayoutHistory.tsx` — Table of creator payouts
- `BuyCreditsForm.tsx` — Credit purchase with Stripe Checkout
- `CreditBalance.tsx` — Shows user's current Credit balance prominently

### Hooks
- `useStripeAccount()` — fetch creator's Stripe Connect status
- `useStartOnboarding()` — mutation to initiate Stripe Express onboarding
- `useBuyCredits()` — mutation to create Stripe Checkout session
- `usePayoutHistory()` — fetch payout records
- `useCreditBalance()` — fetch current Credit balance

## Deliverable 3: Navigation + Wiring

### App.tsx Routes
```tsx
<Route path="/contests" element={<ExplorerRoute><ContestDirectory /></ExplorerRoute>} />
<Route path="/contests/:slug" element={<ExplorerRoute><ContestDetail /></ExplorerRoute>} />
<Route path="/dashboard/payments" element={<ProtectedRoute><PaymentDashboard /></ProtectedRoute>} />
<Route path="/buy-credits" element={<ProtectedRoute><BuyCreditsPage /></ProtectedRoute>} />
```

### UnifiedNavigation
- Add "Contests" → `/contests` under Community section
- Add "Buy Credits" → `/buy-credits` (visible when logged in)

### Canonical Stats
- `innovationCount: 2000` (milestone!)
- `crownJewels: 130`
- `productionSystems: 22`

## Build + Deploy
Build and deploy all 8 hosting targets when complete.

## Quality Checks
- [ ] Contest directory lists upcoming/active contests
- [ ] Contest detail shows entries with vote counts
- [ ] Entering a contest creates a Turn-Key project + contest entry
- [ ] Voting during voting phase increments counts
- [ ] Pledge on contest entry creates escrow record
- [ ] Stripe Connect onboarding flow initiates correctly
- [ ] Credit purchase creates Checkout session
- [ ] Buy Credits page shows purchase history
- [ ] Creator payment dashboard shows connection status
- [ ] canonical stats show 2,000 innovations
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
