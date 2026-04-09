# KNIGHT SESSION 128: Cold Start Cue Cards — Four Pathways to Captain

## Brief
Call `brief_me("cold start, cue cards, food node, manufacturing node, service node, local business node, captain pathway")`

## Context
K127 builds the Business Onboarding Campaign system. K128 builds the guided Cue Card experience that shows new members the four Cold Start pathways: Food, Manufacturing, Service, and Local Business. Each pathway has its own Cue Card with step-by-step guidance for becoming a Captain in that domain.

Canonical stats: 2,015 innovations | 1,511 claims | 10 provisionals | 23 production systems

**CRITICAL RULES:**
- No securities language.
- Credits can NEVER be cashed out to fiat. One-way valve. Irrevocable.
- LB Card is funded separately (direct deposit/bank transfer), NOT from Credits.

---

## Deliverable 1: Cold Start Hub Page

### Page: `/start/cold-start` — Pick Your Path

```
┌────────────────────────────────────────────────────────┐
│  🧊 COLD START                                          │
│  "What you do in little, you do in much."               │
│                                                         │
│  Start with $0 and your drive. Pick a path.             │
│  Prove yourself with 10. Graduate to 50. Then 100.      │
│  Then 1,000.                                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ 🍽️            │  │ 🏭            │                    │
│  │ FOOD NODE     │  │ MAKE NODE    │                    │
│  │               │  │              │                    │
│  │ Start a food  │  │ Start a      │                    │
│  │ campaign.     │  │ factory from │                    │
│  │ Onboard a     │  │ your garage. │                    │
│  │ restaurant.   │  │ 3D print →   │                    │
│  │ Feed your     │  │ mold → inject│                    │
│  │ neighborhood. │  │ Scale up.    │                    │
│  │               │  │              │                    │
│  │ [Start →]     │  │ [Start →]    │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ 🔧            │  │ 🏪            │                    │
│  │ SERVICE NODE  │  │ LOCAL BIZ    │                    │
│  │               │  │              │                    │
│  │ Offer your    │  │ Know a great │                    │
│  │ skills.       │  │ local spot?  │                    │
│  │ Plumbing,     │  │ Nominate it. │                    │
│  │ tutoring,     │  │ Rally your   │                    │
│  │ cleaning,     │  │ neighbors.   │                    │
│  │ auto repair.  │  │ Walk in with │                    │
│  │               │  │ the card.    │                    │
│  │ [Start →]     │  │ [Start →]    │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
│  ⚓ All paths lead to Captain.                           │
│  Every Captain starts at 10.                             │
└────────────────────────────────────────────────────────┘
```

## Deliverable 2: Food Node Cue Card

### Page: `/start/cold-start/food`

Step-by-step wizard (similar to Turn-Key wizard from K116):

**Step 1: Pick Your Play**
- [ ] Nominate a restaurant I love (→ Business Campaign)
- [ ] I have a food truck / catering business (→ Partner signup)
- [ ] I want to cook from a commercial kitchen (→ Ghost kitchen)
- [ ] I want to coordinate food deliveries (→ Captain track)

**Step 2: Set Up Your Campaign** (if nominating)
- Business name, type, city
- Why you love this place
- Your seed pledge amount (Credits)
- Auto-creates Business Campaign from K127

**Step 3: Rally Your Crew**
- Share link to campaign
- Invite neighbors to pledge
- Watch the demand bar grow

**Step 4: Close the Deal**
- At threshold: generate Pitch Packet
- Walk in with LB Card + Packet
- Record outcome (accepted/declined)

**Step 5: Become a Food Captain**
- First successful onboarding → Captain of 10
- Manage first 10 group orders
- Confirm deliveries → reputation boost
- Scale to Captain of 50

## Deliverable 3: Manufacturing Node Cue Card

### Page: `/start/cold-start/manufacturing`

**Step 1: What Can You Make?**
- [ ] 3D Printing (FDM/SLA/SLS)
- [ ] CNC / Laser cutting
- [ ] Injection molding
- [ ] Woodworking
- [ ] Metalworking
- [ ] Sewing / Textiles
- [ ] Other

