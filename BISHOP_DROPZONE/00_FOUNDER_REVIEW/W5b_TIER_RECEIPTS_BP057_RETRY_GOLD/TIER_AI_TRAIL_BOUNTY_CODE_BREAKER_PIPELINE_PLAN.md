# Trail→Bounty→Code Breaker: 5-Phase Multi-Pawn SEG Plan
## TIER AI · W5b Channel 1 Extension · BP057 RETRY GOLD · 2026-05-25

---

## §0 Executive Overview

The Trail→Bounty→Code Breaker pipeline is the Liana Banyan Platform's structured engagement system for Members who want to earn Marks through participation. It operates as three progressive challenge classes, gated by a thresh-Prov-20 canonical event at Phase 4, and calibrated by a National Park difficulty rating at Phase 5.

**The Three Classes:**

| Class | What You Do | Marks Class |
|-------|-------------|-------------|
| **Trail** (Phase 1) | Walkthrough — follow a guided path, learn the platform | Participation Marks |
| **Bounty** (Phase 2) | Task — complete a defined cooperative task for the platform | Task Marks |
| **Code Breaker** (Phase 3) | Challenge — solve an open-ended cooperative problem | Challenge Marks |

---

## §1 Phase 1: Trails (Walkthrough Class)

**Definition:** A Trail is a guided walkthrough of a Liana Banyan Platform function. Trails are onboarding experiences designed to bring Members from "signed up" to "operating cooperatively."

### Trail Architecture

- **Trailhead:** Entry point (Membership page, initiative page, or Pnyx)
- **Waypoints:** 3–7 defined steps, each with a logged interaction
- **Summit:** Completion event (Marks awarded, substrate receipt logged)

### Trail Types

| Trail Name | Platform Function | Estimated Completion |
|---|---|---|
| The First Mile | Platform basics (profile, Marks, cooperative dashboard) | 15 min |
| Let's Get Groceries Trail | Group purchasing workflow | 30 min |
| Pnyx Primer | Governance participation | 20 min |
| The Neighborhood Trail | Bruck'lyn node discovery + join | 25 min |
| Slingshot Basecamp | Accelerator orientation | 45 min |

### Trail Completion Hooks

On Trail completion:
- Log to substrate: `{ type: "trail_complete", trail_id, member_id, ts, marks_earned }`
- Award Participation Marks (defined in Marks schema below)
- Unlock next Trail (or Bounty if Trail series complete)

---

## §2 Phase 2: Bounties (Task Class)

**Definition:** A Bounty is a defined cooperative task posted by the platform, a Member, or a Bruck'lyn node — with a Marks reward for completion. Bounties are the work-for-cooperative-benefit layer.

### Bounty Architecture

- **Poster:** Platform (system-class) · Member · Bruck'lyn node · Slingshot cohort
- **Task definition:** Specific, verifiable, time-bounded
- **Reward:** Marks (cooperative currency) + substrate receipt
- **Verification:** Peer-witness (2 Members confirm completion) or automated (substrate event)

### Bounty Categories

| Category | Example Task | Marks Range |
|---|---|---|
| Onboarding | Help a new Member complete their first Trail | 50–100 |
| Content | Write a Pnyx Proposal that reaches deliberation | 100–500 |
| Commerce | Coordinate a group purchasing event | 200–800 |
| Governance | Serve as a Pnyx deliberation Scribe | 300–1,000 |
| Node | Launch a Bruck'lyn node | 500–2,000 |
| Innovation | Document a cooperative innovation for CANON | 250–1,000 |

### Bounty Lifecycle

```
Post → Accept → Complete → Peer-Witness → Marks Award → Substrate Log
```

---

## §3 Phase 3: Code Breaker (Challenge Class)

**Definition:** A Code Breaker is an open-ended cooperative challenge — a problem without a predefined solution. Code Breakers are the platform's innovation engine, drawing on the full cooperative intelligence of the Member network.

### Code Breaker Architecture

- **Problem posting:** Platform or Member posts a challenge with stakes
- **Open period:** 30–90 days (challenge class determines)
- **Submission:** Any Member may submit a solution
- **Adjudication:** Alumni Council (for Slingshot-class) or Pnyx vote (for platform-class)
- **Reward:** Challenge Marks + CANON entry + Slingshot fast-track eligibility

