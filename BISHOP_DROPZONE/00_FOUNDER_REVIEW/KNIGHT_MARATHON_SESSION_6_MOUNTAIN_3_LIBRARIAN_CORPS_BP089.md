# KNIGHT MARATHON SESSION 6 · BLACK MAMBA · MOUNTAIN 3 · LIBRARIAN CORPS
**BP089 · Bishop Sonnet 4.6 (strategist) · Knight Sonnet 4.6 (operator mechanic)**
**Date:** 2026-06-20
**Session class:** BLACK MAMBA · Inverted Pyramid Memory + Librarian Corps
**Branch:** `knight-marathon-6-mountain-3-librarian-corps`
**Scope dir:** `src/main/librarian_corps/` (NEW · zero collision with M3/M4/M5 dirs)

---

## §0 · BLACK MAMBA WAKE HEADER

BLACK MAMBA is the reserved wake class for unified empirical-proof events
(canon_substrace_theorem_wake_class_supersedes_black_mamba_until_mnemosyne_come_bp061).

Mountain 3 targets the memory architecture layer. Dr. M always remembers because
the Librarian Corps holds the file cabinets open. The Inverted Pyramid Index gives
her O(log N) resolution into any substrate path without a full flat-file scan.
Librarians ARE persistent SEGs of the same lineage as M4 (persistent substrate
read SEG) and M5 (persistent SEG pattern). They do not replace SEGs; they ARE
SEGs with assigned domain authority and cabinet keys.

Each Librarian is now a Minor Council of three gemma4:12b sub-Librarian instances
(Marathon 4 `librarian_council` Court Package). The Council fans to 3 sub-contexts
in parallel, computes consensus, and returns a single authoritative answer to Dr. M.
This is the same multi-model consensus discipline used in Star Chamber (SCaaS) applied
at the memory layer.

This session ships four new TypeScript modules to `src/main/librarian_corps/`,
a SQL schema block (Bishop applies), and a smoke test receipt under
`Asteroid-ProofVault\receipts\MOUNTAIN_3\LIBRARIAN_COUNCIL_SMOKE.md`.

**Depends on:**
- M4 · persistent substrate read SEG (substrate address resolution is live) +
  `librarian_council` Court Package (Minor Council fan-out pattern)
- M5 · persistent SEG pattern (Librarians reuse the SEG lifecycle hooks M5 defines;
  Council voting variance handling inherits M5 Scribe Council lessons learned)

**Unblocks:**
- PATH X relay memory warm-up (Librarians pre-resolve the THUNDERCLAP manifest
  before Pass B fires, cutting cold-start latency on Trial 02b re-fire)

---

## §1 · GADGET-FIRST PREAMBLE

**STATUTE §17 BLOOD: discovery via gadgets. Always.**

"use segs" Sonnet 4.6 verbatim is the invocation form for every Knight action.

Knight does NOT:
- Run interactive shell sessions
- Type ad hoc commands into a terminal emulator
- Edit source blind without a prior read-SEG confirming the file state

Knight DOES:
- Write a scoped script, run it via SEG, read the output
- Surface findings as artifacts before acting on them
- Chain SEGs sequentially when outputs feed inputs
- Fix one thing fully before moving to the next
  (canon_fix_one_thing_fully_before_moving_on_no_messy_leftovers_bp063)

Allowed SEG script types: `.ps1` (PowerShell) · `.mjs` / `.js` (Node) · `.sh`
(Bash on WSL path if confirmed available).

If discovery output is ambiguous, Knight surfaces it to Bishop via pearl before
acting. No silent assumption. No blind edit.

---

## §2 · STATUTES BINDING

| Statute | Binding | Application this session |
|---------|---------|--------------------------|
| §3 | Sonnet 4.6 · Bishop + Knight both run on Sonnet 4.6 | Model lock. No model substitution without Founder ratify. |
| §14 | Gadget DB | All DB reads + writes via gadget. No psql direct. |
| §15 | Bishop applies SQL | Schema in §7 authored here; Bishop applies via Supabase gadget. Knight reads schema artifacts Bishop emits before wiring TypeScript. |
| §16 | Architectural · IP Ledger | IP Ledger is live. Librarian corps directory table composes with ip_ledger row as foreign anchor. Knight does not alter ip_ledger schema. |
| §17 | Gadget-first discovery | Every new code path begins with a read-SEG before any write-SEG. |

---

## §3 · PARALLEL EXECUTION CONSTRAINT

Knight commits to feature branch `knight-marathon-6-mountain-3-librarian-corps`.

All new files land in `src/main/librarian_corps/`. This directory does not exist
yet; Knight creates it. No edits to files outside this directory except:

- `src/main/substrace/wake_router.ts` · ONE additive import only if Wave II
  smoke test requires a dispatcher hook (Bishop ratifies before Knight lands it)
- `tsconfig.main.json` · additive path alias only if TypeScript resolution fails

M3 dir (`src/main/substrace/`) is READ-ONLY for Knight this session.
M4 and M5 dirs are READ-ONLY for Knight this session.
No collision. No cross-contamination. Scope-isolated.

