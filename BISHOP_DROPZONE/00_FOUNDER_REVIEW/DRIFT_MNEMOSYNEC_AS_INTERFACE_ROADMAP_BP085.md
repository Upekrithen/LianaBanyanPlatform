# MnemosyneC-as-Interface Roadmap · BP085

**STATUS:** LIVING DOCUMENT · Founder Review Required
**MINTED:** 2026-06-17 · BP085
**CLASSIFICATION:** roadmap · architecture · NOT a publish draft · Founder-directed

---

> DO NOT EDIT PUBLISH DRAFTS. This is a roadmap and canon reference document only.
> Truth-Always: sections marked FUTURE are not yet built. Do not promise them until receipts exist.

---

## §1 · Premise: Mnemo IS the Interface

Dr. MnemosyneC is not an AI model. She is the **persistent interface** that routes, steers, and remembers — across whatever AI vendors are healthy at any given moment.

The shift: from "dispatch from Cursor / Claude Code" → "ask Mnemo, she routes."

Timeline: v0.6.x UI redesign begins this transition. v1.0 = Mnemo-first full surface.

Canonical eblet: [[canon-mnemosynec-as-interface-persistent-host-vendor-resilient-bp085]]

---

## §2 · Persistent Active Memory · Crown Jewel

Four-layer memory stack:
1. **Eblets** — atomic units of substrate knowledge
2. **Pheromone** — salience scoring; hot/warm/cold lifecycle
3. **Code Breakers** — adversarial verification → GOLD_REFINED_BY_FIRE
4. **MEMORY.md keyhole** — session bootstrap for Bishop/Knight

Founder anchor: *"I'm tired of not having an active memory that persists. So we're making one."*

This IS the moat. Goes on every surface describing Mnemo to new users.

Canonical eblet: [[canon-persistent-active-memory-crown-jewel-bp085]]

---

## §3 · Vendor Resilience Architecture

