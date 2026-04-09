# Knight Session 129 — Captain's Dashboard ("The War Room")
## Dependencies: K124 (Captain Onboarding), K127 (Business Campaigns), K128 (Cold Start Cue Cards)
## Priority: HIGH (after K124/K127/K128)

---

## CONTEXT

The Captain system is the growth engine. Captains onboard businesses, rally community demand, and bridge the platform to the physical world. They need a dedicated command center — not a generic dashboard, but a purpose-built War Room that shows them EXACTLY what to do next.

This session builds the Captain's Dashboard with three key views:
1. **Territory Map** — geographic corridor tracking
2. **Pipeline** — campaign status and next actions
3. **Walking Billboard Intelligence** — passive demand signals from LB Card spending

---

## BUILD ORDER

### Step 1: Captain's Dashboard Layout (`/captain/dashboard`)

Create the main Captain's Dashboard page with three tabs:

```
┌──────────────────────────────────────────────────────────┐
│  CAPTAIN'S DASHBOARD — [Captain Name]                     │
│  Reputation: ★★★☆☆ (Level 3 — 12 businesses onboarded)  │
│                                                           │
│  [Territory]    [Pipeline]    [Intelligence]              │
│                                                           │
│  ┌─ Territory ───────────────────────────────────────────┐│
│  │                                                        ││
│  │  Active Corridors:                                     ││
│  │  ├── Bandera Road (Loop 410 to 1604)                  ││
│  │  │   ├── 4 onboarded  ████░░░░░░  40%                ││
│  │  │   ├── 2 active campaigns                           ││
│  │  │   └── 4 not yet approached                         ││
│  │  │                                                     ││
│  │  └── Pearl District                                    ││
│  │      ├── 1 onboarded  █░░░░░░░░░  8%                 ││
│  │      ├── 1 active campaign                            ││
│  │      └── 11 not yet approached                        ││
│  │                                                        ││
│  │  [+ Add Corridor]                                      ││
│  └────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

**Data model:**
```typescript
// captain_corridors table
interface CaptainCorridor {
  id: string;
  captain_id: string;
  name: string; // "Bandera Road"
  description: string; // "Loop 410 to 1604"
  bounds: { lat: number; lng: number }[]; // polygon
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

// corridor_businesses table
interface CorridorBusiness {
  id: string;
  corridor_id: string;
  business_name: string;
  address: string;
  category: string; // 'food' | 'service' | 'retail' | 'manufacturing'
  status: 'onboarded' | 'campaign_active' | 'not_approached' | 'declined' | 'corporate_skip';
  campaign_id?: string;
  onboarded_at?: string;
}
```

### Step 2: Pipeline View

```
┌─ Pipeline ───────────────────────────────────────────────┐
│                                                           │
│  ACTIVE CAMPAIGNS (3)                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🍽️ La Capital del Sabor           32/30 pledges ✅  │  │
│  │    Bandera Rd · $487 pledged · READY TO PITCH      │  │
│  │    [Download Pitch Packet]  [Mark as Pitched]      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ✂️ Joe's Barbershop                 18/30 pledges   │  │
│  │    Bandera Rd · $212 pledged · RALLYING            │  │
│  │    [Share Campaign]  [Boost]                       │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🧁 Lupita's Bakery                  8/30 pledges   │  │
│  │    Bandera Rd · $96 pledged · EARLY                │  │
│  │    [Share Campaign]  [Seed More Marks]             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  PITCHED — AWAITING RESPONSE (1)                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔧 Bandera Auto Repair              42 pledges     │  │
│  │    Pitched Mar 22 · Follow up Mar 25               │  │
│  │    [Mark as Accepted]  [Mark as Declined]          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  RECENTLY ONBOARDED (2)                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ✅ Michoacana Ice Cream — onboarded Mar 15          │  │
│  │ ✅ Los Cocos Fruteria — onboarded Mar 10            │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Campaign states:** EARLY (< 33% of threshold) → RALLYING (33-99%) → READY TO PITCH (100%+) → PITCHED → ACCEPTED / DECLINED

### Step 3: Walking Billboard Intelligence View

```
┌─ Intelligence ───────────────────────────────────────────┐
│                                                           │
│  🎯 RIPE FOR PITCH (businesses where LB members          │
│     already spend but haven't been onboarded)            │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🏪 Corner Grocery (Bandera Rd)                      │  │
│  │    63 LB members · ~$4,100/mo spending              │  │
│  │    Category: Grocery · NOT onboarded                │  │
│  │    [Start Campaign]  [Add to Corridor]              │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🚗 Joe's Auto (Bandera Rd)                          │  │
│  │    47 LB members · ~$2,300/mo spending              │  │
│  │    Category: Auto Service · NOT onboarded           │  │
│  │    [Start Campaign]  [Add to Corridor]              │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 💇 Maria's Salon (Pearl District)                    │  │
│  │    31 LB members · ~$890/mo spending                │  │
│  │    Category: Personal Care · NOT onboarded          │  │
│  │    [Start Campaign]  [Add to Corridor]              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Data: Aggregated, anonymized LB Card spending.          │
│  Members opt in at card signup. No individual data shown.│
└──────────────────────────────────────────────────────────┘
```

**NOTE:** This view requires LB Card (Stripe Issuing) to be live. Until then, show a placeholder: "Intelligence data will appear once LB Card transactions begin. Start by creating campaigns manually."

### Step 4: Pitch Packet Generator

When a campaign reaches threshold, the Captain can generate a printable Pitch Packet:

```typescript
// /captain/campaigns/[id]/pitch-packet
interface PitchPacket {
  businessName: string;
  businessAddress: string;
  pledgeCount: number;
  totalPledgedSpending: string;
  averageOrderValue: string;
  captainName: string;
  captainReputation: number;
  qrCodeUrl: string; // links to live campaign page
  generatedAt: string;
}
```

The Pitch Packet renders as a printable one-page PDF with:
- Business name and "YOUR CUSTOMERS ARE WAITING"
- Pledge count and total value
- Comparison to DoorDash/UberEats fees (0% vs 15-30%)
- QR code to live campaign page
- Captain's name and reputation level
- Liana Banyan branding + stats (2,019 innovations)

### Step 5: Supabase Migration

```sql
-- Captain corridors
CREATE TABLE captain_corridors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Corridor businesses
CREATE TABLE corridor_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corridor_id UUID REFERENCES captain_corridors(id),
  business_name TEXT NOT NULL,
  address TEXT,
  category TEXT CHECK (category IN ('food', 'service', 'retail', 'manufacturing', 'other')),
  status TEXT DEFAULT 'not_approached' CHECK (status IN ('onboarded', 'campaign_active', 'not_approached', 'declined', 'corporate_skip')),
  campaign_id UUID,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Captain mentorship
CREATE TABLE captain_mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_captain_id UUID REFERENCES auth.users(id),
  apprentice_captain_id UUID REFERENCES auth.users(id),
  phase TEXT DEFAULT 'shadow' CHECK (phase IN ('shadow', 'co_lead', 'solo', 'graduated')),
  started_at TIMESTAMPTZ DEFAULT now(),
  graduated_at TIMESTAMPTZ
);

-- Walking Billboard signals (aggregated, anonymized)
CREATE TABLE demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL,
  merchant_category TEXT,
  approximate_location TEXT,
  unique_cardholders INTEGER DEFAULT 0,
  monthly_spend_estimate NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'campaign_created', 'onboarded'))
);

-- RLS: Captains can only see corridors they own
ALTER TABLE captain_corridors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Captains see own corridors" ON captain_corridors
  FOR ALL USING (captain_id = auth.uid());

-- Demand signals visible to all Captains (aggregated data only)
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Captains see demand signals" ON demand_signals
  FOR SELECT USING (true);
```

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `src/pages/captain/Dashboard.tsx` | CREATE — Main Captain Dashboard |
| `src/pages/captain/CaptainTerritory.tsx` | CREATE — Territory/corridor view |
| `src/pages/captain/CaptainPipeline.tsx` | CREATE — Campaign pipeline view |
| `src/pages/captain/CaptainIntelligence.tsx` | CREATE — Walking Billboard view |
| `src/pages/captain/PitchPacket.tsx` | CREATE — Printable pitch packet |
| `src/hooks/useCaptainData.ts` | CREATE — Captain-specific data hooks |
| `src/hooks/useDemandSignals.ts` | CREATE — Walking Billboard data hook |
| `supabase/migrations/captain_dashboard.sql` | CREATE — Tables above |
| `src/App.tsx` | MODIFY — Add /captain/* routes |

---

## CANONICAL NUMBERS

- **Innovation count: 2,019**
- Production systems: 23 (this becomes 24 when deployed)
- Patent claims: 1,511
- Applications: 10

## RULES

- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- LB Card funded separately (direct deposit/bank transfer), NOT from Credits.
- No securities language anywhere.
- Walking Billboard data is AGGREGATED and ANONYMIZED only.

---

FOR THE KEEP.