**Step 2: List Your Capabilities**
- Machines you have
- Materials you work with
- Capacity (units/week)
- Location (city/state)
- → Creates Factory Node profile

**Step 3: Accept Your First Orders**
- Browse open production requests
- Stake 100 Marks as Captain collateral
- Accept your first batch (start with 10 units)

**Step 4: Fulfill & Scale**
- Produce → ship → delivery confirmed by 1/3 of recipients
- Marks returned + reputation boost
- Graduate: 10 → 50 → 100 → 1,000

**Step 5: Production Cascade**
- At 50+ orders: consider SLS mold masters
- At 500+: injection molding partnership (FormNow/Xometry)
- The Tiered Production Cascade (#1943) activates

## Deliverable 4: Service Node Cue Card

### Page: `/start/cold-start/service`

**Step 1: What Do You Do?**
- [ ] Plumbing / HVAC
- [ ] Electrical
- [ ] Auto repair / maintenance
- [ ] Tutoring / education
- [ ] Cleaning (home/commercial)
- [ ] Pet services (grooming/sitting/walking)
- [ ] Personal training / fitness
- [ ] Photography / videography
- [ ] Other

**Step 2: Set Your Availability**
- Service area (zip codes or radius)
- Hours available
- Pricing (hourly or per-job)
- Certifications/licenses (if applicable)
- → Creates Service Provider profile

**Step 3: Get Your First Clients**
- Platform matches you to local requests
- Stake 50 Marks as reliability collateral
- Accept first 10 bookings

**Step 4: Build Reputation**
- Complete service → client confirms → reputation boost
- ADAPT Score increases with each confirmed job
- Graduate: 10 → 50 → 100

## Deliverable 5: Local Business Node Cue Card

### Page: `/start/cold-start/local-business`

**Step 1: Pick a Business You Love**
- Name, type, location
- Why you love them
- → Redirects to `/campaigns/nominate` with pre-filled info

**Step 2: Seed the Campaign**
- Pledge your own Credits (skin in the game)
- Optionally stake Marks (Captain pre-seed)
- Share with your network

**Step 3: Watch Demand Grow**
- Campaign page shows live pledge count
- Community rallies around businesses they want

**Step 4: Generate the Pitch Packet**
- At threshold → download/print Pitch Packet
- QR code links to live campaign

**Step 5: Walk In and Close**
- Bring LB Card + Pitch Packet
- "This many people want to buy from you. Accept this card. Let's go."
- Record outcome → if accepted, business onboarded → you're a Captain

## Deliverable 6: Navigation + Routes

```tsx
<Route path="/start/cold-start" element={<ColdStartHub />} />
<Route path="/start/cold-start/food" element={<FoodNodeCueCard />} />
<Route path="/start/cold-start/manufacturing" element={<ManufacturingNodeCueCard />} />
<Route path="/start/cold-start/service" element={<ServiceNodeCueCard />} />
<Route path="/start/cold-start/local-business" element={<LocalBusinessNodeCueCard />} />
```

Update `/start` (WhatDoYouWantFlow from K118) to include "Cold Start — $0 to Captain" as a prominent option.

### .BIZ Captain Deck Cards
Update the .BIZ landing (when K123 is built) to link Cold Start card to `/start/cold-start`.

### Canonical Stats
- `innovationCount: 2015`
- `productionSystems: 23`

## Build + Deploy all 8 Firebase hosting targets.

## Quality Checks
- [ ] /start/cold-start shows 4 pathway cards
- [ ] Each pathway has a complete step-by-step wizard
- [ ] Food pathway creates Business Campaign on completion
- [ ] Manufacturing pathway creates Factory Node profile
- [ ] Service pathway creates Service Provider profile
- [ ] Local Business pathway redirects to /campaigns/nominate
- [ ] All 4 pathways end with Captain onboarding CTA
- [ ] /start includes Cold Start option
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
