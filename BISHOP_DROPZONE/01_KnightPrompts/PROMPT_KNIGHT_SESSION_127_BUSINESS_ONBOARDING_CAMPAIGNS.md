# KNIGHT SESSION 127: Universal Business Onboarding Campaign System

## Brief
Call `brief_me("business onboarding, volume discount, captain pitch packet, demand signals, restaurant campaign, local business, cold start")`

## Context
K116-K120 deployed. K121-K126 queued. K127 builds the system that lets ANY community member nominate a local business, aggregate demand via pledges, and generate a Captain's Pitch Packet so a Captain can walk in with the LB Card and close the deal. This is #1972 (Crown Jewel) — the universal business onboarding engine.

**First target:** La Capital del Sabor, Bandera Road, San Antonio. Featured Sunday on mysanantonio.com/food.

Canonical stats: 2,015 innovations | 1,511 claims | 10 provisionals | 23 production systems

**CRITICAL RULES:**
- No securities language.
- Credits can NEVER be cashed out to fiat. One-way valve. Irrevocable.
- LB Card is funded separately (direct deposit/bank transfer), NOT from Credits.

---

## Deliverable 1: Business Campaign Data Model

### Migration: `20260326000019_business_campaigns.sql`
```sql
-- Business onboarding campaigns
CREATE TABLE IF NOT EXISTS business_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The business being recruited
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN (
    'restaurant', 'food_truck', 'bakery', 'catering',
    'barber', 'salon', 'spa',
    'mechanic', 'auto_service',
    'dry_cleaner', 'laundry',
    'grocery', 'convenience',
    'tutoring', 'education',
    'gym', 'fitness',
    'pet_service', 'veterinary',
    'home_service', 'plumbing', 'electrical', 'cleaning',
    'retail', 'other'
  )),
  business_address TEXT,
  business_city TEXT NOT NULL,
  business_state TEXT,
  business_website TEXT,
  business_phone TEXT,
  
  -- Who nominated it
  nominated_by UUID REFERENCES auth.users(id) NOT NULL,
  nomination_reason TEXT, -- "I love their lunch specials" etc.
  
  -- Campaign details
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  proposed_discount_pct NUMERIC(5,2) DEFAULT 10.0,
  image_url TEXT,
  
  -- Demand signals
  pledge_count INT DEFAULT 0,
  pledge_total_credits NUMERIC(10,2) DEFAULT 0,
  pledge_threshold INT DEFAULT 30, -- configurable per campaign
  
  -- Status
  status TEXT DEFAULT 'gathering' CHECK (status IN (
    'gathering',      -- collecting pledges
    'threshold_met',  -- ready for Captain to pitch
    'pitched',        -- Captain has approached
    'accepted',       -- business accepted
    'active',         -- business is onboarded and accepting LB Card
    'declined',       -- business said no
    'expired'         -- 90 days, threshold not met
  )),
  
  -- Captain assignment
  captain_id UUID REFERENCES auth.users(id),
  pitched_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);

-- Campaign pledges (demand signals)
CREATE TABLE IF NOT EXISTS campaign_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES business_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- What they're pledging
  pledge_type TEXT DEFAULT 'advance_order' CHECK (pledge_type IN (
    'advance_order',   -- "I'll order X when they join"
    'recurring',       -- "I'll go weekly"
    'marks_seed'       -- Captain pre-seeding with own Marks
  )),
  credit_amount NUMERIC(10,2) DEFAULT 0,
  marks_amount INT DEFAULT 0,
  
  -- Details
  note TEXT, -- "I usually order the lunch special"
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Captain's Pitch Packets (generated documents)
CREATE TABLE IF NOT EXISTS pitch_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES business_campaigns(id) NOT NULL,
  captain_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Snapshot at time of generation
  pledge_count INT NOT NULL,
  total_pledged NUMERIC(10,2) NOT NULL,
  avg_order_value NUMERIC(10,2),
  proposed_discount TEXT,
  
  -- QR code linking to live campaign page
  qr_code_url TEXT,
  
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE business_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaigns" ON business_campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated users create campaigns" ON business_campaigns FOR INSERT WITH CHECK (auth.uid() = nominated_by);
CREATE POLICY "Anyone can view pledges" ON campaign_pledges FOR SELECT USING (true);
CREATE POLICY "Users manage own pledges" ON campaign_pledges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Captains view own packets" ON pitch_packets FOR SELECT USING (auth.uid() = captain_id);
CREATE POLICY "Captains create packets" ON pitch_packets FOR INSERT WITH CHECK (auth.uid() = captain_id);

-- Seed: La Capital del Sabor
INSERT INTO business_campaigns (
  business_name, business_type, business_city, business_state,
  slug, description, nominated_by, nomination_reason,
  proposed_discount_pct, pledge_threshold
) VALUES (
  'La Capital del Sabor', 'restaurant', 'San Antonio', 'TX',
  'la-capital-del-sabor',
  'Featured on mysanantonio.com/food for their incredible lunch specials. Local favorite on Bandera Road. Let''s bring them 50+ guaranteed customers with LB Card volume pricing.',
  (SELECT id FROM auth.users LIMIT 1), -- Founder's account
  'Featured Sunday on mysanantonio.com/food. Amazing lunch specials. This is our first Captain''s Pitch.',
  10.0, 30
) ON CONFLICT (slug) DO NOTHING;
```

## Deliverable 2: Campaign Pages

### Page: `/campaigns` — Business Campaign Directory