**M6 dependency chain:**

M6 depends on:
- M4's Court Package library + `librarian_council` Court Package (Minor Council
  fan-out pattern and sub-context loading contract)
- M5's Council voting pattern (Scribe Council variance handling lessons inform
  Librarian Council variance threshold and escalation logic; 15% divergence
  threshold and flagship adjudicator_council escalation are direct descendants
  of M5 Scribe Council dispute resolution)

These are hard prerequisites. Knight reads M4 Court Package manifest and M5
Council voting receipt before beginning Wave I.

---

## §4 · EMPIRICAL STATE

### 4.1 M4 dependency (persistent substrate read SEG + Court Package library)

M4 shipped a persistent SEG that resolves substrate addresses against the
Supabase-backed eblet store via `queryEbletStore` (confirmed in
`src/main/substrace/wake_router.ts`). The Inverted Pyramid Index in I-A
layers on top of this: it does not replace the address resolver; it indexes
the address space so Dispatcher can pick the right Librarian before the
resolver fires.

M4 also ships the Court Package library (lazy-load contract). The
`librarian_council` Court Package (per §3 dependency) provides the
3-member Minor Council fan-out pattern used by every Librarian in I-B.

M4 anchor: `queryEbletStore` export from `src/main/substrace/wake_router.ts`
(confirmed live · BP089 fleet state 2026-06-20).

### 4.2 M5 dependency (persistent SEG pattern + Council voting lessons)

M5 formalized the persistent SEG lifecycle: spin-up / health-check / task-loop /
teardown. Librarians use this identical pattern. A Librarian IS a persistent SEG
with domain authority and cabinet keys. No new lifecycle primitives needed.

M5 Scribe Council lessons learned: variance threshold set at 15% divergence
before escalation fires. Below 15%, majority vote is canonical. At or above 15%,
escalation to flagship adjudicator_council is mandatory. This threshold and
escalation pattern are inherited verbatim by the Librarian Minor Council.

M5 anchor: persistent SEG lifecycle hooks + Council voting receipt
(confirmed pattern via substrace wake SEG lineage · BP089 · v0.5.14 fleet).

### 4.3 SEG lineage

Librarians are persistent SEGs of the same lineage:
- SEG (original) · fire-and-forget script
- Persistent SEG (M4/M5) · long-running, health-checked, task-loop
- Librarian SEG · persistent SEG + domain authority + cabinet keys
- Librarian Minor Council · three Librarian SEG instances, same path, divergent
  sub-contexts, consensus-aggregated output

The Librarian Minor Council is the fourth level of the SEG family tree.

### 4.4 Canon references (§4 verbatim)

- `canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089`
  Librarian Minor Council inherits the Star Chamber multi-model consensus discipline
  (canon_star_chamber_multi_agent_consensus_verification_product_bp086). Free local
  gemma4:12b instances compose the Council. Mountain 1 substrate priming is a
  prerequisite: sub-Librarians must resolve against a warmed substrate address
  space. Without Mountain 1 priming, sub-context fan-out hits cold storage and
  misses the 100-300ms latency target.

- `canon_bishop_eat_our_own_cooking_substrate_first_dispatch_route_by_task_fit_bp089`
  Dispatcher routes to the Librarian Council using substrate-first dispatch
  (canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085). Free local
  gemma4:12b Council members handle all resolution. Flagship adjudicator_council
  fires ONLY on escalation (divergence above 15%). Substrate routes by task fit;
  flagships are consultants, not residents.

### 4.5 Fleet health anchor (BP089 · 2026-06-20)

| Peer | Machine | gemma4:12b status |
|------|---------|-------------------|
| M0 | cb4ef450 | hot |
| M3 | d0b47bd0 | hot |
| M2 | 88cbf6bd | hot |
| SON | 49f3e597 | hot |

All four peers on v0.5.14. This is the baseline against which Wave II smoke
test latency is measured.

---

## §5 · WAVE I · UNGATED · SEG FAN-OUT

Wave I is ungated. Knight fans out all four modules in parallel. Each module
is self-contained. No cross-dependency within Wave I (Dispatcher in I-D
imports the other three, so Knight ships I-A / I-B / I-C first, then I-D).

### I-A · Inverted Pyramid Index

**File:** `src/main/librarian_corps/pyramid_index.ts`

**Architecture:**

Three-layer hierarchical index on top of the existing soccerball-DAG
(canon_socceri_node_frontier_network_naming_taxonomy_supersedes_futbol_bp063).
The soccerball-DAG provides the address space. The Inverted Pyramid adds a
topic-tagged index at each of three layers so resolution is O(log N) instead
of O(N) flat-file scan.

Each pyramid layer node carries a `default_council_package` field naming the
Court Package preferred for resolution at that layer. This field is stored in
`pyramid_index_canonical.layer_default_council` (schema in §7).

