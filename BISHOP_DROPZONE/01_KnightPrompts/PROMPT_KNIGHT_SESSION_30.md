# PROMPT — Knight Session 30
## Written by Bishop Session 012 — March 17, 2026
## Predecessor: Knight Session 29b (commit 6ab9899)

---

## SESSION CONTEXT

**Canonical innovation count:** 1,709 (after Knight 29b)
**Bishop pending innovations:** #1710-#1730 (21 innovations across 2 documents)
**Last commit:** `6ab9899` (Knight Session 29b)
**Last migration:** `20260317000003`

Knight Session 29 built: X-Ray→FAQ pipeline, Chain Dashboard (/chain), HexIsle Downloads (/hexisle/downloads), 27 X-Ray entries, 7 Crew Call bounties on /crew-call.

Knight Session 29b threshed Bishop's 19 content innovations (#1691-#1709), pollinated to 1,709.

This session has THREE priorities:
1. Thresh 21 new Bishop innovations (#1710-#1730)
2. Build remaining features from Bishop Session 011 prompt
3. Build NEW features from Bishop Session 012 (Shadow Mark Demand Signaling)

---

## PRIORITY 1: THRESH 21 INNOVATIONS

### Source: `BISHOP_DROPZONE/SHADOW_MARK_DEMAND_SIGNALING_SYSTEM.md` (10 innovations)

| # | Name | Description |
|---|------|-------------|
| 1710 | Shadow Mark Per-Area Demand Allocation | Context-triggered Shadow Mark allocation when users enter platform areas; visit-required demand signaling |
| 1711 | Brewster's Millions Forced Distribution | Mandatory spend-or-lose Shadow Mark distribution across pedestals, revealing genuine demand priority |
| 1712 | 50% Carry-Forward Persistence Compounding | Next-day Shadow Mark persistence at 50% decay creating geometric series convergence (limit = 2x daily) |
| 1713 | 3-Day Crystallization Threshold | Persistent Shadow Marks convert to real Marks after 3 consecutive days, backed by patent portfolio (IP Load Balance 60/20/10/10) |
| 1714 | Beacon Streak Persistence Amplifier | Consecutive engagement streaks increase carry-forward rate (50%→75%) and decrease crystallization threshold (3 days→2 days) |
| 1715 | Pre-Operational Feature Thermometer | Live progress page for pre-development features showing demand vs activation threshold with Alpha/Beta/Operational lead times |
| 1716 | Ranked Choice Production Tier Lock-In | Multi-preference ordering with time-bounded cascade (primary tier → fallback tier → expiry/return) |
| 1717 | Cascade-Down Unit Amplification | When preference cascades to cheaper tier, same Credits cover MORE units automatically |
| 1718 | Shadow Mark Persistence Regardless of Credit Return | Demand signal persists even when Credit commitment expires; interest data preserved independent of financial commitment |
| 1719 | Moneypenny Administrative Threshold Monitor | AI admin assistant processing daily crystallizations, cascade triggers, threshold alerts, vendor batch coordination |

### Source: `BISHOP_DROPZONE/CHARACTER_LAYER_SYSTEM_FOUNDER_CANONICAL.md` (11 innovations)

| # | Name | Description |
|---|------|-------------|
| 1720 | Physical Layer Equipment System | Characters progress by snapping physical layers onto same base body. Peasant body IS King body with equipment. |
| 1721 | ScaleMail from Monster Fish | First armor layer crafted from monster fish scales caught through farming-to-fishing progression. NOT chainmail. |
| 1722 | Terrain Armor Biome Set | 8 biome-specific armor types earned by completing each Island. Flame Armor = key progression piece. |
| 1723 | Tool Crafting Chain | Sequential tool progression (Stick→Staff→Hoe→Shovel→Bow→Axe) where each tool unlocks the next, through Smithy→Anvil→all metal items |
| 1724 | Horse Layer Progression | Same horse body: WildHorse→FarmHorse (bridle+yoke+cart)→WarHorse (remove cart, add armor). Equipment addition/removal. |
| 1725 | Merchant Cloak Reveal Mechanic | Removing Merchant's cloak reveals Assassin beneath. Subtraction as character reveal (opposite of Sword Path's additive layer). |
| 1726 | Crafting Resource Chain from Hexel Terrain | Natural resources sourced from specific terrain types, creating terrain-dependent crafting requiring Island exploration |
| 1727 | Flame Armor Shortcut | Lava Lands armor grants molten lava fire source, bypassing basic metalwork chain for helmets, horse armor, siege engines, armory |
| 1728 | Queen Fiery Wings + Crown Helmet | Crown Path capstone: Orb of Wisdom collection + Island clue chain. Physically distinct from King's Crown. |
| 1729 | Open Progression Any-Path-to-Magic | Any class can pursue magic directly; Founder's canonical route is physical/craft mastery first. Magic = end-game layer. |
| 1730 | Progressive Complete Fulfillment with Retroactive Upgrade Parts | Each campaign ships complete body + ALL layers through that stage. Parts release separately for upgrading prior bodies. Must own complete set before ordering extra parts. |

