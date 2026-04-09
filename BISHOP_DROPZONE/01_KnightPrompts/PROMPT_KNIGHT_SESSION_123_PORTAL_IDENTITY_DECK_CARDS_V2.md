# KNIGHT SESSION 123: Portal Identity Landing Pages + Flipping Deck Card Navigation (V2)

## Brief
Call `brief_me("portal identity, deck card navigation, flipping cards, .net crew, .biz captain, the2ndsecond factory")`

## Context
K116-K118 deployed. K119-K122 queued. K123 gives each portal its SOUL. Three portals get identity landing pages with the universal Flipping Deck Card pattern: .NET ("One Of Us"), .BIZ ("Welcome Captain"), and the2ndsecond.com ("The 2nd Second Industrial Revolution").

**PORTAL CORRECTION:** lianabanyan.biz is its OWN DOMAIN, its OWN Firebase hosting target ("biz"), configured since November 2025. It is NOT a page on .COM — it is one of the original 4 LianaBanyan portals (.com, .biz, .org, .net). Treat it as a full portal.

Canonical stats: 2,007 innovations | 1,511 claims | 10 provisionals | 23 production systems

**CRITICAL RULE:** No securities language.

## Deliverable 1: Flipping Deck Card Component (Reusable)

### `DeckCard.tsx`
```
Props:
  icon: string (emoji or Lucide icon name)
  title: string (front face)
  description: string (back face, 2-3 sentences max)
  href: string
  openNewTab?: boolean (default true)
  accentColor?: string (portal-specific theme)
```

**Behavior:**
- Front: Icon centered above title. Clean, minimal.
- Hover (desktop) / First tap (mobile): 3D flip (rotateY 180deg, 0.4s ease-in-out)
- Back: Description text + "Visit →" link
- Click back / Second tap: Navigate to href (new tab)
- Size: Fixed aspect ratio (~3:4), responsive grid

**CSS:** 3D perspective flip with backface-visibility hidden. Use Tailwind + inline styles for the transform.

### `DeckCardGrid.tsx`
```
Props:
  cards: DeckCardConfig[] (array of 6)
  portalTheme?: 'amber' | 'navy' | 'steel' | 'emerald' (accent color scheme)
```

Layout: 3×2 desktop, 2×3 tablet, 1×6 mobile.

## Deliverable 2: .NET Landing — "ONE / Of Us / Discover Your Crew"

**Domain:** lianabanyan.net (Firebase target: "net")
**Theme:** Warm amber/gold — campfire energy, communal, inviting

**Hero Layout:**
```
         ONE          ← text-8xl, font-black, tracking-tight
        Of Us         ← text-6xl, font-medium
   Discover Your Crew ← text-xl, text-muted-foreground, italic, mt-4
```

**6 Deck Cards:**

| # | Icon | Title | Back Description | Href |
|---|------|-------|-----------------|------|
| 1 | ⚔️ | Guilds | Join a craft-based guild. Leatherworkers, Terrain Builders, Jewelers, Woodworkers — find your people and share your craft. | /network/guilds |
| 2 | 🏕️ | Tribes | Local and interest-based communities. Find makers near you or connect with people who share your passion. | /network/tribes |
| 3 | 🔌 | Social Plugs | Connect your Reddit, Discord, Instagram — bring your existing community with you. Your audience follows you here. | /network/social-plugs |
| 4 | 🎯 | Project Bounties | Open requests for help. Someone needs what you can do. HexIsle terrain bounties and maker challenges featured. | /projects?filter=bounties |
| 5 | ✍️ | Post | Create a project, bounty, collaboration, lark, or anything your crew needs to see. Your voice, your stage. | /projects/create |
| 6 | 🏭 | Find a Maker | Who can produce your design? Browse makers with the machines, skills, and capacity you need. Connect and build together. | /network/factory-nodes |

## Deliverable 3: .BIZ Landing — "Welcome / Captain / Your Ship, Your Rules"

**Domain:** lianabanyan.biz (Firebase target: "biz")
**Theme:** Deep navy/steel blue — ship's bridge, authoritative, clear

**Hero Layout:**
```
       Welcome        ← text-6xl, font-light, tracking-wide
       Captain        ← text-8xl, font-black, tracking-tight
  Your Ship, Your Rules ← text-xl, text-muted-foreground, italic, mt-4
```

**Ship Medallion:** Above or beside the hero text, display the Ship Medallion Cue Card — a circular medallion design with the quote inscribed around the rim:

```
┌─────────────────────────────┐
│         ⚓                   │
│    ╭──────────────╮         │
│    │              │         │
│    │  SHIP        │         │
│    │  MEDALLION   │         │
│    │              │         │
│    ╰──────────────╯         │
│  "A ship in harbor is safe, │
│   but that is not what      │
│   ships are BUILT for."     │
│         — John A. Shedd     │
└─────────────────────────────┘
```

The Ship Medallion is the FIRST Deck Card (replaces "Cold Start" in position 1). It IS the Captain's identity card.

**6 Deck Cards:**

