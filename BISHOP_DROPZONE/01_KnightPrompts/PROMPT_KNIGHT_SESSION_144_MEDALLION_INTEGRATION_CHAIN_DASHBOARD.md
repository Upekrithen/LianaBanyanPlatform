# KNIGHT SESSION 144 — Medallion Integration + Chain Dashboard + Kickstarter Pipeline
## Bishop 036 | March 27, 2026
## Innovations: #2029-#2033 + Kickstarter Chain Engine (B011)

---

## CONTEXT

The 2nd Second medallion design is finalized — two sides:
- **Side A:** Ship's wheel (gear-shaped), sailing ship center, text: "A ship in harbor is safe, but that is not what ships are built for."
- **Side B:** Same gear, crossed ACME screws (Canister System) behind a QR code, text: "THE 2ND SECOND INDUSTRIAL REVOLUTION"

The QR code on the medallion links to the platform. The medallion IS the Cue Card for manufacturing recruitment. This session builds:
1. The **Chain Dashboard** — Kickstarter chain tracking (13-campaign chain, 5% stacking bonus, 14-day timer)
2. The **Medallion Showcase** — digital representation of the physical medallion, earned through chain participation
3. **Kickstarter sync hooks** — importing backer data and linking to chain status
4. **HexIsle Downloads page** — STL file library with tier classification

**Depends on:** K143 (2nd Second Landing), K142 (Production Projects), K131 (Cue Card Generator / WelcomeGatePage), K124 (Leadership Pedestals / Ship Medallion), B011 (Kickstarter Strategy).

---

## DELIVERABLE 1: Migration — `20260327000014_chain_kickstarter.sql`

```sql
-- K144: Chain Dashboard + Kickstarter Sync + HexIsle Downloads

-- Kickstarter campaign tracking
CREATE TABLE IF NOT EXISTS kickstarter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_number INTEGER NOT NULL UNIQUE CHECK (campaign_number BETWEEN 1 AND 13),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL CHECK (product_type IN ('component','character','creature','assembly')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','live','funded','fulfilled','cancelled')),
  goal_amount NUMERIC NOT NULL DEFAULT 1000,
  raised_amount NUMERIC DEFAULT 0,
  backer_count INTEGER DEFAULT 0,
  launch_date DATE,
  end_date DATE,
  fulfillment_date DATE,
  kickstarter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Member chain tracking
CREATE TABLE IF NOT EXISTS member_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chain_length INTEGER DEFAULT 0,
  max_chain_length INTEGER DEFAULT 0,
  current_bonus_pct NUMERIC DEFAULT 0,
  chain_expires_at TIMESTAMPTZ,
  last_backed_campaign INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Individual chain links (one per campaign backed)
CREATE TABLE IF NOT EXISTS chain_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES kickstarter_campaigns(id),
  backed_at TIMESTAMPTZ DEFAULT now(),
  pledge_amount NUMERIC,
  pledge_tier TEXT,
  chain_position INTEGER NOT NULL,
  bonus_pct NUMERIC NOT NULL,
  UNIQUE(user_id, campaign_id)
);

-- HexIsle STL downloads library
CREATE TABLE IF NOT EXISTS hexisle_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_name TEXT NOT NULL,
  piece_slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'terrain','character','creature','component','accessory','assembly'
  )),
  tier TEXT NOT NULL CHECK (tier IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  stl_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  innovation_number INTEGER,
  download_count INTEGER DEFAULT 0,
  submitted_by UUID REFERENCES profiles(id),
  campaign_id UUID REFERENCES kickstarter_campaigns(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE kickstarter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read campaigns" ON kickstarter_campaigns FOR SELECT USING (true);

ALTER TABLE member_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own chain" ON member_chains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chain" ON member_chains FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chain_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own links" ON chain_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own links" ON chain_links FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE hexisle_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read downloads" ON hexisle_downloads FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chain_links_user ON chain_links(user_id, chain_position);
CREATE INDEX IF NOT EXISTS idx_downloads_category ON hexisle_downloads(category, tier);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON kickstarter_campaigns(status);

-- Seed the 13 campaigns from B011 Kickstarter Strategy
INSERT INTO kickstarter_campaigns (campaign_number, title, slug, product_type, goal_amount) VALUES
  (1, 'SlottedTop — Universal Hex Adapter', 'slotted-top', 'component', 1000),
  (2, 'Peasant — Starter Character', 'peasant', 'character', 1000),
  (3, 'Merchant — Starter Character', 'merchant', 'character', 1000),
  (4, 'Golden Lotus — Tesla Valve', 'golden-lotus', 'component', 1000),
  (5, 'Farmer / Warrior — Dual Class', 'farmer-warrior', 'character', 1000),
  (6, 'Sawtooth Coral — Bedrock + Timing Belt', 'sawtooth-coral', 'component', 1000),
  (7, 'Healer / Assassin — Dual Class', 'healer-assassin', 'character', 1000),
  (8, 'War Horse — Mountable Creature', 'war-horse', 'creature', 1000),
  (9, 'King — Capstone Character', 'king', 'character', 1000),
  (10, 'Pneumatic Palm Tree — Hydraulic', 'pneumatic-palm', 'component', 2000),
  (11, 'Queen — Capstone Character', 'queen', 'character', 1000),
  (12, 'Hexel Assembly — Complete Stack', 'hexel-assembly', 'assembly', 5000),
  (13, 'Tereno Water Table — Hydraulic Surface', 'water-table', 'assembly', 12000);
```

---

## DELIVERABLE 2: Hooks — `useChainDashboard.ts`

Create `/src/hooks/useChainDashboard.ts`:

