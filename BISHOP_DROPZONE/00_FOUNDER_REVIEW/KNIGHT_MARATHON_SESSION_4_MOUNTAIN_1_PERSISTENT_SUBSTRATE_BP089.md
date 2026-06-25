# KNIGHT MARATHON SESSION 4 · MOUNTAIN 1 · PERSISTENT SUBSTRATE STATE
# BP089 · Sonnet 4.6 · 2026-06-20 · use segs

---

## §0 BLACK MAMBA WAKE HEADER

```
EVENT CLASS : BLACK MAMBA
SESSION     : KNIGHT MARATHON 4
MOUNTAIN    : 1 · PERSISTENT SUBSTRATE STATE
BISHOP      : BP089
MODEL       : Sonnet 4.6
DATE        : 2026-06-20
PARALLEL    : M3 · M5 · M6 (concurrent)
BRANCH      : knight-marathon-4-mountain-1-persistent-substrate
SCOPE LOCK  : src/substrate/ + src/main/dr_m_orchestrator/
BUILD GATE  : WAIT for Bishop greenlight · emit build_slot_request pearl
WAKE STATUS : ACTIVE
```

BLACK MAMBA is the unified empirical-proof event class. Every receipt in this session
is a BLACK MAMBA event. No receipt · no canon. No canon · no merge.

---

## §1 GADGET-FIRST PREAMBLE (§17 BLOOD)

Statutes §17 BLOOD: Knight MUST gadget before any implementation claim.

Gadget checklist for Mountain 1:

- [ ] substrate_reader.ts · module file created · exports SubstrateContextBundle type
- [ ] brain_swap.ts · module file created · exports CCI interface + Council types + 2 adapter shims
- [ ] hex_mcode.ts · module file created · exports encode/decode functions
- [ ] dispatch_loop.ts · module file created · accepts single-brain OR council dispatch
- [ ] minor_star_chamber.ts · module file created · exports minorCouncil + scoreConvergence + escalateToFlagship
- [ ] court_packages.ts · module file created · exports 6 default Court Packages + lazy-load logic
- [ ] SQL schema files landed in BISHOP_DROPZONE (4 tables)
- [ ] Smoke test receipts written to Asteroid-ProofVault (SMOKE_TEST.md + MINOR_COUNCIL_SMOKE_TEST.md)
- [ ] Pearl `mountain_1_smoke_complete` emitted
- [ ] Pearl `mountain_1_complete` emitted

Knight does NOT claim any item complete until the receipt exists on disk and Bishop
has verified the file. Gadget-first is not optional. §17 is BLOOD.

---

## §2 STATUTES BINDING

Statutes binding this session:

- §3 · Truth-Always: Knight states what IS operational vs what is ROADMAP.
  Mountain 1 wires Brain-Swap as operational scaffolding with 2 shims.
  Minor Star Chamber ships as core dispatch path (not a bolt-on).
  Full Brain Registry UI is v0.7.x ROADMAP · NOT this mountain.

- §14 · Reminder Scribe cadence: Knight emits dispatch receipts per tick.

- §15 · Bishop applies SQL: Knight ships .sql files to BISHOP_DROPZONE.
  Knight does NOT run migrations directly. Bishop greenlight required.

- §16 · Wrasse Injector supervises: Wrasse monitors scribe cadence +
  Comptroller dispatch + Reins Registry coherence.

- §17 · Gadget-first: see §1 above. BLOOD.

Canonical eblets binding Mountain 1:

- canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085
- canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085
- canon_persistent_active_memory_crown_jewel_bp085
- canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085
- canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085
- canon_mnemosynec_assigns_reins_per_category_bp085
- canon_star_chamber_multi_agent_consensus_verification_product_bp086
- canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089
- canon_bishop_eat_our_own_cooking_substrate_first_dispatch_route_by_task_fit_bp089

---

## §3 PARALLEL EXECUTION CONSTRAINT

### Branch

```
git checkout -b knight-marathon-4-mountain-1-persistent-substrate
```

Knight commits ONLY to this branch. No commits to main. No commits to M3/M5/M6 branches.

### Scope Isolation

ALLOWED paths:
- `src/substrate/` · existing substrate modules (read + extend only)
- `src/main/dr_m_orchestrator/` · new directory · all 6 new modules live here

FORBIDDEN paths without Bishop written approval:
- `src/main/index.ts` · IPC registrations · pure additions only if needed
- `src/renderer/` · no UI changes this mountain
- `src/preload/` · no preload changes this mountain
- Any existing module outside the two allowed paths

IPC addition rule: if a new IPC channel is strictly required (dispatch_loop needs
to surface to renderer in future), Knight adds the channel declaration as a
PURE ADDITION with a `// MOUNTAIN_1_ADDITION` comment. No modifications to
existing IPC handlers.

### Build Queue

Knight does NOT trigger build or deploy steps independently. When Wave I modules
are complete and passing local tsc check, Knight emits pearl:

```json
{
  "pearl_type": "build_slot_request",
  "branch": "knight-marathon-4-mountain-1-persistent-substrate",
  "mountain": 1,
  "modules_complete": [
    "substrate_reader",
    "brain_swap",
    "hex_mcode",
    "dispatch_loop",
    "minor_star_chamber",
    "court_packages"
  ],
  "awaiting": "Bishop greenlight"
}
```

Bishop merges mountains in order: M3 - M4 - M5 - M6. Knight does not push to main.

### Court Package Inheritance (M5 + M6)

M5 (Reminder Scribes) and M6 (Librarian Corps) inherit the Court Package library
from M4 once M4 is merged. Both mountains consume `enforcement_council` and
`librarian_council` packages respectively. Knight documents this dependency in the
M4 pearl so Bishop can sequence M5/M6 gates accordingly.

---

## §4 EMPIRICAL STATE (POST-M3 CLOSURE ASSUMED)

State as of Mountain 1 wake (Bishop confirms actuals before Wave II):

| Item | Assumed State | Bishop Confirms |
|------|--------------|-----------------|
| Trial 02b receipt | SEALED | [ ] |
| v0.5.15 cleanups | LANDED | [ ] |
| Relay auth wired | LIVE | [ ] |
| relay.lianabanyan.com | UP | [ ] |
| ip_ledger table | PRESENT | [ ] |
| pearl_share table | PRESENT | [ ] |
| Pheromone table | PRESENT | [ ] |
| Eblet storage path | CONFIRMED | [ ] |

Knight proceeds with Wave I under the assumption M3 landed cleanly. If Bishop
signals M3 partial, Knight pauses Wave I and awaits M3 closure signal.

