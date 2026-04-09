# K113: Decentralized Factory Node Visualization — DSS Portal

## Context
Innovation #1939 describes a modular home-based manufacturing assembly line. The DSS portal (the2ndsecond.com) needs to show this to visitors as the production pathway — not just "we 3D print things" but a sophisticated, scalable manufacturing system.

## Deliverables

### D1: Factory Node Visualization Page
New page: `/factory-node` on DSS portal

Visual flow diagram showing the assembly line:
```
DESIGN → SLA PROTOTYPE → VALIDATE → SLS MOLD → INJECTION MOLD → SHIP
```

Each stage is a card with:
- Machine type and photo/icon
- Who operates it (member, home-based)
- Cost per unit at that stage
- Time estimate

### D2: Dual Pathway Selector
On the product detail page and/or a new `/production-pathways` page:

**Pathway A card:** "FormNow Direct"
- Formlabs logo/link to now.formlabs.com
- "Upload STL → instant quote → professional production → ship"
- "Starting ~$20/part, 2-5 day delivery"
- "Best for: prototypes, small batches, surge capacity"
- CTA: "Get Instant Quote" → links to now.formlabs.com

**Pathway B card:** "Decentralized Factory Node"
- Node diagram (6 SLA + 2 SLS + 3-5 injection molders)
- "Member-operated → lower per-unit cost at scale"
- "Best for: production runs of 500+"
- CTA: "Join a Node" or "Start a Node"

### D3: Cold Start Calculator
Interactive widget showing:
- Slider: "How many machines to start with?"
- Starting config: 1 SLA + FormNow + 1 injection molder
- Shows: startup cost, per-unit cost at various volumes, break-even vs FormNow
- Visual: machines light up as you add them to the node

Use realistic Formlabs pricing:
- Form 3+ (SLA): ~$2,499
- Fuse 1+ 30W (SLS): ~$18,500
- Desktop injection molder (e.g., Galomb Model-B100): ~$1,200
- FormNow per-part: ~$15-25 for hex tile size

Wire into DSSApp.tsx routes. Add to DSS navigation.

## Build + Deploy when done.