### Code Breaker Tiers

| Tier | Scope | Marks | CANON |
|---|---|---|---|
| Block | Neighborhood-level challenge | 1,000–5,000 | Optional |
| Borough | Initiative-level challenge | 5,000–25,000 | Required |
| Platform | Platform-wide challenge | 25,000–100,000 | Required + Pearl |

### Code Breaker Principles

- No single correct answer (open-ended)
- All submissions logged to substrate (even non-winners inform platform learning)
- Winner determined by cooperative adjudication, not algorithm
- Failed submissions earn minimum Trail Marks (participation honored)

---

## §4 Phase 4: Thresh-Prov-20 Gate

**Definition:** The thresh-Prov-20 gate is a canonical threshold event. Before any Code Breaker challenge reaches Platform tier (25,000+ Marks), it must pass a provisional 20-point assessment by the Pnyx.

### The 20-Point Assessment

| Domain | Points |
|---|---|
| Cooperative benefit (clear Member benefit) | 0–5 |
| Platform fit (uses/extends existing infrastructure) | 0–4 |
| CANON potential (innovations shareable) | 0–4 |
| Scope clarity (problem well-defined) | 0–4 |
| Adjudication plan (clear winner determination) | 0–3 |
| **Total** | **0–20** |

**Threshold:** 14/20 to proceed to Platform tier.

### Gate Ceremony

Thresh-Prov-20 assessments are voted in the Pnyx, logged as PNX-THRESH-NNNN, and permanently canonized. This creates an empirical record of what the cooperative considered worth challenging.

---

## §5 Phase 5: Difficulty Rating (National Park Class)

**Definition:** All Trails, Bounties, and Code Breakers carry a National Park difficulty rating — familiar to any hiker, legible to any Member.

### Rating Scale

| Rating | Meaning | Trail Example |
|---|---|---|
| 🟢 Easy | Accessible to any Member, no prerequisites | First Mile Trail |
| 🔵 Moderate | Requires basic platform familiarity | Pnyx Primer |
| ⬛ Difficult | Requires active Membership + 1 prior Trail | Slingshot Basecamp |
| 🟡 Strenuous | Expert cooperative operator, node leader | Platform Code Breaker |
| 🔴 Technical | Requires thresh-Prov-20 gate clearance | Platform Tier Code Breaker |

The National Park metaphor is intentional: the platform is terrain. Some paths are for everyone. Some require preparation. The rating tells you which is which — without condescension.

---

## §6 Pawn Dispatch Templates

### Template 1: Trail Design Brief (Phase 1)

```
PAWN DISPATCH — TRAIL DESIGN
BP: BP057+ / Session: [INSERT]
Type: task
Priority: Tier-2

Task: Design a Trail walkthrough for [TRAIL_NAME].

Trail target: Members who [describe target Member state].
Platform function: [Describe the cooperative function this Trail covers].
Estimated completion time: [XX] minutes.

Deliverable format:
1. Trail title + tagline
2. Trailhead description (1 paragraph)
3. Waypoints (3–7 steps, each with: action + logged event + Member-visible confirmation)
4. Summit description (completion event + Marks rationale)
5. National Park difficulty rating with justification

Cross-reference:
- Related Sweet Sixteen initiative: [INITIATIVE]
- Existing Trails this connects to: [TRAIL_IDS]

Marks range: [XX]–[XX] Participation Marks

Output: Structured YAML schema + Member-facing markdown page.
```

### Template 2: Bounty Specification (Phase 2)