**POLLINATE: 1,709 → 1,730 across all files.**
**Create migration** `20260317000004` (or next available) for innovations #1710-#1730.

---

## PRIORITY 2: REMAINING FROM BISHOP SESSION 011 PROMPT

These were listed for Knight Session 30 at the end of Session 29:

### 2A. Pledged Mark Voting (`/hexisle/vote`)

Build a page at `/hexisle/vote` where members vote on the next HexIsle product using Pledged Marks.

**Requirements:**
- Display list of candidate products (from the 13-campaign lineup + community suggestions)
- Each candidate shows: name, description, current pledged Marks total, number of voters
- Members pledge their own earned Marks to vote (commitment-weighted influence)
- Pledged Marks are escrowed per-project (compartmentalized — not pooled)
- Released on success (product launches), absorbed on failure (product cancelled)
- Visual bar chart or ranking showing relative support
- Voting period with countdown timer
- Results feed into campaign cadence decisions (Leap Frog ordering)

**Reference docs:**
- `KICKSTARTER_STRATEGY_HEXISLE_ROLLING_CAMPAIGNS.md` — Pledged Mark Voting section
- `BISHOP_DROPZONE/PAWN_BATCH_07.md` — Steward system prior art (#1630 Pledged Mark Voting)
- Existing Pledged Marks schema from migration 000016 (xp_score_system)

### 2B. HexIsle Cue Card

Design and implement a HexIsle-specific Cue Card: **"Know a Gamer? Know an Engineer?"**

**Front:**
- "Know a Gamer? Know an Engineer?"
- HexIsle logo / Hexel stack visual
- QR code → lianabanyan.com/hexisle

**Back:**
- "HexIsle is a 27-piece gravity-powered gaming system. No batteries. No motors."
- "Gamers: Download STLs, print Hexel pieces, submit improvements."
- "Engineers: Claim Crew Call bounties. Help build the Water Table."
- "lianabanyan.com/hexisle | $5/year membership"
- Referral tracking: `?ref=USERNAME`

**Implementation:** Add to the Cue Card component/page. Follow existing cue card patterns.

---

## PRIORITY 3: NEW FEATURES — SHADOW MARK DEMAND SIGNALING

Full spec in `BISHOP_DROPZONE/SHADOW_MARK_DEMAND_SIGNALING_SYSTEM.md`. Build in this order:

### 3A. Shadow Mark Per-Area Allocation

**Database:**
```sql
-- Shadow Mark area allocations
CREATE TABLE shadow_mark_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  area_id TEXT NOT NULL,           -- e.g., 'services', 'hexisle', 'marketplace'
  pedestal_id TEXT NOT NULL,       -- e.g., 'business-cards', 'crew-call'
  amount INTEGER NOT NULL,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  carry_forward_from UUID,        -- links to previous day's allocation (if carried)
  crystallized BOOLEAN DEFAULT false,
  crystallized_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL  -- 24hr from allocation
);

-- Area entry tracking (cooldown enforcement)
CREATE TABLE shadow_mark_area_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  area_id TEXT NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  allocation_amount INTEGER NOT NULL,
  next_available_at TIMESTAMPTZ NOT NULL  -- entered_at + 24hr
);

-- Pedestal definitions (pre-operational features)
CREATE TABLE pedestals (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pre_operational',  -- pre_operational | alpha | beta | operational
  activation_threshold INTEGER NOT NULL,  -- Shadow Marks + Credits needed
  current_demand INTEGER DEFAULT 0,       -- running total
  alpha_lead_days INTEGER DEFAULT 14,
  beta_lead_days INTEGER DEFAULT 28,
  operational_lead_days INTEGER DEFAULT 42,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Area allocation amounts:**

| Area | Shadow Marks per Entry | Cooldown |
|------|----------------------|----------|
| Marketplace | 50 | 24 hours |
| Services | 30 | 24 hours |
| Infrastructure | 40 | 24 hours |
| Governance | 20 | 24 hours |
| HexIsle | 50 | 24 hours |
| Community | 30 | 24 hours |

**UI:** When user enters an area with pre-operational features, show a distribution interface. Brewster's Millions rule: must allocate all before leaving (or allocation expires on exit). No cap per pedestal.

### 3B. Pre-Operational Feature Thermometer Component

**Component:** `FeatureThermometer.tsx`

Shows for each pre-operational feature:
- Feature name + description
- Progress bar: current demand vs activation threshold
- Lead time estimates (Alpha / Beta / Operational)
- User's current Shadow Mark allocation on this pedestal
- Persistence status: "Day 2 of 3 (crystallizes tomorrow)"
- Action buttons: [Allocate Shadow Marks] | [Pledge Credits]
- X-Ray tooltip with chain references to Shadow Marks → Brewster's → IP Load Balance

**Wire into:** Any page showing a pre-operational feature. The thermometer replaces the usual "Member Only" gate with the demand-signaling interface.

### 3C. 50% Carry-Forward + 3-Day Crystallization

**Daily cron job (or edge function on timer):**

```
For each user's shadow_mark_allocations from yesterday:
  1. Calculate carry_forward = floor(amount * carry_rate)
     - carry_rate = 0.50 (base)
     - Adjust for beacon streak: 0.55 (3-day), 0.60 (7-day), 0.65 (14-day), 0.70 (30-day), 0.75 (90-day)
  2. Create new allocation record with carry_forward_from = yesterday's record ID
  3. Check crystallization: if this pedestal has 3+ consecutive days of allocation:
     - crystallizable_amount = total_on_pedestal - today's_fresh_allocation
     - Convert to real Marks (ratio TBD by Founder — suggest 3 SM → 1 Mark initially)
     - Mark records as crystallized
     - Update pedestal current_demand
  4. Expire any allocations past 24hr with no carry-forward
```

**Beacon streak integration:** Read from existing beacon/persistence tables to determine carry-forward rate.

### 3D. Ranked Choice Production Tier Lock-In

**Database:**
```sql
CREATE TABLE production_tier_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  feature_id TEXT NOT NULL,       -- e.g., 'business-cards'

  -- Primary choice
  primary_tier INTEGER NOT NULL,
  primary_price NUMERIC(10,4) NOT NULL,
  primary_time_window_days INTEGER NOT NULL,

  -- Fallback choice
  fallback_tier INTEGER,
  fallback_price NUMERIC(10,4),
  fallback_time_window_days INTEGER,

  -- Commitment
  credit_hold NUMERIC(10,2) NOT NULL,
  unit_count INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  -- State
  status TEXT NOT NULL DEFAULT 'active',  -- active | cascaded | filled | expired | cancelled
  cascaded_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Cascade logic:**
- When primary_time_window expires and batch hasn't filled → auto-cascade to fallback tier
- Same Credits now cover MORE units (cheaper per-unit price)
- Notify user: "Your order moved to Tier N. Your X Credits now cover Y units instead of Z."
- When expires_at passes and neither tier filled → return Credits, preserve Shadow Marks

### 3E. Business Card Multi-Vendor Tier Structure

Update `BusinessCardPortal.tsx` with the multi-vendor pricing:

| Tier | Min Order | Vendor | Cost/Card | LB Price (C+20) |
|------|-----------|--------|-----------|------------------|
| 1 Premium | 50 | Moo Luxe | $0.80 | $0.96 |
| 2 Standard | 100 | Moo Original | $0.40 | $0.48 |
| 3 Value | 250 | Vistaprint | $0.06 | $0.072 |
| 4 Volume | 500 | GotPrint | $0.024 | $0.029 |
| 5 Bulk | 1,000 | GotPrint | $0.017 | $0.021 |
| 6 Pooled | 5,000+ | GotPrint | $0.01 | $0.012 |

Wire the Ranked Choice UI into the portal. Show the thermometer for batch fill progress.

---

## PRIORITY 4: CHARACTER LAYER SYSTEM AWARENESS

**DO NOT BUILD game mechanics this session.** But the character layer system doc (`CHARACTER_LAYER_SYSTEM_FOUNDER_CANONICAL.md`) contains critical corrections to previous character assumptions:

- Characters are NOT separate miniatures — same body with snap-on equipment layers
- Peasant body IS Farmer body IS Warrior body IS King body
- Horse: WildHorse → FarmHorse (add bridle+yoke+cart) → WarHorse (remove cart, add armor)
- ScaleMail (NOT chainmail) — made from monster fish scales
- Flame Armor (Lava Lands) = key progression piece (unlocks molten lava fire source)
- Merchant Cloak removal = Assassin reveal (subtraction, not addition)
- Each campaign ships COMPLETE character at that stage + parts sell separately for upgrading prior bodies

**Impact on existing code:** If any character-related components reference "8 separate characters" or "dual-mode rotation," update text to reflect the layer system. The campaigns sell progression layers, not separate products.

---

## BUILD ORDER RECOMMENDATION

1. **Thresh + Pollinate** (1,709 → 1,730) — always first
2. **Pledged Mark Voting** (`/hexisle/vote`) — remaining from Session 011
3. **HexIsle Cue Card** — remaining from Session 011
4. **Shadow Mark allocation tables + pedestal definitions** — foundation for demand signaling
5. **FeatureThermometer component** — the visible part users interact with
6. **Carry-forward cron + crystallization logic** — the persistence engine
7. **Ranked Choice production tier tables** — commitment layer
8. **Business Card portal update** — first test case for the whole system
9. **X-Ray chain references** — add `relatedEntries` field to FAQ entries for concept linking

---

## KEY CONTEXT FILES

| File | Purpose |
|------|---------|
| `BISHOP_DROPZONE/SHADOW_MARK_DEMAND_SIGNALING_SYSTEM.md` | Complete spec for Shadow Mark demand signaling |
| `BISHOP_DROPZONE/CHARACTER_LAYER_SYSTEM_FOUNDER_CANONICAL.md` | Character layer system (Founder directive) |
| `BISHOP_DROPZONE/CREW_CALL_BOUNTY_SPECIFICATIONS.md` | 7 bounties (already posted by Knight 29b) |
| `BISHOP_DROPZONE/KICKSTARTER_CAMPAIGN_COPY_ALL_13.md` | Campaign page copy (needs updating for layer system) |
| `BISHOP_DROPZONE/XRAY_FAQ_ALL_27_HEXEL_PIECES.md` | Supplemental FAQ content for 27 pieces |
| `platform/src/lib/shadowMarksService.ts` | Existing Shadow Marks (recipe validation — extend, don't replace) |
| `platform/src/lib/brewsterBonus.ts` | Existing Brewster Bonus (reference for SM forced spending) |
| `platform/src/pages/cue-cards/BusinessCardPortal.tsx` | Existing business card portal (update with multi-vendor tiers) |
| `platform/supabase/migrations/20260315000004_print_pipeline_refinement.sql` | Existing Moo pricing |

---

## DEPLOYMENT TARGETS

- lianabanyan.com (main)
- cephas.lianabanyan.com (content)
- All 8 Firebase hosting targets as needed

---

**FOR THE KEEP**
*Bishop Session 012 → Knight Session 30 Prompt*
*March 17, 2026*
*21 innovations to thresh, 2 carried features, Shadow Mark system build, character layer system awareness*