```
Layer 0 · CANON tier
  - contains: hard-canon eblets, HARD CANON receipts, Founder-ratified locks
  - topic tags: pricing, membership, currency, identity, security, substrate,
                gaming, food, publishing, ip_ledger, wire_format, memory
  - default_council_package: "canon_council_v1"
    (canon corpus split: member 1 = eblets 1-50 · member 2 = 51-100 · member 3 = 101-150)

Layer 1 · PEARL tier
  - contains: pearl records, session pearls, smoke-test pearls
  - topic tags: session_close, smoke_test, pass_b, trial_02b, mountain_N,
                fleet_health, relay_auth, benchmark
  - default_council_package: "pearl_council_v1"
    (pearl registry split: member 1 = sessions 1-30 · member 2 = 31-60 · member 3 = 61+)

Layer 2 · EBLET tier
  - contains: all other eblets, reference eblets, draft eblets, receipts
  - topic tags: draft, reference, receipt, supersede, augur, violation, backfill
  - default_council_package: "eblet_council_v1"
    (eblet corpus split: member 1 = domain · member 2 = receipts · member 3 = reference)
```

Resolution algorithm:
1. Parse query into topic-tag set
2. Binary-search Layer 0 index for canon-tier hits (O(log N_0))
3. If no hit, binary-search Layer 1 for pearl-tier hits (O(log N_1))
4. If no hit, binary-search Layer 2 for eblet-tier hits (O(log N_2))
5. Load `default_council_package` for the matched layer
6. Return best hit + composes-with chain + council_package reference

Total resolve: O(log N_0 + log N_1 + log N_2) which collapses to O(log N)
since layers are disjoint partitions.

**Interface:**

```typescript
export interface PyramidLayer {
  tier: 'canon' | 'pearl' | 'eblet';
  topicIndex: Map<string, string[]>;       // topic-tag -> address[]
  defaultCouncilPackage: string;           // Court Package name for this layer
}

export interface PyramidHit {
  address: string;
  tier: 'canon' | 'pearl' | 'eblet';
  topicTags: string[];
  composesWithChain: string[];
  councilPackage: string;                  // inherited from layer.defaultCouncilPackage
}

export async function buildPyramidIndex(): Promise<PyramidLayer[]>;
export async function resolveByTopic(
  query: string,
  index: PyramidLayer[]
): Promise<PyramidHit | null>;
export async function resolveByAddress(
  address: string,
  index: PyramidLayer[]
): Promise<PyramidHit | null>;
```

**SEG invocation (Knight reads current eblet store state first):**

```
use segs
SEG: read_pyramid_seed.mjs
  - queries Supabase eblet_store for all records
  - extracts (slug, type, topic_tags, composes_with) tuples
  - writes JSON seed file to dist/ for index build
  - prints record count + layer distribution + council_package assignment per layer
```

Knight ships `pyramid_index.ts` only after the seed-read SEG confirms the
eblet store is reachable and returns records.

---

### I-B · Librarian Corps Role

**File:** `src/main/librarian_corps/librarian.ts`

**Architecture:**

Each Librarian is composed of a 3-member Minor Council of gemma4:12b instances,
loaded via the Marathon 4 `librarian_council` Court Package. The Council is NOT
a single SEG with a single context window. It is three independent sub-Librarian
instances, each loading a disjoint sub-context of the same domain corpus. They
answer in parallel. The Dispatcher computes consensus and returns a single
authoritative response to Dr. M.

**Sub-context split per Librarian role:**

| Role | Member 1 sub-context | Member 2 sub-context | Member 3 sub-context |
|------|---------------------|---------------------|---------------------|
| `canon_librarian` | canon corpus eblets 1-50 | 51-100 | 101-150 |
| `pearl_librarian` | pearl sessions 1-30 | 31-60 | 61+ |
| `receipts_librarian` | THUNDERCLAP cabinet shards A | shards B | shards C |
| `domain_librarian` | food domain | gaming domain | membership + publishing |
| `code_librarian` | TypeScript src/ | SQL schema/ | SEG scripts/ |
| `downloaded_librarian` | vendor docs A | vendor docs B | reference material |

All three members are spun up on first `spin_up()` call. Each holds its own
cabinet handle (one sub-Cabinet per member). Each independently resolves the
query against its sub-context. The Council returns three `SubLibrarianVote`
objects to the Dispatcher for consensus computation.

**Latency target:** 100-300ms wall-clock for 3 parallel sub-Librarian queries.
All three members fire at the same instant via `Promise.all()`. The wall-clock
time is the time of the SLOWEST member, not the sum.

**Interface:**