Truth-Always (§3): Brain-Swap is NOT operational in v0.5.7. Mountain 1 makes it
operational by wiring the scaffolding. HEX-MCODE is currently a SPEC (PROV_22 CG35).
Mountain 1 implements the encode/decode layer for the first time. Minor Star Chamber
(I-E) is NOT operational in v0.5.7. Mountain 1 wires it as the DEFAULT dispatch path
(not a bolt-on, not a separate Mountain). Court Packages (I-F) lazy-load on first
reference from this Mountain forward.

Canonical refs for Minor Council arc:
- canon_star_chamber_multi_agent_consensus_verification_product_bp086 · parent paid flagship version
- canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089 · this Mountain wires it
- canon_bishop_eat_our_own_cooking_substrate_first_dispatch_route_by_task_fit_bp089

---

## §5 WAVE I · UNGATED · SEG FAN-OUT

Wave I is ungated. All six modules ship in parallel (SEG fan-out pattern).
Each sub-task is a SEG. Knight tracks each SEG independently.

The Minor Star Chamber (I-E) and Court Package Library (I-F) are INHERENT to
Dr. M's core dispatch architecture. They are NOT a separate Mountain and NOT a
bolt-on. They compose directly with substrate_reader (I-A) + brain_swap (I-B) +
dispatch_loop (I-D) from the start.

Default dispatch path: Dr. M routes every task through the Minor Council first.
Single-brain dispatch is a special case reserved for speed-critical or known-low-variance tasks.

---

### I-A · PERSISTENT SUBSTRATE READER

**Module:** `src/main/dr_m_orchestrator/substrate_reader.ts`

**Purpose:** Dr. M reads her own substrate on every dispatch tick. Returns a
canonical context bundle that the reasoning brain (or Council) consumes before
any response. The bundle is passed verbatim to minorCouncil() priming in I-E.

**Queries (on each tick):**
1. `ip_ledger` · last 50 peer presence records · sorted by last_seen DESC
2. `pearl_share` · last 20 pearls · sorted by emitted_at DESC
3. Eblet index · high-pheromone eblets · top 10 by salience score
4. Pheromone table · active signals · threshold > 0.5 salience

**Exported interface:**

```typescript
export interface SubstrateContextBundle {
  timestamp: string;                  // ISO-8601
  peer_count: number;
  recent_peers: PeerRecord[];         // from ip_ledger
  recent_pearls: PearlRecord[];       // from pearl_share
  hot_eblets: EbletIndexEntry[];      // top 10 by pheromone salience
  active_pheromones: PheromoneSignal[];
  context_size_bytes: number;         // for receipt logging
  query_latency_ms: number;           // for receipt logging
}

export interface SubstrateReader {
  read(): Promise<SubstrateContextBundle>;
  readSince(timestamp: string): Promise<SubstrateContextBundle>;
}

export function createSubstrateReader(db: Database): SubstrateReader;
```

**Error handling:** if any substrate query fails, SubstrateReader logs the failure
to the dr_m_dispatch_log table (see §7) with status='substrate_read_error' and
returns a degraded bundle with the successful queries only. Never throws. Never
blocks dispatch on substrate failure. A degraded bundle still primes the Council
(I-E) - the Council proceeds with partial context rather than blocking.

**§3 Truth-Always note:** substrate queries run against the local SQLite instance.
In v0.5.x there is no distributed substrate read. Remote peer substrate is roadmap.

---

### I-B · BRAIN-SWAP OPERATIONAL WIRE-UP (COUNCIL-AWARE)

**Module:** `src/main/dr_m_orchestrator/brain_swap.ts`

**Canon:** canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085

**Purpose:** Dr. M's own reasoning engine is hot-swappable per-task. Mountain 1
makes this operational with 2 shims: Claude adapter + local Gemma adapter.

REVISED from original spec: brain_swap now selects a COUNCIL (N greater than 1 instances)
as the default path, not a single brain. Single-brain selection is the special case.
The "swap" is a Council swap: Council members can be same-model parallel instances
OR mixed-model (e.g. for adjudication when a single model class diverges). Court
Packages (I-F) define which models compose each Council.

**CCI (Cognitive Core Interface) contract:**

```typescript
export interface CCI {
  brain_id: string;                   // e.g. "claude-sonnet-4-6" | "gemma-3-local"
  vendor: "anthropic" | "google" | "openai" | "local";
  min_context_window: number;         // tokens
  supports_tools: boolean;
  cost_per_1k_tokens: number;         // 0 for local

  // Core contract methods
  reason(
    prompt: string,
    context: SubstrateContextBundle,
    tools?: ToolDefinition[]
  ): Promise<CCIResponse>;

  ping(): Promise<{ latency_ms: number; available: boolean }>;
}

export interface CCIResponse {
  content: string;
  brain_id: string;
  tokens_used: number;
  latency_ms: number;
  tool_calls?: ToolCall[];
}

// Council selection result (replaces single-brain select)
export interface CouncilSelection {
  members: CCI[];                     // N brains in this council
  council_package_name: string;       // e.g. "reader_council"
  variance_threshold: number;         // from Court Package
  escalation_policy: EscalationPolicy;
}
```

**Shim 1 · Claude adapter (claude-sonnet-4-6):**

```typescript
export class ClaudeBrainAdapter implements CCI {
  brain_id = "claude-sonnet-4-6";
  vendor = "anthropic" as const;
  min_context_window = 200000;
  supports_tools = true;
  cost_per_1k_tokens = 0.003;        // approximate · Comptroller tracks actuals

  // Uses @anthropic-ai/sdk · injects SubstrateContextBundle as system context
  // Substrate context prepended to system prompt verbatim
  // Tool-call results returned in CCIResponse.tool_calls
}
```

**Shim 2 · Local Gemma adapter (gemma-3-local):**

```typescript
export class GemmaBrainAdapter implements CCI {
  brain_id = "gemma-3-local";
  vendor = "local" as const;
  min_context_window = 8192;
  supports_tools = false;            // v1 · tool support roadmap
  cost_per_1k_tokens = 0;

  // Uses Ollama REST endpoint (localhost:11434)
  // SubstrateContextBundle injected as system message
  // No tool calls · text-only response
}
```

**Council selection (replaces single-brain selectBrain):**

