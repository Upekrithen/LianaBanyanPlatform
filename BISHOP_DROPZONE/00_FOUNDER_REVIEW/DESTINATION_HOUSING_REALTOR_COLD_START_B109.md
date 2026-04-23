# Destination Housing — Realtor Cold Start Plan
## B109 Concept Draft — for Founder's Mom (and the broader realtor network)

> **Bishop scaffolding note:** Two audiences, one doc. Part 1 is the warm plain-language explanation the Founder hands his mother. Part 2 is the business plan she (or any realtor) can use to onboard and expand. Part 3 is the LB-internal integration spec. Founder voice rewrite expected on Part 1 especially — this is a *mother-son* conversation, not a sales pitch.

---

# PART 1 — For Mom

**[Founder voice: rewrite this section in your own warmth — a son explaining to his mother what he built and why she's the natural first person to call.]**

Mom,

You've been a realtor for a long time. You know the market is tight right now, and you know the work doesn't always pay what the hours deserve. What I've built — what we've all been building — has a place for you in it that pays on your effort, in three different ways, and gives you upside nobody else in the industry offers.

Here's the short version:

The cooperative owns housing. Not rents it, *owns* it. We acquire residential property in the Liana Banyan Corporation's name, and we provide it to our members at cost-of-maintenance plus twenty percent — not at market rent. That's what breaks the Monopoly-game problem Elizabeth Magie was yelling about over a hundred years ago: you shouldn't be charged market rent for something the landlord isn't building anything new with. We're the ones doing the building. So the pricing reflects that.

**What we need is somebody who knows how to find and close on good residential property, and who has a network of other people who know how to do the same thing.**

That's you. And if you want, that's you bringing your network in behind you.

Here's what you get, in three layers:

1. **Standard commission** on every acquisition you broker. Paid in cash if that's what you want, or in Credits (which are $1 = 1 Credit, on the platform), or in Marks (which carry upside), or a mix. Your call, every time.
2. **Pedestal stake** in each property you source. That's equity — not just a commission. As the WaterWheel on that property spins off revenue, you get a share, forever, for having sourced it.
3. **Steward relationship** if you want it — an ongoing role in vetting occupants and verifying property condition, paid in Marks per task, that builds into a Guild-level profession with other realtors doing the same thing.

The membership floor is $5 a year. You already do more than that in professional-development dues. And the moment you close one deal for the cooperative, you're paid for it, with upside that the MLS never offered.

I'm asking you to be our first realtor. And if it works for you, you build the bench.

Love,
Jon

**[anecdote hook: this is where you can slot in any of your childhood realtor-adjacent memories — Mom walking through open houses, the way she taught you to read a listing, a specific deal she's been working that's this shape. One paragraph, your voice.]**

---

# PART 2 — The Business Plan (shareable with other realtors)

## Destination Housing — Realtor Network Cold Start

**What this is:** Liana Banyan Corporation is a cooperative commons that owns residential housing and provides it to members at cost-of-maintenance + 20%, not market rent. The cooperative is actively acquiring property and needs licensed realtors to source, broker, and steward it.

**Who this is for:** licensed residential real estate agents who (a) want to earn standard commission on acquisitions, (b) want to carry equity in the housing they help build, not just transact on it, (c) are open to a professional-Guild model where other realtors join the network under them.

### The Three-Layer Compensation Stack

| Layer | What you do | What you earn | When |
|---|---|---|---|
| **Layer 1 — Commission** | Broker an acquisition for the cooperative | Standard residential commission, paid in cash / Credits / Marks (your choice at closing) | At close |
| **Layer 2 — Pedestal** | Source the property that becomes a cooperative holding | Equity stake in that specific property's WaterWheel — a % of the 30/40/15/15 revenue split for the life of the property | Recurring, indefinite |
| **Layer 3 — Steward (optional)** | Vet occupants, verify condition, handle ongoing member interface on that property | Marks per task, paid monthly; qualifies for Guild-tier professional Pedestal | Recurring while active |

**The math that makes this different from a standard buyer-side listing agreement:** on a normal deal you get paid once. Here you get paid at close, *and* you carry equity in the property through the WaterWheel, *and* (if you choose) you earn recurring Marks as the steward. Three streams from one deal.

### The Cold Start Pathway — Guild

Liana Banyan has six Cold Start Pathways for new participants. The realtor path is **Guild** — a professional association where realtors onboard, verify credentials, source deals, and build a bench of other realtors under them.

**Onboarding sequence:**
1. **Sign up** at $5/yr membership (flat, no tiers). LB Card optional at this stage.
2. **Verify license** — active state real estate license, standard E&O insurance, no disciplinary flags in the last 5 years.
3. **First deal on probation** — broker one acquisition for the cooperative. Commission paid as if you were any other buyer's agent. This establishes the reputation track for Voucher-eligibility at Layer 2 and 3.
4. **Graduation to Pedestal eligibility** — after the first successful close, Pedestal stake is enabled on subsequent deals. At your option.
5. **Network expansion** — bring in other realtors under you. Each one goes through the same probation. You earn a Guild-tier Mark on every deal closed by a realtor you sponsored, in perpetuity (attribution is one level only — that's the LB rule, see [feedback_attribution_one_level.md]).

### What the cooperative is acquiring

- Single-family homes in markets where cost-of-maintenance + 20% undercuts market rent by at least 25%
- Small multi-family (2–4 unit) properties near employment hubs
- Distressed properties where the cooperative's Marks-based labor pool (Cold Start Pathways: Manufacturing, Service) can do rehab at cost
- Properties adjacent to planned cooperative sites (food, local business nodes)

Initial acquisition budget is a function of capital stack — founder capital + member subscriptions + Patent Prosecution Defense Fund side-flow + (if MacKenzie Scott funds) grant capital. Conservative first-year acquisition target: **10–30 properties** across the pilot geographies.

### The realtor's self-interest, in plain terms

The market is tight. MLS listings are slow. Commissions are thinner than they were. What Destination Housing offers is a **deal flow the realtor doesn't have to hunt for** — the cooperative tells you what shape of property it wants, you find it, you get paid at close AND you keep equity. If your market is Lewistown or Billings or Great Falls, you're the expert. The cooperative wants your eyes on the ground, not its own.

And because attribution is one-level and Guild-scoped, the first realtor in a geography becomes the anchor of that network. Twenty realtors in Montana under one anchor mean twenty deals closing under one person's Pedestal attribution. That compounds.

---

# PART 3 — LB Internal Integration Spec

**Canonical anchors:**
- Innovation #1927 Cooperative Housing Acquisition (CJ) — the acquisition mechanism
- Innovation #1929 Housing WaterWheel (CJ, 30/40/15/15) — the revenue split
- Innovation #2023 Currency Staking for Cooperative Housing — accountability deposit
- Cold Start Pathway: Guild — the realtor onboarding path
- Voucher mechanism (Pawn B62) — for realtors who need Level 0 capital runway
- Pedestal model — for equity

**What needs to be built / confirmed before formal launch:**
1. **Realtor license verification flow.** Integrates with state license databases. Knight task.
2. **Property intake form.** Realtor submits a candidate property; LB evaluates against acquisition criteria. Existing `housing_properties` schema (K220) covers the fields.
3. **Pedestal attribution on property-sourced deals.** Schema work — attach sourcing-realtor-ID to each `housing_properties` row; flow a configurable % of the WaterWheel 30/40/15/15 split to that realtor.
4. **Guild-tier Mark schedule.** What does one closed deal earn in sponsorship Marks for the upline realtor? Needs calibration to the attribution-one-level rule.
5. **Legal review.** Commission structure (especially Pedestal-as-equity) must clear state real estate commission law. Counsel queue: treat as parallel to the SSSS counsel review.
6. **Pilot geography.** Recommend: **Lewistown, Montana** as the first pilot market — Founder's mother is the anchor realtor, the Mr. Cloyd archetype is Lewistown-rooted, and the Destination Montana naming already lands.

**Crown Letter / outreach implications:**
- This plugs directly into the SSSS framework (Self-Sustaining Subsistence Subscription): members pay subscription, get housing; realtors source the housing; all three layers paid from the same WaterWheel.
- Resonates with Majora Carter (place-based revitalization), Jessica Jackley (Kiva / microfinance framing), Howard Marks (capital allocation — and he grew up in real estate adjacent markets).
- This is the consumer-facing explanation of how the housing side of LB physically manifests. Every Crown Letter that touches housing (Scott, Khan on education housing, Andrés on food-adjacent housing) can reference Destination Housing as the live mechanism.

### Innovation status

The bundled **realtor-network-as-Guild-cold-start** mechanism for a cooperative housing acquisition platform appears novel as a combined system. Worth filing as a Crown Jewel candidate under the next provisional slot. Component pieces (#1927, #1929, #2023) are already filed; the **Guild realtor integration** is the new IP.

**Working name:** Innovation #2267 (subject to canonical numbering check).

---

*Saved B109. Founder rewrites Part 1 in mother-son voice. Part 2 sharable with realtors as-is after counsel review. Part 3 is Bishop/Knight implementation spec.*
