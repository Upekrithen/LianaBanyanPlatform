# KNIGHT SESSION 138 — Guild & Tribe Benefit Cascade
## Tiered Benefits by Membership Size + Treasury Governance
**Innovation:** #2018 | **Bishop:** 035 | **Date:** March 27, 2026

---

## CONTEXT
K133 built the Guild & Tribe formation system with treasury, visual identity, and membership. This session adds the BENEFIT CASCADE — tiered benefits that unlock as the group grows — plus treasury governance (spending proposals + voting).

The guilds and tribes tables already exist from K133's migration (20260327000004).

## DELIVERABLES

### Deliverable 1: Migration
Create `20260327000009_benefit_cascade.sql`:

**Table: group_benefit_tiers**
- id UUID PK
- group_type TEXT CHECK ('guild','tribe') NOT NULL
- member_threshold INTEGER NOT NULL -- 5, 10, 25, 50, 100
- benefit_name TEXT NOT NULL
- benefit_description TEXT NOT NULL
- benefit_type TEXT CHECK ('discount','priority','treasury','marketplace','governance')
- benefit_value JSONB -- e.g., {"discount_pct": 5} or {"priority_boost": 2}
- created_at TIMESTAMPTZ DEFAULT now()

Seed the 5-tier cascade for Guilds:
- 5 members: "Cooperative Purchasing" (group negotiating power, type: discount, value: {"discount_pct": 3})
- 10 members: "Directory Listing" (Guild appears in search, type: priority, value: {"search_boost": true})
- 25 members: "Treasury Activation" (treasury spending enabled, type: treasury, value: {"spending_enabled": true})
- 50 members: "Reduced Platform Fee" (platform takes 18% instead of 20% on Guild transactions, type: discount, value: {"platform_fee_pct": 18})
- 100 members: "Guild Marketplace" (dedicated section in marketplace, type: marketplace, value: {"dedicated_section": true})

Seed mirror tiers for Tribes:
- 5 members: "Shared Family Table" (Family Table for all Tribe members)
- 10 members: "Group Ordering" (coordinated meal orders across Tribe)
- 25 members: "Tribe Treasury" (treasury spending enabled)
- 50 members: "Neighborhood Deals" (local business discounts for Tribe members)
- 100 members: "Community Hub" (dedicated Tribe section in marketplace)

**Table: treasury_spend_proposals**
- id UUID PK
- group_type TEXT NOT NULL CHECK ('guild','tribe')
- group_id UUID NOT NULL
- proposed_by UUID REFERENCES auth.users(id) NOT NULL
- title TEXT NOT NULL
- description TEXT
- amount NUMERIC(10,2) NOT NULL CHECK (amount > 0)
- recipient TEXT -- who/what gets paid
- status TEXT DEFAULT 'proposed' CHECK ('proposed','voting','approved','rejected','executed','expired')
- votes_for INTEGER DEFAULT 0
- votes_against INTEGER DEFAULT 0
- vote_deadline TIMESTAMPTZ -- 72h from proposal
- executed_at TIMESTAMPTZ
- created_at TIMESTAMPTZ DEFAULT now()

**Table: treasury_votes**
- id UUID PK
- proposal_id UUID REFERENCES treasury_spend_proposals(id) ON DELETE CASCADE
- voter_id UUID REFERENCES auth.users(id) NOT NULL
- vote BOOLEAN NOT NULL -- true = for, false = against
- created_at TIMESTAMPTZ DEFAULT now()
- UNIQUE(proposal_id, voter_id)

RLS: Group members can read proposals and vote. Only activated groups (25+ members) can create proposals.

### Deliverable 2: Hooks
Create `platform/src/hooks/useBenefitCascade.ts`:
- useGroupBenefits(groupType, groupId) — current tier + unlocked benefits
- useNextBenefitTier(groupType, memberCount) — what's the next unlock
- useBenefitProgress(groupType, memberCount) — progress toward next tier (%)

Create `platform/src/hooks/useTreasuryGovernance.ts`:
- useSpendProposals(groupType, groupId) — list proposals with vote counts
- useCreateProposal() — submit new spend proposal (72h voting window)
- useVoteOnProposal() — cast vote
- useExecuteProposal() — execute approved proposal (deduct from treasury)

### Deliverable 3: BenefitCascadeCard Component
Create `platform/src/components/groups/BenefitCascadeCard.tsx`:
- Visual progress bar showing current tier and next unlock
- Stacked benefit cards (locked/unlocked states)
- Member recruitment CTA: "Invite 3 more members to unlock [next benefit]"
- Wire into GuildDetail and TribeDetail pages

### Deliverable 4: TreasuryGovernance Component
Create `platform/src/components/groups/TreasuryGovernance.tsx`:
- Proposal list with vote counts and deadlines
- Create proposal form (title, description, amount, recipient)
- Vote buttons (For/Against) with countdown timer
- Execution button (visible to group leader when approved)
- Wire into GuildDetail and TribeDetail pages (treasury tab)

### Deliverable 5: Canonical Stats
- No count change (implementing existing #2018)

## RULES
- Credits NEVER cash out. No securities language. C+20 floor.
- Treasury spending requires 25+ members (enforced by tier system)
- Proposals expire after 72h if no quorum (majority of members who vote)
- Platform fee reduction at 50 members: 20% → 18% (NOT lower — C+20 is constitutional floor, 18% is a 2% discount ON the platform fee, not below C+20)
- WAIT — actually the C+20 floor means the MINIMUM margin is 20%. So the "reduced platform fee" at 50 members should be something ELSE, not a fee reduction below 20%. Change this to: "Priority Support" (dedicated support channel for Guild issues, type: governance, value: {"priority_support": true})

## BUILD ORDER
1. Migration → 2. Hooks → 3. BenefitCascadeCard → 4. TreasuryGovernance → 5. Wire into Guild/Tribe detail pages → 6. Build → Deploy

FOR THE KEEP!