```typescript
export type TaskCategory =
  | "substrate_query"       // default council: reader_council
  | "reasoning_hard"        // default council: strategic_council
  | "peer_dispatch"         // default council: composer_council
  | "routine_summarize"     // default council: reader_council
  | "tool_required"         // always: adjudicator_council (flagship only · supports_tools required)
  | "scribe_enforcement"    // M5: enforcement_council
  | "librarian_query";      // M6: librarian_council

// DEFAULT path: selectCouncil() picks a Court Package by task category
export function selectCouncil(
  category: TaskCategory,
  available_packages: CourtPackage[]
): CouncilSelection;

// SPECIAL CASE: single brain retained for speed-critical / known-low-variance tasks
export function selectBrain(
  category: TaskCategory,
  available_brains: CCI[]
): CCI;
```

Selection follows "Consult, don't Rent" canon: free local first; flagship for
hard targeted work or tool-required tasks. Both council and single-brain selection
logged to brain_swap_audit table (see §7). Council selections also logged to
council_dispatch_log (§7).

**Hot-swap protocol (per canon, Council-aware):**
1. Dispatch tick arrives
2. selectCouncil() picks Court Package for task category (default path)
3. Court Package lazy-loaded via loadCouncilPackage() if first reference (I-F)
4. SubstrateContextBundle injected into each Council member's reason() call in parallel
5. scoreConvergence() evaluates variance across member answers (I-E)
6. If variance <= threshold: return aggregate consensus answer
7. If variance > threshold: escalateToFlagship() fires to claude-sonnet-4-6 (I-E)
8. Full council result logged to council_dispatch_log
9. If single-brain override: original selectBrain() path used; logged with council_package_name=null

**§3 Truth-Always note:** Brain Registry UI is v0.7.x ROADMAP. Mountain 1 ships
the CCI interface + 2 shims + selectCouncil() + selectBrain(). Full registry with
per-vendor adapter metadata is a later mountain.

---

### I-C · HEX-MCODE WIRE FORMAT

**Module:** `src/main/dr_m_orchestrator/hex_mcode.ts`

**Canon:** canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085

**Purpose:** Wire format Dr. M uses to dispatch tasks to/from peer SEGs and
to/from Council members in the Minor Star Chamber. Compact hex-encoded frames.
Smaller payload · faster parse · vendor-resilient vs markdown. First operational
implementation (previously spec only in PROV_22 CG35).

**Frame structure:**

```
[HEADER_4B][TYPE_1B][PAYLOAD_LEN_4B][PAYLOAD_NB][CRC_4B]

HEADER_4B   : 0x4C42 4D43 ("LBMC" = Liana Banyan Machine Code)
TYPE_1B     : 0x01 dispatch_request
              0x02 dispatch_response
              0x03 substrate_bundle
              0x04 pearl_emit
              0x05 brain_swap_signal
              0x06 council_request       (NEW · fan-out to N Council members)
              0x07 council_response      (NEW · per-member response in fan-out)
              0x08 council_escalation    (NEW · variance exceeded · flagship routing)
              0xFF error_frame
PAYLOAD_LEN : uint32 big-endian · byte count of PAYLOAD
PAYLOAD     : JSON UTF-8 · hex-encoded (2 hex chars per byte)
CRC_4B      : CRC-32 of HEADER+TYPE+PAYLOAD_LEN+PAYLOAD (big-endian)
```

**Exported functions:**

```typescript
export interface HexFrame {
  type: FrameType;
  payload: Record<string, unknown>;
  crc_valid: boolean;
}

export type FrameType =
  | "dispatch_request"
  | "dispatch_response"
  | "substrate_bundle"
  | "pearl_emit"
  | "brain_swap_signal"
  | "council_request"
  | "council_response"
  | "council_escalation"
  | "error_frame";

export function encode(type: FrameType, payload: Record<string, unknown>): string;
// Returns hex string · full frame · ready for wire

export function decode(hex: string): HexFrame;
// Parses hex string · validates CRC · returns HexFrame
// Sets crc_valid=false and type="error_frame" on CRC mismatch (never throws)

export function validate(frame: HexFrame): boolean;
// True if crc_valid and type !== "error_frame"
```

**§3 Truth-Always note:** SSPS (BP055) underlying encoding composition is
THEORIES_OPEN per canon. Mountain 1 implements the frame spec above without
assuming SSPS composition until Founder confirms. Soccerball DAG hex-coordinate
address composition is also THEORIES_OPEN. Mountain 1 ships the base frame layer.
Address layer is a later mountain when Founder confirms.

---

### I-D · DISPATCH LOOP WIRE-UP (COUNCIL-DEFAULT)

**Module:** `src/main/dr_m_orchestrator/dispatch_loop.ts`

**Purpose:** Ties substrate_reader + brain_swap + hex_mcode + minor_star_chamber
into the existing peer dispatch path. Dr. M's orchestration tick runs here.

DEFAULT dispatch path is Minor Council via selectCouncil(). Single-brain dispatch
is a special case flag. Smart Router (selectCouncil default) chooses the Court
Package by task category unless caller explicitly overrides.

**REVISED dispatch modes:**

```typescript
export type DispatchMode =
  | { council: CouncilPackageName }       // DEFAULT · routes through minor_star_chamber
  | { single_brain: ModelId }             // SPECIAL CASE · speed-critical or known-low-variance
  | { auto: true };                        // Smart Router chooses council by task category
```

**Tick sequence (default council path):**

```
1.  SubstrateReader.read()                    --> SubstrateContextBundle
2.  loadCouncilPackage(packageName)            --> CourtPackage (lazy, cached after first load)
3.  selectCouncil(category, packages)          --> CouncilSelection
4.  encode("council_request", ...)             --> hex frames (one per member)
5.  minorCouncil(question, councilType, opts)  --> fan-out to N local-model instances in parallel
    (each member primed with SubstrateContextBundle)
6.  scoreConvergence(answers)                  --> { variance, aggregate }
7a. IF variance <= threshold: return aggregate · log to council_dispatch_log
7b. IF variance > threshold: escalateToFlagship(question, councilAnswers) --> adjudication
    encode("council_escalation", ...) --> hex frame for flagship routing
8.  DispatchResult assembled (includes variance + escalated flag)
9.  log to dr_m_dispatch_log + council_dispatch_log
10. return DispatchResult to caller
```

**Tick sequence (single-brain special case):**

```
1. SubstrateReader.read()          --> SubstrateContextBundle
2. selectBrain(category)           --> CCI (active brain)
3. brain.reason(prompt, context)   --> CCIResponse
4. encode("dispatch_request", ...) --> hex string
5. [send to peer via existing relay path]
6. [receive peer hex response]
7. decode(hex_response)            --> HexFrame
8. log to dr_m_dispatch_log (council_package_name=null)
9. return response to caller
```