```
┌────────────────────────────────────────────────────────┐
│  🏪 Local Business Campaigns                            │
│  "Volume discount, baby."                               │
│                                                         │
│  Filters: [All] [Restaurants] [Services] [Retail]       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🍽️ La Capital del Sabor                         │   │
│  │ Restaurant · San Antonio, TX · Bandera Road      │   │
│  │ "Featured on mysanantonio.com/food"              │   │
│  │                                                   │   │
│  │ 12/30 pledges · $180 committed                   │   │
│  │ ████████████░░░░░░░░░░ 40%                       │   │
│  │                                                   │   │
│  │ [Pledge to Order →]                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [+ Nominate a Business You Love]                       │
└────────────────────────────────────────────────────────┘
```

### Page: `/campaigns/:slug` — Campaign Detail

```
┌────────────────────────────────────────────────────────┐
│  🍽️ LA CAPITAL DEL SABOR                                │
│  Restaurant · Bandera Road, San Antonio, TX             │
│  Featured Sunday on mysanantonio.com/food               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  COMMUNITY DEMAND                                │   │
│  │  12 people have pledged advance orders            │   │
│  │  $180 total committed                             │   │
│  │  Average order: $15.00                            │   │
│  │                                                   │   │
│  │  ████████████░░░░░░░░░░ 40% of 30 goal           │   │
│  │                                                   │   │
│  │  Proposed deal: 10% volume discount               │   │
│  │  for LB Card members                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  WHO'S PLEDGING:                                        │
│  • Maria S. — "Love the lunch specials!" ($15)          │
│  • James T. — "Best tamales in SA" ($20)                │
│  • Sarah K. — "Weekly regular" ($15/week recurring)     │
│                                                         │
│  [Pledge to Order — $___]  [Share This Campaign]        │
│                                                         │
│  ──────────────────────────────────────────────         │
│  Are you a Captain? When this hits 30 pledges,          │
│  you can generate a Pitch Packet and close this deal.   │
│  [I'll Be the Captain →]                                │
└────────────────────────────────────────────────────────┘
```

### Page: `/campaigns/:slug/pitch-packet` — Captain's Pitch Packet (Protected)

Generate a printable one-page PDF-style view:

```
┌────────────────────────────────────────────────────────┐
│  LIANA BANYAN — Captain's Pitch Packet                  │
│                                                         │
│  Business: La Capital del Sabor                         │
│  Captain: [Name] (ADAPT Score: [X])                     │
│  Generated: March 26, 2026                              │
│                                                         │
│  YOUR CUSTOMERS ARE WAITING:                            │
│  ├─ 32 members have pledged advance orders              │
│  ├─ $480 in pre-committed spending                      │
│  └─ Average order value: $15.00                         │
│                                                         │
│  THE DEAL:                                              │
│  Accept the LB Card → Give 10% volume discount →       │
│  We send you 32+ customers THIS WEEK                    │
│                                                         │
│  ┌──────┐                                               │
│  │ QR   │  ← Scan to see your live campaign page        │
│  │ CODE │     with real pledges and real people          │
│  └──────┘                                               │
│                                                         │
│  "A ship in harbor is safe, but that is not what        │
│   ships are BUILT for." — John A. Shedd                 │
│                                                         │
│  lianabanyan.com | $5/year | 2,015 innovations          │
│  "You build the Features — We're building the Board."   │
└────────────────────────────────────────────────────────┘
```

Print button: `window.print()` with print-specific CSS.

## Deliverable 3: Nominate Flow

### Page: `/campaigns/nominate` (Protected)

Simple form:
- Business name (required)
- Business type (dropdown from categories)
- City/State (required)
- Address (optional)
- Website/Phone (optional)
- Why you love this place (required, 1-3 sentences)
- Proposed discount % (default 10%)
- Your initial pledge amount (seed the campaign)

On submit: creates campaign + first pledge from nominator.

## Deliverable 4: Hooks

- `useBusinessCampaigns(filter?)` — list campaigns with pledge counts
- `useBusinessCampaign(slug)` — single campaign with pledges
- `usePledgeCampaign()` — mutation to pledge
- `useNominateBusiness()` — mutation to create campaign
- `useGeneratePitchPacket(campaignId)` — generate/fetch pitch packet
- `useClaimCaptain(campaignId)` — Captain claims a campaign

## Deliverable 5: Navigation + Routes

```tsx
<Route path="/campaigns" element={<BusinessCampaignDirectory />} />
<Route path="/campaigns/nominate" element={<ProtectedRoute><NominateBusinessPage /></ProtectedRoute>} />
<Route path="/campaigns/:slug" element={<BusinessCampaignDetail />} />
<Route path="/campaigns/:slug/pitch-packet" element={<ProtectedRoute><PitchPacketPage /></ProtectedRoute>} />
```

Add "Local Campaigns" to sidebar nav under Commerce section.

### Canonical Stats
- `innovationCount: 2015`
- `productionSystems: 23`

## Build + Deploy all 8 Firebase hosting targets.

## Quality Checks
- [ ] /campaigns shows directory with La Capital del Sabor seeded
- [ ] /campaigns/la-capital-del-sabor shows detail with pledge bar
- [ ] Pledge flow works (increment count + total)
- [ ] /campaigns/nominate creates new campaign
- [ ] Captain can generate Pitch Packet at threshold
- [ ] Pitch Packet is printable (clean print CSS)
- [ ] QR code links to live campaign page
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