```
PAWN DISPATCH — BOUNTY SPECIFICATION
BP: BP057+ / Session: [INSERT]
Type: task
Priority: Tier-2

Task: Specify a Bounty for [BOUNTY_TITLE].

Poster class: [Platform | Member | Bruck'lyn node | Slingshot cohort]
Category: [Onboarding | Content | Commerce | Governance | Node | Innovation]
Time window: [X] days

Deliverable format:
1. Bounty title + description (plain language, ≤ 120 words)
2. Task definition (specific, verifiable — what exactly must be done)
3. Verification method (peer-witness OR automated substrate event)
4. Marks award (justify against category range)
5. National Park difficulty rating
6. Success criteria (how completion is confirmed)
7. Non-completion clause (what happens if Bounty expires unclaimed)

Cross-reference:
- Initiative: [INITIATIVE]
- Pnyx alignment: [Does this Bounty advance any active Pnyx Proposal? Y/N]

Output: Bounty JSON schema entry + Member-facing description.
```

### Template 3: Code Breaker Challenge (Phase 3)

```
PAWN DISPATCH — CODE BREAKER CHALLENGE
BP: BP057+ / Session: [INSERT]
Type: task
Priority: Tier-1

Task: Compose a Code Breaker challenge for [CHALLENGE_TITLE].

Tier: [Block | Borough | Platform]
Open period: [30 | 60 | 90] days
Stakes: [Marks amount]

Deliverable format:
1. Challenge title + problem statement (plain language, ≤ 200 words)
2. Context section (what led to this challenge, what the platform has tried)
3. Constraints (what solutions must NOT do — cooperative-class filter)
4. Adjudication plan (who decides, how, what criteria)
5. Submission format (what a valid solution looks like)
6. CANON commitment (what the winner must document)
7. Thresh-Prov-20 pre-assessment (if Platform tier: score each of the 5 domains)
8. National Park difficulty rating

Cross-reference:
- Innovation seeds: [List any existing CANON refs relevant to this challenge]
- Related Slingshot cohorts: [Any active cohorts that might submit?]

Output: Code Breaker JSON schema entry + Pnyx deliberation brief.
```

---

## §7 Member-Facing Instructions

See Hugo page: `Cephas/cephas-hugo/content/programs/trails/_index.md`

---

## §8 Cooperative-Class Marks Earning — JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LB_Marks_Earning_Event",
  "description": "Cooperative-class Marks earning hook schema for Trail, Bounty, and Code Breaker completions",
  "type": "object",
  "required": ["event_id", "event_type", "member_id", "ts", "marks_earned", "basis"],
  "properties": {
    "event_id": {
      "type": "string",
      "description": "Unique event identifier (hex16)",
      "pattern": "^[a-f0-9]{16}$"
    },
    "event_type": {
      "type": "string",
      "enum": ["trail_complete", "bounty_complete", "code_breaker_submission", "code_breaker_win"],
      "description": "The type of Marks-earning event"
    },
    "member_id": {
      "type": "string",
      "description": "Member's cooperative identifier"
    },
    "ts": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of the event"
    },
    "marks_earned": {
      "type": "integer",
      "minimum": 1,
      "description": "Marks awarded to the Member"
    },
    "basis": {
      "type": "object",
      "required": ["class", "id", "difficulty"],
      "properties": {
        "class": {
          "type": "string",
          "enum": ["trail", "bounty", "code_breaker"],
          "description": "Which challenge class triggered this event"
        },
        "id": {
          "type": "string",
          "description": "Trail ID, Bounty ID, or Code Breaker ID"
        },
        "difficulty": {
          "type": "string",
          "enum": ["easy", "moderate", "difficult", "strenuous", "technical"],
          "description": "National Park difficulty rating"
        },
        "tier": {
          "type": "string",
          "enum": ["block", "borough", "platform"],
          "description": "Code Breaker tier (code_breaker class only)"
        }
      }
    },
    "substrate_receipt": {
      "type": "object",
      "properties": {
        "canonical_ref": { "type": "string" },
        "pearl_id": { "type": "string" },
        "pnx_decision": { "type": "string", "description": "e.g. PNX-0042 if Pnyx ratified" }
      }
    },
    "peer_witness": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 0,
      "maxItems": 5,
      "description": "Member IDs of peer witnesses (Bounty class)"
    },
    "thresh_prov20_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 20,
      "description": "Thresh-Prov-20 gate score (Platform Code Breaker only)"
    }
  }
}
```

---

*Knight · TIER AI · W5b Channel 1 Extension · BP057 RETRY GOLD · 2026-05-25*