**Exported interface:**

```typescript
export interface DispatchRequest {
  task_id: string;                   // uuid
  category: TaskCategory;
  prompt: string;
  target_peer?: string;              // peer id from ip_ledger (null = local)
  substrate_inject: boolean;         // default true
  mode?: DispatchMode;               // default: { auto: true } (Smart Router)
}

export interface DispatchResult {
  task_id: string;
  response: string;
  brain_used: string;                // brain_id (single) OR council_package_name (council)
  dispatch_mode: "council" | "single_brain";
  council_variance?: number;         // present when dispatch_mode="council"
  council_escalated?: boolean;       // true if flagship adjudication fired
  council_member_count?: number;     // N members in the council
  substrate_context_bytes: number;
  latency_ms: number;
  hex_frame_size_bytes: number;
  peer_id?: string;
}

export interface DispatchLoop {
  dispatch(req: DispatchRequest): Promise<DispatchResult>;
  shutdown(): Promise<void>;
}

export function createDispatchLoop(
  reader: SubstrateReader,
  brains: CCI[],
  relay: RelayClient,                // existing relay client from src/substrate/
  packages: CourtPackageLibrary      // from court_packages.ts
): DispatchLoop;
```

**Logging:** Every dispatch writes one row to dr_m_dispatch_log (§7 schema).
Every brain or council selection writes one row to brain_swap_audit (§7 schema).
Every council dispatch writes one row to council_dispatch_log (§7 schema).

**IPC addition (pure addition only):**
If renderer needs to trigger a dispatch, Knight adds ONE new IPC channel:
`dr-m-dispatch` · handler calls `dispatchLoop.dispatch(req)` · returns DispatchResult.
Tagged `// MOUNTAIN_1_ADDITION` per §3 constraint.

---

### I-E · MINOR STAR CHAMBER CORE DISPATCHER

**Module:** `src/main/dr_m_orchestrator/minor_star_chamber.ts`

**Canon refs:**
- canon_star_chamber_multi_agent_consensus_verification_product_bp086 · parent paid flagship version
- canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089

**Purpose:** INHERENT to Dr. M's core dispatch architecture. Not a bolt-on. Not a
separate Mountain. This module fans a task to N local-model instances in parallel
(default 3-5 per Court Package), primes each with SubstrateContextBundle from
substrate_reader, scores convergence, and escalates to flagship Sonnet 4.6 ONLY
when variance exceeds the threshold defined in the Court Package.

Escalation threshold per canon: 15% default for composer_council. Varies by Package
(see I-F). Free local models bear the full load until divergence is detected.

use segs · Sonnet 4.6

**Method signatures (Knight implements):**

```typescript
export interface MinorCouncilOptions {
  substrate_context: SubstrateContextBundle; // injected from substrate_reader
  timeout_ms?: number;                        // per-member timeout · default 90000
  min_members?: number;                       // minimum required to proceed · default 2
}

export interface MinorCouncilResult {
  result: string;                   // aggregate consensus answer
  variance: number;                 // 0.0-1.0 · H=Variance/100 per canon
  escalated: boolean;               // true if flagship adjudication fired
  member_answers: MemberAnswer[];   // per-instance raw answers (for receipt logging)
  council_package: string;          // e.g. "composer_council"
  members_fired: number;            // actual N that responded
  latency_ms: number;
}

export interface MemberAnswer {
  brain_id: string;
  answer: string;
  tokens_used: number;
  latency_ms: number;
}

export interface ConvergenceScore {
  variance: number;                 // 0.0-1.0
  aggregate: string;                // consensus answer text
  method: "majority" | "overlap" | "semantic"; // scoring method used
}

export interface AdjudicationResult {
  answer: string;
  brain_id: string;                 // always claude-sonnet-4-6 for flagship adjudication
  council_answers_provided: number; // how many member answers were passed to flagship
  latency_ms: number;
  tokens_used: number;
}

// PRIMARY entry point - routes through Court Package · fans out · scores · escalates if needed
export async function minorCouncil(
  question: string,
  councilType: CouncilPackageName,
  options: MinorCouncilOptions
): Promise<MinorCouncilResult>;

// Lazy-loads a Court Package on first reference · cached in memory after first load
export async function loadCouncilPackage(
  packageName: CouncilPackageName
): Promise<CourtPackage>;

// Scores convergence across N member answers
// Returns variance 0.0-1.0 and aggregate consensus text
export function scoreConvergence(
  answers: MemberAnswer[]
): ConvergenceScore;

// Fires ONLY when variance > package threshold
// Passes all member answers to flagship as Council context
// Flagship adjudicates · returns definitive answer
export async function escalateToFlagship(
  question: string,
  councilAnswers: MemberAnswer[]
): Promise<AdjudicationResult>;
```

**Fan-out execution pattern:**

```typescript
// All N members fire in parallel with Promise.all
// Each member receives the same question + full SubstrateContextBundle
const memberResults = await Promise.all(
  package.members.map(brain =>
    brain.reason(question, options.substrate_context)
  )
);

const convergence = scoreConvergence(memberResults);

if (convergence.variance > package.variance_threshold) {
  const adjudication = await escalateToFlagship(question, memberResults);
  return { result: adjudication.answer, variance: convergence.variance, escalated: true, ... };
}

return { result: convergence.aggregate, variance: convergence.variance, escalated: false, ... };
```

**§3 Truth-Always note:** Minor Star Chamber is NOT operational in v0.5.7.
Mountain 1 makes it operational. The paid flagship Star Chamber product
(SCaaS at Cost+20% · 9-track · Beyond Colossus engine) is a distinct product
(canon_star_chamber_multi_agent_consensus_verification_product_bp086).
Minor Council is the free-local substrate-primed version used internally by Dr. M.

---

### I-F · COURT PACKAGE LIBRARY (LAZY-LOADING)

**Module:** `src/main/dr_m_orchestrator/court_packages.ts`

**Purpose:** Preconfigured Council compositions for different task classes.
Each Package lazy-loads on first reference and is cached in memory.
Each Package describes: member models · substrate context filter · variance threshold
· escalation policy. M5 and M6 consume `enforcement_council` and `librarian_council`
respectively once M4 is merged.

use segs · Sonnet 4.6

**Core types:**