```typescript
export type LibrarianRole =
  | 'domain_librarian'
  | 'pearl_librarian'
  | 'canon_librarian'
  | 'receipts_librarian'
  | 'code_librarian'
  | 'downloaded_librarian';

export interface LibrarianRequest {
  query: string;
  role: LibrarianRole;
  returnFormat: 'content' | 'address' | 'composes_with_chain';
}

export interface SubLibrarianVote {
  memberId: 1 | 2 | 3;
  subContext: string;                      // which sub-context this member loaded
  hit: PyramidHit | null;
  content: string | null;
  resolvedAddress: string | null;
  composesWithChain: string[];
  latencyMs: number;
}

export interface LibrarianCouncilResponse {
  votes: [SubLibrarianVote, SubLibrarianVote, SubLibrarianVote];
  consensusContent: string | null;
  consensusAddress: string | null;
  divergenceScore: number;                 // 0.0-1.0 · fraction of members that disagreed
  escalated: boolean;                      // true if divergence > 0.15
  wallClockMs: number;                     // max(member latencies) not sum
  librarianRole: LibrarianRole;
  councilPackage: string;
}

export abstract class BaseLibrarian {
  abstract role: LibrarianRole;
  abstract cabinetPartition: string;
  abstract subContextMap: [string, string, string];  // sub-context label per member
  async spin_up(): Promise<void>;          // spins all 3 members
  async council_resolve(req: LibrarianRequest): Promise<LibrarianCouncilResponse>;
  async teardown(): Promise<void>;         // releases all 3 cabinet handles
}

export class CanonLibrarian extends BaseLibrarian { ... }
export class PearlLibrarian extends BaseLibrarian { ... }
export class ReceiptsLibrarian extends BaseLibrarian { ... }
export class DomainLibrarian extends BaseLibrarian { ... }
export class CodeLibrarian extends BaseLibrarian { ... }
export class DownloadedLibrarian extends BaseLibrarian { ... }
```

**Wire format:** Librarian Council returns consensus content to Dispatcher via
hex-mcode (canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085).
Response frames are hex-encoded before transit. Dispatcher handles decode and
returns decoded human-readable `content` field for local use alongside `hexFrame`.

---

### I-C · File Cabinet Abstraction

**File:** `src/main/librarian_corps/file_cabinet.ts`

**Architecture:**

The File Cabinet is a sealed-jar wrapper and Court Package lazy-load contract.
It composes with the house_scribe canon (Apiarist Hive lineage). A Librarian
opens a Cabinet by substrate address and gets back the jar contents. The Cabinet
enforces seal integrity: a sealed jar that has been tampered with returns a
`SEAL_BROKEN` error rather than corrupted content.

Each File Cabinet IS a Court Package lazy-load unit. It does NOT pre-load its
context at construction. It lazy-loads on first `openCabinet()` call, then stays
warm via `keep_alive` (default 24h, matching gemma4:12b warmup cadence). When
memory pressure exceeds the LRU eviction threshold, the least-recently-accessed
Cabinet is evicted and must cold-load on next access.

Cabinet sealing locks the `file_cabinet_seal_log` row AND emits a pearl on seal,
so every sealed Cabinet has a pearl anchor in the substrate.

The Cabinet does not know about Librarian roles. It knows about addresses, jars,
and its own lazy-load state. The Librarian (and sub-Librarian Council member)
knows which Cabinet to open.

**Composition:**

- `mcp__librarian__house_scribe_query_jars` · primary jar lookup by address
- `mcp__librarian__house_scribe_query_jars_by_coordinate` · coordinate-based
  lookup when address resolves to a soccerball-DAG coordinate
- `mcp__librarian__house_scribe_seal_jar` · verify seal on open (read-only
  verify, does not re-seal)
- `mcp__librarian__pearl_emit` · emits pearl on cabinet seal event

**Interface:**

```typescript
export interface CabinetAddress {
  substratePath: string;
  coordinate?: string;            // soccerball-DAG hex coordinate if known
  partition: string;              // canon | pearl | eblet | receipts | code | downloaded
}

export interface CabinetContents {
  address: CabinetAddress;
  jarId: string;
  content: string;
  sealStatus: 'intact' | 'SEAL_BROKEN' | 'not_sealed';
  openedAtMs: number;
  lazyLoadFirstAccessedAt: string | null;  // ISO timestamptz, null if first access now
  keepAliveUntil: string;                  // ISO timestamptz, 24h from first access
}

export interface CabinetError {
  code: 'NOT_FOUND' | 'SEAL_BROKEN' | 'TIMEOUT' | 'PARTITION_MISMATCH';
  address: CabinetAddress;
  message: string;
}

export interface CabinetLRUEntry {
  substratePath: string;
  lastAccessedAt: number;          // epoch ms · for LRU eviction
  keepAliveUntil: number;          // epoch ms · evict only after this passes
}

export async function openCabinet(
  address: CabinetAddress
): Promise<CabinetContents | CabinetError>;

export async function verifySeal(
  jarId: string
): Promise<'intact' | 'SEAL_BROKEN' | 'not_sealed'>;

export async function sealCabinet(
  address: CabinetAddress
): Promise<{ sealLogId: string; pearlEmitted: boolean }>;

export function evictLRU(
  registry: CabinetLRUEntry[],
  pressureThresholdBytes: number
): CabinetLRUEntry[];
```

**Seal log:** Every `openCabinet` call writes a row to `file_cabinet_seal_log`
(schema in §7). `lazy_load_first_accessed_at` is written on first access and
never overwritten on subsequent accesses. This log is the audit trail Bishop
can query to confirm which Librarian Council member opened which cabinet, when
first accessed, and when.

---

### I-D · Librarian Corps Dispatcher

**File:** `src/main/librarian_corps/dispatcher.ts`

**Architecture:**

