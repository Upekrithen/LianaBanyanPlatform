# Acknowledgment & Assignment — Innovation #2100

**Date:** March 29, 2026
**Inventor:** Jonathan Jones
**Entity:** Liana Banyan Corporation (Wyoming C-Corp)
**Session:** Bishop 048
**Status:** FORMAL

---

## Innovation #2100 — Bounty Photography Network: Zero-Storage Visual Documentation Marketplace for Cooperative Commerce

### Classification

| Field | Value |
|-------|-------|
| Innovation # | 2100 |
| Name | Bounty Photography Network |
| Parent Initiative | Cross-cutting (Commerce Engine + Captain System + Treasure Maps + all 16 initiatives) |
| Parent Innovations | #1944 (One-Click Social Import), #1975 (Walking Billboard Signal), #1946 (Treasure Map Business Plans), #1913 (Shepherding Bounty), #1972 (Universal Business Onboarding) |
| Category | Production System |
| Priority | HIGH |
| Status | DESIGNED — needs Cue Card template + Knight build |

---

### Description

A system and method within a cooperative commerce platform wherein members earn Bounty Marks for photographing local businesses and posting images to their personal social media accounts, with the platform storing ONLY metadata references (URL pointers, attribution records, Mark allocations) rather than image files, achieving zero incremental storage cost per photograph while building a distributed, community-generated visual asset library across the cooperative network.

**CRITICALLY:** Any onboarded business can ALSO post its own photography bounties through the same system — hiring cooperative photographers for product shots, event coverage, seasonal updates, and listing photos. This dual-channel architecture (platform bounties + business-initiated bounties) creates enough sustained demand for photography to support full-time photographers within the cooperative.

---

## CHANNEL 1: PLATFORM BOUNTIES (Community-Initiated)

### The Flow

```
PHOTOGRAPHER (any member with a phone)
    │
    ├── 1. Walks past a local business
    ├── 2. Takes photos (storefront, products, interior, food, signage)
    ├── 3. Posts to their social media (Instagram, X, TikTok, Facebook)
    ├── 4. Opens LB app → "Claim Photo Bounty"
    ├── 5. Pastes social media URL + tags business name/category/location
    │
    └── Platform stores:
        ├── Social media URL (pointer, not file) .... ~200 bytes
        ├── Business name + category + geo coords ... ~500 bytes
        ├── Photographer attribution (member ID) ..... ~50 bytes
        ├── Mark allocation record ................... ~100 bytes
        └── TOTAL PER PHOTO: ~850 bytes
            (vs. 3-5 MB per image if stored locally)
```

### Platform Bounty Mark Rates

| Action | Marks | Conditions |
|--------|-------|-----------|
| Photo claimed + verified | 2 Marks | Must include recognizable business, valid social URL |
| Photo used in Captain's Pitch | +3 Marks | Captain references photo in campaign materials |
| Photo appears on Treasure Map | +5 Marks | Promoted to business category visual library |
| Photo leads to business onboarding | +10 Marks | ONE LEVEL — photographer gets credit for the visual that closed the deal |
| First photo in a new city | +5 Marks (bonus) | City pioneer bonus — incentivizes geographic expansion |

---

## CHANNEL 2: BUSINESS-INITIATED BOUNTIES (The Multiplier)

### The Insight

Platform bounties (Channel 1) document businesses FROM THE OUTSIDE. But businesses need photos FROM THE INSIDE too — and they need them REGULARLY. A restaurant changes its menu seasonally. A real estate agent needs listing photos weekly. A maker launches a new product monthly. A retailer rearranges displays quarterly.

**Updates are ALWAYS needed.** This is not one-and-done work. This is recurring, sustained demand.

Any onboarded business can post a photography bounty through the same system:

### The Business Bounty Flow

```
BUSINESS OWNER (onboarded LB member)
    │
    ├── 1. Opens LB app → "Post Photography Bounty"
    ├── 2. Describes what they need:
    │      • "10 new menu item photos for spring menu"
    │      • "Exterior shots after renovation"
    │      • "Open house coverage this Saturday 2-5pm"
    │      • "Product photos for 6 new candle scents"
    │
    ├── 3. Sets bounty terms:
    │      • Credits offered (paid at Cost+20%)
    │      • Deadline
    │      • Number of photos needed
    │      • Style guide (optional)
    │      • Location + time requirements
    │
    ├── 4. Platform matches nearby photographers
    │      (by proximity, rating, availability, specialty)
    │
    └── 5. Photographer accepts → shoots → posts to social → claims bounty
           • Business pays Credits (Cost+20% → photographer keeps 83.3%)
           • Photographer also earns platform Marks (dual reward)
           • Photos live on photographer's social media (zero storage for LB)
           • Business gets metadata links to use in their own marketing
```

