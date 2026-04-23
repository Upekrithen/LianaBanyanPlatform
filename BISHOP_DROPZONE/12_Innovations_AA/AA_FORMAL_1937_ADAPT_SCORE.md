# A&A FORMAL — Innovation #1937: ADAPT Score (Adaptive Deployment And Performance Tracking)
## Bishop Session 028 | March 23, 2026
## Patent Relevance: HIGH

---

## Classification

| Field | Value |
|-------|-------|
| Innovation # | 1937 |
| Name | ADAPT Score — Adaptive Deployment And Performance Tracking |
| Parent Initiative | Cross-cutting (Platform Governance + All 16 Initiatives) |
| Parent Innovations | #1936 (Margin Economics), #1911 (Two-Domain Architecture), #1887 (Crew Table), #1897 (Onboarding Credit) |
| Session Originated | Bishop 028 |
| Priority | HIGH |
| Status | Designed, not yet built |

---

## Description

The ADAPT Score is a **multi-dimensional measurement and governance system** applied to every deployed system on the Liana Banyan platform — and every external system that connects to it. It provides the instrument panel that makes informed micro-corrections possible across a distributed cooperative network.

### The Core Problem

A cooperative with 16 initiatives, hundreds of local nodes, and external co-op partners faces a control problem: how do you allow maximum local autonomy while maintaining constitutional integrity? How do you know what's working, what's failing, and what's innovating?

The answer comes from helicopter flight control theory.

### The Helicopter Analogy (Founder's Framework)

The Founder is an IFR-rated helicopter pilot (Aviation 15A, U.S. Army National Guard). His insight:

> "The real key to hovering is not reacting too strongly, and keeping changes to the cyclic minute — because there is a LOT of power that is transmitted through that differential transmission to the output, so we need to have info to make adjustments."

A helicopter has four control inputs, each operating at a different frequency and magnitude:

| Control | Helicopter Function | LB Equivalent | Frequency | Impact |
|---------|-------------------|---------------|-----------|--------|
| **Collective** | Blade pitch (all blades equally) — altitude | Platform-wide policy changes | Rare | High |
| **Cyclic** | Blade pitch (differential) — direction | Local SOP adjustments | Frequent | Low |
| **Pedals** | Tail rotor — anti-torque, heading | Course corrections from ADAPT feedback | Continuous | Medium |
| **Throttle** | Engine power — energy input | Resource allocation to nodes | As-needed | Variable |

**Key principle**: Small, frequent adjustments beat large, infrequent corrections. A pilot who makes tiny cyclic corrections hovers smoothly. A pilot who overcorrects oscillates and crashes. The ADAPT Score is the instrument panel — airspeed indicator, altimeter, attitude indicator, heading indicator — that tells the pilot what adjustments to make.

Without instruments, you fly by feel. Feel works in clear weather. It kills you in clouds. The ADAPT Score is the instrument flight rating for cooperative governance.

## The Six Dimensions

**ADAPT** is a six-letter acronym representing six scored dimensions. Each dimension is scored 0-100, then weighted to produce a composite score.

### E — Effectiveness (30% weight)

**Core metric**: Does the system achieve its stated purpose?

| Measurement | Source | Example |
|-------------|--------|---------|
| Completion rates | Transaction logs | Orders fulfilled / orders placed |
| Transaction volumes | Commerce Engine | Monthly throughput in Credits |
| Error rates | System logs, Star Chamber filings | Failed transactions, disputes |
| Uptime | Infrastructure monitoring | System availability percentage |

**Scoring logic**:
- 90-100: Exceeds stated purpose consistently
- 70-89: Meets stated purpose with minor gaps
- 50-69: Partially meets purpose, identifiable shortfalls
- 30-49: Significant underperformance
- 0-29: System is not achieving its purpose

**Example**: A Stocked Local Larder node that successfully delivers 95% of orders on time, with less than 2% error rate, scores 95/100 on Effectiveness.

### A — Adaptability (20% weight)

**Core metric**: How well has the local team customized the system for their context?