```typescript
export type CouncilPackageName =
  | "reader_council"
  | "composer_council"
  | "strategic_council"
  | "enforcement_council"
  | "librarian_council"
  | "adjudicator_council";

export type EscalationPolicy =
  | "flagship_on_divergence"   // escalate to Sonnet 4.6 if variance > threshold
  | "fail_on_divergence"       // return error · do not escalate (cost-control mode)
  | "always_flagship";         // always flagship · council used for context only

export interface CourtPackage {
  name: CouncilPackageName;
  description: string;
  members: CouncilMember[];         // model specs for each seat
  variance_threshold: number;       // 0.0-1.0 · escalation trigger
  escalation_policy: EscalationPolicy;
  substrate_context_filter?: string[]; // which SubstrateContextBundle fields to pass (null = all)
  estimated_latency_s: number;      // approximate wall time for full council fire
  cost_per_fire: number;            // approximate USD (0 for all-local councils)
}

export interface CouncilMember {
  model_id: string;                 // e.g. "gemma2:2b" | "gemma4:12b" | "llama3.3:70b"
  vendor: "local" | "anthropic" | "google" | "openai";
  ram_required_gb?: number;         // for peer capability check before firing
  fallback_model_id?: string;       // if primary unavailable
}

export interface CourtPackageLibrary {
  get(name: CouncilPackageName): Promise<CourtPackage>; // lazy-load + cache
  list(): CouncilPackageName[];
  preload(names: CouncilPackageName[]): Promise<void>;  // optional eager load
}

export function createCourtPackageLibrary(db: Database): CourtPackageLibrary;
```

**Default Packages (all ship with Mountain 1):**

```typescript
// reader_council
// Purpose: sub-second extraction tasks
// Members: 3x gemma2:2b (Ollama local)
// Variance threshold: 5% (extraction should be deterministic)
// Escalation: flagship_on_divergence
// Latency: ~1-3s
// Cost: $0.00
{
  name: "reader_council",
  description: "3x gemma2:2b · sub-second extraction · variance threshold 5%",
  members: [
    { model_id: "gemma2:2b", vendor: "local", fallback_model_id: "gemma4:12b" },
    { model_id: "gemma2:2b", vendor: "local", fallback_model_id: "gemma4:12b" },
    { model_id: "gemma2:2b", vendor: "local", fallback_model_id: "gemma4:12b" }
  ],
  variance_threshold: 0.05,
  escalation_policy: "flagship_on_divergence",
  estimated_latency_s: 2,
  cost_per_fire: 0.00
}

// composer_council
// Purpose: composition tasks (~25s window)
// Members: 3x gemma4:12b (Ollama local)
// Variance threshold: 15% (composition allows more divergence before escalation)
// Escalation: flagship_on_divergence
// Latency: ~25s
// Cost: $0.00
{
  name: "composer_council",
  description: "3x gemma4:12b · ~25s composition · variance threshold 15%",
  members: [
    { model_id: "gemma4:12b", vendor: "local" },
    { model_id: "gemma4:12b", vendor: "local" },
    { model_id: "gemma4:12b", vendor: "local" }
  ],
  variance_threshold: 0.15,
  escalation_policy: "flagship_on_divergence",
  estimated_latency_s: 25,
  cost_per_fire: 0.00
}

// strategic_council
// Purpose: strategic reasoning (60-90s window)
// Members: 3x llama3.3:70b if peer RAM allows OR 5x gemma4:12b fallback
// Variance threshold: 10%
// Escalation: flagship_on_divergence
// Latency: 60-90s
// Cost: $0.00
{
  name: "strategic_council",
  description: "3x llama3.3:70b (if peer RAM allows) OR 5x gemma4:12b · 60-90s · variance threshold 10%",
  members: [
    { model_id: "llama3.3:70b", vendor: "local", ram_required_gb: 48, fallback_model_id: "gemma4:12b" },
    { model_id: "llama3.3:70b", vendor: "local", ram_required_gb: 48, fallback_model_id: "gemma4:12b" },
    { model_id: "llama3.3:70b", vendor: "local", ram_required_gb: 48, fallback_model_id: "gemma4:12b" }
  ],
  variance_threshold: 0.10,
  escalation_policy: "flagship_on_divergence",
  estimated_latency_s: 75,
  cost_per_fire: 0.00
}

// enforcement_council
// Purpose: Scribe enforcement (Marathon 5 primary consumer)
// Members: 3x gemma4:12b with canon corpus subset injected via substrate_context_filter
// Variance threshold: 10%
// Escalation: flagship_on_divergence
// Latency: ~25s
// Cost: $0.00
{
  name: "enforcement_council",
  description: "3x gemma4:12b with canon corpus subset · Scribe enforcement · Marathon 5",
  members: [
    { model_id: "gemma4:12b", vendor: "local" },
    { model_id: "gemma4:12b", vendor: "local" },
    { model_id: "gemma4:12b", vendor: "local" }
  ],
  variance_threshold: 0.10,
  escalation_policy: "flagship_on_divergence",
  substrate_context_filter: ["hot_eblets", "active_pheromones"], // canon-heavy subset
  estimated_latency_s: 25,
  cost_per_fire: 0.00
}

// librarian_council
// Purpose: Librarian Corps queries (Marathon 6 primary consumer)
// Members: 3x gemma4:12b with path-specific cabinet context
// Variance threshold: 10%
// Escalation: flagship_on_divergence
// Latency: ~25s
// Cost: $0.00
{
  name: "librarian_council",
  description: "3x gemma4:12b with path-specific cabinet · Librarian Corps · Marathon 6",
  members: [
    { model_id: "gemma4:12b", vendor: "local" },
    { model_id: "gemma4:12b", vendor: "local" },
    { model_id: "gemma4:12b", vendor: "local" }
  ],
  variance_threshold: 0.10,
  escalation_policy: "flagship_on_divergence",
  substrate_context_filter: ["hot_eblets", "recent_pearls"],
  estimated_latency_s: 25,
  cost_per_fire: 0.00
}

// adjudicator_council
// Purpose: flagship Sonnet 4.6 fallback used ONLY on divergence escalation
// Members: 1x claude-sonnet-4-6 (via ClaudeBrainAdapter)
// Escalation policy: always_flagship (this IS the flagship seat)
// Cost: ~$0.06-0.10 per fire (per canon · Comptroller tracks actuals)
{
  name: "adjudicator_council",
  description: "flagship Sonnet 4.6 fallback · used only on divergence from other councils",
  members: [
    { model_id: "claude-sonnet-4-6", vendor: "anthropic" }
  ],
  variance_threshold: 0.0,          // N/A - this council does not fan-out
  escalation_policy: "always_flagship",
  estimated_latency_s: 5,
  cost_per_fire: 0.08               // approximate
}
```

**Lazy-load pattern:**

