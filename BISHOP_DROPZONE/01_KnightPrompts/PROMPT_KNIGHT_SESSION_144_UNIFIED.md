# KNIGHT SESSION 144 — Medallion Deck Card + Chain Dashboard + HexIsle Downloads
## Bishop 036 | March 27, 2026
## Innovations: #2029-#2033 + Kickstarter Chain Engine (B011)

---

## CONTEXT

The 2nd Second medallion design is finalized — two sides:
- **Side A:** Ship's wheel (gear-shaped), sailing ship center, text: "A ship in harbor is safe, but that is not what ships are built for."
- **Side B:** Same gear, crossed ACME screws (Canister System) behind a QR code, text: "THE 2ND SECOND INDUSTRIAL REVOLUTION"

The Founder has provided both medallion images. Save them to `/public/images/medallion-ship-side-a.png` and `/public/images/medallion-2nd-second-side-b.png`.

The medallion IS the Cue Card for manufacturing recruitment. The QR code links to the platform.

**Depends on:** K143 (2nd Second Landing + Manufacturing Ladder), K142 (Production Projects), K131 (CueCardGeneratorV2 / WelcomeGatePage), K124 (Leadership Pedestals / Ship Medallion), K123 (PortalDeckCard 3D flip component), B011 (Kickstarter Strategy).

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

-- Seed the 13 campaigns
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

## DELIVERABLE 2: Medallion Flip Card Component — `MedallionDisplay.tsx`

Create `/src/components/hexisle/MedallionDisplay.tsx`:

**This is a flip-card DECK CARD using the same 3D CSS transform pattern from PortalDeckCard (K123).**

- Two-sided card with CSS `perspective`, `rotateY(180deg)` on hover/tap
- **Side A:** `/public/images/medallion-ship-side-a.png` — ship + quote
- **Side B:** `/public/images/medallion-2nd-second-side-b.png` — ACME screws + QR
- Props:
  - `size: 'sm' | 'md' | 'lg'` (100px / 200px / 300px)
  - `earned: boolean` — if false, render grayscale + locked overlay ("X more links to earn")
  - `chainLength: number` — displayed in overlay
  - `onClick?: () => void` — optional navigation
  - `autoFlip?: boolean` — if true, auto-flips once on mount (A→B→A) to showcase both sides

**Earned state:** Full color, gold border glow (`box-shadow: 0 0 20px rgba(245, 158, 11, 0.6)`), flip enabled
**Locked state:** `filter: grayscale(100%) opacity(0.4)`, overlay text, flip disabled

---

## DELIVERABLE 3: Medallion Placement in 6 Locations

### 3A. NetworkLanding.tsx — Portal Deck Card Grid
Add a **7th PortalDeckCard** to the existing 6-portal grid:
- Front: Side A image (ship)
- Back: Side B image (ACME screws + QR)
- Click → `/2nd-second`
- Label: "The 2nd Second"
- Subtitle: "The Grand Experiment"

### 3B. ChainDashboardPage.tsx (Deliverable 5 below)
- Show `MedallionDisplay` at chain = 13 as the reward
- Grayed/locked when chain < 13 with "X more links" overlay
- Full color + earned glow at chain = 13

### 3C. SecondSecondLanding.tsx (from K143)
- Add `MedallionDisplay size="lg" autoFlip={true}` as the hero visual
- Centered above the title "The 2nd Second Industrial Revolution"
- Auto-flips once on page load to show both sides

### 3D. WelcomeGatePage.tsx (from K131)
Add a new Red Carpet template `MedallionScan`:
- Triggered when someone scans the physical medallion's QR code
- Shows the digital medallion flipping, then fades to reveal:
  - "Welcome to The 2nd Second Industrial Revolution"
  - "The Grand Experiment to Save the World"
  - CTA: "Start Building" → `/production`
  - CTA: "Learn More" → `/2nd-second`

### 3E. CueCardGeneratorV2.tsx (from K143)
The "BUILD A FACTORY" and "CANISTER SYSTEM" Cue Card templates should use Side B as the card front image, with the user's personalized QR replacing the generic one (via Durin's Door routing from K131).

### 3F. Member Helm — Medallions Section
Add a "Medallions Earned" card to the member's dashboard/Helm. The Ship Medallion is the first entry. Show as earned/locked based on chain status. Future medallions (Guild, Captain, etc.) follow the same pattern.

---

## DELIVERABLE 4: Hooks — `useChainDashboard.ts`

Create `/src/hooks/useChainDashboard.ts`:

