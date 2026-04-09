# Knight Session 131 — The Programmable Card: Calling Cards + Durin's Door + Sponsored LB Cards + Brand Bounties
## Dependencies: K124 (Captain System), K127 (Business Onboarding), K116 (Cue Cards)
## Priority: CRITICAL — This is the platform's viral growth engine

---

## CONTEXT

This session builds the system that lets ANY member create personalized, optionally pre-funded onboarding cards with dynamically routed QR codes. A Captain generates a card, hands it to someone, walks away. The card does the pitching. The card can carry real money. The QR code routes to different experiences based on secret phrases (Durin's Door). Every new member who signs up can create MORE cards — viral replication.

Additionally, new members see a "Build Your Brand" bounty panel at signup — checkboxes for logo, domain, email, and designed card — which feeds a cooperative designer marketplace with 6-tier rush pricing.

**CRITICAL RULES:**
- Credits NEVER cash out to fiat. One-way valve. Irrevocable.
- LB Card funded separately (direct deposit/bank transfer), NOT from Credits.
- Sponsorship attribution is **ONE LEVEL ONLY**. NOT MLM. Sponsor earns Marks for direct signups only.
- No securities language.
- Innovation count: 2,033.

---

## BUILD ORDER

### Step 1: Durin's Door Conditional Routing Engine

The platform needs a configurable conditional access gateway.

**Migration:**
```sql
-- Durin's Door configurations
CREATE TABLE durins_door_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medallion_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Default path (no code entered)
  default_template TEXT DEFAULT 'generic_welcome',
  default_data JSONB DEFAULT '{}',
  
  -- Active window
  active_from TIMESTAMPTZ DEFAULT now(),
  active_until TIMESTAMPTZ, -- null = never expires
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Door rules (each rule = one phrase → one experience)
CREATE TABLE durins_door_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES durins_door_configs(id) ON DELETE CASCADE,
  
  -- The key
  key_type TEXT NOT NULL CHECK (key_type IN ('phrase', 'email', 'code', 'any')),
  key_value TEXT NOT NULL, -- "borrego", "owner@lacapital.com", "FRIEND10"
  case_sensitive BOOLEAN DEFAULT false,
  single_use BOOLEAN DEFAULT false,
  used BOOLEAN DEFAULT false,
  
  -- What's behind this door
  template TEXT NOT NULL, -- 'business_pitch', 'member_invite', 'driver_recruit', 'family_invite', 'custom'
  experience_data JSONB NOT NULL DEFAULT '{}',
  -- experience_data can include:
  -- { recipient_name, business_name, custom_message, show_tiered_chart,
  --   show_family_table, show_cookbook, tier_recommendation, etc. }
  
  -- For whom
  intended_recipient TEXT, -- "Enrique at La Capital" (display only)
  
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsored cards (pre-funded)
CREATE TABLE sponsored_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Card details
  card_type TEXT DEFAULT 'digital' CHECK (card_type IN ('physical', 'digital', 'both')),
  preloaded_amount NUMERIC(10,2) DEFAULT 0,
  include_membership BOOLEAN DEFAULT false, -- $5 of balance goes to membership
  
  -- Linking
  door_config_id UUID REFERENCES durins_door_configs(id),
  
  -- Activation
  activation_code TEXT UNIQUE, -- unique code for this specific card
  activated BOOLEAN DEFAULT false,
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMPTZ,
  
  -- Tracking
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'distributed', 'activated', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ -- null = never
);

-- Sponsorship attribution (ONE LEVEL ONLY — not MLM)
CREATE TABLE sponsorship_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  sponsored_user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE, -- each user has exactly ONE sponsor
  card_id UUID REFERENCES sponsored_cards(id),
  marks_earned_signup INT DEFAULT 0,
  marks_earned_activity INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- NOTE: Marks earned are for DIRECT signups only. 
-- If User A sponsors User B, and User B sponsors User C,
-- User A gets ZERO credit for User C. ONE LEVEL ONLY.

-- Brand bounties
CREATE TABLE brand_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- What's needed
  bounty_type TEXT NOT NULL CHECK (bounty_type IN ('logo', 'domain_email', 'designed_card', 'other')),
  
  -- Urgency tier (Good/Fast/Cheap)
  rush_tier INT NOT NULL CHECK (rush_tier BETWEEN 1 AND 6),
  -- T1=today (4-8hr), T2=tomorrow (24hr), T3=3 days, T4=1 week, T5=2 weeks, T6=whenever
  
  -- Pricing
  price_marks INT NOT NULL,
  paid_in_credits BOOLEAN DEFAULT false, -- Credits = queue priority bump
  
  -- Details
  brief JSONB DEFAULT '{}', -- { business_name, style_preferences, colors, etc. }
  
  -- Assignment
  designer_id UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  
  -- Delivery
  deliverable_url TEXT, -- link to finished work
  delivered_at TIMESTAMPTZ,
  approved BOOLEAN,
  approved_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'in_progress', 'delivered', 'approved', 'disputed', 'cancelled')),
  
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Designer profiles
CREATE TABLE designer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  
  -- What they do
  services TEXT[] DEFAULT '{}', -- ['logo', 'domain_email', 'designed_card']
  tier_availability INT[] DEFAULT '{4,5,6}', -- which rush tiers they accept
  weekly_capacity INT DEFAULT 5, -- how many bounties per week
  
  -- Pricing model
  pricing_tier TEXT DEFAULT 'retail' CHECK (pricing_tier IN ('c20', 'c40', 'c60', 'c90', 'retail')),
  
  -- Reputation (XP Time Rating)
  completed_bounties INT DEFAULT 0,
  tryout_completed BOOLEAN DEFAULT false, -- true after 2 successful deliveries
  xp_rating NUMERIC(5,2) DEFAULT 0,
  avg_quality NUMERIC(3,2) DEFAULT 0, -- 1-5 from requesters
  on_time_rate NUMERIC(5,2) DEFAULT 0, -- % delivered by deadline
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE durins_door_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE durins_door_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own door configs" ON durins_door_configs FOR ALL USING (medallion_id = auth.uid());
CREATE POLICY "Public read door rules" ON durins_door_rules FOR SELECT USING (true);
CREATE POLICY "Users manage own cards" ON sponsored_cards FOR ALL USING (sponsor_id = auth.uid());
CREATE POLICY "Users see own attributions" ON sponsorship_attributions FOR SELECT USING (sponsor_id = auth.uid() OR sponsored_user_id = auth.uid());
CREATE POLICY "Public read open bounties" ON brand_bounties FOR SELECT USING (true);
CREATE POLICY "Users manage own bounties" ON brand_bounties FOR ALL USING (requester_id = auth.uid() OR designer_id = auth.uid());
CREATE POLICY "Public read designer profiles" ON designer_profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own designer profile" ON designer_profiles FOR ALL USING (user_id = auth.uid());
```

### Step 2: The Welcome Gate (`/w/[medallionId]`)

```typescript
// src/pages/WelcomeGate.tsx
// This is the universal entry point for ALL card scans

export default function WelcomeGate() {
  const { medallionId } = useParams();
  const sponsor = useMedallionLookup(medallionId);
  const doorConfig = useDurinsDoor(medallionId);
  const [input, setInput] = useState('');
  const [experience, setExperience] = useState<RedCarpetExperience | null>(null);
  
  // Check if the config is active (time window)
  if (doorConfig && !isActive(doorConfig)) {
    return <ExpiredCard sponsor={sponsor} />;
  }
  
  // If user entered a phrase/email, evaluate
  const handleSubmit = () => {
    const matchedRule = doorConfig?.rules.find(r => 
      r.case_sensitive 
        ? r.key_value === input 
        : r.key_value.toLowerCase() === input.toLowerCase()
    );
    
    if (matchedRule) {
      setExperience(matchedRule.experience_data);
    } else {
      // No match — show default
      setExperience(doorConfig?.default_data || genericWelcome);
    }
  };
  
  if (experience) {
    return <RedCarpetRenderer experience={experience} sponsor={sponsor} />;
  }
  
  return (
    <WelcomeGateUI
      sponsor={sponsor}
      hasDoors={doorConfig?.rules?.length > 0}
      onSubmitPhrase={handleSubmit}
      onSkip={() => setExperience(doorConfig?.default_data || genericWelcome)}
    />
  );
}
```

### Step 3: Cue Card Generator Enhancement (`/tools/cue-card-generator`)

Enhance the existing Cue Card Generator with new capabilities:

```
┌──────────────────────────────────────────────────────────────┐
│  🎴 Create a New Card                                        │
│                                                               │
│  STEP 1: WHO IS THIS FOR?                                    │
│  ○ A specific person    ○ A business    ○ General            │
│                                                               │
│  STEP 2: TEMPLATE                                            │
│  [Business Pitch] [Member Invite] [Driver] [Family] [Custom] │
│                                                               │
│  STEP 3: PERSONALIZE                                         │
│  Name: [_____________]  Business: [______________]           │
│  Message: [__________________________________________]       │
│                                                               │
│  STEP 4: ACCESS PHRASES (Durin's Door)                       │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Phrase: [borrego___] → [Restaurant Pitch ▼]      │       │
│  │ Email:  [_________] → [Ultra-Personal ▼]         │       │
│  │ [+ Add door]                                      │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
│  STEP 5: FUND THE CARD                                       │
│  ○ Free (QR only)  ○ $5  ○ $10  ○ $25  ○ $100  ○ $_____   │
│  □ Include $5 membership in balance                          │
│                                                               │
│  STEP 6: DELIVER                                             │
│  □ Physical card    □ Digital QR    □ SMS                    │
│  □ Email           □ Shareable link                          │
│                                                               │
│  STEP 7: SCHEDULE                                            │
│  ○ Now  ○ [date/time]  Expires: ○ Never  ○ 30d  ○ 90d     │
│                                                               │
│  [Preview]  [Generate →]                                     │
└──────────────────────────────────────────────────────────────┘
```

### Step 4: Red Carpet Experience Renderer

A component that takes a `RedCarpetExperience` and renders the appropriate onboarding flow:

```typescript
// src/components/RedCarpetRenderer.tsx
export function RedCarpetRenderer({ experience, sponsor }) {
  // Render based on template type
  switch (experience.template) {
    case 'business_pitch':
      return <BusinessPitchRedCarpet 
        recipientName={experience.recipient_name}
        businessName={experience.business_name}
        message={experience.custom_message}
        showTieredChart={experience.show_tiered_chart}
        tierRecommendation={experience.tier_recommendation}
        sponsor={sponsor}
      />;
    case 'member_invite':
      return <MemberInviteRedCarpet
        recipientName={experience.recipient_name}
        showFamilyTable={experience.show_family_table}
        showCookbook={experience.show_cookbook}
        sponsor={sponsor}
      />;
    case 'family_invite':
      return <FamilyInviteRedCarpet
        recipientName={experience.recipient_name}
        message={experience.custom_message}
        sponsor={sponsor}
      />;
    case 'driver_recruit':
      return <DriverRecruitRedCarpet sponsor={sponsor} />;
    default:
      return <GenericWelcome sponsor={sponsor} />;
  }
}
```

Each Red Carpet variant ends with:
1. **Sign Up** button (account creation)
2. **Card Activation** (if pre-funded — balance unlocks after signup)
3. **Brand Bounty Panel** (Step 5 below)

### Step 5: Brand Bounty Panel (Post-Signup)

After the new member creates their account (but still in the Red Carpet flow):

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 Look Professional from Day 1                             │
│                                                               │
│  Real designers. Real results. Cooperative pricing.           │
│                                                               │
│  □ Custom Logo                                               │
│    A real designer creates YOUR logo.                        │
│    Starting at 30 Marks (T6) up to 200 Marks (T1 rush)      │
│                                                               │
│  □ Domain + Business Email                                   │
│    yourbusiness.com + you@yourbusiness.com                   │
│    Starting at 20 Marks (T6) up to 100 Marks (T1)           │
│                                                               │
│  □ Designed Calling Card                                     │
│    Your branded card with QR code, ready to hand out.        │
│    Starting at 15 Marks (T6) up to 80 Marks (T1)            │
│                                                               │
│  ⏱️ How fast?                                                 │
│  [T1 Today] [T2 Tomorrow] [T3 3 Days] [T4 Week]             │
│  [T5 2 Weeks] [T6 Whenever]                                 │
│                                                               │
│  💡 Pay in Credits → bumped up one tier in the queue         │
│  ○ Pay in Marks    ○ Pay in Credits (priority)               │
│                                                               │
│  [Post My Bounties →]           [Remind Me Later]            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

"Remind Me Later" saves the panel as a dashboard task. The new member can return anytime.

### Step 6: Designer Marketplace (`/crew/design`)

Where designers sign up and claim bounties:

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 Design Crew — Open Bounties                              │
│                                                               │
│  YOUR PROFILE:                                               │
│  Services: Logo, Designed Card                               │
│  Tiers: T3-T6  |  Pricing: C+40  |  Weekly cap: 10          │
│  XP: ★★★☆☆ (42 completed, 94% on-time, 4.3 avg quality)    │
│                                                               │
│  ┌─ AVAILABLE BOUNTIES ──────────────────────────────────┐   │
│  │                                                        │   │
│  │ 🔴 T1 RUSH  Logo for "Bandera Auto" — 200 Marks       │   │
│  │    Due: TODAY 6pm | Credits paid (priority) | [Claim]  │   │
│  │                                                        │   │
│  │ 🟡 T3  Logo for new member — 100 Marks                 │   │
│  │    Due: Mar 29 | Marks | [Claim]                       │   │
│  │                                                        │   │
│  │ 🟢 T4  Designed Card for "MIL's Bakery" — 50 Marks     │   │
│  │    Due: Apr 2 | Credits (priority) | [Claim]           │   │
│  │                                                        │   │
│  │ ⚪ T6  Domain setup — 20 Marks                          │   │
│  │    Due: Whenever | Marks | [Claim]                     │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  [Register as Designer]  [Update My Profile]                 │
└──────────────────────────────────────────────────────────────┘
```

Designers need 2 approved completions before XP starts counting. Until then, they see a "Tryout Mode" badge.

---

## FILES TO CREATE/MODIFY

| File | Action |
|------|--------|
| `src/pages/WelcomeGate.tsx` | CREATE — /w/[medallionId] entry point |
| `src/components/DurinsDoorGate.tsx` | CREATE — Phrase/email input + routing |
| `src/components/RedCarpetRenderer.tsx` | CREATE — Template-based experience renderer |
| `src/components/BusinessPitchRedCarpet.tsx` | CREATE — Business pitch template |
| `src/components/MemberInviteRedCarpet.tsx` | CREATE — Member invite template |
| `src/components/FamilyInviteRedCarpet.tsx` | CREATE — Family invite template |
| `src/components/DriverRecruitRedCarpet.tsx` | CREATE — Driver recruit template |
| `src/components/BrandBountyPanel.tsx` | CREATE — Post-signup bounty checkboxes |
| `src/pages/tools/CueCardGeneratorV2.tsx` | CREATE or MODIFY — Enhanced generator |
| `src/pages/crew/DesignCrew.tsx` | CREATE — Designer marketplace |
| `src/hooks/useDurinsDoor.ts` | CREATE — Door config + rule evaluation |
| `src/hooks/useSponsoredCards.ts` | CREATE — Card creation + activation |
| `src/hooks/useBrandBounties.ts` | CREATE — Bounty CRUD |
| `src/hooks/useDesignerProfile.ts` | CREATE — Designer registration + bounty claiming |
| `supabase/migrations/programmable_card.sql` | CREATE — All tables from Step 1 |
| `src/App.tsx` (or routes file) | MODIFY — Add /w/*, /crew/design routes |

---

## ROUTES

```
/w/:medallionId              — Welcome Gate (public, the QR destination)
/tools/cue-card-generator    — Enhanced card creation (protected)
/crew/design                 — Designer marketplace (protected)
/crew/design/register        — Designer registration (protected)
/dashboard/cards             — My created/distributed cards (protected)
/dashboard/bounties          — My brand bounties (protected)
```

---

## CANONICAL NUMBERS

- **Innovation count: 2,033**
- Production systems: 23 (becomes 24+ when deployed)
- Patent claims: 1,511
- Applications: 10

## CRITICAL RULES

- Credits NEVER cash out. One-way valve. Irrevocable.
- LB Card funded separately. NOT from Credits.
- Sponsorship attribution: **ONE LEVEL ONLY. NOT MLM.**
- No securities language.
- C+20 is the constitutional floor.
- "You only get C+20 when you give C+20."
- Designers need 2 successful completions for XP to count.

---

FOR THE KEEP.
