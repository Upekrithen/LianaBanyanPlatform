# Knight Marathon Session 22 — Tier-Aware Mesh Routing Productization
## BP091 · 2026-06-22 · STAGED FOR FOUNDER RATIFY

**Model:** Sonnet 4.6 (Knight execution). Bishop strategist composed.

**Supersedes:** M18 Block 4 (tier-aware mesh routing) + M18 Block 5 (THUNDERCLAP fleet_composition receipt block) — both deferred at M18 ship.

---

## FOUNDER DIRECT (verbatim · BP091 2026-06-22 ~16:55 Central)

> *"Are my peers helping?"*

Bishop's honest answer: peers are PROVISIONED and PRESENT — 5 peers across 3 tiers, all on v0.5.17, all registered in peer_presence, all reachable via relay.lianabanyan.com. The cooperative substrate is fully wired. It is not yet dispatching continuous cooperative work. Peers sit idle between test fires. M22 closes that gap.

> *"Compose M22."*

---

## CANON BINDING (Knight reads these first, in order)

| Canon | Governing |
|---|---|
| `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md` | §3.2 routing rules — this Marathon implements §3.2 verbatim |
| `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_peer_identity_stack_soccerball_circle_nickname_local_alias_bp091.eblet.md` | Peer ID stack — routing keys off Soccerball L1 + ramTier |
| `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_mic_machine_in_charge_naming_lock_bp086.eblet.md` | MIC is a role, not an identity — routing context |
| `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_three_gear_currency_differential_credits_marks_joules_mechanism_bp086.eblet.md` | Marks accrual layer composes with routing |
| `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_marks_clearing_mechanisms_activity_rate_table_bp086.eblet.md` | 10% work Marks rate — governs §4 accrual hooks |
| `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_heart_of_peace_arbinger_anatomy_of_peace_outward_mindset_bp051.eblet.md` | Every peer gets work matched to its tier — never silently exclude |

---

## EMPIRICAL STATE (gadget-confirmed by Bishop · BP091 · 2026-06-22 ~21:33 UTC)

