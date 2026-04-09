# KNIGHT SESSION 123: Portal Identity Landing Pages + Flipping Deck Card Navigation

## Brief
Call `brief_me("portal identity, deck card navigation, flipping cards, .net crew, .biz captain, landing pages")`

## Context
K116-K117 deployed. K118-K122 queued. K123 is about PERSONALITY. Each portal needs to feel different from the first second. We're building identity-driven landing pages with a universal Deck Card navigation pattern — 6 flipping cards per portal, curated for that portal's audience.

Two portals get the treatment first: .NET ("One Of Us") and the new Captain/BIZ page ("Welcome Captain").

Canonical stats: 2,003 innovations | 1,511 claims | 10 provisionals | 22 production systems

**CRITICAL RULE:** No securities language. No investment promises.

## Deliverable 1: Flipping Deck Card Component

### `DeckCard.tsx` — Reusable Flipping Card
```
Props:
  icon: string (emoji or Lucide icon)
  title: string
  description: string (back of card)
  href: string (destination URL)
  openNewTab?: boolean (default true)
  accentColor?: string (portal-specific)
```

**Behavior:**
- Default: Shows front face (icon + title, centered)
- On hover (desktop) OR tap (mobile): Card flips with 3D CSS transform to show back face
- Back face: Short description text + "Visit →" link
- Click on back face: Opens destination in new tab
- Mobile: First tap = flip, second tap = navigate
- Animation: 0.4s ease-in-out 3D flip (rotateY 180deg)
- Card size: Fixed aspect ratio, responsive (3 across on desktop, 2 on tablet, 1 on mobile)

### `DeckCardGrid.tsx` — 6-Card Grid Layout
```
Props:
  cards: DeckCard[] (array of 6 card configs)
  columns?: 3 | 2 (default 3 on desktop)
```

Layout: 2 rows × 3 columns on desktop. 3 rows × 2 columns on tablet. 6 rows × 1 column on mobile.

### CSS: The Flip
```css
.deck-card {
  perspective: 1000px;
  cursor: pointer;
}
.deck-card-inner {
  transition: transform 0.4s ease-in-out;
  transform-style: preserve-3d;
}
.deck-card:hover .deck-card-inner,
.deck-card.flipped .deck-card-inner {
  transform: rotateY(180deg);
}
.deck-card-front, .deck-card-back {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
}
.deck-card-back {
  transform: rotateY(180deg);
}
```

## Deliverable 2: .NET Portal Landing — "ONE / Of Us / Discover Your Crew"

### Page: Network portal landing (domain-aware — renders when domain is lianabanyan.net)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                       ONE                             │
│                      Of Us                            │
│                                                       │
│              Discover Your Crew                       │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │          │  │          │  │          │            │
│  │ ⚔️       │  │ 🏕️       │  │ 🔌       │            │
│  │ Guilds   │  │ Tribes   │  │ Social   │            │
│  │          │  │          │  │ Plugs    │            │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │          │  │          │  │          │            │
│  │ 🎯       │  │ ✍️       │  │ 🏭       │            │
│  │ Project  │  │ Post     │  │ Find a   │            │
│  │ Bounties │  │          │  │ Maker    │            │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│              CrossPortalNav (bottom)                  │
└──────────────────────────────────────────────────────┘
```

**Typography:**
- "ONE" — text-7xl or text-8xl, font-bold, tracking-tight, text-center
- "Of Us" — text-5xl or text-6xl, font-medium, text-center, slightly lighter weight
- "Discover Your Crew" — text-xl, text-muted-foreground, text-center, mt-4

**Color:** Warm amber/gold accent. The .NET portal feels like a campfire — warm, inviting, communal.

**Deck Cards:**

| # | Icon | Title | Back Description | Href |
|---|------|-------|-----------------|------|
| 1 | ⚔️ | Guilds | Join a craft-based guild. Leatherworkers, Terrain Builders, Jewelers, Woodworkers — find your people and share your craft. | /network/guilds |
| 2 | 🏕️ | Tribes | Local and interest-based communities. Find makers near you or connect with people who share your passion. | /network/tribes |
| 3 | 🔌 | Social Plugs | Connect your Reddit, Discord, Instagram — bring your existing community with you. Your audience follows you here. | /network/social-plugs |
| 4 | 🎯 | Project Bounties | Open requests for help. Someone needs what you can do. Featuring HexIsle terrain bounties and maker challenges. | /projects?filter=bounties |
| 5 | ✍️ | Post | Create a project, bounty, collaboration request, lark, or anything your crew needs to see. Your voice, your stage. | /projects/create |
| 6 | 🏭 | Find a Maker | Who can produce your design? Browse makers with the machines, skills, and capacity you need. Connect and build together. | /network/factory-nodes |

## Deliverable 3: Captain/BIZ Landing Page — "Welcome / Captain / Your Ship, Your Rules"

### Page: `/captain` on lianabanyan.com (also accessible from CrossPortalNav)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                     Welcome                           │
│                     Captain                           │
│                                                       │
│              Your Ship, Your Rules                    │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │          │  │          │  │          │            │
│  │ 🧊       │  │ 🚀       │  │ 🗺️       │            │
│  │ Cold     │  │ Turn-Key │  │ Treasure │            │
│  │ Start    │  │ Business │  │ Maps     │            │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │          │  │          │  │          │            │
│  │ 🎨       │  │ 🎪       │  │ 📊       │            │
│  │ Cue      │  │ Red      │  │ The      │            │
│  │ Cards    │  │ Carpet   │  │ Numbers  │            │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│              CrossPortalNav (bottom)                  │
└──────────────────────────────────────────────────────┘
```