```typescript
// useChainStatus — member's chain data
// - getMyChain() → chain_length, max_chain, bonus_pct, expires_at, links[]
// - getChainLinks() → all campaign links with dates and bonuses
// - isChainActive() → boolean (expires_at > now)
// - getTimeRemaining() → seconds until chain expires
// - getNextCampaign() → next upcoming campaign

// useCampaigns — all 13 campaigns
// - getCampaigns() → list with status, funding progress, backer count
// - getCampaign(slug) → single campaign detail

// useHexIsleDownloads — STL library
// - getDownloads(category?, tier?) → filtered download list
// - incrementDownload(id) → bump download_count

// useChainLeaderboard — community chain stats
// - getLeaderboard() → top 10 chains by length
// - getChainStats() → total backers, average chain, longest chain
```

---

## DELIVERABLE 5: Chain Dashboard Page — `ChainDashboardPage.tsx`

Create `/src/pages/ChainDashboardPage.tsx` at route `/chain`:

**Section 1: My Chain**
- Visual chain: horizontal linked circles (1-13), lit/unlit/pulsing
- Chain length + bonus display: "5 links — 25% bonus"
- Countdown timer: "Chain expires in 8d 14h"
- Next campaign info
- `MedallionDisplay` — grayed if < 13, earned if = 13

**Section 2: Campaign Roadmap**
- Vertical timeline of all 13 campaigns
- Status icons, funding progress, type badges (component/character/creature/assembly)
- Leap Frog character campaigns in alternate color
- Current/next highlighted

**Section 3: Chain Leaderboard**
- Top 10 chains by length
- Member's position
- Community aggregate stats

---

## DELIVERABLE 6: HexIsle Downloads Page — `HexIsleDownloadsPage.tsx`

Create `/src/pages/HexIsleDownloadsPage.tsx` at route `/hexisle/downloads`:

- Grid of download cards, filterable by category + tier
- Each card: piece name, tier badge (6 tiers, color-coded), thumbnail, download count, "Download STL" button
- Tier legend at top
- "Submit Improvement" → Bounty Arena / Piggy-Back
- Campaign tag showing which Kickstarter includes this piece
- Access control: $5 backers or $5/year members can download; others see "Join to download"

---

## DELIVERABLE 7: Routes, Navigation

**Routes (lazy imports):**
```
/chain → ChainDashboardPage
/hexisle/downloads → HexIsleDownloadsPage
```

**Navigation:**
- Dashboard sidebar: "My Chain" (Link2 icon)
- HexIsle sidebar: "Downloads" (Download icon)
- 2nd Second landing: link to /chain
- NetworkLanding: 7th deck card (medallion → /2nd-second)

---

## CRITICAL RULES

1. **Chain timer: 14 days.** Extends to 21 days during holiday skips.
2. **20% floor on chain break.** Bonus drops to 20%, NOT zero.
3. **5% per link.** 13 links = 65% max.
4. **No securities language.** "Backing" not "investing."
5. **STL downloads require $5 tier OR membership.**
6. **Medallion EARNED at chain 13.** Cannot be purchased.
7. **Medallion images:** Save Founder's PNGs to `/public/images/medallion-ship-side-a.png` and `/public/images/medallion-2nd-second-side-b.png`.

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `supabase/migrations/20260327000014_chain_kickstarter.sql` | CREATE |
| 2 | `src/components/hexisle/MedallionDisplay.tsx` | CREATE |
| 3 | `src/hooks/useChainDashboard.ts` | CREATE |
| 4 | `src/pages/ChainDashboardPage.tsx` | CREATE |
| 5 | `src/pages/HexIsleDownloadsPage.tsx` | CREATE |
| 6 | `src/pages/NetworkLanding.tsx` | MODIFY (add 7th deck card) |
| 7 | `src/pages/SecondSecondLanding.tsx` | MODIFY (add hero medallion) |
| 8 | `src/pages/CueCardGeneratorV2.tsx` | MODIFY (medallion in templates) |
| 9 | `src/pages/WelcomeGatePage.tsx` | MODIFY (MedallionScan template) |
| 10 | `src/App.tsx` | MODIFY (routes) |
| 11 | `src/components/AppSidebar.tsx` | MODIFY (nav) |
| 12 | `public/images/medallion-ship-side-a.png` | ADD (from Founder) |
| 13 | `public/images/medallion-2nd-second-side-b.png` | ADD (from Founder) |

**13 files (5 new, 6 modified, 2 image assets).**

---

**FOR THE KEEP.** 🏰
