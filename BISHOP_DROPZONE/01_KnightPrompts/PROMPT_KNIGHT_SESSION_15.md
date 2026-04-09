# Knight Build Prompt — Session 15: Creator Draft Pick & Influencer Recruitment System
# FOR KNIGHT: Build the Instagram-to-LB creator recruitment pipeline

**Date:** March 14, 2026
**Source:** Bishop (Founder's Instagram Creator Draft Pick concept, Session 11B continued)

---

## IMPORTANT: SEC Language Rules

Throughout ALL code, comments, UI text, and variable names:
- "investment return" → "earned allocation authority" / "Service Allocation Authority (SAA)"
- "collateral" → "allocation budget" / "backing authority"
- "profit" / "dividend" → "operational surplus" / "service margin"
- "equity" → "participation" / "service allocation"
- "invest" → "sponsor" / "contribute" / "back"

The cooperative OWNS Joules. Members earn authority to DIRECT them, not own them.

---

## Task 1: Creator Pitch Page (Multi-Path Onboarding)

Create `src/pages/CreatorPitchPage.tsx`

### Route: `/join/creator` (ExplorerRoute — public)

### Flow:
1. Hero section: "Your craft deserves a cooperative home."
2. "What do you create?" questionnaire with 5 options:
   - **Physical Products** (3D prints, gadgets, handmade goods) → links to Mall/Marketplace info
   - **Art & Design** (prints, digital art, illustrations) → links to Cost+20 pricing info
   - **Food** (recipes, meal kits, baked goods) → links to Let's Make Dinner
   - **Music & Content** (songs, videos, courses) → links to JukeBox
   - **Business Ideas** (services, inventions, startups) → links to Let's Make Bread
3. Each option shows:
   - What LB offers for their type (no platform extraction, IP guidance, pre-orders)
   - A benefits card showing: Medallion system tiers, Influencer status, Cost+20 pricing
   - "Join as a Creator" CTA → existing signup flow with `creator_type` param
4. Bottom: "Know a creator? Invite them." → links to referral/cue card system

### Red Carpet Integration
- If URL has `?ref=USERNAME` param, show personalized welcome: "USERNAME thinks you'd be great here"
- If URL has `?type=maker` or `?type=food` etc., pre-select that category

---

## Task 2: Creator Referral & Cue Card System

### 2a. Schema Migration: `20260314000007_creator_referral_system.sql`

```sql
CREATE TABLE IF NOT EXISTS public.creator_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_handle TEXT NOT NULL,  -- Instagram handle or email
  referred_platform TEXT NOT NULL DEFAULT 'instagram'
    CHECK (referred_platform IN ('instagram', 'etsy', 'tiktok', 'email', 'other')),
  cue_card_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referred_user_id UUID REFERENCES auth.users(id),  -- NULL until they sign up
  signed_up_at TIMESTAMPTZ,  -- NULL until they sign up
  reward_tier TEXT,  -- pioneer/vanguard/pathfinder/trailblazer/guide/ambassador
  reward_marks NUMERIC(8,2) DEFAULT 0,
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_referrals_referrer ON creator_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_creator_referrals_handle ON creator_referrals(referred_handle);
ALTER TABLE public.creator_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON creator_referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users create referrals" ON creator_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Six-tier referral reward config
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('creator_referral_tier_1_name', 'Pioneer', 'text', false, 'SYSTEM', 'First 100 referrals tier name', 'creator_referral'),
  ('creator_referral_tier_1_max', '100', 'integer', false, 'SYSTEM', 'First tier max referral count', 'creator_referral'),
  ('creator_referral_tier_1_reward', '10', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 1', 'creator_referral'),
  ('creator_referral_tier_2_name', 'Vanguard', 'text', false, 'SYSTEM', 'Tier 2 name (101-500)', 'creator_referral'),
  ('creator_referral_tier_2_max', '500', 'integer', false, 'SYSTEM', 'Tier 2 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_2_reward', '5', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 2', 'creator_referral'),
  ('creator_referral_tier_3_name', 'Pathfinder', 'text', false, 'SYSTEM', 'Tier 3 name (501-2000)', 'creator_referral'),
  ('creator_referral_tier_3_max', '2000', 'integer', false, 'SYSTEM', 'Tier 3 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_3_reward', '3', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 3', 'creator_referral'),
  ('creator_referral_tier_4_name', 'Trailblazer', 'text', false, 'SYSTEM', 'Tier 4 name (2001-10000)', 'creator_referral'),
  ('creator_referral_tier_4_max', '10000', 'integer', false, 'SYSTEM', 'Tier 4 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_4_reward', '2', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 4', 'creator_referral'),
  ('creator_referral_tier_5_name', 'Guide', 'text', false, 'SYSTEM', 'Tier 5 name (10001-50000)', 'creator_referral'),
  ('creator_referral_tier_5_max', '50000', 'integer', false, 'SYSTEM', 'Tier 5 max cumulative referrals', 'creator_referral'),
  ('creator_referral_tier_5_reward', '1.5', 'text', false, 'SYSTEM', 'Marks per successful referral in tier 5', 'creator_referral'),
  ('creator_referral_tier_6_name', 'Ambassador', 'text', false, 'SYSTEM', 'Tier 6 name (50001+)', 'creator_referral'),
  ('creator_referral_tier_6_reward', '1', 'integer', false, 'SYSTEM', 'Marks per successful referral in tier 6 (universal floor)', 'creator_referral')
ON CONFLICT (parameter_key) DO NOTHING;
```

### 2b. Cue Card Component

Create `src/components/cue-cards/InviteCreatorCard.tsx`

- Card text: "Know a maker? Invite them. Be one of the first 100 to bring a creator and earn Pioneer rewards."
- Shows current global referral count and which tier is active
- "Invite a Creator" button → opens modal with:
  - Creator handle input (Instagram username)
  - Platform selector (Instagram, Etsy, TikTok, email)
  - Optional personal message
  - Preview of the cue card that will be generated
  - "Send Invitation" creates the `creator_referrals` row with timestamp

### 2c. Cue Card Placement
- Dashboard (for authenticated users)
- CreatorPitchPage (bottom)
- Marketplace page

---

## Task 3: Creator Portfolio Showcase

Create `src/components/creator/CreatorShowcase.tsx`

For creators who have signed up, their product listing in the Marketplace should show:
- Creator name and avatar
- "See their work" link → opens their Instagram/external profile in new tab
- Product images (uploaded to LB or linked)
- Cost+20 price display
- "Back this creator" button (BandWagon integration — uses ProjectBackingFlow)
- Medallion tier badge

This integrates with existing Marketplace components — it's an enhanced product card for creator-sourced items.

---

## Task 4: Innovation Migration

Create `20260314000008_innovation_log_session_11b_batch5_creator_draft.sql`

Insert innovations #1631–#1639:
1. #1631 Creator Draft Pick Protocol (Bag 8)
2. #1632 Verified Pre-Order Production Scaling (Bag 7)
3. #1633 Multi-Path Creator Pitch Page (Bag 8)
4. #1634 Red Carpet Creator Integration (Bag 8)
5. #1635 Creator-to-Creator Daisy Chain (Bag 8)
6. #1636 Creator Benefits Showcase Card (Bag 8)
7. #1637 Six-Tier Diminishing Referral Reward (Bag 7)
8. #1638 Cue Card Recruitment Protocol (Bag 8)
9. #1639 In-Platform Social Media Viewer (Bag 9)

Update innovation count to **1,639** in all platform locations.

---

## Task 5: Verify & Commit

- `npx tsc --noEmit` passes
- Innovation count = 1,639 everywhere
- Commit:

```
feat: Creator Draft Pick system, Pitch Page, referral tiers, showcase (Session 15)

- Create CreatorPitchPage with multi-path onboarding questionnaire
- Create creator_referrals schema with six-tier reward system
- Create InviteCreatorCard cue card for recruitment
- Create CreatorShowcase for marketplace integration
- Thresh 9 innovations (#1631-#1639), count to 1,639
- All SEC-safe language verified

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## References

- Instagram Factor-y collection: ~100+ posts, ~30-40 unique creators
- First 5 identified: @fusefoxdesign (Tactocrat), @greg.dean.mann (lamps), @moritz__walter (tools), @elega.yyc (clips), @emgi3d (mechanisms)
- BandWagon: `src/components/bandwagon/*`
- Red Carpet: check existing red carpet components for integration points
- Cue cards: `src/components/cue-cards/*`
- Existing Marketplace: `src/pages/Marketplace.tsx`
- SEC rules: MEMORY.md

---

*Prepared by Bishop. March 14, 2026.*
*FOR THE KEEP.*