The Dispatcher is the single entry point Dr. M uses. She does not know which
Librarian Council to call; she asks the Dispatcher with a natural-language or
address-form query. The Dispatcher:

1. Checks its 60-second path cache. If the same path was queried within 60s,
   returns cached `DispatchResponse` immediately (no Council re-fire).
2. Calls `resolveByTopic` or `resolveByAddress` from `pyramid_index.ts`
3. Reads `PyramidHit.councilPackage` to select the Court Package
4. Routes to the correct Librarian Council based on `PyramidHit.tier` + topic-tags
5. Calls `Librarian.council_resolve(request)` which fans to 3 sub-Librarians in parallel
6. Receives `LibrarianCouncilResponse` with 3 votes + divergence score
7. If `divergenceScore > 0.15`: escalates to flagship `adjudicator_council`
   (emit escalation pearl, await adjudicator response, use as canonical answer)
8. If `divergenceScore <= 0.15`: uses majority-vote `consensusContent` directly
9. Writes vote result to `librarian_council_vote_log` (schema in §7)
10. Returns `DispatchResponse` to Dr. M in hex-mcode

**Cache contract:**
- Cache key: normalized query string (lowercased, trimmed)
- TTL: 60 seconds wall-clock
- Cache is in-process only (no cross-peer cache in this mountain)
- Cache hit skips Council fire entirely and returns `fromCache: true`

**Variance threshold:**

| Query class | Variance threshold | Escalation target |
|-------------|-------------------|-------------------|
| canon-tier | 15% (1 of 3 dissents) | flagship adjudicator_council |
| pearl-tier | 15% | flagship adjudicator_council |
| eblet-tier | 15% | flagship adjudicator_council |

All query classes share the same 15% threshold inherited from M5 Scribe Council
pattern. Divergence score = fraction of members whose top hit differs from the
majority answer. One dissent out of three = 0.33 > 0.15, so any single dissent
triggers escalation.

**Routing table (Dispatcher picks Librarian Council by tier + topic-tag signal):**

| Tier | Topic-tag signal | Librarian Council assigned |
|------|------------------|-----------------------------|
| canon | any | `CanonLibrarian` Council |
| pearl | session_close, smoke_test, pass_b | `PearlLibrarian` Council |
| eblet | receipt, thunderclap | `ReceiptsLibrarian` Council |
| eblet | typescript, sql, seg | `CodeLibrarian` Council |
| eblet | domain, food, gaming | `DomainLibrarian` Council |
| eblet | downloaded, vendor | `DownloadedLibrarian` Council |
| any | (no signal match) | `DomainLibrarian` Council (fallback) |

**Interface:**

```typescript
export interface DispatchRequest {
  query: string;                   // natural-language or substrate address
  preferredTier?: 'canon' | 'pearl' | 'eblet';
  returnFormat?: 'content' | 'address' | 'composes_with_chain';
}

export interface DispatchResponse {
  hit: PyramidHit | null;
  librarianRole: LibrarianRole;
  councilPackage: string;
  content: string | null;
  composesWithChain: string[];
  hexFrame: string;                // hex-mcode encoded response
  latencyMs: number;               // wall-clock from dispatch() call to return
  pyramidResolveMs: number;
  cabinetOpenMs: number;
  councilVoteMs: number;           // wall-clock for 3-member fan-out
  divergenceScore: number;
  escalated: boolean;
  fromCache: boolean;
}

export async function dispatch(req: DispatchRequest): Promise<DispatchResponse>;
```

**Dr. M integration point:** Dr. M calls `dispatch()` and receives
`DispatchResponse`. The `hexFrame` field is the wire-format payload ready for
relay transit. `content` is the decoded human-readable form for local use.
`escalated: true` means the adjudicator_council resolved the answer; Dr. M
may optionally surface this signal for transparency.

---

## §6 · WAVE II · GATED · SMOKE TEST

Wave II is gated on:
- Wave I complete (all four modules ship and TypeScript compiles clean)
- M4 confirmed live (persistent substrate read SEG returns records)
- M5 confirmed live (persistent SEG lifecycle hooks available)

Knight does NOT begin Wave II until all three gates pass. Gate check is a
read-SEG that confirms compile + M4 reachability + M5 lifecycle import.