| Measurement | Source | Example |
|-------------|--------|---------|
| Local SOP modifications filed | sop_adaptations table | Houston flood-routing, Montana distance-scaling |
| Approval rate of adaptations | Adaptation review pipeline | Percentage of proposals that pass constitutional check |
| Regression rate | ADAPT trend monitoring | Adaptations that caused score decline |
| Context-awareness | Manual review flag | Did the node adapt to a real local condition or just tinker? |

**Scoring logic**:
- High score = the node recognized local conditions AND adapted meaningfully
- Low score = the node either (a) blindly followed defaults when local conditions demanded change, or (b) adapted without purpose
- CRITICAL: A node that tries 10 adaptations and 3 work scores HIGHER on Adaptability than a node that tries nothing and coasts. The score rewards engagement with local reality, not perfection.

**Example**: A Houston node that modified delivery routes for flooding season, added waterproof packaging SOPs, and shifted delivery windows around storm patterns scores 85/100. A Houston node using default nationwide routing during hurricane season scores 30/100 — not because defaults are bad, but because they ignored a condition that demanded attention.

**Innovation flows UP**: Adaptations that measurably improve ADAPT Scores get promoted to "Recommended Practice" and shared across the network. The Houston flood-routing SOP becomes available to every Gulf Coast node. Local intelligence becomes network intelligence.

### D — Durability (15% weight)

**Core metric**: Does the system sustain performance over time?

| Measurement | Source | Example |
|-------------|--------|---------|
| 30/60/90-day trend lines | adapt_scores historical data | Is performance stable, improving, or decaying? |
| Member retention | Membership activity logs | Are people staying engaged with this system? |
| Consistency | Standard deviation of daily/weekly metrics | Low variance = high durability |
| Recovery from disruptions | Incident logs | How quickly does the system bounce back? |

**Scoring logic**:
- A system that spikes at launch then crashes scores LOW
- A system with slow, steady growth scores HIGH
- Consistency is rewarded over volatility
- Recovery speed after disruptions is factored in

**Example**: A Mission ONE food distribution node that has maintained 85%+ fulfillment for 90 consecutive days scores 90/100 on Durability. A node that hit 99% in week one and dropped to 50% by month two scores 35/100.

### A — Alignment (15% weight)

**Core metric**: Does the local implementation stay true to LB constitutional principles?

**THIS IS THE GUARDRAIL.** Innovate freely — but don't break the constitutional constraints.

| Constitutional Rule | Check Method | Violation Response |
|-------------------|-------------|-------------------|
| Cost+20% floor | Automated price monitoring | Auto-flag, score to zero on Alignment |
| One-way valve | Transaction flow analysis | Auto-flag, escalate to Star Chamber |
| Margin lock | Margin calculation audit | Auto-flag, score to zero on Alignment |
| Member protections | Star Chamber case analysis | Case-by-case scoring |
| Data privacy | Access log review | Auto-flag, escalate immediately |

**Scoring logic**:
- 100: Full compliance with all constitutional rules, initiative SOPs, and platform standards
- 75-99: Minor procedural deviations, no constitutional violations
- 50-74: Procedural violations flagged and corrected within review period
- 1-49: Constitutional violations detected but contained
- 0: Active constitutional violation — Cost+20% undercut, one-way valve breach, margin lock bypass, or data privacy breach

**A score of zero on Alignment triggers automatic intervention regardless of all other dimension scores.** A node can have 100/100 on every other dimension — if it's violating Cost+20%, it gets flagged. This is the helicopter's engine fire warning: everything else is irrelevant until this is resolved.

**Example**: A node that modified its pricing structure, added local surcharges for rural delivery, but maintained Cost+20% floor on every transaction scores 95/100. A node that undercut Cost+20% to compete with a local non-cooperative business scores 0/100 — and triggers Star Chamber review.

### P — Participation (10% weight)

**Core metric**: Community engagement level

