# KNIGHT SESSION 138 — Guild & Tribe Benefit Cascade
## Tiered Benefits by Membership Size + Manufacturing Tier Routing
**Innovations:** #2018 (Guild Benefit Cascade), Pawn B20 #5 (Manufacturing Tiers) | **Bishop:** 035

---

## CONTEXT
K133 built the Guild and Tribe system (tables, hooks, formation wizards, hub pages). This session adds the BENEFIT CASCADE — tiered benefits that unlock as Guild/Tribe membership grows — plus manufacturing tier routing from Pawn's research.

## DELIVERABLES

### Deliverable 1: Migration
Create `20260327000009_benefit_cascade.sql`:

**Table: group_benefit_tiers**
- id UUID PK
- group_type TEXT CHECK ('guild','tribe')
- member_threshold INTEGER NOT NULL — unlock at this many members
- benefit_name TEXT NOT NULL
- benefit_description TEXT
- benefit_type TEXT CHECK ('discount','priority','access','fee_reduction','marketplace','manufacturing')
- benefit_value JSONB — flexible: {discount_pct: 10}, {fee_reduction_pct: 5}, {access_level: 'premium'}
- active BOOLEAN DEFAULT true
- created_at TIMESTAMPTZ DEFAULT now()

Seed the standard cascade:
```
-- Guild Benefits
(guild, 5, 'Group Negotiating Power', 'Cooperative purchasing discounts for Guild members', 'discount', {"discount_pct": 5})
(guild, 10, 'Directory Listing', 'Guild appears in Guild Directory with search priority', 'priority', {"search_boost": 1.5})
(guild, 25, 'Treasury Activation', 'Guild Treasury unlocks + design contest capability', 'access', {"treasury": true, "contests": true})
(guild, 50, 'Reduced Platform Fees', 'Guild transactions pay reduced platform margin', 'fee_reduction', {"fee_reduction_pct": 5})
(guild, 100, 'Guild Marketplace Section', 'Dedicated marketplace section for Guild products/services', 'marketplace', {"section": true})

-- Tribe Benefits
(tribe, 3, 'Family Table Access', 'Shared meal planning and group ordering', 'access', {"family_table": true})
(tribe, 5, 'Group Purchasing', 'Collective buying power for household goods', 'discount', {"discount_pct": 3})
(tribe, 10, 'Tribe Directory Listing', 'Tribe appears in community directory', 'priority', {"search_boost": 1.2})
(tribe, 15, 'Shared Treasury', 'Tribe Treasury activates', 'access', {"treasury": true})
(tribe, 25, 'Tribe Marketplace Shelf', 'Curated shelf for Tribe-endorsed products', 'marketplace', {"shelf": true})
```

**Table: manufacturing_tiers**
- id UUID PK
- tier_level INTEGER CHECK (1,2,3)
- min_units INTEGER NOT NULL
- max_units INTEGER
- tier_name TEXT NOT NULL
- dominant_technology TEXT NOT NULL
- lead_time_range TEXT
- tooling_cost_range TEXT
- unit_cost_range TEXT
- recommended_partners JSONB — array of {name, tech, lead_time, notes}
- cooperative_leverage TEXT — what the co-op can negotiate at this tier
- created_at TIMESTAMPTZ DEFAULT now()

Seed from Pawn's research:
```
(1, 1, 99, 'Proof of Concept', '3D Print (SLA/SLS/FDM)', '3-21 days', '$0', '$15-80/unit', [...Protolabs, Xometry, Fictiv, Shapeways...], 'Negotiated bulk SLA/SLS rates across all creators')
(2, 100, 999, 'First Production Run', 'Bridge Injection Mold', '5-8 weeks', '$5K-20K', '$12-30/unit', [...Protolabs, Xometry, Fictiv, ICOMold, Rex Plastics...], 'Platform-wide preferred mold shop agreements; shared bridge tooling for generic components')
(3, 1000, null, 'Scale Production', 'Production Injection Mold', '9-20 weeks', '$15K-80K', '$5-14/unit', [...Protolabs, Xometry, Fictiv, offshore vetted...], 'Group purchasing on production materials; negotiated offshore tooling network')
```

### Deliverable 2: Hooks
Create `platform/src/hooks/useBenefitCascade.ts`:
- useGroupBenefits(groupType, memberCount) — returns unlocked + upcoming benefits
- useManufacturingTier(unitCount) — returns recommended tier + partner info
- useTierRouting() — mutation that logs a creator's tier selection for analytics

### Deliverable 3: BenefitCascadeCard Component
Create `platform/src/components/groups/BenefitCascadeCard.tsx`:
- Shows current unlocked benefits with green checkmarks
- Shows NEXT benefit threshold with progress bar ("12/25 members — Treasury Activation unlocks at 25!")
- Shows future benefits grayed out with member counts
- Used on both GuildDetail and TribeDetail pages

### Deliverable 4: ManufacturingTierRouter Component
Create `platform/src/components/manufacturing/ManufacturingTierRouter.tsx`:
- Input: pledge/order count
- Output: recommended tier card with:
  - Technology recommendation
  - Cost estimates (tooling + per-unit)
  - Lead time estimate
  - Recommended partners (from seeded data)
  - Cooperative leverage note
  - 90-day window compatibility badge (GREEN/YELLOW/RED)
- Used in: campaign detail pages, maker dashboard, cold start manufacturing pathway

### Deliverable 5: Integration Points
- Add BenefitCascadeCard to GuildDetail.tsx (after members tab)
- Add BenefitCascadeCard to TribeDetail.tsx (after members tab)
- Add ManufacturingTierRouter to ManufacturingNodeCueCard.tsx (step 4 or 5)
- Add ManufacturingTierRouter to campaign PitchPacketPage (as supplementary info)

### Deliverable 6: Routes + Stats
- No new routes needed (components integrate into existing pages)
- Update useCanonicalStats if innovation count changes

## RULES
- Credits NEVER cash out. One-way valve.
- C+20 constitutional floor.
- No securities language.
- 90-day window is PAYMENT HOLD, not fulfillment — Tier 3 CANNOT promise delivery in 90 days.
- Tooling ownership clause: creators MUST own their molds, not the manufacturer.
- Shared tooling at Tier 2 is a cooperative benefit — multiple creators can reuse generic molds.

## BUILD ORDER
1. Migration → 2. Hooks → 3. BenefitCascadeCard → 4. ManufacturingTierRouter → 5. Integrations → 6. Stats → Build → Deploy

FOR THE KEEP!