```typescript
// Packages defined as config objects (no DB read required for defaults)
// loadCouncilPackage() returns from in-memory cache after first call
// Custom packages (future) may load from court_package_audit table

const _cache = new Map<CouncilPackageName, CourtPackage>();

async function loadCouncilPackage(name: CouncilPackageName): Promise<CourtPackage> {
  if (_cache.has(name)) return _cache.get(name)!;
  const pkg = DEFAULT_PACKAGES[name];
  if (!pkg) throw new Error(`Unknown court package: ${name}`);
  _cache.set(name, pkg);
  return pkg;
}
```

**§3 Truth-Always note:** All 6 default packages ship with Mountain 1. Custom
package registration via court_package_audit table is roadmap (post-M4). M5 and M6
consume enforcement_council and librarian_council respectively after M4 merge.

---

## §6 WAVE II · GATED ON WAVE I LANDING · SMOKE TEST

Wave II does not begin until:
- All 6 Wave I modules pass `tsc --noEmit`
- Bishop confirms greenlight via build_slot_request pearl response
- M3 receipt confirmed sealed (Bishop signals)

---

### II-A · SMOKE TEST DISPATCH (SINGLE BRAIN)

Fire one dispatch through the full Dr. M orchestrator stack in single-brain mode:

```typescript
const result = await dispatchLoop.dispatch({
  task_id: crypto.randomUUID(),
  category: "substrate_query",
  prompt: "What is the Substrate?",
  target_peer: undefined,
  substrate_inject: true,
  mode: { single_brain: "gemma-3-local" }   // explicit single-brain for baseline smoke
});
```

Expected path:
1. SubstrateReader reads local SQLite (ip_ledger + pearl_share + eblets + pheromone)
2. selectBrain("substrate_query") selects gemma-3-local (free · routine)
3. If Ollama unavailable · falls back to claude-sonnet-4-6 · logs fallback
4. SubstrateContextBundle injected into brain.reason()
5. Brain returns answer about the Substrate
6. encode("dispatch_response", result) generates hex frame
7. decode() round-trip validates CRC
8. DispatchResult logged to dr_m_dispatch_log
9. Receipt written to Asteroid-ProofVault (see II-B)

---

### II-A2 · MINOR COUNCIL SMOKE TEST (COMPOSER COUNCIL · SAME QUESTION)

Fire same question through composer_council (3x gemma4:12b · substrate primed):

```typescript
const councilResult = await dispatchLoop.dispatch({
  task_id: crypto.randomUUID(),
  category: "peer_dispatch",
  prompt: "What is the Substrate?",
  target_peer: undefined,
  substrate_inject: true,
  mode: { council: "composer_council" }
});
```

Expected path:
1. SubstrateReader reads local SQLite --> SubstrateContextBundle
2. loadCouncilPackage("composer_council") --> CourtPackage (3x gemma4:12b · 15% threshold)
3. minorCouncil() fans to 3x gemma4:12b in parallel · each primed with full SubstrateContextBundle
4. scoreConvergence(answers) --> variance + aggregate
5. If variance <= 0.15: return aggregate · escalated=false
6. If variance > 0.15: escalateToFlagship() fires · escalated=true · logged
7. council_dispatch_log row written with: council_package, question_hash, variance, escalated, timestamp
8. DispatchResult includes: council_variance, council_escalated, council_member_count=3

Receipt captures: per-instance answers · convergence score · variance value · escalated flag.

---

### II-A3 · DELIBERATE DIVERGENCE SMOKE TEST (ESCALATION CONFIRMATION)

Fire a deliberately ambiguous question where local models are expected to diverge:

```typescript
const divergenceResult = await dispatchLoop.dispatch({
  task_id: crypto.randomUUID(),
  category: "reasoning_hard",
  prompt: "Should the Cooperative prioritize restaurant onboarding or gaming community bridging first? Give a single-sentence answer with your recommendation.",
  target_peer: undefined,
  substrate_inject: true,
  mode: { council: "strategic_council" }
});
```

Expected path:
1. strategic_council fires (3x llama3.3:70b OR 5x gemma4:12b fallback · 10% threshold)
2. Models are expected to diverge on opinion-class question
3. scoreConvergence() returns variance > 0.10
4. escalateToFlagship() fires to claude-sonnet-4-6 with all member answers as Council context
5. Flagship adjudicates · returns definitive answer · escalated=true in result
6. Receipt confirms: escalation fired · flagship brain_id logged · council_answers_provided count

This smoke test CONFIRMS the escalation path is wired correctly. If no divergence occurs
(all members agree), Knight notes this in the receipt and manually triggers a known-divergence
prompt until escalation is confirmed fired at least once.

Receipt written to `Asteroid-ProofVault\receipts\MOUNTAIN_1\MINOR_COUNCIL_SMOKE_TEST.md`.

---

### II-B · SMOKE TEST RECEIPTS

**Path 1 (single-brain baseline):**
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\MOUNTAIN_1\SMOKE_TEST.md`

**Required fields:**

```markdown
# MOUNTAIN 1 SMOKE TEST RECEIPT
DATE        : [ISO-8601]
TASK_ID     : [uuid]
PROMPT      : "What is the Substrate?"
BRAIN_USED  : [brain_id]
BRAIN_VENDOR: [vendor]
FALLBACK    : [yes/no · reason if yes]
LATENCY_MS  : [number]
SUBSTRATE_CONTEXT_BYTES : [number]
HEX_FRAME_SIZE_BYTES    : [number]
CRC_VALID   : [true/false]
RESPONSE_EXCERPT: [first 200 chars of brain response]
STATUS      : [PASS/FAIL]
NOTES       : [any anomalies]
```

**Path 2 (Minor Council · composer + divergence):**
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\MOUNTAIN_1\MINOR_COUNCIL_SMOKE_TEST.md`

**Required fields:**