| Measurement | Source | Example |
|-------------|--------|---------|
| Active member percentage | Membership status table | Members using the system / members in the node |
| Crew Call response rates | Crew Call dispatch logs | How quickly do members respond when help is needed? |
| Voting participation | Senate/Pnyx records | Engagement with governance |
| Contribution frequency | Transaction + content logs | How often do members actively contribute (not just consume)? |

**Scoring logic**:
- Measures breadth and depth of engagement
- A node where 5 members do everything scores LOW
- A node where 50 members each do a little scores HIGH
- Governance participation (voting, proposals) weighted more heavily than passive consumption

### T — Transmission (10% weight)

**Core metric**: Knowledge sharing back to the network

| Measurement | Source | Example |
|-------------|--------|---------|
| Innovations submitted | Innovation log | Local ideas formalized and submitted to platform |
| SOP documents shared | local_sop table, status=shared | Procedures written up for other nodes to use |
| Mentoring connections | Shepherding + Crew Table logs | Node members helping other nodes |
| Bounty completions | integration_bounties table | Work done to improve platform-wide systems |

**Scoring logic**:
- This is where innovation flows from local nodes back to the whole platform
- Transmission rewards TEACHING, not just doing
- A node that solves a problem AND documents the solution for others scores higher than one that solves it silently
- Failed experiments that are documented and shared earn Transmission points — the lesson has value even when the experiment doesn't

**Example**: A Montana node that figured out rural distance-scaling for delivery routes, wrote it up as a formal SOP, and mentored two other rural nodes on implementation scores 90/100 on Transmission. A Montana node that figured out the same solution but kept it local scores 40/100.

## Composite ADAPT Score

```
ADAPT = (E × 0.30) + (A × 0.20) + (D × 0.15) + (A × 0.15) + (P × 0.10) + (T × 0.10)
```

**Tier Scale**:

| Score Range | Tier | Meaning | System Response |
|-------------|------|---------|-----------------|
| 90-100 | **Platinum** | Model implementation | Teaching others, featured in network, bonus resource allocation |
| 75-89 | **Gold** | Strong performance | Minor improvements suggested, eligible for expansion support |
| 60-74 | **Silver** | Functional | Significant room for growth, mentoring paired from Platinum node |
| 40-59 | **Bronze** | Needs attention | Support team assigned via Crew Call, 30-day improvement plan |
| Below 40 | **Red Flag** | Intervention required | Mandatory review, possible system reset, Star Chamber case if Alignment involved |

**Tier transitions trigger events:**
- Rising from Bronze to Silver = celebration notification to the node (morale matters)
- Dropping from Gold to Silver = automated diagnostic report + suggested actions
- Dropping to Red Flag from any tier = immediate Crew Call to the node + Star Chamber notification
- Reaching Platinum = automatic "Recommended Practice" extraction from the node's SOPs

## Local SOP Framework

### The Military Uniform Analogy

Military uniforms follow strict requirements — but they CHANGE. Aviators wear Nomex flight suits, not BDUs. Desert deployments get DCUs. Arctic deployments get ECWCs. The requirements are absolute (flame resistance for aviators, thermal protection for arctic). The implementation adapts to context.

LB works the same way. Three layers of operational procedure, each with different change authority:

### Layer 1: Platform Constitution (The Geneva Convention / UCMJ)

Applies to EVERYONE. Non-negotiable. Cannot be changed by any node, any initiative lead, or any single vote. Requires full Senate constitutional process to amend.

| Constitutional Rule | Why It Exists | Change Authority |
|-------------------|--------------|-----------------|
| Cost+20% floor | Prevents race-to-bottom, ensures cooperative sustainability | Senate supermajority only |
| One-way valve | Prevents capital extraction from cooperative to external shareholders | Senate supermajority only |
| Margin lock | Prevents margin manipulation to circumvent Cost+20% | Senate supermajority only |
| Member protections | Data privacy, fair treatment, dispute access | Senate supermajority only |
| Currency rules | 1 Credit = 1 Mark = 1 Joule, no cash-out on Credits | Senate supermajority only |