**Receipt path:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\MOUNTAIN_3\LIBRARIAN_COUNCIL_SMOKE.md`

Knight creates `receipts/MOUNTAIN_3/` dir if it does not exist.

### II-A · Smoke Test 1: Canon path resolve via Council

**Scenario:** Dr. M asks "where does canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable live?"

**Execution:**
1. `dispatch({ query: "canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable", preferredTier: "canon" })`
2. Dispatcher checks cache (miss on first run)
3. Dispatcher calls `resolveByTopic(query, index)` · pyramid resolves at canon tier
4. Dispatcher reads `councilPackage: "canon_council_v1"` from `PyramidHit`
5. Dispatcher assigns `CanonLibrarian` Council
6. `CanonLibrarian.council_resolve()` fires 3 sub-Librarians in parallel via `Promise.all()`
   - Member 1: searches canon corpus 1-50 in sub-Cabinet A
   - Member 2: searches canon corpus 51-100 in sub-Cabinet B
   - Member 3: searches canon corpus 101-150 in sub-Cabinet C
7. All 3 votes return · Dispatcher computes consensus + divergence score
8. Dispatcher encodes to hex-mcode and returns `DispatchResponse`

**Pass criteria:**
- `hit.tier === 'canon'`
- `content` is non-null and contains the eblet body
- `composesWithChain` is non-empty (canon eblets always have composes-with)
- `councilVoteMs` under 300ms (3-member parallel fan-out latency target)
- `divergenceScore <= 0.15` (all 3 members should agree on a well-known canon slug)
- `escalated === false`

### II-B · Smoke Test 2: Receipts path resolve via Council

**Scenario:** Dr. M asks "what receipts pin Trial 02b?"

**Execution:**
1. `dispatch({ query: "Trial 02b receipts THUNDERCLAP", preferredTier: "eblet" })`
2. Dispatcher calls `resolveByTopic("trial 02b thunderclap receipt", index)`
3. Pyramid resolves at eblet tier with topic-tags `["receipt", "thunderclap"]`
4. Dispatcher assigns `ReceiptsLibrarian` Council
5. `ReceiptsLibrarian.council_resolve()` fires 3 sub-Librarians in parallel
   - Member 1: pulls from THUNDERCLAP cabinet shard A
   - Member 2: pulls from THUNDERCLAP cabinet shard B
   - Member 3: pulls from THUNDERCLAP cabinet shard C
6. All 3 votes return receipt content + seal status
7. Consensus computed · response returned

**Pass criteria:**
- `hit.tier === 'eblet'`
- `librarianRole === 'receipts_librarian'`
- `content` is non-null
- `sealStatus` is `'intact'` or `'not_sealed'` (never `'SEAL_BROKEN'`)
- `councilVoteMs` under 300ms

### II-C · Latency benchmark

Pyramid resolve + Council fan-out must be 5-10x faster than current flat-file search.

**Baseline (flat-file):** Knight runs a read-SEG that does a naive glob sweep
of `Asteroid-ProofVault/` for a well-known canon slug and measures wall-clock
time. Expected baseline: 2,000-5,000ms.

**Council resolve:** Same query routed through Dispatcher, measuring
`latencyMs` (end-to-end) and `pyramidResolveMs` from `DispatchResponse`.

**Pass criteria:**
- `latencyMs < (baseline_flat_ms / 5)` (at least 5x faster, targeting 5-10x)
- Target absolute: under 300ms end-to-end (pyramid + Council fan-out combined)
- If benchmark does not pass, Knight surfaces diff to Bishop before closing
  Wave II. Do not paper over a failed benchmark.

Current flat-file scan baseline on v0.5.14 fleet: approximately 2,000-5,000ms.
Council resolve target: under 300ms. Expected ratio: 7-17x speedup.

### II-D · Ambiguous query escalation test

**Scenario:** Dr. M asks a query that could resolve into two cabinets simultaneously.
Example: "membership pricing canon" (matches both canon-tier pricing AND pearl-tier
session receipts for membership).

**Execution:**
1. `dispatch({ query: "membership pricing canon" })`
2. Pyramid resolves with hits in both Layer 0 (canon) and Layer 1 (pearl)
3. Dispatcher picks primary hit (Layer 0 wins per resolution algorithm)
4. `CanonLibrarian` Council fires · Member 2 (eblets 51-100) finds canon membership
   pricing · Member 1 finds a different pricing reference · Member 3 finds pearl
   receipt reference
5. Divergence score exceeds 0.15 (split Council: 1 member on different answer)
6. Escalation fires: Dispatcher emits escalation pearl · routes to flagship
   `adjudicator_council`
7. Adjudicator returns canonical answer (canon-tier membership pricing wins)
8. `escalated === true` in `DispatchResponse`

**Pass criteria:**
- `escalated === true`
- `divergenceScore > 0.15`
- `librarian_council_vote_log` row written with `escalated_y_n = true`
- `content` is non-null (adjudicator resolved successfully)
- `latencyMs` reflects escalation overhead (will exceed 300ms; document actual value)

### II-E · Latency benchmark receipt

**Scenario:** Formal latency receipt comparing Pyramid + Council resolve vs flat-file baseline.

**Execution:**
1. Run flat-file SEG baseline (glob sweep) on all 4 fleet peers · average result
2. Run 5 consecutive `dispatch()` calls with cache disabled (force cold-Council fires)
3. Record `pyramidResolveMs` · `councilVoteMs` · `cabinetOpenMs` · `latencyMs` per run
4. Compute p50/p95/max across 5 runs
5. Compute speedup ratio: `baseline_avg_ms / latency_p50`

**Pass criteria:**
- p50 `latencyMs` under 300ms
- speedup ratio at least 5x (expected 5-10x based on 2,000-5,000ms baseline)
- p95 under 500ms (Council fan-out tail latency bounded)

**Receipt must contain:**
- Baseline flat-file scan: avg ms across 4 peers
- p50 / p95 / max latency across 5 Council resolves
- Speedup ratio
- "Target 5-10x speedup: PASS or FAIL" (do not paper over a FAIL)

### II-F · Smoke test receipt

**Path:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\receipts\MOUNTAIN_3\LIBRARIAN_COUNCIL_SMOKE.md`