### Business Bounty Pricing (at Cost+20%)

| Service | Credits | Photographer Keeps (83.3%) | Platform (16.7%) |
|---------|---------|---------------------------|-------------------|
| 5 exterior shots | 25 Credits | 20.83 Credits | 4.17 Credits |
| 10 menu/product photos | 50 Credits | 41.65 Credits | 8.35 Credits |
| Open house coverage (2 hrs) | 100 Credits | 83.30 Credits | 16.70 Credits |
| Full business profile shoot | 150 Credits | 124.95 Credits | 25.05 Credits |
| Monthly update package (20 photos) | 75 Credits | 62.48 Credits | 12.52 Credits |
| Event coverage (4 hrs) | 200 Credits | 166.60 Credits | 33.40 Credits |

**Compare to market rates:**
- Professional photographer: $150-500/session
- Stock photos: $5-25/image with licensing restrictions
- LB cooperative rate: $25-200 in Credits with NO licensing restrictions within the cooperative

### The Recurring Revenue Engine

This is not a one-time service. Updates are ALWAYS needed:

| Business Type | Update Frequency | Annual Bounties | Annual Credits Spent |
|-------------|-----------------|----------------|---------------------|
| **Restaurant** | Menu changes (4x/yr) + seasonal decor + special events | 8-12 bounties | 400-600 Credits |
| **Real estate agent** | New listings (2-4/month) + open houses | 30-50 bounties | 3,000-5,000 Credits |
| **Retail store** | New inventory + seasonal displays + sale events | 12-20 bounties | 600-1,500 Credits |
| **Maker/artisan** | New products + process documentation + shows | 8-15 bounties | 400-750 Credits |
| **Food truck** | Location changes + menu updates + festival coverage | 15-25 bounties | 375-625 Credits |
| **Salon/barbershop** | Style portfolio + seasonal looks + before/after | 10-20 bounties | 250-500 Credits |

A single real estate agent spending 4,000 Credits/year on listing photos generates **3,332 Credits** for photographers. That's one agent. A city with 500 agents = **1.67 million Credits/year** flowing to cooperative photographers.

---

## THE REAL ESTATE VERTICAL

Real estate is the killer app for Business-Initiated Bounties. The industry ALREADY pays for photography — it's just expensive, fragmented, and inefficient.

### What Real Estate Needs

| Service | Current Cost | LB Bounty Cost | Savings |
|---------|-------------|---------------|---------|
| Listing exterior photos (5 shots) | $75-150 | 25-50 Credits | 50-67% |
| Interior walk-through (20 shots) | $150-300 | 75-100 Credits | 50-67% |
| Open house event coverage | $200-400 | 100-150 Credits | 50-63% |
| Drone/aerial (if photographer has drone) | $150-350 | 100-200 Credits | 33-43% |
| Seasonal update (spring/fall curb appeal) | $100-200 | 50-75 Credits | 50-63% |
| Construction progress (monthly) | $150-250/visit | 75-100 Credits | 50-60% |
| Commercial property tour | $300-500 | 150-250 Credits | 50% |

### Why Agents Would Love This

1. **On-demand:** Post a bounty at 9 AM, photographer shows up at noon. No scheduling weeks ahead.
2. **Local knowledge:** The photographer LIVES in the neighborhood. They know the angle where the afternoon light hits the porch. They know the park across the street is beautiful in October.
3. **Updates are trivial:** "Hey, the trees leafed out — can someone shoot new exteriors?" Posted as a 25-Credit bounty. Done by dinner.
4. **Open house coverage:** "Saturday 2-5pm, 123 Oak Street. Need 15 photos + 3 social posts." Posted Monday. Claimed Tuesday. Covered Saturday. Photos on social media that afternoon.
5. **Cost at Cost+20%:** No photographer markup beyond the cooperative's fixed margin. No agency fees. No stock photo licensing.

### The Agent Onboarding Path