### Layer 2: Initiative SOPs (Branch Regulations)

Specific to each of the 16 initiatives. Set by the Initiative Lead and approved by platform governance. Nodes within an initiative must comply unless they file an Adaptation Request.

| Initiative | Key SOP Requirements |
|-----------|---------------------|
| Mission ONE (food) | Food safety certification, cold chain documentation, allergen tracking |
| Political Expedition | Strict nonpartisan requirements, no candidate endorsement, transparency rules |
| Arena | IP attribution requirements, 60/20/20 split enforcement, plagiarism checks |
| Rally Group | Vehicle safety requirements, insurance verification, Safety Ledger compliance |
| Let's Make Bread | Business viability review before storefront launch, mentoring assignment |
| Shield Knight | Legal review requirements, attorney-client privilege protections |
| Didasko | Curriculum review, instructor verification, student data protection |

### Layer 3: Local SOPs (Unit-Level SOPs)

Customized by each node for their specific locale, population, geography, culture, and legal environment.

| Node Context | Local SOP Examples |
|-------------|-------------------|
| Houston, TX | Flood-zone delivery routing, hurricane-season scheduling, Spanish-language menus |
| Rural Montana | Distance-based delivery surcharges, weekly batch delivery instead of daily, rancher-cooperative partnerships |
| New York City | Walkability routing (no vehicles needed for many deliveries), density-based node boundaries, subway-time scheduling |
| International (Germany) | DSGVO/GDPR compliance layer, VAT handling, Genossenschaft legal structure mapping |
| International (Japan) | Keigo-level formality in member communications, seasonal menu alignment, compact delivery vehicle requirements |

### Adaptation Request Pipeline

When a local node wants to modify how a system works in their area:

```
1. Node submits proposed SOP change
   └── Description, rationale, expected impact, affected systems

2. AUTOMATED: Constitutional check
   ├── Does it violate any Platform Constitution rule?
   ├── YES → Auto-reject with explanation. Node can appeal to Senate.
   └── NO → Proceed to Step 3

3. AUTOMATED: Initiative SOP check  
   ├── Does it violate the parent Initiative's SOPs?
   ├── YES → Flag for Initiative Lead review (human decision within 7 days)
   │         ├── Approved → Proceed to Step 4
   │         ├── Denied → Node can appeal to Senate
   │         └── Modified → Revised version proceeds to Step 4
   └── NO → Auto-approve, proceed to Step 4

4. DEPLOYMENT: Change goes live with 30-day monitoring
   └── ADAPT Score tracked before/after

5. 30-DAY REVIEW: Evaluate ADAPT Score impact
   ├── ADAPT Score improved → Promote to "Recommended Practice" for similar nodes
   ├── ADAPT Score unchanged → Keep as local SOP, no network promotion
   ├── ADAPT Score declined slightly → Flag for review, offer rollback option
   └── ADAPT Score declined significantly → Automatic rollback, post-mortem required
```

**Key design principle**: The pipeline is LIGHTWEIGHT. Most adaptations auto-approve in minutes. Only constitutional violations and initiative SOP conflicts require human review. We do NOT want bureaucracy killing innovation. The Founder's directive is clear: "Innovation needs to be allowed, even when it's wrong, so we learn."

## External Cooperative Integration

### The Problem

Thousands of cooperatives already exist worldwide — credit unions, food co-ops, housing co-ops, worker co-ops, agricultural co-ops. They have their own systems, their own procedures, their own cultures. LB doesn't need them to abandon all of that. LB needs to CONNECT with them.

The Founder's framing: "Existing systems in the world need to connect to LB, or LB to them — and they want to do things THEIR way. No problem."

### Compatibility Assessment

Before integration begins, both LB and the external cooperative undergo a mutual compatibility assessment:

| Assessment Area | What's Checked | Tool |
|----------------|---------------|------|
| Governance model | Democratic structure, member voting rights, surplus distribution | Questionnaire + document review |
| Financial systems | Accounting standards, currency/payment methods, audit practices | API capability scan |
| Member protections | Privacy policies, dispute resolution, fair treatment standards | Policy comparison |
| Technology stack | API availability, data formats, authentication, uptime history | Technical assessment |
| Cultural alignment | Cooperative principles adherence, community focus, openness to collaboration | Mutual interviews |