MnemosyneC is vendor-resilient by design:
- Mnemo routes to whatever AI vendor is healthy (Bishop MCP, Ollama, Claude API, GPT, Gemini)
- MedLab stores connection-fix recipes for when a vendor breaks
- NetLinkWebNode provides peer fallback (borrow neighbor's working connection with consent)
- StitchPunks (Callable Substrate Workers) execute across vendors without losing substrate

The architecture guarantee: no single vendor failure is fatal to the user's work.

---

## §4 · Reins Assignment System

Mnemo assigns **Reins** per domain category to whichever AI she bestows them upon.

- Reins Registry eblet: domain → assigned AI → ratify gate → last updated
- Assignment outcome is stored as eblet — never forgotten on reassignment
- Enables hot-swap of vendors per domain without user intervention

Canonical eblet: [[canon-mnemosynec-assigns-reins-per-category-bp085]]

---

## §5 · "Consult, don't Rent" · Routing Principle

**Tagline:** "Consult, don't Rent."

Mnemo routes by task fit:
- Free local (Mistral / Llama / Gemma) → routine tasks
- Flagship (Claude / GPT / Gemini) → hard targeted work

The Substrate Inequality: `Free WITH Substrate > Flagship WITHOUT Substrate`

Per-task model receipts tracked (Unseen Tax anti-pattern inversion).
NOIDs build the automatic router — v0.6.x target.

Canonical eblet: [[canon-consult-ai-flagships-dont-rent-the-c40-aircraft-bp085]]

---

## §6 · Comptroller · First Dedicated StitchPunk Role

The Comptroller is the first concrete role assignment under the Reins system:
- Mandate: Stripe catalog awareness · revenue/spend tracking · delta alerts · monthly refresh eblet
- Candidate model: Mistral (free) — per "Consult, don't Rent"
- BLOOD: NEVER log Stripe key values

Pattern for ALL future dedicated role-holders.

Canonical eblet: [[canon-dedicated-sub-agent-one-role-comptroller-pattern-bp085]]

---

## §7 · MedLab · Connection-Fix Recipe Kitchen

MedLab is where **Concoctions** (executable AI connection-fix recipes) live.

- When an AI connection breaks, MedLab runs the matching recipe
- First recipe: Bishop MCP haywire recovery
- Concoction schema: chocolates (config) + fruits (data) + cheeses (env var NAMES only, never values) + procedure + trigger + ratify gate
- Code Breakers verify each recipe to GOLD_REFINED_BY_FIRE before it is trusted
- v0.6.x: MedLab gets its own UI tab

Canonical eblets: [[canon-medlab-eblet-recipes-ai-connection-fixes-bp085]] · [[canon-concoctions-medlab-ingredients-recipe-anatomy-bp085]]

---

## §8 · NetLinkWebNode · MIC · Peer Fleet

NetLinkWebNode = peer-MnemosyneC cluster:
- Members can borrow a neighbor's working AI connection with consent
- Billing in Marks
- MIC = Mnemo In Charge (elected coordinator of the fleet)
- Thorax-authenticated (HARD: API keys NEVER leave the lending machine)
- v1.0 scope

Canonical eblet: [[canon-netlinkwebnode-mic-vendor-resilient-peer-cluster-bp085]]

---

## §9 · Upper-Level Wrasse · Scribe + Toolsmith Manager

Like a Reminder Scribe, but for MANAGING them.

- Manages: scribe cadence · Comptroller dispatch · Reins Registry coherence
- Bishop-recommended name options: **Wrasse Foreman** (composes with Statutes §8) OR **Quartermaster Captain** (extends Wrasse Quartermaster family)
- **Founder picks one name — PENDING**

Canonical eblet: [[canon-upper-level-wrasse-proposed-names-bp085]]

---

## §10 · Many Doors, One Cooperative · Architecture

**Canonical statement:** "Many Doors, One Cooperative."

### What a Door is

A Door is a branding + attribution wrapper around the SAME cooperative membership. Every Door gives identical membership benefits:
- $5/year
- Same tokens (Marks + Credits + Barter)
- Same Pledge #2260
- Same 83.3% creator pay
- Same three currencies

### Current live Door

| Door | Stripe Product | Status |
|---|---|---|
| MnemosyneC Cooperative Membership | `prod_*` (see Stripe reference eblet) | LIVE |

### Future Doors (Truth-Always: not yet built)

| Door | Audience |
|---|---|
| Liana Banyan Cooperative Membership | Cooperative-pitch audience |
| Plumbing Node Door | Plumbing trade |
| Educators Door | Education sector |
| Veterans Door | Veterans community |
| NOIDs Door | Idea developers |
| 12 Cities Door | Geographic clusters |

### How new Doors get minted

1. Guild proposes a sub-population
2. Guild produces a QR Cue Deck Card campaign (sub-population-specific language, QR-coded)
3. New Stripe product created (same price, same checkout flow)
4. QR points to new Stripe product
5. Member row records Door of origin on creation (attribution + community-cluster grouping only)
6. All member benefits remain identical — no tier differentiation by Door

### How Stripe products map

- One Stripe product per Door
- All Doors have identical price ($5/yr) and entitlements in the backend
- "Liana Banyan Cooperative Membership" Door can be created as sibling Stripe product when ready — no schema changes required

### How Cue Deck Cards work

- Physical or digital QR-coded cards — sub-population-specific copy
- QR routes to the Door's Stripe checkout
- Issuing Guild earns attribution credit for every member who enters via their Card
- No new backend infrastructure per Card — just Stripe product + QR

Canonical eblet: [[canon-many-doors-one-cooperative-membership-unity-bp085]]

---

## §11 · Sock Puppets / StitchPunks · Callable Substrate Workers

**Vocabulary lock: this is the canonical name for the Callable Substrate Worker class.**

### Definition

Sock Puppets / StitchPunks = any AI that Dr. MnemosyneC assigns a role to:
- Bishop
- Knight
- Rook
- Pawn
- Any future role-holder

### Founder anchor

*"Like gloves that work on their own, but that a human can put on instead in order to work most effectively."*

### Name convention

| Term | Use |
|---|---|
| Callable Substrate Workers | Formal / academic / developer docs |
| Sock Puppets | Founder framing, casual internal |
| StitchPunks | Working sub-brand for marketing + onboarding |

### How StitchPunks compose with NOIDs

- StitchPunks work autonomously by default
- NOIDs (Noble Order of Idea Developers) are the humans who "put the gloves on" — taking direct control when needed
- The substrate is designed for both autonomous and human-directed operation

### Per-piece policy

Founder picks which term appears in any given publish. Do NOT auto-insert into publish drafts.

Canonical eblet: [[canon-sock-puppets-stitchpunks-callable-substrate-workers-bp085]]

---

## §12 · Captain's Ship Wheel · Maritime Voice Completion

**Canonical statement:** "Dr. MnemosyneC™ is the Captain's Ship Wheel."

**Founder anchor:** *"The boat will float, but to get somewhere, it needs a Captain."*

### Maritime voice map

| Maritime element | Cooperative meaning |
|---|---|
| The fleet | The cooperative network |
| The boat | The local MnemosyneC substrate |
| Captain's Ship Wheel | Dr. MnemosyneC |
| The Captain | The NOID (human operator) |
| The crew | StitchPunks (Callable Substrate Workers) |
| MIC | Mnemo In Charge (NetLinkWebNode coordinator) |
| Permission to Board | Onboarding CTA |
| Grab an Oar | Contribution CTA |
| One of Us / Crewman 6 | Founder personal signature |

### What the metaphor does

- Explains what Mnemo IS to a non-technical audience in one sentence
- Positions her as the steering mechanism, not a replacement for human judgment
- Scales from homepage hero copy to investor pitch to onboarding screen

### Where to use

- Marketing voice: whenever explaining what Mnemo IS to new users or press
- Onboarding: first-launch welcome / orientation copy
- Publish pieces: when a one-line explanation of Mnemo's role is needed
- Investor pitch: "what is Mnemo" slide

### Where NOT to use

- Technical architecture documents where precision outweighs metaphor
- Contexts where the maritime voice would feel forced or off-brand

Canonical eblet: [[canon-captains-ship-wheel-dr-mnemosynec-maritime-bp085]]

---

## §13 · Continuity-lift Across Vendor Churn · Tagline

**Canonical tagline:** *"It's continuity-lift across vendor churn."*

### The two-tagline thesis

| Tagline | Role | Audience moment |
|---|---|---|
| Intelligence-lift (`Free WITH Substrate > Flagship WITHOUT`) | Entry argument | Gets them in the door |
| Continuity-lift across vendor churn | Retention argument | Why they stay |

### What continuity-lift means

Your work continues across:
- Vendor API changes
- Subscription expiry
- Model deprecation
- MCP server going haywire
- Bishop drift
- Knight reset
- Any single-vendor failure mode

### How to apply

- **tagline-class:** standalone pull quote or headline
- **pull-quote-class:** blockquote in academic papers, articles, investor pitches
- **marketing copy:** pairs with Just-Add-Salt voice (RIGHT, FAST, CHEAP — and persistent)
- **academic papers:** introduce as second-order claim of the Substrate Theorem (BP061)
- **articles / journalist briefings:** frame as the durability argument / moat
- **press kits:** include alongside intelligence-lift inequality as the paired thesis
- **investor pitches:** "moat" framing — substrate = switching cost + continuity guarantee

### Founder placement

Founder picks where this tagline lands in any given publish. Do NOT auto-insert into publish drafts.

Canonical eblet: [[canon-continuity-lift-across-vendor-churn-tagline-bp085]]

---

## Composition Map (BP085 additions)

```
Many Doors, One Cooperative
  └── Mimic Trunks Gate-and-Tunnel (BP084)
  └── Ceros Technology Member Business (BP085)
  └── Guild Node + Voting (BP082)
  └── Stripe Live Product Catalog (BP085 reference)

Sock Puppets / StitchPunks
  └── NOIDs (BP085) — humans who put the gloves on
  └── Comptroller (BP085) — dedicated StitchPunk role
  └── Mnemo-as-Interface (BP085) — Mnemo assigns/wears them

Captain's Ship Wheel
  └── NetLinkWebNode / MIC (BP085) — the fleet
  └── Permission to Board (BP085) — onboarding CTA
  └── Mnemo-as-Interface (BP085) — she steers

Continuity-lift
  └── Persistent Active Memory (BP085) — the memory that persists
  └── MedLab (BP085) — repair when vendor breaks
  └── Consult-don't-Rent (BP085) — route around vendor lock-in
  └── NetLinkWebNode (BP085) — peer fallback
  └── Substrate Theorem BP061 — upstream root
```

---

*Last updated: BP085 · 2026-06-17 · Sonnet 4.6 SEG*
*Founder review required before any section is treated as shipped.*
