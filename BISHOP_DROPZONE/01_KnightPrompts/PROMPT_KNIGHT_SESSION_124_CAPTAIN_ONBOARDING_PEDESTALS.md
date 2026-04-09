# KNIGHT SESSION 124: Captain Onboarding System + Leadership Pedestals + The 300 Integration

## Brief
Call `brief_me("captain onboarding, skin in the game, leadership tiers, pedestals, the 300 integration, moses model")`

## Context
K116-K118 deployed. K119-K123 queued. K124 builds the governance onramp — the system that lets the Founder scale from "one guy" to "distributed cooperative leadership." This is the Moses model: leaders of 10s, 50s, 100s, 1000s, all self-selected through skin in the game.

Simultaneously, this builds the Pedestal system that integrates with Crown Letters — so the 300 strategic allies can SEE their seats before they accept.

Canonical stats: 2,007 innovations | 1,511 claims | 10 provisionals | 23 production systems

**CRITICAL RULE:** No securities language. Captains are operational leaders, not investors.

## Deliverable 1: Captain System Data Model

### Migration: `20260326000018_captain_system.sql`
```sql
-- Captain profiles (operational leaders)
CREATE TABLE IF NOT EXISTS captains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  
  -- Captain level (Moses model)
  level TEXT DEFAULT 'captain_10' CHECK (level IN (
    'captain_10', 'captain_50', 'captain_100', 'captain_1000'
  )),
  
  -- Staking
  marks_staked INT DEFAULT 0,
  joules_backing INT DEFAULT 0,
  
  -- Performance
  orders_managed INT DEFAULT 0,
  orders_fulfilled INT DEFAULT 0,
  fulfillment_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Reputation (integrates with ADAPT Score)
  reputation_score NUMERIC(5,2) DEFAULT 50.0,
  
  -- Geography
  region TEXT,
  city TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'probation', 'suspended', 'graduated')),
  
  -- Ship Medallion
  medallion_produced BOOLEAN DEFAULT false,
  medallion_qr_code TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Captain level requirements
CREATE TABLE IF NOT EXISTS captain_level_requirements (
  level TEXT PRIMARY KEY,
  min_marks_staked INT NOT NULL,
  min_orders_fulfilled INT NOT NULL,
  min_fulfillment_rate NUMERIC(5,2) NOT NULL,
  min_reputation_score NUMERIC(5,2) NOT NULL,
  max_concurrent_orders INT NOT NULL
);

INSERT INTO captain_level_requirements VALUES
  ('captain_10', 100, 0, 0, 50, 10),
  ('captain_50', 500, 10, 85, 60, 50),
  ('captain_100', 2000, 50, 90, 70, 100),
  ('captain_1000', 10000, 100, 95, 80, 1000)
ON CONFLICT DO NOTHING;

-- Order assignments (Captain manages batches)
CREATE TABLE IF NOT EXISTS captain_order_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id UUID REFERENCES captains(id) NOT NULL,
  
  -- What's being managed
  project_id UUID REFERENCES turnkey_projects(id),
  batch_description TEXT NOT NULL,
  total_units INT NOT NULL,
  total_fiat_value NUMERIC(10,2) NOT NULL,
  
  -- Staking (Captain's collateral)
  marks_staked INT NOT NULL,
  
  -- Delivery tracking
  recipients_total INT NOT NULL,
  confirmations_received INT DEFAULT 0,
  confirmation_threshold NUMERIC(5,2) DEFAULT 33.33, -- 1/3 rule
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'shipped', 'confirmed', 'failed', 'disputed'
  )),
  
  -- Deadlines
  fulfillment_deadline TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery confirmations
CREATE TABLE IF NOT EXISTS delivery_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES captain_order_assignments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  confirmed BOOLEAN DEFAULT true,
  issue_reported TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);

-- Leadership Pedestals (Crown seats + The 300)
CREATE TABLE IF NOT EXISTS leadership_pedestals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The seat
  seat_title TEXT NOT NULL,
  seat_type TEXT NOT NULL CHECK (seat_type IN (
    'crown', 'board', 'advisory', 'ambassador', 'captain_regional'
  )),
  initiative TEXT, -- e.g., "Let's Make Dinner", "Defense Klaus"
  
  -- Who's invited
  invited_name TEXT NOT NULL,
  invited_description TEXT,
  invited_image_url TEXT,
  letter_summary TEXT, -- Public summary of the ask
  
  -- Community support
  support_count INT DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'invited' CHECK (status IN (
    'invited', 'accepted', 'active', 'declined', 'open'
  )),
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  
  -- The 300 classification
  tier TEXT CHECK (tier IN ('shield', 'spear', 'phalanx')),
  circle TEXT CHECK (circle IN (
    'patrons', 'media', 'academics', 'initiative_leaders', 'amplifiers', 'infrastructure'
  )),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedestal support signals (like Red Carpet demand signals)
CREATE TABLE IF NOT EXISTS pedestal_support_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedestal_id UUID REFERENCES leadership_pedestals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  signal_type TEXT DEFAULT 'support' CHECK (signal_type IN ('support', 'comment')),
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pedestal_id, user_id, signal_type)
);

ALTER TABLE captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_pedestals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedestal_support_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view captains" ON captains FOR SELECT USING (true);
CREATE POLICY "Users manage own captain profile" ON captains FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view pedestals" ON leadership_pedestals FOR SELECT USING (true);
CREATE POLICY "Anyone can view support signals" ON pedestal_support_signals FOR SELECT USING (true);
CREATE POLICY "Users manage own signals" ON pedestal_support_signals FOR ALL USING (auth.uid() = user_id);

-- Seed initial Crown Pedestals from The 300
INSERT INTO leadership_pedestals (seat_title, seat_type, initiative, invited_name, invited_description, tier, circle, status) VALUES
  ('Provisioner Mentor', 'crown', 'Let''s Get Groceries', 'José Andrés', 'Founder of World Central Kitchen. Bipartisan respect. Feeds the world.', 'shield', 'initiative_leaders', 'invited'),
  ('Grand Chef Mentor', 'crown', 'Let''s Make Dinner', 'Maneet Chauhan', 'James Beard Foundation. Food Network Iron Chef. Nashville restaurateur.', 'shield', 'initiative_leaders', 'invited'),
  ('First Shield Mentor', 'crown', 'Defense Klaus', 'Ruth Glenn', 'CEO of National Coalition Against Domestic Violence.', 'shield', 'initiative_leaders', 'invited'),
  ('First Shield Knight UK', 'crown', 'Defense Klaus', 'Robert Kaiser', 'UK domestic violence advocate and security expert.', 'shield', 'initiative_leaders', 'invited'),
  ('Responder General', 'crown', 'Rally Group', 'Kimberly Williams', 'Crisis response coordinator.', 'shield', 'initiative_leaders', 'invited'),
  ('Apothecary Mentor', 'crown', 'Lifeline Medications', 'Alex Oshmyansky', 'Founder of Mark Cuban Cost Plus Drug Company.', 'shield', 'initiative_leaders', 'invited'),
  ('Lender Mentor', 'crown', 'VSL / Let''s Make Bread', 'Jessica Jackley', 'Co-founder of Kiva. Microfinance pioneer.', 'shield', 'initiative_leaders', 'invited'),
  ('Maker Chancellor', 'crown', 'HexIsle / Manufacturing', 'Dale Dougherty', 'Founder of Make: Magazine and Maker Faire.', 'shield', 'initiative_leaders', 'invited'),
  ('CEO', 'board', 'Liana Banyan Corporation', 'Michael Seibel', 'Former Managing Director, Y Combinator.', 'shield', 'initiative_leaders', 'invited'),
  ('CFO', 'board', 'Liana Banyan Corporation', 'Tom Simon', 'Financial operations leader.', 'shield', 'initiative_leaders', 'invited'),
  ('Infrastructure Chancellor', 'crown', 'Platform Infrastructure', 'Craig Newmark', 'Founder of Craigslist. Civic tech philanthropist.', 'shield', 'infrastructure', 'invited'),
  ('Board Chair', 'board', 'Liana Banyan Corporation', 'MacKenzie Scott', 'Philanthropist. Systems-level giver.', 'shield', 'patrons', 'invited')
ON CONFLICT DO NOTHING;
```