The assessment produces an initial ADAPT Score prediction — a forecast of how well the integration will perform across all six dimensions.

### Integration Tiers

| Tier | Name | What It Means | Requirements | ADAPT Monitoring |
|------|------|-------------|-------------|-----------------|
| 1 | **Data Mirror** | Share member counts, transaction volumes, impact metrics. Read-only. No money flows. | API endpoint + data sharing agreement | Light (quarterly) |
| 2 | **Credit Bridge** | LB Credits accepted at the external co-op and vice versa. Money flows between systems. | UCC/regulatory review (Pawn Batch 12), escrow agreements, reconciliation system | Medium (monthly) |
| 3 | **Full Mesh** | Shared governance participation, cross-platform Crew Calls, unified ADAPT dashboard, joint innovation pool | Full legal partnership agreement, mutual constitutional adoption, technology integration complete | Heavy (continuous) |

**Tier advancement is ADAPT-driven**: A partner must maintain Gold or higher ADAPT Score at their current tier for 90 days before being eligible to advance. This ensures integration quality builds incrementally.

### Integration Bounties

Any programmer — member or non-member — can claim a bounty to build an interface between LB and an external cooperative's systems.

**Bounty lifecycle**:

```
1. Integration need identified
   └── Either LB or the external co-op requests a connector

2. Bounty posted on the Arena
   ├── Description of the interface needed
   ├── Technical requirements (API specs, data formats, auth requirements)
   ├── Reward: Credits + Marks (standard LB commerce at Cost+20%)
   └── Timeline and acceptance criteria

3. Crew Call assembles a dev team
   ├── Shepherding Bounty (#1913) specialists matched by skill
   ├── Crew Table seat assigned for the integration project
   └── Team composition: minimum 1 LB-side dev + 1 external co-op liaison

4. Interface built, tested, deployed
   ├── Development follows standard LB code practices
   ├── Testing against both systems
   ├── ADAPT Score baseline established
   └── 30-day monitoring period

5. Developer team compensated
   ├── Credits earned through standard Commerce Engine
   ├── Marks generated if the project is on a funded initiative
   └── Ongoing maintenance bounties available for continued support

6. Interface becomes platform IP
   ├── 60/20/20 split (standard LB IP model)
   ├── Developer retains usage rights
   ├── Developer can maintain/improve for ongoing bounties
   └── Other nodes can deploy the same interface
```

**The Adapter Pattern**: Interfaces are built as ADAPTERS — translation layers that sit between LB and the external system. Neither side has to change their core operations. The adapter handles mapping, translation, and reconciliation. This is standard software architecture applied to cooperative interoperability.

### Mutual ADAPT Scoring

Both LB and the connecting cooperative receive ADAPT Scores for the integration:

- **LB's score**: How well is LB serving this partner? Is the API reliable? Is support responsive? Are Credits flowing correctly?
- **Partner's score**: How well is the partner maintaining their end? Is data fresh? Are transactions reconciling? Are members satisfied with the cross-platform experience?

This mutuality prevents LB from becoming an extractive hub. If LB's integration quality drops, the partner's ADAPT dashboard shows it — and the partner can raise it at the Senate level. The scoring is symmetric.

## Innovation Feedback Loop

### The Founder's Directive

"Innovation needs to be allowed, even when it's wrong, so we learn."

"My way isn't necessarily the BEST way."

These are not throwaway lines. They are architectural principles. The ADAPT Score is designed to EMBODY them:

### How the Feedback Loop Works

