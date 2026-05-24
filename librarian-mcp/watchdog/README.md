# Watchdog Knight — MCP Health Daemon

**BP034 | LB-STACK-0165 Watchdog Cooperative Repair Loop**

The Watchdog Knight is the daemon that watches the daemons. It monitors all MCP servers and substrate-discipline services, emits health reports, coordinates with Coroner Scribe on failures, and surfaces critical alerts to the Founder via MoneyPenny.

> *"Help each other help ourselves"* — Golden Key, at the substrate-infrastructure level.

---

## Architecture

```
WATCHDOG KNIGHT DAEMON
│  Polls every 60s (configurable)
▼
HEALTH CHECK SUBJECTS (9 subjects)
  • librarian-mcp         — pheromone trail + overview.json freshness
  • moneypenny            — HTTP :7890/healthz
  • drekaskip             — HTTP :7461/healthz
  • hearth                — HTTP :11434/api/tags (Ollama)
  • sweat-scribe          — ~/.claude/state/sweat_scribe/ mtime
  • tears-scribe          — ~/.claude/state/tears_scribe/ mtime
  • forager-scribe        — ~/.claude/state/forager_scribe/ mtime
  • substrate-api         — HTTP :11480/healthz
  • knight-bishop-bridge  — BISHOP_DROPZONE presence + freshness
▼
HEALTH STATE STORE
  ~/.claude/state/watchdog/state.json      — current snapshot
  ~/.claude/state/watchdog/history.jsonl   — append-only event log
  ~/.claude/state/watchdog/heartbeat.txt   — G6 self-monitoring
▼
ALERTING + COORDINATION
  • Coroner Scribe        — on subject down (coroner_queue.jsonl)
  • Hall Monitor          — on 3+ simultaneous downs (hall_monitor_advisories.jsonl)
  • MoneyPenny            — on critical subject down >5min (moneypenny_alerts.jsonl)
```

---

## Running

```powershell
# Start daemon (polls every 60s, HTTP status on :7777)
node dist/watchdog/daemon.js

# Custom cadence
$env:WATCHDOG_POLL_MS = "30000"; node dist/watchdog/daemon.js

# Stop gracefully
# Send SIGTERM or Ctrl-C
```

---

## MCP Tools (G5 gate)

| Tool | Description |
|------|-------------|
| `mcp__watchdog__status` | Current health state for all subjects |
| `mcp__watchdog__history` | Event history (filter by subject, event_type, hours) |
| `mcp__watchdog__force_check` | Immediate out-of-cycle health check |

---

## Health Status Schema

```typescript
interface HealthCheckResult {
  subject: string;
  status: 'ok' | 'degraded' | 'down' | 'unknown';
  latency_ms: number;
  metadata: {
    last_activity?: ISO8601;
    error?: string;
    version?: string;
    details?: Record<string, unknown>;
  };
  checked_at: ISO8601;
}
```

**Thresholds:**
- `ok`: within expected latency (fast-class: <500ms, slow-class: <5000ms)
- `degraded`: slow response or stale state
- `down`: no response within 30s, or file state critically stale
- `unknown`: initial state (not yet probed)

---

## Alerting Rules

| Trigger | Action |
|---------|--------|
| Subject flips ok/degraded → down | Coroner Scribe post-mortem dispatch |
| 3+ subjects simultaneously down | Hall Monitor advisory dispatch |
| Critical subject down >5 min | MoneyPenny → Founder alert |
| down → ok (auto-recovery) | Recovery receipt logged |
| Watchdog stuck (no heartbeat >5 polls) | Self-restart attempt (exit code 2) |

---

## G-Gates Status

| Gate | Description | Status |
|------|-------------|--------|
| G1 | Daemon runs as long-running process | ✓ `daemon.ts` with SIGTERM/SIGINT |
| G2 | All 9 target subjects probed | ✓ `health_checks/index.ts` |
| G3 | State persistence (state.json + history.jsonl + heartbeat.txt) | ✓ `state_store.ts` |
| G4 | Alerting paths (Coroner + MoneyPenny + Hall Monitor) | ✓ `alerting/` |
| G5 | MCP tools exposed | ✓ `mcp_tools/` + server.ts wiring |
| G6 | Self-monitoring (heartbeat + stuck detection) | ✓ daemon.ts §G6 |
| G7 | R-PRODUCTION-FIRST T4 acceptance | 24h soak on production substrate |
| G8 | End-to-end composability verified | Manual end-to-end test |

---

## File Layout

```
librarian-mcp/src/watchdog/
├── types.ts                           # Shared types + SUBJECT_CONFIGS
├── state_store.ts                     # Health state persistence (G3)
├── daemon.ts                          # Long-running poll loop (G1, G6)
├── health_checks/
│   ├── index.ts                       # ALL_CHECKS registry + runAllChecks()
│   ├── http_probe.ts                  # Shared HTTP round-trip utility
│   ├── librarian_mcp.ts               # Pheromone + overview.json freshness
│   ├── moneypenny.ts                  # :7890/healthz
│   ├── drekaskip.ts                   # :7461/healthz
│   ├── hearth.ts                      # :11434/api/tags (Ollama)
│   ├── sweat_scribe.ts                # File mtime (B80 graceful degradation)
│   ├── tears_scribe.ts                # File mtime (B81 graceful degradation)
│   ├── forager_scribe.ts              # File mtime
│   ├── substrate_api.ts               # :11480/healthz (AMPLIFY daemon)
│   └── knight_bishop_bridge.ts        # BISHOP_DROPZONE presence + freshness
├── alerting/
│   ├── coroner_dispatch.ts            # Subject-down → coroner_queue.jsonl
│   ├── moneypenny_dispatch.ts         # Critical down >5min → moneypenny_alerts.jsonl
│   └── hall_monitor_dispatch.ts       # 3+ down → hall_monitor_advisories.jsonl
└── mcp_tools/
    ├── watchdog_status.ts             # mcp__watchdog__status
    ├── watchdog_history.ts            # mcp__watchdog__history
    └── watchdog_force_check.ts        # mcp__watchdog__force_check
```

---

## Canon Anchors

- **LB-STACK-0165** — Watchdog Cooperative Repair Loop
- **LB-STACK-0223** — Hall Monitor (advisory class)
- **LB-STACK-0171** — Coroner Scribe (post-mortem on watchdog-detected failures)
- **LB-STACK-0243** — R-PRODUCTION-FIRST

## Trinity Rules Applied

- **R-MECHANISM-VERIFY**: every health check verified empirically via real round-trip (HTTP or file mtime) — no asserted 'ok' without evidence
- **R-PRODUCTION-FIRST** (LB-STACK-0243): G7 24-hour soak test on production substrate required for full acceptance
- **R-EXTRACT-AS-MD**: state/history/heartbeat rendered as `.json`/`.jsonl`/`.txt`
- **R-SEG-DISCIPLINE-INHERIT**: BP034 Trinity Rules header inherits to all health-check sub-SEGs

---

*Built BP034 — Knight (Cursor / Sonnet 4.6) — FOR THE KEEP!*
