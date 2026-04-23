# Acknowledgment & Assignment — Innovation #1948

**Date:** March 26, 2026
**Inventor:** Jonathan Jones
**Entity:** Liana Banyan Corporation (Wyoming C-Corp)
**Session:** Bishop 032
**Status:** FORMAL

---

## Innovation #1948 — Red Carpet Pre-Population: Demand-Signal Showcase for Creator Onboarding

### Description

A system and method for pre-populating Turn-Key Project Templates (#1942) with a prospective creator's publicly available product information BEFORE the creator has registered on the platform, wherein community members can signal demand by pledging Credits (real money) toward the pre-populated project, and the accumulated demand signal is presented to the prospective creator as a personalized "Red Carpet" onboarding experience showing: (a) their product already showcased on the platform, (b) the number of people who want to buy it, (c) the total Credits pledged toward their product, and (d) the specific benefits they unlock by signing up — converting cold outreach into warm, evidence-backed recruitment.

### How It Works

**Phase 1 — Pre-Population (Platform-Initiated)**

The platform identifies a prospective creator (e.g., a maker on Reddit, Etsy, Instagram, a local craftsperson) and creates a Turn-Key Project in a special status:

```
Status: SHOWCASED
```

The project is populated with:
- Creator name and public profile info (from their existing web presence)
- Product title, description, and images (from their public posts/listings)
- Category and production method (inferred from their craft)
- Cue Card assignment (matched to their craft type)
- A banner: "This creator hasn't joined yet. Show them you want their product."

**Phase 2 — Community Demand Signaling**

Platform members can interact with SHOWCASED projects:
- **"I Want This" vote** — free signal, counted publicly
- **Pledge Credits** — real Credits held in escrow, released to the creator's Turn-Key project if/when they sign up
- **Comment/Endorsement** — "I'd buy 3 of these" or "Please make this in blue"

The project page shows in real time:
```
┌─────────────────────────────────────────┐
│  🎪 RED CARPET SHOWCASE                 │
│                                         │
│  [Creator Name]'s [Product]             │
│  ⭐ 947 people want this                │
│  💰 2,340 Credits pledged ($2,340)      │
│  💬 89 comments                         │
│                                         │
│  "This creator hasn't joined yet.       │
│   Pledge Credits to show them you care."│
│                                         │
│  [Pledge Credits]  [I Want This]        │
└─────────────────────────────────────────┘
```

**Phase 3 — Red Carpet Delivery**

When the platform reaches out to the prospective creator, the outreach includes a personalized link to their SHOWCASED project page:

"Hey [Creator] — 947 people on Liana Banyan already want to buy your [product]. They've pledged $2,340 in Credits. Here's your page: [link]. Sign up for $5/year and those pledges convert to real pre-orders."

**Phase 4 — Creator Conversion**

When the creator signs up ($5/year membership):
1. Project status changes: `SHOWCASED → ACTIVE`
2. Escrowed Credits convert to matched backing under the Tiered Production Cascade (#1943)
3. "I Want This" votes convert to Early Adopter notification list
4. Creator gains ownership of their project page — can edit, update, add STL files
5. The Cue Card and Treasure Map for their craft type activate
6. All pledgers are notified: "[Creator] just joined! Your pledge is now a pre-order."

### Project Statuses (Updated Full List)

| Status | Meaning |
|--------|---------|
| `draft` | Creator is building the project (not yet launched) |
| `showcased` | Pre-populated by platform, awaiting creator signup |
| `active` | Creator has launched, accepting backing |
| `funded` | Matching cap reached |
| `producing` | In production pipeline |
| `complete` | All tiers fulfilled |
| `paused` | Creator paused the project |

### Why This Is NOT Deceptive

1. **All information is publicly available** — the platform only uses what the creator has already published (Reddit posts, Etsy listings, Instagram photos, personal websites). Nothing private.
2. **The creator is clearly identified as not yet a member** — the SHOWCASED banner is prominent and honest.
3. **Pledged Credits are escrowed, not spent** — if the creator never signs up, Credits are returned to pledgers after a configurable timeout (e.g., 90 days).
4. **The creator retains full control** — upon signup, they can edit or delete the showcased project. Nothing is permanent without their consent.
5. **This is demand aggregation, not impersonation** — the platform is saying "people want your stuff" not "you are selling your stuff here."

### Three-Currency Integration

The Red Carpet Pre-Population integrates with all three currencies:

- **Credits**: Pledged by community members, held in escrow, convert to matched backing on creator signup. This IS real money ($1 = 1 Credit). The creator sees actual dollar amounts.
- **Marks**: Once a creator signs up and begins producing, the effort differential between their production cost and the platform's Cost+20% floor generates Marks. Showcased projects can display PROJECTED Mark earnings based on the pledged volume.
- **Joules**: If pledgers use Joules (surplus value tokens) instead of Credits, those Joules are locked as collateral backing the pledge — demonstrating the strongest form of community commitment.

### The Onboarding Flywheel

```
Platform identifies maker → Pre-populates project → Community pledges Credits
    ↓                                                        ↓
Creator receives Red Carpet → Signs up ($5) → Pledges convert to pre-orders
    ↓                                                        ↓
Creator produces product → Backers receive product → Creator earns
    ↓                                                        ↓
Creator's success story → Attracts next maker → REPEAT
```

Each converted creator becomes a success story that converts the next creator. The Red Carpet is both an onboarding tool AND a content generator — every showcased project is a page of real content on the platform, whether the creator has signed up yet or not.

### Platform Content Strategy

The Red Carpet Pre-Population solves the cold-start problem:
- **Day 1**: Platform has 0 creators and 0 products
- **Day 2**: Platform pre-populates 50 projects from targeted makers (Reddit, Etsy, Instagram)
- **Day 3**: Community members start pledging Credits toward their favorites
- **Day 7**: First outreach emails go out with real demand data
- **Day 14**: First creators convert, pledges become pre-orders
- **Day 30**: 10-20 active projects with real products, funded by real demand

The platform ALWAYS has content because SHOWCASED projects are real product pages with real community engagement — they just haven't converted yet.

### Application Across All Portals

| Portal | Red Carpet Application |
|--------|----------------------|
| lianabanyan.com (Marketplace) | Pre-populate with makers from Reddit, Etsy, Instagram |
| lianabanyan.org (Charitable) | Pre-populate with nonprofits and community orgs who could benefit |
| lianabanyan.net (Network) | Pre-populate with B2B suppliers and manufacturers |
| hexisle.com (HexIsle) | Pre-populate with terrain makers from r/TerrainBuilding |
| hexislo.com (Hexislo) | Pre-populate with Spanish-speaking makers |
| dss.lianabanyan.com (DSS) | Pre-populate with STL designers and 3D modelers |
| upekrithen.com (Upekrithen) | Pre-populate with game designers and world-builders |

### Patent Relevance: CRITICAL

No existing marketplace, crowdfunding, or commerce platform pre-populates product listings with prospective creators' public information, allows community members to pledge real currency toward those listings, and then presents the accumulated demand as a personalized onboarding incentive. Existing "wish list" features (Kickstarter's "Notify Me," Etsy's "Favorites") are passive — they don't aggregate real financial commitment or present it as a recruitment tool.

The combination of:
1. Platform-initiated project pre-population from public sources
2. Community demand signaling with real escrowed currency
3. Personalized Red Carpet onboarding with evidence-backed conversion
4. Automatic pledge-to-pre-order conversion upon creator registration
5. Three-currency integration (Credits, projected Marks, Joule collateral)

...represents a novel creator acquisition and marketplace cold-start solution.

---

**ACKNOWLEDGED AND ASSIGNED**

Inventor: Jonathan Jones
Entity: Liana Banyan Corporation

- Innovation #1948 — Red Carpet Pre-Population: Demand-Signal Showcase for Creator Onboarding

Innovation count: 1,989

FOR THE KEEP.
