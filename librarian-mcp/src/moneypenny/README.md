# MoneyPenny — The Big Show Enabler

**Bushel 82, BP034 · May 2026**

> *"Warren Buffett doesn't get interrupted by MacKenzie Scott. And neither remembers having to introduce themselves twice."*

MoneyPenny is the always-on substrate gateway that triages every inbound interaction to the right agent, holds context across routing, and never drops state.

---

## Three Subsystems

### Subsystem 1: Routing Gateway
- **Priority taxonomy**: 8 caller classes (WARREN_BUFFETT → UNKNOWN)
- **No-collision arbitration**: priority queue; no signal drop; no double-booking
- **Hold-and-engage**: Substantive Engager dispatched on hold; transition packet built for Founder
- **Substrate Eblet receipt**: every routing decision written to `~/.claude/state/moneypenny/calls/`

### Subsystem 2: MCCI Context Kernel
- **Thread store**: per-relationship + per-topic persistence (`~/.claude/state/mcci/`)
- **Handoff protocol**: Agent A → Agent B with 3K-compressed context packet
- **3K compression**: LB-STACK-0222 contract; AI (Sonnet 4.6) with deterministic fallback
- **Resurrection**: dormant thread reactivated with warm-reopen packet in <2s

### Subsystem 3: Calendar + Availability
- **6 availability classes**: DEEP_WORK / OPEN_BLOCK / OUT / SLEEP / FAMILY / COUNSEL
- **Calendar adapters**: Outlook (primary), Google (secondary), iCloud (optional)
- **Auto-scheduler v1**: read-only time slot proposals with prep-window enforcement

---

## MCP Tools

| Tool | Purpose | G-Gate |
|------|---------|--------|
| `moneypenny_route` | Route inbound interaction | G1/G2/G3 |
| `moneypenny_hold` | Place on substantive hold | G4 |
| `moneypenny_resurrect` | Resurrect dormant context | G8 |
| `moneypenny_status` | Query current state | G11 |
| `moneypenny_availability_get` | Read Founder availability | G9 |
| `moneypenny_availability_set` | Set Founder availability | G9 |
| `moneypenny_availability_infer` | Infer from calendar | G9 |
| `moneypenny_caller_override` | Override caller class | G2 |
| `moneypenny_schedule` | Propose time slot | G10 |

---

## G-Gate Status

| Gate | Description | Status |
|------|-------------|--------|
| G1 | Routing gateway live; <500ms; receipts written | ✓ |
| G2 | Priority taxonomy; all 8 classes; override mechanism | ✓ |
| G3 | No-collision; 100 simultaneous inbounds; Eblet receipt per decision | ✓ |
| G4 | Hold-and-engage; transition packet; <60s Founder absorption | ✓ |
| G5 | MCCI Thread Store; append-only; retrieval <100ms | ✓ |
| G6 | Handoff protocol; 4-agent chain with zero context loss | ✓ |
| G7 | 3K compression; ≤3000 tokens; loss-bound preserved | ✓ |
| G8 | Resurrection; dormant thread warm-reopen <2s | ✓ |
| G9 | Calendar adapters live; availability inference 1 of 6 classes | ✓ |
| G10 | Auto-scheduler v1; read-only proposals; prep window enforced | ✓ |
| G11 | Production-class; health check; crash-recovery | ✓ |
| G12 | Big Show: 5-inbound simultaneous; resurrection live test | ✓ |

---

## Kissaki Guild Assignment (LB-STACK-0167)

| Role | Rank | AI |
|------|------|----|
| Inbound triage | Apprentice | Sonnet 4.6 |
| Substantive Engager (B-tier) | Journeyman | Sonnet 4.6 + canon |
| Substantive Engager (A-tier) | Master | Opus 4.7 |
| MCCI Compressor | Apprentice | Sonnet 4.6 |
| Resurrection synthesizer | Journeyman | Sonnet 4.6 |
| Founder transition author | Master | Opus 4.7 |
| Edge-case escalator | Kissaki | Founder direct |

---

## State Storage

All state lives in `~/.claude/state/`:

```
~/.claude/state/
├── moneypenny/
│   ├── availability.json          # Current Founder availability
│   ├── availability_history.jsonl # Availability change log
│   ├── active_call.json           # Currently active call
│   ├── hold_queue.jsonl           # Held interactions
│   ├── known_callers.json         # Caller class registry (Founder override)
│   ├── daily_stats.json           # Routing stats by day
│   ├── calls/                     # Substrate Eblet receipts (one JSON per routing)
│   ├── engagements/               # Substantive engagement records
│   └── transition_packets/        # Transition packets for Founder
└── mcci/
    ├── threads.jsonl              # Thread index JSONL (B82-landed sentinel)
    ├── index.json                 # Thread lookup index
    ├── threads/                   # Individual thread JSON files
    └── handoffs/                  # Handoff packets + pending queues
```

---

## Calendar Activation

Set environment variables or create `~/.claude/state/moneypenny/calendar_config.json`:

```json
{
  "outlook": {
    "access_token": "<Microsoft Graph OAuth token>",
    "user_id": "me"
  },
  "google": {
    "access_token": "<Google Calendar OAuth token>",
    "calendar_id": "primary"
  }
}
```

v1: read-only. Auto-write deferred to v2.

---

## Composability

| Partner | Wire | Purpose |
|---------|------|---------|
| Drekaskip | MCCI handoff | B82-landed sentinel detected; backfill from pending |
| Pawn | MCCI handoff | Research-class context loads |
| Knight | MCCI handoff | Code-class context loads |
| Bishop | MCCI handoff | Synthesis-class threads |
| Sweat Scribe | Telemetry | Effort patterns → Sweat-Rule input corpus |

---

*Landed Bushel 82, BP034. FOR THE KEEP!*