## Deliverable 2: Captain Onboarding Flow

### Page: `/captain/become` — Become a Captain

```
┌────────────────────────────────────────────────────────┐
│  ⚓ Become a Captain                                    │
│                                                         │
│  "A ship in harbor is safe, but that is not what        │
│   ships are BUILT for."                                 │
│                                                         │
│  Captains are local operational leaders who manage      │
│  production, fulfillment, and community in their area.  │
│                                                         │
│  Requirements:                                          │
│  ✅ Active Member ($5/year)                              │
│  ○  Stake 100+ Marks (Joule-backed)                     │
│  ○  Choose your region                                  │
│                                                         │
│  What you do in little, you do in much.                 │
│  Start with 10 orders. Prove yourself. Graduate.        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Captain 10│→ │Captain 50│→ │Cap. 100  │→ │Cap.1000│ │
│  │ 100 Marks│  │ 500 Marks│  │2000 Marks│  │10K Mark│ │
│  │ 10 orders│  │ 50 orders│  │100 orders│  │1K order│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                         │
│  [Stake Marks & Become a Captain →]                     │
└────────────────────────────────────────────────────────┘
```

### Components
- `CaptainOnboardingPage.tsx` — Full page at /captain/become
- `CaptainLevelCards.tsx` — Visual progression cards (10 → 50 → 100 → 1000)
- `CaptainStakeForm.tsx` — Mark staking interface with Joule backing display
- `CaptainDashboard.tsx` — Captain's operational dashboard (orders, fulfillment rate, reputation)
- `ShipMedallionCard.tsx` — The Ship Medallion with quote, QR code, and "Produce Your First Medallion" CTA

