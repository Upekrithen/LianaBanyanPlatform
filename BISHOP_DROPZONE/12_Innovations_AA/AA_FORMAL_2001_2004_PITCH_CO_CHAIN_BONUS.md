---
name: Pitch-Embedded Contingency Operator and Beacon Run Chain Bonus
description: A pitch-embedded interactive business scenario calculator pre-loaded with campaign-specific numbers, combined with persistent scenario saving (with Ghost Rules), gamified Beacon Run persistence unlocks, and a consecutive share chain multiplier for viral distribution.
type: aa_formal
innovation_id: "2001-2004"
ratification_session: B035
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - pitch-embedded contingency operator
  - beacon run persistence unlock
  - consecutive share chain multiplier
  - business scenario research ghost persistence
  - contingency operator interactive calculator
  - chain benefit viral distribution
  - aa formal 2001-2004
  - cooperative pitch agency tool
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — Innovations #2001-#2004
## Pitch Contingency Operator + Beacon Run Chain Bonus
**Bishop Session:** 035 | **Date:** March 27, 2026 | **Knight:** K132
**Status:** DEPLOYED

---

### Innovation #2001 — Pitch-Embedded Contingency Operator
**Type:** Feature (Crown Jewel candidate)
**Category:** Business Onboarding — Interactive Calculator

**Description:**
When a prospective business owner scans a QR code from a Captain's pitch packet, they land on a page with the Contingency Operator pre-loaded with numbers specific to THEIR business scenario — the campaign's pledge count, estimated order volume, and the tier the Captain is pitching. The business owner sees real numbers, not abstractions.

The key insight: business owners want to PLAY with the numbers. "What if I commit at C+40 instead of C+60? What if my average order is $18 instead of $12? What happens if 200 people pledge instead of 50?" The CO lets them explore freely. The CTA is NOT "sign up" — it's "Would you like to explore what these numbers mean for YOUR business?" That question introduces the Contingency Operator's full toolset without being obtrusive or salesy.

**Architecture:**
- Mobile-first slider-based inputs (most QR scans happen on phones)
- 4 tier buttons (C+20/C+40/C+60/C+90) with C+60 as default (business owners discover C+20 themselves)
- 3 adjustable sliders: pledge count, average order value, monthly frequency
- Real-time computed results: monthly revenue, annual projection, cooperative savings vs. traditional
- SEC-safe language throughout — "business research tool" not "investment calculator"

**Cooperative Significance:**
The CO on the pitch page does something no traditional franchise pitch can do: it gives the prospect agency. Instead of a one-way presentation ("here's what we'll do for you"), the cooperative says "here are the levers — pull them yourself." This inverts the power dynamic of business development. The prospect becomes a researcher, not a target.

**Connected Innovations:** #1979 (Tiered Commitment Chart), #1985 (Captain's Calling Card), #1972 (Universal Business Onboarding)

---

### Innovation #2002 — Business Scenario Research (Save/Ghost)
**Type:** Feature
**Category:** Business Intelligence — Scenario Persistence

**Description:**
After playing with the CO numbers, users can save scenarios they want to revisit. Non-members get 24-hour ghost persistence (the scenario vanishes after 24h unless they become members). Members get permanent saves with comparison tools — overlay two scenarios side-by-side to see which commitment level serves them better.

This is positioned as "Business Research" — a benefit the platform provides for free. The scenarios live in the member's Helm (their personal space), accessible alongside their Bridges (project control panels). It's not a sales funnel; it's a genuine research tool that happens to demonstrate platform value.

**Architecture:**
- saved_business_scenarios table with user_id, campaign_id, scenario JSON, results JSON
- Ghost session support: scenarios saved to localStorage for non-authenticated users
- 24h TTL for ghost scenarios, permanent for authenticated members
- Comparison view: side-by-side scenario cards with delta highlighting

**Cooperative Significance:**
Traditional platforms gate business intelligence behind paywalls. The cooperative gives it away — but with a time constraint that mirrors the Ghost World rules used elsewhere. You get 24 hours of free research. Want more? Join the cooperative. Or earn more time by playing Beacon Run (#2003).

**Connected Innovations:** #2001 (Pitch-Embedded CO), #2003 (Beacon Run Persistence)

---

### Innovation #2003 — Beacon Run Persistence Unlock
**Type:** Feature (Gamification)
**Category:** Engagement — Earned Persistence

**Description:**
Complete a Beacon Run and your ghost scenario persistence extends. The escalation follows the platform's standard progression pattern:
- 1 run: 24h → 48h
- 2 runs: → 72h
- 3 runs: → 96h
- 4 runs: → 120h
- 5 runs: → 144h
- 6 runs: → 168h (1 full week)

This creates a beautiful loop: you scan a QR code → explore business scenarios → save one → it expires in 24h → BUT if you play Beacon Run (which teaches you about the platform), your scenario lives longer. The game becomes a research tool extender.

**Architecture:**
- getBeaconRunCount() queries completed beacon runs for user
- getPersistenceExtensionHours() maps run count to hour tier (24-168h escalating)
- extendScenarioPersistence() updates scenario expiry timestamp
- Triggered on Beacon Run completion (advanceToNextNode handler)

**Cooperative Significance:**
This is earn-to-learn, not pay-to-play. The platform rewards engagement with utility. Every Beacon Run teaches something about the cooperative while extending the user's access to business research tools. The progression is generous — 6 runs (maybe 30 minutes of gameplay) earns a full week of persistence.

**Connected Innovations:** #2002 (Business Scenario Research), Beacon Run system, Ghost World rules

---

### Innovation #2004 — Consecutive Share Chain Multiplier
**Type:** Feature (Viral Growth)
**Category:** Distribution — Chain Amplification

**Description:**
Every Beacon Run Deck Card shared consecutively via the Plugin earns an amplified bonus. The pattern follows the platform's standard chain benefit structure:
- Share 1: +5% bonus
- Share 2: +10% (cumulative)
- Share 3: +15%
- ...
- Share 20: +100% (cap)
- Share 21+: 20% sustained permanent bonus

The chain breaks if a day passes without a share. The visual indicator shows escalating flame icons and a progress bar toward the next tier.

**Architecture:**
- share_chains table: user_id, current_streak, max_streak, bonus_pct, sustained_bonus, last_share_at
- Chain break detection: if NOW() - last_share_at > 24h, streak resets (sustained bonus preserved)
- ShareChainIndicator component: flame icons, bonus %, progress bar, time remaining
- useShareChain hook: recordShare(), getChainStatus(), chain break detection

**Cooperative Significance:**
The Share Chain turns distribution into a game. Each consecutive share amplifies the reward, creating a psychological hook that's fundamentally different from "share and get $5." The 20% sustained bonus after streak 21 rewards long-term distributors — people who consistently spread the cooperative's reach. This is the "chain benefit" pattern the Founder has applied to other systems, now applied to viral distribution.

**Connected Innovations:** #2003 (Beacon Run Persistence), Beacon Run system, Plugin distribution

---

**Innovation Count after #2004:** 2,004
**Crown Jewels:** 131 → 132 (#2001 Pitch-Embedded CO — candidate)