```
Real estate agent discovers LB through:
  ├── A photographer's social media post of a listing they shot
  ├── A Captain's Pitch targeting real estate offices (Geographic Corridor #1977)
  ├── Walking Billboard signal (agents swipe LB Card at office supply stores)
  └── Reverse Funnel (#1978) — agent sees LB Card transactions from buyers
        │
        └── Agent signs up ($5/year)
            └── Posts first bounty: "New listing at 456 Elm Street, need 10 exterior shots"
                └── Photographer claims within hours
                    └── Agent gets photos. Posts to MLS/Zillow/social. Delighted.
                        └── Agent posts 3 more bounties this week.
                            └── Agent tells 5 other agents at the office.
                                └── Office becomes an LB corridor.
```

### Real Estate as a Guild

The **Real Estate Photographers Guild** forms naturally:
- Members specialize in architectural photography, drone work, staging documentation
- Guild Treasury funds equipment (drones, wide-angle lenses, lighting kits)
- Guild Benefit Cascade: 5 members → group rates on equipment. 25 members → shared drone. 50 members → guild marketing to agents. 100 members → exclusive MLS integration.
- ADAPT Score tracks: photo quality (Effectiveness), local market adaptation (Adaptability), consistent delivery (Durability), Copyright+20% compliance (Alignment), agent satisfaction (Participation), training new photographers (Transmission)

---

## THE FULL-TIME PHOTOGRAPHER PATH

Channels 1 + 2 together create enough volume for full-time cooperative photography:

### Income Modeling

| Source | Weekly Volume | Weekly Earnings | Monthly |
|--------|-------------|-----------------|---------|
| **Platform bounties** (community scouting) | 30 photos | 60-150 Marks | 240-600 Marks |
| **Business bounties** (hired shoots) | 3 sessions | 150-450 Credits | 600-1,800 Credits |
| **Real estate bounties** | 2 listings + 1 open house | 200-400 Credits | 800-1,600 Credits |
| **Event coverage** | 1 event/week | 150-200 Credits | 600-800 Credits |
| **Recurring update packages** | 5 businesses × monthly | 375 Credits | 375 Credits |
| **TOTAL** | | | **2,375-5,175 Credits + 240-600 Marks** |

At $1 = 1 Credit, that's **$2,375-$5,175/month** — a legitimate full-time income from cooperative photography. No studio. No expensive equipment. Phone + membership + hustle.

### The Career Ladder

```
LEVEL 1: Casual Photographer
  • Platform bounties only (community scouting)
  • Phone camera, no training
  • 40-100 Marks/month
  │
LEVEL 2: Active Photographer
  • Platform + some business bounties
  • Basic composition skills, consistent quality
  • 500-1,500 Credits + Marks/month
  │
LEVEL 3: Professional Photographer
  • Full business bounty load + real estate specialization
  • Better equipment (good phone or entry DSLR), style portfolio
  • 2,000-4,000 Credits + Marks/month
  │
LEVEL 4: Guild Photographer
  • Guild member, mentoring others, specialized equipment (drone, lighting)
  • Teaching Captain's Apprentice-style mentorship to new photographers
  • 4,000-6,000 Credits + Marks + Guild Treasury benefits/month
  │
LEVEL 5: Photography Captain
  • Manages a team of photographers across a corridor or city
  • Handles business relationships, quality control, scheduling
  • 5,000-8,000+ Credits + Captain bonuses + team commission
```

### The Apprentice Connection (#1976)

Master Photographers train apprentices through the same Shadow → Co-Lead → Solo progression that Captains use:
- **Shadow:** Apprentice watches a business shoot, learns framing and client interaction
- **Co-Lead:** Apprentice shoots alongside the master, master reviews and coaches
- **Solo:** Apprentice takes their first independent bounty, master available by phone

Master earns Marks for every successful bounty their apprentice completes. Incentive to TEACH, not hoard.

---

## BEYOND PHOTOGRAPHY: THE VISUAL DOCUMENTATION MARKETPLACE

The same system extends to ANY visual documentation need:

| Service | Who Needs It | Recurring? |
|---------|-------------|-----------|
| Business photography | Every business | Yes — seasonal, menu, inventory changes |
| Real estate listings | Agents, property managers | Yes — every new listing |
| Construction progress | Contractors, developers | Yes — monthly/milestone |
| Event coverage | Venues, organizations, festivals | Yes — every event |
| Food photography | Restaurants, food trucks, caterers | Yes — menu changes |
| Product photography | Makers, artisans, retailers | Yes — every new product |
| Vehicle photography | Lemon Lot listings, fleet documentation | Yes — every listing |
| Insurance documentation | Homeowners, businesses | Yes — annual updates |
| Before/after renovation | Contractors, homeowners | Yes — every project |
| Wedding/party coverage | Families | Occasional but high-value |
| Pet photography | Groomers, shelters, owners | Yes — seasonal |
| Fitness/wellness documentation | Gyms, studios, trainers | Yes — seasonal |

