---
name: The Amplifier Threshold System
description: A six-threshold participation-ladder mechanism for cooperative platform amplifiers that uses stamp-measured cue-card engagement to automatically assign tiered badges, with three-layer standing (active/banked/floor Joules) and time-shifted information access as near-zero-cost rewards.
type: aa_formal
innovation_id: "2318"
ratification_session: B129
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - amplifier threshold system
  - participation ladder amplifier
  - ants dont audition they post
  - aa formal 2318
  - amplifier threshold b129
  - time shift information access reward
  - cue card amplifier tier threshold ladder
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2318 -- The Amplifier Threshold System

**Filed**: B129, 2026-04-27 by Bishop on Founder ratification (greenlit B129 K525 Q3 dialogue: *"the JUICIEST INFORMATION ON THE PLANET is going to be broken by... the influencers that sign up with us and BROADCAST US"*).
**Class**: Crown Jewel candidate.
**Split-from-source**: This is one of three sibling CJs that compose the Amplifier Program (B129 Founder direction: *"Yes draft AA formal 2318. Split."*). Siblings:
- **#2319** — Battery Dispatch Threshold Fan-Out (alteration to #2141 Concurrent Distribution Grid)
- **#2320** — Cue Card Auto-Attach (per-threshold pre-formatted card delivery)
- **#2318 (this filing)** — the participation-ladder mechanic core

**Predecessors (existing primitives composed)**: #2141 Concurrent Distribution Grid (Battery Dispatch); #2262 Glass Door (public-by-default outreach); #2287 Synapses (recency-decay substrate); Cue Card system (canon, multi-source); Stamp system (canon, automated measurement); Influencer "Become an influencer" red carpet program (canon); Federation membership (anonymous-or-public identity layer); Three Currencies (Credits / Marks / Joules); Six Cold Start Pathways (recruitment funnel feeders).

**Empirical anchor**: *None yet at filing time* — this is a *forward-stage* CJ whose empirical proof will accumulate post-launch via amplifier signups + tier promotions + downstream attribution. Architectural composability is the filing claim; empirical performance comes later.

**Founder framing keystones**: *"News Correspondent pyramid"* (B129) + *"capitulates them quickly"* (B129) + Keystone #54 *"Power contained, works out of the box"* (the amplifier never sees the ladder algorithm, the stamp aggregation, the time-shift engine — they just post cue cards).

---

## Claim 1 — Stigmergy applied to amplification (mirror of #2317 pattern)