```
Local node tries something new (Adaptation Request)
  │
  ├── It works → ADAPT Score rises
  │     └── Promoted to "Recommended Practice"
  │           └── Other similar nodes notified
  │                 └── They try it too
  │                       └── Network improves
  │
  ├── It partially works → ADAPT Score mixed
  │     └── Documented as "Conditional Practice"
  │           └── Shared with context notes
  │                 └── Other nodes can try with awareness of limitations
  │
  └── It fails → ADAPT Score declines
        └── Documented as "Lessons Learned"
              └── Shared with failure analysis
                    └── Other nodes AVOID the mistake
                          └── Network improves (by subtraction)
```

**All three outcomes improve the network.** Success teaches what works. Partial success teaches conditions. Failure teaches what doesn't work. The only outcome that DOESN'T improve the network is **stagnation** — a node that tries nothing, learns nothing, and shares nothing.

### Scoring Innovation vs. Stagnation

The T (Transmission) and A (Adaptability) dimensions together comprise 30% of the ADAPT Score. A node that:

- Tries 10 local adaptations, 3 succeed, 7 fail, all documented and shared → **High Adaptability + High Transmission**
- Tries nothing, follows defaults perfectly, shares nothing → **Zero Adaptability + Zero Transmission**

The first node scores significantly higher overall, even though 70% of its experiments failed. This is by design. Cooperative evolution requires experimentation. The ADAPT Score incentivizes it.

### Micro-Innovation Tracking

Every local SOP change — no matter how small — is tracked as a micro-innovation:

- Changed delivery window from 11am-1pm to 10:30am-1:30pm based on local traffic patterns? Micro-innovation.
- Added a second language to customer notifications? Micro-innovation.
- Modified the Crew Call radius from 5 miles to 8 miles for a rural area? Micro-innovation.

These accumulate. A node generating 20 micro-innovations per quarter is a living laboratory. That data — what was tried, what worked, what didn't — becomes network intelligence. It's the cooperative equivalent of a military unit's after-action reviews flowing up to doctrine development.

## Helicopter Control Theory — Formalized

### The Four Controls as Governance Mechanisms

**Collective (Platform-wide policy)**
- Analogy: All rotor blades change pitch equally — the whole aircraft rises or descends
- LB equivalent: Constitutional amendments, platform-wide initiative launches, currency policy changes
- Frequency: Rare (quarterly at most)
- Authority: Senate supermajority
- ADAPT role: Collective changes are evaluated by aggregate ADAPT Score trends across ALL nodes
- Example: Deciding to add a 17th initiative requires seeing that the existing 16 are healthy (network-wide ADAPT average above Silver)

**Cyclic (Local SOP adjustments)**
- Analogy: Differential blade pitch — one side more, one side less — tilts the aircraft in a direction
- LB equivalent: Local nodes adjusting their operations for local conditions
- Frequency: Frequent (daily to weekly)
- Authority: Node-level, auto-approved if constitutional and initiative-compliant
- ADAPT role: Each cyclic adjustment is monitored for 30 days via ADAPT Score delta
- Example: A node tilts toward evening deliveries because their area has a night-shift population

**Pedals (Anti-torque corrections)**
- Analogy: Tail rotor counteracts main rotor torque — keeps the helicopter pointed in the right direction
- LB equivalent: Course corrections triggered by ADAPT Score feedback
- Frequency: Continuous (automated monitoring)
- Authority: System-generated recommendations, node executes
- ADAPT role: When ADAPT Score trends indicate drift (declining Alignment, falling Participation), the system generates corrective recommendations
- Example: A node's Participation score drops from 70 to 55 over 60 days — the system flags it, suggests a community engagement Crew Call, and monitors recovery