**Every one of these is a Business-Initiated Bounty.** Every one creates recurring work. Every one flows through Cost+20%. Every one builds the photographer's cooperative career.

---

## ZERO-STORAGE ARCHITECTURE (unchanged)

The critical insight: **the photographer's social media IS the storage layer.**

| What | Where It Lives | Cost to LB |
|------|---------------|-----------|
| Photo file (3-5 MB) | Instagram, X, TikTok, Facebook | $0 |
| Metadata reference | LB database (Supabase/PostgreSQL) | ~850 bytes |
| Attribution chain | shadow_marks_ledger + cue_card_attribution | ~200 bytes |
| **Total per photo** | | **~1 KB** |

At 1 million photos: ~1 GB of metadata. At 10 million photos: ~10 GB. Trivially cheap.

For Business-Initiated Bounties: the business may ALSO want the original files. The photographer can deliver originals via any file-sharing method (AirDrop, Google Drive, email). The platform doesn't need to touch the file. It only tracks the bounty completion, the payment, and the attribution.

---

## VERIFICATION SYSTEM

### Platform Bounties (Channel 1)
1. **Automated checks:** Valid social media URL? Geotagged within 500m of a business? Not a duplicate?
2. **Community review:** Random sample (10%) → peer review queue. 3 upvotes = verified.
3. **Star Chamber escalation:** Disputed claims → AI consensus for deduplication.

### Business Bounties (Channel 2)
1. **Business approval:** The business owner who posted the bounty reviews and accepts/rejects the deliverables.
2. **Quality dispute:** If business rejects, photographer can appeal to community review.
3. **Payment release:** Credits released to photographer upon business acceptance (Stripe holds until acceptance, NOT escrow — just "holds funds until fulfillment threshold is met").

---

## WHO DOES THIS

**Everyone.** And now, potentially FULL-TIME.

| Photographer Profile | Channel 1 (Platform) | Channel 2 (Business) | Full-Time Viable? |
|---------------------|---------------------|---------------------|-------------------|
| **The Commuter** | Snaps on routine walks | Occasional | No — side income |
| **The Explorer** | Maps new neighborhoods | Occasional | No — side income |
| **The Scout** | Pre-photographs for Captains | Agent shoots | Possible at high volume |
| **The Real Estate Pro** | Neighborhood documentation | 3-5 listings/week | **YES — $3K-5K/month** |
| **The Event Photographer** | Festival/community docs | 1-2 events/week | **YES — $2K-4K/month** |
| **The Food Photographer** | Restaurant scouting | Menu shoots, food styling | **YES — $2K-3K/month** |
| **The Photography Captain** | Manages team | Manages team assignments | **YES — $5K-8K/month** |

---

## CAPTAIN SYSTEM INTEGRATION

This feeds directly into the Captain's Pitch (#1975-#1978):