```markdown
# MOUNTAIN 1 MINOR COUNCIL SMOKE TEST RECEIPT
DATE                   : [ISO-8601]

## II-A2 · COMPOSER COUNCIL · "What is the Substrate?"
TASK_ID                : [uuid]
COUNCIL_PACKAGE        : composer_council
MEMBERS_FIRED          : 3
PROMPT                 : "What is the Substrate?"
MEMBER_1_BRAIN         : [brain_id]
MEMBER_1_ANSWER_EXCERPT: [first 100 chars]
MEMBER_1_LATENCY_MS    : [number]
MEMBER_2_BRAIN         : [brain_id]
MEMBER_2_ANSWER_EXCERPT: [first 100 chars]
MEMBER_2_LATENCY_MS    : [number]
MEMBER_3_BRAIN         : [brain_id]
MEMBER_3_ANSWER_EXCERPT: [first 100 chars]
MEMBER_3_LATENCY_MS    : [number]
VARIANCE               : [0.0-1.0]
ESCALATED              : [yes/no]
AGGREGATE_ANSWER_EXCERPT: [first 200 chars]
TOTAL_LATENCY_MS       : [number]
STATUS                 : [PASS/FAIL]

## II-A3 · STRATEGIC COUNCIL · DELIBERATE DIVERGENCE
TASK_ID                : [uuid]
COUNCIL_PACKAGE        : strategic_council
MEMBERS_FIRED          : [N]
PROMPT                 : "Should the Cooperative prioritize restaurant onboarding or gaming community bridging first?..."
MEMBER_ANSWERS_SUMMARY : [brief per-member stance]
VARIANCE               : [0.0-1.0]
ESCALATION_TRIGGERED   : [yes/no]
FLAGSHIP_BRAIN         : [claude-sonnet-4-6 if escalated]
FLAGSHIP_ADJUDICATION  : [first 200 chars of flagship answer]
FLAGSHIP_LATENCY_MS    : [number]
STATUS                 : [PASS/FAIL]
NOTES                  : [any anomalies · if no divergence on first try · retry prompt used]
```

Both receipts are BLACK MAMBA events. No receipt = smoke test did not happen.

---

### II-C · PEARL EMIT

On smoke test PASS (all three: II-A + II-A2 + II-A3), Knight emits:

```json
{
  "pearl_type": "mountain_1_smoke_complete",
  "branch": "knight-marathon-4-mountain-1-persistent-substrate",
  "smoke_test_status": "PASS",
  "brain_used": "[brain_id for II-A]",
  "council_smoke_status": "PASS",
  "composer_council_variance": "[number from II-A2]",
  "composer_council_escalated": "[yes/no]",
  "divergence_escalation_confirmed": "[yes/no from II-A3]",
  "latency_ms": "[number]",
  "substrate_context_bytes": "[number]",
  "receipt_path_single": "C:\\Users\\Administrator\\Documents\\Asteroid-ProofVault\\receipts\\MOUNTAIN_1\\SMOKE_TEST.md",
  "receipt_path_council": "C:\\Users\\Administrator\\Documents\\Asteroid-ProofVault\\receipts\\MOUNTAIN_1\\MINOR_COUNCIL_SMOKE_TEST.md"
}
```

On any smoke test FAIL, Knight emits `mountain_1_smoke_fail` with error detail and
HOLDS for Bishop triage. Knight does NOT self-triage a smoke failure.

---

## §7 SQL SCHEMA (BISHOP APPLIES)

Knight ships four SQL files to BISHOP_DROPZONE. Bishop applies per §15 BLOOD.
Knight does NOT run migrations.

---

### dr_m_dispatch_log

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\sql\MOUNTAIN_1_dr_m_dispatch_log.sql`

```sql
-- Mountain 1 · Dr. M Dispatch Log
-- Bishop applies · do not run directly

CREATE TABLE IF NOT EXISTS dr_m_dispatch_log (
  id                      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id                 TEXT NOT NULL,
  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  category                TEXT NOT NULL,
  prompt_excerpt          TEXT,            -- first 500 chars
  brain_used              TEXT NOT NULL,   -- brain_id (single) OR council_package_name (council)
  brain_vendor            TEXT NOT NULL,
  dispatch_mode           TEXT NOT NULL,   -- 'council' | 'single_brain'
  brain_fallback          INTEGER NOT NULL DEFAULT 0,  -- 0=no fallback 1=fallback used
  fallback_reason         TEXT,
  council_package_name    TEXT,            -- null if single_brain mode
  council_variance        REAL,            -- null if single_brain mode
  council_escalated       INTEGER,         -- 0/1 · null if single_brain mode
  council_member_count    INTEGER,         -- null if single_brain mode
  target_peer_id          TEXT,            -- null = local
  substrate_context_bytes INTEGER,
  hex_frame_size_bytes    INTEGER,
  crc_valid               INTEGER NOT NULL DEFAULT 1,
  latency_ms              INTEGER,
  response_excerpt        TEXT,            -- first 500 chars
  status                  TEXT NOT NULL,   -- 'ok' | 'substrate_read_error' | 'brain_error' | 'peer_error'
  error_detail            TEXT
);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_created_at
  ON dr_m_dispatch_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_brain_used
  ON dr_m_dispatch_log(brain_used);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_status
  ON dr_m_dispatch_log(status);

CREATE INDEX IF NOT EXISTS idx_dr_m_dispatch_log_dispatch_mode
  ON dr_m_dispatch_log(dispatch_mode);
```

---

### brain_swap_audit

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\sql\MOUNTAIN_1_brain_swap_audit.sql`

```sql
-- Mountain 1 · Brain Swap Audit
-- Bishop applies · do not run directly

CREATE TABLE IF NOT EXISTS brain_swap_audit (
  id                      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id                 TEXT NOT NULL,
  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  category                TEXT NOT NULL,
  selection_type          TEXT NOT NULL,   -- 'council' | 'single_brain'
  brain_selected          TEXT NOT NULL,   -- brain_id or council_package_name
  brain_vendor            TEXT NOT NULL,
  selection_reason        TEXT,            -- e.g. "free_local_routine" | "tool_required" | "flagship_hard"
  available_brains        TEXT,            -- JSON array of brain_ids that were available
  ping_latency_ms         INTEGER,         -- from brain.ping() before selection
  fallback_from           TEXT,            -- if fallback: original brain_id that failed
  fallback_reason         TEXT,
  cost_per_1k_tokens      REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_created_at
  ON brain_swap_audit(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_brain_selected
  ON brain_swap_audit(brain_selected);

CREATE INDEX IF NOT EXISTS idx_brain_swap_audit_category
  ON brain_swap_audit(category);
```

---

### council_dispatch_log

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\sql\MOUNTAIN_1_council_dispatch_log.sql`

```sql
-- Mountain 1 · Council Dispatch Log
-- Bishop applies · do not run directly