**Throttle (Resource allocation)**
- Analogy: Engine power — more throttle means more energy available to all controls
- LB equivalent: Resource allocation to nodes based on ADAPT performance
- Frequency: As-needed, based on ADAPT tier
- Authority: Platform resource allocation algorithm + Innovation Pool (#1784 IP Load Balancing)
- ADAPT role: Higher-ADAPT nodes receive priority access to expansion resources, mentoring assignments, and integration opportunities
- Example: A Platinum node requesting resources for a new initiative gets priority over a Bronze node requesting the same — not as punishment, but because the Platinum node has demonstrated the capacity to use resources effectively

### The Over-Correction Warning

The Founder's key insight: "The real key to hovering is not reacting too strongly."

The ADAPT system includes **dampening mechanisms** to prevent over-correction:

- **Score smoothing**: ADAPT Scores use a 7-day rolling average, not instantaneous measurement. A single bad day doesn't crater a score.
- **Trend weighting**: Direction matters more than position. A node at 55 trending up is healthier than a node at 75 trending down.
- **Intervention thresholds**: Support teams aren't dispatched on first dip. The system waits for sustained decline (14+ days) before triggering Crew Call support.
- **Rollback cooling period**: After an adaptation is rolled back, the node gets a 14-day stabilization period before being re-scored on that dimension.

These dampeners prevent the organizational equivalent of pilot-induced oscillation — where overcorrection in one direction triggers overcorrection in the other, creating a feedback loop that destabilizes the system.

## Data Model (for Knight Prompt)

### Tables

**adapt_scores**
```sql
CREATE TABLE adapt_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES nodes(id),
  system_id UUID NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('effectiveness','adaptability','durability','alignment','participation','transmission')),
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  composite_score NUMERIC(5,2),
  tier TEXT CHECK (tier IN ('platinum','gold','silver','bronze','red_flag')),
  measured_at TIMESTAMPTZ DEFAULT now(),
  measurement_period_days INTEGER DEFAULT 7,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**adapt_baselines**
```sql
CREATE TABLE adapt_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID NOT NULL,
  initiative_id UUID,
  baseline_config JSONB NOT NULL,
  default_sop JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**local_sop**
```sql
CREATE TABLE local_sop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL,
  system_id UUID NOT NULL,
  title TEXT NOT NULL,
  modification_description TEXT NOT NULL,
  rationale TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft','active','superseded','rolled_back')),
  adapt_impact NUMERIC(5,2),
  adapt_score_before NUMERIC(5,2),
  adapt_score_after NUMERIC(5,2),
  promoted_to_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**sop_adaptations**
```sql
CREATE TABLE sop_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL,
  system_id UUID NOT NULL,
  proposed_change TEXT NOT NULL,
  rationale TEXT NOT NULL,
  constitutional_check TEXT DEFAULT 'pending' CHECK (constitutional_check IN ('pending','pass','fail')),
  constitutional_check_details JSONB,
  initiative_check TEXT DEFAULT 'pending' CHECK (initiative_check IN ('pending','pass','fail','flagged')),
  initiative_check_details JSONB,
  initiative_lead_decision TEXT CHECK (initiative_lead_decision IN ('approved','denied','modified')),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','auto_approved','under_review','approved','denied','deployed','monitoring','promoted','rolled_back')),
  adapt_delta NUMERIC(5,2),
  monitoring_start TIMESTAMPTZ,
  monitoring_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**integration_partners**
```sql
CREATE TABLE integration_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_union','food_coop','housing_coop','worker_coop','agricultural_coop','consumer_coop','other')),
  tier INTEGER DEFAULT 1 CHECK (tier IN (1, 2, 3)),
  adapt_score NUMERIC(5,2),
  adapt_tier TEXT CHECK (adapt_tier IN ('platinum','gold','silver','bronze','red_flag')),
  lb_side_adapt_score NUMERIC(5,2),
  compatibility_assessment JSONB,
  contact_info JSONB,
  partnership_agreement_url TEXT,
  tier_upgrade_eligible_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**integration_bounties**
```sql
CREATE TABLE integration_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES integration_partners(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technical_requirements JSONB,
  reward_credits NUMERIC(10,2) NOT NULL,
  reward_marks NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','in_progress','review','completed','cancelled')),
  claimed_by UUID,
  crew_table_id UUID,
  acceptance_criteria TEXT,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policy Notes (for Knight)

- `adapt_scores`: Read-only for all authenticated members (transparency). Write restricted to system functions and platform admins.
- `local_sop`: Read for all members within the node. Write for node leads and admins.
- `sop_adaptations`: Read for all members. Write for node leads (submit), initiative leads (review), system (auto-checks).
- `integration_partners`: Read for all members. Write for platform admins only.
- `integration_bounties`: Read for all members. Write (claim) for any authenticated member. Write (status changes) for bounty creator and admins.

## Connection Map

```
#1937 ADAPT Score
  ├── ALL 16 Initiatives (cross-cutting measurement system)
  ├── #1936 Margin Economics (the constitutional floor that Alignment checks against)
  ├── #1911 Two-Domain Architecture (eligible Marks from ADAPT-related work)
  ├── Star Chamber (ADAPT Scores inform case filings; Alignment violations escalate to Dredd)
  ├── Arena (bounties for integration interface development)
  ├── Crew Tables (#1887) (teams assembled for adaptation work and node support)
  ├── Senate/Pnyx (constitutional amendments informed by ADAPT trend data)
  ├── Shepherding Bounty (#1913) (Shepherds dispatched for node support Crew Calls)
  ├── Innovation Pool / IP Load Balancing (#1784) (bounty funding source)
  ├── Commerce Engine (transaction data feeds Effectiveness dimension)
  ├── MoneyPenny AI (could generate ADAPT reports and trend alerts)
  └── Ghost World / HexIsle (ADAPT Scores visualized as node health on hex map)
```

## Patentable Elements

1. **Multi-dimensional cooperative system effectiveness scoring with local SOP adaptation tracking** — A scoring system that evaluates deployed cooperative systems across six weighted dimensions (Effectiveness, Adaptability, Durability, Alignment, Participation, Transmission) with automated constitutional compliance checking and local operational modification tracking.

2. **Automated constitutional compliance checking for local operational modifications** — A pipeline that automatically validates proposed local SOP changes against immutable constitutional rules and initiative-level regulations, auto-approving compliant changes and flagging violations for human review.

3. **Innovation feedback loop that rewards experimentation velocity, not just success rate** — A scoring methodology where nodes that attempt more adaptations (even failed ones) score higher than stagnant nodes, with all outcomes (success, partial success, failure) documented and shared across the cooperative network.

4. **Cross-cooperative integration scoring with tiered connectivity and bounty-funded interface development** — A mutual scoring system for cooperative-to-cooperative integration that scores both parties, gates tier advancement on sustained performance, and funds interface development through a bounty marketplace.

5. **Helicopter control theory applied to cooperative governance: cyclic/collective/pedal/throttle resource allocation model** — A governance framework mapping four helicopter flight controls to four cooperative management frequencies (platform-wide policy, local adjustment, feedback correction, resource allocation), with dampening mechanisms to prevent organizational oscillation.

## SEC/Legal Notes

- ADAPT Score is an **operational measurement tool**, not a financial instrument
- Scores do not represent or determine investment returns — they measure system performance
- Resource allocation based on ADAPT Scores is analogous to performance-based management, not securities distribution
- Integration bounties are **compensation for services rendered** (1099-reportable), not investment contracts
- Credit Bridge (Tier 2 integration) requires separate UCC/regulatory review — flagged for Pawn Batch 12
- No member can trade, sell, or speculate on ADAPT Scores — they are not a currency, not a commodity, not a token
- ADAPT data is cooperative operational intelligence, owned collectively, not individual member property

## Implementation Notes

- **Phase 1**: Build the data model and scoring engine. Manual data entry for initial ADAPT assessments. Dashboard for node leads to view their scores.
- **Phase 2**: Automate data collection from existing platform systems (Commerce Engine transaction logs, Star Chamber case data, membership activity logs). Automated constitutional compliance checking for Adaptation Requests.
- **Phase 3**: External cooperative integration framework. Integration bounty marketplace. Mutual ADAPT scoring.
- **Phase 4**: Full helicopter control model — automated resource allocation recommendations based on ADAPT trends. MoneyPenny AI integration for ADAPT reporting. Ghost World visualization of network health.

---

**FOR THE KEEP.**