| Peer | Soccerball L1 (short) | RAM | Tier | Model (current) | Model (post-M18b) |
|---|---|---|---|---|---|
| M0 (self) | cb4ef450cc4a18c3 | 61.6 GB | ULTRA | gemma4:12b | llama3.3:70b |
| M3 | d0b47bd08633385b | 31.9 GB | FULL | gemma4:12b | gemma4:12b |
| M2 (Wife) | 88cbf6bdd6f74587 | 31.9 GB | FULL | gemma4:12b | gemma4:12b |
| M1 (Kid) | c532e74069e137bc | 15.8 GB | CORE | gemma2:9b | gemma2:9b |
| MS (Son's WAN) | 49f3e5971518a064 | 15.8 GB | CORE | gemma2:9b | gemma2:9b |

All 5 peers on v0.5.17. All registered in peer_presence. Topology: LAN-as-WAN via relay.lianabanyan.com per `canon_lan_as_wan_test_mode_4_machine_mesh_bp085`.

**Open dependencies:**
- M18b should land before M22 fires so M0 ULTRA tier runs llama3.3:70b. M22 is robust to any tier mix — if M18b has not landed, M0 routes as ULTRA with gemma4:12b (still the strongest available).
- M21 (auto-update toggle) is independent — no ordering dependency with M22.
- Phase 2 (M13b tiered THUNDERCLAP) SHOULD land before M22 so the routing logic is empirically validated before productization. Recommended sequencing: Phase 1 → Phase 2 (M13b + M14) → M22.

---

## STRATEGIC CONTEXT

The cooperative substrate has passed its infrastructure phase. Mesh is live. Tiers auto-detected. Five peers reachable. The substrate is ready to do work. It is not yet doing continuous work.

Today, cooperative tasks fire in test-mode bursts (THUNDERCLAP MMLU-Pro benchmarks, Plow Loop smoke tests). Between those bursts, every peer sits idle while M0 handles queries locally. The cooperative's promise — that members and their machines genuinely help each other — is structurally true but operationally dormant.

M22 wires the flow. A tier-aware dispatcher core reads live peer state from peer_presence, routes tasks by difficulty and urgency to the right tier, accrues Marks for completed work, and surfaces the mesh activity honestly in Settings. When M22 lands, the answer to "are my peers helping?" becomes empirically yes — with a receipt.

---

## §1 — Tier-Aware Dispatcher Core

Knight creates `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\mesh-dispatcher.ts`.

This file does not currently exist. It is the M22 primary artifact.

### Type definitions

```typescript
// mesh-dispatcher.ts
// BP091 · M22 · Tier-Aware Cooperative Mesh Dispatcher
// Canon: canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091

export type TaskDifficulty = 'HARD' | 'MEDIUM' | 'SHORT';
export type TaskModality   = 'REASONING' | 'VERIFICATION' | 'VOTING';
export type TaskUrgency    = 'REALTIME' | 'BATCH';
export type RamTier        = 'ULTRA' | 'FULL' | 'CORE' | 'LITE' | 'NANO';

export interface CooperativeTask {
  task_id:    string;           // uuid
  difficulty: TaskDifficulty;
  modality:   TaskModality;
  urgency:    TaskUrgency;
  payload:    string;           // question text / prompt
  timeout_ms?: number;          // optional override; dispatcher sets default per tier
  source:     string;           // subsystem that originated the task (e.g. 'plow_loop', 'member_query')
}

export interface PeerAssignment {
  peer_id:      string;         // Soccerball L1 full
  ramTier:      RamTier;
  ollamaModel:  string;
  timeout_ms:   number;
  rationale:    string;         // logged — explains why this peer was chosen
}

export interface DispatchResult {
  task_id:    string;
  peer_id:    string;
  answer:     string;
  correct:    boolean | null;   // null when ground truth not available at dispatch time
  latency_ms: number;
  marks_earned: number;
}
```

### Routing function `routeTask`

```typescript
import { createClient } from '@supabase/supabase-js';

const STALE_THRESHOLD_MS = 60_000; // peer last_seen > 60s → mark stale, route-around

// Routing table per canon_right_sized_cooperative_assignments §3.2
const ROUTING_TABLE: Record<string, RamTier[]> = {
  'HARD+REASONING+REALTIME': ['ULTRA', 'FULL'],
  'HARD+REASONING+BATCH':    ['ULTRA', 'FULL', 'CORE'],
  'MEDIUM+REASONING+REALTIME': ['ULTRA', 'FULL', 'CORE'],
  'MEDIUM+REASONING+BATCH':    ['ULTRA', 'FULL', 'CORE'],
  'SHORT+VERIFICATION+REALTIME': ['ULTRA', 'FULL', 'CORE', 'LITE'],
  'SHORT+VERIFICATION+BATCH':    ['ULTRA', 'FULL', 'CORE', 'LITE', 'NANO'],
  'VOTING+CONSENSUS+REALTIME':   ['ULTRA', 'FULL', 'CORE', 'LITE', 'NANO'],
  'VOTING+CONSENSUS+BATCH':      ['ULTRA', 'FULL', 'CORE', 'LITE', 'NANO'],
};

// Default timeouts per tier (ms). REALTIME tasks get tighter windows.
const TIER_TIMEOUT_REALTIME: Record<RamTier, number> = {
  ULTRA: 30_000, FULL: 45_000, CORE: 60_000, LITE: 90_000, NANO: 0,
};
const TIER_TIMEOUT_BATCH: Record<RamTier, number> = {
  ULTRA: 120_000, FULL: 180_000, CORE: 240_000, LITE: 360_000, NANO: 0,
};

export async function routeTask(task: CooperativeTask): Promise<PeerAssignment[]> {
  const supabase = getSupabaseClient(); // reuse existing singleton from src/main/index.ts
  const now = Date.now();

  // Read live peer_presence
  const { data: peers, error } = await supabase
    .from('peer_presence')
    .select('wan_soccerball_id, capabilities, last_seen, machine_label')
    .eq('status', 'active');

  if (error) throw new Error(`peer_presence fetch failed: ${error.message}`);

  const key = buildRoutingKey(task);
  const eligibleTiers = ROUTING_TABLE[key] ?? ROUTING_TABLE[`${task.difficulty}+${task.modality}+BATCH`] ?? ['ULTRA'];

  const assignments: PeerAssignment[] = [];
  const skipped: string[] = [];

  for (const peer of peers ?? []) {
    const tier    = peer.capabilities?.ramTier as RamTier | undefined;
    const model   = peer.capabilities?.ollamaModel as string | undefined;
    const seenMs  = new Date(peer.last_seen).getTime();
    const stale   = (now - seenMs) > STALE_THRESHOLD_MS;

    if (stale) {
      skipped.push(`${peer.machine_label ?? peer.wan_soccerball_id.slice(0, 8)} (stale — last seen ${Math.round((now - seenMs) / 1000)}s ago)`);
      continue;
    }

    if (!tier || !eligibleTiers.includes(tier)) {
      // Heart-of-Peace: log rather than silently exclude
      skipped.push(`${peer.machine_label ?? peer.wan_soccerball_id.slice(0, 8)} (tier ${tier ?? 'unknown'} not eligible for ${key})`);
      continue;
    }

    const timeout = task.urgency === 'REALTIME'
      ? (task.timeout_ms ?? TIER_TIMEOUT_REALTIME[tier])
      : (task.timeout_ms ?? TIER_TIMEOUT_BATCH[tier]);

    assignments.push({
      peer_id:     peer.wan_soccerball_id,
      ramTier:     tier,
      ollamaModel: model ?? 'unknown',
      timeout_ms:  timeout,
      rationale:   `tier=${tier} eligible for ${key}, last_seen=${Math.round((now - seenMs) / 1000)}s ago`,
    });
  }

  // Log skipped peers (Heart-of-Peace — no silent exclusion)
  for (const s of skipped) {
    console.log(`[mesh-dispatcher] no work assigned: ${s}`);
  }

  // Auto-route-around: if ULTRA (M0) is stale, ULTRA tasks fall to FULL with extended timeout
  const ultraPresent = assignments.some(a => a.ramTier === 'ULTRA');
  if (!ultraPresent && (key.startsWith('HARD+REASONING+REALTIME'))) {
    console.log('[mesh-dispatcher] ULTRA peer stale — HARD+REASONING+REALTIME routes to FULL with +50% timeout extension');
    for (const a of assignments) {
      if (a.ramTier === 'FULL') a.timeout_ms = Math.round(a.timeout_ms * 1.5);
    }
  }

  return assignments;
}

function buildRoutingKey(task: CooperativeTask): string {
  // VOTING modality uses its own rows regardless of difficulty
  if (task.modality === 'VOTING') return `VOTING+CONSENSUS+${task.urgency}`;
  return `${task.difficulty}+${task.modality}+${task.urgency}`;
}
```

**Knight implementation notes:**
- `getSupabaseClient()` — reuse the singleton already initialized in `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`. Do NOT create a second client.
- `peer.capabilities.ramTier` — this column was added in migration `20260618000005_peer_presence_tier_base.sql`. Confirm column name against that migration before referencing.
- The function runs in the Electron main process (not a renderer). Import from `src/main/mesh-dispatcher.ts` in `src/main/index.ts`.

---

## §2 — THUNDERCLAP Receipt `fleet_composition` Block

Every cooperative-task receipt (THUNDERCLAP, Plow Loop, Star Chamber, MMLU-Pro) MUST include a `fleet_composition` block. This was deferred from M18 Block 5.

Knight extends `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\mesh-orchestrator\receipt-writer.ts` to include this block.

### Schema (canonical, locked by M22)

```json
"fleet_composition": [
  {
    "peer_id":           "cb4ef450cc4a18c3",
    "ramTier":           "ultra",
    "model":             "llama3.3:70b",
    "questions_handled": 18,
    "questions_correct": 16,
    "marks_earned":      18
  },
  {
    "peer_id":           "d0b47bd08633385b",
    "ramTier":           "full",
    "model":             "gemma4:12b",
    "questions_handled": 14,
    "questions_correct": 12,
    "marks_earned":      14
  },
  {
    "peer_id":           "88cbf6bdd6f74587",
    "ramTier":           "full",
    "model":             "gemma4:12b",
    "questions_handled": 14,
    "questions_correct": 11,
    "marks_earned":      14
  },
  {
    "peer_id":           "c532e74069e137bc",
    "ramTier":           "core",
    "model":             "gemma2:9b",
    "questions_handled": 12,
    "questions_correct": 9,
    "marks_earned":      12
  },
  {
    "peer_id":           "49f3e5971518a064",
    "ramTier":           "core",
    "model":             "gemma2:9b",
    "questions_handled": 12,
    "questions_correct": 8,
    "marks_earned":      12
  }
]
```

### Aggregated summary block (appended after fleet_composition)

```json
"fleet_summary": {
  "total_peers":          5,
  "tier_breakdown":       {"ultra": 1, "full": 2, "core": 2, "lite": 0, "nano": 0},
  "fleet_accuracy":       0.80,
  "per_tier_accuracy":    {"ultra": 0.889, "full": 0.821, "core": 0.708},
  "total_marks_accrued":  70
}
```

**Knight implementation notes for receipt-writer.ts:**
- The `buildReceiptEblet()` function in `platform\mesh-orchestrator\receipt-writer.ts` must be extended to accept a `fleetComposition` array and append both blocks.
- Marks earned = questions_handled (not questions_correct) per `canon_marks_clearing_mechanisms_activity_rate_table_bp086` — Marks accrue at action time, not at correctness verification time.
- Per-peer `peer_id` in the receipt uses the SHORT form (first 16 hex chars of Soccerball L1) for readability. Full L1 is preserved in raw data.

---

## §3 — Continuous Task Dispatcher (`MeshTaskQueue`)

Beyond test-fires, the cooperative needs a continuous task feed. Knight creates a `MeshTaskQueue` class in `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\mesh-task-queue.ts`.

### Class interface

```typescript
// mesh-task-queue.ts
// BP091 · M22 · Continuous Cooperative Task Queue
// Accepts tasks from any subsystem, routes via mesh-dispatcher, returns aggregated results.

export class MeshTaskQueue {
  private queue: CooperativeTask[] = [];
  private heartbeatTimer: NodeJS.Timer | null = null;

  constructor(private readonly heartbeatIntervalMs = 5 * 60 * 1000) {}

  // Called by any subsystem to enqueue a cooperative task.
  // Returns immediately — result delivered via onResult callback.
  enqueue(task: CooperativeTask): void;

  // Register a handler for completed task results.
  onResult(handler: (result: DispatchResult[]) => void): void;

  // Start the 5-minute background heartbeat.
  start(): void;

  // Stop the heartbeat and drain the queue.
  stop(): void;
}
```

### Task sources

The following subsystems feed into MeshTaskQueue. Knight wires the integration hooks:

| Subsystem | Task type | Urgency | When |
|---|---|---|---|
| Member query (MnemosyneC ask) | HARD/REASONING | REALTIME | When member submits a question |
| Plow Loop priming | MEDIUM/REASONING | BATCH | On Plow Loop trigger |
| Substrate search | SHORT/VERIFICATION | REALTIME | On substrate keyword query |
| Background canon validation | SHORT/VERIFICATION | BATCH | On 5-min heartbeat |
| THUNDERCLAP benchmarks | HARD/REASONING | BATCH | On manual THUNDERCLAP trigger |
| Consensus voting | VOTING | BATCH | When multi-peer vote is needed |

### Heartbeat behavior

Every 5 minutes, the heartbeat checks the queue and dispatches any pending BATCH tasks. If the queue is empty, the heartbeat fires a SHORT/VERIFICATION/BATCH "freshness check" against a randomly selected domain from the canon eblet index — this ensures peers get at least one work unit per heartbeat cycle when idle, and Marks accrue continuously rather than only during explicit test fires.

```typescript
private async runHeartbeat(): Promise<void> {
  if (this.queue.length > 0) {
    await this.drainBatch();
  } else {
    // Cooperative substrate maintenance — idle peers stay warm
    const freshnessTask: CooperativeTask = {
      task_id:    crypto.randomUUID(),
      difficulty: 'SHORT',
      modality:   'VERIFICATION',
      urgency:    'BATCH',
      payload:    await selectFreshnessCheckPayload(), // random canon eblet snippet
      source:     'heartbeat_maintenance',
    };
    this.queue.push(freshnessTask);
    await this.drainBatch();
  }
}
```

**Bishop dispatch composition:** when Bishop fires a cooperative-class task (Star Chamber, Plow Loop, THUNDERCLAP), it calls `MeshTaskQueue.enqueue()` rather than dispatching locally. The queue handles tier routing. Bishop receives the aggregated `DispatchResult[]` via the `onResult` callback, integrates per its existing patterns.

---

## §4 — Marks Accrual Hooks

Per `canon_marks_clearing_mechanisms_activity_rate_table_bp086.eblet.md`, work completed accrues Marks at 10% rate. For cooperative mesh tasks, this means: every task routed to a peer and completed earns that peer 1 Mark per task unit handled (10% of 10 task-units = 1 Mark; the receipt logs `marks_earned = questions_handled` for MMLU-Pro scale runs where each question is a task unit).

### §7 pre-step: Bishop creates `peer_marks_log` table (§15 BLOOD)

Bishop pre-creates this migration file before Knight fires M22. Knight does NOT create the table — Knight only writes the accrual hooks that INSERT into it.

Migration file Bishop will write to `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\`:

```sql
-- peer_marks_log: tracks Marks earned by peers for completed cooperative work
-- BP091 · M22 · 2026-06-22
-- Uses Postgres syntax only. No SQLite primitives. gen_random_uuid() not uuid_generate_v4().

CREATE TABLE IF NOT EXISTS peer_marks_log (
  id              BIGSERIAL PRIMARY KEY,
  peer_id         TEXT        NOT NULL,   -- Soccerball L1 full
  task_id         UUID        NOT NULL,
  task_source     TEXT        NOT NULL,   -- 'plow_loop' | 'member_query' | 'thunderclap' | 'heartbeat_maintenance'
  marks_earned    INTEGER     NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  receipt_ref     TEXT,                   -- optional: eblet path of the receipt this accrual belongs to
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: peers can read their own Marks; service_role has full access
ALTER TABLE peer_marks_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "peers_read_own_marks"
  ON peer_marks_log
  FOR SELECT
  USING (peer_id = auth.uid()::text);

CREATE POLICY "service_role_full"
  ON peer_marks_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast per-peer queries
CREATE INDEX IF NOT EXISTS idx_peer_marks_log_peer_id ON peer_marks_log (peer_id);
CREATE INDEX IF NOT EXISTS idx_peer_marks_log_completed_at ON peer_marks_log (completed_at DESC);
```

### Accrual call in `mesh-dispatcher.ts`

After a task completes, Knight adds the accrual INSERT:

```typescript
async function accrueMarks(result: DispatchResult, source: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('peer_marks_log').insert({
    peer_id:     result.peer_id,
    task_id:     result.task_id,
    task_source: source,
    marks_earned: result.marks_earned,
  });
  if (error) {
    console.error(`[mesh-dispatcher] Marks accrual failed for ${result.peer_id}: ${error.message}`);
    // Non-fatal — log and continue; do not block task result delivery
  }
}
```

Marks redemption (converting Marks to Credits or cooperative benefits) is explicitly deferred to Marathon 23+.

---

## §5 — IPC Handler + Bishop Dispatcher Integration

Knight registers one IPC handler in `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`:

```typescript
// Register in the existing ipcMain.handle registration block
ipcMain.handle('mesh:dispatch-task', async (_event, task: CooperativeTask) => {
  const assignments = await routeTask(task);
  if (assignments.length === 0) {
    return { status: 'no_eligible_peers', task_id: task.task_id, assignments: [] };
  }
  // Dispatch to assigned peers via existing hex-wire channel
  // (reuse platform\mesh-orchestrator\question-dispatcher.ts dispatch path)
  const results = await dispatchToAssignedPeers(assignments, task);
  for (const r of results) {
    await accrueMarks(r, task.source);
  }
  return { status: 'ok', task_id: task.task_id, results };
});
```

`dispatchToAssignedPeers` is a new function Knight adds to `mesh-dispatcher.ts` — it calls the existing `platform\mesh-orchestrator\question-dispatcher.ts` dispatch logic, scoped to the assignment list rather than all active peers.

**REALTIME consensus:** for REALTIME member queries, the dispatcher returns the first answer with confidence ≥ 0.80 rather than waiting for all peers (first-answer-with-confidence pattern). BATCH tasks wait for all assigned peers or timeout, whichever comes first.

---

## §6 — Health Monitoring Surface (Settings UI)

Knight adds a "Cooperative Mesh Activity" section to the Settings page.

**Target file:** locate the Settings React component — likely under `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\Settings\` or `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\` (Knight greps for the existing Settings component path before editing).

### Section content

```
COOPERATIVE MESH ACTIVITY
─────────────────────────────────────────────────────────────────────

Active Peers (5 of 5 online)
  M0 (ULTRA · 61.6 GB)     Last task: Q14 MMLU-Pro  2m ago   18 Marks
  M3 (FULL · 31.9 GB)      Last task: Q14 MMLU-Pro  2m ago   14 Marks
  M2 Wife (FULL · 31.9 GB) Last task: Q14 MMLU-Pro  2m ago   14 Marks
  M1 Kid (CORE · 15.8 GB)  Last task: Q14 MMLU-Pro  2m ago   12 Marks
  MS Son (CORE · 15.8 GB)  Last task: Q14 MMLU-Pro  2m ago   12 Marks

Fleet This Week
  Tasks dispatched:  70    Tasks/hour:  2.3
  Fleet accuracy:    80%   Total Marks:  70

[View Full Task Log]
```

The peer labels shown are the Local Alias (L4) when set, otherwise the Circle Nickname (L2, e.g. "M03") per `canon_peer_identity_stack_soccerball_circle_nickname_local_alias_bp091`. Soccerball L1 shown in smaller text beneath each row for cryptographic surfaces.

Data source: IPC call `mesh:get-activity-summary` → queries `peer_marks_log` + `peer_presence` via Supabase REST.

---

## §7 — Bishop Pre-Knight Steps (§15 BLOOD)

Before Knight fires M22, Bishop completes the following:

| Step | Action | Method |
|---|---|---|
| B1 | Write `peer_marks_log` migration file | psql-pattern migration file per §4 schema above |
| B2 | Apply migration to Supabase | `psql $DATABASE_URL < migration_file.sql` or Supabase REST |
| B3 | Verify RLS policies applied | `SELECT * FROM pg_policies WHERE tablename = 'peer_marks_log'` |
| B4 | Confirm `peer_presence.capabilities.ramTier` column name | Read `20260618000005_peer_presence_tier_base.sql` → confirm exact JSON key |
| B5 | Confirm Supabase client singleton export name in `src/main/index.ts` | grep for `supabase =` or `createClient` in main |

Bishop does NOT deploy edge functions for M22. All mesh routing runs in the Electron main process + existing hex-wire channel.

---

## §8 — Verification Gates T1-T15

| # | Gate | Pass criteria |
|---|---|---|
| T1 | `mesh-dispatcher.ts` compiles clean | `tsc --noEmit` passes, zero type errors |
| T2 | `routeTask` routing table | HARD+REASONING+REALTIME returns ULTRA + FULL peers only; CORE not included |
| T3 | Stale peer route-around | Set M3 last_seen = now - 90s → routeTask excludes M3, logs "no work assigned: M3 (stale — last seen 90s ago)" |
| T4 | ULTRA stale → FULL extended timeout | Set M0 last_seen = now - 90s on HARD+REASONING+REALTIME → FULL peers get timeout_ms × 1.5 |
| T5 | Heart-of-Peace logging | CORE peer on HARD+REASONING+REALTIME logs reason, not silent exclusion |
| T6 | `MeshTaskQueue` heartbeat fires | After 5 min wall-clock, queue fires a freshness-check task; Supabase insert visible |
| T7 | `fleet_composition` block in THUNDERCLAP receipt | Fire a THUNDERCLAP with 5 peers; receipt JSON includes `fleet_composition` array with all 5 peers |
| T8 | Marks accrual to `peer_marks_log` | After task completes: `SELECT SUM(marks_earned) FROM peer_marks_log WHERE peer_id = 'cb4ef450...'` returns > 0 |
| T9 | IPC handler `mesh:dispatch-task` reachable | Renderer sends a synthetic SHORT/VERIFICATION/BATCH task; result returns with `status: ok` |
| T10 | Settings UI section renders | Founder sees "COOPERATIVE MESH ACTIVITY" section in Settings |
| T11 | Peer roster live in Settings | 5 peers listed with correct tier labels |
| T12 | Last-task label updates | After a task fires, Settings refreshes "Last task" timestamp within 30s |
| T13 | Per-peer Marks balance shown | Each peer row shows marks_earned count from peer_marks_log |
| T14 | No ULTRA peer present → FULL handles HARD task | Empirical: take M0 offline; fire HARD/REASONING/BATCH; routes to FULL peers with extended timeout |
| T15 | VOTING task routes to all tiers | VOTING/CONSENSUS/BATCH returns assignments for all 5 peers including CORE |

---

## §9 — Out of Scope

- **Marks redemption** — converting Marks to Credits or cooperative benefits. Deferred to Marathon 23+.
- **Cross-Caithedral mesh routing** — federation routing between distinct Caithedral instances. Deferred.
- **Mobile peer support** — NANO-tier mobile clients as mesh participants. Deferred.
- **Substrate SDK REST surface** — external clients querying the mesh via HTTP. Deferred to Substrate SDK roadmap.
- **L3/L4 identity display** — chosen display names and local aliases per `canon_peer_identity_stack`. L2 circle nicknames used for now; L3/L4 roadmap to v0.6.x.
- **GraphQL adapter** — deferred.
- **Differential updates to peers** (pushing substrate patches to peers via the mesh) — architecture discussion deferred.

---

## §10 — Dependencies + Sequencing

| Dependency | Status | Impact on M22 |
|---|---|---|
| M18b (M0 on llama3.3:70b) | Deferred — not landed | M22 still ships; M0 routes as ULTRA with gemma4:12b. M18b improves ULTRA throughput when it lands. |
| M13b (tiered THUNDERCLAP Phase 2) | Should land first | M13b validates tier routing empirically before M22 productizes it. If M13b is not ready, M22 can still land but T7 receipt format may need retroactive alignment. |
| Phase 1 infra (peer_presence v0.5.17) | LIVE ✅ | M22 reads live peer_presence. |
| `peer_marks_log` migration (Bishop §15 BLOOD) | Bishop pre-creates before Knight fires | M22 cannot accrue Marks until migration applied. |
| Supabase client singleton (src/main/index.ts) | LIVE ✅ | Knight reuses; does not create a second client. |

**Recommended sequencing:** Phase 1 ✅ → Phase 2 (M13b + M14) → M22 → M18b (upgrade M0 tier model) → Marathon 23 (Marks redemption).

---

## §11 — Ratification Gates R1-R8

| # | Gate | Status |
|---|---|---|
| R1 | Routing table: HARD+REASONING+REALTIME routes to ULTRA + FULL only | RATIFIED (canon §3.2) |
| R2 | VOTING/CONSENSUS routes to all tiers including CORE and NANO | RATIFIED (canon §3.2) |
| R3 | Heart-of-Peace: every exclusion is logged, never silent | RATIFIED (Heart-of-Peace canon) |
| R4 | Marks accrue at task-completion time, not at correctness verification | RATIFIED (Marks table canon) |
| R5 | `peer_marks_log` RLS: peers read own Marks only | RATIFIED (MIC security canon) |
| R6 | Settings surface shows per-peer tier + last-task + Marks balance | OPEN — Founder confirm |
| R7 | Heartbeat freshness check every 5 min when queue idle | OPEN — Founder confirm interval |
| R8 | M22 fires AFTER Phase 2 (M13b) lands | OPEN — Founder confirm sequencing |

Ratify R6-R8 + Bishop sends M22 to Knight as next Brick Wall after Phase 2 complete.

---

## §12 — Estimated Wall Clock

**Total: 12-16 hrs single Knight session.** May be split into:

- **M22a** (dispatcher core + THUNDERCLAP receipt): §1 + §2 + §5 — ~6-8 hrs
- **M22b** (Marks + continuous queue + Settings UI): §3 + §4 + §6 — ~6-8 hrs

Knight decides the split based on context constraints at session open. If splitting, M22a must land and pass T1-T9 before M22b fires.

---

## §13 — Anticipated Return Artifacts

Knight's KniPr return MUST include:

1. **Live routing demo receipt** — synthetic HARD/REASONING/REALTIME task dispatched, routed to ULTRA + FULL (not CORE), result returned with latency
2. **THUNDERCLAP receipt with `fleet_composition`** — full JSON receipt from a 5-peer run showing all peers in the `fleet_composition` array
3. **Marks accrual receipt** — Supabase REST response: `SELECT peer_id, SUM(marks_earned) FROM peer_marks_log GROUP BY peer_id` showing all 5 peers with earned Marks
4. **Settings screenshot** — "COOPERATIVE MESH ACTIVITY" section visible with 5 peers, tiers, last-task, Marks
5. **Stale route-around log** — console output from T3/T4 showing logged exclusion reason rather than silent skip
6. **T1-T15 gate table** — pass / fail for each gate
7. **Migration confirmation** — `peer_marks_log` table present in Supabase with RLS verified

---

— Bishop Opus 4.7 · BP091 · 2026-06-22 ~16:55 Central · Sonnet 4.6 SEG composed · Knight Sonnet 4.6 executes