```typescript
// useChainStatus — member's chain data
// - getMyChain() → chain_length, max_chain, bonus_pct, expires_at, links[]
// - getChainLinks() → all campaign links with dates and bonuses
// - isChainActive() → boolean (expires_at > now)
// - getTimeRemaining() → seconds until chain expires
// - getNextCampaign() → next upcoming campaign from kickstarter_campaigns

// useCampaigns — all 13 campaigns
// - getCampaigns() → list with status, funding progress, backer count
// - getCampaign(slug) → single campaign detail

// useHexIsleDownloads — STL library
// - getDownloads(category?, tier?) → filtered download list
// - incrementDownload(id) → bump download_count
// - getMyDownloads() → downloads the user has accessed

// useChainLeaderboard — community chain stats
// - getLeaderboard() → top 10 chains by length
// - getChainStats() → total backers, average chain, longest chain
```

---

## DELIVERABLE 3: Chain Dashboard Page — `ChainDashboardPage.tsx`

Create `/src/pages/ChainDashboardPage.tsx` at route `/chain`:

**Layout (3 sections):**

**Section 1: My Chain**
- Visual chain: horizontal linked circles, one per campaign backed
  - Lit (gold) = backed
  - Unlit (gray) = not backed
  - Pulsing (amber) = next in sequence
- Chain length: "5 links — 25% bonus"
- Timer: "Chain expires in 8 days 14 hours" (countdown)
- Next campaign: "Campaign 6: Sawtooth Coral — launches Oct 27"

**Section 2: Campaign Roadmap**
- All 13 campaigns in a vertical timeline
- Each shows: number, title, type icon (component/character/creature/assembly), status, funding progress
- Character campaigns (Leap Frog) marked with a different color
- Current/next campaign highlighted

**Section 3: Chain Leaderboard**
- Top 10 longest chains
- "Your position: #47 of 312 chain holders"
- Total community stats: X backers, Y average chain, Z% retention

**The Medallion:**
- At chain length 13 (complete): display the digital medallion (both sides)
- "You've completed the HexIsle Chain. Your Ship Medallion is earned."
- Link to claim physical medallion (when available)

---

## DELIVERABLE 4: HexIsle Downloads Page — `HexIsleDownloadsPage.tsx`

Create `/src/pages/HexIsleDownloadsPage.tsx` at route `/hexisle/downloads`:

**Layout:**
- Grid of download cards, filterable by category and tier
- Each card shows: piece name, tier badge (gold/silver/blue/green/yellow/white), thumbnail, download count, "Download STL" button
- Tier legend at top explaining the 6-tier classification system
- "Submit Improvement" button → links to `/piggyback` (or Bounty Arena)
- Campaign tag showing which Kickstarter campaign includes this piece

**Tier badges (from B011):**
- Tereno Certified (gold)
- Tereno Approved (silver)
- HexIsle Official (blue)
- HexIsle Compatible (green)
- HexIsle Adaptable (yellow)
- HexIsle Inspired (white)

**Access control:**
- $5+ Kickstarter backers can download (check chain_links for the relevant campaign)
- $5/year members can download all
- Non-members see the library but get a "Join to download" CTA

---

## DELIVERABLE 5: Medallion Display Component — `MedallionDisplay.tsx`

Create `/src/components/hexisle/MedallionDisplay.tsx`:

- Two-sided medallion display (flippable on click/tap)
- Side A: Ship + quote (gear border, blue/gold colors matching the physical medallion)
- Side B: Crossed ACME screws + QR code + "THE 2ND SECOND INDUSTRIAL REVOLUTION"
- Use CSS 3D transform for the flip animation (rotateY)
- Props: `size: 'sm' | 'md' | 'lg'`, `earned: boolean` (gray/locked if not earned), `chainLength: number`
- If chain < 13: show as grayed out with "X more links to earn" overlay
- If chain = 13: full color, flip animation enabled, "EARNED" badge

Render this in:
- Chain Dashboard (Section: My Chain, when complete)
- Member profile page (badge area)
- 2nd Second Landing page (hero section)

---

## DELIVERABLE 6: Routes and Navigation

**Routes (add to App.tsx with lazy imports):**
```
/chain → ChainDashboardPage
/hexisle/downloads → HexIsleDownloadsPage
```

**Navigation:**
- Dashboard sidebar: "My Chain" with Link2 icon
- HexIsle portal: "Downloads" with Download icon
- 2nd Second landing: link to /chain

**Stats:** Update `useCanonicalStats.ts`:
- innovationCount: 2074 (no change — K143 handles this)

---

## CRITICAL RULES

1. **Chain timer: 14 days.** Extends to 21 days during Thanksgiving/holiday skips.
2. **20% floor on chain break.** If chain breaks, bonus drops to 20%, NOT zero.
3. **5% per link.** Non-negotiable. 13 links = 65% max bonus.
4. **No securities language.** "Backing" not "investing." "Bonus" not "return."
5. **STL downloads require $5 tier OR membership.** No free downloads of proprietary designs.
6. **Medallion is EARNED at chain 13.** Cannot be purchased separately.

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `supabase/migrations/20260327000014_chain_kickstarter.sql` | CREATE |
| 2 | `src/hooks/useChainDashboard.ts` | CREATE |
| 3 | `src/pages/ChainDashboardPage.tsx` | CREATE |
| 4 | `src/pages/HexIsleDownloadsPage.tsx` | CREATE |
| 5 | `src/components/hexisle/MedallionDisplay.tsx` | CREATE |
| 6 | `src/App.tsx` | MODIFY (routes) |
| 7 | `src/components/AppSidebar.tsx` | MODIFY (nav) |

**7 files (5 new, 2 modified).**

---

**FOR THE KEEP.** 🏰