| # | Icon | Title | Back Description | Href |
|---|------|-------|-----------------|------|
| 1 | ⚓ | Ship Medallion | "A ship in harbor is safe, but that is not what ships are BUILT for." Your Captain's credential. Stake your claim. | /captain/medallion |
| 2 | 🚀 | Turn-Key Business | 10 minutes. That's all it takes to set up your product listing, funding tiers, and production pipeline. Start today. | /projects/create |
| 3 | 🗺️ | Treasure Maps | Your step-by-step path from idea to revenue. Pick your craft, follow the map, hit your milestones. | /start |
| 4 | 🎨 | What Will You Make? | Leather? Terrain? Board games? Food? Digital? Pick a Cue Card and we set up everything for your craft. | /cue-cards/campaigns |
| 5 | 🎪 | Who's Waiting? | Real people have already pledged real money for products like yours. See the demand before you commit. | /projects?filter=showcase |
| 6 | 📊 | The Numbers | 2,007 innovations. $5/year. You keep 83.3%. We take 20%. No hidden fees. No surprises. See the full picture. | /about |

## Deliverable 4: the2ndsecond.com Landing — "The 2nd Second / Industrial Revolution"

**Domain:** the2ndsecond.com (Firebase target: "the2ndsecond")
**Theme:** Steel/industrial gray with amber accents — factory floor, revolutionary energy

**Hero Layout:**
```
    The 2nd Second     ← text-7xl, font-black, tracking-tight
 Industrial Revolution ← text-5xl, font-bold
  Decentralized Factory ← text-xl, text-muted-foreground, mt-4
```

**6 Deck Cards:**

| # | Icon | Title | Back Description | Href |
|---|------|-------|-----------------|------|
| 1 | 🏭 | Factory Nodes | Start a manufacturing node from your garage. SLA prototyping → SLS molds → injection molding. Scale at your own pace. | /network/factory-nodes |
| 2 | 🧊 | Cold Start | $0 to start. One printer, one mold machine, FormNow for overflow. Build your node one machine at a time. | /start/cold-start |
| 3 | 🔧 | Production Runs | Browse active production orders. Find work for your machines. Fill capacity. Earn Credits. | /production-runs |
| 4 | 📐 | STL Vault | Upload your designs. Download others. The digital backbone of decentralized manufacturing. | /stl-vault |
| 5 | ⚙️ | Machine Registry | Register your machines (SLA, SLS, FDM, injection molder). Get matched to production orders that fit your capability. | /network/machines |
| 6 | 📊 | The Numbers | 2,007 innovations. 22 production systems. Factory Nodes in [X] cities. See the revolution in real time. | /about |

## Deliverable 5: Domain-Aware Landing Router

The existing portal detection (used by CrossPortalNav) should route to the correct landing page:

```tsx
function PortalLanding() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('lianabanyan.net')) return <NetworkCrewLanding />;
  if (hostname.includes('lianabanyan.biz')) return <CaptainBizLanding />;
  if (hostname.includes('the2ndsecond')) return <SecondRevolutionLanding />;
  if (hostname.includes('hexisle')) return <HexIsleLanding />;
  // ... etc
  
  return <MarketplaceLanding />; // default for .com
}
```

Each landing page is a standalone component that renders the hero text + DeckCardGrid with portal-specific cards.

## Deliverable 6: /captain Route on .COM

Even though .BIZ has its own domain, also make the Captain landing available at lianabanyan.com/captain for cross-linking:

```tsx
<Route path="/captain" element={<CaptainBizLanding />} />
```

## Deliverable 7: Navigation + Wiring

### App.tsx Routes
```tsx
<Route path="/captain" element={<CaptainBizLanding />} />
<Route path="/captain/medallion" element={<ShipMedallionPage />} />
```

### CrossPortalNav
Update to include all portal surfaces with correct domains:
- .com (Marketplace)
- .biz (Captain)
- .org (Charitable)
- .net (Crew)
- the2ndsecond.com (Factory)
- hexisle.com
- hexislo.com
- dss.lianabanyan.com
- upekrithen.com

### UnifiedNavigation
- Add "Captain's Deck" → links to lianabanyan.biz (or /captain on .com)

### Canonical Stats
- `innovationCount: 2007`
- `productionSystems: 23`

## Build + Deploy
Build and deploy all 8 Firebase hosting targets.

## Quality Checks
- [ ] .NET landing shows "ONE / Of Us / Discover Your Crew" + 6 Deck Cards
- [ ] .BIZ landing shows "Welcome / Captain / Your Ship, Your Rules" + Ship Medallion + 6 cards
- [ ] the2ndsecond.com shows "The 2nd Second / Industrial Revolution / Decentralized Factory" + 6 cards
- [ ] Deck Cards flip on hover (desktop) and tap (mobile)
- [ ] All card links navigate correctly
- [ ] Domain-aware router serves correct landing per portal
- [ ] /captain on .COM renders the same CaptainBizLanding
- [ ] CrossPortalNav shows all portal surfaces
- [ ] Typography hierarchy correct on all three landings
- [ ] Mobile responsive (cards stack correctly)
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