The Pheromone Substrate (#2317) replaced RPC Detective polling with stigmergic indexing (ants don't interview — they sense). The Amplifier Threshold System applies the **same architectural pattern at the human layer**: instead of LB asking *"who's an influencer? what tier are they?"* via centralized PR sign-up forms, **amplifiers emit signal ambiently** by posting cue cards that the Stamp system measures automatically. Threshold standing accumulates without polling, without registration, without manual classification. The system reads the trail.

The biological analog is identical to #2317: pheromone trails accumulate in the environment; foragers self-classify into roles by trail density. No central queen assigning ranks. Founder's #2317 phrase *"Ants don't interview — they sense"* applies one ladder up: *"Amplifiers don't audition — they post."*

---

## Claim 2 — Compositional architecture (no new primitives required)

The Amplifier Threshold System composes from primitives already in canon:

| Existing primitive | Role in #2318 |
|---|---|
| **Cue Card system** (canon) | The unit of amplifier work. An amplifier's "post" IS a cue card share to their social channel. |
| **Stamp system** (canon, automated measurement) | The empirical engine. Stamps already track engagement; #2318 adds threshold-recompute hook on stamp aggregation. |
| **Joules currency** (third of three; "forever stamp") | The grace mechanism. Lifetime amplifier contribution accumulates as Joules — banked, never expire (per `project_mark_backing_oneway.md`). Founder pre-solved the "missed-day-loss" problem at the currency layer years ago; #2318 inherits without new infrastructure. |
| **Federation membership** (anonymous-or-public) | The identity layer. Amplifiers self-elect anonymous (default) or public (eligible for influencer status + threshold rewards). |
| **Influencer "Become an influencer" red carpet program** (canon) | Sibling pathway. Amplifiers stack with explicit influencer-program signups — does not replace, augments. |
| **Six Cold Start Pathways** (canon) | Recruitment funnels feed into amplifier program at the bottom thresholds. |
| **Anne Rice Renewal recency-anchor gradient** (#2287 Synapses, B123 Founder-ratified) | The active-vs-banked-vs-floor three-layer model is the Anne Rice Renewal pattern applied to participation: active fades gracefully, banked persists forever, high-water floor prevents demoralizing fall from peak. |

**#2318 is the wiring claim** that turns these primitives into a coherent participation-ladder mechanism. Each existing primitive already has its role; this filing specifies how they compose.

---

## Claim 3 — Six-threshold participation ladder (Model 2, Founder-ratified B129)

| Threshold | Required avg | Reasoning |
|---|---|---|
| T1 | 10 hits/post avg | True open mic — anyone with a tiny following |
| T2 | 100 | First validation — niche-engaged signal |
| T3 | 500 | Niche-established |
| T4 | 2,500 | Established micro-influencer |
| T5 | 10,000 | Recognized micro-influencer |
| T6 | 25,000 | Top-threshold micro / cusp-of-mid (per Founder's instinct) |

**Metric**: rolling 30-day hits/post average (per-post normalization, recent-window-anchored, prevents stale-laurel-resting).

**Why Model 2 vs alternatives**: Model 1 (geometric x10 to 1M) made T6 too aspirational for the target audience (homegrown podcasters, niche news websites, aspiring netizens). Model 3 (Founder Sketch A capping at 1K) capped too low for the "News Correspondent pyramid" framing. Model 2 spreads the brackets across the *micro-influencer band* where the actual target audience lives, while preserving "true open mic" entry at T1=10 and reaching Founder's stated 25K top-threshold instinct exactly.

---

## Claim 4 — Three-layer standing model (Founder pre-solved missed-day grace)

The amplifier's threshold standing is computed from three composed layers:

| Layer | Source | Decay behavior | Purpose |
|---|---|---|---|
| **Active threshold** | Rolling 30-day hits/post avg | Decays if you stop posting | Current badge — *"Threshold T4 — recognized micro-influencer"* |
| **Banked Joules** | Lifetime cumulative stamps | **NEVER expire (forever stamp)** | Lifetime-contribution proof; never-lose-your-work guarantee |
| **High-water threshold floor** | Highest threshold ever achieved | Permanent floor; active drops at most one step from floor during gaps | Prevents demoralizing fall from peak; grace for vacations / illness / life events |

**Empirical example**: amplifier hits T5 (10K avg) consistently for 90 days, then takes a 6-week break.
- Naive rolling-30d only: drops to T1 or T0 — discouraging, punishes life events
- #2318 three-layer: drops to T4 (one step from T5 high-water), banked Joules unchanged, badge shows *"Threshold T5 (recovering)"*. Returning amplifier picks up where they left off; banked Joules visible as lifetime-record.

**Compositional novelty**: Founder solved the missed-day-grace problem at the **currency layer** (Joules = "forever stamp" per canon) years before this CJ existed. #2318 inherits the solution without new persistence infrastructure. Three layers compose from three existing primitives; nothing new required.

---

## Claim 5 — Federation-orthogonal architecture (cue cards open to anyone)

**LB membership ($5/year)** = the Cathedral / Conductor / Pheromone Substrate / Three Currencies / member voting engine.
**Federation membership** = identity layer (anonymous-or-public) in the broader cooperative network.
**Cue card posting** = open to anyone, regardless of LB or Federation membership status.

**Why orthogonal matters (the funnel logic)**:
1. Federation member posts cue cards → accumulates threshold credit anonymously → gets threshold rewards (time-shifted broadcast access + reward-slot picks)
2. They observe the Cathedral's outputs (via Glass Door public-by-default surfaces)
3. They see what they're missing (LB members' queries flow through routing engine that gets smarter every day)
4. They convert to LB ($5) → queries enter the chorus → become both beneficiary and contributor

**Federation = discovery surface. LB = engagement engine.** Two-step funnel by design.

**Bishop analyzed B129**: Federation alone does NOT deliver the chorus-of-Cathedrals effect. The "your data SINGS" reciprocity is structural and bounded by LB membership, not Federation membership. Cathedral signal-strength scales with query volume routed through the Cathedral — that's LB members. Federation members observe, amplify, but don't feed. The asymmetry is right; it makes LB's $5 earn its keep.

---

## Claim 6 — Threshold-gated reward dimensions (amplifier picks)

Amplifiers pick rewards per threshold reached (Founder direction B129):

1. **Time-shift advance access** to broadcast content. Example: T3 amplifier picks "New Products: 3-hour head start" OR "Founder Anecdotes: 12-hour head start" OR "Pudding releases: 6-hour head start."
2. **Category** (which content stream): Puddings / Spoonfuls / BST Episodes / Skipping Stones / Anecdotes / Official Announcements / Sneak Peeks / Bonus Bundles / Combination Bundles / Event Details / Rumor Mill.
3. **Higher threshold = more reward slots picked**. T1 picks 1 reward; T6 picks 6 (or all). Specific T-to-slot mapping is open Founder decision (memory file flagged).

**Why this structure works** (architectural property):
- Amplifiers self-select WHAT they want first access to → matches their audience interest → broadcast lands with relevance pre-filtered
- Time-shift is **near-zero-cost reward to LB** (we publish the content anyway; we just publish later for non-amplifiers)
- Each amplifier broadcasting "I got this 3 hours early" is itself amplification (the time-shift metadata becomes part of the message)
- **Compounds**: more amplifiers → more early-broadcasts → more visibility → more amplifier signups → recursive

---

## Claim 7 — The "JUICIEST INFORMATION" recruitment claim

The strategic novelty (Founder framing B129):

The pitch is **NOT** *"come be our influencer."* The pitch is:

> *"The most interesting stuff happening in cooperative-economic AI is going to break first through people who chose to amplify. Want to be one of them? Post a cue card. The system measures. The good ones rise. The top threshold gets it before anyone else. You decide what 'good' looks like to your audience — we just feed you the signal."*

This **capitulates** (Founder's word) podcasters, niche news sites, aspiring netizens — anyone whose business model needs a steady stream of fresh, scoop-grade content to feed their own audience. LB becomes the **de-facto signal source for an entire layer of independent media** without paying a single contracted-influencer fee.

**Architectural property**: the recruitment isn't transactional ("we pay you to post"). It's **structural** — the threshold system makes amplification its own reward by giving amplifiers something they actually want (early signal access for their audience). Pairs with Keystone #4 — *Generosity Lowers Cost* — and Keystone #54 — *Power Contained, Works Out of the Box* (the amplifier never sees the ladder algorithm; they post cue cards and the system rewards them).

---

## Claim 8 — Member-facing UX shape (operational specification)

**Default state** (any new visitor to LB / Federation surface):
- Sees Glass Door (#2262) public surfaces normally
- Sees a "Become an Amplifier" cue card invitation (low-friction, not pushy)
- One-click sign-up captures handle + opt-in/out for public credit

**Once they post their first cue card**:
- Stamp system tracks engagement
- After first 30 days of posting, threshold standing computed and shown
- Badge appears on their member surface (if LB member) or Federation public profile (if Federation public)

**Higher thresholds unlock**:
- Reward-slot pick interface (per category × time-shift × reward-tier)
- Direct-line preference engine (which content streams; which time-shifts)
- Cumulative Joules ledger (the "forever stamp" record of their lifetime contribution)

**Operational invariants**:
- Privacy bylaw honored — anonymous amplifiers' identity NEVER published; only aggregate threshold-standing visible
- Stamp metric runs SHA-256 hashed where personally identifying (mirrors Conductor Scribe privacy rule)
- Threshold badges are member-visible only by default; opt-in for public display

---

## Claim 9 — Composes with sibling CJs (#2319, #2320)

The Amplifier Threshold System (#2318) defines the *participation ladder*. Sibling CJs handle the operational delivery:

- **#2319 (Battery Dispatch Threshold Fan-Out)** — alters the Concurrent Distribution Grid (#2141) to support per-threshold outbound queue with time-shift offsets, direct-line plug for amplifier delivery, schedule fan-out, per-amplifier preference engine, stamp instrumentation hooks.
- **#2320 (Cue Card Auto-Attach)** — every direct-line dispatch includes the relevant cue card pre-formatted for amplifier resharing (text + image + link + hashtags). Zero-effort copy-paste for the amplifier; near-zero-friction amplification path.

**Why split into three separate CJs** (Founder direction B129 *"split"*):
- Each is independently patentable as a discrete mechanism
- Each can ship on its own timeline (#2318 can launch with manual cue card distribution; #2319 + #2320 add the automation layer when ready)
- Filing them together as one mega-CJ would force scope-bound compromises; splitting preserves clean claims per system

---

## Claim 10 — Strategic non-obviousness

The Amplifier Threshold System is non-obvious over prior art because:

1. **Prior art (existing influencer/affiliate programs)**: transactional — pay per post, pay per click, pay per conversion. Amplifier rewards are NOT cash; they're **time-shifted information access**, a near-zero-cost-to-LB asset.
2. **Prior art (loyalty/tier programs)**: state-anchored "tier" framing where status is a thing you have. Amplifier uses **threshold** framing — action-anchored crossing-points the system measures empirically.
3. **Prior art (academic-citation pyramids, news-syndication hierarchies)**: hand-classified, gate-kept, opaque. Amplifier ladder is **fully empirical, automated via stamp system, transparent (each amplifier sees their own metrics)**, and operates without central editorial gate-keeping.
4. **Prior art (creator-economy platforms — YouTube, Substack, Patreon)**: rewards via cash payments OR algorithmic feed promotion. Amplifier rewards via **first-access to the platform's own broadcast schedule** — turning the platform's content calendar into a tiered drip-feed that amplifiers control their position in.
5. **Prior art (cooperative governance ladders)**: voting-weight escalation by tenure or contribution. Amplifier ladder is participation-based but **does not vote** — it gates information-time, not governance authority. Cleanly orthogonal to LB's governance bylaws.

**The composability claim itself is novel**: combining #2141 + Glass Door + Cue Cards + Stamps + Joules + Federation + Influencer Red Carpet into a single coherent funnel where each existing primitive plays its specific role, with the "forever stamp" grace mechanism inherited from currency-layer design, is — to Bishop's knowledge after canonical search — not present in any prior cooperative-platform architecture.

---

## Open verifications + Founder decisions deferred (memory-file referenced)

Per `project_amplifier_program_b129.md` — the following are LOCKED post-B129:
- ✅ Federation orthogonality
- ✅ Model 2 threshold ladder (10/100/500/2.5K/10K/25K)
- ✅ Rolling-30d metric + 3-layer standing model with Joules grace

The following are DEFERRED (lower priority, resolve before launch):
- Threshold-to-reward-slot mapping (T1→1, T6→6? scale?)
- Time-shift increments per threshold (3hr, 6hr, 12hr, 24hr per category?)
- Post-launch tuning of decay constant (default rolling-30d; adjust empirically)

---

## Provenance

- **Founder unload** B129, 2026-04-27 ~07:30 CDT during K525 Q3 (Cost-Slasher receipt-sharing) dialogue. Direct quotes embedded throughout the project memory file.
- **Bishop draft** B129 same-turn, captured at `project_amplifier_program_b129.md` (full architecture) + this AA Formal (filing-grade extract).
- **Founder ratification** B129: *"Yes draft AA formal 2318. Split."*
- **Keystones referenced**: #54 (Power contained — brand pattern); #46 (Generosity Lowers Cost); cooperative-funnel structural cousin to #5 brand tagline.
- **Naming canon**: per Founder B129 direction, "threshold" replaces "tier" throughout (Toolsmith TS-091); "tier" reserved for industry-standard influencer terminology in citations only.

---

*Filed #2318 by Bishop B129. Ants don't audition — they post. The signal source decentralizes; the platform compounds. FOR THE KEEP!*