CREATE TABLE IF NOT EXISTS council_dispatch_log (
  id                      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id                 TEXT NOT NULL,
  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  council_package         TEXT NOT NULL,
  question_hash           TEXT NOT NULL,   -- SHA-256 of prompt · for convergence history
  prompt_excerpt          TEXT,            -- first 500 chars
  members_fired           INTEGER NOT NULL,
  member_answers          TEXT,            -- JSON array of { brain_id, answer_excerpt, latency_ms }
  variance                REAL NOT NULL,   -- 0.0-1.0
  variance_threshold      REAL NOT NULL,   -- from Court Package
  escalated               INTEGER NOT NULL DEFAULT 0,  -- 0=no 1=flagship fired
  escalation_brain        TEXT,            -- e.g. "claude-sonnet-4-6" if escalated
  aggregate_answer_excerpt TEXT,           -- first 500 chars of consensus
  total_latency_ms        INTEGER,
  substrate_context_bytes INTEGER,
  status                  TEXT NOT NULL    -- 'ok' | 'partial' | 'escalated' | 'error'
);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_created_at
  ON council_dispatch_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_council_package
  ON council_dispatch_log(council_package);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_escalated
  ON council_dispatch_log(escalated);

CREATE INDEX IF NOT EXISTS idx_council_dispatch_log_question_hash
  ON council_dispatch_log(question_hash);
```

---

### court_package_audit

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\sql\MOUNTAIN_1_court_package_audit.sql`

```sql
-- Mountain 1 · Court Package Audit
-- Bishop applies · do not run directly
-- Tracks usage + convergence history for all Court Packages

CREATE TABLE IF NOT EXISTS court_package_audit (
  id                      TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  recorded_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  package_name            TEXT NOT NULL,
  members_json            TEXT NOT NULL,   -- JSON array of model_ids in this fire
  usage_count             INTEGER NOT NULL DEFAULT 1,
  last_used_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  total_fires             INTEGER NOT NULL DEFAULT 0,
  escalation_count        INTEGER NOT NULL DEFAULT 0,
  avg_variance            REAL,            -- rolling average variance across all fires
  convergence_history     TEXT             -- JSON array of last 20 variance values (ring buffer)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_court_package_audit_package_name
  ON court_package_audit(package_name);

CREATE INDEX IF NOT EXISTS idx_court_package_audit_recorded_at
  ON court_package_audit(recorded_at DESC);
```

---

## §8 RETURN PROTOCOL

### Pearl on Completion

On Wave I + Wave II both GREEN, Knight emits:

```json
{
  "pearl_type": "mountain_1_complete",
  "branch": "knight-marathon-4-mountain-1-persistent-substrate",
  "mountain": 1,
  "session": "KNIGHT_MARATHON_4",
  "wave_1_status": "GREEN",
  "wave_2_status": "GREEN",
  "modules_shipped": [
    "src/main/dr_m_orchestrator/substrate_reader.ts",
    "src/main/dr_m_orchestrator/brain_swap.ts",
    "src/main/dr_m_orchestrator/hex_mcode.ts",
    "src/main/dr_m_orchestrator/dispatch_loop.ts",
    "src/main/dr_m_orchestrator/minor_star_chamber.ts",
    "src/main/dr_m_orchestrator/court_packages.ts"
  ],
  "sql_files_dropped": [
    "BISHOP_DROPZONE/sql/MOUNTAIN_1_dr_m_dispatch_log.sql",
    "BISHOP_DROPZONE/sql/MOUNTAIN_1_brain_swap_audit.sql",
    "BISHOP_DROPZONE/sql/MOUNTAIN_1_council_dispatch_log.sql",
    "BISHOP_DROPZONE/sql/MOUNTAIN_1_court_package_audit.sql"
  ],
  "smoke_receipts": [
    "Asteroid-ProofVault/receipts/MOUNTAIN_1/SMOKE_TEST.md",
    "Asteroid-ProofVault/receipts/MOUNTAIN_1/MINOR_COUNCIL_SMOKE_TEST.md"
  ],
  "council_smoke_confirmed": true,
  "escalation_path_confirmed": true,
  "court_package_inheritance_note": "M5 consumes enforcement_council · M6 consumes librarian_council · both available post-M4-merge",
  "awaiting": "Bishop merge after M3 closes"
}
```

### Per-SEG AMBER/GREEN Status

| SEG | Module | Status |
|-----|--------|--------|
| I-A | substrate_reader.ts | [ ] AMBER / [ ] GREEN |
| I-B | brain_swap.ts (Council-aware) | [ ] AMBER / [ ] GREEN |
| I-C | hex_mcode.ts | [ ] AMBER / [ ] GREEN |
| I-D | dispatch_loop.ts (Council-default) | [ ] AMBER / [ ] GREEN |
| I-E | minor_star_chamber.ts | [ ] AMBER / [ ] GREEN |
| I-F | court_packages.ts (6 packages) | [ ] AMBER / [ ] GREEN |
| II-A | Smoke dispatch (single-brain) | [ ] AMBER / [ ] GREEN |
| II-A2 | Council smoke (composer_council) | [ ] AMBER / [ ] GREEN |
| II-A3 | Divergence smoke (escalation confirm) | [ ] AMBER / [ ] GREEN |
| II-B | Smoke receipts (both files) | [ ] AMBER / [ ] GREEN |
| II-C | Pearl emit | [ ] AMBER / [ ] GREEN |

Knight fills this table before emitting mountain_1_complete. AMBER = partial
(functional but with known gaps noted). GREEN = full receipt + tsc clean.

### Merge Order

Bishop merges in order: M3 - M4 - M5 - M6. Knight does NOT push to main.
Knight does NOT rebase onto M3/M5/M6 without Bishop written instruction.
Conflicts resolved by Bishop during merge sequence.

---

## §9 CLOSING

Mountain 1 delivers the foundational primitives that make Dr. MnemosyneC
a self-aware orchestrator with a native multi-model Council at her core.

SubstrateReader makes her context-aware on every tick.
Brain-Swap (Council-aware) makes her vendor-resilient and cost-conscious.
HEX-MCODE makes her dispatch compact and verifiable.
DispatchLoop makes all modules operational as a unified tick.
Minor Star Chamber makes consensus verification INHERENT · not a bolt-on.
Court Package Library gives the Council its shape · lazy-loaded · composable.

These six modules compose with every Sweet 16 initiative downstream. Every
member interaction that touches Dr. M flows through this mountain's output.
M5 and M6 inherit the Court Package library directly once M4 is merged.

"The boat will float, but to get somewhere, it needs a Captain."
Mountain 1 gives the Captain her instruments · and her Council.

Help Each Other Help Ourselves.
LB Corp · Built In Public · Statutes §3 binding.
FounderDenken/Crewman#6

---

*KNIGHT MARATHON 4 · MOUNTAIN 1 · BP089 · 2026-06-20 · BLACK MAMBA · use segs*