**Typography:**
- "Welcome" — text-6xl, font-light, tracking-wide, text-center
- "Captain" — text-8xl, font-black, tracking-tight, text-center (THIS is the big word)
- "Your Ship, Your Rules" — text-xl, text-muted-foreground, text-center, mt-4, italic

**Color:** Deep navy/steel blue accent. The Captain page feels like a ship's bridge — authoritative, clear, ready for command.

**Deck Cards:**

| # | Icon | Title | Back Description | Href |
|---|------|-------|-----------------|------|
| 1 | 🧊 | Cold Start | Start with $0 and your garage. Our Cold Start pathway scales from one machine to a full production node. No factory needed. | /network/factory-nodes |
| 2 | 🚀 | Turn-Key Business | 10 minutes. That's all it takes to set up your product listing, funding tiers, and production pipeline. Start today. | /projects/create |
| 3 | 🗺️ | Treasure Maps | Your step-by-step path from idea to revenue. Pick your craft, follow the map, hit your milestones. | /start |
| 4 | 🎨 | What Will You Make? | Leather? Terrain? Board games? Food? Digital? Pick a Cue Card and we'll set up everything for your craft. | /cue-cards/campaigns |
| 5 | 🎪 | Who's Waiting? | Real people have already pledged real money for products like yours. See the demand before you commit. | /projects?filter=showcase |
| 6 | 📊 | The Numbers | 2,003 innovations. $5/year. You keep 83.3%. We take 20%. No hidden fees. No surprises. See the full picture. | /about |

## Deliverable 4: Domain-Aware Landing Router

Update the portal landing page system to detect which domain the user is on and render the appropriate landing page:

```tsx
// In the main route configuration
function PortalLanding() {
  const domain = window.location.hostname;
  
  if (domain.includes('lianabanyan.net')) return <NetworkLanding />;
  if (domain.includes('hexisle.com')) return <HexIsleLanding />;
  // ... etc
  
  // Default: marketplace landing
  return <MarketplaceLanding />;
}
```

If domain detection already exists (check how CrossPortalNav determines the current portal), use the same mechanism.

## Deliverable 5: Navigation Wiring

### App.tsx Routes
```tsx
<Route path="/captain" element={<CaptainLanding />} />
```

### CrossPortalNav
Add "Captain" as a link visible on all portals (styled distinctly — perhaps with a ⚓ or 🧭 icon).

### UnifiedNavigation
- .NET sidebar: reorganize around the 6 Deck Card categories (Guilds, Tribes, Social Plugs, Bounties, Post, Find a Maker)
- Add "Captain's Deck" → `/captain` under Getting Started

### Canonical Stats
- `innovationCount: 2003`

## Build + Deploy
Build and deploy all 8 hosting targets.

## Quality Checks
- [ ] Deck Cards flip smoothly on desktop hover
- [ ] Deck Cards flip on mobile tap (first tap = flip, second tap = navigate)
- [ ] .NET landing shows "ONE / Of Us / Discover Your Crew" with 6 cards
- [ ] /captain shows "Welcome / Captain / Your Ship, Your Rules" with 6 cards
- [ ] All card links navigate to correct destinations
- [ ] Links open in new tabs
- [ ] Domain-aware routing serves correct landing per portal
- [ ] Typography hierarchy reads correctly (big → medium → subtitle)
- [ ] Mobile responsive (cards stack 1-column on phone)
- [ ] CrossPortalNav includes Captain link
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
