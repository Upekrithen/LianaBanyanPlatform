# MoneyPenny — The Big Show Enabler

**Bushel 82 / BP034 / LB-STACK-0170**

> "Warren Buffett doesn't get interrupted by MacKenzie Scott. And neither remembers having to introduce themselves twice."

MoneyPenny is the always-on substrate gateway that triages every inbound interaction (call, email, Slack, web form, AI tool invocation) to the right agent (Pawn / Knight / Rook / Bishop / Founder), holds context across the routing, and **never drops state**.

---

## The Three Subsystems

```
              [INBOUND CHANNEL]
                    │
                    ▼
        ┌─────────────────────────┐
        │  MONEYPENNY GATEWAY     │
        │  (Subsystem 1: Routing) │
        └─────────┬───────────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
 [Founder]   [AI Agent]   [Hold + Engage]
                  │
                  ▼
        ┌─────────────────────────┐
        │  MCCI CONTEXT KERNEL    │
        │  (Subsystem 2:          │
        │   Continuous Context)   │
        └─────────┬───────────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │  CALENDAR + AVAILABILITY│
        │  (Subsystem 3:          │
        │   Time + State)         │
        └─────────────────────────┘
```

### Subsystem 1: Routing Gateway (`src/moneypenny/gateway/`)

| File | Purpose |
|------|---------|
| `priority_taxonomy.ts` | 8 CallerClass tiers (Warren Buffett → Unknown → INTERNAL_AI) |
| `no_collision_arbiter.ts` | Priority queue; no signal drop; no deep-work interrupt |
| `hold_and_engage.ts` | Substantive Engager orchestration; transition packets |
| `router.ts` | Primary entry point — composes all three |

### Subsystem 2: MCCI Context Kernel (`src/moneypenny/mcci/`)

| File | Purpose |
|------|---------|
| `thread_store.ts` | Persistent per-relationship + per-topic threads (JSON files) |
| `compression_3k.ts` | 3K compression contract per LB-STACK-0222 |
| `handoff_protocol.ts` | Agent-to-agent context handoff (Pawn → Bishop → Knight → Founder) |
| `resurrection.ts` | Dormant thread warm-reopen packet |
| `context_kernel.ts` | Composes all MCCI primitives into one surface |

### Subsystem 3: Calendar + Availability (`src/moneypenny/calendar/` + `src/moneypenny/agents/`)

| File | Purpose |
|------|---------|
| `availability_state.ts` | 6 availability classes; persistent state |
| `outlook_adapter.ts` | Outlook read-only calendar (v1; requires env vars) |
| `google_adapter.ts` | Google Calendar read-only (v1) |
| `icloud_adapter.ts` | iCloud CalDAV stub (optional per G9) |
| `auto_scheduler.ts` | Read-only scheduling proposals with prep-window logic |
| `kissaki_assignment.ts` | Kissaki rank → model mapping (LB-STACK-0167) |
| `substantive_engager.ts` | The agent that holds B-tier callers with substance |

---

## MCP Tools

All 6 tools registered in the main Librarian MCP server:

| Tool | Purpose |
|------|---------|
| `mcp__moneypenny__route` | Route an inbound interaction |
| `mcp__moneypenny__hold` | Manage substantive hold sessions |
| `mcp__moneypenny__resurrect` | Resurrect dormant context |
| `mcp__moneypenny__status` | Query current routing/context state |
| `mcp__moneypenny__availability_get` | Read Founder availability |
| `mcp__moneypenny__availability_set` | Set Founder availability |

---

## Caller Priority Classes

| Class | Description | Interrupt DEEP_WORK? |
|-------|-------------|---------------------|
| `WARREN_BUFFETT` | Founder-direct, unblockable | ✅ Always |
| `FAMILY` | Founder family (non-sleep) | ✅ Always |
| `COUNSEL` | Legal counsel | ✅ Always |
| `MACKENZIE_SCOTT` | Important stakeholder | ❌ Substantive hold |
| `PRESS` | Journalists (24hr prep window) | ❌ Substantive hold |
| `TALENTS_PRACTITIONER` | PF300 cohort | ❌ Batch queue |
| `UNKNOWN` | Cold inbound | ❌ Human review |
| `INTERNAL_AI` | AI-to-AI handoff | N/A — AI handoff |

