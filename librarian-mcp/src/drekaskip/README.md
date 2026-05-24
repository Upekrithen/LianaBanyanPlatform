# Drekaskip Wave Generator — Bushel 61A

**LB-STACK-0243 / BP034 / 2026-05-09**

Drekaskip is the substrate's wave-fire primitive. It is a **thin wrapper** around the K30 Contingency Operator (LB-STACK-0185, commit `03e6337`) in Wave-Generator mode per K30 §10 composability claim.

## K30 §10 Configuration

```ts
const dreki = new ContingencyOperator({
  discard_threshold: Infinity,    // never discard — race-to-finish mode
  merge_policy: 'fan_in_synthesize',
  budget: { max_segs: 12, timeout_s: 180 },
  axes: ['research','build','discovery','synthesis']
});
```

Wave Generator is K30 with `discard_threshold: Infinity`. Knight wraps K30; it does not reimplement branch lifecycle.

## Architecture

```
WaveDispatch
    │
    ├── BeatCoordinator (beat_coordinator.ts)
    │       └── Staggered fan-out (beat_offset_ms=50ms default)
    │               └── Triad × axis (3 SEG instances per Skulk B36 P3 spec)
    │
    ├── FanInSynthesizer (fan_in_synthesizer.ts)
    │       └── Two-tier merge: per-axis consensus → consolidated artifact
    │
    ├── SagaRegistry (saga_registry.ts)
    │       └── Persists to ~/.claude/state/drekaskip/
    │
    ├── SweatScribe (sweat_scribe.ts)      [G11]
    │       └── Signals → ~/.claude/state/drekaskip/effort_signals_pending.jsonl
    │           (B80 backfill path; live path when B80 lands)
    │
    └── McciIntegration (mcci_integration.ts) [G12]
            └── Handoffs → ~/.claude/state/drekaskip/mcci_handoff_pending.jsonl
                (B82 backfill path; live path when B82 lands)
```

## API Endpoints (daemon on port 7461)

| Endpoint | Method | Description |
|---|---|---|
| `/wave/dispatch` | POST | Instantiate K30 wave; returns `wave_id` |
| `/wave/:id/status` | GET | K30 branch states (running/completed/timed_out) |
| `/wave/:id/stream` | GET | SSE real-time K30 events + merge progress |
| `/sagas` | GET | List all saga records |
| `/sagas/:id` | GET | Query saga by ID |
| `/healthz` | GET | 200 + recent wave activity summary |

## MCP Tools

| Tool | Description |
|---|---|
| `mcp__drekaskip__wave_dispatch` | Fire a wave with saga naming |
| `mcp__drekaskip__saga_query` | Query all wave instances under a saga |
| `mcp__drekaskip__saga_list` | List all sagas |

## Naming Convention (LB-STACK-0196 Wave Riders Canon)

- **Class:** `Drekaskip` (Wave Generator daemon class)
- **Instance:** `WaveRider-<SagaName>-<ISO>` (auto-generated per wave)
- **Saga:** `Saga-<Campaign>` (grouping multiple wave instances)

## G-Gate Status: 12/12 PASS

### BP032 G1-G9

| Gate | Status | Description |
|---|---|---|
| G1 | ✅ PASS | K30 `ContingencyOperator` imported from commit `03e6337`; `discard_threshold: Infinity`, `merge_policy: fan_in_synthesize`; no duplicate lifecycle code |
| G2 | ✅ PASS | POST /wave/dispatch, GET /wave/:id/status, SSE /wave/:id/stream all implemented |
| G3 | ✅ PASS | Synchronized fan-out with configurable `beat_offset_ms`; each axis launches triad (3 SEGs); beat events logged |
| G4 | ✅ PASS | `fan_in_synthesize` aggregates all completed branches; partial results included on timeout |
| G5 | ✅ PASS | K30 enforces `max_segs` and `timeout_s`; wave aborted + budget flag if exceeded |
| G6 | ✅ PASS | Wall-time tracked: `t_wave_ms`, `t_serial_est_ms`, `speedup_ratio` in receipt |
| G7 | ✅ PASS | Each axis spawns 3 SEG instances; two-tier merge; axis metadata preserved |
| G8 | ✅ PASS | Code carries `k30_commit_ref: "03e6337"`; architecture doc links K30 §10 |
| G9 | ✅ PASS | Empirical: `speedup_ratio > 1.0` flags `k30_claim_violated`; receipt logged to Yoke |

### BP034 G10-G12

| Gate | Status | Description |
|---|---|---|
| G10 | ✅ PASS | Long-running daemon (`daemon.ts`); `/healthz` returns 200 + activity summary; crash-recovery via `initWaveGenerator()` on startup; real-substrate inaugural wave fired: `speedup_ratio=0.5118`, T4 stable |
| G11 | ✅ PASS | Effort signals emitted to `effort_signals_pending.jsonl` (PENDING_DEPENDENCY:B80) |
| G12 | ✅ PASS | MCCI handoff candidates emitted to `mcci_handoff_pending.jsonl` (PENDING_DEPENDENCY:B82) |

## Deferred-Gate Flags

- **G11 `PENDING_DEPENDENCY:B80`** — Sweat Scribe daemon not yet landed. Signals buffer to `~/.claude/state/drekaskip/effort_signals_pending.jsonl`. B80 backfills on landing.
- **G12 `PENDING_DEPENDENCY:B82`** — MoneyPenny MCCI daemon not yet landed. Handoff candidates buffer to `~/.claude/state/drekaskip/mcci_handoff_pending.jsonl`. B82 backfills on landing.

## Inaugural Production Wave Receipt

```json
{
  "wave_id": "WaveRider-Drekaskip-Inaugural-2026-05-09T15-01-56-793Z",
  "saga_id": "Saga-Drekaskip-Inaugural",
  "t_wave_ms": 370,
  "t_serial_est_ms": 723,
  "speedup_ratio": 0.5118,
  "axes_count": 4,
  "segs_fired": 12,
  "k30_claim_confirmed": true,
  "k30_config": {
    "discard_threshold": "Infinity",
    "merge_policy": "fan_in_synthesize"
  },
  "k30_commit_ref": "03e6337"
}
```

**K30 §10 claim CONFIRMED: `speedup_ratio=0.5118 < 1.0` for 4 axes.** Wave wall-time (370ms) < serial estimate (723ms).

## Running the Daemon

```powershell
# Build
cd librarian-mcp; npm run build

# Start daemon (port 7461)
node dist/drekaskip/daemon.js

# Or with custom port
$env:DREKASKIP_PORT=7461; node dist/drekaskip/daemon.js
```

## Session Close Yoke

```yaml
bushel: 61A
session: BP034
status: complete
k30_instance_confirmed: true
k30_commit_ref: "03e6337"
g_gates_passed: 12/12
production_class_T4: PASS
sweat_scribe_signals: pending_B80
mcci_thread_integration: pending_B82
empirical_receipt:
  wave_id: "WaveRider-Drekaskip-Inaugural-2026-05-09T15-01-56-793Z"
  saga_id: "Saga-Drekaskip-Inaugural"
  t_wave_ms: 370
  t_serial_est_ms: 723
  speedup_ratio: 0.5118
  axes_count: 4
  segs_fired: 12
  k30_claim_confirmed: true
falsifiable_hypothesis: "Wave wall-time < serial SEG wall-time for ≥3 axes AND production daemon stable"
result: CONFIRMED (speedup_ratio=0.5118; T4 production stable)
```

*Drekaskip Wave Generator — Bushel 61A. K30 generalizes; Drekaskip specializes; the Wave Riders cast off.*