1. **Walking Billboard** signals show which businesses LB members already patronize
2. **Bounty Photography** provides VISUAL PROOF of those businesses
3. **Captain's Calling Card** (#1985-#1988) includes real photos, not stock images
4. **Geographic Corridor Campaign** (#1977) shows the corridor map with actual storefront photos
5. **Business-Initiated Bounties** give the Captain a SECOND pitch: "Not only will our members buy from you — our photographers will document your business for a fraction of what you're paying now."

That second pitch is enormous. A real estate agent paying $300/listing for photos hears: "Get the same photos for 100 Credits. And the photographer is your neighbor." Done.

---

## THE CUE CARD TEMPLATE

```
┌──────────────────────────────────────────┐
│  📸 BUSINESS PHOTOGRAPHER                │
│  "See the World. Show the World."        │
│                                          │
│  WHO THIS IS FOR:                        │
│  Anyone with a phone who walks past      │
│  businesses. Full-time career path       │
│  available for serious photographers.    │
│                                          │
│  WHAT YOU DO:                            │
│  Photograph local businesses.            │
│  Post to your social media.             │
│  Accept business-posted bounties.        │
│  Earn Credits + Marks.                   │
│                                          │
│  WHAT YOU NEED:                          │
│  Phone with camera. $5 membership.       │
│                                          │
│  EARNING POTENTIAL:                      │
│  Casual: 40-100 Marks/month             │
│  Active: $500-1,500/month               │
│  Full-time: $2,000-5,000/month          │
│  Captain: $5,000-8,000/month            │
│                                          │
│  ⚡ GET STARTED →                        │
└──────────────────────────────────────────┘
```

---

## THE BROADER INSIGHT: Distributed Content, Centralized Attribution

This pattern — social media as storage, platform as attribution layer — extends beyond photos:

| Content Type | Storage | Platform Role |
|-------------|---------|-------------|
| Business photos | Instagram, X, TikTok | Attribution + Mark allocation |
| Product reviews | Reddit, YouTube | Attribution + credibility scoring |
| Tutorial videos | TikTok, YouTube | Attribution + curriculum linking (Didasko) |
| Event coverage | Instagram Stories, X | Attribution + Rally Group activation |
| Recipe demonstrations | TikTok, YouTube | Attribution + Family Table Cookbook linking |
| Real estate listings | MLS, Zillow, social | Attribution + agent onboarding |

The platform is a **content registrar**, not a content host. WHO created WHAT, WHERE it lives, HOW it connects to the cooperative economy. Storage cost borne by social media. Attribution cost: ~1 KB per item.

---

## IP LEDGER CONCERN

See Pawn Assignment B28-IP-LEDGER for scaling research. The IP ledger — not image storage — is the real scaling concern at volume.

---

## PATENT RELEVANCE: HIGH (Crown Jewel Candidate)

A cooperative commerce platform with a dual-channel visual documentation marketplace wherein:

(a) Community members earn cooperative currency for photographing businesses and posting to personal social media (Channel 1 — platform bounties), AND

(b) Onboarded businesses post their own photography bounties to the same marketplace, hiring cooperative photographers at Cost+20% for recurring visual documentation needs including product photos, event coverage, real estate listings, seasonal updates, and construction progress (Channel 2 — business-initiated bounties),

with the platform storing ONLY metadata references rather than image files (zero incremental storage cost), supporting a career progression from casual to full-time cooperative photographer with structured apprenticeship and Guild formation —

represents a novel zero-storage visual documentation marketplace for cooperative commerce with no equivalent in existing photography platforms (Shutterstock, Getty, Snappr, Thumbtack) or cooperative platforms.

**No existing platform** combines:
1. Bounty-incentivized community business photography
2. Business-initiated photography bounties through the same system
3. Social media as the storage layer (zero image hosting cost)
4. Metadata-only platform storage (~1 KB per photo)
5. Attribution chain with cooperative currency rewards (ONE LEVEL)
6. Direct integration into merchant acquisition pipeline
7. Career path from casual to full-time with apprenticeship
8. Real estate vertical with recurring listing photography
9. Cost+20% pricing vs. 50-300% markup on traditional photography

---

## CONNECTION MAP

```
#2100 Bounty Photography Network
  ├── #1944 One-Click Social Import (pulls content FROM social media)
  ├── #1975 Walking Billboard (photos + spending data = complete picture)
  ├── #1946 Treasure Map Business Plans (photos populate category visuals)
  ├── #1977 Geographic Corridor Campaign (corridor map with real photos)
  ├── #1985 Captain's Calling Card (real photos in pitch materials)
  ├── #1976 Captain's Apprentice (photographer apprenticeship mirrors Captain model)
  ├── #1913 Shepherding Bounty (photographer matched to geographic needs)
  ├── #1972 Universal Business Onboarding (photography bounty = onboarding feature)
  ├── #2015 Guild Formation (Real Estate Photography Guild)
  ├── #2018 Guild Benefit Cascade (shared equipment, marketing, specialization)
  ├── #2021 MoneyPenny (routes inquiries from photographed businesses)
  ├── #1937 ADAPT Score (Transmission — photographers sharing local intel)
  └── #1927 Cooperative Housing (real estate listing photos)
```

---

**ACKNOWLEDGED AND ASSIGNED**

Inventor: Jonathan Jones
Entity: Liana Banyan Corporation

**Innovation #2100 — Bounty Photography Network: Zero-Storage Visual Documentation Marketplace for Cooperative Commerce**

Innovation count: **2,100** (chain end updated)

**CROWN JEWEL CANDIDATE** — No prior art for a dual-channel (community + business-initiated) zero-storage visual documentation marketplace within a cooperative commerce platform.

**FOR THE KEEP!**