Knight creates `receipts/MOUNTAIN_3/` dir if it does not exist.

Receipt must contain:
- Session: KNIGHT MARATHON 6 · MOUNTAIN 3
- Date: 2026-06-20
- Branch: `knight-marathon-6-mountain-3-librarian-corps`
- Smoke Test II-A result: pass/fail + councilVoteMs
- Smoke Test II-B result: pass/fail + councilVoteMs
- Smoke Test II-C result: latencyMs vs baseline + speedup ratio
- Smoke Test II-D result: escalated confirmed + divergenceScore
- Smoke Test II-E result: p50/p95/max + speedup ratio + PASS/FAIL
- Pearl anchor: `mountain_3_smoke_complete`
- Commit hash at time of receipt

### II-G · Pearl

Knight emits pearl `mountain_3_smoke_complete` after Wave II passes.

Pearl payload:
```
{
  "session": "KNIGHT_MARATHON_6_MOUNTAIN_3",
  "bp": "BP089",
  "branch": "knight-marathon-6-mountain-3-librarian-corps",
  "modules_shipped": [
    "src/main/librarian_corps/pyramid_index.ts",
    "src/main/librarian_corps/librarian.ts",
    "src/main/librarian_corps/file_cabinet.ts",
    "src/main/librarian_corps/dispatcher.ts"
  ],
  "smoke_tests_passed": ["II-A", "II-B", "II-C", "II-D", "II-E"],
  "council_latency_p50_ms": "<measured>",
  "baseline_flat_ms": "<measured>",
  "speedup_ratio": "<measured>",
  "escalation_confirmed": true,
  "receipt_path": "Asteroid-ProofVault/receipts/MOUNTAIN_3/LIBRARIAN_COUNCIL_SMOKE.md"
}
```

---

## §7 · SQL SCHEMA (Bishop applies)

Bishop applies this schema block via Supabase gadget. Knight reads the
emitted migration file before wiring TypeScript imports. Knight does not
apply SQL directly.

```sql
-- Mountain 3 · Librarian Corps Schema · Minor Council revision
-- BP089 · 2026-06-20

-- 1. Librarian Corps Directory
-- Maps substrate paths to assigned Librarian Council roles.
-- Composes with ip_ledger (ip_ledger_id is a FK anchor, not a schema edit).
CREATE TABLE IF NOT EXISTS librarian_corps_directory (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  substrate_path         TEXT NOT NULL UNIQUE,
  librarian_role         TEXT NOT NULL CHECK (librarian_role IN (
    'domain_librarian', 'pearl_librarian', 'canon_librarian',
    'receipts_librarian', 'code_librarian', 'downloaded_librarian'
  )),
  default_council_package TEXT,             -- Court Package name for this Librarian's Council
  ip_ledger_id           UUID REFERENCES ip_ledger(id) ON DELETE SET NULL,
  ed25519_sig            TEXT,              -- Ed25519 signature of (substrate_path || librarian_role)
  assigned_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_resolved          TIMESTAMPTZ,
  resolve_count          BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lcd_role
  ON librarian_corps_directory (librarian_role);

CREATE INDEX IF NOT EXISTS idx_lcd_substrate_path
  ON librarian_corps_directory (substrate_path);

-- 2. Pyramid Index Canonical
-- Stores the built index layer state so it survives process restart.
-- Knight's buildPyramidIndex() seeds this table; resolveByTopic() reads it.
CREATE TABLE IF NOT EXISTS pyramid_index_canonical (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer                TEXT NOT NULL CHECK (layer IN ('canon', 'pearl', 'eblet')),
  topic_tag            TEXT NOT NULL,
  substrate_address    TEXT NOT NULL,
  eblet_slug           TEXT,
  layer_default_council TEXT,              -- default Court Package for this layer's Council
  built_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (layer, topic_tag, substrate_address)
);

CREATE INDEX IF NOT EXISTS idx_pic_layer_tag
  ON pyramid_index_canonical (layer, topic_tag);

CREATE INDEX IF NOT EXISTS idx_pic_address
  ON pyramid_index_canonical (substrate_address);

-- 3. File Cabinet Seal Log
-- Audit trail: every openCabinet() call writes a row.
-- lazy_load_first_accessed_at is set on first access and never overwritten.
CREATE TABLE IF NOT EXISTS file_cabinet_seal_log (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jar_id                      TEXT NOT NULL,
  substrate_path              TEXT NOT NULL,
  partition                   TEXT NOT NULL,
  librarian_role              TEXT NOT NULL,
  seal_status                 TEXT NOT NULL CHECK (seal_status IN ('intact', 'SEAL_BROKEN', 'not_sealed')),
  opened_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  lazy_load_first_accessed_at TIMESTAMPTZ,         -- null until first lazy-load fires
  latency_ms                  INTEGER,
  session_bp                  TEXT DEFAULT 'BP089'
);

CREATE INDEX IF NOT EXISTS idx_fcsl_jar_id
  ON file_cabinet_seal_log (jar_id);

CREATE INDEX IF NOT EXISTS idx_fcsl_opened_at
  ON file_cabinet_seal_log (opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_fcsl_seal_status
  ON file_cabinet_seal_log (seal_status)
  WHERE seal_status = 'SEAL_BROKEN';  -- fast alert query for broken seals

-- 4. Librarian Council Vote Log
-- One row per Dispatcher resolve call. Records all 3 member votes, consensus, escalation.
CREATE TABLE IF NOT EXISTS librarian_council_vote_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_path      TEXT NOT NULL,          -- substrate path that was resolved
  librarian_role    TEXT NOT NULL,
  council_package   TEXT NOT NULL,
  member_votes      JSONB NOT NULL,         -- array of 3 SubLibrarianVote objects
  consensus_y_n     BOOLEAN NOT NULL,       -- true if divergenceScore <= 0.15
  escalated_y_n     BOOLEAN NOT NULL DEFAULT false,
  divergence_score  NUMERIC(5,4),           -- 0.0000-1.0000
  latency_ms        INTEGER,               -- wall-clock for full Council resolve
  resolved_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_bp        TEXT DEFAULT 'BP089'
);

CREATE INDEX IF NOT EXISTS idx_lcvl_cabinet_path
  ON librarian_council_vote_log (cabinet_path);

CREATE INDEX IF NOT EXISTS idx_lcvl_escalated
  ON librarian_council_vote_log (escalated_y_n)
  WHERE escalated_y_n = true;             -- fast alert query for escalations

CREATE INDEX IF NOT EXISTS idx_lcvl_resolved_at
  ON librarian_council_vote_log (resolved_at DESC);
```

