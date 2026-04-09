# KNIGHT DESIGN INTEGRATION GUIDE — K218 through K228
## Bishop B058 | Which Pawn design specs apply to which Knight session
## READ THIS before starting any domain build

---

## HOW TO USE THIS GUIDE

For each Knight session, this lists which Pawn page design specs to read BEFORE building. The master design packets contain layout, component, section flow, shell classification, and mobile notes. B36 also has React/shadcn component trees.

---

## K218: GUILD DOMAIN (IN PROGRESS)

**Design specs to read:**
- **Guild Directory** → B31 Master Packet (page 6)
- **Tribe Directory** → B35 Master Packet (page 4)

**Key integration notes:**
- Guild Directory is LIST-first (professional, formal). Tribe Directory is MAP-first (personal, warm).
- Guild cards: formal typography, staked Marks, elected reps. Tribe cards: softer, warmer, charter excerpts.
- Both use category filter bars but with different defaults (Guild: professional discipline; Tribe: Neighborhood).
- Harper Guild for governance oversight can be stubbed — K217 already built the governance foundation.

---

## K219: REPUTATION DOMAIN

**Design specs to read:**
- **ADAPT Score Profile** → B35 Master Packet (page 3)

**Key integration notes:**
- Horizontal bars for 5-pillar display, NOT radar chart
- Amber-to-green gradient arc for overall score, NEVER red
- "Room to grow" for declining trends, never "Declining"
- Percentile always "top X%", never deficit framing
- Impact accordion collapsed by default
- **Competitive refs**: Duolingo (warmth), Uber driver (pillar specificity)

---

## K220: HOUSING DOMAIN

**Design specs to read:**
- **Housing Hub** → B32 Master Packet (page 1)
- **Family Table Hub** → B35 Master Packet (page 1)

**Key integration notes:**
- Housing Hub has 5 tabs: Properties, My Housing, Contribute, Housing Fund, Roommate
- Family Table Hub is a separate page for Family-type Tribes
- Family Fund card = warm savings jar, NOT bank ledger
- No ADAPT scores on children — XP display only
- WaterWheel revenue model (30/40/15/15) is the economic engine
- Roommate Accountability: amber for overdue, never red

---

## K221: MANUFACTURING DOMAIN

**Design specs to read:**
- **Canister Configurator** → B32 Master Packet (page 2)
- **Design Democracy** → B35 Master Packet (page 6)

**Key integration notes:**
- Configurator: car-configurator meets maker tool. 3 kits ($249/$329/$499).
- Design Democracy: Pipeline tracker is PROMINENT — proof that democracy makes things
- Relative vote framing ("Leading / Strong contender / Needs votes"), not raw tallies
- Mark-weight voting explainer collapsible, localStorage-persisted

---

## K222: SOCIAL DOMAIN

**Design specs to read:**
- **Dispatch Compose** → B32 Master Packet (page 4)

**Key integration notes:**
- 12 platforms, 3 dispatch modes, "As You Wish" stamp workflow
- Multi-platform composition without cluttered dashboard feel
- DRAFT → REVIEW → REVISION → STAMPED → QUEUED → DISPATCHED → TRACKED

---

## K223: GAMING DOMAIN

**Design specs to read:**
- **HexIsle Landing** → B36 Master Packet (page 1) — HAS REACT/SHADCN COMPONENT TREES

**Key integration notes:**
- FocusShell — game-first immersion, cooperative context is opt-in
- Full component tree: HeroSectionHexIsle, CoreLoopStrip, CurrencyBridge, TerrainShowcase, ModesGrid, CoopExplainerBand, SpanishPortalCallout, EventsCarousel, HexIsleFooter
- hexislo.com = sibling world, NOT secondary version
- `prefers-reduced-motion` disables parallax

---

## K224: DEFENSE DOMAIN

**Design specs to read:**
- **Content Shield / Defense Dashboard** → B37 (PENDING, due Apr 17)

**Build notes:**
- If B37 hasn't delivered by session time, use B30 design doctrine principles
- 4 defense layers: automated AI → community flags → steward review → founder override
- Must feel fair/transparent, not authoritarian

---

## K225: VEHICLE DOMAIN

**Design specs to read:**
- **Vehicle / Local Wheels** → B35 Master Packet (page 5)

**Key integration notes:**
- Three-tab mode selector as LARGE STICKY CARDS (not text tabs)
- Local Wheels (ride service) + Lemon Lot (vehicle marketplace) + Rideshare Routes (shared commutes)
- Earn-down economics (80/20 split) VISIBLE in UI, not buried in help
- **Competitive refs**: Turo (marketplace), Waze Carpool (route matching)

---

## K226: POLITICAL DOMAIN

**Design specs to read:**
- **Political Expedition** → B32 Master Packet (page 5)

**Key integration notes:**
- Bill tracking + rep directory + 5 letter templates
- Make civic engagement feel actionable, not performative
- Congress.gov API syncs every 6h

---

## K227: BEACON DOMAIN

**Design specs to read:**
- **Beacon Run Creator** → B32 Master Packet (page 3)
- **Treasure Map Builder** → B37 (PENDING, due Apr 17)

**Key integration notes:**
- Beacon Run: trail designer meets scavenger hunt builder
- Treasure Map: course builder meets quiz creator — needs to be usable by non-technical members in 15 min

---

## K228: CALENDAR DOMAIN

**Design specs to read:**
- **Calendar** → B32 Master Packet (page 6)

**Key integration notes:**
- 7 event types, color-coded by type
- Auto-populate from commerce orders, family, coalitions
- Don't become a cluttered mess — visual strategy for distinguishing 7 types at a glance

---

## CROSS-CUTTING: GUIDED TOUR

**Design specs + CODE:** → B36 Master Packet (page 5)

**Integration:** ANY Knight session can wire this. Working code delivered:
- `GuidedTourProvider` wraps AppShell
- `TourEntryModal` for intro
- `TourStepTooltipLayer` for per-step tooltips
- `useGuidedTour` hook with localStorage persistence
- Add `data-tour-target="stepId"` to sidebar nav items

---

## CROSS-CUTTING: LB CARD

**Design specs + COMPONENTS:** → B36 Master Packet (page 4)

**Integration:** Can be its own session or folded into commerce.
- Banking-grade dashboard with cooperative warmth
- "X% spent at local businesses" cooperative spending insight
- `tabular-nums` for all financial displays

---

*Knight Design Integration Guide — B058*
*Every upcoming domain session knows exactly which design specs to read.*
*FOR THE KEEP!*