### Hooks
- `useCaptain()` — fetch captain profile + level + performance
- `useBecomeCaptain()` — mutation to create captain profile + stake Marks
- `useCaptainOrders()` — fetch managed order assignments
- `useConfirmDelivery()` — mutation for recipients to confirm delivery

## Deliverable 3: Leadership Pedestals Page

### Page: `/the300` — The 300 Strategic Allies (Updated)

The existing /the300 page gets enhanced with the Pedestal system:

```
┌────────────────────────────────────────────────────────┐
│  🏛️ The 300                                             │
│  "We are 300. And behind us, millions more."            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ CROWN SEATS                                      │   │
│  │                                                   │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │ │ 🏛️       │ │ 🏛️       │ │ 🏛️       │          │   │
│  │ │Provision.│ │Grand Chef│ │ First    │          │   │
│  │ │ Mentor   │ │ Mentor   │ │ Shield   │          │   │
│  │ │          │ │          │ │ Mentor   │          │   │
│  │ │ J. Andrés│ │M.Chauhan │ │R. Glenn  │          │   │
│  │ │ INVITED  │ │ INVITED  │ │ INVITED  │          │   │
│  │ │ ⭐ 234   │ │ ⭐ 156   │ │ ⭐ 189   │          │   │
│  │ │[Support] │ │[Support] │ │[Support] │          │   │
│  │ └──────────┘ └──────────┘ └──────────┘          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Progress: 80+ identified / 300 target                  │
│  ████████░░░░░░░░ 27%                                   │
│                                                         │
│  [View All Seats]  [Apply for Captain]                  │
└────────────────────────────────────────────────────────┘
```

### Components
- `PedestalCard.tsx` — Card showing seat, invited person, support count, status
- `PedestalGrid.tsx` — Grid of all pedestals organized by type (Crown, Board, Advisory, Captain)
- `PedestalDetail.tsx` — Full page for a pedestal showing letter summary, support signals, comments
- `SupportButton.tsx` — "Support This Appointment" button (analogous to Red Carpet "I Want This")
- `The300Progress.tsx` — Progress bar showing identified/target counts per tier

### Hooks
- `usePedestals()` — fetch all pedestals with support counts
- `usePedestal(id)` — fetch single pedestal with signals
- `useSupportPedestal()` — mutation for supporting an appointment

## Deliverable 4: Captain + Pedestal Integration

### On each Pedestal, show:
- "Or become a Captain in [Region]" link at the bottom
- Local Captain slots are also Pedestals (type: captain_regional, status: open)
- Anyone can view open Captain slots in their area and claim them

### On the Captain Dashboard, show:
- The Captain's current level + progress toward next
- Link to their Pedestal (if they have one)
- Orders they're managing with delivery confirmation status

## Deliverable 5: Navigation + Wiring

### App.tsx Routes
```tsx
<Route path="/captain/become" element={<ProtectedRoute><CaptainOnboardingPage /></ProtectedRoute>} />
<Route path="/captain/dashboard" element={<ProtectedRoute><CaptainDashboard /></ProtectedRoute>} />
<Route path="/captain/medallion" element={<ShipMedallionPage />} />
<Route path="/the300" element={<The300Page />} />
<Route path="/the300/:pedestalId" element={<PedestalDetailPage />} />
```

### Canonical Stats
- `innovationCount: 2007`
- `productionSystems: 23`

## Build + Deploy all 8 targets.

## Quality Checks
- [ ] Captain onboarding shows level progression + staking requirement
- [ ] Mark staking creates captain profile
- [ ] The 300 page shows Pedestal grid with all seeded Crown seats
- [ ] Support signals work (count + notification)
- [ ] Pedestal detail shows letter summary + community support
- [ ] Captain Dashboard shows orders + fulfillment rate
- [ ] Ship Medallion displays with quote
- [ ] All 8 Firebase targets deployed

## Skin in the Game System Tagline
Display prominently on the Captain page:
> **"What you do in little, you do in much."**

## FOR THE KEEP.