---

## Kissaki Guild Assignments (LB-STACK-0167)

| Role | Rank | Model |
|------|------|-------|
| Inbound triage | Apprentice | Sonnet 4.6 |
| Substantive Engager (B-tier) | Journeyman | Sonnet 4.6 + canon Eblets |
| Substantive Engager (A-tier holdover) | Master | Opus 4.7 |
| MCCI Compressor | Apprentice | Sonnet 4.6 |
| Resurrection synthesizer | Journeyman | Sonnet 4.6 |
| Founder transition packet | Master | Opus 4.7 |
| Edge case escalation | Kissaki | Founder direct |

---

## Availability Classes

| Class | Who Can Interrupt |
|-------|------------------|
| `DEEP_WORK` | WB + FAMILY (non-sleep) + COUNSEL only |
| `OPEN_BLOCK` | Most classes accepted |
| `OUT` | Hard-out; everyone held |
| `SLEEP` | Family emergency only |
| `FAMILY` | WB class only |
| `COUNSEL` | WB class only |

---

## State Storage

All state persists to `~/.claude/state/moneypenny/`:

```
~/.claude/state/moneypenny/
├── availability.json         # Current Founder availability
├── calls/                    # Receipt for every routing decision
│   └── {timestamp}_{uuid}.json
├── threads/                  # MCCI thread store
│   └── {uuid}.json
└── holds/                    # Hold sessions
    └── {uuid}.json
```

---

## Standalone Daemon

```powershell
# Start the MoneyPenny daemon
node dist/moneypenny/server.js

# Custom port
node dist/moneypenny/server.js --port=7890

# Health check
curl http://localhost:7890/healthz

# Tool invocation
curl -X POST http://localhost:7890/tool -d '{"tool":"moneypenny_status","input":{}}'
```

---

## G-Gates Status (B82/BP034)

| Gate | Description | Status |
|------|-------------|--------|
| G1 | Routing gateway live; receipts written | ✅ BUILT |
| G2 | Priority taxonomy; 50-caller test corpus | ✅ BUILT |
| G3 | No-collision stress test (100 simultaneous) | ✅ BUILT |
| G4 | Hold-and-engage; transition packets | ✅ BUILT |
| G5 | MCCI Thread Store; <100ms retrieval | ✅ BUILT |
| G6 | Handoff protocol; zero context loss | ✅ BUILT |
| G7 | 3K compression; ≤3000 tokens | ✅ BUILT |
| G8 | Resurrection; warm-reopen <2sec | ✅ BUILT |
| G9 | Calendar adapters (Outlook + Google) | ✅ BUILT |
| G10 | Auto-scheduler v1 (read-only proposals) | ✅ BUILT |
| G11 | Production daemon; /healthz endpoint | ✅ BUILT |
| G12 | Big Show readiness — see acceptance test | 🔲 FOUNDER RATIFICATION |

---

## Acceptance Test (§10 Big Show Simulation)

Run `node dist/moneypenny/tests/test_big_show.js` for the full 12-step simulation.

---

## Out of Scope (v1)

- ❌ Auto-write to calendar (v2)
- ❌ Outbound call initiation (Founder initiates)
- ❌ Multi-Founder support (v2)
- ❌ Telephony integration / Twilio (v3+)
- ❌ iCloud full CalDAV (v1.5)

---

*Built: BP034 / May 9, 2026 / Knight Sonnet 4.6*
*Canon: LB-STACK-0170, LB-STACK-0167, LB-STACK-0189, LB-STACK-0223, LB-STACK-0220, LB-STACK-0222*