**Bishop note:** The `SEAL_BROKEN` partial index is intentional. Bishop or
any monitoring SEG can query `WHERE seal_status = 'SEAL_BROKEN'` cheaply as
a security alert. If any broken-seal rows appear during smoke test, Knight
surfaces them to Bishop before closing Wave II.

The `escalated_y_n` partial index allows a monitoring SEG to query all
escalations cheaply. Any escalation during smoke test must be surfaced to
Bishop as a variance event (not an error unless adjudicator_council also fails).

---

## §8 · RETURN PROTOCOL

### 8.1 Wave I completion signal

Knight emits to Bishop:
- Confirmation that all four modules in `src/main/librarian_corps/` compile
  clean (`tsc --noEmit` passes against `tsconfig.main.json`)
- Commit hash on branch `knight-marathon-6-mountain-3-librarian-corps`
- Any TypeScript errors surfaced verbatim (do not paper over)

### 8.2 Wave II completion signal

Knight emits to Bishop:
- Path to `Asteroid-ProofVault/receipts/MOUNTAIN_3/LIBRARIAN_COUNCIL_SMOKE.md`
- Smoke test results (pass/fail per II-A, II-B, II-C, II-D, II-E)
- Council latency p50/p95 and speedup ratio
- Escalation confirmed Y/N (II-D)
- Pearl `mountain_3_smoke_complete` confirmation

### 8.3 Pearl: `mountain_3_complete`

After both waves pass and Bishop confirms SQL applied cleanly:

Knight emits pearl `mountain_3_complete`.

This pearl is the Mountain 3 close receipt. It is a prerequisite for any
session that depends on the Librarian Corps being live (including PATH X
relay memory warm-up and Trial 02b re-fire relay preparation).

### 8.4 Escalation path

If Wave I compile fails: Knight surfaces the full TypeScript error to Bishop.
Do not attempt Wave II on a broken compile.

If Wave II smoke test fails: Knight surfaces the failure payload to Bishop.
Do not emit `mountain_3_complete` until Bishop ratifies the failure disposition.

If benchmark ratio is under 5x: Knight surfaces measured numbers to Bishop.
Bishop decides whether to close Mountain 3 with a known gap or defer.

If Council escalation fires unexpectedly (outside II-D ambiguous-query test):
Knight surfaces the escalation vote log row to Bishop. Do not treat unexpected
escalation as a pass.

---

## §9 · CLOSING

Mountain 3 lands the Inverted Pyramid Memory layer that makes Dr. M's recall
architecture durable. She always remembers because the Librarian Corps holds
the file cabinets. Each Librarian is a Minor Council: three gemma4:12b
sub-instances, divergent sub-contexts, consensus-aggregated answer. The
Dispatcher is the single nerve; the Councils are the hands; the File Cabinets
are the memory. The Pyramid Index makes the whole system fast enough to be
useful in real time.

When `mountain_3_complete` is sealed, Dr. M can resolve any substrate path
in O(log N) via a parallel 3-member Council query, with consensus in under
300ms wall-clock and escalation to flagship adjudicator only when the Council
genuinely diverges.

That is the promise. Mountain 3 is the delivery.

---

*Help Each Other Help Ourselves.*
*Be Excellent to Each Other.*
*Liana Banyan Corporation.*
*FounderDenken/Crewman#6.*
